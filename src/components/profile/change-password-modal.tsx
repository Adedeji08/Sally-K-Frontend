import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { CheckCircle2, Eye, EyeOff, X } from "lucide-react";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChangePasswordValues {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const fieldClass =
  "w-full rounded-xl border border-stone-200 px-4 py-3 pr-11 text-sm text-stone-700 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all";

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordValues>();

  useEffect(() => {
    if (isOpen) {
      setSubmitted(false);
      reset();
      setShowOld(false);
      setShowNew(false);
      setShowConfirm(false);
    }
  }, [isOpen, reset]);

  if (!isOpen) return null;

  const onSubmit = () => {
    // Dummy auth: there's no backend, so any valid current password is accepted.
    setSubmitted(true);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[420px] bg-white rounded-3xl shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {submitted ? (
          <div className="text-center pb-2 -mt-2">
            <span className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-rose-500" strokeWidth={2} />
            </span>
            <h2 className="text-lg font-semibold text-stone-900 mb-1">Password changed!</h2>
            <p className="text-sm text-stone-500 mb-6">
              Your password has been updated successfully.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-full text-sm transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-stone-900 -mt-2 mb-1">Change Password</h2>
            <p className="text-sm text-stone-500 mb-6">
              Choose a strong password you don't use elsewhere.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-stone-700 mb-1.5 block">
                  Old Password
                </label>
                <div className="relative">
                  <input
                    type={showOld ? "text" : "password"}
                    className={fieldClass}
                    {...register("oldPassword", { required: "Enter your current password" })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOld((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    tabIndex={-1}
                    aria-label={showOld ? "Hide password" : "Show password"}
                  >
                    {showOld ? (
                      <EyeOff className="w-4 h-4" strokeWidth={2} />
                    ) : (
                      <Eye className="w-4 h-4" strokeWidth={2} />
                    )}
                  </button>
                </div>
                {errors.oldPassword && (
                  <p className="text-xs text-rose-500 mt-1">{errors.oldPassword.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-stone-700 mb-1.5 block">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    className={fieldClass}
                    {...register("newPassword", {
                      required: "Enter a new password",
                      minLength: { value: 8, message: "Must be at least 8 characters" },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    tabIndex={-1}
                    aria-label={showNew ? "Hide password" : "Show password"}
                  >
                    {showNew ? (
                      <EyeOff className="w-4 h-4" strokeWidth={2} />
                    ) : (
                      <Eye className="w-4 h-4" strokeWidth={2} />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-xs text-rose-500 mt-1">{errors.newPassword.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-stone-700 mb-1.5 block">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    className={fieldClass}
                    {...register("confirmPassword", {
                      required: "Confirm your new password",
                      validate: (value) =>
                        value === watch("newPassword") || "Passwords do not match",
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    tabIndex={-1}
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? (
                      <EyeOff className="w-4 h-4" strokeWidth={2} />
                    ) : (
                      <Eye className="w-4 h-4" strokeWidth={2} />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-rose-500 mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                className="bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-full text-sm transition-colors mt-2"
              >
                Update Password
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
