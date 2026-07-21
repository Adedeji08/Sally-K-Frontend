import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Banknote,
  Package,
  ShoppingBag,
  Clock,
} from "lucide-react";
import { useOrders } from "../../context/order-context";
import { useSeller } from "../../context/seller-context";
import { useSellerProducts } from "../../context/seller-product-context";
import SalesChart from "../../components/seller/sales-chart";
import type { SalesPeriod } from "../../utils/sales-series";
import { buildSalesSeries } from "../../utils/sales-series";

const PERIOD_OPTIONS: { value: SalesPeriod; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

export default function DashboardOverview() {
  const { orders } = useOrders();
  const { canSell, isVerified, isSubscribed } = useSeller();
  const { products } = useSellerProducts();
  const [period, setPeriod] = useState<SalesPeriod>("daily");

  const series = useMemo(() => buildSalesSeries(orders, period), [orders, period]);

  const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter((o) => !o.fulfilled).length;

  const kpis = [
    {
      label: "Total Sales",
      value: `₦${totalSales.toFixed(2)}`,
      icon: Banknote,
    },
    {
      label: "Total Orders",
      value: orders.length,
      icon: ShoppingBag,
    },
    {
      label: "Products Listed",
      value: products.length,
      icon: Package,
    },
    {
      label: "Pending Orders",
      value: pendingOrders,
      icon: Clock,
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#121212] mb-1">Overview</h1>
      <p className="text-sm text-[#65799A] mb-6">
        A quick look at how your store is performing.
      </p>

      {!canSell && (
        <div className="flex items-start gap-3 bg-[#FFF7ED] border border-[#FED7AA] rounded-xl p-4 mb-6">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" strokeWidth={2} />
          <div>
            <p className="text-[13px] font-semibold text-[#92400E]">
              Finish setup to start selling
            </p>
            <p className="text-[12px] text-[#92400E]/80 mt-0.5">
              You need {!isVerified && "business verification"}
              {!isVerified && !isSubscribed && " and "}
              {!isSubscribed && "an active subscription"} before you can publish products.
            </p>
            <div className="flex gap-3 mt-2">
              {!isVerified && (
                <Link
                  to="/onboarding/verification"
                  className="text-[12px] font-semibold text-[#ED1280] hover:opacity-80"
                >
                  Verify business →
                </Link>
              )}
              {!isSubscribed && (
                <Link
                  to="/seller/subscription"
                  className="text-[12px] font-semibold text-[#ED1280] hover:opacity-80"
                >
                  Choose a plan →
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl shadow-sm p-4">
            <span className="w-9 h-9 rounded-full bg-[#F2E8ED] flex items-center justify-center mb-3">
              <Icon className="w-4 h-4 text-[#ED1280]" strokeWidth={2} />
            </span>
            <p className="text-[20px] font-bold text-[#121212]">{value}</p>
            <p className="text-[12px] text-[#65799A] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <h2 className="text-[15px] font-semibold text-[#121212]">Sales</h2>
          <div className="inline-flex items-center gap-1 bg-[#F2E8ED] rounded-full p-1">
            {PERIOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setPeriod(option.value)}
                className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition-colors ${
                  period === option.value
                    ? "bg-[#ED1280] text-white"
                    : "text-[#4a4a4a] hover:text-[#121212]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <SalesChart data={series} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-semibold text-[#121212]">Recent Orders</h2>
          <Link
            to="/seller/orders"
            className="text-[12px] font-semibold text-[#ED1280] hover:opacity-80"
          >
            View all →
          </Link>
        </div>

        {orders.length === 0 ? (
          <p className="text-sm text-[#95959D] py-6 text-center">No orders yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-[#F2E8ED]">
            {orders.slice(0, 5).map((order) => (
              <Link
                key={order.id}
                to={`/seller/orders/${order.id}`}
                className="flex items-center justify-between py-3 hover:bg-[#FAFAFA] -mx-2 px-2 rounded-lg transition-colors"
              >
                <div>
                  <p className="text-[13px] font-semibold text-[#121212]">{order.id}</p>
                  <p className="text-[11px] text-[#95959D]">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      order.fulfilled
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {order.fulfilled ? "Fulfilled" : "Pending"}
                  </span>
                  <span className="text-[13px] font-bold text-[#121212]">
                    ₦{order.total.toFixed(2)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
