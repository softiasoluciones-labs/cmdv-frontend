/**
 * Medical Products Service 
 * API service for inventory operations 
 */

import { api } from "../../client"
import {
    ProductsQueryParams,
    PaginatedProductsResponse,
    Product
} from '../../types/inventory-types/inventory.types'

const MEDICAL_PRODUCT_ENDPOINT = "/inventory/products/"

/**
 * Transform API query params to the format expected by the backend 
 */
function transformQueryParams(params: ProductsQueryParams): Record<string, string | boolean | number> {

    const result: Record<string, any> = {};
    if (params.categoryId !== undefined) result.categoryId = params.categoryId;
    if (params.isActive !== undefined) result.isActive = params.isActive;
    if (params.requiresPrescription !== undefined) result.requiresPrescription = params.requiresPrescription;
    if (params.page !== undefined) result.page = params.page;
    if (params.limit !== undefined) result.limit = params.limit;
    if (params.search !== undefined) result.search = params.search;
    return result;
}

export const productService = {
    /**
     * Get current product inventory with optional filters 
     */
    getProducts: async (params: ProductsQueryParams) => {
        const queryParams = transformQueryParams(params);
        return api.get<PaginatedProductsResponse>(MEDICAL_PRODUCT_ENDPOINT, queryParams);
    },

    /**
     * Get product by id 
     */
    getProductById: async (id: string) => {
        return api.get<Product>(`${MEDICAL_PRODUCT_ENDPOINT}${id}`);
    },

    /**
     * Create new medical product
     */
    createProduct: async (productData: Product) => {
        return api.post<Product>(MEDICAL_PRODUCT_ENDPOINT, productData);
    },

    /**
     * Update data product 
     */
    updateProduct: async (id: string, productData: Product) => {
        return api.put<Product>(`${MEDICAL_PRODUCT_ENDPOINT}${id}`, productData);
    },

    /**
     * Delete product 
     */
    deleteProduct: async (id: string) => {
        return api.delete<Product>(`${MEDICAL_PRODUCT_ENDPOINT}${id}`);
    },

}