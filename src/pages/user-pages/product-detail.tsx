import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Heart, Minus, Plus, ShoppingBag, Star } from "lucide-react";
import { ClipLoader } from "react-spinners";
import Navbar from "../../layouts/navbar";
import { useAuth } from "../../context/auth-context";
import { useCart } from "../../context/cart-context";
import { useWishlist } from "../../context/wishlist-context";
import { useShopProducts } from "../../context/shop-product-context";
import useProduct from "../../hooks/use-product";
import { categoryLabel } from "../../types/product";
import { useCurrentUser } from "../../context/current-user-context";
import { useToast } from "../../context/toast-context";
import useProductReviews from "../../hooks/use-product-reviews";

function formatTimeAgo(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return "1 month ago";
  return `${months} months ago`;
}

// Seller-entered colour names ("navy") render as their CSS colour; anything the
// browser doesn't know ("wine") falls back to a neutral swatch.
function swatchColor(color: string): string {
  return CSS.supports("color", color) ? color : "#E7E5E4";
}

// Keyed by id so size/colour/image/review state starts fresh per product.
export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  return <ProductDetailView key={id} id={id} />;
}

function ProductDetailView({ id }: { id: string | undefined }) {
  const navigate = useNavigate();
  const { isAuthenticated, openLoginModal } = useAuth();
  const { currentUser } = useCurrentUser();
  const { addItem } = useCart();
  const toast = useToast();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { products: catalogue } = useShopProducts();

  // GET /products/:id — 404s for inactive or missing products. The catalogue
  // row (if the shopper came from the grid) renders while it loads.
  const { product, loading } = useProduct(
    id,
    "public",
    catalogue.find((p) => p.id === id)
  );

  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);

  const { reviews, summary, createReview, updateReview, deleteReview } = useProductReviews(id);
  // The review being edited, or null when the form is for a new review.
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [savingReview, setSavingReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewError, setReviewError] = useState("");

  if (!product && loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center py-24">
          <ClipLoader size={28} color="#f43f5e" />
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <p className="text-lg font-semibold text-stone-800 mb-2">Product not found</p>
          <p className="text-sm text-stone-400 mb-6">
            This item may have been removed or is no longer available.
          </p>
          <Link to="/" className="text-rose-500 font-medium hover:text-rose-600">
            Back to shop
          </Link>
        </div>
      </>
    );
  }

  const designer = product.seller?.brandName ?? "Independent Designer";
  const colors = product.colors ?? [];
  const activeSize = selectedSize || product.sizes[0];
  const activeColor = selectedColor || colors[0];
  const outOfStock = product.stock <= 0;
  const reviewCount = summary.count;
  const rating = summary.average;
  // One review per shopper per product (the API 409s a second one), so if they
  // already have one the form becomes "edit".
  const myReview = currentUser ? reviews.find((r) => r.userId === currentUser.id) : undefined;
  const showReviewForm = !myReview || editingReviewId === myReview.id;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      openLoginModal("Sign in to add items to your bag and check out.");
      return;
    }
    setAdding(true);
    const result = await addItem(
      { productId: product.id, size: activeSize, color: activeColor },
      quantity
    );
    setAdding(false);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const resetReviewForm = () => {
    setEditingReviewId(null);
    setReviewRating(0);
    setReviewComment("");
    setReviewError("");
  };

  const startEditingReview = () => {
    if (!myReview) return;
    setEditingReviewId(myReview.id);
    setReviewRating(myReview.rating);
    setReviewComment(myReview.comment);
    setReviewError("");
  };

  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      openLoginModal("Sign in to share your thoughts about this product.");
      return;
    }
    if (reviewRating === 0) {
      setReviewError("Please select a star rating.");
      return;
    }
    const comment = reviewComment.trim();
    if (comment.length < 5) {
      setReviewError("Please write at least 5 characters.");
      return;
    }

    setSavingReview(true);
    const input = { rating: reviewRating, comment };
    const result = editingReviewId
      ? await updateReview(editingReviewId, input)
      : await createReview(input);
    setSavingReview(false);

    if (!result.ok) {
      setReviewError(result.message);
      return;
    }
    toast.success(editingReviewId ? "Review updated." : "Thanks for your review!");
    resetReviewForm();
  };

  const handleDeleteReview = async () => {
    if (!myReview) return;
    const result = await deleteReview(myReview.id);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success("Review deleted.");
    resetReviewForm();
  };

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Images */}
          <div>
          <div className="relative rounded-2xl overflow-hidden bg-stone-100 aspect-[4/5]">
            {product.images[activeImage] && (
              <img
                src={product.images[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            )}
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  openLoginModal("Sign in to save items to your wishlist.");
                  return;
                }
                toggleWishlist(product.id);
              }}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:bg-white transition-colors"
              aria-label={isWishlisted(product.id) ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart
                className="w-5 h-5"
                fill={isWishlisted(product.id) ? "#f43f5e" : "none"}
                stroke={isWishlisted(product.id) ? "#f43f5e" : "#57534e"}
                strokeWidth={2}
              />
            </button>
          </div>

          {product.images.length > 1 && (
            <div className="flex gap-2 mt-3">
              {product.images.map((src, index) => (
                <button
                  key={src}
                  onClick={() => setActiveImage(index)}
                  className={`w-16 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    activeImage === index ? "border-rose-500" : "border-transparent"
                  }`}
                  aria-label={`View image ${index + 1}`}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
          </div>

          {/* Details */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-stone-400 mb-2">
              {categoryLabel(product.category)}
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold text-stone-900 mb-1">
              {product.name}
            </h1>
            <p className="text-sm text-stone-400 mb-3">
              by{" "}
              <Link
                to={`/designer/${encodeURIComponent(designer)}`}
                className="text-rose-500 font-medium hover:text-rose-600"
              >
                {designer}
              </Link>
            </p>

            <div className="flex items-center gap-1.5 mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4"
                  fill={i < Math.round(rating) ? "#f43f5e" : "none"}
                  stroke={i < Math.round(rating) ? "#f43f5e" : "#d6d3d1"}
                  strokeWidth={2}
                />
              ))}
              <span className="text-xs text-stone-400 ml-1">
                {reviewCount > 0
                  ? `${rating.toFixed(1)} (${reviewCount} review${reviewCount === 1 ? "" : "s"})`
                  : "No reviews yet"}
              </span>
            </div>

            <p className="text-2xl font-bold text-stone-900 mb-6">₦{product.price.toFixed(2)}</p>

            {/* Color */}
            {colors.length > 0 && (
              <div className="mb-5">
                <p className="text-sm font-medium text-stone-700 mb-2">
                  Color: <span className="capitalize">{activeColor}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full border-2 p-0.5 transition-all ${
                        activeColor === color ? "border-rose-500 scale-110" : "border-stone-200"
                      }`}
                      aria-label={color}
                      title={color}
                    >
                      <span
                        className="block w-full h-full rounded-full"
                        style={{ backgroundColor: swatchColor(color) }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size */}
            {product.sizes.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-stone-700 mb-2">Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      activeSize === size
                        ? "border-rose-500 text-rose-500 bg-rose-50"
                        : "border-stone-200 text-stone-600 hover:border-stone-300"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <p className="text-sm font-medium text-stone-700 mb-2">Quantity</p>
              <div className="inline-flex items-center gap-4 border border-stone-200 rounded-full px-4 py-2">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
                  <Minus className="w-4 h-4 text-stone-500" strokeWidth={2} />
                </button>
                <span className="text-sm font-semibold text-stone-800 w-4 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(Math.max(product.stock, 1), q + 1))}
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4 text-stone-500" strokeWidth={2} />
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={outOfStock || adding}
              className="w-full py-3.5 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-colors bg-rose-500 hover:bg-rose-600 text-white disabled:bg-stone-300 disabled:cursor-not-allowed"
            >
              <ShoppingBag className="w-4 h-4" strokeWidth={2} />
              {outOfStock
                ? "Out of stock"
                : adding
                  ? "Adding..."
                  : added
                    ? "Added to bag!"
                    : "Add to Cart"}
            </button>

            {added && (
              <Link
                to="/cart"
                className="block text-center text-sm text-rose-500 hover:text-rose-600 font-medium mt-3"
              >
                View bag →
              </Link>
            )}

            <div className="mt-8 pt-6 border-t border-stone-100">
              <h2 className="text-sm font-semibold text-stone-800 mb-2">Product Description</h2>
              <p className="text-sm text-stone-500 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-14 max-w-3xl">
          <h2 className="text-xl font-semibold text-stone-900 mb-4">
            Customer Reviews {reviewCount > 0 && `(${reviewCount})`}
          </h2>

          {/* Write a review */}
          <div className="bg-white rounded-2xl shadow-sm p-5 mb-8">
            {isAuthenticated && !showReviewForm && myReview ? (
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className="text-sm text-stone-500">You've reviewed this product.</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={startEditingReview}
                    className="border border-stone-200 text-stone-700 font-semibold px-5 py-2 rounded-full text-sm hover:bg-stone-50 transition-colors"
                  >
                    Edit review
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteReview}
                    className="text-sm font-semibold text-stone-400 hover:text-rose-500 px-3 py-2 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : isAuthenticated ? (
              <>
                <p className="text-sm font-semibold text-stone-800 mb-3">
                  {editingReviewId ? "Edit your review" : "Write a review"}
                </p>
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const starValue = i + 1;
                    const active = starValue <= (hoverRating || reviewRating);
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setReviewRating(starValue);
                          setReviewError("");
                        }}
                        onMouseEnter={() => setHoverRating(starValue)}
                        onMouseLeave={() => setHoverRating(0)}
                        aria-label={`Rate ${starValue} star${starValue > 1 ? "s" : ""}`}
                      >
                        <Star
                          className="w-6 h-6"
                          fill={active ? "#f43f5e" : "none"}
                          stroke={active ? "#f43f5e" : "#d6d3d1"}
                          strokeWidth={2}
                        />
                      </button>
                    );
                  })}
                </div>
                <textarea
                  value={reviewComment}
                  onChange={(e) => {
                    setReviewComment(e.target.value);
                    setReviewError("");
                  }}
                  placeholder="Share your thoughts on the fit, quality, and style..."
                  rows={3}
                  className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-700 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all mb-2"
                />
                {reviewError && <p className="text-xs text-rose-500 mb-2">{reviewError}</p>}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSubmitReview}
                    disabled={savingReview}
                    className="bg-rose-500 hover:bg-rose-600 text-white font-semibold px-6 py-2.5 rounded-full text-sm transition-colors disabled:opacity-60"
                  >
                    {savingReview ? "Saving..." : editingReviewId ? "Save Changes" : "Post Review"}
                  </button>
                  {editingReviewId && (
                    <button
                      type="button"
                      onClick={resetReviewForm}
                      className="text-sm font-semibold text-stone-500 hover:text-stone-700 px-4 py-2.5 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className="text-sm text-stone-500">
                  Sign in to share your thoughts about this product.
                </p>
                <button
                  type="button"
                  onClick={() => openLoginModal("Sign in to write a review.")}
                  className="bg-rose-500 hover:bg-rose-600 text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-colors"
                >
                  Sign in
                </button>
              </div>
            )}
          </div>

          {reviews.length === 0 ? (
            <p className="text-sm text-stone-400">
              No reviews yet — be the first to share your experience.
            </p>
          ) : (
            <div className="divide-y divide-stone-100">
              {reviews.map((review) => (
                <div key={review.id} className="py-5">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-stone-800">
                      {review.user.fullName}
                      {review.userId === currentUser?.id && (
                        <span className="ml-2 text-[11px] font-medium text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">
                          You
                        </span>
                      )}
                    </p>
                    <span className="text-xs text-stone-400">
                      {formatTimeAgo(review.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-3.5 h-3.5"
                        fill={i < review.rating ? "#f43f5e" : "none"}
                        stroke={i < review.rating ? "#f43f5e" : "#d6d3d1"}
                        strokeWidth={2}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-stone-500">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
