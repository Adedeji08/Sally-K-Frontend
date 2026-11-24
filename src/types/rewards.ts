// Shapes returned by GET /rewards. Every rate/threshold comes from the API —
// the frontend never hardcodes the earn or redemption numbers.
export type RewardTierName = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";

export type RewardTxType = "EARN" | "REDEEM";
export type RewardTxStatus = "PENDING" | "ACTIVE";

export interface RewardTransaction {
  id: string;
  type: RewardTxType;
  status: RewardTxStatus;
  points: number;
  description: string;
  orderId: string | null;
  availableAt: string | null;
  createdAt: string;
}

export interface RewardsRedemption {
  ratePerPoint: number;
  minPoints: number;
  maxPercentOfOrder: number;
}

export interface RewardsSummary {
  tier: RewardTierName;
  ordersLast12Months: number;
  nextTier: { tier: RewardTierName; ordersNeeded: number } | null;
  points: { available: number; pending: number };
  redemption: RewardsRedemption;
  history: RewardTransaction[];
}

// Ladder order only (names are the backend enum); thresholds come from nextTier.
export const TIER_ORDER: RewardTierName[] = ["BRONZE", "SILVER", "GOLD", "PLATINUM"];

export const tierLabel = (tier: RewardTierName) => tier.charAt(0) + tier.slice(1).toLowerCase();

export const pointsToNaira = (points: number, redemption: RewardsRedemption) =>
  points * redemption.ratePerPoint;

// Most points this order can take: capped by balance and by maxPercentOfOrder.
export function maxRedeemablePoints(summary: RewardsSummary, orderTotal: number) {
  const { ratePerPoint, maxPercentOfOrder } = summary.redemption;
  if (ratePerPoint <= 0) return 0;
  const byOrderCap = Math.floor((orderTotal * maxPercentOfOrder) / ratePerPoint);
  return Math.max(0, Math.min(summary.points.available, byOrderCap));
}
