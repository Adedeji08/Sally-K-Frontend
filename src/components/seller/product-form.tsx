import { Controller, useForm } from "react-hook-form";
import Input from "../reusables/input";
import Textarea from "../reusables/textarea";
import Select from "../reusables/select";
import MultiSelect from "../reusables/multi-select";
import Button from "../reusables/button";
import type { SellerProductInput } from "../../context/seller-product-context";

interface ProductFormProps {
  initialValues?: Partial<SellerProductInput>;
  onSubmit: (input: SellerProductInput) => void;
  submitLabel?: string;
}

interface ProductFormValues {
  name: string;
  description: string;
  category: string;
  price: string;
  stock: string;
  sizes: string[];
  colors: string;
  image1: string;
  image2: string;
  image3: string;
  image4: string;
  status: "published" | "draft";
}

const CATEGORY_OPTIONS = [
  { value: "Dresses", label: "Dresses" },
  { value: "Tops", label: "Tops" },
  { value: "Men", label: "Men" },
  { value: "Shoes", label: "Shoes" },
  { value: "Bags", label: "Bags" },
  { value: "Accessories", label: "Accessories" },
];

const SIZE_OPTIONS = [
  { value: "XS", label: "XS" },
  { value: "S", label: "S" },
  { value: "M", label: "M" },
  { value: "L", label: "L" },
  { value: "XL", label: "XL" },
  { value: "One Size", label: "One Size" },
];

const STATUS_OPTIONS = [
  { value: "published", label: "Submit for approval" },
  { value: "draft", label: "Save as draft" },
];

const IMAGE_FIELDS = ["image1", "image2", "image3", "image4"] as const;

export default function ProductForm({
  initialValues,
  onSubmit,
  submitLabel = "Publish Product",
}: ProductFormProps) {
  const { control, handleSubmit } = useForm<ProductFormValues>({
    defaultValues: {
      name: initialValues?.name ?? "",
      description: initialValues?.description ?? "",
      category: initialValues?.category ?? "",
      price: initialValues?.price !== undefined ? String(initialValues.price) : "",
      stock: initialValues?.stock !== undefined ? String(initialValues.stock) : "",
      sizes: initialValues?.sizes ?? [],
      colors: initialValues?.colors?.join(", ") ?? "",
      image1: initialValues?.images?.[0] ?? "",
      image2: initialValues?.images?.[1] ?? "",
      image3: initialValues?.images?.[2] ?? "",
      image4: initialValues?.images?.[3] ?? "",
      status: initialValues?.status ?? "published",
    },
  });

  const submit = (values: ProductFormValues) => {
    const images = [values.image1, values.image2, values.image3, values.image4].filter(
      (url) => url.trim().length > 0
    );
    const colors = values.colors
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    onSubmit({
      name: values.name,
      description: values.description,
      category: values.category,
      price: Number(values.price) || 0,
      stock: Number(values.stock) || 0,
      sizes: values.sizes,
      colors,
      images,
      status: values.status,
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          name="colors"
          control={control}
          render={({ field }) => (
            <Input
              label="Colors"
              placeholder="e.g. Black, Red, Navy"
              value={field.value}
              onChange={field.onChange}
              autoComplete="off"
            />
          )}
        />
      </div>

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
        <p className="text-[14px] font-bold text-[#121212]">Product images (URL)</p>
        {IMAGE_FIELDS.map((name, index) => (
          <Controller
            key={name}
            name={name}
            control={control}
            rules={index === 0 ? { required: "At least one image is required" } : undefined}
            render={({ field, fieldState }) => (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-[#F2E8ED] overflow-hidden shrink-0 flex items-center justify-center">
                  {field.value ? (
                    <img
                      src={field.value}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.visibility = "hidden";
                      }}
                    />
                  ) : (
                    <span className="text-[10px] text-[#95959D]">{index + 1}</span>
                  )}
                </div>
                <div className="flex-1">
                  <Input
                    placeholder={`Image ${index + 1} URL${index === 0 ? "" : " (optional)"}`}
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    autoComplete="off"
                  />
                </div>
              </div>
            )}
          />
        ))}
      </div>

      <div>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select
              label="Visibility"
              options={STATUS_OPTIONS}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <p className="text-[12px] text-[#65799A] mt-1.5">
          Submitted products are reviewed before they appear in the shop.
        </p>
      </div>

      <Button size="lg" variant="primary" type="submit" className="font-normal mt-2">
        {submitLabel}
      </Button>
    </form>
  );
}
