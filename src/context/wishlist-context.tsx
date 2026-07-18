import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

interface WishlistContextValue {
  productIds: number[];
  isWishlisted: (productId: number) => boolean;
  toggleWishlist: (productId: number) => void;
  removeFromWishlist: (productId: number) => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);
const WISHLIST_KEY = "wishlist";

function readWishlistFromStorage(): number[] {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [productIds, setProductIds] = useState<number[]>(() => readWishlistFromStorage());

  useEffect(() => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(productIds));
  }, [productIds]);

  const isWishlisted = (productId: number) => productIds.includes(productId);

  const toggleWishlist = (productId: number) => {
    setProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const removeFromWishlist = (productId: number) => {
    setProductIds((prev) => prev.filter((id) => id !== productId));
  };

  const value = useMemo<WishlistContextValue>(
    () => ({ productIds, isWishlisted, toggleWishlist, removeFromWishlist }),
    [productIds]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return ctx;
}
