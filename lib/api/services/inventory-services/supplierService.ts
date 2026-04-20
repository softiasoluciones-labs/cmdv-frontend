import { api } from "../../client";
import { editSupplierData, Supplier, SupplierQueryParams } from "../../types/inventory-types/inventory.types";

const MEDICAL_SUPPLIER_ENDPOINT = "/inventory/suppliers/"

/**
 * Transform API query params to the format expected by the backend
 */
function transformQueryParams(params: SupplierQueryParams): Record<string, string | boolean | number> {
    const result: Record<string, any> = {};
    if (params.activeOnly !== undefined) result.activeOnly = params.activeOnly;
    return result;
}

export const supplierService = {
    /**
     * Get current supplier inventory with optional filters
     */
    getSuppliers: async (params: SupplierQueryParams) => {
        const queryParams = transformQueryParams(params);
        return api.get<Supplier[]>(MEDICAL_SUPPLIER_ENDPOINT, queryParams);
    },

    /**
     * Get supplier by id
     */
    getSupplierById: async (id: string) => {
        return api.get<Supplier>(`${MEDICAL_SUPPLIER_ENDPOINT}${id}`);
    },

    /**
     * Create new medical supplier
     */
    createSupplier: async (supplierData: editSupplierData) => {
        return api.post<Supplier>(MEDICAL_SUPPLIER_ENDPOINT, supplierData);
    },

    /**
     * Update data supplier
     */
    updateSupplier: async (id: string, supplierData: editSupplierData) => {
        return api.put<Supplier>(`${MEDICAL_SUPPLIER_ENDPOINT}${id}`, supplierData);
    },

    /**
     * Delete supplier
     */
    deleteSupplier: async (id: string) => {
        return api.delete<Supplier>(`${MEDICAL_SUPPLIER_ENDPOINT}${id}`);
    },
}