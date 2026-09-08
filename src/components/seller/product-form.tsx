import { Controller, useForm } from "react-hook-form";
import Input from "../reusables/input";
import Textarea from "../reusables/textarea";
import Select from "../reusables/select";
import MultiSelect from "../reusables/multi-select";
import Button from "../reusables/button";
import ProductImageInput from "./product-image-input";
import useApi from "../../hooks/form-req";
import { useToast } from "../../context/toast-context";
import type { SellerProductInput } from "../../context/seller-product-context";
import { toApiCategory } from "../../types/product";

interface ProductFormProps {
  initialValues?: Partial<SellerProductInput>;
  onSubmit: (input: SellerProductInput) => void | Promise<void>;
  submitLabel?: string;
  submitting?: boolean;
}

interface ProductFormValues {
  name: string;
  description: string;
  category: string;
  price: string;
  stock: string;
  sizes: string[];
  image1: string;
  image2: string;
  image3: string;
  image4: string;
}

// Option value is what the API wants ("dresses"); label is what the seller sees.
const CATEGORY_OPTIONS = ["Dresses", "Tops", "Men", "Shoes", "Bags", "Accessories"].map(
  (label) => ({ value: toApiCategory(label), label })
);

const SIZE_OPTIONS = [
  { value: "XS", label: "XS" },
  { value: "S", label: "S" },
  { value: "M", label: "M" },
  { value: "L", label: "L" },
  { value: "XL", label: "XL" },
  { value: "One Size", label: "One Size" },
];

const IMAGE_FIELDS = ["image1", "image2", "image3", "image4"] as const;

const PRODUCT_IMAGE_ENDPOINT = "/uploads/product-image";

export default function ProductForm({
  initialValues,
  onSubmit,
  submitLabel = "Publish Product",
  submitting = false,
}: ProductFormProps) {
  const toast = useToast();
  const { makeRequest: uploadImageRequest } = useApi(PRODUCT_IMAGE_ENDPOINT, "POST", {
    Authorization: `Bearer ${localStorage.getItem("authToken") ?? ""}`,
  });

  // Only called when the seller picks a file from their computer. A pasted URL
  // skips this entirely and is sent to the payload as-is.
  const uploadImage = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);

    const [json, status] = await uploadImageRequest(formData);

    if (status < 200 || status >= 300 || !json?.data?.url) {
      toast.error(json?.message || "Couldn't upload that image. Try again.");
      return null;
    }

    return json.data.url as string;
  };

  const { control, handleSubmit } = useForm<ProductFormValues>({
    defaultValues: {
      name: initialValues?.name ?? "",
      description: initialValues?.description ?? "",
      // The API returns categories upper-cased; match them back to an option value.
      category: initialValues?.category ? toApiCategory(initialValues.category) : "",
      price: initialValues?.price !== undefined ? String(initialValues.price) : "",
      stock: initialValues?.stock !== undefined ? String(initialValues.stock) : "",
      sizes: initialValues?.sizes ?? [],
      image1: initialValues?.images?.[0] ?? "",
      image2: initialValues?.images?.[1] ?? "",
      image3: initialValues?.images?.[2] ?? "",
      image4: initialValues?.images?.[3] ?? "",
    },
  });

  const submit = (values: ProductFormValues) => {
    const images = [values.image1, values.image2, values.image3, values.image4].filter(
      (url) => url.trim().length > 0
    );

    onSubmit({
      name: values.name.trim(),
      description: values.description.trim(),
      category: toApiCategory(values.category),
      price: Number(values.price) || 0,
      stock: Number(values.stock) || 0,
      sizes: values.sizes,
      images,
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
      <Controller
        name="name"
        control={control}
        rules={{ required: "Product name is required" }}
        render={({ field, fieldState }) => (
          <Input
            label="Product name"
            placeholder="e.g. Silk Wrap Dress"
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
            autoComplete="off"
          />
        )}
      />

      <Controller
        name="description"
        control={control}
        rules={{ required: "Description is required" }}
        render={({ field, fieldState }) => (
          <Textarea
            label="Description"
            placeholder="Describe the fit, fabric, and details..."
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
            required
          />
        )}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Controller
          name="category"
          control={control}
          rules={{ required: "Select a category" }}
          render={({ field, fieldState }) => (
            <Select
              label="Category"
              options={CATEGORY_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          name="price"
          control={control}
          rules={{
            required: "Price is required",
            pattern: { value: /^\d+(\.\d{1,2})?$/, message: "Enter a valid price" },
          }}
          render={({ field, fieldState }) => (
            <Input
              label="Price (₦)"
              placeholder="0.00"
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
              autoComplete="off"
            />
          )}
        />
      </div>

      <Controller
        name="stock"
        control={control}
        rules={{
          required: "Stock quantity is required",
          pattern: { value: /^\d+$/, message: "Enter a whole number" },
        }}
        render={({ field, fieldState }) => (
          <Input
            label="Stock quantity"
            placeholder="0"
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
            autoComplete="off"
          />
        )}
      />

      <Controller
        name="sizes"
        control={control}
        rules={{ validate: (value) => (value && value.length > 0) || "Select at least one size" }}
        render={({ field, fieldState }) => (
          <MultiSelect
            label="Available sizes"
            placeholder="Select sizes"
            options={SIZE_OPTIONS}
            value={field.value ?? []}
            onChange={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />

      <div className="flex flex-col gap-3">
        <p className="text-[14px] font-bold text-[#121212]">Product images</p>
        <p className="text-[12px] text-[#65799A] -mt-1">
          Paste an image link or upload one from your computer.
        </p>
        {IMAGE_FIELDS.map((name, index) => (
          <Controller
            key={name}
            name={name}
            control={control}
            rules={index === 0 ? { required: "At least one image is required" } : undefined}
            render={({ field, fieldState }) => (
              <ProductImageInput
                index={index}
                value={field.value}
                onChange={field.onChange}
                onUpload={uploadImage}
                error={fieldState.error?.message}
              />
            )}
          />
        ))}
      </div>

      <Button
        size="lg"
        variant="primary"
        type="submit"
        disabled={submitting}
        className="font-normal mt-2"
      >
        {submitting ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
