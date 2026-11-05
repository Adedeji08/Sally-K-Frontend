import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import useRequest from "../hooks/use-req";
import type { ApiProduct } from "../types/product";

// The shopper-facing catalogue: everything from GET /products. Shared once at the
// app root so the home grid, product detail, designer store and wishlist all read
// the same fetched list instead of each mocking their own.
interface ShopProductContextValue {
  products: ApiProduct[];
  loading: boolean;
  loaded: boolean;
  refetch: () => Promise<void>;
}

const ShopProductContext = createContext<ShopProductContextValue | null>(null);

const ok = (status: number) => status >= 200 && status < 300;

export function ShopProductProvider({ children }: { children: ReactNode }) {
  const { makeRequest } = useRequest("/products", "GET");
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);

  const refetch = useCallback(async () => {
    setLoading(true);
    const [json, status] = await makeRequest();
    setLoading(false);
    setLoaded(true);
    if (ok(status) && Array.isArray(json?.data)) {
      setProducts(json.data as ApiProduct[]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const value = useMemo<ShopProductContextValue>(
    () => ({ products, loading, loaded, refetch }),
    [products, loading, loaded, refetch]
  );

  return <ShopProductContext.Provider value={value}>{children}</ShopProductContext.Provider>;
}

export function useShopProducts() {
  const ctx = useContext(ShopProductContext);
  if (!ctx) {
    throw new Error("useShopProducts must be used within a ShopProductProvider");
  }
  return ctx;
}
