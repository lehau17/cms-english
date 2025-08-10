import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const ProtectedRoute: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        // redirect về /login, giữ lại đường dẫn muốn vào
        return <Navigate to="/login" replace state={{ from: location }} />;
    }
    return <Outlet />;
};
