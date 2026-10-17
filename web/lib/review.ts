import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { Turn } from "./claude";

// After every call, won or lost: where it turned, and the one lesson worth keeping.
// Losses teach as much as wins, so they get the same attention.
const client = new Anthropic();

const Review = z.object({
  turning_point: z.string(),
  lesson: z.string(),
});
export type CallReview = z.infer<typeof Review>;

const REVIEW_SYSTEM = `You review a sales call right after it ended, for the seller and for every other seller using the same playbook.
The goal of every call is to close the sale within the time available.

Give:
- turning_point: in under 15 words, the moment the call turned (toward the close if won, away from it if lost), quoting or naming the buyer's specific words or concern.
- lesson: one plain-English sentence, under 30 words, that another seller can use next time. For a loss: what to do differently at that moment. For a win: what made it close. Be specific to what happened in this call, practical and direct, not preachy. No em dashes.`;

export async function reviewCall(turns: Turn[], outcome: "won" | "lost"): Promise<CallReview | null> {
  const transcript = turns.map((t) => `${t.speaker === "You" ? "Seller" : "Buyer"}: ${t.text}`).join("\n");
  const res = await client.messages.parse({
    model: "claude-sonnet-5-5",
    max_tokens: 4000,
    system: REVIEW_SYSTEM,
    messages: [{ role: "user", content: `Outcome: ${outcome === "won" ? "WON" : "LOST"}\n\nTranscript:\n${transcript}` }],
    output_config: { format: zodOutputFormat(Review), effort: "medium" },
  });
  return res.parsed_output ?? null;
}
