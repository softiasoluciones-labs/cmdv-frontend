/**
 * Medical packages service
 * API service for medical package operations
 */

import { api } from "../../client";
import { Packages, PackagesQueryParams, PaginationPackagesResponse } from "../../types/medical-types/package.type";

const MEDICAL_PACKAGE_ENDPOINTS = '/medical/packages';

function transformQueryParams(params: PackagesQueryParams): Record<string, string | boolean | number> {
    const result: Record<string, any> = {};
    if (params.page !== undefined) result.page = params.page;
    if (params.limit !== undefined) result.limit = params.limit;
    if (params.search !== undefined) result.search = params.search;
    if (params.is_active !== undefined) result.is_active = params.is_active;
    if (params.doctor_type !== undefined) result.doctor_type = params.doctor_type;
    if (params.code !== undefined) result.code = params.code;
    if (params.service_id != undefined) result.service_id = params.service_id;
    if (params.year !== undefined) result.year = params.year;
    return result;
}

export const packageService = {
    /**
     * Get all packages with details
     */
    getAllPackages: async (params: PackagesQueryParams) => {
        const queryParams = transformQueryParams(params);
        return api.get<PaginationPackagesResponse>(MEDICAL_PACKAGE_ENDPOINTS, queryParams);
    },

    /**
     * Create new medical packages
     */
    createNewPackage: async (data: Packages) => {
        const payload = {
            ...data,
        }
        return api.post<Packages>(MEDICAL_PACKAGE_ENDPOINTS, payload);
    },

    /**
     * Copy current package and create a new one
     */
    copyPackage: async (id: string, data: { name: string; description?: string; external_doctor_price?: number; internal_doctor_price?: number }) => {
        return api.post<Packages>(`${MEDICAL_PACKAGE_ENDPOINTS}/${id}/copy`, data);
    },

    /**
     * Update medical package data
     */
    updatePackage: async (id: string, data: { description?: string; external_doctor_price?: number; internal_doctor_price?: number }) => {
        return api.put<Packages>(`${MEDICAL_PACKAGE_ENDPOINTS}/${id}`, data);
    },

    /**
     * Deactivate medical package
     */
    deactivatePackage: async (id: string) => {
        return api.patch<Packages>(`${MEDICAL_PACKAGE_ENDPOINTS}/${id}/deactivate`, {});
    },

    /**
     * Remove item detail from package
     */
    removePackageDetail: async (detailId: string) => {
        return api.delete<{ success: boolean; response: string }>(`/medical/remove-item-detail/${detailId}`);
    },

    /**
     * Add item detail to package
     */
    addPackageDetail: async (data: { package_id: string; product_id: string; quantity: number; notes?: string }) => {
        return api.post<{ success: boolean; id: string; response: string }>(`/medical/packages/${data.package_id}/add-item`, data);
    }
};