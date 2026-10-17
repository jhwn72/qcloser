// The moments Q coaches, and the short label shown in the cue card footer for each.
// Safe to import from the browser (no secrets, no SDK). The extension keeps its own copy of these labels.
// The database column cues.objection_type stores one of these IDs for each move.
export const MOMENT_LABELS = {
  // Opening and discovery
  opening: "Opening · Set the agenda",
  pain: "Discovery · Pain shared",
  // Objections
  no_need: "Objection · No need",
  price: "Objection · Price",
  discount: "Negotiating · Discount",
  timing: "Objection · Timing",
  trust: "Objection · Trust",
  proof: "Asks for proof",
  authority: "Objection · Someone else decides",
  partner: "Objection · Partner decides",
  competitor: "Objection · Competitor",
  shopping: "Objection · Shopping around",
  locked_in: "Objection · Locked in",
  stall: "Objection · Stall",
  send_info: "Brush-off · Send me info",
  process: "Process · Procurement",
  compliance: "Worry · Compliance",
  technical: "Question · Technical",
  tough_question: "Question · Tough one",
  not_fit: "Not a fit",
  // Worries and personal moments
  judged: "Worry · Feeling judged",
  fear: "Worry · Fear",
  burned: "Worry · Burned before",
  overwhelmed: "Worry · Overwhelmed",
  hardship: "Personal · Money is tight",
  health_loss: "Personal · Health or loss",
  // Closing
  buying_signal: "Buying signal",
  ready: "Closing · Ready to buy",
  early_yes: "Closing · Yes too early",
  ghost_risk: "Closing · Ghosting risk",
  // Flow of the call
  pacing: "Pacing · Talking too long",
  dragging: "Pacing · Call dragging",
  disengaged: "Pacing · Buyer checked out",
  confused: "Pacing · Buyer confused",
  tangent: "Pacing · Off topic",
  hostile: "Heads up · Hostile buyer",
} as const;

export type Moment = keyof typeof MOMENT_LABELS;
export const MOMENT_TYPES = Object.keys(MOMENT_LABELS) as [Moment, ...Moment[]];

// Unknown IDs (a newer moment the page doesn't know yet) still read sensibly.
export function momentLabel(m?: string | null) {
  if (!m || m === "none") return "";
  return MOMENT_LABELS[m as Moment] ?? m.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}
