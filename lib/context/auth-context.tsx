"use client";

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useRef,
} from "react";
import { AuthUser, authService, LoginRequest } from "@/lib/api";
import { setCookie, getCookie, deleteCookie } from "@/lib/utils/cookies";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AUTH_EXPIRED_EVENT } from "@/lib/api/client";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "user_data";

// TTL constants — keep in sync with backend JWT_EXPIRES_IN / JWT_REFRESH_EXPIRATION
const ACCESS_TOKEN_MAX_AGE = 60 * 60 * 8;        // 8h
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7;  // 7d
const USER_DATA_MAX_AGE = ACCESS_TOKEN_MAX_AGE;

// Refresh 5 minutes before the access token expires
const PROACTIVE_REFRESH_MARGIN_MS = 5 * 60 * 1000;

type MinimalUser = Pick<AuthUser, "id" | "email" | "name" | "role">;

interface AuthContextValue {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginRequest) => Promise<void>;
    logout: () => Promise<void>;
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
        (
            accessToken: string,
            refreshToken: string,
            userData: AuthUser,
            expiresIn?: number,
            refreshExpiresIn?: number,
        ) => {
            setCookie(ACCESS_TOKEN_KEY, accessToken, {
                ...cookieOptions(expiresIn ?? ACCESS_TOKEN_MAX_AGE),
            });
            setCookie(REFRESH_TOKEN_KEY, refreshToken, {
                ...cookieOptions(refreshExpiresIn ?? REFRESH_TOKEN_MAX_AGE),
            });
            setCookie(
                USER_KEY,
                JSON.stringify(toMinimal(userData)),
                cookieOptions(USER_DATA_MAX_AGE),
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
                const {
                    accessToken,
                    refreshToken,
                    expiresIn,
                    refreshExpiresIn,
                    user: userData,
                } = response.data;
                setAuthData(accessToken, refreshToken, userData, expiresIn, refreshExpiresIn);
                router.push("/");
            } catch (error) {
                clearAuthData();
                throw error;
            }
        },
        [setAuthData, clearAuthData, router]
    );

    /**
     * Server-side logout: revokes the refresh token on the backend and
     * clears local state. The redirect happens *after* the network call
     * to keep the cookie state consistent (the cookie is gone before
     * any next request fires).
     */
    const logout = useCallback(async () => {
        const refreshToken = getCookie(REFRESH_TOKEN_KEY);
        try {
            await authService.logout(refreshToken ?? "");
        } finally {
            clearAuthData();
            router.push("/login");
        }
    }, [clearAuthData, router]);

    // Proactive refresh: 5 minutes before the access token cookie
    // expires, fire a /auth/refresh in the background.
    const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const scheduleProactiveRefresh = useCallback(() => {
        if (refreshTimerRef.current) {
            clearTimeout(refreshTimerRef.current);
        }
        // Fire a refresh PROACTIVE_REFRESH_MARGIN_MS before the access cookie
        // expires. The cookie maxAge is in seconds, the timeout in ms.
        const accessMaxAgeMs = ACCESS_TOKEN_MAX_AGE * 1000;
        const delay = accessMaxAgeMs - PROACTIVE_REFRESH_MARGIN_MS;
        refreshTimerRef.current = setTimeout(() => {
            // Use the same in-flight refresh machinery as a 401 recovery.
            import("@/lib/api/client").then(({ tryRefreshToken }) => {
                tryRefreshToken().then((res) => {
                    if (!res) {
                        // Refresh token itself is dead — kick the logout flow.
                        window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
                    } else {
                        // Re-arm for the next cycle
                        scheduleProactiveRefresh();
                    }
                });
            });
        }, delay);
    }, []);

    useEffect(() => {
        return () => {
            if (refreshTimerRef.current) {
                clearTimeout(refreshTimerRef.current);
            }
        };
    }, []);

    // Initial hydration: pick up cookies into state.
    useEffect(() => {
        const accessToken = getCookie(ACCESS_TOKEN_KEY);
        const userDataString = getCookie(USER_KEY);

        if (accessToken && userDataString) {
            try {
                const parsed = JSON.parse(userDataString) as Partial<AuthUser>;
                if (parsed && parsed.id && parsed.email && parsed.role) {
                    setUser(parsed as AuthUser);
                    scheduleProactiveRefresh();
                } else {
                    clearAuthData();
                }
            } catch {
                clearAuthData();
            }
        }

        setIsLoading(false);
    }, [clearAuthData, scheduleProactiveRefresh]);

    // Listen for the global "session expired" event from the API client.
    useEffect(() => {
        const handler = () => {
            // The API client has already cleared cookies; just sync the
            // in-memory user state and show a toast.
            setUser(null);
            toast.error("Tu sesión expiró. Por favor inicia sesión de nuevo.");
            if (
                typeof window !== "undefined" &&
                window.location.pathname !== "/login"
            ) {
                router.replace("/login?reason=expired");
            }
        };
        window.addEventListener(AUTH_EXPIRED_EVENT, handler);
        return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handler);
    }, [router]);

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
