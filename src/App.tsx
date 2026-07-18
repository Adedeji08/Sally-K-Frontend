
import "./App.css";
import RoutesWrapper from "./routes/route-wrapper";
import { AuthProvider } from "./context/auth-context";
import { CartProvider } from "./context/cart-context";
import { WishlistProvider } from "./context/wishlist-context";
import { CheckoutProvider } from "./context/checkout-context";
import { OrderProvider } from "./context/order-context";
import { SupportProvider } from "./context/support-context";
import LoginModal from "./components/auth/login-modal";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <CheckoutProvider>
            <OrderProvider>
              <SupportProvider>
                <div>
                  <RoutesWrapper />
                  <LoginModal />
                </div>
              </SupportProvider>
            </OrderProvider>
          </CheckoutProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;