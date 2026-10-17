import type { Cue } from "./supabase";

// Failure detection feeds back into which move Q picks. After every call, Claude judges each nudge Q showed
// as helped, neutral or hurt (web/lib/review.ts). These turn that record into a small nudge up or down when
// ranking moves, and decide when a move misfires often enough to flag or retire.

type Reviewed = Pick<Cue, "helped" | "hurt">;

const MAX_ADJUST = 0.2; // at most this much either way, so fit to the moment and win rate still lead
const MISFIRE_PENALTY = 0.1; // on top, for a move that keeps hurting
export const RETIRE_AFTER_REVIEWS = 4;

// Hurt clearly outweighs helped: at least two misfires and more than twice as many as times it helped.
export function oftenMisfires(c: Reviewed): boolean {
  const helped = c.helped ?? 0;
  const hurt = c.hurt ?? 0;
  return hurt >= 2 && hurt > 2 * helped;
}

// Add this to a move's score. Positive when it tends to help, negative when it tends to hurt. It starts at 0
// and grows with evidence (two pretend neutral reviews keep a single verdict from swinging it far): one hurt is
// -0.07, three hurts -0.12 plus the misfire penalty, three helps +0.12.
export function reviewAdjustment(c: Reviewed): number {
  const helped = c.helped ?? 0;
  const hurt = c.hurt ?? 0;
  return (MAX_ADJUST * (helped - hurt)) / (helped + hurt + 2) - (oftenMisfires(c) ? MISFIRE_PENALTY : 0);
}

// Retire a move that keeps hurting, once enough calls have reviewed it to be sure.
export function retireForMisfires(c: Reviewed, reviews: number): boolean {
  return reviews >= RETIRE_AFTER_REVIEWS && oftenMisfires(c);
}
