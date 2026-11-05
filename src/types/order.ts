// Shapes returned by /orders/mine, /orders/received and /payments/verify.
// An order is created per seller once a Paystack payment is verified, so every
// order here has already been paid for.
export type OrderStatus = "PENDING" | "FULFILLED" | "CANCELLED";

export interface OrderItem {
  id: string;
  productId: string | null;
  name: string;
  image: string | null;
  price: number;
  // Empty string when the product has no sizes/colours.
  size: string;
  color: string;
  quantity: number;
}

export interface OrderSeller {
  id: string;
  brandName: string;
  logoUrl: string | null;
  address: string | null;
}

export interface OrderBuyer {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
}

export interface Order {
  id: string;
  buyerId: string;
  sellerId: string;
  paymentId: string | null;
  status: OrderStatus;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  seller?: OrderSeller;
  buyer?: OrderBuyer;
}

// UUIDs are unwieldy on screen — show the first block, e.g. "#63732D97".
export function orderNumber(id: string): string {
  return `#${id.split("-")[0].toUpperCase()}`;
}

export const ORDER_STATUS_META: Record<OrderStatus, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-amber-50 text-amber-600" },
  FULFILLED: { label: "Fulfilled", className: "bg-emerald-50 text-emerald-600" },
  CANCELLED: { label: "Cancelled", className: "bg-stone-100 text-stone-500" },
};

export function itemVariant(item: Pick<OrderItem, "size" | "color">): string {
  return [item.color, item.size].filter(Boolean).join(" · ") || "One Size";
}
