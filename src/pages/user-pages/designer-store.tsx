import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { Package, Star } from "lucide-react";
import Navbar from "../../layouts/navbar";
import { useProductsData } from "./home";
import { useSeller } from "../../context/seller-context";
import { readReviews } from "../../utils/product-reviews";

export default function DesignerStore() {
  const { name } = useParams<{ name: string }>();
  const designerName = name ? decodeURIComponent(name) : "";
  const products = useProductsData();
  const { storeProfile } = useSeller();

  const designerProducts = useMemo(
    () => products.filter((p) => p.designer === designerName),
    [products, designerName]
  );

  const isOwnStore = storeProfile?.brandName === designerName;

  const { averageRating, reviewCount } = useMemo(() => {
    let totalRating = 0;
    let count = 0;
    designerProducts.forEach((p) => {
      readReviews(p.id).forEach((r) => {
        totalRating += r.rating;
        count += 1;
      });
    });
    return {
      averageRating: count > 0 ? totalRating / count : 0,
      reviewCount: count,
    };
  }, [designerProducts]);

  if (designerProducts.length === 0) {
    return (
      <>
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <p className="text-lg font-semibold text-stone-800 mb-2">Store not found</p>
          <p className="text-sm text-stone-400 mb-6">
            We couldn't find any products from "{designerName}".
          </p>
          <Link to="/" className="text-rose-500 font-medium hover:text-rose-600">
            Back to shop
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-stone-400">
              {designerName.charAt(0).toUpperCase()}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-stone-900 mb-2">
            {designerName}
          </h1>
          <p className="text-sm text-stone-500 max-w-lg mb-3">
            {isOwnStore && storeProfile?.bio
              ? storeProfile.bio
              : `Discover unique fashion pieces from ${designerName}.`}
          </p>
          <div className="flex items-center gap-4 text-sm text-stone-500">
            {reviewCount > 0 && (
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4" fill="#f43f5e" stroke="#f43f5e" strokeWidth={2} />
                {averageRating.toFixed(1)} ({reviewCount} review{reviewCount === 1 ? "" : "s"})
              </span>
            )}
            <span className="flex items-center gap-1">
              <Package className="w-4 h-4" strokeWidth={2} />
              {designerProducts.length} product{designerProducts.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {designerProducts.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow group"
            >
              <div className="aspect-[3/4] overflow-hidden bg-stone-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-4">
                <h3 className="text-sm font-semibold text-stone-800 mb-1 truncate">
                  {product.name}
                </h3>
                <p className="text-sm font-bold text-stone-900">₦{product.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
