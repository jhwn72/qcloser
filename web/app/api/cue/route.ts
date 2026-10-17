import { after } from "next/server";
import { readMoment, warmCue, type CallStats, type CueTiming, type Turn } from "@/lib/claude";
import { json, preflight } from "@/lib/cors";
import { reviewAdjustment } from "@/lib/ranking";
import { db, type Cue } from "@/lib/supabase";

export const OPTIONS = preflight;

const EXPLORE_RATE = 0.15;
const BUYER_MATCH_BONUS = 0.15;
// Claude's first pick is its best fit, and it wins unless the other pick has a clearly better record: after-call
// reviews (lib/ranking.ts: two hurts are -0.2, three helps +0.12) plus a win-rate edge that rests on real use.
// Seed win rates (4 to 14 uses) are mostly noise: letting them break ties showed the weaker pick in 13 of 40
// judged cues (2 better, 6 worse), including a probe in place of an answer to "how does the warranty work?".
// Trusting the first pick raised the judge average from 3.85 to 3.98 (2026-10-17, scripts/compare-cues.py --judge-picks).
// The edge needed is the gap the old fit bonuses left (0.25 vs 0.10).
const MIN_USES_TO_OVERRIDE = 20;
const OVERRIDE_EDGE = 0.15;
const PLAYBOOK_FRESH_MS = 5000;
const MAX_BRIEF_CHARS = 1500;
const MAX_PROFILE_CHARS = 3000;
const MAX_TURNS = 80; // the whole call for a normal sales call; only the oldest lines drop on very long ones
const MAX_TURN_CHARS = 1000; // a long stretch of speech keeps its latest words
const SELLER_CHECK_MOMENTS = new Set(["pacing", "dragging", "disengaged"]);
const MAX_RECENT_NUDGES = 5;

// The active playbook, kept in memory. Only a cold server waits on the database: after that, a cue uses the copy
// it has and, if that copy is over 5 s old, reloads it after answering, so new moves and win rates still show up
// within a cue or two. A failed reload keeps the last good copy.
let playbook: { cues: Cue[]; at: number } | null = null;
let loading: Promise<Cue[]> | null = null;
function loadMoves(): Promise<Cue[]> {
  loading ??= (async () => {
    // Fixed order, so the playbook text Claude sees is identical between cues and stays cached.
    const { data, error } = await db()
      .from("cues")
      .select("id, objection_type, buyer_type, cue_text, author_name, author_city, uses, wins, helped, hurt, visibility, org, status, is_seed, created_at")
      .eq("status", "active")
      .order("created_at", { ascending: true })
      .order("id", { ascending: true });
    if (error) throw error;
    const cues = data as Cue[];
    const before = playbook;
    if (before && !cues.length) return before.cues; // an empty read mid-reseed keeps the old copy
    playbook = { cues, at: Date.now() };
    // A move was learned or retired: pre-read the new playbook now (this runs after a response), so the next
    // nudge doesn't pay the first read.
    const ids = (list: Cue[]) => list.map((c) => c.id).join();
    if (before && ids(before.cues) !== ids(cues)) await warmCue(asMoves(cues.filter(isPublic))).catch((e) => console.error("Claude warm-up failed", e));
    return cues;
  })().finally(() => {
    loading = null;
  });
  return loading;
}
async function activeMoves(): Promise<Cue[]> {
  if (!playbook) return loadMoves();
  if (Date.now() - playbook.at > PLAYBOOK_FRESH_MS) {
    after(() => loadMoves().catch((e) => console.error("playbook reload failed", e)));
  }
  return playbook.cues;
}

const asMoves = (cues: Cue[]) => cues.map((c) => ({ text: c.cue_text, moment: c.objection_type }));

// Private moves: a move marked "org" only reaches sellers from that company. Public moves keep the shared,
// cached order; the company's own moves go after them (see systemBlocks in lib/claude.ts).
const orgKey = (o: unknown) => (typeof o === "string" ? o.trim().toLowerCase() : "");
const isPublic = (c: Cue) => (c.visibility ?? "public") === "public";
function movesFor(cues: Cue[], org: string) {
  const own = org ? cues.filter((c) => c.visibility === "org" && orgKey(c.org) === org) : [];
  return { shared: cues.filter(isPublic), own };
}

// Odd input gets a 400, never a crash: only real turns, clipped, and only the stats Q knows.
function cleanTurns(raw: unknown): Turn[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .flatMap((t): Turn[] => {
      const { speaker, text } = (t && typeof t === "object" ? t : {}) as Record<string, unknown>;
      if ((speaker !== "You" && speaker !== "Buyer") || typeof text !== "string" || !text.trim()) return [];
      const clean = text.trim();
      return [{ speaker, text: clean.length > MAX_TURN_CHARS ? `…${clean.slice(-MAX_TURN_CHARS)}` : clean }];
    })
    .slice(-MAX_TURNS);
}

function cleanStats(raw: unknown): CallStats {
  const s = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const out: CallStats = {};
  for (const k of ["elapsed_s", "target_s", "seller_talk_share", "seller_streak_s"] as const) {
    const n = s[k];
    if (typeof n === "number" && Number.isFinite(n) && n >= 0) out[k] = n;
  }
  return out;
}

const text = (s: unknown, max: number) => (typeof s === "string" ? s.slice(0, max) : "");
const strings = (a: unknown) => (Array.isArray(a) ? a.filter((x): x is string => typeof x === "string") : []);

// Where the time went, readable in the browser's network panel and by scripts/compare-cues.py.
function withTiming(res: Response, parts: { db: number; total: number; claude?: CueTiming }) {
  const c = parts.claude;
  const items = [`db;dur=${parts.db}`];
  if (c) {
    items.push(`ttft;dur=${c.ttft}`, `head;dur=${c.head}`, `pick1;dur=${c.pick1}`, `claude;dur=${c.claude}`);
    items.push(`tok;desc="in=${c.in} cached=${c.cached} write=${c.write} out=${c.out} tries=${c.tries}${c.early ? " early" : ""}${c.shared ? " shared" : ""}"`);
  }
  items.push(`total;dur=${parts.total}`);
  res.headers.set("Server-Timing", items.join(", "));
  return res;
}

function winRate(c: Cue) {
  return (c.wins + 1) / (c.uses + 2); // Bayesian: new moves start near 50%
}

type Pick = { cue: Cue; nudge: string; generic: boolean };

// Moments where Q never experiments: a buyer who is struggling or upset always gets the best-fitting move.
const NO_EXPLORE_MOMENTS = new Set(["judged", "fear", "burned", "overwhelmed", "hardship", "health_loss", "hostile"]);

// Picks arrive in Claude's fit order. A nudge that just repeats a playbook move loses to a specific one; otherwise
// the first pick stands unless the other has a much better record (plus a nudge toward moves that won with this
// kind of buyer), and both records rest on real use. When `explore` is set (about 15% of cues, never for a
// struggling buyer or a direct question), a newly learned move among the picks gets a fair try instead.
// How much better p's record is than q's: reviews always count; win rates only when both rest on real use.
function edge(p: Cue, q: Cue, buyerType: string | null) {
  const record = (c: Cue) => winRate(c) + (buyerType && c.buyer_type === buyerType ? BUYER_MATCH_BONUS : 0);
  const won = Math.min(p.uses, q.uses) >= MIN_USES_TO_OVERRIDE ? record(p) - record(q) : 0;
  return won + reviewAdjustment(p) - reviewAdjustment(q);
}

function choose(picks: Pick[], buyerType: string | null, explore: boolean): Pick {
  let best = picks.find((p) => !p.generic) ?? picks[0];
  for (const p of picks) {
    if (p === best || p.generic) continue;
    if (edge(p.cue, best.cue, buyerType) > OVERRIDE_EDGE) best = p;
  }
  if (explore) {
    const fresh = picks.filter((p) => !p.cue.is_seed && p.cue.uses < 5 && !p.generic && p !== best);
    if (fresh.length) return fresh[Math.floor(Math.random() * fresh.length)];
  }
  return best;
}
const mayExplore = (moment: string, aim: string) => !NO_EXPLORE_MOMENTS.has(moment) && aim !== "answer";

const norm = (t: string) => t.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();

// A nudge should be short; if Claude's runs long, show the move as the expert wrote it.
function nudgeOrMove(nudge: string, move: string) {
  const clean = nudge.replace(/["“”]/g, "").trim();
  return clean && clean.split(/\s+/).length <= 7 ? clean : move;
}

// Warm-up: the extension calls this when a call starts, so the first real nudge doesn't wait on a cold start.
// It loads the playbook and pre-reads it into Claude's prompt cache (also checking that Claude answers at all);
// that saves the first nudge of a call the slow first read. At most once per server every 5 minutes.
export async function GET(req: Request) {
  let moves: Cue[];
  try {
    moves = await activeMoves();
  } catch {
    return json(req, { ok: false }, 502);
  }
  try {
    const warm = await warmCue(asMoves(moves.filter(isPublic))); // the shared part every seller's prompt starts with
    if (warm && process.env.NODE_ENV !== "production") console.log(`[cue] warm-up: cached ${warm.cached}, cache write ${warm.write}`);
  } catch (e) {
    console.error("Claude warm-up failed", e);
    return json(req, { ok: false, moves: moves.length, error: "Claude call failed" }, 502);
  }
  return json(req, { ok: true, moves: moves.length });
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json(req, { error: "Body must be JSON" }, 400);
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) return json(req, { error: "Body must be a JSON object" }, 400);
  const turns = cleanTurns(body.turns);
  if (!turns.length) return json(req, { error: "No transcript turns" }, 400);
  const recent = strings(body.recent_nudges)
    .filter((n) => n.trim())
    .map((n) => n.trim().slice(0, 80))
    .slice(-MAX_RECENT_NUDGES);

  // Listen-ahead: the card sends the buyer's line while it is still being spoken (partial: true), then the final
  // line. Partials are handled exactly like final lines: this route only reads (no writes, no learning), the
  // playbook comes from memory, the prompt cache is shared, and a final line identical to a recent partial reuses
  // its answer (see readMoment).
  const partial = body.partial === true;
  const org = orgKey(text(body.org, 120));

  const started = Date.now();
  let moves: Cue[];
  try {
    moves = await activeMoves();
  } catch (e) {
    console.error("playbook lookup failed", e);
    return json(req, { error: "Database lookup failed" }, 502);
  }
  const dbMs = Date.now() - started;
  const { shared: publicMoves, own: orgMoves } = movesFor(moves, org);
  moves = [...publicMoves, ...orgMoves]; // what this seller may be offered

  // A request ending on the seller's own line is a timed pacing check: only a pacing problem is worth a nudge.
  const sellerCheck = turns[turns.length - 1].speaker === "You";
  const noNudge = (moment: string) => moment === "none" || (sellerCheck && !SELLER_CHECK_MOMENTS.has(moment));

  // Every nudge traces back to a real playbook move.
  const byText = new Map(moves.map((c) => [norm(c.cue_text), c]));
  const shown = new Set(recent.map(norm));
  const exclude = new Set(strings(body.exclude));
  const coin = Math.random() < EXPLORE_RATE;
  const freshMoves = moves.some((c) => !c.is_seed && c.uses < 5);
  const bestReview = Math.max(0, ...moves.map(reviewAdjustment));
  // Stop reading Claude's answer after the first pick when the second can't change what choose() shows: the first
  // is specific and allowed, its win rate is too thin to be overridden, no other move's reviews could beat it, and
  // this cue isn't trying out a new move.
  const firstPickFinal = (moment: string, aim: string, pick: { nudge: string; move: string }) => {
    const cue = byText.get(norm(pick.move));
    if (!cue || exclude.has(cue.id) || cue.uses >= MIN_USES_TO_OVERRIDE) return false;
    if (bestReview - reviewAdjustment(cue) > OVERRIDE_EDGE) return false;
    const nudge = nudgeOrMove(pick.nudge, cue.cue_text);
    if (byText.has(norm(nudge)) || shown.has(norm(nudge))) return false;
    return !(coin && freshMoves && mayExplore(moment, aim));
  };
  let reading;
  let timing: CueTiming | undefined;
  try {
    reading = await readMoment(
      turns,
      asMoves(publicMoves),
      cleanStats(body.stats),
      text(body.brief, MAX_BRIEF_CHARS),
      text(body.profile, MAX_PROFILE_CHARS),
      recent,
      process.env.NODE_ENV !== "production" && typeof body.variant === "string" ? body.variant : undefined,
      { skipPicks: noNudge, firstPickFinal, privateMoves: asMoves(orgMoves), share: body.share !== false, onTiming: (t) => (timing = t) },
    );
  } catch (e) {
    console.error("Claude call failed", e);
    return withTiming(json(req, { error: "Claude call failed" }, 502), { db: dbMs, total: Date.now() - started, claude: timing });
  }
  if (!reading) return json(req, { error: "Could not read Claude's answer" }, 502);
  const done = (res: Response) => withTiming(res, { db: dbMs, total: Date.now() - started, claude: timing });

  const buyerType = reading.buyer_type === "unclear" ? null : reading.buyer_type;
  if (noNudge(reading.moment)) reading.moment = "none";
  if (reading.moment === "none") {
    if (process.env.NODE_ENV !== "production") console.log(`[cue]${partial ? " (partial)" : ""} "${turns[turns.length - 1].text}" -> none`);
    return done(json(req, { cue: null, buyer_type: buyerType, ms: Date.now() - started }));
  }

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
      .sort((a, b) => winRate(b) + reviewAdjustment(b) - (winRate(a) + reviewAdjustment(a)))[0];
    if (best) pool = [{ cue: best, nudge: best.cue_text, generic: true }];
  }
  if (!pool.length) return done(json(req, { cue: null, buyer_type: buyerType, objection_type: reading.moment }));

  const chosen = choose(pool, buyerType, coin && mayExplore(reading.moment, reading.aim));
  if (process.env.NODE_ENV !== "production") {
    const last = turns[turns.length - 1];
    console.log(`[cue]${partial ? " (partial)" : ""} ${last.speaker}: "${last.text}" -> ${reading.moment}/${reading.aim} | "${chosen.nudge}" (move: ${chosen.cue.cue_text} / ${chosen.cue.author_name}) | profile ${body.profile ? "yes" : "no"}, brief ${body.brief ? "yes" : "no"}, ${turns.length} turns, ${recent.length} recent nudges`);
  }
  return done(json(req, {
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
    ...(process.env.NODE_ENV !== "production" ? { aim: reading.aim, picks: reading.picks } : {}), // development only: Claude's raw answer
  }));
}
