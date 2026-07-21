import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type VerificationStatus = "unverified" | "verified";

export interface StoreProfile {
  brandName: string;
  categories: string[];
  bio: string;
  logoUrl?: string;
  instagram?: string;
  facebook?: string;
}

export interface BankAccount {
  bank: string;
  accountNumber: string;
  accountHolderName: string;
}

export type SubscriptionPlanId = "basic" | "standard" | "premium";
export type BillingCycle = "monthly" | "sixMonth" | "yearly";

export interface SubscriptionInfo {
  planId: SubscriptionPlanId;
  billingCycle: BillingCycle;
  startedAt: number;
}

interface SellerState {
  storeProfile: StoreProfile | null;
  verificationStatus: VerificationStatus;
  bankAccount: BankAccount | null;
  subscription: SubscriptionInfo | null;
}

interface SellerContextValue extends SellerState {
  isVerified: boolean;
  isSubscribed: boolean;
  canSell: boolean;
  setStoreProfile: (profile: StoreProfile) => void;
  markVerified: () => void;
  setBankAccount: (account: BankAccount) => void;
  setSubscription: (subscription: Omit<SubscriptionInfo, "startedAt">) => void;
}

const SELLER_KEY = "sellerState";

const DEFAULT_STATE: SellerState = {
  storeProfile: null,
  verificationStatus: "unverified",
  bankAccount: null,
  subscription: null,
};

function readSellerStateFromStorage(): SellerState {
  try {
    const raw = localStorage.getItem(SELLER_KEY);
    return raw ? { ...DEFAULT_STATE, ...JSON.parse(raw) } : DEFAULT_STATE;
  } catch {
    return DEFAULT_STATE;
  }
}

const SellerContext = createContext<SellerContextValue | null>(null);

export function SellerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SellerState>(() => readSellerStateFromStorage());

  useEffect(() => {
    localStorage.setItem(SELLER_KEY, JSON.stringify(state));
  }, [state]);

  const setStoreProfile = (profile: StoreProfile) =>
    setState((prev) => ({ ...prev, storeProfile: profile }));

  // Dummy KYC: there's no admin to review submissions, so verification is
  // granted immediately on submit rather than left "pending" forever.
  const markVerified = () => setState((prev) => ({ ...prev, verificationStatus: "verified" }));

  const setBankAccount = (account: BankAccount) =>
    setState((prev) => ({ ...prev, bankAccount: account }));

  const setSubscription = (subscription: Omit<SubscriptionInfo, "startedAt">) =>
    setState((prev) => ({
      ...prev,
      subscription: { ...subscription, startedAt: Date.now() },
    }));

  const isVerified = state.verificationStatus === "verified";
  const isSubscribed = !!state.subscription;

  const value = useMemo<SellerContextValue>(
    () => ({
      ...state,
      isVerified,
      isSubscribed,
      canSell: isVerified && isSubscribed,
      setStoreProfile,
      markVerified,
      setBankAccount,
      setSubscription,
    }),
    [state, isVerified, isSubscribed]
  );

  return <SellerContext.Provider value={value}>{children}</SellerContext.Provider>;
}

export function useSeller() {
  const ctx = useContext(SellerContext);
  if (!ctx) {
    throw new Error("useSeller must be used within a SellerProvider");
  }
  return ctx;
}
