import { readMoment, type CallStats, type Turn } from "@/lib/claude";
import { json, preflight } from "@/lib/cors";
import { db, type Cue } from "@/lib/supabase";

export const OPTIONS = preflight;

const EXPLORE_RATE = 0.15;
const BUYER_MATCH_BONUS = 0.15;
const FIT_RANK_BONUS = [0.25, 0.1]; // Claude's best fit first, so relevance leads and win rate breaks ties
const PLAYBOOK_TTL_MS = 5000;
const MAX_BRIEF_CHARS = 1500;
const MAX_PROFILE_CHARS = 3000;
const MAX_TURNS = 80; // the whole call for a normal sales call; only the oldest lines drop on very long ones
const SELLER_CHECK_MOMENTS = new Set(["pacing", "dragging", "disengaged"]);
const MAX_RECENT_NUDGES = 5;

// The active playbook, kept for a few seconds so most cues skip the database trip.
let playbook: { cues: Cue[]; at: number } | null = null;
async function activeMoves(): Promise<Cue[]> {
  if (playbook && Date.now() - playbook.at < PLAYBOOK_TTL_MS) return playbook.cues;
  // Fixed order, so the playbook text Claude sees is identical between cues and stays cached.
  const { data, error } = await db()
    .from("cues")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });
  if (error) throw error;
  playbook = { cues: data as Cue[], at: Date.now() };
  return playbook.cues;
}

function winRate(c: Cue) {
  return (c.wins + 1) / (c.uses + 2); // Bayesian: new moves start near 50%
}

type Pick = { cue: Cue; nudge: string; generic: boolean };

const GENERIC_PENALTY = 1; // a nudge that just repeats a playbook move loses to any specific one

// Moments where Q never experiments: a buyer who is struggling or upset always gets the best-fitting move.
const NO_EXPLORE_MOMENTS = new Set(["judged", "fear", "burned", "overwhelmed", "hardship", "health_loss", "hostile"]);

// Picks arrive in Claude's fit order. Score = win rate + fit rank + a nudge toward moves
// that won with this kind of buyer. About 15% of the time, give a newly learned move a fair try
// (seed moves don't need one: the starting playbook is already curated).
function choose(picks: Pick[], buyerType: string | null, moment: string): Pick {
  const scored = picks
    .map((p, i) => ({
      p,
      score:
        winRate(p.cue) +
        (FIT_RANK_BONUS[i] ?? 0) +
        (buyerType && p.cue.buyer_type === buyerType ? BUYER_MATCH_BONUS : 0) -
        (p.generic ? GENERIC_PENALTY : 0),
    }))
    .sort((a, b) => b.score - a.score);
  if (!NO_EXPLORE_MOMENTS.has(moment) && Math.random() < EXPLORE_RATE) {
    const fresh = picks.filter((p) => !p.cue.is_seed && p.cue.uses < 5 && !p.generic && p !== scored[0].p);
    if (fresh.length) return fresh[Math.floor(Math.random() * fresh.length)];
  }
  return scored[0].p;
}

const norm = (t: string) => t.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();

// A nudge should be five words; if Claude's runs long, show the move as the expert wrote it.
function nudgeOrMove(nudge: string, move: string) {
  const clean = nudge.replace(/["“”]/g, "").trim();
  return clean && clean.split(/\s+/).length <= 6 ? clean : move;
}

// Warm-up: the extension calls this when a call starts, so the first real nudge doesn't wait on a cold start.
export async function GET(req: Request) {
  try {
    const moves = await activeMoves();
    return json(req, { ok: true, moves: moves.length });
  } catch {
    return json(req, { ok: false }, 502);
  }
}

export async function POST(req: Request) {
  let body: {
    turns?: Turn[];
    stats?: CallStats;
    brief?: string;
    profile?: string;
    user_name?: string;
    exclude?: string[];
    recent_nudges?: string[]; // the nudges the card already showed on this call, oldest first
    variant?: string; // development only: compare Claude settings
  };
  try {
    body = await req.json();
  } catch {
    return json(req, { error: "Body must be JSON" }, 400);
  }
  const turns = (body.turns ?? []).slice(-MAX_TURNS);
  if (!turns.length) return json(req, { error: "No transcript turns" }, 400);
  const recent = (Array.isArray(body.recent_nudges) ? body.recent_nudges : [])
    .filter((n): n is string => typeof n === "string" && !!n.trim())
    .map((n) => n.trim().slice(0, 80))
    .slice(-MAX_RECENT_NUDGES);

  const started = Date.now();
  let moves: Cue[];
  try {
    moves = await activeMoves();
  } catch (e) {
    console.error("playbook lookup failed", e);
    return json(req, { error: "Database lookup failed" }, 502);
  }

  let reading;
  try {
    reading = await readMoment(
      turns,
      moves.map((c) => ({ text: c.cue_text, moment: c.objection_type })),
      body.stats ?? {},
      (body.brief ?? "").slice(0, MAX_BRIEF_CHARS),
      (body.profile ?? "").slice(0, MAX_PROFILE_CHARS),
      recent,
      process.env.NODE_ENV !== "production" ? body.variant : undefined,
    );
  } catch (e) {
    console.error("Claude call failed", e);
    return json(req, { error: "Claude call failed" }, 502);
  }
  if (!reading) return json(req, { error: "Could not read Claude's answer" }, 502);

  const buyerType = reading.buyer_type === "unclear" ? null : reading.buyer_type;
  // A request ending on the seller's own line is a timed pacing check: only a pacing problem is worth a nudge.
  if (turns[turns.length - 1].speaker === "You" && !SELLER_CHECK_MOMENTS.has(reading.moment)) reading.moment = "none";
  if (reading.moment === "none") {
    if (process.env.NODE_ENV !== "production") console.log(`[cue] "${turns[turns.length - 1].text}" -> none`);
    return json(req, { cue: null, buyer_type: buyerType, ms: Date.now() - started });
  }

  // Every nudge traces back to a real playbook move.
  const byText = new Map(moves.map((c) => [norm(c.cue_text), c]));
  const shown = new Set(recent.map(norm));
  const exclude = new Set(body.exclude ?? []);
  const picks: Pick[] = [];
  for (const p of reading.picks) {
    const cue = byText.get(norm(p.move));
    if (cue && !picks.some((x) => x.cue.id === cue.id)) {
      const nudge = nudgeOrMove(p.nudge, cue.cue_text);
      // Generic: word for word a playbook move (its own or another), or a nudge the card already showed.
      picks.push({ cue, nudge, generic: byText.has(norm(nudge)) || shown.has(norm(nudge)) });
    }
  }
  let pool = picks.filter((p) => !exclude.has(p.cue.id));
  if (!pool.length) pool = picks;
  if (!pool.length) {
    // Claude's pick didn't match a move: fall back to the best-winning move for this moment, as written.
    const best = moves
      .filter((c) => c.objection_type === reading.moment)
      .sort((a, b) => winRate(b) - winRate(a))[0];
    if (best) pool = [{ cue: best, nudge: best.cue_text, generic: true }];
  }
  if (!pool.length) return json(req, { cue: null, buyer_type: buyerType, objection_type: reading.moment });

  const chosen = choose(pool, buyerType, reading.moment);
  if (process.env.NODE_ENV !== "production") {
    const last = turns[turns.length - 1];
    console.log(`[cue] ${last.speaker}: "${last.text}" -> ${reading.moment} | "${chosen.nudge}" (move: ${chosen.cue.cue_text} / ${chosen.cue.author_name}) | profile ${body.profile ? "yes" : "no"}, brief ${body.brief ? "yes" : "no"}, ${turns.length} turns, ${recent.length} recent nudges`);
  }
  return json(req, {
    cue: {
      cue_id: chosen.cue.id,
      cue_text: chosen.nudge,
      move: chosen.cue.cue_text,
      author_name: chosen.cue.author_name,
      author_city: chosen.cue.author_city,
      created_at: chosen.cue.created_at,
      is_seed: chosen.cue.is_seed,
    },
    buyer_type: buyerType,
    objection_type: reading.moment,
    ms: Date.now() - started,
    ...(process.env.NODE_ENV !== "production" ? { picks: reading.picks } : {}), // development only: Claude's raw picks
  });
}
