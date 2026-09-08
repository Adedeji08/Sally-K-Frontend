import { useEffect, useState } from "react";
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import {
  Banknote,
  BadgeCheck,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ShoppingBag,
  Store,
  X,
} from "lucide-react";
import { useAuth } from "../context/auth-context";
import { useCurrentUser } from "../context/current-user-context";
import { useSeller } from "../context/seller-context";

const NAV_ITEMS = [
  { to: "/seller/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/seller/products", label: "Products", icon: Package },
  { to: "/seller/orders", label: "Orders", icon: ShoppingBag },
  { to: "/seller/store-profile", label: "Store Profile", icon: Store },
  { to: "/seller/subscription", label: "Subscription", icon: CreditCard },
  { to: "/seller/payouts", label: "Payouts", icon: Banknote },
];

const SellerLayout = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { currentUser } = useCurrentUser();
  const { isVerified, isSubscribed } = useSeller();
  const sellerProfile = currentUser?.sellerProfile ?? null;
  const brandName = sellerProfile?.brandName ?? user?.name ?? "Seller";
  const fullName = currentUser?.fullName ?? user?.name ?? "";
  const firstName = fullName.trim().split(/\s+/)[0] || "there";
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  if (!isAuthenticated || user?.role !== "seller") {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#F7F2F4] flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-0 left-0 h-screen w-[260px] bg-white border-r border-[#E7E1E4] z-50 flex flex-col transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-[#E7E1E4]">
          <Link to="/seller/dashboard" className="flex items-center gap-2 min-w-0">
            <span className="text-[16px] font-semibold text-[#1F1F1F] truncate">
              Welcome, {firstName}
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-[#65799A]"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
            const active = location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-colors ${
                  active
                    ? "bg-[#FDF1F7] text-[#ED1280]"
                    : "text-[#4a4a4a] hover:bg-[#F7F2F4]"
                }`}
              >
                <Icon className="w-[18px] h-[18px]" strokeWidth={2} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-3">
          <div className="bg-[#F7F2F4] rounded-xl p-3 mb-2 flex items-start gap-2.5">
            {sellerProfile?.logoUrl ? (
              <img
                src={sellerProfile.logoUrl}
                alt={`${brandName} logo`}
                className="w-9 h-9 rounded-lg object-cover border border-[#E7E1E4] shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-[#FDF1F7] text-[#ED1280] flex items-center justify-center text-[13px] font-semibold shrink-0">
                {brandName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
            <p className="text-[13px] font-semibold text-[#121212] truncate">
              {brandName}
            </p>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  isVerified ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                }`}
              >
                <BadgeCheck className="w-3 h-3" strokeWidth={2} />
                {isVerified ? "Verified" : "Unverified"}
              </span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  isSubscribed ? "bg-emerald-50 text-emerald-600" : "bg-stone-100 text-stone-500"
                }`}
              >
                {isSubscribed ? "Subscribed" : "No plan"}
              </span>
            </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[14px] font-medium text-rose-500 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-[18px] h-[18px]" strokeWidth={2} />
            Log out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="lg:hidden flex items-center justify-between bg-white border-b border-[#E7E1E4] px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-[#1F1F1F]"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" strokeWidth={2} />
          </button>
          <span className="text-[15px] font-semibold text-[#1F1F1F]">Seller Dashboard</span>
          <span className="w-6" />
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SellerLayout;
