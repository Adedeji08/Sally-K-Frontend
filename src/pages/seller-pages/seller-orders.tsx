import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { useOrders } from "../../context/order-context";

type FilterTab = "all" | "pending" | "fulfilled";

const TABS: { value: FilterTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "fulfilled", label: "Fulfilled" },
];

export default function SellerOrders() {
  const { orders, markFulfilled } = useOrders();
  const [tab, setTab] = useState<FilterTab>("all");

  const filtered = useMemo(() => {
    if (tab === "pending") return orders.filter((o) => !o.fulfilled);
    if (tab === "fulfilled") return orders.filter((o) => o.fulfilled);
    return orders;
  }, [orders, tab]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#121212] mb-1">Orders</h1>
      <p className="text-sm text-[#65799A] mb-6">View and fulfill incoming orders.</p>

      <div className="inline-flex items-center gap-1 bg-[#F2E8ED] rounded-full p-1 mb-6">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-colors ${
              tab === t.value ? "bg-[#ED1280] text-white" : "text-[#4a4a4a] hover:text-[#121212]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm py-16 text-center">
          <span className="w-14 h-14 rounded-full bg-[#F2E8ED] flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-6 h-6 text-[#ED1280]" strokeWidth={2} />
          </span>
          <p className="text-[15px] font-semibold text-[#121212] mb-1">No orders here</p>
          <p className="text-sm text-[#65799A]">
            {tab === "all" ? "Orders will appear here once buyers start checking out." : "Nothing in this view yet."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex flex-col divide-y divide-[#F2E8ED]">
            {filtered.map((order) => (
              <div key={order.id} className="flex items-center gap-4 p-4">
                <Link to={`/seller/orders/${order.id}`} className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-[#121212]">{order.id}</p>
                  <p className="text-[12px] text-[#65799A]">
                    {new Date(order.createdAt).toLocaleDateString()} ·{" "}
                    {order.items.reduce((sum, i) => sum + i.quantity, 0)} item(s)
                  </p>
                </Link>

                <span
                  className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                    order.fulfilled
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-amber-50 text-amber-600"
                  }`}
                >
                  {order.fulfilled ? "Fulfilled" : "Pending"}
                </span>

                <p className="text-[14px] font-bold text-[#121212] w-20 text-right shrink-0">
                  ₦{order.total.toFixed(2)}
                </p>

                {!order.fulfilled && (
                  <button
                    onClick={() => markFulfilled(order.id)}
                    className="text-[12px] font-semibold text-[#ED1280] hover:opacity-80 shrink-0"
                  >
                    Mark Fulfilled
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
