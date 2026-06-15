/**
 * Operation Records service
 * API service for medical operation records
 */

import { api } from "../../client";
import {
    OperationRecord,
    CreateOperationRecordRequest,
    UpdateOperationRecordRequest,
    OperationRecordListParams,
    PaginatedOperationRecordsResponse
} from "../../types/medical-types/operation-record.type";

const OPERATION_RECORDS_ENDPOINT = '/medical/operation-records';

function transformQueryParams(params: OperationRecordListParams): Record<string, string | boolean | number> {
    const result: Record<string, any> = {};
    if (params.page !== undefined) result.page = params.page;
    if (params.limit !== undefined) result.limit = params.limit;
    if (params.scheduled_operation_id !== undefined) result.scheduled_operation_id = params.scheduled_operation_id;
    return result;
}

export const operationRecordService = {
    /**
     * Get all operation records with filters
     */
    getAllRecords: async (params: OperationRecordListParams = {}) => {
        const queryParams = transformQueryParams(params);
        return api.get<PaginatedOperationRecordsResponse>(OPERATION_RECORDS_ENDPOINT, queryParams);
    },

    /**
     * Get operation record by ID
     */
    getRecordById: async (id: string) => {
        return api.get<OperationRecord>(`${OPERATION_RECORDS_ENDPOINT}/${id}`);
    },

    /**
     * Get operation record by scheduled operation ID
     */
    getRecordByScheduledOperation: async (scheduledOperationId: string) => {
        return api.get<OperationRecord>(`${OPERATION_RECORDS_ENDPOINT}/scheduled/${scheduledOperationId}`);
    },

    /**
     * Create new operation record
     */
    createRecord: async (data: CreateOperationRecordRequest) => {
        return api.post<OperationRecord>(OPERATION_RECORDS_ENDPOINT, data);
    },

    /**
     * Update operation record
     */
    updateRecord: async (id: string, data: UpdateOperationRecordRequest) => {
        return api.put<OperationRecord>(`${OPERATION_RECORDS_ENDPOINT}/${id}`, data);
    },

    /**
     * Delete operation record
     */
    deleteRecord: async (id: string) => {
        return api.delete<{ success: boolean; message: string }>(`${OPERATION_RECORDS_ENDPOINT}/${id}`);
    }
};
