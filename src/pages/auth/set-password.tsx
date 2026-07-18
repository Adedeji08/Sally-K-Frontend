import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock } from "lucide-react";
import AuthShell from "../../layouts/auth-shell";
import Input from "../../components/reusables/input";
import Button from "../../components/reusables/button";

interface SetPasswordValues {
  password: string;
  confirmPassword: string;
}

const SetPassword = () => {
  const navigate = useNavigate();
  const { control, handleSubmit, watch } = useForm<SetPasswordValues>();
  const [viewPassword, setViewPassword] = useState(false);

  const onSubmit = () => {
    // TODO: wire up to auth API — set new password
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
          className="font-normal mt-2"
        >
          Reset password
        </Button>
      </form>
    </AuthShell>
  );
};

export default SetPassword;
