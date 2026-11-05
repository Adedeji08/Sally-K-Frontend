
// Unauthenticated / pre-app screens (login, signup, password reset, seller
// onboarding) plus the final route assembly. The authenticated app itself —
// buyer shop, cart/checkout, orders, and the seller dashboard — lives in
// ./main-routes.
import { useRoutes } from "react-router-dom";
import MainRoutes from "./main-routes";
import NotFound from "../pages/not-found";
import Login from "../pages/auth/login";
import ForgotPassword from "../pages/auth/forgot-password";
import SetPassword from "../pages/auth/set-password";
import SignupRole from "../pages/auth/signup-role";
import Signup from "../pages/auth/signup";
import VerifyEmail from "../pages/auth/verify-email";
import OnboardingSuccess from "../pages/auth/onboarding-success";
import StoreSetup from "../pages/seller-pages/store-setup";
import Verification from "../pages/seller-pages/verification";
import BankAccountSetup from "../pages/seller-pages/bank-account";
import Subscription from "../pages/seller-pages/subscription";

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
            path: "/reset-password",
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
            path: "/verify-email",
            element: (
                <VerifyEmail />
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
            path: "/onboarding/bank-account",
            element: (
                <BankAccountSetup />
            )
        },
        {
            path: "/onboarding/subscription",
            element: (
                <Subscription />
            )
        },
        {
            path: "/onboarding/success",
            element: (
                <OnboardingSuccess />
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
