import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useAuth } from "./auth-context";
import useRequest from "../hooks/use-req";
import type { ApiProduct, ProductInput } from "../types/product";

// Kept as named re-exports so existing imports (`SellerProduct`,
// `SellerProductInput`) keep working — the seller's products are just the
// API product shape.
export type SellerProduct = ApiProduct;
export type SellerProductInput = ProductInput;

interface SellerProductContextValue {
  products: SellerProduct[];
  loading: boolean;
  // True once the first /products/mine fetch has resolved.
  loaded: boolean;
  getProduct: (id: string) => SellerProduct | undefined;
  refetch: () => Promise<void>;
  // Each resolves to the affected product (or null / false on failure) so pages
  // can await the API before navigating or showing a toast.
  addProduct: (input: SellerProductInput) => Promise<SellerProduct | null>;
  updateProduct: (id: string, input: SellerProductInput) => Promise<SellerProduct | null>;
  deleteProduct: (id: string) => Promise<boolean>;
}

const SellerProductContext = createContext<SellerProductContextValue | null>(null);
  const token = localStorage.getItem("authToken");
const ok = (status: number) => status >= 200 && status < 300;

export function SellerProductProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const isSeller = user?.role === "seller";

  const { makeRequest: fetchMine } = useRequest("/products/mine", "GET");
  const { makeRequest: createReq } = useRequest("/products", "POST", {
     Authorization: `Bearer ${token}`,
  });

  const { makeRequest: updateReq } = useRequest("/products", "PATCH");
  const { makeRequest: deleteReq } = useRequest("/products", "DELETE");

  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const refetch = useCallback(async () => {
    if (!isAuthenticated || !isSeller) {
      setProducts([]);
      setLoaded(true);
      return;
    }
    setLoading(true);
    const [json, status] = await fetchMine();
    setLoading(false);
    setLoaded(true);
    if (ok(status) && Array.isArray(json?.data)) {
      setProducts(json.data as SellerProduct[]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isSeller]);

  useEffect(() => {
    if (isAuthenticated && isSeller) {
      refetch();
    } else {
      setProducts([]);
      setLoaded(false);
    }
  }, [isAuthenticated, isSeller, refetch]);

  const getProduct = useCallback((id: string) => products.find((p) => p.id === id), [products]);

  const addProduct = useCallback(async (input: SellerProductInput) => {
    const [json, status] = await createReq(input);
    if (!ok(status)) return null;
    const created = (json?.data ?? null) as SellerProduct | null;
    if (created) {
      setProducts((prev) => [created, ...prev]);
    }
    return created;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateProduct = useCallback(async (id: string, input: SellerProductInput) => {
    const [json, status] = await updateReq(input, undefined, id);
    if (!ok(status)) return null;
    const updated = (json?.data ?? null) as SellerProduct | null;
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...input, ...(updated ?? {}) } : p))
    );
    return updated;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    const [, status] = await deleteReq(undefined, undefined, id);
    if (!ok(status)) return false;
    setProducts((prev) => prev.filter((p) => p.id !== id));
    return true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<SellerProductContextValue>(
    () => ({
      products,
      loading,
      loaded,
      getProduct,
      refetch,
      addProduct,
      updateProduct,
      deleteProduct,
    }),
    [products, loading, loaded, getProduct, refetch, addProduct, updateProduct, deleteProduct]
  );

  return (
    <SellerProductContext.Provider value={value}>{children}</SellerProductContext.Provider>
  );
}

export function useSellerProducts() {
  const ctx = useContext(SellerProductContext);
  if (!ctx) {
    throw new Error("useSellerProducts must be used within a SellerProductProvider");
  }
  return ctx;
}
