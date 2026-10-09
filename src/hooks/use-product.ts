import { useCallback, useEffect, useState } from "react";
import useRequest from "./use-req";
import type { ApiProduct } from "../types/product";

// "public" -> GET /products/:id      (shopper; active products only)
// "mine"   -> GET /products/mine/:id (seller; own products, active or not)
type ProductScope = "public" | "mine";

interface UseProductResult {
  product: ApiProduct | null;
  loading: boolean;
  // True when the API answered 404 (deleted, inactive, or not this seller's).
  notFound: boolean;
  refetch: () => Promise<void>;
}

export default function useProduct(
  id: string | undefined,
  scope: ProductScope,
  // Shown straight away while the fetch is in flight, e.g. the row already in
  // the seller's product list, so the page doesn't flash a spinner.
  initial?: ApiProduct
): UseProductResult {
  const { makeRequest } = useRequest(scope === "mine" ? "/products/mine" : "/products", "GET");

  // Results are tagged with the id they belong to, so switching ids shows the
  // new placeholder immediately instead of the previous product.
  const [result, setResult] = useState<{ id: string; product: ApiProduct | null } | null>(null);
  const [loading, setLoading] = useState(Boolean(id));

  const refetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const [json, status] = await makeRequest(undefined, undefined, id);
    setLoading(false);

    if (status >= 200 && status < 300 && json?.data) {
      setResult({ id, product: json.data as ApiProduct });
    } else if (status === 404) {
      setResult({ id, product: null });
    }
    // Other failures (network, 500) keep whatever we were already showing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, scope]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const settled = result && result.id === id ? result : null;
  const product = settled ? settled.product : initial ?? null;
  const notFound = !id || (settled !== null && settled.product === null);

  return { product, loading: Boolean(id) && loading && !settled, notFound, refetch };
}
