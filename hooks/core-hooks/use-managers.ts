"use client";

/**
 * useManagers Hook
 * Custom hook for fetching users with warehouse_manager role
 */

import { useState, useCallback, useEffect } from "react";
import { userService } from "@/lib/api/services/core-services/user.service";
import { ApiError } from "@/lib/api";

interface Manager {
    id: string;
    name: string;
}

interface UseManagersState {
    managers: Manager[];
    isLoading: boolean;
    error: string | null;
}

interface UseManagersReturn extends UseManagersState {
    fetchManagers: () => Promise<void>;
}

export function useManagers(): UseManagersReturn {
    const [state, setState] = useState<UseManagersState>({
        managers: [],
        isLoading: true,
        error: null,
    });

    const fetchManagers = useCallback(async () => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await userService.getUsersByRole("warehouse_manager");
            const managers = response.data.users.map((user) => ({
                id: user.id,
                name: user.full_name,
            }));
            setState({ managers, isLoading: false, error: null });
        } catch (error) {
            const apiError = error as ApiError;
            setState((prev) => ({ ...prev, error: apiError.message, isLoading: false }));
        }
    }, []);

    useEffect(() => {
        fetchManagers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        ...state,
        fetchManagers,
    };
}
