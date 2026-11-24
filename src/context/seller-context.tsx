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

interface SellerState {
  storeProfile: StoreProfile | null;
  verificationStatus: VerificationStatus;
  bankAccount: BankAccount | null;
}

interface SellerContextValue extends SellerState {
  isVerified: boolean;
  canSell: boolean;
  setStoreProfile: (profile: StoreProfile) => void;
  markVerified: () => void;
  setBankAccount: (account: BankAccount) => void;
}

const SELLER_KEY = "sellerState";

const DEFAULT_STATE: SellerState = {
  storeProfile: null,
  verificationStatus: "unverified",
  bankAccount: null,
};

function readSellerStateFromStorage(): SellerState {
  try {
    const raw = localStorage.getItem(SELLER_KEY);
    if (!raw) return DEFAULT_STATE;
    // Drop the old subscription field from earlier saves.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { subscription, ...rest } = JSON.parse(raw);
    return { ...DEFAULT_STATE, ...rest };
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

  const isVerified = state.verificationStatus === "verified";

  const value = useMemo<SellerContextValue>(
    () => ({
      ...state,
      isVerified,
      // Listing is free for every seller — only verification is required.
      canSell: isVerified,
      setStoreProfile,
      markVerified,
      setBankAccount,
    }),
    [state, isVerified]
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
