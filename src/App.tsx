// src/App.tsx
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import StudentPage from "./pages/StudentPage";
import TeacherPage from "./pages/TeacherPage";

const router = createBrowserRouter([
    { path: "/login", element: <LoginPage /> },
    {
        element: <ProtectedRoute />,
        children: [
            {
                element: <DashboardLayout />,
                children: [
                    // ví dụ route thật trong dashboard
                    { path: "/dashboard", element: <DashboardPage /> },
                    { path: "/students", element: <StudentPage /> },
                    { path: "/teachers", element: <TeacherPage /> },
                ],
            },
        ],
    },
]);

export default function App() {
    return <RouterProvider router={router} />;
}
