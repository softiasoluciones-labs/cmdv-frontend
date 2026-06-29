/**
 * API Client
 * Centralized HTTP client for all API calls
 *
 * Auth lifecycle:
 *   - 401 from the backend triggers a single in-flight refresh.
 *   - On successful refresh, BOTH access and refresh tokens are updated
 *     (the backend rotates refresh tokens on every /auth/refresh call).
 *   - If the refresh itself fails, the client dispatches a `auth:expired`
 *     custom event. The AuthProvider listens for it, clears local state,
 *     shows a toast, and redirects to /login. The caller never sees an
 *     "error" toast for a session expiration.
 */

import { API_CONFIG, ApiError, ApiRequestConfig, ApiResponse } from "./config";
import { getCookie, setCookie, deleteCookie } from "@/lib/utils/cookies";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "user_data";

/**
 * Custom event fired when the session is gone for good and the user
 * must log in again. The AuthProvider catches it and handles the UX.
 */
export const AUTH_EXPIRED_EVENT = "auth:expired";

function buildQueryString(
    params: Record<string, string | number | boolean | undefined>
): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
        }
    });
    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : "";
}

/**
 * Attempts to refresh the access token exactly once per 401 wave.
 * Concurrent 401s share the same in-flight promise so we don't hammer
 * the /auth/refresh endpoint.
 *
 * Returns the new access token, or null if the refresh failed
 * (caller should then dispatch the auth:expired event).
 */
let refreshPromise: Promise<{ access: string; refresh: string; expiresIn: number; refreshExpiresIn: number } | null> | null = null;

export async function tryRefreshToken(): Promise<{ access: string; refresh: string; expiresIn: number; refreshExpiresIn: number } | null> {
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
        const refreshToken = getCookie(REFRESH_TOKEN_KEY);
        if (!refreshToken) return null;

        try {
            const response = await fetch(`${API_CONFIG.baseUrl}/auth/refresh`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refreshToken }),
            });

            if (!response.ok) return null;

            const payload = (await response.json()) as {
                data?: {
                    accessToken?: string;
                    refreshToken?: string;
                    expiresIn?: number;
                    refreshExpiresIn?: number;
                };
            };

            const newAccess = payload.data?.accessToken;
            const newRefresh = payload.data?.refreshToken;
            if (!newAccess || !newRefresh) return null;

            const secure = process.env.NODE_ENV === "production";
            // Use refreshExpiresIn for the access token cookie too, so it
            // doesn't expire before its actual JWT lifetime.
            setCookie(ACCESS_TOKEN_KEY, newAccess, {
                maxAge: payload.data?.expiresIn ?? 60 * 60 * 8,
                secure,
                sameSite: "strict",
            });
            setCookie(REFRESH_TOKEN_KEY, newRefresh, {
                maxAge: payload.data?.refreshExpiresIn ?? 60 * 60 * 24 * 7,
                secure,
                sameSite: "strict",
            });

            return {
                access: newAccess,
                refresh: newRefresh,
                expiresIn: payload.data?.expiresIn ?? 60 * 60 * 8,
                refreshExpiresIn: payload.data?.refreshExpiresIn ?? 60 * 60 * 24 * 7,
            };
        } catch {
            return null;
        }
    })();

    try {
        return await refreshPromise;
    } finally {
        refreshPromise = null;
    }
}

function forceLogout() {
    if (typeof window === "undefined") return;
    deleteCookie(ACCESS_TOKEN_KEY);
    deleteCookie(REFRESH_TOKEN_KEY);
    deleteCookie(USER_KEY);
    // Dispatch a custom event; the AuthProvider reacts by clearing state,
    // showing a toast and redirecting to /login?reason=expired.
    window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
}

async function executeRequest(
    url: string,
    method: string,
    body: unknown,
    headers: Record<string, string>,
    token: string | null
): Promise<Response> {
    const requestHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
    };

    const requestConfig: RequestInit = { method, headers: requestHeaders };
    if (body !== undefined) {
        requestConfig.body = JSON.stringify(body);
    }

    return fetch(url, requestConfig);
}

export async function apiClient<T>(
    endpoint: string,
    config: ApiRequestConfig = {}
): Promise<ApiResponse<T>> {
    const { method = "GET", body, headers = {}, queryParams } = config;

    const url = `${API_CONFIG.baseUrl}${endpoint}${
        queryParams ? buildQueryString(queryParams) : ""
    }`;

    const isAuthEndpoint = endpoint.startsWith("/auth/");

    let token = API_CONFIG.getToken();
    let response: Response;

    try {
        response = await executeRequest(url, method, body, headers, token);

        if (response.status === 401 && !isAuthEndpoint) {
            const refreshed = await tryRefreshToken();
            if (refreshed) {
                token = refreshed.access;
                response = await executeRequest(url, method, body, headers, token);
            } else {
                forceLogout();
                // The AuthProvider is the one that will navigate to /login.
                // We surface a sentinel error so the caller can still detect
                // that the call didn't succeed (e.g. to cancel a loading state),
                // but it's not a generic "Error" the way the user used to see.
                throw new ApiError("Sesión expirada", 401, null);
            }
        }

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new ApiError(
                (data && (data as { message?: string }).message) || "An error occurred",
                response.status,
                data
            );
        }

        return data as ApiResponse<T>;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        if (error instanceof Error) throw new ApiError(error.message, 0, null);
        throw new ApiError("Unknown error occurred", 0, null);
    }
}

export const api = {
    get: <T>(endpoint: string, queryParams?: ApiRequestConfig["queryParams"]) =>
        apiClient<T>(endpoint, { method: "GET", queryParams }),

    post: <T>(endpoint: string, body?: unknown) =>
        apiClient<T>(endpoint, { method: "POST", body }),

    put: <T>(endpoint: string, body?: unknown) =>
        apiClient<T>(endpoint, { method: "PUT", body }),

    patch: <T>(endpoint: string, body?: unknown) =>
        apiClient<T>(endpoint, { method: "PATCH", body }),

    delete: <T>(endpoint: string) =>
        apiClient<T>(endpoint, { method: "DELETE" }),
};

// Re-export so the AuthProvider's proactive-refresh timer can call it
// from outside the module without re-importing the function reference
// (which lives behind a closure to share the in-flight promise).
// (tryRefreshToken is already exported above with the function declaration.)
