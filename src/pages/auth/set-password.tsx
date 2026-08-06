import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Lock, ShieldAlert } from "lucide-react";
import AuthShell from "../../layouts/auth-shell";
import Input from "../../components/reusables/input";
import Button from "../../components/reusables/button";
import useRequest from "../../hooks/use-req";
import { useToast } from "../../context/toast-context";

interface SetPasswordValues {
  password: string;
  confirmPassword: string;
}

const SetPassword = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { control, handleSubmit, watch } = useForm<SetPasswordValues>();
  const [viewPassword, setViewPassword] = useState(false);
  const { loading, makeRequest } = useRequest("/auth/reset-password", "POST");

  if (!token) {
    return (
      <AuthShell title="Invalid reset link">
        <div className="flex flex-col items-center text-center gap-3 mb-6">
          <span className="w-14 h-14 rounded-full bg-[#FDE6F1] flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-[#ED1280]" strokeWidth={2} />
          </span>
          <p className="text-[14px] text-[#65799A] max-w-[360px]">
            This password reset link is invalid or has expired. Request a new one to continue.
          </p>
        </div>

        <Button
          size="lg"
          variant="primary"
          type="button"
          className="font-normal"
          onClick={() => navigate("/forgot-password")}
        >
          Request a new link
        </Button>

        <div className="flex items-center justify-center mt-5">
          <Link to="/login" className="text-xs md:text-sm text-[#0867AC] hover:text-[#0867AC]">
            Back to log in
          </Link>
        </div>
      </AuthShell>
    );
  }

  const onSubmit = async (values: SetPasswordValues) => {
    const toastId = toast.loading("Resetting password...");
    const [json, status] = await makeRequest({
      token,
      password: values.password,
      confirm_password: values.confirmPassword,
    });

    if (status < 200 || status >= 300) {
      toast.update(
        toastId,
        "error",
        json?.message || "Couldn't reset your password. The link may have expired."
      );
      return;
    }

    toast.update(toastId, "success", "Password reset successfully.");
    navigate("/login", { state: { passwordReset: true } });
  };

  return (
    <AuthShell title="Set a new password">
      <p className="text-[13px] text-[#65799A] text-center mb-6">
        Choose a new password. Make it at least 8 characters.
      </p>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="password"
          control={control}
          rules={{
            required: "Password is required",
            minLength: { value: 8, message: "Password must be at least 8 characters" },
          }}
          render={({ field, fieldState }) => (
            <Input
              label="New password"
              type={viewPassword ? "text" : "password"}
              value={field.value}
              icon={<Lock className="w-4 h-4" strokeWidth={2} />}
              rightIcon={
                viewPassword ? (
                  <EyeOff className="w-4 h-4" strokeWidth={2} />
                ) : (
                  <Eye className="w-4 h-4" strokeWidth={2} />
                )
              }
              onRightIconClick={() => setViewPassword((prev) => !prev)}
              onChange={field.onChange}
              error={fieldState?.error?.message}
              autoComplete="off"
            />
          )}
        />

        <Controller
          name="confirmPassword"
          control={control}
          rules={{
            required: "Confirm your password",
            validate: (value) =>
              value === watch("password") || "Passwords do not match",
          }}
          render={({ field, fieldState }) => (
            <Input
              label="Confirm new password"
              type={viewPassword ? "text" : "password"}
              value={field.value}
              icon={<Lock className="w-4 h-4" strokeWidth={2} />}
              onChange={field.onChange}
              error={fieldState?.error?.message}
              autoComplete="off"
            />
          )}
        />

        <Button
          size="lg"
          variant="primary"
          type="submit"
          disabled={loading}
          className="font-normal mt-2"
        >
          {loading ? "Resetting..." : "Reset password"}
        </Button>
      </form>
    </AuthShell>
  );
};

export default SetPassword;
