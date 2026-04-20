"use client";

import { useState, useEffect, useCallback } from "react";
import { supplierService } from "@/lib/api/services/inventory-services/supplierService";
import { ApiError } from "@/lib/api/config";
import {
    Supplier,
    editSupplierData,
    SupplierQueryParams,
} from "@/lib/api/types/inventory-types/inventory.types";

interface UseSupplierState {
    suppliers: Supplier[];
    loading: boolean;
    error: ApiError | null;
}

export interface UseSuppliersReturn extends UseSupplierState {
    fetchSuppliers: (params?: SupplierQueryParams) => Promise<void>;
    findById: (id: string) => Promise<Supplier | null>;
    createSupplier: (supplierData: editSupplierData) => Promise<Supplier | null>;
    updateSupplier: (
        id: string,
        supplierData: editSupplierData
    ) => Promise<Supplier | null>;
    deleteSupplier: (id: string) => Promise<boolean>;
}

function toApiError(error: unknown): ApiError {
    if (error instanceof ApiError) return error;
    if (error instanceof Error) return new ApiError(error.message, 0, null);
    return new ApiError("Unknown error occurred", 0, null);
}

export const useSuppliers = (
    initialParams: SupplierQueryParams = {}
): UseSuppliersReturn => {
    const [state, setState] = useState<UseSupplierState>({
        suppliers: [],
        loading: false,
        error: null,
    });

    const fetchSuppliers = useCallback(
        async (params: SupplierQueryParams = {}) => {
            setState((prev) => ({ ...prev, loading: true, error: null }));
            try {
                const response = await supplierService.getSuppliers(params);
                setState((prev) => ({
                    ...prev,
                    suppliers: response.data,
                    loading: false,
                    error: null,
                }));
            } catch (error) {
                setState((prev) => ({
                    ...prev,
                    loading: false,
                    error: toApiError(error),
                }));
            }
        },
        []
    );

    const findById = useCallback(async (id: string): Promise<Supplier | null> => {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        try {
            const response = await supplierService.getSupplierById(id);
            setState((prev) => ({ ...prev, loading: false, error: null }));
            return response.data;
        } catch (error) {
            setState((prev) => ({
                ...prev,
                loading: false,
                error: toApiError(error),
            }));
            return null;
        }
    }, []);

    const createSupplier = useCallback(
        async (supplierData: editSupplierData): Promise<Supplier | null> => {
            setState((prev) => ({ ...prev, loading: true, error: null }));
            try {
                const response = await supplierService.createSupplier(supplierData);
                console.log("Create supplier response:", response);
                const created = response.data;
            
                setState((prev) => ({
                    ...prev,
                    suppliers: [...prev.suppliers, created],
                    loading: false,
                    error: null,
                }));
                return created;
            } catch (error) {
                setState((prev) => ({
                    ...prev,
                    loading: false,
                    error: toApiError(error),
                }));
                return null;
            }
        },
        []
    );

    const updateSupplier = useCallback(
        async (id: string, supplierData: editSupplierData): Promise<Supplier | null> => {
            setState((prev) => ({ ...prev, loading: true, error: null }));
            try {
                const response = await supplierService.updateSupplier(id, supplierData);
                const updated = response.data;
                setState((prev) => ({
                    ...prev,
                    suppliers: prev.suppliers.map((s) => (s.id === id ? updated : s)),
                    loading: false,
                    error: null,
                }));
                return updated;
            } catch (error) {
                setState((prev) => ({
                    ...prev,
                    loading: false,
                    error: toApiError(error),
                }));
                return null;
            }
        },
        []
    );

    const deleteSupplier = useCallback(async (id: string): Promise<boolean> => {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        try {
            await supplierService.deleteSupplier(id);
            setState((prev) => ({
                ...prev,
                suppliers: prev.suppliers.filter((s) => s.id !== id),
                loading: false,
                error: null,
            }));
            return true;
        } catch (error) {
            setState((prev) => ({
                ...prev,
                loading: false,
                error: toApiError(error),
            }));
            return false;
        }
    }, []);

    useEffect(() => {
        fetchSuppliers(initialParams);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        ...state,
        fetchSuppliers,
        findById,
        createSupplier,
        updateSupplier,
        deleteSupplier,
    };
};
