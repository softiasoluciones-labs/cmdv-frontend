"use client";

import { useState, useEffect, useCallback } from "react";
import { scheduledOperationService } from "@/lib/api/services/medical-services/scheduledOperationService";
import {
    ScheduledOperation,
    CreateScheduledOperationRequest,
    UpdateScheduledOperationRequest,
    UpdateScheduledOperationStatusRequest,
    ScheduledOperationListParams,
    ScheduledOperationStatus
} from "@/lib/api/types/medical-types/scheduled-operation.type";
import { ApiError } from "@/lib/api";

interface UseScheduledOperationsState {
    operations: ScheduledOperation[];
    pagination: {
        page: number;
        total: number;
        total_pages: number;
    };
    isLoading: boolean;
    error: string | null;
}

interface UseScheduledOperationsReturn extends UseScheduledOperationsState {
    fetchOperations: (params?: ScheduledOperationListParams) => Promise<void>;
    getOperationById: (id: string) => Promise<ScheduledOperation>;
    createOperation: (data: CreateScheduledOperationRequest) => Promise<ScheduledOperation>;
    updateOperation: (id: string, data: UpdateScheduledOperationRequest) => Promise<ScheduledOperation>;
    updateOperationStatus: (id: string, data: UpdateScheduledOperationStatusRequest) => Promise<ScheduledOperation>;
    deleteOperation: (id: string) => Promise<void>;
    addTeamMember: (id: string, data: { doctor_id: string; role: string }) => Promise<void>;
    removeTeamMember: (id: string, memberId: string) => Promise<void>;
}

export function useScheduledOperations(initialParams: ScheduledOperationListParams = {}): UseScheduledOperationsReturn {
    const [state, setState] = useState<UseScheduledOperationsState>({
        operations: [],
        pagination: { page: 1, total: 0, total_pages: 0 },
        isLoading: true,
        error: null,
    });

    const [currentParams, setCurrentParams] = useState<ScheduledOperationListParams>(initialParams);

    const fetchOperations = useCallback(async (params: ScheduledOperationListParams = {}) => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await scheduledOperationService.getAllOperations(params);
            const data = response.data;
            setState({
                operations: data.data || [],
                pagination: {
                    page: data.page || 1,
                    total: data.total || 0,
                    total_pages: data.total_pages || 0,
                },
                isLoading: false,
                error: null,
            });
            setCurrentParams(params);
        } catch (error) {
            const errorMessage =
                error instanceof ApiError ? error.message : "Error al cargar las operaciones programadas";
            setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
        }
    }, []);

    const getOperationById = useCallback(async (id: string): Promise<ScheduledOperation> => {
        const response = await scheduledOperationService.getOperationById(id);
        return response.data;
    }, []);

    const createOperation = useCallback(async (data: CreateScheduledOperationRequest): Promise<ScheduledOperation> => {
        const response = await scheduledOperationService.createOperation(data);
        await fetchOperations(currentParams);
        return response.data;
    }, [fetchOperations, currentParams]);

    const updateOperation = useCallback(async (id: string, data: UpdateScheduledOperationRequest): Promise<ScheduledOperation> => {
        const response = await scheduledOperationService.updateOperation(id, data);
        await fetchOperations(currentParams);
        return response.data;
    }, [fetchOperations, currentParams]);

    const updateOperationStatus = useCallback(async (id: string, data: UpdateScheduledOperationStatusRequest): Promise<ScheduledOperation> => {
        const response = await scheduledOperationService.updateOperationStatus(id, data);
        await fetchOperations(currentParams);
        return response.data;
    }, [fetchOperations, currentParams]);

    const deleteOperation = useCallback(async (id: string): Promise<void> => {
        await scheduledOperationService.deleteOperation(id);
        await fetchOperations(currentParams);
    }, [fetchOperations, currentParams]);

    const addTeamMember = useCallback(async (id: string, data: { doctor_id: string; role: string }): Promise<void> => {
        await scheduledOperationService.addTeamMember(id, data);
        await fetchOperations(currentParams);
    }, [fetchOperations, currentParams]);

    const removeTeamMember = useCallback(async (id: string, memberId: string): Promise<void> => {
        await scheduledOperationService.removeTeamMember(id, memberId);
        await fetchOperations(currentParams);
    }, [fetchOperations, currentParams]);

    useEffect(() => {
        fetchOperations(initialParams);
    }, [fetchOperations]);

    return {
        ...state,
        fetchOperations,
        getOperationById,
        createOperation,
        updateOperation,
        updateOperationStatus,
        deleteOperation,
        addTeamMember,
        removeTeamMember,
    };
}
