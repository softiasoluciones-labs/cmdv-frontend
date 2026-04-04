/**
 * User Service
 * API service for user-related operations
 */

import { api } from "../client";
import {
    ApiUser,
    CreateUserRequest,
    UpdateUserRequest,
    UsersListResponse,
    UsersQueryParams,
} from "../types";

const USERS_ENDPOINT = "/users/users";

/**
 * Transform API query params to the format expected by the backend
 */
function transformQueryParams(params: UsersQueryParams): Record<string, string | number | boolean | undefined> {
    return {
        page: params.page,
        limit: params.limit,
        search: params.search,
        role: params.role !== "all" ? params.role : undefined,
        is_active: params.status === "active" ? true : params.status === "inactive" ? false : undefined,
    };
}

export const userService = {
    /**
     * Get paginated list of users with optional filters
     */
    getUsers: async (params: UsersQueryParams = {}) => {
        const queryParams = transformQueryParams(params);
        return api.get<UsersListResponse>(USERS_ENDPOINT, queryParams);
    },

    /**
     * Get a single user by ID
     */
    getUserById: async (id: string) => {
        return api.get<ApiUser>(`${USERS_ENDPOINT}/${id}`);
    },

    /**
     * Create a new user
     */
    createUser: async (data: CreateUserRequest) => {
        return api.post<ApiUser>(USERS_ENDPOINT, data);
    },

    /**
     * Update an existing user
     */
    updateUser: async (id: string, data: UpdateUserRequest) => {
        return api.put<ApiUser>(`${USERS_ENDPOINT}/${id}`, data);
    },

    /**
     * Delete a user
     */
    deleteUser: async (id: string) => {
        return api.delete<void>(`${USERS_ENDPOINT}/${id}`);
    },

    /**
     * Reset user password
     */
    resetPassword: async (id: string, newPassword: string) => {
        return api.patch<void>(`${USERS_ENDPOINT}/${id}/reset-password`, {
            password: newPassword,
        });
    },
};
