import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { MOMENT_TYPES } from "./moments";

// Learning runs once per call, after it ends, so it can afford a stronger, slower setting.
const LEARN_MODEL = "claude-sonnet-5-5";

// The moments Q coaches (objections, personal moments, closing, the flow of the call) live in
// lib/moments.ts with their card labels, so the browser can use them too.
export { MOMENT_TYPES };
export const BUYER_TYPES = ["skeptical", "rushed", "price_focused", "curious"] as const;

export type Turn = { speaker: "You" | "Buyer"; name?: string; text: string; t?: number };

// Measured by the extension from the live captions. target_s is the call length the seller picked (default 15 min).
export type CallStats = { elapsed_s?: number; target_s?: number; seller_talk_share?: number; seller_streak_s?: number };
const DEFAULT_TARGET_S = 900;

// Where the call is on the clock, by share of its target length. The prompt says what each phase calls for.
function phase(share: number) {
  if (share < 0.2) return "opening";
  if (share < 0.55) return "middle";
  if (share < 0.8) return "closing window";
  return share < 1 ? "final minutes" : "over time";
}

function statsText(s: CallStats) {
  const parts: string[] = [];
  const target = Number(s.target_s) > 0 ? Number(s.target_s) : DEFAULT_TARGET_S;
  if (s.elapsed_s != null) {
    parts.push(`${Math.round(s.elapsed_s / 60)} of ${Math.round(target / 60)} min, ${phase(s.elapsed_s / target)}`);
  }
  if (s.seller_talk_share != null) parts.push(`seller has talked ${Math.round(s.seller_talk_share * 100)}% of the time`);
  if (s.seller_streak_s != null && s.seller_streak_s > 20) parts.push(`seller has been talking for ${Math.round(s.seller_streak_s)} seconds straight`);
  return parts.length ? `Call stats: ${parts.join(", ")}.` : "";
}

const client = new Anthropic();

function transcriptText(turns: Turn[]) {
  return turns.map((t) => `${t.speaker === "You" ? "Seller" : "Buyer"}: ${t.text}`).join("\n");
}

// What Q believes about the AI's role, shared by both prompts.
const ROLE = `Q coaches a seller live, using a playbook of moves from expert closers.
A move tells the seller where to steer the conversation, never the words to say: the seller talks in their own style.
A nudge is a move fitted to this call: five words or fewer (count them; drop words like the, a, their to fit), starts with a verb aimed at the seller (Ask, Find, Offer, Name, Acknowledge, Let...), plain text, no quotation marks.`;

// Field order matters: Claude writes these in order. It commits to what this nudge must do (aim) before
// writing it, and writes the concrete nudge before the playbook move it comes from, so it doesn't just echo the move.
export const AIMS = ["probe", "answer", "acknowledge", "calm", "advance", "none"] as const;
const Reading = z.object({
  moment: z.enum([...MOMENT_TYPES, "none"]),
  buyer_type: z.enum([...BUYER_TYPES, "unclear"]),
  aim: z.enum(AIMS),
  picks: z.array(
    z.object({
      nudge: z.string().describe("Five words or fewer, built from a detail of this call. Never a playbook line word for word."),
      move: z.string().describe("The playbook move this nudge uses, copied exactly."),
    }),
  ),
});
export type Reading = z.infer<typeof Reading>;

export type Move = { text: string; moment: string };

// What each moment means, shared by the live prompt and the learning prompt.
const MOMENT_GUIDE = `Opening and discovery:
   opening: the first minutes: the buyer sets a time limit, asks what this is about, or grudgingly gives the seller a minute. Set the agenda and earn the next minute.
   pain: shares a problem, a goal, or what the problem costs them. Dig deeper before pitching.
   Objections and questions:
   no_need: doesn't see the need.
   price: it costs too much or doesn't fit the budget.
   discount: haggles or asks for a better deal.
   timing: not now, maybe later.
   trust: doubts it works, or doubts the seller.
   proof: asks for references, reviews, case studies or data.
   authority: someone else decides or handles it (a boss, an office manager, a team or committee).
   partner: a spouse, partner or family member has a say.
   competitor: uses or prefers another option, including doing it themselves.
   shopping: comparing several vendors or quotes.
   locked_in: stuck in a contract or setup they can't leave yet.
   stall: a vague put-off ("let me think about it").
   send_info: "just send me something", usually a polite exit.
   process: procurement, legal review, contracts or approval steps.
   compliance: worried about legal, privacy, security or regulations.
   technical: detailed technical or integration questions.
   tough_question: a question the profile and brief don't answer, or one the seller just fumbled.
   not_fit: reveals the product really doesn't fit them.
   Personal moments (the buyer shares a feeling or something about their life):
   judged: embarrassed, self-conscious or afraid of being judged (body, age, skill, money).
   fear: scared of failing, of the risk or of choosing wrong, or doubts they'll stick with it.
   burned: had a bad experience with a similar product or seller.
   overwhelmed: too much going on, can't take on one more thing.
   hardship: real money trouble (lost job, debt, a tight month).
   health_loss: grief, illness, a health scare or another hard life event.
   Closing:
   buying_signal: warming up (likes it, asks how it would work for them, asks about price, delivery or start dates in a positive way).
   ready: says yes, or asks how to buy, sign up or start.
   early_yes: says yes too fast or half-heartedly while an earlier worry is still open.
   ghost_risk: the call is wrapping up without a firm next step ("I'll get back to you").
   Flow (judge from the whole call and the stats):
   pacing: the seller is monologuing (a long stretch, or most of the talking).
   dragging: the call has run past the point the buyer was ready, or it's the closing window or later and the seller hasn't asked for the sale or a next step.
   disengaged: the buyer has gone quiet, gives one-word answers or seems distracted.
   confused: the buyer is lost, often after jargon.
   tangent: a long off-topic stretch mid-call. Brief friendly small talk is none.
   hostile: the buyer is rude, angry or insulting.`;

const READ_SYSTEM = `${ROLE}

Q's goal is the close. Every nudge should move this buyer toward a yes, or a dated next step, in the time left on the call. Empathy and discovery are tools for that, never the destination.

You get the seller's company profile (what they sell, prices, standard offers, ideal customer, things to avoid) and maybe a brief for this call. Trust both and use them to make nudges concrete. Never nudge toward anything the profile says to avoid.
Then you get call stats (minutes used of the call's target length, and the phase), the nudges Q already showed on this call (oldest first), and the call so far.

How an elite closer reads the moment:
- Coach the latest line. Find its heart (the feeling, worry or request in it) and answer that, even when an earlier line had a more vivid detail. Earlier lines are context.
- Watch the clock. Phases by share of the target length:
  opening (first 20%): rapport and one or two sharp discovery questions.
  middle (20 to 55%): present value tied to what they said; handle objections fast.
  closing window (55 to 80%): trial closes; ask for the sale.
  final minutes (past 80%, or over time): ask for the sale now, or lock a dated next step before time runs out.
  The same objection gets a more closing-oriented nudge later in the call: early you may probe it; late you answer it in a beat and ask for the decision.
- Empathy is one beat, then pivot: acknowledge once, then tie the worry to the offer or propose the next concrete step.
- Never stack probing questions. If the last one or two nudges, or the seller's last questions, were discovery or feelings questions, this nudge advances: a trial close, a summary plus an ask, an assumptive close, or a dated next step.
- If the buyer asked something directly, the nudge answers it first, then steers. Don't dodge into more discovery.
- Don't give ground at the first pushback in the opening or middle: anchor the value or learn more before a discount, a trial or a cheaper option. From the closing window on, a real offer from the profile that gets a yes today is fair.
- Use the profile's strongest real lever for this exact worry (the feature or offer that answers it), not just any offer.
- Build on what was already tried. If the buyer just answered something Q suggested, act on their answer; never re-ask it. Never repeat the tactic of the last nudge. If it didn't land, change the angle: a question after a statement, empathy after logic, a smaller ask after a big one.
- The transcript usually ends with a Buyer line. If it ends with a Seller line, Q is only checking the pacing on a timer: answer none unless the seller is monologuing (pacing), the buyer has gone quiet (disengaged), or it's the closing window or later and the seller still hasn't asked for the sale or a next step (dragging).

1. moment: the single most useful thing to coach right now. Use the most specific type that fits. A personal moment or hostility outranks everything else.
   ${MOMENT_GUIDE}
   none: small talk, neutral questions, or nothing to coach yet.
2. buyer_type: only when the buyer's own words clearly show it. skeptical (pushes back on claims), rushed (says they're busy or short on time), price_focused (talks about cost or budget), curious (asks questions, open). A plain "no" or "I don't need it" is not evidence. If the evidence is thin, answer "unclear".
3. aim: what this nudge must do now, given the clock and what was already tried.
   probe: one sharp question. Only in the opening or middle, and only if the last nudge wasn't a probing question too.
   answer: the buyer asked something directly. Answer it, then steer toward the close.
   acknowledge: a personal moment. One beat of empathy, then the next step that genuinely helps.
   calm: hostility. De-escalate.
   advance: move to commitment: a trial close, a summary plus an ask, an assumptive close, or a dated next step. Use it from the closing window on, after one or two probing questions, and whenever the buyer warms up or says yes.
   none: when moment is none.
4. picks: unless moment is none, give 2 nudges that both serve the aim, built on 2 different moves, best first, each with the playbook move whose tactic it uses (copied exactly as listed). Prefer moves listed under this moment; if none fits, use the closest tactic from any moment.
   The move is the tactic. The nudge is the sharpest, most concrete version of that tactic for this buyer, this product and what was just said. It should make the seller think "oh, good idea", not "obviously". In the opening and middle, the best nudge is often a precise question that gets the buyer to name the cost, the stake or the real worry; later, it is usually an ask. A nudge may carry two short beats joined by a comma, like an acknowledgement and an action. Build it from real details: the buyer's own words, what the product is used for, the moments when it matters, offers in the profile or brief.
   Good nudges (concrete, only make sense on this call):
   - Selling a pen, buyer: "I don't need a pen." Move "Ask when it really matters." -> "Ask what contracts they sign"
   - Selling an HVAC install, buyer: "We'll wait until it breaks." Move "Ask what they use now." -> "Ask how last summer went"
   - Selling a coding course, buyer: "I can learn this free on YouTube." Move "Ask what's been frustrating lately." -> "Ask how long they've tried"
   - Selling software, buyer: "Too expensive." Profile offers a free trial. Move "Offer a small start now." -> "Offer the 14-day free trial"
   - Selling dental cleanings, buyer: "It's been years. Honestly, my teeth are embarrassing." Move "Normalize the feeling." -> "Say long gaps are common"
   - Selling bookkeeping software, 9 of 15 min. Q already showed "Put a number on it", and the buyer answered: "Probably ten hours a month fixing receipts." Move "Link pain to the offer." -> "Offer to take those ten hours"
   Bad nudges (generic, would fit any call): "Ask what would convince them", "Shift from price to value", "Ask what it's worth", "Ask what's been frustrating lately". A nudge must never just repeat a playbook move; it must contain a detail from this call (the buyer's words, the product, an offer). Also bad: "Say 90% of clients love it" when no such number was given.
   Use only facts you have from the call, the profile or the brief. Don't make up prices, offers, people, numbers, features or claims about other customers, and don't call something an edge unless the profile says it is.
   Personal moments: acknowledge in one beat and speak to the real worry, in their words, then steer to the next step that genuinely helps them. Never change the subject or jump back to an earlier detail, never make light of it, never use an insecurity (body, health, grief, money trouble) as leverage, and never pressure someone who is struggling.
   - judged, fear, burned, overwhelmed: point to what in the offer genuinely eases that worry (a private option, a safety net, a simpler start) and offer that as the next step.
   - hardship: lower the pressure: a cheaper or free start, a pause, or a dated check-back.
   - health_loss: be human first, naming what they shared (the loss, the diagnosis, the surgery); the only ask is whether now still works or when to reconnect.
   hostile: de-escalate. Stay calm, agree with what's fair, never argue or match their tone.
   send_info: engage with the request (what would make the email worth reading, or the short version now); don't ignore it.
   compliance, technical, tough_question: the seller answers only from what the profile or brief says; otherwise steer to a written answer or an expert, never a guess.
   discount: offer only deals the profile lists; otherwise hold the price or trade for something in return.
   confused: answer their question plainly first, then check what's still unclear.
   disengaged: stop asking product questions; check in with them (the timing, what's on their mind) or hand them the floor.
   pain: one or two questions to make the cost clear, then tie it to the offer and propose a start; don't keep digging.
   not_fit: be honest and don't force it; a referral or a later fit is a good outcome.
   ready: close now. Answer exactly what they asked, then lock the next step (a date, a time, the signup); no more features.
   If moment is none, picks is empty.`;

// How Claude runs for live cues: thinking off, low effort, small output, for speed.
// Other variants exist so quality and speed can be compared during development.
type ThinkingParam = Anthropic.MessageCreateParams["thinking"];
type Variant = { model: string; effort: "low" | "medium" | "high"; thinking?: ThinkingParam };
export const VARIANTS: Record<string, Variant> = {
  "haiku-fast": { model: "claude-haiku-5-5", effort: "low", thinking: { type: "disabled" } },
  "haiku-think": { model: "claude-haiku-5-5", effort: "medium" },
  "sonnet-fast": { model: "claude-sonnet-5-5", effort: "low", thinking: { type: "between_tools" } as unknown as ThinkingParam },
  "sonnet-medium": { model: "claude-sonnet-5-5", effort: "medium", thinking: { type: "between_tools" } as unknown as ThinkingParam },
  "sonnet-think": { model: "claude-sonnet-5-5", effort: "low" },
  "opus-low": { model: "claude-opus-5-5", effort: "low" },
};
// Sonnet with thinking off: much more specific nudges than fast Haiku. A "subtext" step (Claude first naming
// what the buyer really means) added about 0.25 s and didn't fix the hard cases, so it was dropped
// (web/scripts/compare-cues.py --new, 2026-10-17).
export const DEFAULT_VARIANT = "sonnet-fast";

// The playbook grouped by moment, in the taxonomy's order, so Claude can scan the moves for this moment.
// The order only depends on the moves, so the text (and the cache) stays the same between cues.
function playbookText(moves: Move[]) {
  const rank = (m: string) => {
    const i = (MOMENT_TYPES as readonly string[]).indexOf(m);
    return i < 0 ? MOMENT_TYPES.length : i;
  };
  const groups = new Map<string, string[]>();
  for (const m of [...moves].sort((a, b) => rank(a.moment) - rank(b.moment))) {
    const lines = groups.get(m.moment) ?? [];
    lines.push(`- ${m.text}`);
    groups.set(m.moment, lines);
  }
  return [...groups].map(([moment, lines]) => `${moment}:\n${lines.join("\n")}`).join("\n");
}

// The parts that stay the same from cue to cue (instructions, playbook, company profile) go first and are
// cached, so Claude doesn't re-read them every time. What changes (brief, stats, nudges shown, transcript) goes after.
export async function readMoment(
  turns: Turn[],
  moves: Move[],
  stats: CallStats = {},
  brief = "",
  profile = "",
  recent: string[] = [],
  variant = DEFAULT_VARIANT,
): Promise<Reading | null> {
  const v = VARIANTS[variant] ?? VARIANTS[DEFAULT_VARIANT];
  const stable = [`Playbook moves, by moment:\n${playbookText(moves)}`, profile.trim() && `Seller's company profile:\n${profile.trim()}`]
    .filter(Boolean)
    .join("\n\n");
  const call = [
    brief.trim() && `Seller's brief for this call:\n${brief.trim()}`,
    statsText(stats),
    `Nudges Q already showed on this call, oldest first:\n${recent.map((n) => `- ${n}`).join("\n") || "- none yet"}`,
    `Transcript:\n${transcriptText(turns)}`,
  ]
    .filter(Boolean)
    .join("\n\n");
  const res = await client.messages.parse({
    model: v.model,
    max_tokens: v.thinking ? 300 : 4000, // variants without a thinking setting think, and need room for it
    ...(v.thinking ? { thinking: v.thinking } : {}),
    system: [
      { type: "text", text: READ_SYSTEM },
      { type: "text", text: stable, cache_control: { type: "ephemeral" } },
    ],
    messages: [{ role: "user", content: `Call so far:\n${call}` }],
    output_config: { format: zodOutputFormat(Reading), effort: v.effort },
  });
  if (process.env.NODE_ENV !== "production") {
    const u = res.usage;
    console.log(`[cue] tokens in ${u.input_tokens}, cached ${u.cache_read_input_tokens ?? 0}, cache write ${u.cache_creation_input_tokens ?? 0}, out ${u.output_tokens}`);
  }
  return res.parsed_output ?? null;
}

const Learned = z.object({
  moves: z.array(
    z.object({
      moment: z.enum(MOMENT_TYPES),
      buyer_type: z.enum(BUYER_TYPES),
      move: z.string(),
      full_line: z.string(),
      lesson: z.string(),
    }),
  ),
});
export type LearnedMove = z.infer<typeof Learned>["moves"][number];

const LEARN_SYSTEM = `${ROLE}

This sales call was won. Find what the seller did that moved the buyer toward yes, and turn it into moves any seller can reuse on any product.

Look for turning points: the buyer objected, shared a worry or a problem, went quiet, or warmed up; the seller answered in their own way; and right after, the buyer moved forward (opened up, named a stake, agreed, booked a next step, bought).
Name the real tactic behind the seller's words, as an elite closer would: labeling or mirroring, a calibrated how or what question, an accusation audit, quantifying the cost of the problem, going deeper on pain before pitching, teaching a reframe, future pacing, risk reversal, a trial or assumptive close, a takeaway, tying the close to a date or a deadline the buyer named, anchoring on a stake the buyer named.

Learn a move when the tactic is new to the playbook, or when the seller's version is a meaningfully sharper or more specific angle than the closest playbook move. Example: the playbook has "Book the date now", but the seller tied the start date to the trade show the buyer was dreading, so learn "Tie the close to their deadline". Example: the playbook has "Make them picture using it", but the seller brought back the promotion the buyer had mentioned wanting, so learn "Anchor on the stake they named".
Skip true duplicates (the same tactic at the same sharpness as a playbook move; a reworded playbook move is a duplicate), small talk, and anything that only worked because of one product's detail.

For each move:
- moment: the moment it answered, using these types:
   ${MOMENT_GUIDE}
- buyer_type: the buyer type it worked on.
- move: the tactic as a general nudge, five words (six at most), starting with a verb for the seller, precise enough to act on. Bad: "Build rapport", "Handle the objection", "Be confident". Good: "Anchor on the stake they named", "Mirror their last few words".
- full_line: the seller's words, as they said them.
- lesson: one plain sentence on why it worked with this buyer.
Return up to 3, best first. Return an empty list only when the seller did nothing that moved the buyer forward.`;

export async function extractWinningMoves(turns: Turn[], knownMoves: string[]): Promise<LearnedMove[]> {
  const res = await client.messages.parse({
    model: LEARN_MODEL,
    max_tokens: 8000,
    system: LEARN_SYSTEM,
    messages: [
      {
        role: "user",
        content: `Moves already in the playbook:\n${knownMoves.map((m) => `- ${m}`).join("\n") || "- none"}\n\nTranscript:\n${transcriptText(turns)}`,
      },
    ],
    output_config: { format: zodOutputFormat(Learned), effort: "medium" },
  });
  return res.parsed_output?.moves ?? [];
}
