/**
 * Case-package-assignment (cargo de paquete) service
 *
 * Endpoints (all under /api/v1/medical):
 *   GET    /case-files/:caseFileId/package-assignments   → list assigned packages
 *   POST   /case-files/:caseFileId/package-assignments   → assign a package
 *   PATCH  /case-package-assignments/:id/void            → void an assignment
 */

import { api } from "../../client";
import {
  CasePackageAssignment,
  ApplyCasePackageAssignmentRequest,
  VoidCasePackageAssignmentRequest,
} from "../../types/medical-types/case-package-assignment.types";

const CASE_FILE_BASE = "/medical/case-files";
const CASE_PACKAGE_ASSIGNMENT_BASE = "/medical/case-package-assignments";

export const casePackageAssignmentService = {
  listByCaseFile: async (caseFileId: string) => {
    return api.get<CasePackageAssignment[]>(`${CASE_FILE_BASE}/${caseFileId}/package-assignments`);
  },

  apply: async (caseFileId: string, data: ApplyCasePackageAssignmentRequest) => {
    return api.post<CasePackageAssignment>(`${CASE_FILE_BASE}/${caseFileId}/package-assignments`, data);
  },

  void: async (assignmentId: string, data: VoidCasePackageAssignmentRequest) => {
    return api.patch<CasePackageAssignment>(`${CASE_PACKAGE_ASSIGNMENT_BASE}/${assignmentId}/void`, data);
  },
};
