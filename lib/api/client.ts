/**
 * API Client
 * Centralized HTTP client for all API calls
 */

import { API_CONFIG, ApiError, ApiRequestConfig, ApiResponse } from "./config";

/**
 * Build query string from params object
 */
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
 * Core API client function
 * Handles all HTTP requests with standardized error handling
 */
export async function apiClient<T>(
    endpoint: string,
    config: ApiRequestConfig = {}
): Promise<ApiResponse<T>> {
    const { method = "GET", body, headers = {}, queryParams } = config;

    const url = `${API_CONFIG.baseUrl}${endpoint}${queryParams ? buildQueryString(queryParams) : ""
        }`;

    const token = API_CONFIG.getToken();
    const requestHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...headers,
    };

    const requestConfig: RequestInit = {
        method,
        headers: requestHeaders,
    };

    if (body !== undefined) {
        requestConfig.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, requestConfig);
        const data = await response.json();

        if (!response.ok) {
            throw new ApiError(
                data.message || "An error occurred",
                response.status,
                data
            );
        }

        return data as ApiResponse<T>;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        // Network error or other issues
        if (error instanceof Error) {
            throw new ApiError(error.message, 0, null);
        }

        throw new ApiError("Unknown error occurred", 0, null);
    }
}

/**
 * Convenience methods for common HTTP operations
 */
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
