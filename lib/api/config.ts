/**
 * API Configuration
 * Base configuration for all API calls
 */

import { getCookie } from "@/lib/utils/cookies";

/**
 * Get the current access token from cookies
 */
export function getAccessToken(): string | null {
    return getCookie("access_token");
}

export const API_CONFIG = {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1",
    timeout: 30000,
    getToken: getAccessToken, // Dynamic token retrieval
};

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiRequestConfig {
    method?: HttpMethod;
    body?: unknown;
    headers?: Record<string, string>;
    queryParams?: Record<string, string | number | boolean | undefined>;
}

export interface ApiResponse<T> {
    success: boolean;
    code: number;
    message: string;
    data: T;
}

export interface PaginatedResponse<T> {
    totalUsers?: number;
    activeUsers?: number;
    inactiveUsers?: number;
    admins?: number;
    page: number;
    limit: number;
    totalPages: number;
    data: T[];
}

export class ApiError extends Error {
    public readonly statusCode: number;
    public readonly response: unknown;

    constructor(message: string, statusCode: number, response?: unknown) {
        super(message);
        this.name = "ApiError";
        this.statusCode = statusCode;
        this.response = response;
    }
}
