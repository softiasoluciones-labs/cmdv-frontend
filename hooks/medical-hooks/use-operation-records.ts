"use client";

import { useState, useEffect, useCallback } from "react";
import { operationRecordService } from "@/lib/api/services/medical-services/operationRecordService";
import {
    OperationRecord,
    CreateOperationRecordRequest,
    UpdateOperationRecordRequest,
    OperationRecordListParams
} from "@/lib/api/types/medical-types/operation-record.type";
import { ApiError } from "@/lib/api";

interface UseOperationRecordsState {
    records: OperationRecord[];
    pagination: {
        page: number;
        total: number;
    };
    isLoading: boolean;
    error: string | null;
}

interface UseOperationRecordsReturn extends UseOperationRecordsState {
    fetchRecords: (params?: OperationRecordListParams) => Promise<void>;
    getRecordById: (id: string) => Promise<OperationRecord>;
    getRecordByScheduledOperation: (scheduledOperationId: string) => Promise<OperationRecord | null>;
    createRecord: (data: CreateOperationRecordRequest) => Promise<OperationRecord>;
    updateRecord: (id: string, data: UpdateOperationRecordRequest) => Promise<OperationRecord>;
    deleteRecord: (id: string) => Promise<void>;
}

export function useOperationRecords(initialParams: OperationRecordListParams = {}): UseOperationRecordsReturn {
    const [state, setState] = useState<UseOperationRecordsState>({
        records: [],
        pagination: { page: 1, total: 0 },
        isLoading: true,
        error: null,
    });

    const [currentParams, setCurrentParams] = useState<OperationRecordListParams>(initialParams);

    const fetchRecords = useCallback(async (params: OperationRecordListParams = {}) => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await operationRecordService.getAllRecords(params);
            const data = response.data;
            setState({
                records: data.data || [],
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
                error instanceof ApiError ? error.message : "Error al cargar los registros de operación";
            setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
        }
    }, []);

    const getRecordById = useCallback(async (id: string): Promise<OperationRecord> => {
        const response = await operationRecordService.getRecordById(id);
        return response.data;
    }, []);

    const getRecordByScheduledOperation = useCallback(async (scheduledOperationId: string): Promise<OperationRecord | null> => {
        try {
            const response = await operationRecordService.getRecordByScheduledOperation(scheduledOperationId);
            return response.data;
        } catch (error) {
            return null;
        }
    }, []);

    const createRecord = useCallback(async (data: CreateOperationRecordRequest): Promise<OperationRecord> => {
        const response = await operationRecordService.createRecord(data);
        await fetchRecords(currentParams);
        return response.data;
    }, [fetchRecords, currentParams]);

    const updateRecord = useCallback(async (id: string, data: UpdateOperationRecordRequest): Promise<OperationRecord> => {
        const response = await operationRecordService.updateRecord(id, data);
        await fetchRecords(currentParams);
        return response.data;
    }, [fetchRecords, currentParams]);

    const deleteRecord = useCallback(async (id: string): Promise<void> => {
        await operationRecordService.deleteRecord(id);
        await fetchRecords(currentParams);
    }, [fetchRecords, currentParams]);

    useEffect(() => {
        fetchRecords(initialParams);
    }, [fetchRecords]);

    return {
        ...state,
        fetchRecords,
        getRecordById,
        getRecordByScheduledOperation,
        createRecord,
        updateRecord,
        deleteRecord,
    };
}
