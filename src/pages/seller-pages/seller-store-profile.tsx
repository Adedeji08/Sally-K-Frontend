import { useEffect, useState } from "react";
import { CircleCheck } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import Input from "../../components/reusables/input";
import MultiSelect from "../../components/reusables/multi-select";
import Textarea from "../../components/reusables/textarea";
import Button from "../../components/reusables/button";
import ImageUploadField from "../../components/reusables/image-upload";
import { useCurrentUser } from "../../context/current-user-context";
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

const CATEGORY_OPTIONS = [
  { value: "dresses", label: "Dresses" },
  { value: "tops", label: "Tops" },
  { value: "men", label: "Men" },
  { value: "shoes", label: "Shoes" },
  { value: "bags", label: "Bags" },
  { value: "accessories", label: "Accessories" },
];

// A social handle: letters, numbers, dots, underscores, hyphens (no spaces or slashes).
const HANDLE_PATTERN = /^[A-Za-z0-9._-]+$/;

// Accepts a full profile link OR a bare handle and returns just the handle:
//   "https://www.instagram.com/eben_dami/" -> "eben_dami"
//   "web.facebook.com/adedeji.i.damilola"  -> "adedeji.i.damilola"
//   "yourbrand"                             -> "yourbrand"
const toHandle = (value: string | null | undefined) => {
  if (!value) return "";
  return value
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^(?:www\.|web\.|m\.)+/i, "")
    .replace(/^(?:instagram\.com|facebook\.com|fb\.com|fb\.me)\//i, "")
    .replace(/[/?#].*$/, "")
    .trim();
};

// Only collapse to a handle when the value actually looks like a pasted URL, so
// the seller can still type a handle that contains dots (e.g. "a.b.c").
const looksLikeUrl = (value: string) =>
  /https?:\/\/|(?:instagram|facebook|fb)\.(?:com|me)\//i.test(value);

export default function SellerStoreProfile() {
  const { currentUser, loading: loadingUser, refetch } = useCurrentUser();
  const toast = useToast();
  const [saved, setSaved] = useState(false);

  const sellerProfile = currentUser?.sellerProfile ?? null;

  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);

  const { makeRequest: uploadLogoRequest } = useApi("/uploads/brand-logo", "POST", {
    Authorization: `Bearer ${localStorage.getItem("authToken") ?? ""}`,
  });
  const { loading: savingProfile, makeRequest: updateStoreProfile } = useRequest(
    "/sellers/profile",
    "PUT"
  );

  const { control, handleSubmit, reset } = useForm<StoreFormValues>({
    defaultValues: { brandName: "", categories: [], bio: "", instagram: "", facebook: "" },
  });

  // Hydrate the form from /auth/me once it lands (and again after a save-refetch).
  useEffect(() => {
    if (!sellerProfile) return;
    reset({
      brandName: sellerProfile.brandName ?? "",
      categories: (sellerProfile.categories ?? []).map((category) => category.toLowerCase()),
      bio: sellerProfile.bio ?? "",
      instagram: toHandle(sellerProfile.instagramUrl),
      facebook: toHandle(sellerProfile.facebookUrl),
    });
    setLogoUrl(sellerProfile.logoUrl ?? null);
  }, [sellerProfile, reset]);

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
    const toastId = toast.loading("Saving your store profile...");
    const [json, status] = await updateStoreProfile({
      brandName: values.brandName,
      categories: values.categories,
      bio: values.bio,
      logoUrl: logoUrl ?? undefined,
      instagramUrl: values.instagram ? `https://instagram.com/${toHandle(values.instagram)}` : "",
      facebookUrl: values.facebook ? `https://facebook.com/${toHandle(values.facebook)}` : "",
    });

    if (status < 200 || status >= 300) {
      toast.update(
        toastId,
        "error",
        json?.message || "Couldn't update your store profile. Try again."
      );
      return;
    }

    toast.update(toastId, "success", "Store profile updated!");
    await refetch();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (loadingUser && !sellerProfile) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="h-10 w-48 rounded-lg bg-white/70 animate-pulse mb-4" />
        <div className="h-[420px] rounded-2xl bg-white/70 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-[#121212] mb-1">Store Profile</h1>
      <p className="text-sm text-[#65799A] mb-6">
        This is what shoppers see on your brand page.
      </p>

      {saved && (
        <div className="flex items-center gap-2 bg-[#FDF1F7] text-[#ED1280] text-sm font-medium rounded-xl px-4 py-3 mb-6">
          <CircleCheck className="w-4 h-4 shrink-0" strokeWidth={2} />
          Your store profile has been updated.
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-4"
      >
        <Controller
          name="brandName"
          control={control}
          rules={{ required: "Brand name is required" }}
          render={({ field, fieldState }) => (
            <Input
              label="Brand name"
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
              autoComplete="off"
            />
          )}
        />

        <ImageUploadField
          label="Brand logo"
          hint="PNG, JPG, GIF up to 10MB. Recommended: 500×500px."
          accept="image/*"
          initialUrl={logoUrl}
          onUpload={uploadLogo}
          onUploaded={setLogoUrl}
        />

        <Controller
          name="categories"
          control={control}
          rules={{
            validate: (value) => (value && value.length > 0) || "Select at least one category",
          }}
          render={({ field, fieldState }) => (
            <MultiSelect
              label="Categories you sell"
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
            <Textarea
              label="Brand biography"
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
              required
            />
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Controller
            name="instagram"
            control={control}
            rules={{
              required: "Instagram URL is required",
              validate: (value) =>
                HANDLE_PATTERN.test(toHandle(value)) ||
                "Paste your Instagram profile link or handle",
            }}
            render={({ field, fieldState }) => (
              <Input
                label="Instagram"
                prefix="instagram.com/"
                placeholder="yourbrand or profile link"
                value={field.value}
                onChange={(event) => {
                  const next = event.target.value;
                  field.onChange(looksLikeUrl(next) ? toHandle(next) : next);
                }}
                error={fieldState.error?.message}
                autoComplete="off"
              />
            )}
          />

          <Controller
            name="facebook"
            control={control}
            rules={{
              required: "Facebook URL is required",
              validate: (value) =>
                HANDLE_PATTERN.test(toHandle(value)) ||
                "Paste your Facebook profile link or handle",
            }}
            render={({ field, fieldState }) => (
              <Input
                label="Facebook"
                prefix="facebook.com/"
                placeholder="yourbrand or profile link"
                value={field.value}
                onChange={(event) => {
                  const next = event.target.value;
                  field.onChange(looksLikeUrl(next) ? toHandle(next) : next);
                }}
                error={fieldState.error?.message}
                autoComplete="off"
              />
            )}
          />
        </div>

        <Button
          size="md"
          variant="primary"
          type="submit"
          disabled={logoUploading || savingProfile}
          className="font-normal mt-2"
        >
          {logoUploading ? "Uploading logo..." : savingProfile ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </div>
  );
}
