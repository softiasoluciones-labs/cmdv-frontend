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
    }

    /**
     * Create new medical packages 
     */

    /**
     * Update medical data packages 
     */

    /**
     * Inactivate medical package 
     */
}