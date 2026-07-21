import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Package, Pencil, Plus, Trash2 } from "lucide-react";
import { useSellerProducts } from "../../context/seller-product-context";
import type { SellerProduct } from "../../context/seller-product-context";
import { getApprovalStatus } from "../../utils/product-approval";

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-stone-100 text-stone-500" },
  pending: { label: "Awaiting Approval", className: "bg-amber-50 text-amber-600" },
  approved: { label: "Live", className: "bg-emerald-50 text-emerald-600" },
};

function getStatusKey(product: SellerProduct) {
  if (product.status === "draft") return "draft";
  return product.submittedAt ? getApprovalStatus(product.submittedAt) : "pending";
}

export default function ProductsList() {
  const navigate = useNavigate();
  const { products, deleteProduct } = useSellerProducts();
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#121212] mb-1">Products</h1>
          <p className="text-sm text-[#65799A]">Manage your storefront listings.</p>
        </div>
        <Link
          to="/seller/products/new"
          className="flex items-center gap-2 bg-[#ED1280] hover:opacity-90 text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-opacity"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm py-16 text-center">
          <span className="w-14 h-14 rounded-full bg-[#F2E8ED] flex items-center justify-center mx-auto mb-4">
            <Package className="w-6 h-6 text-[#ED1280]" strokeWidth={2} />
          </span>
          <p className="text-[15px] font-semibold text-[#121212] mb-1">No products yet</p>
          <p className="text-sm text-[#65799A] mb-6">
            Add your first product to start selling on Sally-K.
          </p>
          <Link
            to="/seller/products/new"
            className="inline-block bg-[#ED1280] hover:opacity-90 text-white font-semibold px-6 py-2.5 rounded-full text-sm transition-opacity"
          >
            Add Product
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex flex-col divide-y divide-[#F2E8ED]">
            {products.map((product) => {
              const badge = STATUS_BADGE[getStatusKey(product)];
              return (
                <div
                  key={product.id}
                  onClick={() => navigate(`/seller/products/${product.id}`)}
                  role="button"
                  tabIndex={0}
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-[#FAFAFA] transition-colors"
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#F2E8ED] shrink-0">
                    {product.images[0] && (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-[#121212] truncate">
                      {product.name}
                    </p>
                    <p className="text-[12px] text-[#65799A]">
                      {product.category} · Stock: {product.stock}
                    </p>
                  </div>

                  <span
                    className={`hidden sm:inline-block text-[10px] font-semibold px-2.5 py-1 rounded-full ${badge.className}`}
                  >
                    {badge.label}
                  </span>

                  <p className="text-[14px] font-bold text-[#121212] w-20 text-right shrink-0">
                    ₦{product.price.toFixed(2)}
                  </p>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      to={`/seller/products/${product.id}/edit`}
                      onClick={(e) => e.stopPropagation()}
                      className="w-8 h-8 rounded-full bg-[#F2E8ED] flex items-center justify-center text-[#4a4a4a] hover:text-[#ED1280] transition-colors"
                      aria-label="Edit product"
                    >
                      <Pencil className="w-3.5 h-3.5" strokeWidth={2} />
                    </Link>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDeleteId(product.id);
                      }}
                      className="w-8 h-8 rounded-full bg-[#F2E8ED] flex items-center justify-center text-[#4a4a4a] hover:text-rose-500 transition-colors"
                      aria-label="Delete product"
                    >
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {confirmDeleteId !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4"
          onClick={() => setConfirmDeleteId(null)}
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
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 px-4 py-2.5 rounded-full text-sm font-semibold text-[#4a4a4a] border border-[#E5E7EB] hover:bg-[#F7F2F4] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteProduct(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
                className="flex-1 px-4 py-2.5 rounded-full text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
