/**
 * Auth API Types
 * Type definitions for authentication-related API responses
 */

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthUser {
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt: string;
    updatedAt: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    /** TTL of the access token in seconds. */
    expiresIn: number;
    /** TTL of the refresh token in seconds. */
    refreshExpiresIn: number;
    user: AuthUser;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface RefreshTokenResponse {
    accessToken: string;
    /** New refresh token issued by the backend (rotation). */
    refreshToken: string;
    expiresIn: number;
    refreshExpiresIn: number;
}
