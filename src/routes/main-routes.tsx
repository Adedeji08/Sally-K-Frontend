// Routes for the main application — everything reached once someone is
// using the app (the buyer shop as well as the seller dashboard), as opposed
// to the pre-app auth/onboarding screens declared in routes/index.tsx.
import { UserDashboard } from "../pages/user-pages/home";
import ProductDetail from "../pages/user-pages/product-detail";
import DesignerStore from "../pages/user-pages/designer-store";
import Cart from "../pages/user-pages/cart";
import Shipping from "../pages/user-pages/shipping";
import Payment from "../pages/user-pages/payment";
import Profile from "../pages/user-pages/profile";
import Orders from "../pages/user-pages/orders";
import OrderDetail from "../pages/user-pages/order-detail";
import Wishlist from "../pages/user-pages/wishlist";
import Help from "../pages/user-pages/help";
import Rewards from "../pages/user-pages/rewards";
import SellerLayout from "../layouts/seller-layout";
import DashboardOverview from "../pages/seller-pages/dashboard-overview";
import ProductsList from "../pages/seller-pages/products-list";
import SellerProductView from "../pages/seller-pages/seller-product-view";
import ProductNew from "../pages/seller-pages/product-new";
import ProductEdit from "../pages/seller-pages/product-edit";
import SellerOrders from "../pages/seller-pages/seller-orders";
import SellerOrderDetail from "../pages/seller-pages/seller-order-detail";
import SellerStoreProfile from "../pages/seller-pages/seller-store-profile";
import SellerSubscription from "../pages/seller-pages/seller-subscription";
import SellerPayouts from "../pages/seller-pages/seller-payouts";

const MainRoutes = [
    {
        path: "/",
        element: (
            <UserDashboard />
        )
    },
    {
        path: "/product/:id",
        element: (
            <ProductDetail />
        )
    },
    {
        path: "/designer/:name",
        element: (
            <DesignerStore />
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
    {
        path: "/seller",
        element: (
            <SellerLayout />
        ),
        children: [
            {
                path: "dashboard",
                element: (
                    <DashboardOverview />
                )
            },
            {
                path: "products",
                element: (
                    <ProductsList />
                )
            },
            {
                path: "products/:id",
                element: (
                    <SellerProductView />
                )
            },
            {
                path: "products/new",
                element: (
                    <ProductNew />
                )
            },
            {
                path: "products/:id/edit",
                element: (
                    <ProductEdit />
                )
            },
            {
                path: "orders",
                element: (
                    <SellerOrders />
                )
            },
            {
                path: "orders/:id",
                element: (
                    <SellerOrderDetail />
                )
            },
            {
                path: "store-profile",
                element: (
                    <SellerStoreProfile />
                )
            },
            {
                path: "subscription",
                element: (
                    <SellerSubscription />
                )
            },
            {
                path: "payouts",
                element: (
                    <SellerPayouts />
                )
            },
        ],
    },
];

export default MainRoutes;
