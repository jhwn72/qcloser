import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

// Development only: a strong model grades one live nudge against a written rubric, so prompt and
// playbook changes are measured by quality, not just by counting copied moves. Used by scripts/compare-cues.py.
const JUDGE_MODEL = "claude-opus-5-5";
const client = new Anthropic();

const Verdict = z.object({
  score: z.number().int().min(1).max(5),
  reason: z.string().describe("One line: the main reason for the score."),
  better: z.string().describe("The nudge an elite closer would cue here, five words or fewer. Empty if none is right."),
});

const RUBRIC = `You grade Q, a live sales coach. While a seller is on a call, Q flashes a nudge of five words or fewer that tells the seller where to steer next, never a script. Each nudge comes from a playbook tactic. Q's goal is closing the sale within a short call (usually 10 to 15 minutes), not therapy. You see the call so far, the seller's company profile, the call time (minutes used of the call's target length), the nudges Q already showed on this call, and Q's new nudge (or that Q stayed silent).

Grade as an elite closer and sales coach would (tactical empathy, SPIN and gap selling, Sandler, Challenger, MEDDIC, high-ticket consumer and service sales). Judge these together, and weight the first one most:
0. Closes: moves the deal toward a close (a yes, a trial close, or a dated next step) given the time left. Rough phases by share of the target length: first ~20% rapport and quick discovery; ~20 to 55% present value and handle objections fast; ~55 to 80% trial closes and asking for the sale; past ~80% ask for the sale now or lock a dated next step. Empathy is one beat, then pivot back to the close. Stacking discovery or feelings questions, or leading the buyer on as if there were unlimited time, is a clear miss, and the same objection deserves a more closing-oriented nudge late in the call than early.
1. Specific: fits this buyer, this product and what was just said; it would not fit any random call.
2. Heart: responds to the heart of the latest line (the real worry, feeling or request), not a vivid earlier detail.
3. Next best move: what a top closer would actually do next, given the stage of the call (opening, discovery, presenting, objection, closing, after a yes) and what the seller already tried; it doesn't repeat a tactic that was just shown.
4. Ethical: respectful; never exploits insecurity, grief, illness or money trouble; never invents facts, prices, offers or customer claims that aren't in the profile.
5. Actionable: clear at a glance, five words or fewer, starts with a verb for the seller.

Scores:
5 = what an elite closer would cue right now. Sharp, specific, right for the moment and the clock, and it moves toward the close.
4 = good and usable; a small miss (slightly generic, or a slightly better move existed).
3 = reasonable but generic, not the best next move, or it doesn't advance the close when it should; an average seller would do this anyway.
2 = misses the point: answers an earlier detail, wrong for the stage, repeats what was tried, unclear, or invents a fact.
1 = harmful, tone-deaf, unethical, or nonsense.
If Q stayed silent: 5 if silence was right (nothing worth coaching), otherwise 1 to 3 by how much a nudge was needed.
A nudge longer than five words can score at most 4.`;

type Turn = { speaker: string; text: string };

function callTime(s: Record<string, number>) {
  const target = s.target_s || 900;
  const parts = [`${Math.round((s.elapsed_s ?? 0) / 60)} of ${Math.round(target / 60)} minutes used`];
  if (s.seller_talk_share != null) parts.push(`seller has talked ${Math.round(s.seller_talk_share * 100)}% of the time`);
  if (s.seller_streak_s) parts.push(`seller talking ${s.seller_streak_s} seconds straight`);
  return parts.join(", ");
}
type Body = {
  profile?: string;
  brief?: string;
  turns?: Turn[];
  stats?: Record<string, number>;
  recent_nudges?: string[];
  moment?: string;
  nudge?: string | null;
  move?: string | null;
};

export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") return new Response("Not found", { status: 404 });
  const b = (await req.json()) as Body;
  const transcript = (b.turns ?? []).map((t) => `${t.speaker === "You" ? "Seller" : "Buyer"}: ${t.text}`).join("\n");
  const content = [
    `Seller's company profile:\n${b.profile || "(none)"}`,
    b.brief && `Seller's brief:\n${b.brief}`,
    `Call time: ${callTime(b.stats ?? {})}`,
    `Transcript:\n${transcript}`,
    `Nudges Q already showed on this call, oldest first:\n${(b.recent_nudges ?? []).map((n) => `- ${n}`).join("\n") || "(none)"}`,
    b.nudge ? `Q's new nudge: ${b.nudge}\nQ labeled the moment: ${b.moment}. Playbook tactic: ${b.move}` : "Q stayed silent (no nudge).",
  ]
    .filter(Boolean)
    .join("\n\n");
  let res;
  try {
    res = await client.messages.parse({
    model: JUDGE_MODEL,
    max_tokens: 8000,
    thinking: { type: "adaptive" },
    system: RUBRIC,
    messages: [{ role: "user", content }],
      output_config: { format: zodOutputFormat(Verdict), effort: "medium" },
    });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
  if (res.stop_reason === "refusal" || !res.parsed_output) return Response.json({ score: null, reason: "judge gave no verdict", better: "" });
  return Response.json(res.parsed_output);
}
