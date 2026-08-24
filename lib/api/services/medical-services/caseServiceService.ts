/**
 * Case-service (cargo de servicio / consulta médica) service
 *
 * Endpoints (all under /api/v1/medical):
 *   GET    /case-files/:caseFileId/services   → list applied services
 *   POST   /case-files/:caseFileId/services   → apply a service (or consultation)
 *   PATCH  /case-services/:id/void            → void an applied service
 */

import { api } from "../../client";
import {
  CaseService,
  ApplyCaseServiceRequest,
  VoidCaseServiceRequest,
} from "../../types/medical-types/case-service.types";

const CASE_FILE_BASE = "/medical/case-files";
const CASE_SERVICE_BASE = "/medical/case-services";

export const caseServiceService = {
  listByCaseFile: async (caseFileId: string) => {
    return api.get<CaseService[]>(`${CASE_FILE_BASE}/${caseFileId}/services`);
  },

  /**
   * Apply a new service (or consultation) charge. When the service requires
   * a doctor fee, the backend resolves `unit_price` from the doctor's
   * consultation_fee server-side — never trust a client-sent price.
   */
  apply: async (caseFileId: string, data: ApplyCaseServiceRequest) => {
    return api.post<CaseService>(`${CASE_FILE_BASE}/${caseFileId}/services`, data);
  },

  void: async (caseServiceId: string, data: VoidCaseServiceRequest) => {
    return api.patch<CaseService>(`${CASE_SERVICE_BASE}/${caseServiceId}/void`, data);
  },
};
