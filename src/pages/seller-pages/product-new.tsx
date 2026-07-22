import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";
import { useSeller } from "../../context/seller-context";
import { useSellerProducts } from "../../context/seller-product-context";
import ProductForm from "../../components/seller/product-form";
import type { SellerProductInput } from "../../context/seller-product-context";

export default function ProductNew() {
  const navigate = useNavigate();
  const { canSell, isVerified, isSubscribed } = useSeller();
  const { addProduct } = useSellerProducts();

  const handleSubmit = (input: SellerProductInput) => {
    addProduct(input);
    navigate("/seller/products");
  };

  if (!canSell) {
    return (
      <div className="max-w-xl mx-auto">
        <button
          onClick={() => navigate("/seller/products")}
          className="flex items-center gap-1.5 text-sm text-[#65799A] hover:text-[#121212] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          Back to products
        </button>

        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <span className="w-14 h-14 rounded-full bg-[#F2E8ED] flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-[#ED1280]" strokeWidth={2} />
          </span>
          <h1 className="text-lg font-semibold text-[#121212] mb-1">
            Finish setup to publish products
          </h1>
          <p className="text-sm text-[#65799A] mb-6 max-w-sm mx-auto">
            You need {!isVerified && "business verification"}
            {!isVerified && !isSubscribed && " and "}
            {!isSubscribed && "an active subscription"} before you can add new products.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {!isVerified && (
              <Link
                to="/onboarding/verification"
                className="bg-[#ED1280] hover:opacity-90 text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-opacity"
              >
                Verify my business
              </Link>
            )}
            {!isSubscribed && (
              <Link
                to="/seller/subscription"
                className={
                  isVerified
                    ? "bg-[#ED1280] hover:opacity-90 text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-opacity"
                    : "border border-[#E5E7EB] text-[#4a4a4a] font-semibold px-5 py-2.5 rounded-full text-sm hover:bg-[#F7F2F4] transition-colors"
                }
              >
                Choose a plan
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate("/seller/products")}
        className="flex items-center gap-1.5 text-sm text-[#65799A] hover:text-[#121212] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={2} />
        Back to products
      </button>

      <h1 className="text-2xl font-semibold text-[#121212] mb-1">Add Product</h1>
      <p className="text-sm text-[#65799A] mb-6">
        Fill in the details shoppers will see on your listing.
      </p>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <ProductForm onSubmit={handleSubmit} submitLabel="Publish Product" />
      </div>
    </div>
  );
}
