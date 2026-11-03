import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, HelpCircle, Lock, MapPin, Store } from "lucide-react";
import { ClipLoader } from "react-spinners";
import Navbar from "../../layouts/navbar";
import { useAuth } from "../../context/auth-context";
import { useOrders } from "../../context/order-context";
import useOrder from "../../hooks/use-order";
import { ORDER_STATUS_META, itemVariant, orderNumber } from "../../types/order";

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, openLoginModal } = useAuth();
  const { myOrders } = useOrders();
  // GET /orders/mine/:id — 404s for orders that aren't this buyer's.
  const { order, loading } = useOrder(
    id,
    "mine",
    myOrders.find((o) => o.id === id)
  );

  useEffect(() => {
    if (!isAuthenticated) {
      openLoginModal("Sign in to view your order.");
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate, openLoginModal]);

  if (!isAuthenticated) return null;

  if (!order && loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center py-24">
          <ClipLoader size={28} color="#f43f5e" />
        </div>
      </>
    );
  }

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

  const status = ORDER_STATUS_META[order.status];

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
            <h1 className="text-2xl font-semibold text-stone-900">{orderNumber(order.id)}</h1>
            <p className="text-sm text-stone-400">
              Placed on{" "}
              {new Date(order.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${status.className}`}>
            {order.status === "PENDING" ? "Awaiting supplier" : status.label}
          </span>
        </div>

        {/* Supplier / delivery */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-sm font-semibold text-stone-800 mb-2">Delivery</h2>
          <p className="text-sm text-stone-500 mb-4">
            {order.status === "CANCELLED"
              ? "This order was cancelled by the supplier."
              : order.status === "FULFILLED"
                ? "Your supplier has marked this order as fulfilled."
                : "Delivery is arranged between you and your supplier — they'll reach out to agree on timing and any delivery cost."}
          </p>
          {order.seller && (
            <div className="border border-stone-200 rounded-xl p-4">
              <Link
                to={`/designer/${encodeURIComponent(order.seller.brandName)}`}
                className="flex items-center gap-3 mb-2 group"
              >
                {order.seller.logoUrl ? (
                  <img
                    src={order.seller.logoUrl}
                    alt=""
                    className="w-9 h-9 rounded-full object-cover border border-stone-100"
                  />
                ) : (
                  <span className="w-9 h-9 rounded-full bg-rose-50 flex items-center justify-center">
                    <Store className="w-4 h-4 text-rose-500" strokeWidth={2} />
                  </span>
                )}
                <span className="text-sm font-semibold text-stone-800 group-hover:text-rose-500 transition-colors">
                  {order.seller.brandName}
                </span>
              </Link>
              <p className="flex items-start gap-2 text-sm text-stone-600">
                <MapPin className="w-3.5 h-3.5 text-stone-400 mt-0.5 shrink-0" strokeWidth={2} />
                {order.seller.address ?? (
                  <span className="text-stone-400">Address not provided</span>
                )}
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-sm font-semibold text-stone-800 mb-4">Items</h2>
          <div className="flex flex-col gap-4 divide-y divide-stone-100">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 pt-4 first:pt-0">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-100 shrink-0">
                  {item.image && (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  {item.productId ? (
                    <Link
                      to={`/product/${item.productId}`}
                      className="text-sm font-semibold text-stone-800 truncate block hover:text-rose-500 transition-colors"
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <p className="text-sm font-semibold text-stone-800 truncate">{item.name}</p>
                  )}
                  <p className="text-xs text-stone-400 mt-0.5">
                    {itemVariant(item)} · Qty {item.quantity} · ₦{item.price.toFixed(2)} each
                  </p>
                </div>
                <p className="text-sm font-bold text-stone-900">
                  ₦{(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-stone-800">Summary</h2>
            <span className="flex items-center gap-1.5 text-xs text-emerald-600">
              <Lock className="w-3.5 h-3.5" strokeWidth={2} />
              Paid via Paystack
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-stone-800">Total paid</span>
            <span className="text-lg font-bold text-stone-900">₦{order.subtotal.toFixed(2)}</span>
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
