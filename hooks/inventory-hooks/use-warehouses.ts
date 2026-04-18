"use client";

/**
 * useWarehouses Hook
 * Custom hook for managing warehouses data with loading and error states
 */

import { useState, useCallback, useEffect } from "react";
import { warehouseService, Warehouse, ApiError } from "@/lib/api";


interface UseWarehousesState {
    warehouses: Warehouse[];
    isLoading: boolean;
    error: string | null;
}

interface UseWarehousesReturn extends UseWarehousesState {
    fetchWarehouses: () => Promise<void>;
    findById: (id: string) => Promise<void>;
    createWarehouse: (warehouseData: Warehouse) => Promise<void>;
    updateWarehouse: (id: string, warehouseData: Warehouse) => Promise<void>;
    deleteWarehouse: (id: string) => Promise<void>;
    getWarehouseStock: (id: string) => Promise<void>;
}

export function useWarehouses(): UseWarehousesReturn {
    const [state, setState] = useState<UseWarehousesState>({
        warehouses: [],
        isLoading: true,
        error: null,
    });

    const fetchWarehouses = useCallback(async () => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await warehouseService.getWarehouses();
            setState((prev) => ({ ...prev, warehouses: response.data, isLoading: false }));
        } catch (error) {
            const apiError = error as ApiError;
            setState((prev) => ({ ...prev, error: apiError.message, isLoading: false }));
        }
    }, []);

    const findById = useCallback(async (id: string) => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await warehouseService.getWarehouseById(id);
            setState((prev) => ({ 
                ...prev, 
                warehouses: prev.warehouses.some(w => w.id === id)
                    ? prev.warehouses.map(w => w.id === id ? response.data : w)
                    : [...prev.warehouses, response.data], 
                isLoading: false 
            }));
        } catch (error) {
            const apiError = error as ApiError;
            setState((prev) => ({ ...prev, error: apiError.message, isLoading: false }));
        }
    }, []);

    const createWarehouse = useCallback(async (warehouseData: Warehouse) => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await warehouseService.createWarehouse(warehouseData);
            setState((prev) => ({ ...prev, warehouses: [...prev.warehouses, response.data], isLoading: false }));
        } catch (error) {
            const apiError = error as ApiError;
            setState((prev) => ({ ...prev, error: apiError.message, isLoading: false }));
        }
    }, []);

    const updateWarehouse = useCallback(async (id: string, warehouseData: Warehouse) => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await warehouseService.updateWarehouse(id, warehouseData);
            setState((prev) => ({ ...prev, warehouses: prev.warehouses.map((warehouse) => warehouse.id === id ? response.data : warehouse), isLoading: false }));
        } catch (error) {
            const apiError = error as ApiError;
            setState((prev) => ({ ...prev, error: apiError.message, isLoading: false }));
        }
    }, []);

    const deleteWarehouse = useCallback(async (id: string) => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await warehouseService.deleteWarehouse(id);
            setState((prev) => ({ ...prev, warehouses: prev.warehouses.filter((warehouse) => warehouse.id !== id), isLoading: false }));
        } catch (error) {
            const apiError = error as ApiError;
            setState((prev) => ({ ...prev, error: apiError.message, isLoading: false }));
        }
    }, []);

    const getWarehouseStock = useCallback(async (id: string) => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await warehouseService.getWarehouseStock(id);
            setState((prev) => ({ 
                ...prev, 
                warehouses: prev.warehouses.map(w => w.id === id ? response.data : w), 
                isLoading: false 
            }));
        } catch (error) {
            const apiError = error as ApiError;
            setState((prev) => ({ ...prev, error: apiError.message, isLoading: false }));
        }
    }, []);

    useEffect(() => {
        fetchWarehouses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        ...state,
        fetchWarehouses,
        findById,
        createWarehouse,
        updateWarehouse,
        deleteWarehouse,
        getWarehouseStock,
    };
}