import { useEffect, useState } from "react";
import useRequest from "./use-req";

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  user: { fullName: string };
}

export interface RatingSummary {
  average: number;
  count: number;
}

export interface ReviewInput {
  rating: number;
  comment: string;
}

// Failures carry the API message ("You already reviewed this product...").
type ReviewResult = { ok: true } | { ok: false; message: string };

const ok = (status: number) => status >= 200 && status < 300;

function summarize(reviews: ProductReview[]): RatingSummary {
  if (!reviews.length) return { average: 0, count: 0 };
  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  return { average: Math.round((total / reviews.length) * 10) / 10, count: reviews.length };
}

function failure(
  json: { message?: string; errors?: Record<string, string> } | undefined,
  fallback: string
): ReviewResult {
  // 422s put the useful text in per-field errors.
  const fieldError = json?.errors && Object.values(json.errors)[0];
  return { ok: false, message: fieldError || json?.message || fallback };
}

// GET/POST /reviews and PATCH/DELETE /reviews/:id for one product. The summary
// is recomputed locally after each write so the stars update immediately.
export default function useProductReviews(productId: string | undefined) {
  const { makeRequest: listReq } = useRequest("/reviews", "GET");
  const { makeRequest: createReq } = useRequest("/reviews", "POST");
  const { makeRequest: updateReq } = useRequest("/reviews", "PATCH");
  const { makeRequest: deleteReq } = useRequest("/reviews", "DELETE");

  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [summary, setSummary] = useState<RatingSummary>({ average: 0, count: 0 });
  const [loading, setLoading] = useState(Boolean(productId));

  useEffect(() => {
    if (!productId) return;
    let cancelled = false;
    listReq(undefined, { productId }).then(([json, status]) => {
      if (cancelled) return;
      setLoading(false);
      if (ok(status) && Array.isArray(json?.data?.reviews)) {
        setReviews(json.data.reviews);
        setSummary(json.data.summary ?? summarize(json.data.reviews));
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const apply = (next: ProductReview[]) => {
    setReviews(next);
    setSummary(summarize(next));
  };

  const createReview = async (input: ReviewInput): Promise<ReviewResult> => {
    if (!productId) return { ok: false, message: "Product not found" };
    const [json, status] = await createReq({ productId, ...input });
    if (!ok(status)) return failure(json, "Couldn't post your review. Try again.");
    apply([json.data as ProductReview, ...reviews]);
    return { ok: true };
  };

  const updateReview = async (reviewId: string, input: ReviewInput): Promise<ReviewResult> => {
    const [json, status] = await updateReq(input, undefined, reviewId);
    if (!ok(status)) return failure(json, "Couldn't update your review. Try again.");
    const updated = json.data as ProductReview;
    apply(reviews.map((r) => (r.id === reviewId ? { ...r, ...updated } : r)));
    return { ok: true };
  };

  const deleteReview = async (reviewId: string): Promise<ReviewResult> => {
    const [json, status] = await deleteReq(undefined, undefined, reviewId);
    if (!ok(status)) return failure(json, "Couldn't delete your review. Try again.");
    apply(reviews.filter((r) => r.id !== reviewId));
    return { ok: true };
  };

  return { reviews, summary, loading, createReview, updateReview, deleteReview };
}
