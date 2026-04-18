import { api } from "../../client";
import {
    Warehouse
} from "../../types/inventory-types/inventory.types";

const WAREHOUSE_ENDPOINT = "/inventory/warehouses/"

export const warehouseService = {
    /**
     * Get all warehouses (not apply filters) 
     */
    getWarehouses: async () => {
        return api.get<Warehouse[]>(WAREHOUSE_ENDPOINT);
    },

    /**
     * Get warehouse by id 
     */
    getWarehouseById: async (id: string) => {
        return api.get<Warehouse>(`${WAREHOUSE_ENDPOINT}${id}`);
    },

    /**
     * Create new warehouse 
     */
    createWarehouse: async (warehouseData: Warehouse) => {
        return api.post<Warehouse>(WAREHOUSE_ENDPOINT, warehouseData);
    },

    /**
     * Update warehouse data 
     */
    updateWarehouse: async (id: string, warehouseData: Warehouse) => {
        return api.put<Warehouse>(`${WAREHOUSE_ENDPOINT}${id}`, warehouseData);
    },

    /**
     * Delete warehouse 
     */
    deleteWarehouse: async (id: string) => {
        return api.delete<Warehouse>(`${WAREHOUSE_ENDPOINT}${id}`);
    },

    /**
     * Get warehouse stock 
     */
    getWarehouseStock: async (id: string) => {
        return api.get<Warehouse>(`${WAREHOUSE_ENDPOINT}${id}/stock`);
    },
}
