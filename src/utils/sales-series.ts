import type { Order } from "../types/order";

export type SalesPeriod = "daily" | "weekly" | "monthly" | "yearly";

export interface SalesPoint {
  label: string;
  value: number;
}

export function buildSalesSeries(sourceOrders: Order[], period: SalesPeriod): SalesPoint[] {
  const now = new Date();
  // API timestamps are ISO strings; bucket on epoch ms and the order subtotal.
  const orders = sourceOrders.map((o) => ({ createdAt: new Date(o.createdAt).getTime(), total: o.subtotal }));

  if (period === "daily") {
    const points: SalesPoint[] = [];
    for (let i = 6; i >= 0; i--) {
      const start = new Date(now);
      start.setDate(now.getDate() - i);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 1);

      const value = orders
        .filter((o) => o.createdAt >= start.getTime() && o.createdAt < end.getTime())
        .reduce((sum, o) => sum + o.total, 0);

      points.push({ label: start.toLocaleDateString(undefined, { weekday: "short" }), value });
    }
    return points;
  }

  if (period === "weekly") {
    const points: SalesPoint[] = [];
    for (let i = 5; i >= 0; i--) {
      const end = new Date(now);
      end.setDate(now.getDate() - i * 7);
      end.setHours(23, 59, 59, 999);
      const start = new Date(end);
      start.setDate(end.getDate() - 6);
      start.setHours(0, 0, 0, 0);

      const value = orders
        .filter((o) => o.createdAt >= start.getTime() && o.createdAt <= end.getTime())
        .reduce((sum, o) => sum + o.total, 0);

      points.push({ label: `Wk ${6 - i}`, value });
    }
    return points;
  }

  if (period === "monthly") {
    const points: SalesPoint[] = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const value = orders
        .filter((o) => o.createdAt >= start.getTime() && o.createdAt < end.getTime())
        .reduce((sum, o) => sum + o.total, 0);

      points.push({ label: start.toLocaleDateString(undefined, { month: "short" }), value });
    }
    return points;
  }

  // yearly
  const points: SalesPoint[] = [];
  for (let i = 3; i >= 0; i--) {
    const year = now.getFullYear() - i;
    const value = orders
      .filter((o) => new Date(o.createdAt).getFullYear() === year)
      .reduce((sum, o) => sum + o.total, 0);
    points.push({ label: String(year), value });
  }
  return points;
}
