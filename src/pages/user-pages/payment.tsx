import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, CreditCard, Lock, ShieldCheck } from "lucide-react";
import Navbar from "../../layouts/navbar";
import { useAuth } from "../../context/auth-context";
import { useCart } from "../../context/cart-context";
import { useCheckout } from "../../context/checkout-context";
import useRequest from "../../hooks/use-req";

export default function Payment() {
  const navigate = useNavigate();
  const { isAuthenticated, openLoginModal } = useAuth();
  const { items, subtotal, loaded: cartLoaded } = useCart();
  const { shipping } = useCheckout();
  const { makeRequest: initializePayment } = useRequest("/payments/initialize", "POST");
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      openLoginModal("Sign in to complete your order.");
      navigate("/cart", { replace: true });
    }
  }, [isAuthenticated, navigate, openLoginModal]);

  useEffect(() => {
    if (cartLoaded && items.length === 0) {
      navigate("/cart", { replace: true });
    }
  }, [cartLoaded, items.length, navigate]);

  useEffect(() => {
    if (items.length > 0 && !shipping) {
      navigate("/checkout/shipping", { replace: true });
    }
  }, [shipping, items.length, navigate]);

  // Delivery is arranged (and paid for) directly with each supplier.
  const total = subtotal;

  // POST /payments/initialize prices the server-side cart (no body), then we
  // hand off to Paystack's hosted checkout. Paystack sends the buyer back to
  // /payment/callback?reference=..., which verifies and creates the orders.
  const handlePay = async () => {
    setError("");
    setStarting(true);
    const [json, status] = await initializePayment();
    const url = json?.data?.authorizationUrl;
    if (status < 200 || status >= 300 || !url) {
      setStarting(false);
      setError(json?.message || "Couldn't start the payment. Please try again.");
      return;
    }
    window.location.assign(url);
  };

  if (!isAuthenticated || items.length === 0) return null;

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <p className="text-xs text-stone-400 mb-2">
          <Link to="/" className="hover:text-rose-500 transition-colors">
            Home
          </Link>{" "}
          / <Link to="/cart" className="hover:text-rose-500 transition-colors">Shopping Bag</Link> /{" "}
          <span className="text-stone-600">Payment</span>
        </p>
        <h1 className="text-2xl md:text-3xl font-semibold text-stone-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Paystack */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5 text-rose-500" strokeWidth={2} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-stone-800">Secure payment with Paystack</p>
                  <p className="text-xs text-stone-400">
                    You'll be taken to Paystack to pay, then brought straight back here.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                <div className="flex items-center gap-3 border border-stone-200 rounded-xl p-4">
                  <CreditCard className="w-5 h-5 text-stone-400" strokeWidth={2} />
                  <div>
                    <p className="text-sm font-semibold text-stone-800">Card</p>
                    <p className="text-xs text-stone-400">Visa, Mastercard, Verve</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 border border-stone-200 rounded-xl p-4">
                  <Building2 className="w-5 h-5 text-stone-400" strokeWidth={2} />
                  <div>
                    <p className="text-sm font-semibold text-stone-800">Bank transfer</p>
                    <p className="text-xs text-stone-400">Pay from any Nigerian bank</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-stone-50 rounded-xl p-3">
                <ShieldCheck className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" strokeWidth={2} />
                <p className="text-xs text-stone-400">
                  Your card details are entered on Paystack and never touch our servers. Your
                  order is only placed once Paystack confirms the payment.
                </p>
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div className="bg-white rounded-2xl shadow-sm p-6 h-fit">
            <h2 className="text-lg font-semibold text-stone-900 mb-4">Order Summary</h2>

            {shipping && (
              <div className="flex items-start justify-between gap-3 bg-stone-50 rounded-xl p-3 mb-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-stone-700">Your address</p>
                  <p className="text-xs text-stone-400 truncate">{shipping.address}</p>
                </div>
                <Link
                  to="/checkout/shipping"
                  className="text-xs font-medium text-rose-500 hover:text-rose-600 shrink-0"
                >
                  Edit
                </Link>
              </div>
            )}

            <div className="flex flex-col gap-3 pb-4 border-b border-stone-100 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.lineId} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-stone-100 shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-stone-700 truncate">{item.name}</p>
                    <p className="text-xs text-stone-400">Qty {item.quantity}</p>
                  </div>
                  <p className="text-xs font-semibold text-stone-800">
                    ₦{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2 text-sm text-stone-500 py-4 border-b border-stone-100">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-stone-800 font-medium">₦{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>Arranged with supplier</span>
              </div>
            </div>

            <div className="flex justify-between items-center py-4">
              <span className="text-sm font-semibold text-stone-800">Total</span>
              <span className="text-lg font-bold text-stone-900">₦{total.toFixed(2)}</span>
            </div>

            {error && <p className="text-xs text-rose-500 mb-3">{error}</p>}
            <button
              type="button"
              onClick={handlePay}
              disabled={starting}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-full text-sm transition-colors disabled:opacity-60"
            >
              {starting ? "Redirecting to Paystack..." : `Pay ₦${total.toFixed(2)} with Paystack`}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
