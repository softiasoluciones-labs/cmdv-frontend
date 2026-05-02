/**
 * Medical patients service 
 * API service for medical operations 
 */

import { api } from "../../client"
import {
    Patients, PaginationPatientsResponse, PatientsQueryParams
} from '../../types/medical-types/patient.types'

const MEDICAL_PATIENT_ENDPOINT = "/medical/patients";

function toStringArray(value: string | string[] | undefined): string[] | undefined {
    if (value === undefined || value === null) return undefined;
    if (Array.isArray(value)) return value.filter(Boolean);
    if (value === '') return [];
    return value.split(',').map((s) => s.trim()).filter(Boolean);
}

function transformQueryParams(params: PatientsQueryParams): Record<string, string | boolean | number> {
    const result: Record<string, any> = {};
    if (params.gender !== undefined) result.categoryId = params.gender;
    if (params.city !== undefined) result.city = params.city;
    if (params.state !== undefined) result.state = params.state;
    if (params.isActive !== undefined) result.isActive = params.isActive;
    if (params.page !== undefined) result.page = params.page;
    if (params.limit !== undefined) result.limit = params.limit;
    if (params.search !== undefined) result.search = params.search;
    return result;
}

export const patientService = {
    /**
     * Get all patients 
     */
    getAllPatients: async (params: PatientsQueryParams) => {
        const queryParams = transformQueryParams(params);
        return api.get<PaginationPatientsResponse>(MEDICAL_PATIENT_ENDPOINT, queryParams);
    },

    /**
     * Create new medical patient
     */
    createPatient: async (data: Patients) => {
        const payload = {
            ...data,
            allergies: toStringArray(data.allergies),
            chronicConditions: toStringArray(data.chronicConditions),
            currentMedications: toStringArray(data.currentMedications),
        };
        return api.post<Patients>(MEDICAL_PATIENT_ENDPOINT, payload);
    },

    /**
     * Update patient data
     */
    updatePatient: async (id: string, data: Patients) => {
        const payload = {
            ...data,
            allergies: toStringArray(data.allergies),
            chronicConditions: toStringArray(data.chronicConditions),
            currentMedications: toStringArray(data.currentMedications),
        };
        return api.put<Patients>(`${MEDICAL_PATIENT_ENDPOINT}/${id}`, payload);
    },

    /**
     * Delete or inactive patient
     */
    deleteProduct: async (id: string) => {
        return api.delete<Patients>(`${MEDICAL_PATIENT_ENDPOINT}/${id}`);
    },
}