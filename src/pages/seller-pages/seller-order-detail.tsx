import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Lock, Mail, Phone, User } from "lucide-react";
import { ClipLoader } from "react-spinners";
import { useOrders } from "../../context/order-context";
import { useToast } from "../../context/toast-context";
import useOrder from "../../hooks/use-order";
import { ORDER_STATUS_META, itemVariant, orderNumber } from "../../types/order";
import { getTransactionFee, getNetPayout } from "../../utils/transaction-fee";

export default function SellerOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { receivedOrders, updateOrderStatus } = useOrders();
  // GET /orders/received/:id — the list row (if loaded) shows while it fetches.
  const { order: fetchedOrder, loading } = useOrder(id, "received");
  const listOrder = receivedOrders.find((o) => o.id === id);
  // Status changes land in the context list first, so prefer its status.
  const order = fetchedOrder
    ? { ...fetchedOrder, status: listOrder?.status ?? fetchedOrder.status }
    : listOrder ?? null;

  const [updating, setUpdating] = useState<"FULFILLED" | "CANCELLED" | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  if (!order && loading) {
    return (
      <div className="max-w-3xl mx-auto flex justify-center py-20">
        <ClipLoader size={28} color="#ED1280" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <p className="text-lg font-semibold text-[#121212] mb-2">Order not found</p>
        <Link to="/seller/orders" className="text-[#ED1280] font-medium hover:opacity-80">
          Back to orders
        </Link>
      </div>
    );
  }

  const status = ORDER_STATUS_META[order.status];
  const platformFee = getTransactionFee(order.subtotal);
  const netPayout = getNetPayout(order.subtotal);

  const setStatus = async (next: "FULFILLED" | "CANCELLED") => {
    setUpdating(next);
    const result = await updateOrderStatus(order.id, next);
    setUpdating(null);
    setConfirmCancel(false);
    if (result.ok) toast.success(next === "FULFILLED" ? "Order marked as fulfilled." : "Order cancelled.");
    else toast.error(result.message);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate("/seller/orders")}
        className="flex items-center gap-1.5 text-sm text-[#65799A] hover:text-[#121212] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={2} />
        Back to orders
      </button>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#121212]">{orderNumber(order.id)}</h1>
          <p className="text-sm text-[#65799A]">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${status.className}`}>
            {status.label}
          </span>
          {order.status === "PENDING" && (
            <>
              <button
                onClick={() => setConfirmCancel(true)}
                disabled={updating !== null}
                className="border border-[#E5E7EB] text-[#4a4a4a] hover:text-rose-500 hover:border-rose-200 font-semibold px-4 py-2 rounded-full text-sm transition-colors disabled:opacity-50"
              >
                Cancel order
              </button>
              <button
                onClick={() => setStatus("FULFILLED")}
                disabled={updating !== null}
                className="bg-[#ED1280] hover:opacity-90 text-white font-semibold px-4 py-2 rounded-full text-sm transition-opacity disabled:opacity-50"
              >
                {updating === "FULFILLED" ? "Saving..." : "Mark as Fulfilled"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Buyer contact — delivery is arranged directly with them */}
      {order.buyer && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-sm font-semibold text-[#121212] mb-1">Buyer</h2>
          <p className="text-xs text-[#65799A] mb-4">
            Reach out to the buyer to arrange delivery and any delivery cost.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <p className="flex items-center gap-2 text-[#333333] min-w-0">
              <User className="w-4 h-4 text-[#ED1280] shrink-0" strokeWidth={2} />
              <span className="truncate">{order.buyer.fullName}</span>
            </p>
            <a
              href={`tel:${order.buyer.phoneNumber}`}
              className="flex items-center gap-2 text-[#333333] hover:text-[#ED1280] transition-colors min-w-0"
            >
              <Phone className="w-4 h-4 text-[#ED1280] shrink-0" strokeWidth={2} />
              <span className="truncate">{order.buyer.phoneNumber}</span>
            </a>
            <a
              href={`mailto:${order.buyer.email}`}
              className="flex items-center gap-2 text-[#333333] hover:text-[#ED1280] transition-colors min-w-0"
            >
              <Mail className="w-4 h-4 text-[#ED1280] shrink-0" strokeWidth={2} />
              <span className="truncate">{order.buyer.email}</span>
            </a>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h2 className="text-sm font-semibold text-[#121212] mb-4">Items</h2>
        <div className="flex flex-col gap-4 divide-y divide-[#F2E8ED]">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 pt-4 first:pt-0">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#F2E8ED] shrink-0">
                {item.image && (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#121212] truncate">{item.name}</p>
                <p className="text-xs text-[#65799A] mt-0.5">
                  {itemVariant(item)} · Qty {item.quantity} · ₦{item.price.toFixed(2)} each
                </p>
              </div>
              <p className="text-sm font-bold text-[#121212]">
                ₦{(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[#121212]">Your Payout</h2>
          <span className="flex items-center gap-1.5 text-xs text-emerald-600">
            <Lock className="w-3.5 h-3.5" strokeWidth={2} />
            Buyer paid via Paystack
          </span>
        </div>
        <div className="flex flex-col gap-2 text-sm text-[#65799A]">
          <div className="flex justify-between">
            <span>Sale amount</span>
            <span className="text-[#121212] font-medium">₦{order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Platform fee</span>
            <span className="text-rose-500 font-medium">-₦{platformFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between pt-2 mt-1 border-t border-[#F2E8ED]">
            <span className="text-sm font-semibold text-[#121212]">Net payout</span>
            <span className="text-lg font-bold text-emerald-600">₦{netPayout.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {confirmCancel && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4"
          onClick={() => setConfirmCancel(false)}
        >
          <div
            className="w-full max-w-[380px] bg-white rounded-3xl shadow-xl p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-[16px] font-semibold text-[#121212] mb-1">Cancel this order?</h2>
            <p className="text-[13px] text-[#65799A] mb-6">
              The buyer will see it as cancelled. This can't be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmCancel(false)}
                className="flex-1 px-4 py-2.5 rounded-full text-sm font-semibold text-[#4a4a4a] border border-[#E5E7EB] hover:bg-[#F7F2F4] transition-colors"
              >
                Keep order
              </button>
              <button
                onClick={() => setStatus("CANCELLED")}
                disabled={updating !== null}
                className="flex-1 px-4 py-2.5 rounded-full text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 transition-colors disabled:opacity-60"
              >
                {updating === "CANCELLED" ? "Cancelling..." : "Cancel order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
