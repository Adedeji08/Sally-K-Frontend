import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useAuth } from "./auth-context";
import useRequest from "../hooks/use-req";
import type { Order, OrderStatus } from "../types/order";

interface OrderContextValue {
  // GET /orders/mine — what the logged-in user has bought.
  myOrders: Order[];
  myOrdersLoaded: boolean;
  refetchMyOrders: () => Promise<void>;
  // GET /orders/received — sellers only: orders placed with their store.
  receivedOrders: Order[];
  receivedOrdersLoaded: boolean;
  refetchReceivedOrders: () => Promise<void>;
  // PATCH /orders/received/:id — resolves with the API message on failure.
  updateOrderStatus: (
    id: string,
    status: Exclude<OrderStatus, "PENDING">
  ) => Promise<{ ok: true } | { ok: false; message: string }>;
}

const OrderContext = createContext<OrderContextValue | null>(null);

const ok = (status: number) => status >= 200 && status < 300;

export function OrderProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const isSeller = user?.role === "seller";

  const { makeRequest: fetchMine } = useRequest("/orders/mine", "GET");
  const { makeRequest: fetchReceived } = useRequest("/orders/received", "GET");
  const { makeRequest: patchReceived } = useRequest("/orders/received", "PATCH");

  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [myOrdersLoaded, setMyOrdersLoaded] = useState(false);
  const [receivedOrders, setReceivedOrders] = useState<Order[]>([]);
  const [receivedOrdersLoaded, setReceivedOrdersLoaded] = useState(false);

  const refetchMyOrders = async () => {
    const [json, status] = await fetchMine();
    setMyOrdersLoaded(true);
    if (ok(status) && Array.isArray(json?.data)) setMyOrders(json.data as Order[]);
  };

  const refetchReceivedOrders = async () => {
    const [json, status] = await fetchReceived();
    setReceivedOrdersLoaded(true);
    if (ok(status) && Array.isArray(json?.data)) setReceivedOrders(json.data as Order[]);
  };

  // Orders used to live in localStorage — clear that leftover once.
  useEffect(() => {
    localStorage.removeItem("orders");
    if (isAuthenticated) {
      refetchMyOrders();
    } else {
      setMyOrders([]);
      setMyOrdersLoaded(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && isSeller) {
      refetchReceivedOrders();
    } else {
      setReceivedOrders([]);
      setReceivedOrdersLoaded(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isSeller]);

  const updateOrderStatus: OrderContextValue["updateOrderStatus"] = async (id, status) => {
    const [json, code] = await patchReceived({ status }, undefined, id);
    if (!ok(code)) {
      return { ok: false, message: json?.message || "Couldn't update this order. Try again." };
    }
    setReceivedOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status, updatedAt: json?.data?.updatedAt ?? o.updatedAt } : o))
    );
    return { ok: true };
  };

  const value: OrderContextValue = {
    myOrders,
    myOrdersLoaded,
    refetchMyOrders,
    receivedOrders,
    receivedOrdersLoaded,
    refetchReceivedOrders,
    updateOrderStatus,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrders() {
  const ctx = useContext(OrderContext);
  if (!ctx) {
    throw new Error("useOrders must be used within an OrderProvider");
  }
  return ctx;
}
