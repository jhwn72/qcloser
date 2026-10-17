import { extractWinningMoves, type LearnedMove, type Turn } from "@/lib/claude";
import { retireForMisfires } from "@/lib/ranking";
import { reviewCall, type CallReview, type JudgedNudge, type SavedReview, type ShownNudge } from "@/lib/review";
import { json, preflight } from "@/lib/cors";
import { db, type Cue } from "@/lib/supabase";

export const OPTIONS = preflight;

const RETIRE_AFTER_USES = 8;
const RETIRE_BELOW_WIN_RATE = 0.25;
const MAX_MOVE_WORDS = 6;
const MAX_TURNS = 120;
const MAX_TURN_CHARS = 600;
const MAX_NUDGES = 30;
const MAX_NUDGE_CHARS = 120;

const norm = (t: string) => t.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
const isId = (id: unknown): id is string => typeof id === "string" && /^[0-9a-f-]{36}$/i.test(id);

// End of a call: record the outcome, update the record of every move shown, retire moves that keep
// losing, save the call's lesson (wins and losses both teach), and on a win, learn the seller's own
// winning moves so every Q card can use them. Failure detection: the review also judges every nudge Q
// showed (helped, neutral or hurt), each move keeps that record, and a move that keeps misfiring retires.
export async function POST(req: Request) {
  let body: {
    transcript?: Turn[];
    outcome?: string;
    shown_cue_ids?: unknown[];
    shown_nudges?: unknown[];
    user_name?: unknown;
    user_city?: unknown;
    share?: unknown;
    org?: unknown;
  };
  try {
    body = await req.json();
    if (!body || typeof body !== "object") throw new Error();
  } catch {
    return json(req, { error: "Body must be a JSON object" }, 400);
  }
  const outcome = body.outcome === "won" ? "won" : body.outcome === "lost" ? "lost" : null;
  if (!outcome) return json(req, { error: "outcome must be won or lost" }, 400);
  // Public endpoint: clip everything to sane sizes and drop anything malformed.
  const clip = (s: unknown, n: number) => (typeof s === "string" ? s.trim().slice(0, n) : "");
  const sent: Turn[] = (Array.isArray(body.transcript) ? body.transcript : [])
    .filter((t) => t && (t.speaker === "You" || t.speaker === "Buyer") && clip(t.text, 1))
    .map((t) => ({ speaker: t.speaker, text: clip(t.text, MAX_TURN_CHARS) }));
  const transcript = sent.slice(-MAX_TURNS);
  const dropped = sent.length - transcript.length; // a nudge's position counts lines from the start of the call
  const userName = clip(body.user_name, 40) || "A Q user";
  const userCity = clip(body.user_city, 40) || null;
  const org = clip(body.org, 60) || null;
  const visibility = body.share === "org" && org ? "org" : "public"; // who a move learned from this call is shared with
  const supabase = db();

  // Each nudge the card showed, with where in the call it appeared
  const sentNudges = Array.isArray(body.shown_nudges) ? body.shown_nudges : null;
  let nudges: ShownNudge[] = (sentNudges ?? [])
    .filter((n): n is Record<string, unknown> => !!n && typeof n === "object")
    .map((n) => {
      const at = typeof n.at_turn === "number" && Number.isFinite(n.at_turn) ? Math.round(n.at_turn) - dropped : -1;
      return { cue_id: isId(n.cue_id) ? n.cue_id : null, text: clip(n.text, MAX_NUDGE_CHARS), at_turn: at >= 0 ? Math.min(at, transcript.length) : null };
    })
    .filter((n) => n.text)
    .slice(0, MAX_NUDGES);

  // 1. Save the call
  const { data: call, error: callError } = await supabase
    .from("calls")
    .insert({ user_name: userName, user_city: userCity, outcome, transcript })
    .select("id")
    .single();
  if (callError) {
    console.error("saving call failed", callError);
    return json(req, { error: "Could not save the call" }, 502);
  }

  // 2. Every move shown counts as used; on a win, it also counts as a win. Losing moves retire.
  const shownIds = [
    ...new Set([...(Array.isArray(body.shown_cue_ids) ? body.shown_cue_ids : []), ...nudges.map((n) => n.cue_id)].filter(isId)),
  ].slice(0, 30);
  let retired = 0;
  const shownMoves = new Map<string, string>(); // id -> move text, for moves that really exist
  if (shownIds.length) {
    const { data: shown } = await supabase.from("cues").select("id, cue_text, uses, wins, status").in("id", shownIds);
    for (const c of (shown ?? []) as Pick<Cue, "id" | "cue_text" | "uses" | "wins" | "status">[]) {
      shownMoves.set(c.id, c.cue_text);
      const uses = c.uses + 1;
      const wins = c.wins + (outcome === "won" ? 1 : 0);
      const retire = c.status === "active" && uses >= RETIRE_AFTER_USES && wins / uses < RETIRE_BELOW_WIN_RATE;
      if (retire) retired++;
      await supabase
        .from("cues")
        .update({ uses, wins, ...(retire ? { status: "retired" } : {}) })
        .eq("id", c.id);
    }
  }
  // An older card sends only the move ids: review those moves, without knowing when they appeared.
  if (!sentNudges) nudges = shownIds.filter((id) => shownMoves.has(id)).map((id) => ({ cue_id: id, text: shownMoves.get(id)!, at_turn: null }));
  nudges = nudges.map((n) => ({ ...n, cue_id: n.cue_id && shownMoves.has(n.cue_id) ? n.cue_id : null })); // only real moves get a record

  // 3. Review the call (both outcomes, and every nudge shown) and, on a win, learn what the seller did that
  //    turned it. The two run side by side to keep the wait short.
  const dev = process.env.NODE_ENV !== "production";
  const learned: { cue_text: string; moment: string; lesson: string }[] = [];
  const hasSeller = transcript.some((t) => t.speaker === "You");
  const { data: active } = await supabase.from("cues").select("cue_text").eq("status", "active");
  const [reviewRes, movesRes] = await Promise.allSettled([
    transcript.length >= 2 ? reviewCall(transcript, outcome, nudges) : Promise.resolve(null),
    outcome === "won" && hasSeller
      ? extractWinningMoves(
          transcript,
          (active ?? []).map((c) => c.cue_text),
        )
      : Promise.resolve([] as LearnedMove[]),
  ]);
  const review: CallReview | null = reviewRes.status === "fulfilled" ? reviewRes.value : null;
  if (reviewRes.status === "rejected") console.error("call review failed", reviewRes.reason);
  if (movesRes.status === "rejected") console.error("learning failed", movesRes.reason);
  const moves: LearnedMove[] = movesRes.status === "fulfilled" ? movesRes.value : [];
  if (dev && review) console.log(`[learn] ${outcome}: turned at "${review.turning_point}" | lesson: ${review.lesson}`);

  // 4. Failure detection: each nudge's verdict is saved, counted on its move, and kept with the call for its report.
  const judged: JudgedNudge[] = nudges.map((n, i) => {
    const r = review?.nudges.find((x) => x.nudge === i + 1);
    return { ...n, verdict: r?.verdict ?? null, reason: r?.reason.trim() || null };
  });
  const reviewed = judged.filter((n) => n.verdict);
  if (dev) for (const n of judged) console.log(`[learn] nudge "${n.text}" at line ${n.at_turn ?? "?"}: ${n.verdict ?? "not reviewed"}${n.reason ? ` (${n.reason})` : ""}`);
  if (reviewed.length) {
    const { error } = await supabase
      .from("nudge_reviews")
      .insert(reviewed.map((n) => ({ call_id: call.id, cue_id: n.cue_id, nudge_text: n.text, verdict: n.verdict, reason: n.reason })));
    if (error) console.error("saving nudge reviews failed (is supabase/migration-2 applied?)", error);
    else retired += await tallyVerdicts(supabase, reviewed);
  }
  if (review || judged.length) {
    const saved: SavedReview = {
      turning_point: review?.turning_point ?? null,
      turning_line: review?.turning_line ?? null,
      lesson: review?.lesson ?? null,
      nudges: judged,
    };
    const { error } = await supabase.from("calls").update({ review: saved }).eq("id", call.id);
    if (error) console.error("saving the call review failed (is supabase/migration-3 applied?)", error);
  }
  const count = (v: string) => reviewed.filter((n) => n.verdict === v).length;
  const summary = review
    ? {
        helped: count("helped"),
        neutral: count("neutral"),
        hurt: count("hurt"),
        total: reviewed.length,
        misses: reviewed.filter((n) => n.verdict === "hurt").map((n) => ({ text: n.text, reason: n.reason ?? "" })),
      }
    : null;

  {
    const known = new Set((active ?? []).map((c) => norm(c.cue_text)));
    if (dev) console.log(`[learn] Claude found ${moves.length} winning move(s)`);
    for (const m of moves) {
      const text = m.move.replace(/["“”]/g, "").trim();
      const skip = !text
        ? "empty"
        : text.split(/\s+/).length > MAX_MOVE_WORDS
          ? "too long"
          : known.has(norm(text))
            ? "already in playbook"
            : "";
      if (dev) console.log(`[learn] "${text}" (${m.moment})${skip ? ` skipped: ${skip}` : " added"}`);
      if (skip) continue;
      known.add(norm(text));
      const row = {
        objection_type: m.moment,
        buyer_type: m.buyer_type,
        cue_text: /[.!?]$/.test(text) ? text : `${text}.`,
        full_line: m.full_line,
        author_name: userName,
        author_city: userCity,
        uses: 1, // it just won once
        wins: 1,
      };
      let { error } = await supabase.from("cues").insert({ ...row, visibility, org });
      if (error?.code === "PGRST204") ({ error } = await supabase.from("cues").insert(row)); // database not updated for sharing yet
      if (error) {
        console.error("saving learned move failed", error);
        continue;
      }
      learned.push({ cue_text: text, moment: m.moment, lesson: m.lesson });
      if (m.lesson?.trim()) {
        await supabase.from("insights").insert({ text: m.lesson.trim(), author_name: userName, source_call: call.id });
      }
    }
  }

  // Every call leaves a lesson in the feed. A win that taught new moves already saved theirs.
  if (review?.lesson && !learned.length) {
    await supabase.from("insights").insert({ text: review.lesson.trim(), author_name: userName, source_call: call.id });
  }

  return json(req, {
    ok: true,
    call_id: call.id,
    outcome,
    learned,
    retired,
    lesson: review?.lesson ?? null,
    turning_point: review?.turning_point ?? null,
    review: summary,
    report_url: new URL(`/call/${call.id}`, req.url).href,
  });
}

// Add this call's helped and hurt verdicts to each move's record, and retire a move that keeps misfiring.
// Returns how many moves it retired.
async function tallyVerdicts(supabase: ReturnType<typeof db>, reviewed: JudgedNudge[]): Promise<number> {
  const per = new Map<string, { helped: number; hurt: number }>();
  for (const n of reviewed) {
    if (!n.cue_id || (n.verdict !== "helped" && n.verdict !== "hurt")) continue;
    const t = per.get(n.cue_id) ?? { helped: 0, hurt: 0 };
    t[n.verdict]++;
    per.set(n.cue_id, t);
  }
  if (!per.size) return 0;
  const { data, error } = await supabase.from("cues").select("id, helped, hurt, status").in("id", [...per.keys()]);
  if (error) {
    console.error("reading helped and hurt failed", error);
    return 0;
  }
  let retired = 0;
  for (const c of data as Pick<Cue, "id" | "helped" | "hurt" | "status">[]) {
    const add = per.get(c.id)!;
    const next = { helped: (c.helped ?? 0) + add.helped, hurt: (c.hurt ?? 0) + add.hurt };
    let retire = false;
    if (add.hurt && c.status === "active") {
      const { count } = await supabase.from("nudge_reviews").select("id", { count: "exact", head: true }).eq("cue_id", c.id);
      retire = retireForMisfires(next, count ?? 0);
    }
    if (retire) retired++;
    await supabase
      .from("cues")
      .update({ ...next, ...(retire ? { status: "retired" } : {}) })
      .eq("id", c.id);
  }
  return retired;
}
