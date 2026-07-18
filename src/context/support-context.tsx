import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type TicketCategory = "order" | "payment" | "product" | "other";

export interface SupportTicket {
  id: string;
  category: TicketCategory;
  subject: string;
  message: string;
  orderId?: string;
  status: "open" | "resolved";
  createdAt: number;
}

interface SupportContextValue {
  tickets: SupportTicket[];
  addTicket: (ticket: Omit<SupportTicket, "id" | "createdAt" | "status">) => SupportTicket;
}

const SupportContext = createContext<SupportContextValue | null>(null);
const TICKETS_KEY = "supportTickets";

function readTicketsFromStorage(): SupportTicket[] {
  try {
    const raw = localStorage.getItem(TICKETS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function SupportProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<SupportTicket[]>(() => readTicketsFromStorage());

  useEffect(() => {
    localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
  }, [tickets]);

  const addTicket: SupportContextValue["addTicket"] = (ticket) => {
    const newTicket: SupportTicket = {
      ...ticket,
      id: `TCK-${Date.now().toString().slice(-8)}`,
      status: "open",
      createdAt: Date.now(),
    };
    setTickets((prev) => [newTicket, ...prev]);
    return newTicket;
  };

  const value = useMemo<SupportContextValue>(() => ({ tickets, addTicket }), [tickets]);

  return <SupportContext.Provider value={value}>{children}</SupportContext.Provider>;
}

export function useSupport() {
  const ctx = useContext(SupportContext);
  if (!ctx) {
    throw new Error("useSupport must be used within a SupportProvider");
  }
  return ctx;
}
