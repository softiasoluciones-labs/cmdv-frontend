import { api } from "../../client"
import {
    MedicalService, PaginationServicesResponse, ServicesQueryParams
} from '../../types/medical-types/services.types'

const MEDICAL_SERVICES_ENDPOINT = "/medical/services";

function transformQueryParams(params: ServicesQueryParams): Record<string, string | boolean | number> {
    const result: Record<string, any> = {};
    if (params.search !== undefined) result.search = params.search;
    if (params.isActive !== undefined) result.isActive = params.isActive;
    if (params.serviceTypeId !== undefined) result.serviceTypeId = params.serviceTypeId;
    if (params.page !== undefined) result.page = params.page;
    if (params.limit !== undefined) result.limit = params.limit;
    return result;
}

export const servicesService = {
    getAllServices: async (params: ServicesQueryParams) => {
        const queryParams = transformQueryParams(params);
        return api.get<PaginationServicesResponse>(MEDICAL_SERVICES_ENDPOINT, queryParams);
    },

    createService: async (data: MedicalService) => {
        return api.post<MedicalService>(MEDICAL_SERVICES_ENDPOINT, data);
    },

    updateService: async (id: string, data: MedicalService) => {
        return api.put<MedicalService>(`${MEDICAL_SERVICES_ENDPOINT}/${id}`, data);
    },

    deleteService: async (id: string) => {
        return api.delete<MedicalService>(`${MEDICAL_SERVICES_ENDPOINT}/${id}`);
    },
}