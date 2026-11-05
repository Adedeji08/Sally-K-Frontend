import { useEffect, useState } from "react";
import useRequest from "./use-req";
import type { Order } from "../types/order";

// "mine"     -> GET /orders/mine/:id     (buyer)
// "received" -> GET /orders/received/:id (seller)
type OrderScope = "mine" | "received";

export default function useOrder(
  id: string | undefined,
  scope: OrderScope,
  // Row from the already-loaded list, shown while the fetch is in flight.
  initial?: Order
) {
  const { makeRequest } = useRequest(scope === "mine" ? "/orders/mine" : "/orders/received", "GET");
  // Tagged with its id so a stale result never shows for a different order.
  const [result, setResult] = useState<{ id: string; order: Order | null } | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    makeRequest(undefined, undefined, id).then(([json, status]) => {
      if (cancelled) return;
      if (status >= 200 && status < 300 && json?.data) {
        setResult({ id, order: json.data as Order });
      } else if (status === 404) {
        setResult({ id, order: null });
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, scope]);

  const settled = result && result.id === id ? result : null;
  const order = settled ? settled.order : initial ?? null;
  return { order, loading: Boolean(id) && !settled };
}
