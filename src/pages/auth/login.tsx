import { Link, useLocation, useNavigate } from "react-router-dom";
import { CircleCheck } from "lucide-react";
import AuthShell from "../../layouts/auth-shell";
import LoginForm from "../../components/auth/login-form";

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const passwordReset = Boolean(
    (location.state as { passwordReset?: boolean } | null)?.passwordReset
  );

  return (
    <AuthShell title="Welcome back, superhuman!">
      {passwordReset && (
        <div className="flex items-center gap-2 bg-[#EAF7EF] text-[#1E7B3E] text-[12px] font-medium rounded-xl px-4 py-3 mb-4">
          <CircleCheck className="w-4 h-4 shrink-0" strokeWidth={2} />
          Your password has been reset. Log in with your new password.
        </div>
      )}

      <p className="text-[13px] text-[#65799A] text-center mb-6">
        Log in to continue shopping or manage your storefront.
      </p>

      <LoginForm onSuccess={() => navigate("/")} />

      <div className="flex items-center justify-center mt-5">
        <label className="text-xs md:text-sm text-[#475467]">
          Don't have an account?{" "}
          <Link to="/signup" className="text-[#0867AC] hover:text-[#0867AC]">
            Sign Up
          </Link>
        </label>
      </div>
    </AuthShell>
  );
};

export default Login;
