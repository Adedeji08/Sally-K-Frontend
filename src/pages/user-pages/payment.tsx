import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import {
  Banknote,
  Building2,
  CheckCircle2,
  Copy,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import Navbar from "../../layouts/navbar";
import { useAuth } from "../../context/auth-context";
import { useCart } from "../../context/cart-context";
import { DELIVERY_OPTIONS, useCheckout } from "../../context/checkout-context";
import { useOrders } from "../../context/order-context";

type PaymentMethod = "card" | "transfer";

interface CardFormValues {
  cardNumber: string;
  expiry: string;
  cvc: string;
  cardholderName: string;
}

const BANK_DETAILS = {
  bankName: "Providus Bank",
  accountName: "Sally-K Fashion Affairs Ltd",
  accountNumber: "0123456789",
};

const fieldClass =
  "w-full rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-700 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all";

function CopyableRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(value).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-stone-100 last:border-0">
      <div>
        <p className="text-xs text-stone-400">{label}</p>
        <p className="text-sm font-semibold text-stone-800">{value}</p>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="flex items-center gap-1 text-xs font-medium text-rose-500 hover:text-rose-600 transition-colors"
      >
        <Copy className="w-3.5 h-3.5" strokeWidth={2} />
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

export default function Payment() {
  const navigate = useNavigate();
  const { isAuthenticated, openLoginModal } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const { shipping, clearShipping } = useCheckout();
  const { addOrder } = useOrders();
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState("");
  const { control, handleSubmit } = useForm<CardFormValues>();

  useEffect(() => {
    if (!isAuthenticated) {
      openLoginModal("Sign in to complete your order.");
      navigate("/cart", { replace: true });
    }
  }, [isAuthenticated, navigate, openLoginModal]);

  useEffect(() => {
    if (!orderPlaced && items.length === 0) {
      navigate("/cart", { replace: true });
    }
  }, [items.length, orderPlaced, navigate]);

  useEffect(() => {
    if (!orderPlaced && items.length > 0 && !shipping) {
      navigate("/checkout/shipping", { replace: true });
    }
  }, [shipping, items.length, orderPlaced, navigate]);

  const shippingFee = shipping ? DELIVERY_OPTIONS[shipping.deliveryMethod].fee : 0;
  const total = subtotal + shippingFee;

  const handlePaySuccess = () => {
    if (!shipping) return;
    const order = addOrder({
      items,
      subtotal,
      shippingFee,
      total,
      address: shipping.address,
      deliveryMethod: shipping.deliveryMethod,
      paymentMethod: method,
      paymentStatus: method === "transfer" ? "pending" : "paid",
    });
    setPlacedOrderId(order.id);
    clearCart();
    clearShipping();
    setOrderPlaced(true);
  };

  if (orderPlaced) {
    return (
      <>
        <Navbar />
        <main className="max-w-lg mx-auto px-6 py-20 text-center">
          <span className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-rose-500" strokeWidth={2} />
          </span>
          <h1 className="text-2xl font-semibold text-stone-900 mb-2">
            {method === "transfer" ? "Order received!" : "Payment successful!"}
          </h1>
          <p className="text-sm text-stone-500 mb-8">
            {method === "transfer"
              ? "Thanks — your order is pending until we confirm your bank transfer. We'll email you once it's verified."
              : "Your order has been placed. You'll receive a confirmation email shortly."}
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              to="/"
              className="inline-block bg-rose-500 hover:bg-rose-600 text-white font-semibold px-7 py-3 rounded-full text-sm transition-colors"
            >
              Continue shopping
            </Link>
            <Link
              to={`/orders/${placedOrderId}`}
              className="inline-block border border-stone-200 text-stone-700 font-semibold px-7 py-3 rounded-full text-sm hover:bg-stone-50 transition-colors"
            >
              View order
            </Link>
          </div>
        </main>
      </>
    );
  }

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
          {/* Payment form */}
          <div className="lg:col-span-2">
            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={() => setMethod("card")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border transition-colors ${
                  method === "card"
                    ? "border-rose-500 bg-rose-50 text-rose-600"
                    : "border-stone-200 text-stone-500 hover:border-stone-300"
                }`}
              >
                <CreditCard className="w-4 h-4" strokeWidth={2} />
                Pay with Card
              </button>
              <button
                type="button"
                onClick={() => setMethod("transfer")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border transition-colors ${
                  method === "transfer"
                    ? "border-rose-500 bg-rose-50 text-rose-600"
                    : "border-stone-200 text-stone-500 hover:border-stone-300"
                }`}
              >
                <Banknote className="w-4 h-4" strokeWidth={2} />
                Bank Transfer
              </button>
            </div>

            {method === "card" ? (
              <form
                id="card-payment-form"
                className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-4"
                onSubmit={handleSubmit(handlePaySuccess)}
              >
                <Controller
                  name="cardNumber"
                  control={control}
                  rules={{
                    required: "Card number is required",
                    pattern: {
                      value: /^[0-9\s]{16,19}$/,
                      message: "Enter a valid 16-digit card number",
                    },
                  }}
                  render={({ field, fieldState }) => (
                    <div>
                      <label className="text-sm font-medium text-stone-700 mb-1.5 block">
                        Card number
                      </label>
                      <input
                        {...field}
                        placeholder="1234 5678 9012 3456"
                        className={fieldClass}
                      />
                      {fieldState.error && (
                        <p className="text-xs text-rose-500 mt-1">{fieldState.error.message}</p>
                      )}
                    </div>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    name="expiry"
                    control={control}
                    rules={{
                      required: "Required",
                      pattern: { value: /^(0[1-9]|1[0-2])\/\d{2}$/, message: "MM/YY" },
                    }}
                    render={({ field, fieldState }) => (
                      <div>
                        <label className="text-sm font-medium text-stone-700 mb-1.5 block">
                          Expiry date
                        </label>
                        <input {...field} placeholder="MM/YY" className={fieldClass} />
                        {fieldState.error && (
                          <p className="text-xs text-rose-500 mt-1">{fieldState.error.message}</p>
                        )}
                      </div>
                    )}
                  />

                  <Controller
                    name="cvc"
                    control={control}
                    rules={{
                      required: "Required",
                      pattern: { value: /^[0-9]{3,4}$/, message: "3-4 digits" },
                    }}
                    render={({ field, fieldState }) => (
                      <div>
                        <label className="text-sm font-medium text-stone-700 mb-1.5 block">
                          CVC
                        </label>
                        <input {...field} placeholder="123" className={fieldClass} />
                        {fieldState.error && (
                          <p className="text-xs text-rose-500 mt-1">{fieldState.error.message}</p>
                        )}
                      </div>
                    )}
                  />
                </div>

                <Controller
                  name="cardholderName"
                  control={control}
                  rules={{ required: "Cardholder name is required" }}
                  render={({ field, fieldState }) => (
                    <div>
                      <label className="text-sm font-medium text-stone-700 mb-1.5 block">
                        Cardholder name
                      </label>
                      <input {...field} placeholder="Full name" className={fieldClass} />
                      {fieldState.error && (
                        <p className="text-xs text-rose-500 mt-1">{fieldState.error.message}</p>
                      )}
                    </div>
                  )}
                />

                <div className="flex items-start gap-2 bg-stone-50 rounded-xl p-3 mt-1">
                  <ShieldCheck className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" strokeWidth={2} />
                  <p className="text-xs text-stone-400">
                    Your payment information is encrypted and never stored on our servers.
                  </p>
                </div>
              </form>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-rose-500" strokeWidth={2} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-stone-800">Transfer to our account</p>
                    <p className="text-xs text-stone-400">
                      Use the details below, then confirm your transfer.
                    </p>
                  </div>
                </div>

                <div className="border border-stone-100 rounded-xl px-4">
                  <CopyableRow label="Bank name" value={BANK_DETAILS.bankName} />
                  <CopyableRow label="Account name" value={BANK_DETAILS.accountName} />
                  <CopyableRow label="Account number" value={BANK_DETAILS.accountNumber} />
                  <CopyableRow label="Amount" value={`$${total.toFixed(2)}`} />
                </div>

                <p className="text-xs text-stone-400 mt-4">
                  Transfer the exact amount above. Your order will show as pending until we confirm
                  receipt from the bank, usually within a few minutes.
                </p>
              </div>
            )}
          </div>

          {/* Order summary */}
          <div className="bg-white rounded-2xl shadow-sm p-6 h-fit">
            <h2 className="text-lg font-semibold text-stone-900 mb-4">Order Summary</h2>

            {shipping && (
              <div className="flex items-start justify-between gap-3 bg-stone-50 rounded-xl p-3 mb-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-stone-700">
                    {DELIVERY_OPTIONS[shipping.deliveryMethod].label}
                  </p>
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
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2 text-sm text-stone-500 py-4 border-b border-stone-100">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-stone-800 font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-stone-800 font-medium">${shippingFee.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center py-4">
              <span className="text-sm font-semibold text-stone-800">Total</span>
              <span className="text-lg font-bold text-stone-900">${total.toFixed(2)}</span>
            </div>

            {method === "card" ? (
              <button
                type="submit"
                form="card-payment-form"
                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-full text-sm transition-colors"
              >
                Pay ${total.toFixed(2)}
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePaySuccess}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-full text-sm transition-colors"
              >
                I've made the transfer
              </button>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
