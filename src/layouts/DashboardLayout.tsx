import "@/styles/layout.css";
import React from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { useAuth } from "../hooks/useAuth";

const UserBar: React.FC = () => {
    const { user, logout } = useAuth();
    return (
        <div className="topbar__right">
            <span className="topbar__user">{user?.name ?? "Unknown"}</span>
            <button className="btn btn--ghost" onClick={logout}>Logout</button>
        </div>
    );
};

export const DashboardLayout: React.FC = () => {
    return (
        <div className="layout">
            <Sidebar />
            <div className="content">
                <header className="topbar">
                    <div className="topbar__left">Dashboard</div>
                    <UserBar />
                </header>
                <main className="main">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
