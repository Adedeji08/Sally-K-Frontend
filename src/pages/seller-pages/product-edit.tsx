import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ClipLoader } from "react-spinners";
import { useSellerProducts } from "../../context/seller-product-context";
import { useToast } from "../../context/toast-context";
import ProductForm from "../../components/seller/product-form";
import type { SellerProductInput } from "../../context/seller-product-context";

export default function ProductEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { getProduct, updateProduct, loading, loaded } = useSellerProducts();
  const [submitting, setSubmitting] = useState(false);

  const product = id ? getProduct(id) : undefined;

  if (!product && (loading || !loaded)) {
    return (
      <div className="max-w-xl mx-auto flex justify-center py-20">
        <ClipLoader size={28} color="#ED1280" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <p className="text-lg font-semibold text-[#121212] mb-2">Product not found</p>
        <p className="text-sm text-[#65799A] mb-6">This listing may have been deleted.</p>
        <Link to="/seller/products" className="text-[#ED1280] font-medium hover:opacity-80">
          Back to products
        </Link>
      </div>
    );
  }

  const handleSubmit = async (input: SellerProductInput) => {
    setSubmitting(true);
    const updated = await updateProduct(product.id, input);
    setSubmitting(false);

    if (!updated) {
      toast.error("Couldn't save your changes. Please try again.");
      return;
    }

    toast.success("Product updated.");
    navigate("/seller/products");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate("/seller/products")}
        className="flex items-center gap-1.5 text-sm text-[#65799A] hover:text-[#121212] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={2} />
        Back to products
      </button>

      <h1 className="text-2xl font-semibold text-[#121212] mb-1">Edit Product</h1>
      <p className="text-sm text-[#65799A] mb-6">Update your listing details.</p>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <ProductForm
          initialValues={product}
          onSubmit={handleSubmit}
          submitLabel="Save Changes"
          submitting={submitting}
        />
      </div>
    </div>
  );
}
