"use client";

import { useState, useEffect, useCallback } from "react";
import { operationTypeService } from "@/lib/api/services/medical-services/operationTypeService";
import {
    OperationType,
    CreateOperationTypeRequest,
    UpdateOperationTypeRequest,
    OperationTypeListParams
} from "@/lib/api/types/medical-types/operation-type.type";
import { ApiError } from "@/lib/api";

interface UseOperationTypesState {
    operationTypes: OperationType[];
    pagination: {
        page: number;
        total: number;
    };
    isLoading: boolean;
    error: string | null;
}

interface UseOperationTypesReturn extends UseOperationTypesState {
    fetchOperationTypes: (params?: OperationTypeListParams) => Promise<void>;
    getOperationTypeById: (id: string) => Promise<OperationType>;
    createOperationType: (data: CreateOperationTypeRequest) => Promise<OperationType>;
    updateOperationType: (id: string, data: UpdateOperationTypeRequest) => Promise<OperationType>;
    deleteOperationType: (id: string) => Promise<void>;
}

export function useOperationTypes(initialParams: OperationTypeListParams = {}): UseOperationTypesReturn {
    const [state, setState] = useState<UseOperationTypesState>({
        operationTypes: [],
        pagination: { page: 1, total: 0 },
        isLoading: true,
        error: null,
    });

    const [currentParams, setCurrentParams] = useState<OperationTypeListParams>(initialParams);

    const fetchOperationTypes = useCallback(async (params: OperationTypeListParams = {}) => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await operationTypeService.getAllOperationTypes(params);
            const data = response.data;
            setState({
                operationTypes: data.data || [],
                pagination: {
                    page: data.page || 1,
                    total: data.total || 0,
                },
                isLoading: false,
                error: null,
            });
            setCurrentParams(params);
        } catch (error) {
            const errorMessage =
                error instanceof ApiError ? error.message : "Error al cargar los tipos de operación";
            setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
        }
    }, []);

    const getOperationTypeById = useCallback(async (id: string): Promise<OperationType> => {
        const response = await operationTypeService.getOperationTypeById(id);
        return response.data;
    }, []);

    const createOperationType = useCallback(async (data: CreateOperationTypeRequest): Promise<OperationType> => {
        const response = await operationTypeService.createOperationType(data);
        await fetchOperationTypes(currentParams);
        return response.data;
    }, [fetchOperationTypes, currentParams]);

    const updateOperationType = useCallback(async (id: string, data: UpdateOperationTypeRequest): Promise<OperationType> => {
        const response = await operationTypeService.updateOperationType(id, data);
        await fetchOperationTypes(currentParams);
        return response.data;
    }, [fetchOperationTypes, currentParams]);

    const deleteOperationType = useCallback(async (id: string): Promise<void> => {
        await operationTypeService.deleteOperationType(id);
        await fetchOperationTypes(currentParams);
    }, [fetchOperationTypes, currentParams]);

    useEffect(() => {
        fetchOperationTypes(initialParams);
    }, [fetchOperationTypes]);

    return {
        ...state,
        fetchOperationTypes,
        getOperationTypeById,
        createOperationType,
        updateOperationType,
        deleteOperationType,
    };
}
