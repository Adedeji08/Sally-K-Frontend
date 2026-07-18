import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { CartItem } from "./cart-context";
import type { DeliveryMethod } from "./checkout-context";

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  address: string;
  deliveryMethod: DeliveryMethod;
  paymentMethod: "card" | "transfer";
  paymentStatus: "pending" | "paid";
  createdAt: number;
}

interface OrderContextValue {
  orders: Order[];
  addOrder: (order: Omit<Order, "id" | "createdAt">) => Order;
  getOrder: (id: string) => Order | undefined;
}

const OrderContext = createContext<OrderContextValue | null>(null);
const ORDERS_KEY = "orders";

function readOrdersFromStorage(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(() => readOrdersFromStorage());

  useEffect(() => {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }, [orders]);

  const addOrder = (order: Omit<Order, "id" | "createdAt">) => {
    const newOrder: Order = {
      ...order,
      id: `ORD-${Date.now().toString().slice(-8)}`,
      createdAt: Date.now(),
    };
    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const getOrder = (id: string) => orders.find((order) => order.id === id);

  const value = useMemo<OrderContextValue>(
    () => ({ orders, addOrder, getOrder }),
    [orders]
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrders() {
  const ctx = useContext(OrderContext);
  if (!ctx) {
    throw new Error("useOrders must be used within an OrderProvider");
  }
  return ctx;
}
