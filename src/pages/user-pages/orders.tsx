import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Package } from "lucide-react";
import Navbar from "../../layouts/navbar";
import { useAuth } from "../../context/auth-context";
import { useOrders } from "../../context/order-context";
import { DELIVERY_STAGE_META, getDeliveryStage } from "../../utils/delivery-status";

const STAGE_STYLES: Record<string, string> = {
  processing: "bg-amber-50 text-amber-600",
  shipped: "bg-blue-50 text-blue-600",
  out_for_delivery: "bg-violet-50 text-violet-600",
  delivered: "bg-emerald-50 text-emerald-600",
};

export default function Orders() {
  const navigate = useNavigate();
  const { isAuthenticated, openLoginModal } = useAuth();
  const { orders } = useOrders();

  useEffect(() => {
    if (!isAuthenticated) {
      openLoginModal("Sign in to view your orders.");
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate, openLoginModal]);

  if (!isAuthenticated) return null;

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <p className="text-xs text-stone-400 mb-2">
          <Link to="/" className="hover:text-rose-500 transition-colors">
            Home
          </Link>{" "}
          / <span className="text-stone-600">My Orders</span>
        </p>
        <h1 className="text-2xl md:text-3xl font-semibold text-stone-900 mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <span className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
              <Package className="w-7 h-7 text-stone-400" strokeWidth={2} />
            </span>
            <p className="text-lg font-semibold text-stone-800 mb-1">No orders yet</p>
            <p className="text-sm text-stone-400 mb-6">
              When you place an order, it'll show up here.
            </p>
            <Link
              to="/"
              className="inline-block bg-rose-500 hover:bg-rose-600 text-white font-semibold px-7 py-3 rounded-full text-sm transition-colors"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order) => {
              const stage = getDeliveryStage(order.createdAt, order.deliveryMethod);
              return (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div>
                    <p className="text-sm font-semibold text-stone-800">{order.id}</p>
                    <p className="text-xs text-stone-400">
                      {new Date(order.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {order.paymentStatus === "pending" && (
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-stone-100 text-stone-500">
                        Payment pending
                      </span>
                    )}
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${STAGE_STYLES[stage]}`}
                    >
                      {DELIVERY_STAGE_META[stage].label}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  {order.items.slice(0, 4).map((item) => (
                    <div
                      key={item.lineId}
                      className="w-12 h-12 rounded-lg overflow-hidden bg-stone-100 shrink-0"
                    >
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {order.items.length > 4 && (
                    <span className="text-xs text-stone-400">
                      +{order.items.length - 4} more
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-stone-400">
                    {order.items.reduce((sum, i) => sum + i.quantity, 0)} item(s)
                  </p>
                  <p className="text-sm font-bold text-stone-900">₦{order.total.toFixed(2)}</p>
                </div>
              </Link>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
