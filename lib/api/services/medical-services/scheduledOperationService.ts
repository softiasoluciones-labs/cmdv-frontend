/**
 * Scheduled Operations service
 * API service for medical scheduled operations
 */

import { api } from "../../client";
import {
    ScheduledOperation,
    CreateScheduledOperationRequest,
    UpdateScheduledOperationRequest,
    UpdateScheduledOperationStatusRequest,
    ScheduledOperationListParams,
    PaginatedScheduledOperationsResponse
} from "../../types/medical-types/scheduled-operation.type";

const SCHEDULED_OPERATIONS_ENDPOINT = '/medical/scheduled-operations';

function transformQueryParams(params: ScheduledOperationListParams): Record<string, string | boolean | number> {
    const result: Record<string, any> = {};
    if (params.page !== undefined) result.page = params.page;
    if (params.limit !== undefined) result.limit = params.limit;
    if (params.search !== undefined) result.search = params.search;
    if (params.status !== undefined && params.status !== 'all') result.status = params.status;
    if (params.specialty !== undefined) result.specialty = params.specialty;
    if (params.surgeon_id !== undefined) result.surgeon_id = params.surgeon_id;
    if (params.date_from !== undefined) result.date_from = params.date_from;
    if (params.date_to !== undefined) result.date_to = params.date_to;
    return result;
}

export const scheduledOperationService = {
    /**
     * Get all scheduled operations with filters
     */
    getAllOperations: async (params: ScheduledOperationListParams = {}) => {
        const queryParams = transformQueryParams(params);
        return api.get<PaginatedScheduledOperationsResponse>(SCHEDULED_OPERATIONS_ENDPOINT, queryParams);
    },

    /**
     * Get scheduled operation by ID
     */
    getOperationById: async (id: string) => {
        return api.get<ScheduledOperation>(`${SCHEDULED_OPERATIONS_ENDPOINT}/${id}`);
    },

    /**
     * Create new scheduled operation
     */
    createOperation: async (data: CreateScheduledOperationRequest) => {
        return api.post<ScheduledOperation>(SCHEDULED_OPERATIONS_ENDPOINT, data);
    },

    /**
     * Update scheduled operation
     */
    updateOperation: async (id: string, data: UpdateScheduledOperationRequest) => {
        return api.put<ScheduledOperation>(`${SCHEDULED_OPERATIONS_ENDPOINT}/${id}`, data);
    },

    /**
     * Update scheduled operation status
     */
    updateOperationStatus: async (id: string, data: UpdateScheduledOperationStatusRequest) => {
        return api.patch<ScheduledOperation>(`${SCHEDULED_OPERATIONS_ENDPOINT}/${id}/status`, data);
    },

    /**
     * Delete scheduled operation
     */
    deleteOperation: async (id: string) => {
        return api.delete<{ success: boolean; message: string }>(`${SCHEDULED_OPERATIONS_ENDPOINT}/${id}`);
    },

    /**
     * Get team members for a scheduled operation
     */
    getTeamMembers: async (id: string) => {
        return api.get<ScheduledOperation['operation_teams']>(`${SCHEDULED_OPERATIONS_ENDPOINT}/${id}/team`);
    },

    /**
     * Add team member to scheduled operation
     */
    addTeamMember: async (id: string, data: { doctor_id: string; role: string }) => {
        return api.post<ScheduledOperation>(`${SCHEDULED_OPERATIONS_ENDPOINT}/${id}/team`, data);
    },

    /**
     * Remove team member from scheduled operation
     */
    removeTeamMember: async (id: string, memberId: string) => {
        return api.delete<{ success: boolean; message: string }>(`${SCHEDULED_OPERATIONS_ENDPOINT}/${id}/team/${memberId}`);
    }
};
