"use client";

/**
 * Auth Context
 * Global authentication state management
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { AuthUser, authService, LoginRequest, ApiError } from "@/lib/api";
import { setCookie, getCookie, deleteCookie } from "@/lib/utils/cookies";
import { useRouter } from "next/navigation";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "user_data";

interface AuthContextValue {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginRequest) => Promise<void>;
    logout: () => void;
    getAccessToken: () => string | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const isAuthenticated = !!user;

    /**
     * Get access token from cookie
     */
    const getAccessToken = useCallback((): string | null => {
        return getCookie(ACCESS_TOKEN_KEY);
    }, []);

    /**
     * Set auth data in state and cookies
     */
    const setAuthData = useCallback((accessToken: string, refreshToken: string, userData: AuthUser) => {
        // Store tokens in cookies with appropriate expiration
        // Access token: 1 day (86400 seconds)
        setCookie(ACCESS_TOKEN_KEY, accessToken, {
            maxAge: 60 * 60 * 24, // 24 hours
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        // Refresh token: 30 days
        setCookie(REFRESH_TOKEN_KEY, refreshToken, {
            maxAge: 60 * 60 * 24 * 30, // 30 days
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        // Store user data (non-sensitive)
        setCookie(USER_KEY, JSON.stringify(userData), {
            maxAge: 60 * 60 * 24 * 30,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        setUser(userData);
    }, []);

    /**
     * Clear auth data from state and cookies
     */
    const clearAuthData = useCallback(() => {
        deleteCookie(ACCESS_TOKEN_KEY);
        deleteCookie(REFRESH_TOKEN_KEY);
        deleteCookie(USER_KEY);
        setUser(null);
    }, []);

    /**
     * Login function
     */
    const login = useCallback(
        async (credentials: LoginRequest) => {
            try {
                const response = await authService.login(credentials);
                const { accessToken, refreshToken, user: userData } = response.data;

                setAuthData(accessToken, refreshToken, userData);
                router.push("/"); // Redirect to dashboard
            } catch (error) {
                clearAuthData();
                throw error;
            }
        },
        [setAuthData, clearAuthData, router]
    );

    /**
     * Logout function
     */
    const logout = useCallback(() => {
        clearAuthData();
        router.push("/login");
    }, [clearAuthData, router]);

    /**
     * Initialize auth state from cookies on mount
     */
    useEffect(() => {
        const initializeAuth = () => {
            const accessToken = getCookie(ACCESS_TOKEN_KEY);
            const userDataString = getCookie(USER_KEY);

            if (accessToken && userDataString) {
                try {
                    const userData = JSON.parse(userDataString) as AuthUser;
                    setUser(userData);
                } catch (error) {
                    console.error("Failed to parse user data:", error);
                    clearAuthData();
                }
            }

            setIsLoading(false);
        };

        initializeAuth();
    }, [clearAuthData]);

    const value: AuthContextValue = {
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        getAccessToken,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use auth context
 */
export function useAuthContext(): AuthContextValue {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuthContext must be used within an AuthProvider");
    }
    return context;
}
