import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Navbar from "../../layouts/navbar";
import { useCart } from "../../context/cart-context";

export default function Cart() {
  const navigate = useNavigate();
  const { items, subtotal, updateQuantity, removeItem } = useCart();

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <p className="text-xs text-stone-400 mb-2">
          <Link to="/" className="hover:text-rose-500 transition-colors">
            Home
          </Link>{" "}
          / <span className="text-stone-600">Shopping Bag</span>
        </p>
        <h1 className="text-2xl md:text-3xl font-semibold text-stone-900 mb-8">Shopping Bag</h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <span className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-7 h-7 text-stone-400" strokeWidth={2} />
            </span>
            <p className="text-lg font-semibold text-stone-800 mb-1">Your bag is empty</p>
            <p className="text-sm text-stone-400 mb-6">
              Looks like you haven't added anything to your bag yet.
            </p>
            <Link
              to="/"
              className="inline-block bg-rose-500 hover:bg-rose-600 text-white font-semibold px-7 py-3 rounded-full text-sm transition-colors"
            >
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {items.map((item) => (
                <div
                  key={item.lineId}
                  className="flex items-center gap-4 bg-white rounded-2xl shadow-sm p-4"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-stone-100 shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-stone-800 truncate">{item.name}</h3>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {[item.color, item.size].filter(Boolean).join(" · ") || "One Size"}
                    </p>
                    <p className="text-sm font-bold text-stone-900 mt-1">
                      ${item.price.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 border border-stone-200 rounded-full px-3 py-1.5">
                    <button
                      onClick={() => updateQuantity(item.lineId, item.quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5 text-stone-500" strokeWidth={2} />
                    </button>
                    <span className="text-sm font-semibold text-stone-800 w-4 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.lineId, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5 text-stone-500" strokeWidth={2} />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.lineId)}
                    className="text-stone-300 hover:text-rose-500 transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={2} />
                  </button>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-sm p-6 h-fit">
              <h2 className="text-lg font-semibold text-stone-900 mb-4">Order Summary</h2>
              <div className="flex flex-col gap-2 text-sm text-stone-500 pb-4 border-b border-stone-100">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-stone-800 font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Calculated at next step</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>Calculated at next step</span>
                </div>
              </div>
              <div className="flex justify-between items-center py-4">
                <span className="text-sm font-semibold text-stone-800">Total</span>
                <span className="text-lg font-bold text-stone-900">${subtotal.toFixed(2)}</span>
              </div>
              <button
                onClick={() => navigate("/checkout/shipping")}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-full text-sm transition-colors"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
