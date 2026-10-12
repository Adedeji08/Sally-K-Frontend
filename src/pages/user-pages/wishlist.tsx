import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import Navbar from "../../layouts/navbar";
import { useAuth } from "../../context/auth-context";
import { useCart } from "../../context/cart-context";
import { useToast } from "../../context/toast-context";
import { useWishlist } from "../../context/wishlist-context";
import { useProductsData } from "./home";

export default function Wishlist() {
  const navigate = useNavigate();
  const { isAuthenticated, openLoginModal } = useAuth();
  const { productIds, removeFromWishlist } = useWishlist();
  const { addItem } = useCart();
  const toast = useToast();
  const productsData = useProductsData();

  useEffect(() => {
    if (!isAuthenticated) {
      openLoginModal("Sign in to view your wishlist.");
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate, openLoginModal]);

  if (!isAuthenticated) return null;

  const wishlistProducts = productsData.filter((p) => productIds.includes(p.id));

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <p className="text-xs text-stone-400 mb-2">
          <Link to="/" className="hover:text-rose-500 transition-colors">
            Home
          </Link>{" "}
          / <span className="text-stone-600">Wishlist</span>
        </p>
        <h1 className="text-2xl md:text-3xl font-semibold text-stone-900 mb-8">My Wishlist</h1>

        {wishlistProducts.length === 0 ? (
          <div className="text-center py-20">
            <span className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-7 h-7 text-stone-400" strokeWidth={2} />
            </span>
            <p className="text-lg font-semibold text-stone-800 mb-1">Your wishlist is empty</p>
            <p className="text-sm text-stone-400 mb-6">
              Tap the heart on any product to save it here for later.
            </p>
            <Link
              to="/"
              className="inline-block bg-rose-500 hover:bg-rose-600 text-white font-semibold px-7 py-3 rounded-full text-sm transition-colors"
            >
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow group"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-stone-100">
                  <Link to={`/product/${product.id}`} className="block w-full h-full">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </Link>
                  <button
                    onClick={() => removeFromWishlist(product.id)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                    aria-label="Remove from wishlist"
                  >
                    <Heart className="w-4 h-4" fill="#f43f5e" stroke="#f43f5e" strokeWidth={2} />
                  </button>
                </div>
                <div className="p-4">
                  <p className="text-xs text-stone-400 font-medium mb-1">{product.designer}</p>
                  <Link to={`/product/${product.id}`}>
                    <h3 className="text-sm font-semibold text-stone-800 mb-1 truncate hover:text-rose-500 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm font-bold text-stone-900">₦{product.price}</p>
                    {product.stock <= 0 ? (
                      <span className="text-xs font-semibold text-stone-400">Out of stock</span>
                    ) : product.needsOptions ? (
                      <Link
                        to={`/product/${product.id}`}
                        className="text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors"
                      >
                        Choose options
                      </Link>
                    ) : (
                      <button
                        onClick={async () => {
                          const result = await addItem({ productId: product.id });
                          if (result.ok) toast.success(`${product.name} added to your bag.`);
                          else toast.error(result.message);
                        }}
                        className="text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors"
                      >
                        Add to Bag
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
