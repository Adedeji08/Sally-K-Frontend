// Tiered transaction fee from the PRD's Monetization & Fee Structure table.
// The PRD's table stops at ₦5,000,000 with no fee defined above that, so
// amounts beyond the top bracket fall back to the highest listed fee rather
// than silently charging nothing.
interface FeeTier {
  upTo: number;
  fee: number;
}

const FEE_TIERS: FeeTier[] = [
  { upTo: 50000, fee: 100 },
  { upTo: 500000, fee: 300 },
  { upTo: 3000000, fee: 1000 },
  { upTo: 5000000, fee: 2000 },
];

export function getTransactionFee(saleAmount: number): number {
  const tier = FEE_TIERS.find((t) => saleAmount < t.upTo);
  return tier ? tier.fee : FEE_TIERS[FEE_TIERS.length - 1].fee;
}

export function getNetPayout(saleAmount: number): number {
  return Math.max(0, saleAmount - getTransactionFee(saleAmount));
}
