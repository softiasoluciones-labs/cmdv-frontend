/**
 * User API Types
 * Type definitions for user-related API responses
 */

export interface Permission {
    id: string;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
}

export interface RolePermission {
    id: string;
    permission_id: string;
    created_at: string;
    updated_at: string;
    permission: Permission;
}

export type UserRole =
    | "super_admin"
    | "admin"
    | "doctor"
    | "nurse"
    | "pharmacist"
    | "receptionist"
    | "lab_technician"
    | "billing_staff"
    | "warehouse_manager";

export interface ApiUser {
    id: string;
    username: string;
    email: string;
    full_name: string;
    role: UserRole;
    is_active: boolean;
    failed_login_attempts: number;
    created_at: string;
    updated_at: string;
    created_by: string;
    updated_by: string;
    role_permissions: RolePermission[];
}

export interface UsersStats {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    admins: number;
}

export interface UsersListResponse extends UsersStats {
    page: number;
    limit: number;
    totalPages: number;
    data: ApiUser[];
}

export interface UsersQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    role?: UserRole | "all";
    status?: "active" | "inactive" | "all";
}

export interface CreateUserRequest {
    username: string;
    email: string;
    password_hash: string;
    full_name: string;
    role: UserRole;
    is_active?: boolean;
}

export interface UpdateUserRequest {
    username?: string;
    email?: string;
    full_name?: string;
    role?: UserRole;
    is_active?: boolean;
}
