/**
 * Case File service
 * API service for case file operations
 */

import { api } from "../../client";
import {
  CreateCaseFileRequest,
  UpdateCaseFileRequest,
  UpdateCaseStatusRequest,
  CaseFileResponse,
  CaseFileListResponse,
  CaseValidationResponse,
  CaseFileQueryParams,
  PaginationCaseFilesResponse,
  TransferabilityResponse,
  ClosabilityResponse,
} from "../../types/medical-types/caseFile.type";

const CASE_FILE_ENDPOINT = "/medical/case-files";

function transformQueryParams(
  params: CaseFileQueryParams
): Record<string, string | number | boolean | undefined> {
  const result: Record<string, any> = {};
  if (params.page !== undefined) result.page = params.page;
  if (params.limit !== undefined) result.limit = params.limit;
  if (params.patient_id !== undefined) result.patient_id = params.patient_id;
  if (params.admission_type_id !== undefined)
    result.admission_type_id = params.admission_type_id;
  if (params.case_status !== undefined) result.case_status = params.case_status;
  if (params.status_flow !== undefined) result.status_flow = params.status_flow;
  if (params.shift_type !== undefined) result.shift_type = params.shift_type;
  if (params.from_date !== undefined) result.from_date = params.from_date;
  if (params.to_date !== undefined) result.to_date = params.to_date;
  return result;
}

export const caseFileService = {
  /**
   * Get all case files with pagination and filters
   */
  getAllCaseFiles: async (params: CaseFileQueryParams) => {
    const queryParams = transformQueryParams(params);
    return api.get<PaginationCaseFilesResponse>(CASE_FILE_ENDPOINT, queryParams);
  },

  /**
   * Get case file by ID
   */
  getCaseFileById: async (id: string) => {
    return api.get<CaseFileResponse>(`${CASE_FILE_ENDPOINT}/${id}`);
  },

  /**
   * Get case file by case number
   */
  getCaseFileByCaseNumber: async (caseNumber: string) => {
    return api.get<CaseFileResponse>(
      `${CASE_FILE_ENDPOINT}/case-number/${caseNumber}`
    );
  },

  /**
   * Validate case compliance
   */
  validateCaseFile: async (id: string) => {
    return api.get<CaseValidationResponse>(
      `${CASE_FILE_ENDPOINT}/${id}/validation`
    );
  },

  /**
   * Check if case can be transferred
   */
  canTransferCase: async (id: string) => {
    return api.get<TransferabilityResponse>(
      `${CASE_FILE_ENDPOINT}/${id}/can-transfer`
    );
  },

  /**
   * Check if case can be closed
   */
  canCloseCase: async (id: string) => {
    return api.get<ClosabilityResponse>(
      `${CASE_FILE_ENDPOINT}/${id}/can-close`
    );
  },

  /**
   * Create new case file
   */
  createCaseFile: async (data: CreateCaseFileRequest) => {
    return api.post<CaseFileResponse>(CASE_FILE_ENDPOINT, data);
  },

  /**
   * Update case file
   */
  updateCaseFile: async (id: string, data: UpdateCaseFileRequest) => {
    return api.put<CaseFileResponse>(`${CASE_FILE_ENDPOINT}/${id}`, data);
  },

  /**
   * Update case status
   */
  updateCaseStatus: async (id: string, data: UpdateCaseStatusRequest) => {
    return api.patch<CaseFileResponse>(
      `${CASE_FILE_ENDPOINT}/${id}/status`,
      data
    );
  },

  /**
   * Delete case file
   */
  deleteCaseFile: async (id: string) => {
    return api.delete<CaseFileResponse>(`${CASE_FILE_ENDPOINT}/${id}`);
  },
};
