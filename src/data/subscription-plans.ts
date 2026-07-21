export type BillingCycle = "monthly" | "sixMonth" | "yearly";
export type SubscriptionPlanId = "basic" | "standard" | "premium";

export interface Plan {
  id: SubscriptionPlanId;
  name: string;
  tagline: string;
  price: Record<BillingCycle, number>;
  popular?: boolean;
  features: string[];
}

export const BILLING_OPTIONS: { value: BillingCycle; label: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "sixMonth", label: "6 Months" },
  { value: "yearly", label: "Yearly" },
];

export const BILLING_SUFFIX: Record<BillingCycle, string> = {
  monthly: "/mo",
  sixMonth: "/6mo",
  yearly: "/yr",
};

// Placeholder tiers — pricing and feature lists are illustrative until the
// real Basic/Standard/Premium feature set is decided.
export const PLANS: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    tagline: "For designers just getting started",
    price: { monthly: 9, sixMonth: 45, yearly: 79 },
    features: [
      "Up to 20 product listings",
      "Standard search placement",
      "Email support",
      "Monthly sales summary",
    ],
  },
  {
    id: "standard",
    name: "Standard",
    tagline: "For growing brands",
    price: { monthly: 19, sixMonth: 95, yearly: 170 },
    popular: true,
    features: [
      "Up to 100 product listings",
      "Priority search placement",
      "Email + chat support",
      "Weekly sales analytics",
      "1 sponsored listing / month",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "For established boutiques",
    price: { monthly: 39, sixMonth: 195, yearly: 350 },
    features: [
      "Unlimited product listings",
      "Top search placement + homepage features",
      "Priority support",
      "Daily sales analytics & trends",
      "5 sponsored listings / month",
    ],
  },
];

export function getPlan(id: string) {
  return PLANS.find((plan) => plan.id === id);
}
