export interface ProductReview {
  id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: number;
}

const REVIEWS_KEY_PREFIX = "productReviews:";

function seedReviews(): ProductReview[] {
  const now = Date.now();
  return [
    {
      id: "seed-1",
      name: "Sarah J.",
      rating: 5,
      comment:
        "Absolutely breathtaking! The quality is superb and it fits like a dream. I received so many compliments.",
      createdAt: now - 14 * 86400000,
    },
    {
      id: "seed-2",
      name: "Michelle L.",
      rating: 4,
      comment:
        "A beautiful piece. The color is slightly different in person but still lovely. True to size.",
      createdAt: now - 30 * 86400000,
    },
  ];
}

export function readReviews(productId: number): ProductReview[] {
  try {
    const raw = localStorage.getItem(REVIEWS_KEY_PREFIX + productId);
    return raw ? JSON.parse(raw) : seedReviews();
  } catch {
    return seedReviews();
  }
}

export function writeReviews(productId: number, reviews: ProductReview[]) {
  localStorage.setItem(REVIEWS_KEY_PREFIX + productId, JSON.stringify(reviews));
}
