import { useState } from "react";
import { Check, CircleCheck } from "lucide-react";
import { useSeller } from "../../context/seller-context";
import type { BillingCycle, SubscriptionPlanId } from "../../data/subscription-plans";
import { BILLING_OPTIONS, BILLING_SUFFIX, PLANS, getPlan } from "../../data/subscription-plans";

export default function SellerSubscription() {
  const { subscription, setSubscription } = useSeller();
  const [editing, setEditing] = useState(!subscription);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(
    subscription?.billingCycle ?? "monthly"
  );
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanId | null>(
    subscription?.planId ?? null
  );
  const [saved, setSaved] = useState(false);

  const currentPlan = subscription ? getPlan(subscription.planId) : undefined;

  const handleSave = () => {
    if (!selectedPlan) return;
    setSubscription({ planId: selectedPlan, billingCycle });
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#121212] mb-1">Subscription</h1>
      <p className="text-sm text-[#65799A] mb-6">
        Manage your Sally-K seller plan and billing cycle.
      </p>

      {saved && (
        <div className="flex items-center gap-2 bg-[#FDF1F7] text-[#ED1280] text-sm font-medium rounded-xl px-4 py-3 mb-6">
          <CircleCheck className="w-4 h-4 shrink-0" strokeWidth={2} />
          Your subscription has been updated.
        </div>
      )}

      {!editing && currentPlan && subscription ? (
        <div className="bg-white rounded-2xl shadow-sm p-6 max-w-md">
          <p className="text-[12px] font-semibold text-[#ED1280] uppercase tracking-wide mb-1">
            Current plan
          </p>
          <p className="text-[20px] font-bold text-[#121212]">{currentPlan.name}</p>
          <p className="text-[13px] text-[#65799A] mb-4">{currentPlan.tagline}</p>
          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-[28px] font-bold text-[#121212]">
              ₦{currentPlan.price[subscription.billingCycle]}
            </span>
            <span className="text-[13px] text-[#65799A]">
              {BILLING_SUFFIX[subscription.billingCycle]}
            </span>
          </div>
          <ul className="flex flex-col gap-2 mb-6">
            {currentPlan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-[13px] text-[#333333]">
                <Check className="w-4 h-4 text-[#ED1280] shrink-0 mt-0.5" strokeWidth={2} />
                {feature}
              </li>
            ))}
          </ul>
          <button
            onClick={() => setEditing(true)}
            className="bg-[#F2E8ED] hover:bg-[#EBDCE3] text-[#121212] font-semibold px-5 py-2.5 rounded-full text-sm transition-colors"
          >
            Change Plan
          </button>
        </div>
      ) : (
        <>
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-1 bg-[#F2E8ED] rounded-full p-1">
              {BILLING_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setBillingCycle(option.value)}
                  className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-colors ${
                    billingCycle === option.value
                      ? "bg-[#ED1280] text-white"
                      : "text-[#4a4a4a] hover:text-[#121212]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
            {PLANS.map((plan) => {
              const isSelected = selectedPlan === plan.id;
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`relative text-left flex flex-col gap-4 rounded-2xl border-2 p-5 transition-colors bg-white ${
                    isSelected
                      ? "border-[#ED1280] bg-[#FDF1F7]"
                      : "border-[#E7E1E4] hover:border-[#12121233]"
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-5 bg-[#ED1280] text-white text-[10px] font-bold uppercase tracking-wide px-3 py-1 rounded-full">
                      Most popular
                    </span>
                  )}

                  <div>
                    <p className="text-[16px] font-bold text-[#121212]">{plan.name}</p>
                    <p className="text-[12px] text-[#65799A] mt-0.5">{plan.tagline}</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-[28px] font-bold text-[#121212]">
                      ₦{plan.price[billingCycle]}
                    </span>
                    <span className="text-[13px] text-[#65799A]">
                      {BILLING_SUFFIX[billingCycle]}
                    </span>
                  </div>

                  <ul className="flex flex-col gap-2">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-[13px] text-[#333333]"
                      >
                        <Check className="w-4 h-4 text-[#ED1280] shrink-0 mt-0.5" strokeWidth={2} />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <span
                    className={`mt-auto text-center text-[13px] font-semibold rounded-xl py-2.5 transition-colors ${
                      isSelected ? "bg-[#ED1280] text-white" : "bg-[#F2E8ED] text-[#121212]"
                    }`}
                  >
                    {isSelected ? "Selected" : `Select ${plan.name}`}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={!selectedPlan}
              className="bg-[#ED1280] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-full text-sm transition-opacity"
            >
              {subscription ? "Save Plan" : "Subscribe"}
            </button>
            {subscription && (
              <button
                onClick={() => {
                  setSelectedPlan(subscription.planId);
                  setBillingCycle(subscription.billingCycle);
                  setEditing(false);
                }}
                className="text-sm font-semibold text-[#65799A] hover:text-[#121212]"
              >
                Cancel
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
