import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

type NavItem = { to: string; label: string; icon?: React.ReactNode };

const nav: NavItem[] = [
    { to: "/", label: "Home" },
    { to: "/settings", label: "Settings" },
];

export const Sidebar: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const { pathname } = useLocation();

    return (
        <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
            <div className="sidebar__top">
                <div className="sidebar__brand">{collapsed ? "CMS" : "Vitre CMS"}</div>
                <button className="sidebar__toggle" onClick={() => setCollapsed((v) => !v)}>
                    {collapsed ? "›" : "‹"}
                </button>
            </div>

            <nav className="sidebar__nav">
                {nav.map((n) => (
                    <Link
                        key={n.to}
                        to={n.to}
                        className={`sidebar__link ${pathname === n.to ? "active" : ""}`}
                    >
                        {n.label}
                    </Link>
                ))}
            </nav>
        </aside>
    );
};
