"use client";

/**
 * useWarehouseDispatches Hook
 * Custom hook for managing warehouse dispatches data
 */
import { useState, useCallback, useEffect } from "react";
import { warehouseDispatchService, DispatchFilters, DispatchSummary } from "@/lib/api/services/inventory-services/warehouse-dispatch-service";
import { WarehouseDispatch } from "@/lib/api/types/inventory-types/inventory.types";
import { ApiError } from "@/lib/api";

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

interface UseWarehouseDispatchesState {
    dispatches: WarehouseDispatch[];
    summary: DispatchSummary | null;
    isLoading: boolean;
    error: string | null;
}

interface UseWarehouseDispatchesReturn extends UseWarehouseDispatchesState {
    fetchDispatches: (filters?: DispatchFilters) => Promise<void>;
    createDispatch: (data: CreateDispatchFormData) => Promise<WarehouseDispatch | null>;
    updateDispatchStatus: (id: string, newStatus: string, notes?: string) => Promise<void>;
    deleteDispatch: (id: string) => Promise<void>;
}

export function useWarehouseDispatches(): UseWarehouseDispatchesReturn {
    const [state, setState] = useState<UseWarehouseDispatchesState>({
        dispatches: [],
        summary: null,
        isLoading: true,
        error: null,
    });

    const computeSummary = (dispatches: WarehouseDispatch[]): DispatchSummary => {
        const total = dispatches.length;
        const pending = dispatches.filter(d => d.status === 'pending').length;
        const approved = dispatches.filter(d => d.status === 'approved').length;
        const dispatched = dispatches.filter(d => d.status === 'dispatched').length;
        const completed = dispatches.filter(d => d.status === 'completed').length;
        const cancelled = dispatches.filter(d => d.status === 'cancelled').length;
        const inProgress = approved + dispatched;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
            total,
            pending,
            approved,
            dispatched,
            completed,
            cancelled,
            inProgress,
            completionRate,
        };
    };

    const fetchDispatches = useCallback(async (filters: DispatchFilters = {}) => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await warehouseDispatchService.getDispatches(filters);
            const dispatches = response.data?.dispatches || [];
            const summary = computeSummary(dispatches);

            setState({
                dispatches,
                summary,
                isLoading: false,
                error: null,
            });
        } catch (error) {
            const apiError = error as ApiError;
            setState(prev => ({
                ...prev,
                error: apiError.message || "Error al cargar despachos",
                isLoading: false,
            }));
        }
    }, []);

    useEffect(() => {
        fetchDispatches();
    }, [fetchDispatches]);

    const createDispatch = useCallback(async (data: CreateDispatchFormData): Promise<WarehouseDispatch | null> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await warehouseDispatchService.createDispatch(data);
            const newDispatch = response.data;

            setState(prev => ({
                ...prev,
                dispatches: [newDispatch, ...prev.dispatches],
                isLoading: false,
            }));

            return newDispatch;
        } catch (error) {
            const apiError = error as ApiError;
            setState(prev => ({
                ...prev,
                error: apiError.message || "Error al crear despacho",
                isLoading: false,
            }));
            return null;
        }
    }, []);

    const updateDispatchStatus = useCallback(async (id: string, newStatus: string, notes?: string) => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            let response;
            switch (newStatus) {
                case 'approved':
                    response = await warehouseDispatchService.approveDispatch(id);
                    break;
                case 'dispatched':
                    response = await warehouseDispatchService.executeDispatch(id, notes);
                    break;
                case 'completed':
                    response = await warehouseDispatchService.completeDispatch(id);
                    break;
                case 'cancelled':
                    response = await warehouseDispatchService.cancelDispatch(id, notes);
                    break;
                default:
                    throw new Error(`Invalid status: ${newStatus}`);
            }

            const updatedDispatch = response.data;

            setState(prev => ({
                ...prev,
                dispatches: prev.dispatches.map(d => d.id === id ? updatedDispatch : d),
                isLoading: false,
            }));
        } catch (error) {
            const apiError = error as ApiError;
            setState(prev => ({
                ...prev,
                error: apiError.message || "Error al actualizar estado del despacho",
                isLoading: false,
            }));
        }
    }, []);

    const deleteDispatch = useCallback(async (id: string) => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            await warehouseDispatchService.deleteDispatch(id);

            setState(prev => ({
                ...prev,
                dispatches: prev.dispatches.filter(d => d.id !== id),
                isLoading: false,
            }));
        } catch (error) {
            const apiError = error as ApiError;
            setState(prev => ({
                ...prev,
                error: apiError.message || "Error al eliminar despacho",
                isLoading: false,
            }));
        }
    }, []);

    return {
        ...state,
        fetchDispatches,
        createDispatch,
        updateDispatchStatus,
        deleteDispatch,
    };
}