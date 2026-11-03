import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { ClipLoader } from "react-spinners";
import { useOrders } from "../../context/order-context";
import { useToast } from "../../context/toast-context";
import type { OrderStatus } from "../../types/order";
import { ORDER_STATUS_META, orderNumber } from "../../types/order";

type FilterTab = "all" | OrderStatus;

const TABS: { value: FilterTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "FULFILLED", label: "Fulfilled" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function SellerOrders() {
  const toast = useToast();
  const { receivedOrders: orders, receivedOrdersLoaded, updateOrderStatus } = useOrders();
  const [tab, setTab] = useState<FilterTab>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filtered = useMemo(
    () => (tab === "all" ? orders : orders.filter((o) => o.status === tab)),
    [orders, tab]
  );

  const markFulfilled = async (id: string) => {
    setUpdatingId(id);
    const result = await updateOrderStatus(id, "FULFILLED");
    setUpdatingId(null);
    if (result.ok) toast.success("Order marked as fulfilled.");
    else toast.error(result.message);
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#121212] mb-1">Orders</h1>
      <p className="text-sm text-[#65799A] mb-6">View and fulfill incoming orders.</p>

      <div className="inline-flex items-center gap-1 bg-[#F2E8ED] rounded-full p-1 mb-6 max-w-full overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-colors shrink-0 ${
              tab === t.value ? "bg-[#ED1280] text-white" : "text-[#4a4a4a] hover:text-[#121212]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {!receivedOrdersLoaded ? (
        <div className="flex justify-center py-16">
          <ClipLoader size={28} color="#ED1280" />
        </div>
      ) : filtered.length === 0 ? (
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
            {filtered.map((order) => {
              const status = ORDER_STATUS_META[order.status];
              return (
                <div key={order.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4">
                  <Link to={`/seller/orders/${order.id}`} className="flex-1 min-w-[160px]">
                    <p className="text-[14px] font-semibold text-[#121212]">
                      {orderNumber(order.id)}
                      {order.buyer && (
                        <span className="font-normal text-[#65799A]"> · {order.buyer.fullName}</span>
                      )}
                    </p>
                    <p className="text-[12px] text-[#65799A]">
                      {new Date(order.createdAt).toLocaleDateString()} ·{" "}
                      {order.items.reduce((sum, i) => sum + i.quantity, 0)} item(s)
                    </p>
                  </Link>

                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${status.className}`}>
                    {status.label}
                  </span>

                  <p className="text-[14px] font-bold text-[#121212] w-24 text-right shrink-0">
                    ₦{order.subtotal.toFixed(2)}
                  </p>

                  {order.status === "PENDING" && (
                    <button
                      onClick={() => markFulfilled(order.id)}
                      disabled={updatingId === order.id}
                      className="text-[12px] font-semibold text-[#ED1280] hover:opacity-80 shrink-0 disabled:opacity-50"
                    >
                      {updatingId === order.id ? "Saving..." : "Mark Fulfilled"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
