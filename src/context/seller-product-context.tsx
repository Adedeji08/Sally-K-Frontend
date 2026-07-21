import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type SellerProductStatus = "draft" | "published";

export interface SellerProduct {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  status: SellerProductStatus;
  // Set the moment a product first moves from draft to published — used to
  // simulate an admin review queue (see utils/product-approval.ts).
  submittedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export type SellerProductInput = Omit<
  SellerProduct,
  "id" | "createdAt" | "updatedAt" | "submittedAt"
>;

interface SellerProductContextValue {
  products: SellerProduct[];
  getProduct: (id: number) => SellerProduct | undefined;
  addProduct: (input: SellerProductInput) => SellerProduct;
  updateProduct: (id: number, input: SellerProductInput) => void;
  deleteProduct: (id: number) => void;
}

const PRODUCTS_KEY = "sellerProducts";

function readProductsFromStorage(): SellerProduct[] {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

const SellerProductContext = createContext<SellerProductContextValue | null>(null);

export function SellerProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<SellerProduct[]>(() => readProductsFromStorage());

  useEffect(() => {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  }, [products]);

  const getProduct = (id: number) => products.find((p) => p.id === id);

  const addProduct = (input: SellerProductInput) => {
    const now = Date.now();
    const newProduct: SellerProduct = {
      ...input,
      id: now,
      submittedAt: input.status === "published" ? now : undefined,
      createdAt: now,
      updatedAt: now,
    };
    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = (id: number, input: SellerProductInput) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        // Only start (or restart) the review clock the moment a product
        // newly becomes published, not on every subsequent edit.
        const isNewlyPublished = input.status === "published" && p.status !== "published";
        return {
          ...p,
          ...input,
          submittedAt: isNewlyPublished ? Date.now() : p.submittedAt,
          updatedAt: Date.now(),
        };
      })
    );
  };

  const deleteProduct = (id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const value = useMemo<SellerProductContextValue>(
    () => ({ products, getProduct, addProduct, updateProduct, deleteProduct }),
    [products]
  );

  return (
    <SellerProductContext.Provider value={value}>{children}</SellerProductContext.Provider>
  );
}

export function useSellerProducts() {
  const ctx = useContext(SellerProductContext);
  if (!ctx) {
    throw new Error("useSellerProducts must be used within a SellerProductProvider");
  }
  return ctx;
}
