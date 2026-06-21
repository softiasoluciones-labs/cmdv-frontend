/**
 * Doctor service
 * API service for doctor operations
 */

import { api } from "../../client";
import {
  DoctorResponse,
  DoctorListResponse,
  DoctorQueryParams,
} from "../../types/medical-types/doctor.types";

const DOCTOR_ENDPOINT = "/medical/doctors";

function transformQueryParams(
  params: DoctorQueryParams
): Record<string, string | number | boolean | undefined> {
  const result: Record<string, any> = {};
  if (params.search !== undefined) result.search = params.search;
  if (params.doctor_type !== undefined) result.doctor_type = params.doctor_type;
  if (params.specialty_id !== undefined) result.specialty_id = params.specialty_id;
  if (params.isActive !== undefined) result.isActive = params.isActive;
  return result;
}

export const doctorService = {
  /**
   * Get all doctors with filters
   */
  getAllDoctors: async (params?: DoctorQueryParams) => {
    const queryParams = params ? transformQueryParams(params) : undefined;
    return api.get<DoctorListResponse[]>(DOCTOR_ENDPOINT, queryParams);
  },

  /**
   * Get doctor by ID
   */
  getDoctorById: async (id: string) => {
    return api.get<DoctorResponse>(`${DOCTOR_ENDPOINT}/${id}`);
  },
};
