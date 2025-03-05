import { createBrowserRouter } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";
import DynamicLayout from "./components/DynamicLayout";
import { HomePage } from "./pages/HomePage";

const router = createBrowserRouter([
    {
        path: "/",
        element: <DynamicLayout />, // Byt till DynamicLayout
        children: [
            { path: "/", element: <HomePage /> },
            { path: "/login", element: <LoginPage /> },
            { path: "/register", element: <RegisterPage /> },
            { path: "/profile", element: <ProtectedRoute><ProfilePage /></ProtectedRoute> }
        ]
    }
]);

export default router;