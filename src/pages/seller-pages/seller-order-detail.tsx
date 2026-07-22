import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Banknote, CreditCard, MapPin } from "lucide-react";
import { useOrders } from "../../context/order-context";
import { DELIVERY_OPTIONS } from "../../context/checkout-context";
import { getTransactionFee, getNetPayout } from "../../utils/transaction-fee";

export default function SellerOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getOrder, markFulfilled } = useOrders();
  const order = id ? getOrder(id) : undefined;
  const platformFee = order ? getTransactionFee(order.subtotal) : 0;
  const netPayout = order ? getNetPayout(order.subtotal) : 0;

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
          <h1 className="text-2xl font-semibold text-[#121212]">{order.id}</h1>
          <p className="text-sm text-[#65799A]">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
              order.fulfilled ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
            }`}
          >
            {order.fulfilled ? "Fulfilled" : "Pending"}
          </span>
          {!order.fulfilled && (
            <button
              onClick={() => markFulfilled(order.id)}
              className="bg-[#ED1280] hover:opacity-90 text-white font-semibold px-4 py-2 rounded-full text-sm transition-opacity"
            >
              Mark as Fulfilled
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h2 className="text-sm font-semibold text-[#121212] mb-4">Items</h2>
        <div className="flex flex-col gap-4 divide-y divide-[#F2E8ED]">
          {order.items.map((item) => (
            <div key={item.lineId} className="flex items-center gap-4 pt-4 first:pt-0">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#F2E8ED] shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#121212] truncate">{item.name}</p>
                <p className="text-xs text-[#65799A] mt-0.5">
                  {[item.color, item.size].filter(Boolean).join(" · ") || "One Size"} · Qty{" "}
                  {item.quantity}
                </p>
              </div>
              <p className="text-sm font-bold text-[#121212]">
                ₦{(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-[#ED1280]" strokeWidth={2} />
            <h2 className="text-sm font-semibold text-[#121212]">Delivery</h2>
          </div>
          <p className="text-sm text-[#333333] font-medium">
            {DELIVERY_OPTIONS[order.deliveryMethod].label}
          </p>
          <p className="text-xs text-[#65799A] mt-1">{order.address}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-3">
            {order.paymentMethod === "card" ? (
              <CreditCard className="w-4 h-4 text-[#ED1280]" strokeWidth={2} />
            ) : (
              <Banknote className="w-4 h-4 text-[#ED1280]" strokeWidth={2} />
            )}
            <h2 className="text-sm font-semibold text-[#121212]">Payment</h2>
          </div>
          <p className="text-sm text-[#333333] font-medium">
            {order.paymentMethod === "card" ? "Card" : "Bank Transfer"}
          </p>
          <p className="text-xs text-[#65799A] mt-1">
            {order.paymentStatus === "pending" ? "Awaiting confirmation" : "Payment confirmed"}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h2 className="text-sm font-semibold text-[#121212] mb-3">Summary</h2>
        <div className="flex flex-col gap-2 text-sm text-[#65799A]">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="text-[#121212] font-medium">₦{order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping (paid to logistics partner)</span>
            <span className="text-[#121212] font-medium">₦{order.shippingFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between pt-2 mt-1 border-t border-[#F2E8ED]">
            <span className="text-sm font-semibold text-[#121212]">Buyer paid</span>
            <span className="text-lg font-bold text-[#121212]">₦{order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-sm font-semibold text-[#121212] mb-3">Your Payout</h2>
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
    </div>
  );
}
