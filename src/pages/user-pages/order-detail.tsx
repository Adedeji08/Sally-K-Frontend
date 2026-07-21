import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  CreditCard,
  HelpCircle,
  MapPin,
  Package,
  Truck,
} from "lucide-react";
import Navbar from "../../layouts/navbar";
import { useAuth } from "../../context/auth-context";
import { useOrders } from "../../context/order-context";
import { DELIVERY_OPTIONS } from "../../context/checkout-context";
import type { DeliveryMethod } from "../../context/checkout-context";
import {
  DELIVERY_STAGE_META,
  DELIVERY_STAGE_ORDER,
  getDeliveryStage,
} from "../../utils/delivery-status";
import type { DeliveryStage } from "../../utils/delivery-status";

const STAGE_ICONS: Record<DeliveryStage, typeof Package> = {
  processing: Package,
  shipped: Truck,
  out_for_delivery: Truck,
  delivered: CheckCircle2,
};

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  paid: "bg-emerald-50 text-emerald-600",
  pending: "bg-amber-50 text-amber-600",
};

function DeliveryTracker({
  createdAt,
  deliveryMethod,
}: {
  createdAt: number;
  deliveryMethod: DeliveryMethod;
}) {
  const currentStage = getDeliveryStage(createdAt, deliveryMethod);
  const currentIndex = DELIVERY_STAGE_ORDER.indexOf(currentStage);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
      <h2 className="text-sm font-semibold text-stone-800 mb-6">Delivery Tracking</h2>
      <div className="grid grid-cols-4">
        {DELIVERY_STAGE_ORDER.map((stage, index) => {
          const Icon = STAGE_ICONS[stage];
          const done = index <= currentIndex;
          return (
            <div key={stage} className="relative flex flex-col items-center text-center px-1">
              {index > 0 && (
                <div
                  className={`absolute top-4 h-0.5 -z-10 ${
                    index <= currentIndex ? "bg-rose-500" : "bg-stone-200"
                  }`}
                  style={{ left: "-50%", width: "100%" }}
                />
              )}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 bg-white shrink-0 ${
                  done ? "border-rose-500 text-rose-500" : "border-stone-200 text-stone-300"
                }`}
              >
                <Icon className="w-4 h-4" strokeWidth={2} />
              </div>
              <p
                className={`text-[10px] sm:text-xs mt-2 font-medium leading-tight ${
                  done ? "text-stone-800" : "text-stone-400"
                }`}
              >
                {DELIVERY_STAGE_META[stage].label}
              </p>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-stone-400 mt-5 text-center">
        {DELIVERY_STAGE_META[currentStage].description}
      </p>
    </div>
  );
}

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, openLoginModal } = useAuth();
  const { getOrder } = useOrders();
  const order = id ? getOrder(id) : undefined;

  useEffect(() => {
    if (!isAuthenticated) {
      openLoginModal("Sign in to view this order.");
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate, openLoginModal]);

  if (!isAuthenticated) return null;

  if (!order) {
    return (
      <>
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <p className="text-lg font-semibold text-stone-800 mb-2">Order not found</p>
          <p className="text-sm text-stone-400 mb-6">
            We couldn't find that order — it may not belong to this account.
          </p>
          <Link to="/orders" className="text-rose-500 font-medium hover:text-rose-600">
            Back to my orders
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate("/orders")}
          className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          Back to my orders
        </button>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-stone-900">{order.id}</h1>
            <p className="text-sm text-stone-400">
              Placed on{" "}
              {new Date(order.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <span
            className={`text-xs font-semibold px-3 py-1.5 rounded-full capitalize ${PAYMENT_STATUS_STYLES[order.paymentStatus]}`}
          >
            {order.paymentStatus === "pending" ? "Payment pending" : "Payment confirmed"}
          </span>
        </div>

        <DeliveryTracker createdAt={order.createdAt} deliveryMethod={order.deliveryMethod} />

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-sm font-semibold text-stone-800 mb-4">Items</h2>
          <div className="flex flex-col gap-4 divide-y divide-stone-100">
            {order.items.map((item) => (
              <div key={item.lineId} className="flex items-center gap-4 pt-4 first:pt-0">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-100 shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-stone-800 truncate">{item.name}</p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {[item.color, item.size].filter(Boolean).join(" · ") || "One Size"} · Qty{" "}
                    {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-bold text-stone-900">
                  ₦{(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-rose-500" strokeWidth={2} />
              <h2 className="text-sm font-semibold text-stone-800">Delivery</h2>
            </div>
            <p className="text-sm text-stone-700 font-medium">
              {DELIVERY_OPTIONS[order.deliveryMethod].label}
            </p>
            <p className="text-xs text-stone-400 mt-1">{order.address}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-3">
              {order.paymentMethod === "card" ? (
                <CreditCard className="w-4 h-4 text-rose-500" strokeWidth={2} />
              ) : (
                <Banknote className="w-4 h-4 text-rose-500" strokeWidth={2} />
              )}
              <h2 className="text-sm font-semibold text-stone-800">Payment</h2>
            </div>
            <p className="text-sm text-stone-700 font-medium capitalize">
              {order.paymentMethod === "card" ? "Card" : "Bank Transfer"}
            </p>
            <p className="text-xs text-stone-400 mt-1">
              {order.paymentStatus === "pending" ? "Awaiting confirmation" : "Payment confirmed"}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-sm font-semibold text-stone-800 mb-3">Summary</h2>
          <div className="flex flex-col gap-2 text-sm text-stone-500">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-stone-800 font-medium">₦{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-stone-800 font-medium">₦{order.shippingFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 mt-1 border-t border-stone-100">
              <span className="text-sm font-semibold text-stone-800">Total</span>
              <span className="text-lg font-bold text-stone-900">₦{order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <Link
          to={`/help?order=${order.id}`}
          className="flex items-center justify-center gap-2 text-sm font-medium text-rose-500 hover:text-rose-600 transition-colors"
        >
          <HelpCircle className="w-4 h-4" strokeWidth={2} />
          Having an issue with this order?
        </Link>
      </main>
    </>
  );
}
