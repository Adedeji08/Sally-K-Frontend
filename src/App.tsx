
import "./App.css";
import RoutesWrapper from "./routes/route-wrapper";
import { ToastProvider } from "./context/toast-context";
import { AuthProvider } from "./context/auth-context";
import { CurrentUserProvider } from "./context/current-user-context";
import { CartProvider } from "./context/cart-context";
import { WishlistProvider } from "./context/wishlist-context";
import { CheckoutProvider } from "./context/checkout-context";
import { OrderProvider } from "./context/order-context";
import { SupportProvider } from "./context/support-context";
import { SellerProvider } from "./context/seller-context";
import { SellerProductProvider } from "./context/seller-product-context";
import { ShopProductProvider } from "./context/shop-product-context";
import LoginModal from "./components/auth/login-modal";

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CurrentUserProvider>
        <CartProvider>
          <WishlistProvider>
            <CheckoutProvider>
              <OrderProvider>
                <SupportProvider>
                  <SellerProvider>
                    <SellerProductProvider>
                      <ShopProductProvider>
                        <div>
                          <RoutesWrapper />
                          <LoginModal />
                        </div>
                      </ShopProductProvider>
                    </SellerProductProvider>
                  </SellerProvider>
                </SupportProvider>
              </OrderProvider>
            </CheckoutProvider>
          </WishlistProvider>
        </CartProvider>
        </CurrentUserProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
