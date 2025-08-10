import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";

export type User = {
    id: string;
    name: string;
    email: string;
    role?: string;
};

type AuthState = {
    isAuthenticated: boolean;
    token: string | null;
    user: User | null;
};

type AuthContextValue = AuthState & {
    login: (payload: { token: string; user: User }) => void;
    logout: () => void;
    setUser: (u: User | null) => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "cms_auth";

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [state, setState] = useState<AuthState>(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return { isAuthenticated: false, token: null, user: null };
            const parsed: AuthState = JSON.parse(raw);
            return parsed ?? { isAuthenticated: false, token: null, user: null };
        } catch {
            return { isAuthenticated: false, token: null, user: null };
        }
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [state]);

    const login = useCallback((payload: { token: string; user: User }) => {
        setState({ isAuthenticated: true, token: payload.token, user: payload.user });
    }, []);

    const logout = useCallback(() => {
        setState({ isAuthenticated: false, token: null, user: null });
    }, []);

    const setUser = useCallback((u: User | null) => {
        setState((s) => ({ ...s, user: u }));
    }, []);

    const value = useMemo(() => ({ ...state, login, logout, setUser }), [state, login, logout, setUser]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
