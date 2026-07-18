import { UserDashboard } from "../pages/user-pages/home";
import MainLayout from "../layouts/sidebar";


const AppRoutes = [
    {
        path: "/",
        element: (
            <>
                <UserDashboard />
            </>
        )
    },
    {
        path: "/",
        element: (
            //   <AuthGuard>
            <>
                <MainLayout />
            </>
            //   </AuthGuard>
        ),
        children: [
            // {
            //     path: "/dashboard",
            //     element: (
            //         <>
            //             <UserDashboard />
            //         </>
            //     )
            // },

        ],
    },

];

export default AppRoutes;