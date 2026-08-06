import { Controller, useForm } from "react-hook-form";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import AuthShell from "../../layouts/auth-shell";
import Input from "../../components/reusables/input";
import Button from "../../components/reusables/button";
import { useAuth } from "../../context/auth-context";
import type { UserRole } from "../../context/auth-context";
import useRequest from "../../hooks/use-req";
import { useToast } from "../../context/toast-context";

interface SignupFormValues {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
}

const ROLE_COPY: Record<string, { label: string; steps: string[] }> = {
  shopper: { label: "shopper", steps: ["Account", "Done"] },
  seller: { label: "seller", steps: ["Account", "Store", "Verify"] },
};

const Signup = () => {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const { loginWithSession } = useAuth();
  const toast = useToast();
  const { control, handleSubmit, watch } = useForm<SignupFormValues>();
  const { loading, makeRequest } = useRequest("/auth/signup", "POST");

  if (!role || !ROLE_COPY[role]) {
    return <Navigate to="/signup" replace />;
  }

  const roleInfo = ROLE_COPY[role];
  const resolvedRole: UserRole = role === "seller" ? "seller" : "shopper";

  const onSubmit = async (values: SignupFormValues) => {
    const toastId = toast.loading("Creating your account...");
    const [json, status] = await makeRequest({ ...values, role: resolvedRole });

    if (status < 200 || status >= 300) {
      toast.update(toastId, "error", json?.message || "Something went wrong creating your account.");
      return;
    }

    const token = json?.token || json?.data?.token;
    const rawUser = json?.user || json?.data?.user || json?.data;

    if (!token) {
      toast.update(toastId, "error", "Something went wrong creating your account. Please try again.");
      return;
    }

    loginWithSession(token, rawUser, resolvedRole);
    const redirectTo = role === "seller" ? "/onboarding/store" : "/onboarding/success";

    toast.update(toastId, "success", "Account created! Let's verify your email.");
    navigate("/verify-email", {
      state: { email: values.email, redirectTo, role, full_name: values.full_name },
    });
  };

  return (
    <AuthShell
      title="Create your account"
      step={{ current: 1, total: roleInfo.steps.length, labels: roleInfo.steps }}
    >
      <p className="text-[13px] text-[#65799A] text-center mb-6">
        Setting up your {roleInfo.label} account. This only takes a minute.
      </p>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="full_name"
          control={control}
          rules={{ required: "Full name is required" }}
          render={({ field, fieldState }) => (
            <Input
              label="Full name"
              placeholder="Jane Doe"
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
              autoComplete="off"
            />
          )}
        />

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
              label="Email"
              placeholder="name@example.com"
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
              autoComplete="off"
            />
          )}
        />

        <Controller
          name="password"
          control={control}
          rules={{
            required: "Password is required",
            minLength: { value: 8, message: "Password must be at least 8 characters" },
          }}
          render={({ field, fieldState }) => (
            <Input
              label="Password"
              type="password"
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
              autoComplete="off"
            />
          )}
        />

        <Controller
          name="confirm_password"
          control={control}
          rules={{
            required: "Confirm your password",
            validate: (value) =>
              value === watch("password") || "Passwords do not match",
          }}
          render={({ field, fieldState }) => (
            <Input
              label="Confirm password"
              type="password"
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
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
          {loading ? "Creating account..." : "Continue"}
        </Button>
      </form>

      <div className="flex items-center justify-center mt-5">
        <label className="text-xs md:text-sm text-[#475467]">
          Already have an account?{" "}
          <Link to="/login" className="text-[#0867AC] hover:text-[#0867AC]">
            Log in
          </Link>
        </label>
      </div>
    </AuthShell>
  );
};

export default Signup;
