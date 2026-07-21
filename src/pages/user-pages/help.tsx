import { useState } from "react";
import type { ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { ChevronDown, LifeBuoy, MessageCircle } from "lucide-react";
import Navbar from "../../layouts/navbar";
import { useAuth } from "../../context/auth-context";
import { useOrders } from "../../context/order-context";
import { useSupport } from "../../context/support-context";
import type { TicketCategory } from "../../context/support-context";

interface FaqItem {
  question: string;
  answer: ReactNode;
}

const FAQS: FaqItem[] = [
  {
    question: "How do I track my order?",
    answer: (
      <>
        Go to{" "}
        <Link to="/orders" className="text-rose-500 hover:text-rose-600 font-medium">
          My Orders
        </Link>{" "}
        and open any order to see its live delivery status — Processing, Shipped, Out for
        Delivery, or Delivered.
      </>
    ),
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept major debit/credit cards and direct bank transfer. You'll choose your method at checkout.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Standard delivery takes 3-5 business days. Express delivery takes 1-2 business days. You can pick either option at checkout.",
  },
  {
    question: "Can I return or exchange an item?",
    answer:
      "Most items can be returned within 7 days of delivery if unworn and in original packaging. Contact us below with your order number to start a return.",
  },
  {
    question: "How do rewards points work?",
    answer: (
      <>
        You earn 10 points for every ₦1 you spend, and your tier automatically upgrades as you
        earn more. Check your balance on the{" "}
        <Link to="/rewards" className="text-rose-500 hover:text-rose-600 font-medium">
          Rewards
        </Link>{" "}
        page.
      </>
    ),
  },
  {
    question: "Is my payment information secure?",
    answer:
      "Yes. All payment data is encrypted in transit and we never store your card details on our servers.",
  },
  {
    question: "How do I become a seller on Sally-K?",
    answer: (
      <>
        Sign up as a designer/seller from our{" "}
        <Link to="/signup/seller" className="text-rose-500 hover:text-rose-600 font-medium">
          seller signup page
        </Link>{" "}
        — you'll set up your storefront and can start listing products after a quick
        verification step.
      </>
    ),
  },
  {
    question: "I forgot my password. What do I do?",
    answer: (
      <>
        Head to the{" "}
        <Link to="/forgot-password" className="text-rose-500 hover:text-rose-600 font-medium">
          forgot password
        </Link>{" "}
        page and we'll send you a reset link.
      </>
    ),
  },
];

const CATEGORY_OPTIONS: { value: TicketCategory; label: string }[] = [
  { value: "order", label: "Order issue" },
  { value: "payment", label: "Payment issue" },
  { value: "product", label: "Product question" },
  { value: "other", label: "Something else" },
];

interface TicketFormValues {
  category: TicketCategory;
  orderId: string;
  subject: string;
  message: string;
}

const fieldClass =
  "w-full rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-700 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all";

export default function Help() {
  const [searchParams] = useSearchParams();
  const prefilledOrderId = searchParams.get("order") ?? "";
  const { isAuthenticated, openLoginModal } = useAuth();
  const { orders } = useOrders();
  const { tickets, addTicket } = useSupport();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const { control, handleSubmit, reset } = useForm<TicketFormValues>({
    defaultValues: {
      category: prefilledOrderId ? "order" : "other",
      orderId: prefilledOrderId,
      subject: "",
      message: "",
    },
  });

  const onSubmit = (values: TicketFormValues) => {
    addTicket({
      category: values.category,
      subject: values.subject,
      message: values.message,
      orderId: values.orderId || undefined,
    });
    reset({ category: "other", orderId: "", subject: "", message: "" });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="text-center mb-10">
          <span className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
            <LifeBuoy className="w-7 h-7 text-rose-500" strokeWidth={2} />
          </span>
          <h1 className="text-2xl md:text-3xl font-semibold text-stone-900 mb-2">Help Center</h1>
          <p className="text-sm text-stone-400">
            Answers to common questions, or reach out to our support team directly.
          </p>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl shadow-sm divide-y divide-stone-100 mb-10">
          {FAQS.map((faq, index) => {
            const open = openFaq === index;
            return (
              <div key={faq.question}>
                <button
                  onClick={() => setOpenFaq(open ? null : index)}
                  className="w-full flex items-center justify-between gap-3 text-left px-5 py-4"
                >
                  <span className="text-sm font-semibold text-stone-800">{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-stone-400 shrink-0 transition-transform ${
                      open ? "rotate-180" : ""
                    }`}
                    strokeWidth={2}
                  />
                </button>
                {open && (
                  <div className="px-5 pb-4 text-sm text-stone-500 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contact form */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-10">
          <div className="flex items-center gap-2 mb-1">
            <MessageCircle className="w-4 h-4 text-rose-500" strokeWidth={2} />
            <h2 className="text-lg font-semibold text-stone-900">Contact support</h2>
          </div>
          <p className="text-sm text-stone-400 mb-5">
            Can't find your answer? Send us a message and we'll get back to you.
          </p>

          {!isAuthenticated ? (
            <div className="flex items-center justify-between gap-3 flex-wrap bg-stone-50 rounded-xl p-4">
              <p className="text-sm text-stone-500">Sign in to contact our support team.</p>
              <button
                type="button"
                onClick={() => openLoginModal("Sign in to contact support.")}
                className="bg-rose-500 hover:bg-rose-600 text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-colors"
              >
                Sign in
              </button>
            </div>
          ) : (
            <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
              {submitted && (
                <div className="text-sm font-medium text-emerald-600 bg-emerald-50 rounded-xl px-4 py-3">
                  Thanks — your message has been sent. We'll get back to you soon.
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="text-sm font-medium text-stone-700 mb-1.5 block">
                        Category
                      </label>
                      <select {...field} className={fieldClass}>
                        {CATEGORY_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                />

                <Controller
                  name="orderId"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="text-sm font-medium text-stone-700 mb-1.5 block">
                        Related order (optional)
                      </label>
                      <select {...field} className={fieldClass}>
                        <option value="">Not related to an order</option>
                        {orders.map((order) => (
                          <option key={order.id} value={order.id}>
                            {order.id}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                />
              </div>

              <Controller
                name="subject"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <div>
                    <label className="text-sm font-medium text-stone-700 mb-1.5 block">
                      Subject
                    </label>
                    <input
                      {...field}
                      placeholder="A short summary of your issue"
                      className={fieldClass}
                    />
                  </div>
                )}
              />

              <Controller
                name="message"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <div>
                    <label className="text-sm font-medium text-stone-700 mb-1.5 block">
                      Message
                    </label>
                    <textarea
                      {...field}
                      rows={4}
                      placeholder="Tell us what's going on..."
                      className={fieldClass}
                    />
                  </div>
                )}
              />

              <button
                type="submit"
                className="bg-rose-500 hover:bg-rose-600 text-white font-semibold px-6 py-3 rounded-full text-sm transition-colors self-start"
              >
                Send message
              </button>
            </form>
          )}
        </div>

        {/* My tickets */}
        {isAuthenticated && tickets.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-stone-900 mb-4">My support tickets</h2>
            <div className="flex flex-col gap-3">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="bg-white rounded-2xl shadow-sm p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <p className="text-sm font-semibold text-stone-800">{ticket.subject}</p>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-600 capitalize">
                      {ticket.status}
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 mb-2">
                    {CATEGORY_OPTIONS.find((c) => c.value === ticket.category)?.label}
                    {ticket.orderId && ` · ${ticket.orderId}`}
                    {" · "}
                    {new Date(ticket.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-stone-500">{ticket.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
