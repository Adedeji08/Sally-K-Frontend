import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type DeliveryMethod = "standard" | "express";

export const DELIVERY_OPTIONS: Record<
  DeliveryMethod,
  { label: string; eta: string; fee: number }
> = {
  standard: { label: "Standard Delivery", eta: "3-5 business days", fee: 5 },
  express: { label: "Express Delivery", eta: "1-2 business days", fee: 15 },
};

interface ShippingDetails {
  address: string;
  deliveryMethod: DeliveryMethod;
}

interface CheckoutContextValue {
  shipping: ShippingDetails | null;
  setShipping: (details: ShippingDetails) => void;
  clearShipping: () => void;
}

const CheckoutContext = createContext<CheckoutContextValue | null>(null);
const SHIPPING_KEY = "checkoutShipping";

function readShippingFromStorage(): ShippingDetails | null {
  try {
    const raw = localStorage.getItem(SHIPPING_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [shipping, setShippingState] = useState<ShippingDetails | null>(() =>
    readShippingFromStorage()
  );

  useEffect(() => {
    if (shipping) {
      localStorage.setItem(SHIPPING_KEY, JSON.stringify(shipping));
    } else {
      localStorage.removeItem(SHIPPING_KEY);
    }
  }, [shipping]);

  const setShipping = (details: ShippingDetails) => setShippingState(details);
  const clearShipping = () => setShippingState(null);

  const value = useMemo<CheckoutContextValue>(
    () => ({ shipping, setShipping, clearShipping }),
    [shipping]
  );

  return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>;
}

export function useCheckout() {
  const ctx = useContext(CheckoutContext);
  if (!ctx) {
    throw new Error("useCheckout must be used within a CheckoutProvider");
  }
  return ctx;
}
