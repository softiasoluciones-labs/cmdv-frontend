/**
 * Warehouse Dispatch Service
 * Service for managing warehouse-to-warehouse product dispatches
 */

import { api } from "../../client";
import { ApiResponse, PaginatedResponse } from "../../config";
import {
    WarehouseDispatch,
    WarehouseDispatchDetail,
    CreateDispatchPayload,
} from "@/lib/api/types/inventory-types/inventory.types";

const DISPATCH_ENDPOINT = "/inventory/dispatches";

export interface DispatchFilters {
    page?: number;
    limit?: number;
    status?: string;
    sourceWarehouseId?: string;
    destinationWarehouseId?: string;
    dateFrom?: string;
    dateTo?: string;
}

export interface DispatchSummary {
    total: number;
    pending: number;
    approved: number;
    dispatched: number;
    completed: number;
    cancelled: number;
    inProgress: number;
    completionRate: number;
}

export interface DispatchListResponse {
    dispatches: WarehouseDispatch[];
    total: number;
    page: number;
    limit: number;
}

interface CreateDispatchFormData {
    sourceWarehouseId: string;
    destinationWarehouseId: string;
    requesterName: string;
    requesterUserId?: string;
    notes?: string;
    items: {
        productId: string;
        quantity: number;
        notes?: string;
    }[];
}

function transformToApiFormat(data: CreateDispatchFormData): any {
    return {
        source_warehouse_id: data.sourceWarehouseId,
        destination_warehouse_id: data.destinationWarehouseId,
        requester_name: data.requesterName,
        requester_user_id: data.requesterUserId || undefined,
        notes: data.notes || undefined,
        items: data.items.map(item => ({
            product_id: item.productId,
            quantity: item.quantity,
            notes: item.notes || undefined,
        })),
    };
}

export const warehouseDispatchService = {
    /**
     * Get all dispatches with pagination and filters
     */
    async getDispatches(filters: DispatchFilters = {}): Promise<ApiResponse<DispatchListResponse>> {
        const queryParams: Record<string, string | number | undefined> = {};
        if (filters.page) queryParams.page = filters.page;
        if (filters.limit) queryParams.limit = filters.limit;
        if (filters.status) queryParams.status = filters.status;
        if (filters.sourceWarehouseId) queryParams.sourceWarehouseId = filters.sourceWarehouseId;
        if (filters.destinationWarehouseId) queryParams.destinationWarehouseId = filters.destinationWarehouseId;
        if (filters.dateFrom) queryParams.dateFrom = filters.dateFrom;
        if (filters.dateTo) queryParams.dateTo = filters.dateTo;

        return api.get<DispatchListResponse>(DISPATCH_ENDPOINT, queryParams);
    },

    /**
     * Get dispatch by ID
     */
    async getDispatchById(id: string): Promise<ApiResponse<WarehouseDispatch>> {
        return api.get<WarehouseDispatch>(`${DISPATCH_ENDPOINT}/${id}`);
    },

    /**
     * Create a new dispatch
     */
    async createDispatch(payload: CreateDispatchFormData): Promise<ApiResponse<WarehouseDispatch>> {
        const transformedPayload = transformToApiFormat(payload);
        return api.post<WarehouseDispatch>(DISPATCH_ENDPOINT, transformedPayload);
    },

    /**
     * Approve a dispatch (validates stock)
     */
    async approveDispatch(id: string): Promise<ApiResponse<WarehouseDispatch>> {
        return api.post<WarehouseDispatch>(`${DISPATCH_ENDPOINT}/${id}/approve`);
    },

    /**
     * Execute dispatch (creates stock movements)
     */
    async executeDispatch(id: string, notes?: string): Promise<ApiResponse<WarehouseDispatch>> {
        return api.post<WarehouseDispatch>(`${DISPATCH_ENDPOINT}/${id}/dispatch`, { notes });
    },

    /**
     * Cancel dispatch
     */
    async cancelDispatch(id: string, notes?: string): Promise<ApiResponse<WarehouseDispatch>> {
        return api.post<WarehouseDispatch>(`${DISPATCH_ENDPOINT}/${id}/cancel`, { notes });
    },

    /**
     * Complete dispatch (mark as completed)
     */
    async completeDispatch(id: string): Promise<ApiResponse<WarehouseDispatch>> {
        return api.post<WarehouseDispatch>(`${DISPATCH_ENDPOINT}/${id}/complete`);
    },

    /**
     * Delete dispatch (only pending status)
     */
    async deleteDispatch(id: string): Promise<ApiResponse<void>> {
        return api.delete<void>(`${DISPATCH_ENDPOINT}/${id}`);
    },
};