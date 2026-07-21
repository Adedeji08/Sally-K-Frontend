import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import AuthShell from "../../layouts/auth-shell";
import Input from "../../components/reusables/input";
import MultiSelect from "../../components/reusables/multi-select";
import Textarea from "../../components/reusables/textarea";
import Button from "../../components/reusables/button";
import FileDropzone from "../../components/reusables/file-dropzone";
import { useSeller } from "../../context/seller-context";

interface StoreFormValues {
  brandName: string;
  categories: string[];
  bio: string;
  instagram: string;
  facebook: string;
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
];

const StoreSetup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setStoreProfile } = useSeller();
  const { control, handleSubmit } = useForm<StoreFormValues>();
  const accountState = (location.state ?? {}) as AccountState;
  const [, setLogoFile] = useState<File | null>(null);

  const onSubmit = (values: StoreFormValues) => {
    const categoryLabels = values.categories.map(
      (value) => CATEGORY_OPTIONS.find((option) => option.value === value)?.label ?? value
    );

    setStoreProfile({
      brandName: values.brandName,
      categories: categoryLabels,
      bio: values.bio,
      instagram: values.instagram,
      facebook: values.facebook,
    });

    navigate("/onboarding/success", {
      state: { role: "seller", ...accountState, ...values },
    });
  };

  return (
    <AuthShell
      title="Brand Profile Setup"
      step={{ current: 2, total: 3, labels: ["Account", "Store", "Verify"] }}
    >
      <p className="text-[13px] text-[#65799A] text-center mb-6">
        Personalize your storefront to connect with customers. You can edit this anytime.
      </p>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="brandName"
          control={control}
          rules={{ required: "Brand name is required" }}
          render={({ field, fieldState }) => (
            <Input
              label="Brand name"
              placeholder="e.g. Tunde Couture"
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
              autoComplete="off"
            />
          )}
        />

        <Controller
          name="categories"
          control={control}
          defaultValue={[]}
          rules={{
            validate: (value) => (value && value.length > 0) || "Select at least one category",
          }}
          render={({ field, fieldState }) => (
            <MultiSelect
              label="Categories you sell"
              placeholder="Select categories"
              options={CATEGORY_OPTIONS}
              value={field.value ?? []}
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
            <div>
              <Textarea
                label="Brand biography"
                placeholder="Tell us your brand's story..."
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                required
              />
              {!fieldState.error && (
                <p className="text-[12px] text-[#65799A] mt-1">
                  This will appear on your public brand page. Make it engaging!
                </p>
              )}
            </div>
          )}
        />

        <FileDropzone
          label="Brand logo"
          hint="PNG, JPG, GIF up to 10MB. Recommended: 500×500px."
          accept="image/*"
          onFileSelect={setLogoFile}
        />

        <div>
          <p className="text-[14px] font-bold text-[#121212] mb-2">Social media</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Controller
              name="instagram"
              control={control}
              render={({ field }) => (
                <Input
                  label="Instagram"
                  prefix="https://"
                  placeholder="instagram.com/yourbrand"
                  value={field.value}
                  onChange={field.onChange}
                  autoComplete="off"
                />
              )}
            />

            <Controller
              name="facebook"
              control={control}
              render={({ field }) => (
                <Input
                  label="Facebook"
                  prefix="https://"
                  placeholder="facebook.com/yourbrand"
                  value={field.value}
                  onChange={field.onChange}
                  autoComplete="off"
                />
              )}
            />
          </div>
        </div>

        <Button size="lg" variant="primary" type="submit" className="font-normal mt-2">
          Continue
        </Button>
      </form>
    </AuthShell>
  );
};

export default StoreSetup;
