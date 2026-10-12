import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useAuth } from "./auth-context";
import useRequest from "../hooks/use-req";

// One line of GET /cart, flattened for the bag/checkout screens. `lineId` is
// the server's cart item id (used for PATCH/DELETE /cart/:id).
export interface CartItem {
  lineId: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  size?: string;
  color?: string;
  quantity: number;
  stock: number;
  isActive: boolean;
}

interface ApiCartItem {
  id: string;
  productId: string;
  size: string | null;
  color: string | null;
  quantity: number;
  product: { name: string; price: number; images: string[]; stock: number; isActive: boolean };
}

export interface AddToCartInput {
  productId: string;
  size?: string;
  color?: string;
}

// Writes resolve with the API's message on failure ("Only 2 left in stock",
// "Select a size for this product") so callers can toast it.
type CartResult = { ok: true } | { ok: false; message: string };

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  loading: boolean;
  // True once the first GET /cart for this session has resolved — checkout
  // pages wait for it before deciding the bag is empty.
  loaded: boolean;
  refetch: () => Promise<void>;
  addItem: (item: AddToCartInput, quantity?: number) => Promise<CartResult>;
  updateQuantity: (lineId: string, quantity: number) => Promise<CartResult>;
  removeItem: (lineId: string) => Promise<CartResult>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

const ok = (status: number) => status >= 200 && status < 300;

function toCartItem(line: ApiCartItem): CartItem {
  return {
    lineId: line.id,
    productId: line.productId,
    name: line.product.name,
    price: line.product.price,
    image: line.product.images[0] ?? "",
    size: line.size ?? undefined,
    color: line.color ?? undefined,
    quantity: line.quantity,
    stock: line.product.stock,
    isActive: line.product.isActive,
  };
}

function failure(json: { message?: string } | undefined, fallback: string): CartResult {
  return { ok: false, message: json?.message || fallback };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();

  const { makeRequest: fetchReq } = useRequest("/cart", "GET");
  const { makeRequest: addReq } = useRequest("/cart", "POST");
  const { makeRequest: updateReq } = useRequest("/cart", "PATCH");
  const { makeRequest: removeReq } = useRequest("/cart", "DELETE");

  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const refetch = async () => {
    setLoading(true);
    const [json, status] = await fetchReq();
    setLoading(false);
    setLoaded(true);
    if (ok(status) && Array.isArray(json?.data?.items)) {
      setItems((json.data.items as ApiCartItem[]).map(toCartItem));
    }
  };

  // The cart lives on the server per user: load it on login, drop it on logout.
  // The bag used to live in localStorage — clear that leftover once.
  useEffect(() => {
    localStorage.removeItem("cart");
    if (isAuthenticated) {
      refetch();
    } else {
      setItems([]);
      setLoaded(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const addItem: CartContextValue["addItem"] = async (item, quantity = 1) => {
    const [json, status] = await addReq({ ...item, quantity });
    if (!ok(status)) return failure(json, "Couldn't add that to your bag. Try again.");

    // Same product/size/colour merges into the existing line server-side.
    const line = toCartItem(json.data as ApiCartItem);
    setItems((prev) =>
      prev.some((l) => l.lineId === line.lineId)
        ? prev.map((l) => (l.lineId === line.lineId ? line : l))
        : [...prev, line]
    );
    return { ok: true };
  };

  const removeItem: CartContextValue["removeItem"] = async (lineId) => {
    const snapshot = items;
    setItems((prev) => prev.filter((l) => l.lineId !== lineId));
    const [json, status] = await removeReq(undefined, undefined, lineId);
    if (!ok(status)) {
      setItems(snapshot);
      return failure(json, "Couldn't remove that item. Try again.");
    }
    return { ok: true };
  };

  const updateQuantity: CartContextValue["updateQuantity"] = async (lineId, quantity) => {
    if (quantity <= 0) return removeItem(lineId);

    // Optimistic so the +/- buttons feel instant; rolled back if the API
    // refuses (usually stock).
    const snapshot = items;
    setItems((prev) => prev.map((l) => (l.lineId === lineId ? { ...l, quantity } : l)));
    const [json, status] = await updateReq({ quantity }, undefined, lineId);
    if (!ok(status)) {
      setItems(snapshot);
      return failure(json, "Couldn't update the quantity. Try again.");
    }
    return { ok: true };
  };

  // No bulk endpoint — remove each line (used after an order is placed).
  const clearCart = async () => {
    const lineIds = items.map((l) => l.lineId);
    setItems([]);
    await Promise.all(lineIds.map((id) => removeReq(undefined, undefined, id)));
  };

  const totalItems = items.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = items.reduce((sum, line) => sum + line.quantity * line.price, 0);

  const value: CartContextValue = {
    items,
    totalItems,
    subtotal,
    loading,
    loaded,
    refetch,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
