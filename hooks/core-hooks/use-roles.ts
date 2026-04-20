"use client";

/**
 * useRoles Hook
 * Custom hook for managing roles data with loading and error states
 */

import { useState, useEffect, useCallback } from "react";
import {
    roleService,
    ApiRole,
    RolesListResponse,
    RolesQueryParams,
    RolesStats,
} from "@/lib/api";
import { ApiError } from "@/lib/api/config";

interface UseRolesState {
    roles: ApiRole[];
    stats: RolesStats;
    pagination: {
        page: number;
        limit: number;
        totalPages: number;
    };
    isLoading: boolean;
    error: string | null;
}

interface UseRolesReturn extends UseRolesState {
    fetchRoles: (params?: RolesQueryParams) => Promise<void>;
    refetch: () => Promise<void>;
    deleteRole: (id: string) => Promise<boolean>;
}

const initialStats: RolesStats = {
    totalRoles: 0,
    activeRoles: 0,
    inactiveRoles: 0,
    assignedUsers: 0,
};

export function useRoles(initialParams: RolesQueryParams = {}): UseRolesReturn {
    const [state, setState] = useState<UseRolesState>({
        roles: [],
        stats: initialStats,
        pagination: {
            page: 1,
            limit: 20,
            totalPages: 1,
        },
        isLoading: true,
        error: null,
    });

    const [currentParams, setCurrentParams] = useState<RolesQueryParams>(initialParams);

    const fetchRoles = useCallback(async (params: RolesQueryParams = {}) => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await roleService.getRoles(params);
            const data = response.data;

            setState({
                roles: data.roles,
                stats: {
                    totalRoles: data.stats.totalRoles,
                    activeRoles: data.stats.activeRoles,
                    inactiveRoles: data.stats.inactiveRoles,
                    assignedUsers: data.stats.assignedUsers,
                },
                pagination: {
                    page: 1,
                    limit: 100, // Hardcoded limit since backend roles list is not currently paginated
                    totalPages: 1,
                },
                isLoading: false,
                error: null,
            });

            setCurrentParams(params);
        } catch (error) {
            const errorMessage = error instanceof ApiError
                ? error.message
                : "Error al cargar los roles";

            setState((prev) => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
        }
    }, []);

    const refetch = useCallback(async () => {
        await fetchRoles(currentParams);
    }, [fetchRoles, currentParams]);

    const deleteRole = useCallback(async (id: string): Promise<boolean> => {
        try {
            await roleService.deleteRole(id);
            await refetch();
            return true;
        } catch (error) {
            const errorMessage = error instanceof ApiError
                ? error.message
                : "Error al eliminar el rol";
            setState((prev) => ({ ...prev, error: errorMessage }));
            return false;
        }
    }, [refetch]);

    useEffect(() => {
        fetchRoles(initialParams);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        ...state,
        fetchRoles,
        refetch,
        deleteRole,
    };
}
