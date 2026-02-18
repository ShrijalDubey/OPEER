import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch user profile from the backend
    const fetchUser = useCallback(async (token) => {
        try {
            const res = await fetch('/auth/me', {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                credentials: 'include',
            });
            if (res.ok) {
                const data = await res.json();
                return data.user;
            }
            return null;
        } catch {
            return null;
        }
    }, []);

    // On mount: check for existing token and load user
    useEffect(() => {
        const init = async () => {
            const token = localStorage.getItem('opeer_token');
            if (token) {
                const userData = await fetchUser(token);
                if (userData) {
                    setUser(userData);
                } else {
                    // Token invalid, clean up
                    localStorage.removeItem('opeer_token');
                }
            }
            setLoading(false);
        };
        init();
    }, [fetchUser]);

    // Login: store token + fetch user, return user data
    const login = useCallback(async (token) => {
        localStorage.setItem('opeer_token', token);
        const userData = await fetchUser(token);
        setUser(userData);
        return userData;
    }, [fetchUser]);

    // Logout: clear everything
    const logout = useCallback(async () => {
        try {
            await fetch('/auth/logout', { method: 'POST', credentials: 'include' });
        } catch { /* ignore */ }
        localStorage.removeItem('opeer_token');
        setUser(null);
    }, []);

    // Refresh user data from backend
    const refreshUser = useCallback(async () => {
        const token = localStorage.getItem('opeer_token');
        if (token) {
            const userData = await fetchUser(token);
            setUser(userData);
            return userData;
        }
        return null;
    }, [fetchUser]);

    // Check if profile is complete (has college set)
    const isProfileComplete = user?.college && user?.college.trim() !== '';

    const value = {
        user,
        loading,
        isLoggedIn: !!user,
        isProfileComplete,
        login,
        logout,
        refreshUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
