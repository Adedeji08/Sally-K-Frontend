// The product shape returned by the API — identical for GET /products (shopper
// catalogue) and GET /products/mine (a seller's own listings). Nothing here is
// mocked; every field comes straight from the backend.
export interface ApiProductSeller {
  brandName: string;
  verificationStatus: string;
}

export interface ApiProduct {
  id: string;
  sellerId: string;
  name: string;
  description: string;
  // The API stores categories upper-cased ("DRESSES"). Use `categoryLabel` for
  // display and `toApiCategory` when sending one back.
  category: string;
  price: number;
  images: string[];
  sizes: string[];
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Present on the shopper catalogue (GET /products) so the storefront can show
  // which brand a listing belongs to.
  seller?: ApiProductSeller;
}

// Exactly what POST /products and PATCH /products/:id accept.
export interface ProductInput {
  name: string;
  description: string;
  category: string;
  price: number;
  images: string[];
  sizes: string[];
  stock: number;
}

// "DRESSES" -> "Dresses", "one size" -> "One Size"
export function categoryLabel(category: string): string {
  return category
    .toLowerCase()
    .split(/[\s_-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Form values keep the lower-cased option value ("dresses"); that's what the
// create sample sends, so pass it straight through.
export function toApiCategory(category: string): string {
  return category.trim().toLowerCase();
}
