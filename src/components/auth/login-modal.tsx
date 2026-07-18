import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { useAuth } from "../../context/auth-context";
import LoginForm from "./login-form";

export default function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, loginModalReason } = useAuth();

  if (!isLoginModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4"
      onClick={closeLoginModal}
    >
      <div
        className="w-full max-w-[420px] bg-white rounded-3xl shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end">
          <button
            type="button"
            onClick={closeLoginModal}
            className="text-[#95959D] hover:text-[#1F1F1F] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        <h2 className="text-[18px] font-semibold text-center text-[#1F1F1F] -mt-2 mb-1">
          Log in to continue
        </h2>
        <p className="text-[13px] text-[#65799A] text-center mb-6">
          {loginModalReason}
        </p>

        <LoginForm onSuccess={closeLoginModal} />

        <div className="flex items-center justify-center mt-5">
          <label className="text-xs md:text-sm text-[#475467]">
            Don't have an account?{" "}
            <Link
              to="/signup"
              onClick={closeLoginModal}
              className="text-[#0867AC] hover:text-[#0867AC]"
            >
              Sign Up
            </Link>
          </label>
        </div>
      </div>
    </div>
  );
}
