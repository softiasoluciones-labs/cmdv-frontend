/**
 * API Client
 * Centralized HTTP client for all API calls
 */

import { API_CONFIG, ApiError, ApiRequestConfig, ApiResponse } from "./config";
import { getCookie, setCookie, deleteCookie } from "@/lib/utils/cookies";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "user_data";

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
 */
let refreshPromise: Promise<string | null> | null = null;

async function tryRefreshToken(): Promise<string | null> {
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
                data?: { accessToken?: string; refreshToken?: string };
            };
            const newAccess = payload.data?.accessToken;
            const newRefresh = payload.data?.refreshToken;
            if (!newAccess) return null;

            const secure = process.env.NODE_ENV === "production";
            setCookie(ACCESS_TOKEN_KEY, newAccess, {
                maxAge: 60 * 60 * 24,
                secure,
                sameSite: "strict",
            });
            if (newRefresh) {
                setCookie(REFRESH_TOKEN_KEY, newRefresh, {
                    maxAge: 60 * 60 * 24 * 30,
                    secure,
                    sameSite: "strict",
                });
            }
            return newAccess;
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
    if (window.location.pathname !== "/login") {
        window.location.assign("/login");
    }
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
            const newToken = await tryRefreshToken();
            if (newToken) {
                token = newToken;
                response = await executeRequest(url, method, body, headers, token);
            } else {
                forceLogout();
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
