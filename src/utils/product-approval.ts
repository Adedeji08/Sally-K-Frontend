export type ApprovalStatus = "pending" | "approved";

// There's no admin app in this codebase yet (per the PRD it's a separate
// application), so a submitted product can't wait on a human reviewer.
// Instead it's treated as approved once this much time has passed —
// long enough to see a real "awaiting approval" state, short enough to
// watch it resolve within a demo session.
const APPROVAL_DELAY_MS = 2 * 60 * 1000;

export function getApprovalStatus(submittedAt: number): ApprovalStatus {
  return Date.now() - submittedAt >= APPROVAL_DELAY_MS ? "approved" : "pending";
}
