/**
 * Operation Types service
 * API service for medical operation types
 */

import { api } from "../../client";
import {
    OperationType,
    CreateOperationTypeRequest,
    UpdateOperationTypeRequest,
    OperationTypeListParams,
    PaginatedOperationTypesResponse
} from "../../types/medical-types/operation-type.type";

const OPERATION_TYPES_ENDPOINT = '/medical/operation-types';

function transformQueryParams(params: OperationTypeListParams): Record<string, string | boolean | number> {
    const result: Record<string, any> = {};
    if (params.page !== undefined) result.page = params.page;
    if (params.limit !== undefined) result.limit = params.limit;
    if (params.specialty_id !== undefined) result.specialty_id = params.specialty_id;
    if (params.is_active !== undefined) result.is_active = params.is_active;
    return result;
}

export const operationTypeService = {
    /**
     * Get all operation types with filters
     */
    getAllOperationTypes: async (params: OperationTypeListParams = {}) => {
        const queryParams = transformQueryParams(params);
        return api.get<PaginatedOperationTypesResponse>(OPERATION_TYPES_ENDPOINT, queryParams);
    },

    /**
     * Get operation type by ID
     */
    getOperationTypeById: async (id: string) => {
        return api.get<OperationType>(`${OPERATION_TYPES_ENDPOINT}/${id}`);
    },

    /**
     * Create new operation type
     */
    createOperationType: async (data: CreateOperationTypeRequest) => {
        return api.post<OperationType>(OPERATION_TYPES_ENDPOINT, data);
    },

    /**
     * Update operation type
     */
    updateOperationType: async (id: string, data: UpdateOperationTypeRequest) => {
        return api.put<OperationType>(`${OPERATION_TYPES_ENDPOINT}/${id}`, data);
    },

    /**
     * Delete operation type
     */
    deleteOperationType: async (id: string) => {
        return api.delete<{ success: boolean; message: string }>(`${OPERATION_TYPES_ENDPOINT}/${id}`);
    }
};
