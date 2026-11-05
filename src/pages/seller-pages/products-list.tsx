import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Package, Pencil, Plus, Trash2 } from "lucide-react";
import { ClipLoader } from "react-spinners";
import { useSellerProducts } from "../../context/seller-product-context";
import { useToast } from "../../context/toast-context";
import { categoryLabel } from "../../types/product";

export default function ProductsList() {
  const navigate = useNavigate();
  const toast = useToast();
  const { products, loaded, deleteProduct } = useSellerProducts();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    setDeleting(true);
    const done = await deleteProduct(confirmDeleteId);
    setDeleting(false);
    setConfirmDeleteId(null);

    if (!done) {
      toast.error("Couldn't delete that product. Please try again.");
      return;
    }
    toast.success("Product deleted.");
  };

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

      {!loaded ? (
        <div className="bg-white rounded-2xl shadow-sm py-16 flex justify-center">
          <ClipLoader size={28} color="#ED1280" />
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm py-16 text-center">
          <span className="w-14 h-14 rounded-full bg-[#F2E8ED] flex items-center justify-center mx-auto mb-4">
            <Package className="w-6 h-6 text-[#ED1280]" strokeWidth={2} />
          </span>
          <p className="text-[15px] font-semibold text-[#121212] mb-1">No products yet</p>
          <p className="text-sm text-[#65799A] mb-6">
            Add your first product to start selling.
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
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-b border-[#F2E8ED] text-[12px] uppercase tracking-wide text-[#65799A]">
                  <th className="font-semibold px-5 py-3.5">Product</th>
                  <th className="font-semibold px-5 py-3.5">Category</th>
                  <th className="font-semibold px-5 py-3.5 text-right">Price</th>
                  <th className="font-semibold px-5 py-3.5 text-right">Stock</th>
                  <th className="font-semibold px-5 py-3.5">Status</th>
                  <th className="font-semibold px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2E8ED]">
                {products.map((product) => (
                  <tr
                    key={product.id}
                    onClick={() => navigate(`/seller/products/${product.id}`)}
                    className="cursor-pointer hover:bg-[#FAFAFA] transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-lg overflow-hidden bg-[#F2E8ED] shrink-0">
                          {product.images[0] && (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <span className="text-[14px] font-semibold text-[#121212] line-clamp-2 max-w-[240px]">
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[13px] text-[#4a4a4a]">
                      {categoryLabel(product.category)}
                    </td>
                    <td className="px-5 py-4 text-[14px] font-semibold text-[#121212] text-right whitespace-nowrap">
                      ₦{product.price.toFixed(2)}
                    </td>
                    <td className="px-5 py-4 text-[13px] text-[#4a4a4a] text-right">
                      {product.stock}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                          product.isActive
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-stone-100 text-stone-500"
                        }`}
                      >
                        {product.isActive ? "Live" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
