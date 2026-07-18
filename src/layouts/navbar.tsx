import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  Gift,
  Heart,
  LifeBuoy,
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { useAuth } from "../context/auth-context";
import { useCart } from "../context/cart-context";
import { useWishlist } from "../context/wishlist-context";

const NAV_LINKS = [
  { label: "New Arrivals", to: "/?tag=New" },
  { label: "Women", to: "/?category=Women" },
  { label: "Men", to: "/?category=Men" },
  { label: "Accessories", to: "/?category=Accessories" },
  { label: "Sale", to: "/?tag=Sale" },
];

const ACCOUNT_LINKS = [
  { to: "/profile", label: "Profile", icon: User },
  { to: "/orders", label: "My Orders", icon: Package },
  { to: "/rewards", label: "Rewards", icon: Gift },
  { to: "/help", label: "Help & Support", icon: LifeBuoy },
];

const Navbar = () => {
  const { isAuthenticated, user, logout, openLoginModal } = useAuth();
  const { totalItems } = useCart();
  const { productIds } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="relative z-30 w-full border-b border-[#E7E1E4] bg-[#F7F2F4] px-4 sm:px-6 md:px-10 py-4">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-2">
        {/* Left: Logo + Brand */}
        <Link to="/" className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="w-7 h-7 flex items-center justify-center shrink-0">
            <div className="relative w-5 h-5">
              <div className="absolute left-0 top-0 w-2 h-5 bg-black rounded-[1px]" />
              <div className="absolute left-0 bottom-0 w-5 h-2 bg-black rounded-[1px]" />
            </div>
          </div>
          <h1 className="text-[16px] sm:text-[18px] font-semibold text-[#1F1F1F] tracking-[-0.2px]">
            Sally-K
          </h1>
        </Link>

        {/* Center: Nav Links (desktop only) */}
        <nav className="hidden lg:flex items-center gap-12">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="text-[16px] font-medium text-[#2D2D2D] hover:text-black transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right: Sign In / Account + Search + Cart */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Auth controls: desktop only, moved into the mobile panel below lg */}
          <div className="hidden lg:flex items-center" ref={accountMenuRef}>
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setAccountMenuOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 text-[14px] font-medium text-[#1F1F1F] hover:text-black transition-colors px-2 py-2"
                  aria-expanded={accountMenuOpen}
                >
                  Hi, {user?.name}
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${accountMenuOpen ? "rotate-180" : ""}`}
                    strokeWidth={2}
                  />
                </button>

                {accountMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-lg border border-stone-100 overflow-hidden py-2">
                    {ACCOUNT_LINKS.map(({ to, label, icon: Icon }) => (
                      <Link
                        key={to}
                        to={to}
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                      >
                        <Icon className="w-4 h-4 text-stone-400" strokeWidth={2} />
                        {label}
                      </Link>
                    ))}
                    <div className="my-1 border-t border-stone-100" />
                    <button
                      onClick={() => {
                        logout();
                        setAccountMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" strokeWidth={2} />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openLoginModal("Log in to your account to continue shopping.")}
                className="px-6 py-3 rounded-2xl bg-[#E9E1E4] text-[#1F1F1F] text-[16px] font-semibold hover:bg-[#ddd4d8] transition-colors"
              >
                Sign In
              </button>
            )}
          </div>

          <button className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-[#E9E1E4] flex items-center justify-center hover:bg-[#ddd4d8] transition-colors shrink-0">
            <Search className="w-5 h-5 sm:w-6 sm:h-6 text-[#1F1F1F]" strokeWidth={2} />
          </button>

          <Link
            to="/wishlist"
            className="relative w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-[#E9E1E4] flex items-center justify-center hover:bg-[#ddd4d8] transition-colors shrink-0"
          >
            <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-[#1F1F1F]" strokeWidth={2} />
            {productIds.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-[#ED1280] text-white text-[11px] font-bold flex items-center justify-center">
                {productIds.length}
              </span>
            )}
          </Link>

          <Link
            to="/cart"
            className="relative w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-[#E9E1E4] flex items-center justify-center hover:bg-[#ddd4d8] transition-colors shrink-0"
          >
            <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-[#1F1F1F]" strokeWidth={2} />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-[#ED1280] text-white text-[11px] font-bold flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="lg:hidden w-11 h-11 rounded-2xl bg-[#E9E1E4] flex items-center justify-center hover:bg-[#ddd4d8] transition-colors shrink-0"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-[#1F1F1F]" strokeWidth={2} />
            ) : (
              <Menu className="w-5 h-5 text-[#1F1F1F]" strokeWidth={2} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile panel: nav links + auth controls */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute left-0 right-0 top-full bg-[#F7F2F4] border-b border-[#E7E1E4] px-4 sm:px-6 py-4 shadow-md max-h-[80vh] overflow-y-auto">
          <nav className="flex flex-col gap-1 mb-4">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={closeMobileMenu}
                className="text-[15px] font-medium text-[#2D2D2D] hover:text-black transition-colors py-2"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="pt-3 border-t border-[#E7E1E4]">
            {isAuthenticated ? (
              <div className="flex flex-col gap-1">
                <p className="text-[14px] font-semibold text-[#1F1F1F] px-1 py-2">
                  Hi, {user?.name}
                </p>
                {ACCOUNT_LINKS.map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={closeMobileMenu}
                    className="flex items-center gap-2.5 px-1 py-2 text-[14px] font-medium text-[#2D2D2D] hover:text-black transition-colors"
                  >
                    <Icon className="w-4 h-4 text-stone-400" strokeWidth={2} />
                    {label}
                  </Link>
                ))}
                <button
                  onClick={() => {
                    logout();
                    closeMobileMenu();
                  }}
                  className="flex items-center gap-2.5 px-1 py-2 text-[14px] font-medium text-rose-500 mt-1"
                >
                  <LogOut className="w-4 h-4" strokeWidth={2} />
                  Log out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  openLoginModal("Log in to your account to continue shopping.");
                  closeMobileMenu();
                }}
                className="w-full px-5 py-2.5 rounded-2xl bg-[#E9E1E4] text-[#1F1F1F] text-[14px] font-semibold hover:bg-[#ddd4d8] transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
