import { useState } from "react";
import { CircleCheck } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import Input from "../../components/reusables/input";
import MultiSelect from "../../components/reusables/multi-select";
import Textarea from "../../components/reusables/textarea";
import Button from "../../components/reusables/button";
import { useSeller } from "../../context/seller-context";

interface StoreFormValues {
  brandName: string;
  categories: string[];
  bio: string;
  instagram: string;
  facebook: string;
}

const CATEGORY_OPTIONS = [
  { value: "Dresses", label: "Dresses" },
  { value: "Tops", label: "Tops" },
  { value: "Men", label: "Men" },
  { value: "Shoes", label: "Shoes" },
  { value: "Bags", label: "Bags" },
  { value: "Accessories", label: "Accessories" },
];

export default function SellerStoreProfile() {
  const { storeProfile, setStoreProfile } = useSeller();
  const [saved, setSaved] = useState(false);

  const { control, handleSubmit } = useForm<StoreFormValues>({
    defaultValues: {
      brandName: storeProfile?.brandName ?? "",
      categories: storeProfile?.categories ?? [],
      bio: storeProfile?.bio ?? "",
      instagram: storeProfile?.instagram ?? "",
      facebook: storeProfile?.facebook ?? "",
    },
  });

  const onSubmit = (values: StoreFormValues) => {
    setStoreProfile(values);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-2xl">
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

        <Button size="md" variant="primary" type="submit" className="font-normal mt-2">
          Save Changes
        </Button>
      </form>
    </div>
  );
}
