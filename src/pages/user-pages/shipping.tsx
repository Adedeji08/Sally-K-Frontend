import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, Truck } from "lucide-react";
import Navbar from "../../layouts/navbar";
import { useAuth } from "../../context/auth-context";
import { useCart } from "../../context/cart-context";
import { DELIVERY_OPTIONS, useCheckout } from "../../context/checkout-context";
import type { DeliveryMethod } from "../../context/checkout-context";

const fieldClass =
  "w-full rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-700 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all";

export default function Shipping() {
  const navigate = useNavigate();
  const { isAuthenticated, user, openLoginModal } = useAuth();
  const { items, subtotal, loaded: cartLoaded } = useCart();
  const { shipping, setShipping } = useCheckout();

  const [address, setAddress] = useState(shipping?.address ?? user?.address ?? "");
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(
    shipping?.deliveryMethod ?? "standard"
  );
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      openLoginModal("Sign in to continue to checkout.");
      navigate("/cart", { replace: true });
    }
  }, [isAuthenticated, navigate, openLoginModal]);

  useEffect(() => {
    if (cartLoaded && items.length === 0) {
      navigate("/cart", { replace: true });
    }
  }, [cartLoaded, items.length, navigate]);

  if (!isAuthenticated || items.length === 0) return null;

  const shippingFee = DELIVERY_OPTIONS[deliveryMethod].fee;

  const handleContinue = () => {
    if (!address.trim()) {
      setError("Please enter a delivery address.");
      return;
    }
    setShipping({ address: address.trim(), deliveryMethod });
    navigate("/payment");
  };

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <p className="text-xs text-stone-400 mb-2">
          <Link to="/" className="hover:text-rose-500 transition-colors">
            Home
          </Link>{" "}
          / <Link to="/cart" className="hover:text-rose-500 transition-colors">Shopping Bag</Link> /{" "}
          <span className="text-stone-600">Shipping</span>
        </p>
        <h1 className="text-2xl md:text-3xl font-semibold text-stone-900 mb-8">
          Delivery Details
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Address + delivery method */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <label className="text-sm font-medium text-stone-700 mb-1.5 block">
                Delivery address
              </label>
              <textarea
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  setError("");
                }}
                rows={3}
                placeholder="Street address, city, state"
                className={fieldClass}
              />
              {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
              <p className="text-xs text-stone-400 mt-2">
                You can update your default address any time from your{" "}
                <Link to="/profile" className="text-rose-500 hover:text-rose-600">
                  profile settings
                </Link>
                .
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <p className="text-sm font-semibold text-stone-800 mb-3">Delivery method</p>
              <div className="flex flex-col sm:flex-row gap-3">
                {(Object.keys(DELIVERY_OPTIONS) as DeliveryMethod[]).map((key) => {
                  const option = DELIVERY_OPTIONS[key];
                  const active = deliveryMethod === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setDeliveryMethod(key)}
                      className={`flex-1 flex items-start gap-3 text-left border rounded-xl p-4 transition-colors ${
                        active
                          ? "border-rose-500 bg-rose-50"
                          : "border-stone-200 hover:border-stone-300"
                      }`}
                    >
                      <span className="mt-0.5">
                        {active ? (
                          <CheckCircle2 className="w-5 h-5 text-rose-500" strokeWidth={2} />
                        ) : (
                          <Truck className="w-5 h-5 text-stone-400" strokeWidth={2} />
                        )}
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-stone-800">
                          {option.label}
                        </span>
                        <span className="block text-xs text-stone-400 mt-0.5">{option.eta}</span>
                        <span className="block text-sm font-semibold text-stone-900 mt-1">
                          ₦{option.fee.toFixed(2)}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div className="bg-white rounded-2xl shadow-sm p-6 h-fit">
            <h2 className="text-lg font-semibold text-stone-900 mb-4">Order Summary</h2>
            <div className="flex flex-col gap-2 text-sm text-stone-500 pb-4 border-b border-stone-100">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-stone-800 font-medium">₦{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-stone-800 font-medium">₦{shippingFee.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center py-4">
              <span className="text-sm font-semibold text-stone-800">Total</span>
              <span className="text-lg font-bold text-stone-900">
                ₦{(subtotal + shippingFee).toFixed(2)}
              </span>
            </div>
            <button
              onClick={handleContinue}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-full text-sm transition-colors"
            >
              Continue to Payment
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
