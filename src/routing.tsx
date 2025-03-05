import { createBrowserRouter } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";
import DynamicLayout from "./components/DynamicLayout";
import { HomePage } from "./pages/HomePage";
import BookPage from "./pages/BookPage";
import BookDetailPage from "./components/BookDetailPage";

const router = createBrowserRouter([
    {
        path: "/",
        element: <DynamicLayout />, // Byt till DynamicLayout
        children: [
            { path: "/", element: <HomePage /> },
            { path: "/login", element: <LoginPage /> },
            { path: "/register", element: <RegisterPage /> },
            { path: "/books", element: <ProtectedRoute><BookPage /></ProtectedRoute> },
            { path: "/profile", element: <ProtectedRoute><ProfilePage /></ProtectedRoute> },
            { path: "/book/:id", element: <ProtectedRoute><BookDetailPage /></ProtectedRoute> }
        ]
    }
]);

export default router;