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
    user: AuthUser;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface RefreshTokenResponse {
    accessToken: string;
    refreshToken: string;
}
