/**
 * Role Service 
 * API service for roles management
 */

import { api } from "../../client";
import {
    ApiRole,
    CreateRoleRequest,
    UpdateRoleRequest,
    RolesListResponse,
    RolesQueryParams,
} from "../../types";

const ROLES_ENDPOINT = "/roles/roles";

/**
 * Transform API query params to the format expected by the backend
 */
function transformQueryParams(params: RolesQueryParams): Record<string, string | number | boolean | undefined> {
    return {
        page: params.page,
        limit: params.limit,
        search: params.search,
        is_active: params.status === "active" ? true : params.status === "inactive" ? false : undefined,
    };
}

export const roleService = {
    /**
     * Get paginated list of roles with optional filters
     */
    getRoles: async (params: RolesQueryParams = {}) => {
        const queryParams = transformQueryParams(params);
        return api.get<RolesListResponse>(ROLES_ENDPOINT, queryParams);
    },

    /**
     * Get a single role by ID
     */
    getRoleById: async (id: string) => {
        return api.get<ApiRole>(`${ROLES_ENDPOINT}/${id}`);
    },

    /**
     * Get a single role by name
     */
    getRoleByName: async (name: string) => {
        return api.get<ApiRole>(`${ROLES_ENDPOINT}/${name}`);
    },

    /**
     * Create a new role
     */
    createRole: async (data: CreateRoleRequest) => {
        return api.post<ApiRole>(ROLES_ENDPOINT, data);
    },

    /**
     * Update an existing role
     */
    updateRole: async (id: string, data: UpdateRoleRequest) => {
        return api.put<ApiRole>(`${ROLES_ENDPOINT}/${id}`, data);
    },

    /**
     * Delete a role
     */
    deleteRole: async (id: string) => {
        return api.delete<void>(`${ROLES_ENDPOINT}/${id}`);
    },
};