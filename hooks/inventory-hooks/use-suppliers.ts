"use client";

/**
 * use supplier hook 
 * Custom hook for managing suppliers data with loadinng and error states 
 */

import { useState, useEffect, useCallback } from "react";
import { supplierService } from "@/lib/api/services/inventory-services/supplierService";
import { ApiError } from "@/lib/api/config";
import { Supplier, SupplierQueryParams } from "@/lib/api/types/inventory-types/inventory.types";

interface UseSupplierState {
    suppliers: Supplier[];
    loading: boolean;
    error: ApiError | null;
}

interface UseSuppliersReturn extends UseSupplierState {
    fetchSuppliers: (params?: SupplierQueryParams) => Promise<void>;
    findById: (id: string) => Promise<void>;
    createSupplier: (supplierData: Supplier) => Promise<void>;
    updateSupplier: (id: string, supplierData: Supplier) => Promise<void>;
    deleteSupplier: (id: string) => Promise<void>;
}

export const useSuppliers = (initialParams: SupplierQueryParams = {}) => {
    const [state, setState] = useState<UseSupplierState>({
        suppliers: [],
        loading: false,
        error: null,
    });

    const fetchSuppliers = useCallback(async (params: SupplierQueryParams = {}) => {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        try {
            const response = await supplierService.getSuppliers(params);
            const data = response.data;

            setState((prev) => ({ ...prev, suppliers: data, loading: false, error: null }));
        } catch (error) {
            setState((prev) => ({ ...prev, loading: false, error: error as ApiError }));
        }
    }, []);

    const findById = useCallback(async (id: string) => {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        try {
            const response = await supplierService.getSupplierById(id);
            const data = response.data;

            setState((prev) => ({ ...prev, suppliers: [...prev.suppliers, data], loading: false, error: null }));
        } catch (error) {
            setState((prev) => ({ ...prev, loading: false, error: error as ApiError }));
        }
    }, []);

    const createSupplier = useCallback(async (supplierData: Supplier) => {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        try {
            const response = await supplierService.createSupplier(supplierData);
            const data = response.data;

            setState((prev) => ({ ...prev, suppliers: [...prev.suppliers, data], loading: false, error: null }));
        } catch (error) {
            setState((prev) => ({ ...prev, loading: false, error: error as ApiError }));
        }
    }, []);

    const updateSupplier = useCallback(async (id: string, supplierData: Supplier) => {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        try {
            const response = await supplierService.updateSupplier(id, supplierData);
            const data = response.data;

            setState((prev) => ({ ...prev, suppliers: prev.suppliers.map((supplier) => supplier.id === id ? data : supplier), loading: false, error: null }));
        } catch (error) {
            setState((prev) => ({ ...prev, loading: false, error: error as ApiError }));
        }
    }, []);

    const deleteSupplier = useCallback(async (id: string) => {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        try {
            const response = await supplierService.deleteSupplier(id);
            setState((prev) => ({ ...prev, loading: false, error: null }));
        } catch (error) {
            setState((prev) => ({ ...prev, loading: false, error: error as ApiError }));
        }
    }, []);

    useEffect(() => {
        fetchSuppliers(initialParams);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { ...state, fetchSuppliers, findById, createSupplier, updateSupplier, deleteSupplier };
}