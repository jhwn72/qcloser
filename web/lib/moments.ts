// The moments Q coaches, and the short label shown in the cue card footer for each.
// Safe to import from the browser (no secrets, no SDK). The extension keeps its own copy of these labels.
// The database column cues.objection_type stores one of these IDs for each move.
export const MOMENT_LABELS = {
  // Opening and discovery
  opening: "Opening · Set the agenda",
  pain: "Discovery · Pain shared",
  hidden_need: "Discovery · Need in passing",
  price_upfront: "Question · Price upfront",
  // Objections
  no_need: "Objection · No need",
  price: "Objection · Price",
  discount: "Negotiating · Discount",
  lowball: "Negotiating · Lowball offer",
  payment_plan: "Negotiating · Payment plan",
  terms: "Negotiating · Terms",
  timing: "Objection · Timing",
  busy_season: "Objection · Busy season",
  budget_cycle: "Objection · Budget cycle",
  trust: "Objection · Trust",
  bad_reviews: "Worry · Bad reviews",
  proof: "Asks for proof",
  trial: "Request · Demo or trial",
  authority: "Objection · Someone else decides",
  champion: "Decision · Champion stuck",
  group_call: "Decision · Several on the call",
  partner: "Objection · Partner decides",
  competitor: "Objection · Competitor",
  loyalty: "Objection · Loyal to someone",
  diy: "Objection · Do it ourselves",
  shopping: "Objection · Shopping around",
  locked_in: "Objection · Locked in",
  switching: "Worry · Switching hassle",
  stall: "Objection · Stall",
  send_info: "Brush-off · Send me info",
  process: "Process · Procurement",
  compliance: "Worry · Compliance",
  technical: "Question · Technical",
  blocker: "Objection · Missing must-have",
  exit_terms: "Question · Cancel terms",
  tough_question: "Question · Tough one",
  not_fit: "Not a fit",
  // Existing customers
  upset_customer: "Account · Upset customer",
  cancel: "Account · Wants to cancel",
  // Worries and personal moments
  judged: "Worry · Feeling judged",
  fear: "Worry · Fear",
  burned: "Worry · Burned before",
  overwhelmed: "Worry · Overwhelmed",
  hardship: "Personal · Money is tight",
  health_loss: "Personal · Health or loss",
  life_change: "Personal · Big life change",
  // Closing
  buying_signal: "Buying signal",
  ready: "Closing · Ready to buy",
  contract_request: "Closing · Send the contract",
  price_silence: "Closing · Quiet after price",
  early_yes: "Closing · Yes too early",
  dodging: "Closing · Dodging the decision",
  ghost_risk: "Closing · Ghosting risk",
  after_yes: "Closing · After the yes",
  // Flow of the call
  pacing: "Pacing · Talking too long",
  dragging: "Pacing · Call dragging",
  disengaged: "Pacing · Buyer checked out",
  confused: "Pacing · Buyer confused",
  language: "Pacing · Language barrier",
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
