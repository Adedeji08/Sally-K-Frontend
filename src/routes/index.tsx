
import { useRoutes } from "react-router-dom";
import MainRoutes from "./main-routes";
import NotFound from "../pages/not-found";
import Login from "../pages/auth/login";
import ForgotPassword from "../pages/auth/forgot-password";
import SetPassword from "../pages/auth/set-password";
import SignupRole from "../pages/auth/signup-role";
import Signup from "../pages/auth/signup";
import OnboardingSuccess from "../pages/auth/onboarding-success";
import StoreSetup from "../pages/seller-pages/store-setup";
import Verification from "../pages/seller-pages/verification";
import ProductDetail from "../pages/user-pages/product-detail";
import Cart from "../pages/user-pages/cart";
import Shipping from "../pages/user-pages/shipping";
import Payment from "../pages/user-pages/payment";
import Profile from "../pages/user-pages/profile";
import Orders from "../pages/user-pages/orders";
import OrderDetail from "../pages/user-pages/order-detail";
import Wishlist from "../pages/user-pages/wishlist";
import Help from "../pages/user-pages/help";
import Rewards from "../pages/user-pages/rewards";



export default function ThemeRoutes() {

    return useRoutes([
        ...MainRoutes,
        {
            path: "/login",
            element: (
                <Login />
            )
        },
        {
            path: "/forgot-password",
            element: (
                <ForgotPassword />
            )
        },
        {
            path: "/set-password",
            element: (
                <SetPassword />
            )
        },
        {
            path: "/signup",
            element: (
                <SignupRole />
            )
        },
        {
            path: "/signup/:role",
            element: (
                <Signup />
            )
        },
        {
            path: "/onboarding/store",
            element: (
                <StoreSetup />
            )
        },
        {
            path: "/onboarding/verification",
            element: (
                <Verification />
            )
        },
        {
            path: "/onboarding/success",
            element: (
                <OnboardingSuccess />
            )
        },
        {
            path: "/product/:id",
            element: (
                <ProductDetail />
            )
        },
        {
            path: "/cart",
            element: (
                <Cart />
            )
        },
        {
            path: "/checkout/shipping",
            element: (
                <Shipping />
            )
        },
        {
            path: "/payment",
            element: (
                <Payment />
            )
        },
        {
            path: "/profile",
            element: (
                <Profile />
            )
        },
        {
            path: "/orders",
            element: (
                <Orders />
            )
        },
        {
            path: "/orders/:id",
            element: (
                <OrderDetail />
            )
        },
        {
            path: "/wishlist",
            element: (
                <Wishlist />
            )
        },
        {
            path: "/help",
            element: (
                <Help />
            )
        },
        {
            path: "/rewards",
            element: (
                <Rewards />
            )
        },

        // 404
        {
            path: "*",
            element: (
                <NotFound />
            )
        },
    ]);
}
