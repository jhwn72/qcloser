import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { Turn } from "./claude";

// After every call, won or lost: where it turned, the one lesson worth keeping, and a verdict on every nudge
// Q showed (failure detection: Q checks its own advice against what happened next). Losses teach as much as
// wins, so they get the same attention. One Claude call covers all of it.
const client = new Anthropic();

export const VERDICTS = ["helped", "neutral", "hurt"] as const;
export type Verdict = (typeof VERDICTS)[number];

// A nudge the card showed. at_turn: how many transcript lines there were when it appeared (null if unknown).
export type ShownNudge = { cue_id: string | null; text: string; at_turn: number | null };
export type JudgedNudge = ShownNudge & { verdict: Verdict | null; reason: string | null }; // null: not reviewed

// What the call report page reads back (calls.review, from supabase/migration-3)
export type SavedReview = {
  turning_point: string | null;
  turning_line: number | null;
  lesson: string | null;
  nudges: JudgedNudge[];
};

// Field order matters: Claude writes these in order, so it checks what the seller did and how the buyer
// reacted before it commits to a verdict.
const Review = z.object({
  turning_point: z.string(),
  turning_line: z.number().int().describe("The transcript line number where the call turned."),
  nudges: z.array(
    z.object({
      nudge: z.number().int().describe("The nudge's number."),
      seller_used: z.enum(["yes", "partly", "no"]),
      buyer_reaction: z.string(),
      verdict: z.enum(VERDICTS),
      reason: z.string(),
    }),
  ),
  lesson: z.string(),
});
export type CallReview = z.infer<typeof Review>;

const REVIEW_SYSTEM = `You review a sales call right after it ended, for the seller and for every other seller using the same playbook.
The goal of every call is to close the sale within the time available.
During the call, Q showed the seller short nudges on where to steer. Each one is marked in the transcript right where it appeared, after the line it answered.

Give:
- turning_point: in under 15 words, the moment the call turned (toward the close if won, away from it if lost), quoting or naming the buyer's specific words or concern.
- turning_line: the number of the transcript line where it turned.
- nudges: one entry for every nudge, judged only from what happened right after it appeared. Be calibrated, not generous: most nudges are neutral, and a win doesn't make a nudge helpful.
   nudge: its number.
   seller_used: yes if the seller's next line or two clearly acted on it (same intent, their own words), partly if they touched on it, no if they did something else or the call ended first.
   buyer_reaction: under 15 words, what the buyer did right after the seller's response.
   verdict:
     helped: the seller used it, and right after, the buyer moved toward yes or opened up (shared a problem, a stake or a detail, agreed to a step).
     hurt: the seller used it, and the buyer pulled back (shut down, objected harder, went cold, cut the call short), or it was wrong for the moment and cost momentum (for example pushing to close right after the buyer shared a worry).
     neutral: the seller didn't use it, or there was no clear effect either way. When in doubt, neutral. An unused nudge is always neutral, even if it was good advice.
   reason: one line, under 20 words, that a seller would find useful: what it made happen or why it missed, tied to the buyer's words.
- lesson: one plain-English sentence, under 30 words, that another seller can use next time. For a loss: what to do differently at that moment. For a win: what made it close. Be specific to what happened in this call, practical and direct, not preachy.
No em dashes anywhere.`;

// The transcript with numbered lines and each nudge placed where the seller saw it.
function annotated(turns: Turn[], nudges: ShownNudge[]) {
  const after = new Map<number, string[]>();
  const unplaced: string[] = [];
  nudges.forEach((n, i) => {
    const mark = `   [Q nudge ${i + 1} appeared here: "${n.text}"]`;
    if (n.at_turn == null) unplaced.push(`Nudge ${i + 1}: "${n.text}"`);
    else after.set(n.at_turn, [...(after.get(n.at_turn) ?? []), mark]);
  });
  const lines = (after.get(0) ?? []).slice();
  turns.forEach((t, i) => {
    lines.push(`${i + 1}. ${t.speaker === "You" ? "Seller" : "Buyer"}: ${t.text}`);
    lines.push(...(after.get(i + 1) ?? []));
  });
  if (unplaced.length) lines.push("", "Nudges shown at an unknown point in the call:", ...unplaced);
  return lines.join("\n");
}

export async function reviewCall(turns: Turn[], outcome: "won" | "lost", nudges: ShownNudge[] = []): Promise<CallReview | null> {
  const res = await client.messages.parse({
    model: "claude-sonnet-5-5",
    max_tokens: 6000,
    system: REVIEW_SYSTEM,
    messages: [
      {
        role: "user",
        content: `Outcome: ${outcome === "won" ? "WON" : "LOST"}\nQ showed ${nudges.length ? `${nudges.length} nudge${nudges.length > 1 ? "s" : ""}` : "no nudges"}.\n\nTranscript:\n${annotated(turns, nudges)}`,
      },
    ],
    output_config: { format: zodOutputFormat(Review), effort: "medium" },
  });
  return res.parsed_output ?? null;
}
