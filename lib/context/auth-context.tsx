"use client";

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from "react";
import { AuthUser, authService, LoginRequest } from "@/lib/api";
import { setCookie, getCookie, deleteCookie } from "@/lib/utils/cookies";
import { useRouter } from "next/navigation";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "user_data";

const ACCESS_TOKEN_MAX_AGE = 60 * 60 * 24; // 24h
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30; // 30d

type MinimalUser = Pick<AuthUser, "id" | "email" | "name" | "role">;

interface AuthContextValue {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginRequest) => Promise<void>;
    logout: () => void;
    getAccessToken: () => string | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function toMinimal(user: AuthUser): MinimalUser {
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
    };
}

function cookieOptions(maxAge: number) {
    return {
        maxAge,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict" as const,
    };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const isAuthenticated = !!user;

    const getAccessToken = useCallback(
        (): string | null => getCookie(ACCESS_TOKEN_KEY),
        []
    );

    const setAuthData = useCallback(
        (accessToken: string, refreshToken: string, userData: AuthUser) => {
            setCookie(
                ACCESS_TOKEN_KEY,
                accessToken,
                cookieOptions(ACCESS_TOKEN_MAX_AGE)
            );
            setCookie(
                REFRESH_TOKEN_KEY,
                refreshToken,
                cookieOptions(REFRESH_TOKEN_MAX_AGE)
            );
            // Guardamos solo campos necesarios para middleware/UI — nunca el
            // objeto completo del backend, que podría contener metadatos
            // sensibles o crecer sin control.
            setCookie(
                USER_KEY,
                JSON.stringify(toMinimal(userData)),
                cookieOptions(ACCESS_TOKEN_MAX_AGE)
            );
            setUser(userData);
        },
        []
    );

    const clearAuthData = useCallback(() => {
        deleteCookie(ACCESS_TOKEN_KEY);
        deleteCookie(REFRESH_TOKEN_KEY);
        deleteCookie(USER_KEY);
        setUser(null);
    }, []);

    const login = useCallback(
        async (credentials: LoginRequest) => {
            try {
                const response = await authService.login(credentials);
                const { accessToken, refreshToken, user: userData } = response.data;
                setAuthData(accessToken, refreshToken, userData);
                router.push("/");
            } catch (error) {
                clearAuthData();
                throw error;
            }
        },
        [setAuthData, clearAuthData, router]
    );

    const logout = useCallback(() => {
        clearAuthData();
        router.push("/login");
    }, [clearAuthData, router]);

    useEffect(() => {
        const accessToken = getCookie(ACCESS_TOKEN_KEY);
        const userDataString = getCookie(USER_KEY);

        if (accessToken && userDataString) {
            try {
                const parsed = JSON.parse(userDataString) as Partial<AuthUser>;
                if (parsed && parsed.id && parsed.email && parsed.role) {
                    setUser(parsed as AuthUser);
                } else {
                    clearAuthData();
                }
            } catch {
                clearAuthData();
            }
        }

        setIsLoading(false);
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

export function useAuthContext(): AuthContextValue {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuthContext must be used within an AuthProvider");
    }
    return context;
}
