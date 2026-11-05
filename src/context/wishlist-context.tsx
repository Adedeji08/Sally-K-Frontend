import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

interface WishlistContextValue {
  productIds: string[];
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);
const WISHLIST_KEY = "wishlist";

function readWishlistFromStorage(): string[] {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [productIds, setProductIds] = useState<string[]>(() => readWishlistFromStorage());

  useEffect(() => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(productIds));
  }, [productIds]);

  const isWishlisted = (productId: string) => productIds.includes(productId);

  const toggleWishlist = (productId: string) => {
    setProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const removeFromWishlist = (productId: string) => {
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
