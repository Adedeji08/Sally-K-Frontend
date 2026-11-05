import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Info, Mail, MapPin, Phone, Store } from "lucide-react";
import Navbar from "../../layouts/navbar";
import { useAuth } from "../../context/auth-context";
import { useCart } from "../../context/cart-context";
import type { CartItem, CartSupplier } from "../../context/cart-context";
import { useCheckout } from "../../context/checkout-context";

const fieldClass =
  "w-full rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-700 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all";

interface SupplierGroup {
  supplier: CartSupplier;
  items: CartItem[];
}

export default function Shipping() {
  const navigate = useNavigate();
  const { isAuthenticated, user, openLoginModal } = useAuth();
  const { items, subtotal, loaded: cartLoaded } = useCart();
  const { shipping, setShipping } = useCheckout();

  const [address, setAddress] = useState(shipping?.address ?? user?.address ?? "");
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

  // One card per supplier, listing which of the bag's items they're sending.
  const suppliers = useMemo(() => {
    const groups = new Map<string, SupplierGroup>();
    for (const item of items) {
      if (!item.supplier) continue;
      const group = groups.get(item.supplier.id);
      if (group) group.items.push(item);
      else groups.set(item.supplier.id, { supplier: item.supplier, items: [item] });
    }
    return Array.from(groups.values());
  }, [items]);

  if (!isAuthenticated || items.length === 0) return null;

  const handleContinue = () => {
    if (!address.trim()) {
      setError("Please enter your address.");
      return;
    }
    setShipping({ address: address.trim() });
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
          <span className="text-stone-600">Details</span>
        </p>
        <h1 className="text-2xl md:text-3xl font-semibold text-stone-900 mb-8">Your Details</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Address */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <label className="text-sm font-medium text-stone-700 mb-1.5 block">Address</label>
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

            {/* How delivery works */}
            <div className="flex items-start gap-3 bg-rose-50 border border-rose-100 rounded-2xl p-5">
              <span className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0">
                <Info className="w-4 h-4 text-rose-500" strokeWidth={2} />
              </span>
              <div>
                <p className="text-sm font-semibold text-stone-800 mb-1">
                  Delivery is arranged between you and your supplier
                </p>
                <p className="text-sm text-stone-600 leading-relaxed">
                  Once your order is placed, your supplier will reach out to you to agree on
                  delivery, including timing and any delivery cost. You can also contact them
                  directly using the details below.
                </p>
              </div>
            </div>

            {/* Supplier contact cards */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <p className="text-sm font-semibold text-stone-800 mb-4">
                {suppliers.length === 1 ? "Your supplier" : "Your suppliers"}
              </p>

              {suppliers.length === 0 ? (
                <p className="text-sm text-stone-400">Loading supplier details...</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {suppliers.map(({ supplier, items: supplierItems }) => (
                    <div key={supplier.id} className="border border-stone-200 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                          <Store className="w-4 h-4 text-rose-500" strokeWidth={2} />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-stone-800 truncate">
                            {supplier.brandName}
                          </p>
                          <p className="text-xs text-stone-400 truncate">
                            For: {supplierItems.map((item) => item.name).join(", ")}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
                        <p className="flex items-center gap-2 text-stone-700 min-w-0">
                          <span className="text-xs text-stone-400 w-12 shrink-0">Name</span>
                          <span className="truncate">{supplier.contactName}</span>
                        </p>
                        <a
                          href={`tel:${supplier.phone}`}
                          className="flex items-center gap-2 text-stone-700 hover:text-rose-500 transition-colors min-w-0"
                        >
                          <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" strokeWidth={2} />
                          <span className="truncate">{supplier.phone}</span>
                        </a>
                        <a
                          href={`mailto:${supplier.email}`}
                          className="flex items-center gap-2 text-stone-700 hover:text-rose-500 transition-colors min-w-0"
                        >
                          <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" strokeWidth={2} />
                          <span className="truncate">{supplier.email}</span>
                        </a>
                        <p className="flex items-start gap-2 text-stone-700 min-w-0 sm:col-span-2">
                          <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" strokeWidth={2} />
                          <span>
                            {supplier.address ?? (
                              <span className="text-stone-400">Address not provided yet</span>
                            )}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
              <div className="flex justify-between gap-4">
                <span>Delivery</span>
                <span className="text-right">Arranged with supplier</span>
              </div>
            </div>
            <div className="flex justify-between items-center py-4">
              <span className="text-sm font-semibold text-stone-800">Total</span>
              <span className="text-lg font-bold text-stone-900">₦{subtotal.toFixed(2)}</span>
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
