import type { DeliveryMethod } from "../context/checkout-context";

export type DeliveryStage = "processing" | "shipped" | "out_for_delivery" | "delivered";

export const DELIVERY_STAGE_ORDER: DeliveryStage[] = [
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
];

export const DELIVERY_STAGE_META: Record<DeliveryStage, { label: string; description: string }> = {
  processing: {
    label: "Processing",
    description: "We're preparing your order for shipment.",
  },
  shipped: {
    label: "Shipped",
    description: "Your order has left the seller's warehouse.",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    description: "Your order is on its way to you.",
  },
  delivered: {
    label: "Delivered",
    description: "Your order has arrived. Enjoy!",
  },
};

// Day thresholds at which each stage begins, tuned to each delivery method's ETA.
const STAGE_DAY_THRESHOLDS: Record<DeliveryMethod, number[]> = {
  standard: [0, 1, 3, 5],
  express: [0, 0.5, 1, 2],
};

export function getDeliveryStage(createdAt: number, deliveryMethod: DeliveryMethod): DeliveryStage {
  const elapsedDays = (Date.now() - createdAt) / 86400000;
  const thresholds = STAGE_DAY_THRESHOLDS[deliveryMethod];

  let stageIndex = 0;
  for (let i = 0; i < thresholds.length; i++) {
    if (elapsedDays >= thresholds[i]) stageIndex = i;
  }

  return DELIVERY_STAGE_ORDER[stageIndex];
}
