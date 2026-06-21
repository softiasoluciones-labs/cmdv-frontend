/**
 * Admission Type service
 * API service for admission type operations
 */

import { api } from "../../client";
import {
  AdmissionTypeResponse,
  AdmissionTypeListResponse,
  AdmissionTypeQueryParams,
  AdmissionTypeRules,
} from "../../types/medical-types/admission-type.types";

const ADMISSION_TYPE_ENDPOINT = "/medical/admission-types";

function transformQueryParams(
  params: AdmissionTypeQueryParams
): Record<string, string | number | boolean | undefined> {
  const result: Record<string, any> = {};
  if (params.category !== undefined) result.category = params.category;
  if (params.requires_hospitalization !== undefined)
    result.requires_hospitalization = params.requires_hospitalization;
  if (params.requires_package !== undefined)
    result.requires_package = params.requires_package;
  if (params.allows_transfer !== undefined)
    result.allows_transfer = params.allows_transfer;
  if (params.is_active !== undefined) result.is_active = params.is_active;
  if (params.search !== undefined) result.search = params.search;
  return result;
}

export const admissionTypeService = {
  /**
   * Get all admission types with filters
   */
  getAllAdmissionTypes: async (params?: AdmissionTypeQueryParams) => {
    const queryParams = params ? transformQueryParams(params) : undefined;
    return api.get<AdmissionTypeListResponse[]>(
      ADMISSION_TYPE_ENDPOINT,
      queryParams
    );
  },

  /**
   * Get admission types grouped by category
   */
  getAdmissionTypesGrouped: async () => {
    return api.get<Record<string, AdmissionTypeListResponse[]>>(
      `${ADMISSION_TYPE_ENDPOINT}/grouped`
    );
  },

  /**
   * Get admission type by ID
   */
  getAdmissionTypeById: async (id: string) => {
    return api.get<AdmissionTypeResponse>(`${ADMISSION_TYPE_ENDPOINT}/${id}`);
  },

  /**
   * Get admission type by code
   */
  getAdmissionTypeByCode: async (code: string) => {
    return api.get<AdmissionTypeResponse>(
      `${ADMISSION_TYPE_ENDPOINT}/code/${code}`
    );
  },

  /**
   * Get admission type rules for UI
   */
  getAdmissionTypeRules: async (id: string) => {
    return api.get<AdmissionTypeRules>(
      `${ADMISSION_TYPE_ENDPOINT}/${id}/rules`
    );
  },
};
