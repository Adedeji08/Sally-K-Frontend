import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { ClipLoader } from "react-spinners";
import { useSellerProducts } from "../../context/seller-product-context";
import { useToast } from "../../context/toast-context";
import { categoryLabel } from "../../types/product";

export default function SellerProductView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { getProduct, deleteProduct, loading, loaded } = useSellerProducts();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const product = id ? getProduct(id) : undefined;

  if (!product && (loading || !loaded)) {
    return (
      <div className="max-w-3xl mx-auto flex justify-center py-20">
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

  const badge = product.isActive
    ? { label: "Live", className: "bg-emerald-50 text-emerald-600" }
    : { label: "Inactive", className: "bg-stone-100 text-stone-500" };

  const handleDelete = async () => {
    setDeleting(true);
    const done = await deleteProduct(product.id);
    setDeleting(false);

    if (!done) {
      toast.error("Couldn't delete that product. Please try again.");
      return;
    }

    toast.success("Product deleted.");
    navigate("/seller/products");
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate("/seller/products")}
        className="flex items-center gap-1.5 text-sm text-[#65799A] hover:text-[#121212] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={2} />
        Back to products
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="rounded-2xl overflow-hidden bg-[#F2E8ED] aspect-[4/5] mb-3">
            {product.images[activeImage] && (
              <img
                src={product.images[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((image, index) => (
                <button
                  key={image + index}
                  onClick={() => setActiveImage(index)}
                  className={`w-14 h-14 rounded-lg overflow-hidden shrink-0 border-2 ${
                    activeImage === index ? "border-[#ED1280]" : "border-transparent"
                  }`}
                >
                  <img src={image} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <span
            className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize mb-3 ${badge.className}`}
          >
            {badge.label}
          </span>

          <h1 className="text-2xl font-semibold text-[#121212] mb-1">{product.name}</h1>
          <p className="text-sm text-[#65799A] mb-3">{categoryLabel(product.category)}</p>
          <p className="text-2xl font-bold text-[#121212] mb-4">₦{product.price.toFixed(2)}</p>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <p className="text-[12px] text-[#65799A] mb-1">Stock</p>
              <p className="text-sm font-semibold text-[#121212]">{product.stock}</p>
            </div>
            <div>
              <p className="text-[12px] text-[#65799A] mb-1">Sizes</p>
              <p className="text-sm font-semibold text-[#121212]">
                {product.sizes.join(", ") || "—"}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-[12px] text-[#65799A] mb-1">Description</p>
            <p className="text-sm text-[#333333] leading-relaxed">{product.description}</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={`/seller/products/${product.id}/edit`}
              className="flex items-center gap-2 bg-[#ED1280] hover:opacity-90 text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-opacity"
            >
              <Pencil className="w-4 h-4" strokeWidth={2} />
              Edit
            </Link>
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-2 border border-[#E5E7EB] text-[#4a4a4a] hover:text-rose-500 hover:border-rose-200 font-semibold px-5 py-2.5 rounded-full text-sm transition-colors"
            >
              <Trash2 className="w-4 h-4" strokeWidth={2} />
              Delete
            </button>
          </div>
        </div>
      </div>

      {confirmDelete && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4"
          onClick={() => setConfirmDelete(false)}
        >
          <div
            className="w-full max-w-[380px] bg-white rounded-3xl shadow-xl p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-[16px] font-semibold text-[#121212] mb-1">Delete product?</h2>
            <p className="text-[13px] text-[#65799A] mb-6">
              This will remove the listing from your store. This can't be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 px-4 py-2.5 rounded-full text-sm font-semibold text-[#4a4a4a] border border-[#E5E7EB] hover:bg-[#F7F2F4] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-full text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 transition-colors disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
