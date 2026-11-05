import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import Input from "../reusables/input";
import Button from "../reusables/button";
import { useAuth } from "../../context/auth-context";
import type { AuthUser } from "../../context/auth-context";
import useRequest from "../../hooks/use-req";
import { useToast } from "../../context/toast-context";

interface LoginFormValues {
  email: string;
  password: string;
}

interface LoginFormProps {
  onSuccess?: (user: AuthUser) => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const { loginWithSession } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [viewPassword, setViewPassword] = useState(false);
  const { control, handleSubmit } = useForm<LoginFormValues>();
  const { loading, makeRequest } = useRequest("/auth/login", "POST");

  const onSubmit = async (values: LoginFormValues) => {
    const toastId = toast.loading("Logging in...");
    const [json, status] = await makeRequest(values);

    if (status < 200 || status >= 300) {
      toast.update(toastId, "error", json?.message || "Invalid email or password.");
      return;
    }

    const token = json?.token || json?.data?.token;
    const rawUser = json?.user || json?.data?.user || json?.data;

    if (!token) {
      toast.update(toastId, "error", "Something went wrong logging you in. Please try again.");
      return;
    }

    const user = loginWithSession(token, rawUser);

    if (user.emailVerified === false) {
      toast.update(toastId, "info", "Please verify your email to continue.");
      const redirectTo = user.role === "seller" ? "/seller/dashboard" : "/";
      navigate("/verify-email", { state: { email: user.email, redirectTo } });
      return;
    }

    toast.update(toastId, "success", "Logged in successfully.");
    onSuccess?.(user);
  };

  return (
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

      <Controller
        name="password"
        control={control}
        rules={{
          required: "Password is required",
        }}
        render={({ field, fieldState }) => (
          <Input
            label="Password"
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
            onChange={field?.onChange}
            error={fieldState?.error?.message}
            autoComplete="off"
          />
        )}
      />

      <div className="flex justify-end -mt-1">
        <Link
          to="/forgot-password"
          className="text-[#0867AC] hover:text-[#35D081] font-normal text-sm"
        >
          Forgot password?
        </Link>
      </div>

      <Button
        size="lg"
        variant="primary"
        type="submit"
        disabled={loading}
        className="font-normal mt-2"
      >
        {loading ? "Logging in..." : "Log in"}
      </Button>
    </form>
  );
}
