import { ShieldCheck } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import AuthShell from "../../layouts/auth-shell";
import Input from "../../components/reusables/input";
import Select from "../../components/reusables/select";
import Button from "../../components/reusables/button";

interface VerificationFormValues {
  businessName: string;
  idType: string;
  idNumber: string;
}

const ID_TYPE_OPTIONS = [
  { value: "nin", label: "NIN" },
  { value: "bvn", label: "BVN" },
  { value: "passport", label: "International Passport" },
];

const Verification = () => {
  const navigate = useNavigate();
  const { control, handleSubmit } = useForm<VerificationFormValues>();

  const onSubmit = () => {
    navigate("/", { state: { verificationSubmitted: true } });
  };

  return (
    <AuthShell
      title="Verify your business"
      step={{ current: 3, total: 3, labels: ["Account", "Store", "Verify"] }}
    >
      <div className="flex items-start gap-3 bg-[#F2E8ED] rounded-xl p-3 mb-6">
        <ShieldCheck className="w-5 h-5 text-[#ED1280] shrink-0 mt-0.5" strokeWidth={2} />
        <p className="text-[12px] text-[#4a4a4a]">
          We use this to confirm you're a real vendor and enable payouts. It usually
          takes less than 2 minutes, and your storefront stays live while we review it.
        </p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="businessName"
          control={control}
          rules={{ required: "Registered / trading name is required" }}
          render={({ field, fieldState }) => (
            <Input
              label="Registered / trading name"
              placeholder="e.g. Tunde Couture Ltd"
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
              autoComplete="off"
            />
          )}
        />

        <Controller
          name="idType"
          control={control}
          rules={{ required: "Select an ID type" }}
          render={({ field, fieldState }) => (
            <Select
              label="Identity document"
              options={ID_TYPE_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          name="idNumber"
          control={control}
          rules={{ required: "ID number is required" }}
          render={({ field, fieldState }) => (
            <Input
              label="ID number"
              placeholder="Enter your ID number"
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
              autoComplete="off"
            />
          )}
        />

        <Button size="lg" variant="primary" type="submit" className="font-normal mt-2">
          Submit for verification
        </Button>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="text-[#0867AC] hover:text-[#35D081] font-normal text-sm text-center mt-1"
        >
          I'll do this later
        </button>
      </form>
    </AuthShell>
  );
};

export default Verification;
