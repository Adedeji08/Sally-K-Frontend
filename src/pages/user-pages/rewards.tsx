import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Award, Gem, Medal, Sparkles, Trophy } from "lucide-react";
import Navbar from "../../layouts/navbar";
import { useAuth } from "../../context/auth-context";
import { useOrders } from "../../context/order-context";
import { REWARD_TIERS, getPointsForOrder, getRewardsSummary } from "../../utils/rewards";

const TIER_STYLES: Record<string, { icon: typeof Medal; bg: string; text: string }> = {
  Bronze: { icon: Medal, bg: "bg-orange-100", text: "text-orange-700" },
  Silver: { icon: Award, bg: "bg-stone-200", text: "text-stone-600" },
  Gold: { icon: Trophy, bg: "bg-yellow-100", text: "text-yellow-700" },
  Platinum: { icon: Gem, bg: "bg-rose-100", text: "text-rose-600" },
};

export default function Rewards() {
  const navigate = useNavigate();
  const { isAuthenticated, openLoginModal } = useAuth();
  const { orders } = useOrders();

  useEffect(() => {
    if (!isAuthenticated) {
      openLoginModal("Sign in to view your rewards.");
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate, openLoginModal]);

  if (!isAuthenticated) return null;

  const { points, currentTier, nextTier, progress, pointsToNextTier } = getRewardsSummary(orders);
  const CurrentIcon = TIER_STYLES[currentTier.name].icon;

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-8">
        <p className="text-xs text-stone-400 mb-2">
          <Link to="/" className="hover:text-rose-500 transition-colors">
            Home
          </Link>{" "}
          / <span className="text-stone-600">Rewards</span>
        </p>
        <h1 className="text-2xl md:text-3xl font-semibold text-stone-900 mb-8">My Rewards</h1>

        {/* Tier + points card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <span
              className={`w-20 h-20 rounded-full flex items-center justify-center shrink-0 ${TIER_STYLES[currentTier.name].bg}`}
            >
              <CurrentIcon className={`w-10 h-10 ${TIER_STYLES[currentTier.name].text}`} strokeWidth={2} />
            </span>
            <div className="flex-1 w-full">
              <p className="text-sm text-stone-400">You're a</p>
              <h2 className="text-2xl font-bold text-stone-900 mb-1">{currentTier.name} Member</h2>
              <p className="text-3xl font-bold text-rose-500 mb-4">
                {points.toLocaleString()} <span className="text-sm font-medium text-stone-400">points</span>
              </p>

              {nextTier ? (
                <>
                  <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden mb-2">
                    <div
                      className="h-full bg-rose-500 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-stone-400">
                    {pointsToNextTier.toLocaleString()} points to {nextTier.name}
                  </p>
                </>
              ) : (
                <p className="text-xs text-stone-400 flex items-center gap-1.5 justify-center sm:justify-start">
                  <Sparkles className="w-3.5 h-3.5 text-rose-400" strokeWidth={2} />
                  You've reached our top tier!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Tier ladder */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-sm font-semibold text-stone-800 mb-5">Membership tiers</h2>
          <div className="grid grid-cols-4 gap-2">
            {REWARD_TIERS.map((tier) => {
              const TierIcon = TIER_STYLES[tier.name].icon;
              const achieved = points >= tier.minPoints;
              return (
                <div key={tier.name} className="flex flex-col items-center text-center">
                  <span
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                      achieved ? TIER_STYLES[tier.name].bg : "bg-stone-100"
                    }`}
                  >
                    <TierIcon
                      className={`w-5 h-5 ${achieved ? TIER_STYLES[tier.name].text : "text-stone-300"}`}
                      strokeWidth={2}
                    />
                  </span>
                  <p className={`text-xs font-semibold ${achieved ? "text-stone-800" : "text-stone-400"}`}>
                    {tier.name}
                  </p>
                  <p className="text-[10px] text-stone-400">{tier.minPoints.toLocaleString()}+</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* How it works */}
        <div className="bg-rose-50 rounded-2xl p-5 mb-6">
          <p className="text-sm text-rose-700">
            <span className="font-semibold">How you earn points:</span> you get 10 points for
            every ₦1 you spend. Points are calculated automatically from your order history and
            your tier upgrades as your total grows.
          </p>
        </div>

        {/* Points history */}
        <div>
          <h2 className="text-lg font-semibold text-stone-900 mb-4">Points history</h2>
          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <p className="text-sm text-stone-500 mb-4">
                Place your first order to start earning rewards!
              </p>
              <Link
                to="/"
                className="inline-block bg-rose-500 hover:bg-rose-600 text-white font-semibold px-6 py-2.5 rounded-full text-sm transition-colors"
              >
                Start shopping
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="flex items-center justify-between bg-white rounded-2xl shadow-sm p-4 hover:shadow-md transition-shadow"
                >
                  <div>
                    <p className="text-sm font-semibold text-stone-800">{order.id}</p>
                    <p className="text-xs text-stone-400">
                      {new Date(order.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      · ₦{order.total.toFixed(2)}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-rose-500">
                    +{getPointsForOrder(order).toLocaleString()} pts
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
