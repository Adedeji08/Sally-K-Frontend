import { useState } from "react";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AuthShell from "../../layouts/auth-shell";
import Button from "../../components/reusables/button";
import { useSeller } from "../../context/seller-context";
import type { BillingCycle, SubscriptionPlanId } from "../../data/subscription-plans";
import { BILLING_OPTIONS, BILLING_SUFFIX, PLANS } from "../../data/subscription-plans";

const Subscription = () => {
  const navigate = useNavigate();
  const { setSubscription } = useSeller();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanId | null>(null);

  const handleContinue = () => {
    if (!selectedPlan) return;
    setSubscription({ planId: selectedPlan, billingCycle });
    navigate("/seller/dashboard");
  };

  return (
    <AuthShell title="Choose your plan" wide>
      <p className="text-[13px] text-[#65799A] text-center mb-6">
        Pick a subscription that fits where your brand is today. You can upgrade or
        change plans anytime.
      </p>

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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {PLANS.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative text-left flex flex-col gap-4 rounded-2xl border-2 p-5 transition-colors ${
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
                  <li key={feature} className="flex items-start gap-2 text-[13px] text-[#333333]">
                    <Check className="w-4 h-4 text-[#ED1280] shrink-0 mt-0.5" strokeWidth={2} />
                    {feature}
                  </li>
                ))}
              </ul>

              <span
                className={`mt-auto text-center text-[13px] font-semibold rounded-xl py-2.5 transition-colors ${
                  isSelected
                    ? "bg-[#ED1280] text-white"
                    : "bg-[#F2E8ED] text-[#121212]"
                }`}
              >
                {isSelected ? "Selected" : `Select ${plan.name}`}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col items-center gap-3">
        <Button
          size="md"
          variant="primary"
          type="button"
          className="font-normal"
          disabled={!selectedPlan}
          onClick={handleContinue}
        >
          Continue
        </Button>
        <button
          type="button"
          onClick={() => navigate("/seller/dashboard")}
          className="text-[#0867AC] hover:text-[#35D081] font-normal text-sm text-center"
        >
          I'll subscribe later
        </button>
      </div>
    </AuthShell>
  );
};

export default Subscription;
