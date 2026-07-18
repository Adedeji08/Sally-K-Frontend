import { Controller, useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import AuthShell from "../../layouts/auth-shell";
import Input from "../../components/reusables/input";
import Select from "../../components/reusables/select";
import Textarea from "../../components/reusables/textarea";
import Button from "../../components/reusables/button";

interface StoreFormValues {
  brandName: string;
  category: string;
  bio: string;
}

interface AccountState {
  fullName?: string;
  email?: string;
}

const CATEGORY_OPTIONS = [
  { value: "dresses", label: "Dresses" },
  { value: "tops", label: "Tops" },
  { value: "men", label: "Men" },
  { value: "shoes", label: "Shoes" },
  { value: "bags", label: "Bags" },
  { value: "accessories", label: "Accessories" },
  { value: "mixed", label: "Mixed / multiple categories" },
];

const StoreSetup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { control, handleSubmit } = useForm<StoreFormValues>();
  const accountState = (location.state ?? {}) as AccountState;

  const onSubmit = (values: StoreFormValues) => {
    navigate("/onboarding/success", {
      state: { role: "seller", ...accountState, ...values },
    });
  };

  return (
    <AuthShell
      title="Set up your storefront"
      step={{ current: 2, total: 3, labels: ["Account", "Store", "Verify"] }}
    >
      <p className="text-[13px] text-[#65799A] text-center mb-6">
        This is what shoppers will see on your brand page. You can edit it anytime.
      </p>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="brandName"
          control={control}
          rules={{ required: "Brand / store name is required" }}
          render={({ field, fieldState }) => (
            <Input
              label="Brand / store name"
              placeholder="e.g. Tunde Couture"
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
              autoComplete="off"
            />
          )}
        />

        <Controller
          name="category"
          control={control}
          rules={{ required: "Select a category" }}
          render={({ field, fieldState }) => (
            <Select
              label="Primary category"
              options={CATEGORY_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          name="bio"
          control={control}
          rules={{ required: "Tell shoppers about your brand" }}
          render={({ field, fieldState }) => (
            <Textarea
              label="Brand bio"
              placeholder="Tell shoppers what makes your designs unique..."
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
              required
            />
          )}
        />

        <Button size="lg" variant="primary" type="submit" className="font-normal mt-2">
          Continue
        </Button>
      </form>
    </AuthShell>
  );
};

export default StoreSetup;
