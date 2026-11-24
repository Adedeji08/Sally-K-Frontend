import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Award, Clock, Gem, Medal, Sparkles, Trophy } from "lucide-react";
import { ClipLoader } from "react-spinners";
import Navbar from "../../layouts/navbar";
import { useAuth } from "../../context/auth-context";
import useRewards from "../../hooks/use-rewards";
import { orderNumber } from "../../types/order";
import type { RewardTierName, RewardTransaction } from "../../types/rewards";
import { TIER_ORDER, pointsToNaira, tierLabel } from "../../types/rewards";

const TIER_STYLES: Record<RewardTierName, { icon: typeof Medal; bg: string; text: string }> = {
  BRONZE: { icon: Medal, bg: "bg-orange-100", text: "text-orange-700" },
  SILVER: { icon: Award, bg: "bg-stone-200", text: "text-stone-600" },
  GOLD: { icon: Trophy, bg: "bg-yellow-100", text: "text-yellow-700" },
  PLATINUM: { icon: Gem, bg: "bg-rose-100", text: "text-rose-600" },
};

const naira = (n: number) =>
  `₦${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

function HistoryRow({ tx }: { tx: RewardTransaction }) {
  const pending = tx.status === "PENDING";
  const positive = tx.points > 0;
  const body = (
    <>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-stone-800 truncate">
          {tx.description}
          {tx.orderId && <span className="font-normal text-stone-400"> · {orderNumber(tx.orderId)}</span>}
        </p>
        <p className="text-xs text-stone-400">
          {shortDate(tx.createdAt)}
          {pending && tx.availableAt && <> · spendable from {shortDate(tx.availableAt)}</>}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className={`text-sm font-bold ${positive ? "text-rose-500" : "text-stone-700"}`}>
          {positive ? "+" : ""}
          {tx.points.toLocaleString()} pts
        </p>
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            pending ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {pending ? "Pending" : tx.type === "REDEEM" ? "Redeemed" : "Available"}
        </span>
      </div>
    </>
  );
  const className =
    "flex items-center justify-between gap-4 bg-white rounded-2xl shadow-sm p-4";
  return tx.orderId ? (
    <Link to={`/orders/${tx.orderId}`} className={`${className} hover:shadow-md transition-shadow`}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

export default function Rewards() {
  const navigate = useNavigate();
  const { isAuthenticated, openLoginModal } = useAuth();
  const { rewards, loaded, error } = useRewards(isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      openLoginModal("Sign in to view your rewards.");
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate, openLoginModal]);

  if (!isAuthenticated) return null;

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

        {!loaded ? (
          <div className="flex justify-center py-20">
            <ClipLoader size={28} color="#f43f5e" />
          </div>
        ) : !rewards ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <p className="text-sm text-stone-500">{error || "Couldn't load your rewards."}</p>
          </div>
        ) : (
          <RewardsBody rewards={rewards} />
        )}
      </main>
    </>
  );
}

function RewardsBody({ rewards }: { rewards: NonNullable<ReturnType<typeof useRewards>["rewards"]> }) {
  const { tier, nextTier, ordersLast12Months, points, redemption, history } = rewards;
  const CurrentIcon = TIER_STYLES[tier].icon;
  const currentIndex = TIER_ORDER.indexOf(tier);
  const progress = nextTier
    ? Math.round((ordersLast12Months / (ordersLast12Months + nextTier.ordersNeeded)) * 100)
    : 100;
  const pointsToMin = Math.max(0, redemption.minPoints - points.available);

  return (
    <>
      {/* Tier + balance */}
      <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <span
            className={`w-20 h-20 rounded-full flex items-center justify-center shrink-0 ${TIER_STYLES[tier].bg}`}
          >
            <CurrentIcon className={`w-10 h-10 ${TIER_STYLES[tier].text}`} strokeWidth={2} />
          </span>
          <div className="flex-1 w-full">
            <p className="text-sm text-stone-400">You're a</p>
            <h2 className="text-2xl font-bold text-stone-900 mb-1">{tierLabel(tier)} Member</h2>
            <p className="text-3xl font-bold text-rose-500">
              {points.available.toLocaleString()}{" "}
              <span className="text-sm font-medium text-stone-400">points available</span>
            </p>
            <p className="text-sm text-stone-500 mb-4">
              Worth {naira(pointsToNaira(points.available, redemption))} off your next order
            </p>

            {points.pending > 0 && (
              <p className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 rounded-full px-3 py-1 mb-4">
                <Clock className="w-3.5 h-3.5" strokeWidth={2} />
                {points.pending.toLocaleString()} points pending
              </p>
            )}

            {nextTier ? (
              <>
                <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden mb-2">
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-stone-400">
                  {nextTier.ordersNeeded} more completed order{nextTier.ordersNeeded === 1 ? "" : "s"} to{" "}
                  {tierLabel(nextTier.tier)}
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
        <h2 className="text-sm font-semibold text-stone-800 mb-1">Membership tiers</h2>
        <p className="text-xs text-stone-400 mb-5">
          Based on your completed orders in the last 12 months ({ordersLast12Months} so far).
        </p>
        <div className="grid grid-cols-4 gap-2">
          {TIER_ORDER.map((name, i) => {
            const TierIcon = TIER_STYLES[name].icon;
            const achieved = i <= currentIndex;
            return (
              <div key={name} className="flex flex-col items-center text-center">
                <span
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                    achieved ? TIER_STYLES[name].bg : "bg-stone-100"
                  } ${name === tier ? "ring-2 ring-rose-300 ring-offset-2" : ""}`}
                >
                  <TierIcon
                    className={`w-5 h-5 ${achieved ? TIER_STYLES[name].text : "text-stone-300"}`}
                    strokeWidth={2}
                  />
                </span>
                <p className={`text-xs font-semibold ${achieved ? "text-stone-800" : "text-stone-400"}`}>
                  {tierLabel(name)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* How it works — numbers from the API */}
      <div className="bg-rose-50 rounded-2xl p-5 mb-6 text-sm text-rose-700 flex flex-col gap-1.5">
        <p className="font-semibold">How rewards work</p>
        <p>• You earn points when your supplier marks your order as fulfilled.</p>
        <p>• New points are pending for a few days, then become available to spend.</p>
        <p>
          • Redeem from {redemption.minPoints.toLocaleString()} points at checkout (
          {redemption.minPoints.toLocaleString()} points ={" "}
          {naira(pointsToNaira(redemption.minPoints, redemption))}), and points can cover up to{" "}
          {Math.round(redemption.maxPercentOfOrder * 100)}% of an order.
        </p>
        {pointsToMin > 0 && (
          <p className="font-medium">
            {pointsToMin.toLocaleString()} more points until you can redeem.
          </p>
        )}
      </div>

      {/* History */}
      <div>
        <h2 className="text-lg font-semibold text-stone-900 mb-4">Points history</h2>
        {history.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <p className="text-sm text-stone-500 mb-4">
              Complete your first order to start earning rewards!
            </p>
            <Link
              to="/shop"
              className="inline-block bg-rose-500 hover:bg-rose-600 text-white font-semibold px-6 py-2.5 rounded-full text-sm transition-colors"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {history.map((tx) => (
              <HistoryRow key={tx.id} tx={tx} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
