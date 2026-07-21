import { useState } from "react";
import { Banknote, CircleCheck } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import Input from "../../components/reusables/input";
import Select from "../../components/reusables/select";
import Button from "../../components/reusables/button";
import { useSeller } from "../../context/seller-context";
import type { BankAccount } from "../../context/seller-context";

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

function maskAccountNumber(accountNumber: string) {
  if (accountNumber.length <= 4) return accountNumber;
  return `••••${accountNumber.slice(-4)}`;
}

export default function SellerPayouts() {
  const { bankAccount, setBankAccount } = useSeller();
  const [editing, setEditing] = useState(!bankAccount);
  const [saved, setSaved] = useState(false);

  const { control, handleSubmit } = useForm<BankAccount>({
    defaultValues: bankAccount ?? { bank: "", accountNumber: "", accountHolderName: "" },
  });

  const onSubmit = (values: BankAccount) => {
    setBankAccount(values);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const bankLabel = BANK_OPTIONS.find((b) => b.value === bankAccount?.bank)?.label ?? bankAccount?.bank;

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-semibold text-[#121212] mb-1">Payouts</h1>
      <p className="text-sm text-[#65799A] mb-6">
        The bank account where your earnings are sent.
      </p>

      {saved && (
        <div className="flex items-center gap-2 bg-[#FDF1F7] text-[#ED1280] text-sm font-medium rounded-xl px-4 py-3 mb-6">
          <CircleCheck className="w-4 h-4 shrink-0" strokeWidth={2} />
          Your payout details have been updated.
        </div>
      )}

      {!editing && bankAccount ? (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <span className="w-12 h-12 rounded-full bg-[#F2E8ED] flex items-center justify-center mb-4">
            <Banknote className="w-6 h-6 text-[#ED1280]" strokeWidth={2} />
          </span>
          <p className="text-[15px] font-semibold text-[#121212]">{bankLabel}</p>
          <p className="text-[13px] text-[#65799A] mt-1">
            {bankAccount.accountHolderName} · {maskAccountNumber(bankAccount.accountNumber)}
          </p>
          <button
            onClick={() => setEditing(true)}
            className="mt-5 bg-[#F2E8ED] hover:bg-[#EBDCE3] text-[#121212] font-semibold px-5 py-2.5 rounded-full text-sm transition-colors"
          >
            Edit
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-4"
        >
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
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                autoComplete="off"
              />
            )}
          />

          <div className="flex items-center gap-3 mt-2">
            <Button size="md" variant="primary" type="submit" className="font-normal">
              Save
            </Button>
            {bankAccount && (
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="text-sm font-semibold text-[#65799A] hover:text-[#121212]"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
