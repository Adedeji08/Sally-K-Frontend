import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import { ClipLoader } from "react-spinners";
import Navbar from "../../layouts/navbar";
import { useAuth } from "../../context/auth-context";
import { useCart } from "../../context/cart-context";
import { useCheckout } from "../../context/checkout-context";
import { useOrders } from "../../context/order-context";
import useRequest from "../../hooks/use-req";
import type { Order } from "../../types/order";
import { itemVariant, orderNumber } from "../../types/order";

type VerifyState =
  | { kind: "verifying" }
  | { kind: "success"; orders: Order[]; amount: number }
  | { kind: "failed"; message: string };

// Paystack's hosted checkout redirects here with ?reference=...&trxref=...
// GET /payments/verify/:reference confirms the charge server-to-server, then
// creates one order per seller, decrements stock and clears the cart. It's
// idempotent, so a refresh of this page is harmless.
export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference") ?? searchParams.get("trxref");
  const { isAuthenticated } = useAuth();
  const { refetch: refetchCart } = useCart();
  const { clearShipping } = useCheckout();
  const { refetchMyOrders } = useOrders();
  const { makeRequest: verifyPayment } = useRequest("/payments/verify", "GET");

  const [state, setState] = useState<VerifyState>(
    reference ? { kind: "verifying" } : { kind: "failed", message: "Missing payment reference." }
  );
  const started = useRef(false);

  useEffect(() => {
    if (!reference || !isAuthenticated || started.current) return;
    started.current = true;

    verifyPayment(undefined, undefined, encodeURIComponent(reference)).then(([json, status]) => {
      if (status >= 200 && status < 300 && json?.data) {
        setState({
          kind: "success",
          orders: (json.data.orders ?? []) as Order[],
          amount: json.data.payment?.amount ?? 0,
        });
        clearShipping();
        refetchCart();
        refetchMyOrders();
      } else {
        setState({
          kind: "failed",
          message: json?.message || "We couldn't confirm your payment.",
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference, isAuthenticated]);

  return (
    <>
      <Navbar />
      <main className="max-w-lg mx-auto px-6 py-16">
        {state.kind === "verifying" && (
          <div className="text-center py-10">
            <ClipLoader size={32} color="#f43f5e" />
            <p className="text-sm text-stone-500 mt-4">Confirming your payment with Paystack...</p>
          </div>
        )}

        {state.kind === "failed" && (
          <div className="text-center">
            <span className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-5">
              <XCircle className="w-8 h-8 text-stone-400" strokeWidth={2} />
            </span>
            <h1 className="text-2xl font-semibold text-stone-900 mb-2">Payment not completed</h1>
            <p className="text-sm text-stone-500 mb-8">
              {state.message} You haven't been charged for an order, and your bag is still saved.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link
                to="/payment"
                className="inline-block bg-rose-500 hover:bg-rose-600 text-white font-semibold px-7 py-3 rounded-full text-sm transition-colors"
              >
                Try again
              </Link>
              <Link
                to="/cart"
                className="inline-block border border-stone-200 text-stone-700 font-semibold px-7 py-3 rounded-full text-sm hover:bg-stone-50 transition-colors"
              >
                Back to bag
              </Link>
            </div>
          </div>
        )}

        {state.kind === "success" && (
          <>
            <div className="text-center mb-8">
              <span className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-8 h-8 text-rose-500" strokeWidth={2} />
              </span>
              <h1 className="text-2xl font-semibold text-stone-900 mb-2">Payment successful!</h1>
              <p className="text-sm text-stone-500">
                ₦{state.amount.toFixed(2)} paid.{" "}
                {state.orders.length > 1
                  ? `Your purchase was split into ${state.orders.length} orders, one per supplier.`
                  : "Your order has been placed."}{" "}
                Your supplier will reach out to arrange delivery.
              </p>
            </div>

            <div className="flex flex-col gap-3 mb-8">
              {state.orders.map((order) => (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="bg-white rounded-2xl shadow-sm p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-stone-800">
                      {orderNumber(order.id)}
                      {order.seller && (
                        <span className="font-normal text-stone-400"> · {order.seller.brandName}</span>
                      )}
                    </p>
                    <p className="text-sm font-bold text-stone-900">₦{order.subtotal.toFixed(2)}</p>
                  </div>
                  {order.items.map((item) => (
                    <p key={item.id} className="text-xs text-stone-500">
                      {item.quantity}× {item.name} — {itemVariant(item)}
                    </p>
                  ))}
                </Link>
              ))}
            </div>

            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link
                to="/orders"
                className="inline-block bg-rose-500 hover:bg-rose-600 text-white font-semibold px-7 py-3 rounded-full text-sm transition-colors"
              >
                View my orders
              </Link>
              <Link
                to="/"
                className="inline-block border border-stone-200 text-stone-700 font-semibold px-7 py-3 rounded-full text-sm hover:bg-stone-50 transition-colors"
              >
                Continue shopping
              </Link>
            </div>
          </>
        )}
      </main>
    </>
  );
}
