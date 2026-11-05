import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import AuthShell from "../../layouts/auth-shell";
import Input from "../../components/reusables/input";
import MultiSelect from "../../components/reusables/multi-select";
import Textarea from "../../components/reusables/textarea";
import Button from "../../components/reusables/button";
import ImageUploadField from "../../components/reusables/image-upload";
import { useSeller } from "../../context/seller-context";
import { useToast } from "../../context/toast-context";
import useApi from "../../hooks/form-req";
import useRequest from "../../hooks/use-req";

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
  const toast = useToast();
  const { control, handleSubmit } = useForm<StoreFormValues>();
  const accountState = (location.state ?? {}) as AccountState;
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const { makeRequest: uploadLogoRequest } = useApi("/uploads/brand-logo", "POST", {
    Authorization: `Bearer ${localStorage.getItem("authToken") ?? ""}`,
  });
  const { loading: savingProfile, makeRequest: saveStoreProfile } = useRequest(
    "/sellers/profile",
    "PUT"
  );

  const uploadLogo = async (file: File) => {
    setLogoUploading(true);
    const toastId = toast.loading("Uploading brand logo...");
    const formData = new FormData();
    formData.append("file", file);

    const [json, status] = await uploadLogoRequest(formData);
    setLogoUploading(false);

    if (status < 200 || status >= 300 || !json?.data?.url) {
      toast.update(toastId, "error", json?.message || "Couldn't upload your logo. Try again.");
      return null;
    }

    toast.update(toastId, "success", "Logo uploaded!");
    return json.data.url as string;
  };

  const onSubmit = async (values: StoreFormValues) => {
    const instagramUrl = values.instagram ? `https://instagram.com/${values.instagram}` : undefined;
    const facebookUrl = values.facebook ? `https://facebook.com/${values.facebook}` : undefined;

    const toastId = toast.loading("Setting up your brand profile...");
    const [json, status] = await saveStoreProfile({
      brandName: values.brandName,
      categories: values.categories,
      bio: values.bio,
      logoUrl: logoUrl ?? undefined,
      instagramUrl,
      facebookUrl,
    });

    if (status < 200 || status >= 300) {
      toast.update(toastId, "error", json?.message || "Couldn't save your brand profile. Try again.");
      return;
    }

    toast.update(toastId, "success", "Brand profile saved!");

    const categoryLabels = values.categories.map(
      (value) => CATEGORY_OPTIONS.find((option) => option.value === value)?.label ?? value
    );

    setStoreProfile({
      brandName: values.brandName,
      categories: categoryLabels,
      bio: values.bio,
      logoUrl: logoUrl ?? undefined,
      instagram: values.instagram,
      facebook: values.facebook,
    });

    navigate("/onboarding/success", {
      state: { role: "seller", ...accountState, ...values, logoUrl },
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

        <ImageUploadField
          label="Brand logo"
          hint="PNG, JPG, GIF up to 10MB. Recommended: 500×500px."
          accept="image/*"
          onUpload={uploadLogo}
          onUploaded={setLogoUrl}
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
                  prefix="instagram.com/"
                  placeholder="yourbrand"
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
                  prefix="facebook.com/"
                  placeholder="yourbrand"
                  value={field.value}
                  onChange={field.onChange}
                  autoComplete="off"
                />
              )}
            />
          </div>
        </div>

        <Button
          size="lg"
          variant="primary"
          type="submit"
          disabled={logoUploading || savingProfile}
          className="font-normal mt-2"
        >
          {logoUploading ? "Uploading logo..." : savingProfile ? "Saving..." : "Continue"}
        </Button>
      </form>
    </AuthShell>
  );
};

export default StoreSetup;
