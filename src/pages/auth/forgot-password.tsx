import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Mail, MailCheck } from "lucide-react";
import AuthShell from "../../layouts/auth-shell";
import Input from "../../components/reusables/input";
import Button from "../../components/reusables/button";

interface ForgotPasswordValues {
  email: string;
}

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { control, handleSubmit, getValues } = useForm<ForgotPasswordValues>();
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = () => {
    // TODO: wire up to auth API — trigger reset email
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <AuthShell title="Check your email">
        <div className="flex flex-col items-center text-center gap-3 mb-6">
          <span className="w-14 h-14 rounded-full bg-[#FDE6F1] flex items-center justify-center">
            <MailCheck className="w-8 h-8 text-[#ED1280]" strokeWidth={2} />
          </span>
          <p className="text-[14px] text-[#65799A] max-w-[360px]">
            We've sent a password reset link to{" "}
            <span className="font-semibold text-[#1F1F1F]">
              {getValues("email")}
            </span>
            . Follow the link to choose a new password.
          </p>
        </div>

        <Button
          size="lg"
          variant="primary"
          type="button"
          className="font-normal"
          onClick={() => navigate("/set-password")}
        >
          Continue to reset password
        </Button>

        <div className="flex items-center justify-center mt-5">
          <label className="text-xs md:text-sm text-[#475467]">
            Didn't get it?{" "}
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="text-[#0867AC] hover:text-[#0867AC]"
            >
              Try another email
            </button>
          </label>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Forgot password?">
      <p className="text-[13px] text-[#65799A] text-center mb-6">
        Enter the email linked to your account and we'll send you a reset link.
      </p>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="email"
          control={control}
          rules={{
            required: "Email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Enter a valid email. E.g, example@gmail.com",
            },
          }}
          render={({ field, fieldState }) => (
            <Input
              value={field.value}
              placeholder="name@example.com"
              label="Email"
              icon={<Mail className="w-4 h-4" strokeWidth={2} />}
              error={fieldState?.error?.message}
              onChange={field.onChange}
              autoComplete="off"
            />
          )}
        />

        <Button
          size="lg"
          variant="primary"
          type="submit"
          className="font-normal mt-2"
        >
          Send reset link
        </Button>
      </form>

      <div className="flex items-center justify-center mt-5">
        <label className="text-xs md:text-sm text-[#475467]">
          Remembered your password?{" "}
          <Link to="/login" className="text-[#0867AC] hover:text-[#0867AC]">
            Log in
          </Link>
        </label>
      </div>
    </AuthShell>
  );
};

export default ForgotPassword;
