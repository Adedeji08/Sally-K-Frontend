// Routes for the main application — everything reached once someone is
// using the app (the buyer shop as well as the seller dashboard), as opposed
// to the pre-app auth/onboarding screens declared in routes/index.tsx.
import { ShopPage, UserDashboard } from "../pages/user-pages/home";
import ProductDetail from "../pages/user-pages/product-detail";
import DesignerStore from "../pages/user-pages/designer-store";
import Cart from "../pages/user-pages/cart";
import Shipping from "../pages/user-pages/shipping";
import Payment from "../pages/user-pages/payment";
import PaymentCallback from "../pages/user-pages/payment-callback";
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
import SellerPayouts from "../pages/seller-pages/seller-payouts";
import MeasurementsDashboard from "../pages/seller-pages/measurements/measurements-dashboard";
import MeasurementForm from "../pages/seller-pages/measurements/measurement-form";
import MeasurementDetail from "../pages/seller-pages/measurements/measurement-detail";
import ClientDetail from "../pages/seller-pages/measurements/client-detail";
import SketchesGallery from "../pages/seller-pages/sketches/sketches-gallery";
import SketchEditor from "../pages/seller-pages/sketches/sketch-editor";
import SketchDetail from "../pages/seller-pages/sketches/sketch-detail";

const MainRoutes = [
    {
        path: "/",
        element: (
            <UserDashboard />
        )
    },
    {
        // Catalogue page the navbar links to: /shop?category=Women, /shop?tag=New, ...
        path: "/shop",
        element: (
            <ShopPage />
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
        // Paystack redirects here after checkout (backend PAYSTACK_CALLBACK_URL
        // defaults to CORS_ORIGIN + "/payment/callback").
        path: "/payment/callback",
        element: (
            <PaymentCallback />
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
                path: "measurements",
                element: <MeasurementsDashboard />
            },
            {
                path: "measurements/new",
                element: <MeasurementForm />
            },
            {
                path: "measurements/clients/:id",
                element: <ClientDetail />
            },
            {
                path: "measurements/:id",
                element: <MeasurementDetail />
            },
            {
                path: "measurements/:id/edit",
                element: <MeasurementForm />
            },
            {
                path: "sketches",
                element: <SketchesGallery />
            },
            {
                path: "sketches/new",
                element: <SketchEditor />
            },
            {
                path: "sketches/:id",
                element: <SketchDetail />
            },
            {
                path: "sketches/:id/edit",
                element: <SketchEditor />
            },
            {
                path: "store-profile",
                element: (
                    <SellerStoreProfile />
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
