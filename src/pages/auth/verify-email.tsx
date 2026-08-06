import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import AuthShell from "../../layouts/auth-shell";
import OtpInput from "../../components/reusables/otp-input";
import Button from "../../components/reusables/button";
import { useAuth } from "../../context/auth-context";
import useRequest from "../../hooks/use-req";
import { useToast } from "../../context/toast-context";

const RESEND_COOLDOWN_SECONDS = 60;

interface VerifyEmailState {
  email?: string;
  redirectTo?: string;
  role?: string;
  full_name?: string;
}

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const toast = useToast();
  const state = (location.state as VerifyEmailState | null) ?? {};
  const email = state.email ?? user?.email ?? "";
  const redirectTo = state.redirectTo ?? "/";

  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  const { loading: verifying, makeRequest: verifyOtp } = useRequest("/auth/verify-email", "POST");
  const { loading: resending, makeRequest: resendOtp } = useRequest("/auth/resend-verification", "POST");

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = async () => {
    setOtpError("");

    if (otp.length < 4) {
      setOtpError("Enter the 4-digit code sent to your email.");
      return;
    }

    const toastId = toast.loading("Verifying code...");
    const [json, status] = await verifyOtp({ email, code: otp });

    if (status < 200 || status >= 300) {
      const message = json?.message || "That code is incorrect or has expired.";
      setOtpError(message);
      toast.update(toastId, "error", message);
      return;
    }

    updateProfile({ emailVerified: true });
    toast.update(toastId, "success", "Email verified!");
    navigate(redirectTo, {
      replace: true,
      state: { role: state.role, full_name: state.full_name, email },
    });
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setOtpError("");

    const toastId = toast.loading("Resending code...");
    const [json, status] = await resendOtp({ email });

    if (status < 200 || status >= 300) {
      toast.update(toastId, "error", json?.message || "Couldn't resend the code. Try again shortly.");
      return;
    }

    toast.update(toastId, "success", "A new code has been sent to your email.");
    setCooldown(RESEND_COOLDOWN_SECONDS);
  };

  return (
    <AuthShell title="Verify your email">
      <div className="flex flex-col items-center text-center gap-3 mb-6">
        <span className="w-14 h-14 rounded-full bg-[#FDE6F1] flex items-center justify-center">
          <ShieldCheck className="w-8 h-8 text-[#ED1280]" strokeWidth={2} />
        </span>
        <p className="text-[14px] text-[#65799A] max-w-[360px]">
          Enter the 4-digit code we sent to{" "}
          {email ? <span className="font-semibold text-[#1F1F1F]">{email}</span> : "your email"}{" "}
          to verify your account.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <OtpInput length={4} value={otp} onChange={setOtp} error={otpError} disabled={verifying} />

        <Button
          size="lg"
          variant="primary"
          type="button"
          disabled={verifying}
          className="font-normal mt-2"
          onClick={handleVerify}
        >
          {verifying ? "Verifying..." : "Verify email"}
        </Button>
      </div>

      <div className="flex flex-col items-center gap-1 mt-5">
        <label className="text-xs md:text-sm text-[#475467]">
          Didn't get a code?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || resending}
            className="text-[#0867AC] hover:text-[#0867AC] disabled:text-[#95959D] disabled:cursor-not-allowed"
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : resending ? "Resending..." : "Resend code"}
          </button>
        </label>
      </div>
    </AuthShell>
  );
};

export default VerifyEmail;
