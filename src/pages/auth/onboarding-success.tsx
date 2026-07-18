import { CircleCheck } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthShell from "../../layouts/auth-shell";
import Button from "../../components/reusables/button";

interface OnboardingState {
  role?: "shopper" | "seller";
  fullName?: string;
  brandName?: string;
}

const OnboardingSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as OnboardingState;
  const isSeller = state.role === "seller";

  return (
    <AuthShell
      title={isSeller ? "Storefront created" : "You're all set"}
      step={
        isSeller
          ? { current: 3, total: 3, labels: ["Account", "Store", "Verify"] }
          : undefined
      }
    >
      <div className="flex flex-col items-center text-center gap-3 mb-6">
        <span className="w-14 h-14 rounded-full bg-[#FDE6F1] flex items-center justify-center">
          <CircleCheck className="w-8 h-8 text-[#ED1280]" strokeWidth={2} />
        </span>
        <p className="text-[14px] text-[#65799A] max-w-[360px]">
          {isSeller
            ? `Welcome${
                state.brandName ? `, ${state.brandName}` : ""
              }! Your storefront is live. Verify your business to start listing products for sale.`
            : `Welcome${
                state.fullName ? `, ${state.fullName}` : ""
              }! Your account is ready — start exploring designer pieces.`}
        </p>
      </div>

      {isSeller ? (
        <div className="flex flex-col gap-3">
          <Button
            size="lg"
            variant="primary"
            type="button"
            className="font-normal"
            onClick={() => navigate("/onboarding/verification")}
          >
            Verify my business now
          </Button>
          <Button
            size="lg"
            variant="default"
            type="button"
            className="font-normal"
            onClick={() => navigate("/")}
          >
            Skip for now, go to dashboard
          </Button>
          <p className="text-[11px] text-[#95959D] text-center mt-1">
            You can explore your dashboard and set up your catalog anytime, but you
            won't be able to publish products for sale until verification is
            complete.
          </p>
        </div>
      ) : (
        <Button
          size="lg"
          variant="primary"
          type="button"
          className="font-normal"
          onClick={() => navigate("/")}
        >
          Start shopping
        </Button>
      )}
    </AuthShell>
  );
};

export default OnboardingSuccess;
