import { extractWinningMoves, type LearnedMove, type Turn } from "@/lib/claude";
import { reviewCall, type CallReview } from "@/lib/review";
import { json, preflight } from "@/lib/cors";
import { db, type Cue } from "@/lib/supabase";

export const OPTIONS = preflight;

const RETIRE_AFTER_USES = 8;
const RETIRE_BELOW_WIN_RATE = 0.25;
const MAX_MOVE_WORDS = 6;

const norm = (t: string) => t.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();

// End of a call: record the outcome, update the record of every move shown, retire moves that keep
// losing, save the call's lesson (wins and losses both teach), and on a win, learn the seller's own
// winning moves so every Q card can use them.
export async function POST(req: Request) {
  let body: {
    transcript?: Turn[];
    outcome?: string;
    shown_cue_ids?: string[];
    user_name?: string;
    user_city?: string;
  };
  try {
    body = await req.json();
  } catch {
    return json(req, { error: "Body must be JSON" }, 400);
  }
  const outcome = body.outcome === "won" ? "won" : body.outcome === "lost" ? "lost" : null;
  if (!outcome) return json(req, { error: "outcome must be won or lost" }, 400);
  const transcript = (body.transcript ?? []).filter((t) => t?.text?.trim());
  const userName = body.user_name?.trim() || "A Q user";
  const userCity = body.user_city?.trim() || null;
  const supabase = db();

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
  const shownIds = [...new Set((body.shown_cue_ids ?? []).filter(Boolean))];
  let retired = 0;
  if (shownIds.length) {
    const { data: shown } = await supabase.from("cues").select("id, uses, wins, status").in("id", shownIds);
    for (const c of (shown ?? []) as Pick<Cue, "id" | "uses" | "wins" | "status">[]) {
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

  // 3. Review the call (both outcomes) and, on a win, learn what the seller did that turned it.
  //    The two run side by side to keep the wait short.
  const dev = process.env.NODE_ENV !== "production";
  const learned: { cue_text: string; moment: string; lesson: string }[] = [];
  const hasSeller = transcript.some((t) => t.speaker === "You");
  const { data: active } = await supabase.from("cues").select("cue_text").eq("status", "active");
  const [reviewRes, movesRes] = await Promise.allSettled([
    transcript.length >= 2 ? reviewCall(transcript, outcome) : Promise.resolve(null),
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
      const { error } = await supabase.from("cues").insert({
        objection_type: m.moment,
        buyer_type: m.buyer_type,
        cue_text: /[.!?]$/.test(text) ? text : `${text}.`,
        full_line: m.full_line,
        author_name: userName,
        author_city: userCity,
        uses: 1, // it just won once
        wins: 1,
      });
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

  return json(req, { ok: true, call_id: call.id, outcome, learned, retired, lesson: review?.lesson ?? null, turning_point: review?.turning_point ?? null });
}
