import type { Order } from "../context/order-context";

export interface RewardTier {
  name: string;
  minPoints: number;
}

export const REWARD_TIERS: RewardTier[] = [
  { name: "Bronze", minPoints: 0 },
  { name: "Silver", minPoints: 5000 },
  { name: "Gold", minPoints: 15000 },
  { name: "Platinum", minPoints: 30000 },
];

export const POINTS_PER_DOLLAR = 10;

export function getPointsForOrder(order: Order): number {
  return Math.round(order.total * POINTS_PER_DOLLAR);
}

export interface RewardsSummary {
  points: number;
  currentTier: RewardTier;
  nextTier: RewardTier | null;
  progress: number;
  pointsToNextTier: number;
}

export function getRewardsSummary(orders: Order[]): RewardsSummary {
  const points = orders.reduce((sum, order) => sum + getPointsForOrder(order), 0);

  let currentTier = REWARD_TIERS[0];
  let nextTier: RewardTier | null = null;

  for (let i = 0; i < REWARD_TIERS.length; i++) {
    if (points >= REWARD_TIERS[i].minPoints) {
      currentTier = REWARD_TIERS[i];
      nextTier = REWARD_TIERS[i + 1] ?? null;
    }
  }

  const progress = nextTier
    ? Math.min(
        100,
        Math.round(
          ((points - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100
        )
      )
    : 100;

  return {
    points,
    currentTier,
    nextTier,
    progress,
    pointsToNextTier: nextTier ? nextTier.minPoints - points : 0,
  };
}
