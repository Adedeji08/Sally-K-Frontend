import { useState } from "react";
import { CircleCheck, Lock } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import AuthShell from "../../layouts/auth-shell";
import Input from "../../components/reusables/input";
import Select from "../../components/reusables/select";
import Button from "../../components/reusables/button";
import { useSeller } from "../../context/seller-context";

interface BankAccountFormValues {
  bank: string;
  accountNumber: string;
  accountHolderName: string;
}

const BANK_OPTIONS = [
  { value: "access", label: "Access Bank" },
  { value: "gtbank", label: "GTBank" },
  { value: "zenith", label: "Zenith Bank" },
  { value: "first_bank", label: "First Bank" },
  { value: "uba", label: "UBA" },
  { value: "stanbic", label: "Stanbic IBTC" },
  { value: "fidelity", label: "Fidelity Bank" },
  { value: "union_bank", label: "Union Bank" },
  { value: "wema", label: "Wema Bank" },
  { value: "other", label: "Other" },
];

const BankAccountSetup = () => {
  const navigate = useNavigate();
  const { setBankAccount } = useSeller();
  const { control, handleSubmit } = useForm<BankAccountFormValues>();
  const [confirmed, setConfirmed] = useState(false);
  const [confirmError, setConfirmError] = useState("");
  const [linked, setLinked] = useState(false);

  const onSubmit = (values: BankAccountFormValues) => {
    if (!confirmed) {
      setConfirmError("Please confirm the bank account details are accurate");
      return;
    }
    setConfirmError("");
    setBankAccount(values);
    setLinked(true);
  };

  if (linked) {
    return (
      <AuthShell title="Account linked">
        <div className="flex flex-col items-center text-center gap-3 mb-6">
          <span className="w-14 h-14 rounded-full bg-[#FDE6F1] flex items-center justify-center">
            <CircleCheck className="w-8 h-8 text-[#ED1280]" strokeWidth={2} />
          </span>
          <p className="text-[14px] text-[#65799A] max-w-[360px]">
            Your bank account has been linked. You're all set to receive payouts once you
            start selling.
          </p>
        </div>
        <Button
          size="lg"
          variant="primary"
          type="button"
          className="font-normal"
          onClick={() => navigate("/onboarding/subscription")}
        >
          Choose a subscription plan
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Secure Bank Account Setup">
      <div className="flex flex-col items-center text-center gap-2 mb-6">
        <span className="w-12 h-12 rounded-full bg-[#F2E8ED] flex items-center justify-center">
          <Lock className="w-6 h-6 text-[#ED1280]" strokeWidth={2} />
        </span>
        <p className="text-[13px] text-[#65799A] max-w-[340px]">
          Link your bank account to receive payments from your sales. Your information is
          securely encrypted and protected.
        </p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="bank"
          control={control}
          rules={{ required: "Select your bank" }}
          render={({ field, fieldState }) => (
            <Select
              label="Select bank"
              options={BANK_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          name="accountNumber"
          control={control}
          rules={{ required: "Account number is required" }}
          render={({ field, fieldState }) => (
            <Input
              label="Account number"
              placeholder="Enter account number"
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
              autoComplete="off"
            />
          )}
        />

        <Controller
          name="accountHolderName"
          control={control}
          rules={{ required: "Account holder name is required" }}
          render={({ field, fieldState }) => (
            <Input
              label="Account holder name"
              placeholder="Enter account holder name"
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
              autoComplete="off"
            />
          )}
        />

        <div>
          <label className="flex items-start gap-2.5 text-[13px] text-[#4a4a4a] cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => {
                setConfirmed(e.target.checked);
                if (e.target.checked) setConfirmError("");
              }}
              className="mt-0.5 accent-[#ED1280]"
            />
            I confirm that the bank account details provided are accurate and belong to me.
          </label>
          {confirmError && <p className="text-[#FF0101] text-[12px] mt-1">{confirmError}</p>}
        </div>

        <Button size="lg" variant="primary" type="submit" className="font-normal">
          Link Account
        </Button>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="text-[#0867AC] hover:text-[#35D081] font-normal text-sm text-center -mt-2"
        >
          I'll add this later
        </button>
      </form>
    </AuthShell>
  );
};

export default BankAccountSetup;
