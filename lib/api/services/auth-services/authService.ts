/**
 * Auth Service
 * API service for authentication operations
 */

import { LoginRequest, LoginResponse, RefreshTokenRequest, RefreshTokenResponse } from "../../types";
import { API_CONFIG, ApiError, ApiResponse } from "../../config";

const AUTH_ENDPOINT = "/auth";

/**
 * Login without using the main api client to avoid token dependency
 */
async function login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const url = `${API_CONFIG.baseUrl}${AUTH_ENDPOINT}/login`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(credentials),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new ApiError(
                data.message || "Invalid credentials",
                response.status,
                data
            );
        }

        return data as ApiResponse<LoginResponse>;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        if (error instanceof Error) {
            throw new ApiError(error.message, 0, null);
        }

        throw new ApiError("Unknown error occurred", 0, null);
    }
}

/**
 * Refresh access token using refresh token
 */
async function refreshToken(refreshTokenData: RefreshTokenRequest): Promise<ApiResponse<RefreshTokenResponse>> {
    const url = `${API_CONFIG.baseUrl}${AUTH_ENDPOINT}/refresh`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(refreshTokenData),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new ApiError(
                data.message || "Failed to refresh token",
                response.status,
                data
            );
        }

        return data as ApiResponse<RefreshTokenResponse>;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        if (error instanceof Error) {
            throw new ApiError(error.message, 0, null);
        }

        throw new ApiError("Unknown error occurred", 0, null);
    }
}

/**
 * Logout: tell the backend to revoke the current refresh token.
 * Best-effort: a network failure is swallowed so the client can always
 * clear its own cookies locally.
 */
async function logout(refreshToken: string): Promise<void> {
    if (!refreshToken) return;
    try {
        await fetch(`${API_CONFIG.baseUrl}${AUTH_ENDPOINT}/logout`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
        });
    } catch {
        // ignored — local cookies are still cleared
    }
}

export const authService = {
    login,
    refreshToken,
    logout,
};
