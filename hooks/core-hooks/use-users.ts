"use client";

/**
 * useUsers Hook
 * Custom hook for managing users data with loading and error states
 */

import { useState, useEffect, useCallback } from "react";
import {
    userService,
    ApiUser,
    UsersQueryParams,
    UsersStats,
    ApiError,
} from "@/lib/api";

interface UseUsersState {
    users: ApiUser[];
    stats: UsersStats;
    pagination: {
        page: number;
        limit: number;
        totalPages: number;
    };
    isLoading: boolean;
    error: string | null;
}

interface UseUsersReturn extends UseUsersState {
    fetchUsers: (params?: UsersQueryParams) => Promise<void>;
    refetch: () => Promise<void>;
    deleteUser: (id: string) => Promise<boolean>;
}

const initialStats: UsersStats = {
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    admins: 0,
};

export function useUsers(initialParams: UsersQueryParams = {}): UseUsersReturn {
    const [state, setState] = useState<UseUsersState>({
        users: [],
        stats: initialStats,
        pagination: {
            page: 1,
            limit: 20,
            totalPages: 1,
        },
        isLoading: true,
        error: null,
    });

    const [currentParams, setCurrentParams] =
        useState<UsersQueryParams>(initialParams);

    const fetchUsers = useCallback(async (params: UsersQueryParams = {}) => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await userService.getUsers(params);
            const data = response.data

            setState({
                users: data.data,
                stats: {
                    totalUsers: data.totalUsers,
                    activeUsers: data.activeUsers,
                    inactiveUsers: data.inactiveUsers,
                    admins: data.admins,
                },
                pagination: {
                    page: data.page,
                    limit: data.limit,
                    totalPages: data.totalPages,
                },
                isLoading: false,
                error: null,
            });

            setCurrentParams(params);
        } catch (error) {
            const errorMessage =
                error instanceof ApiError
                    ? error.message
                    : "Error al cargar los usuarios";

            setState((prev) => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
        }
    }, []);

    const refetch = useCallback(async () => {
        await fetchUsers(currentParams);
    }, [fetchUsers, currentParams]);

    const deleteUser = useCallback(
        async (id: string): Promise<boolean> => {
            try {
                await userService.deleteUser(id);
                await refetch();
                return true;
            } catch (error) {
                const errorMessage =
                    error instanceof ApiError
                        ? error.message
                        : "Error al eliminar el usuario";
                setState((prev) => ({ ...prev, error: errorMessage }));
                return false;
            }
        },
        [refetch]
    );

    useEffect(() => {
        fetchUsers(initialParams);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        ...state,
        fetchUsers,
        refetch,
        deleteUser,
    };
}
