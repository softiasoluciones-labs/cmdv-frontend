"use client";

/**
 * useCasePackageAssignments — same shape as useCaseProducts / useCaseServices.
 */

import { useState, useCallback, useEffect } from "react";
import { casePackageAssignmentService } from "@/lib/api/services/medical-services/casePackageAssignmentService";
import {
  CasePackageAssignment,
  ApplyCasePackageAssignmentRequest,
  VoidCasePackageAssignmentRequest,
} from "@/lib/api/types/medical-types/case-package-assignment.types";
import { ApiError, ApiResponse } from "@/lib/api/config";

const EMPTY_LIST_RESPONSE = {
  success: true,
  code: 200,
  message: "",
  data: [] as CasePackageAssignment[],
} as unknown as ApiResponse<CasePackageAssignment[]>;

interface UseCasePackageAssignmentsState {
  casePackages: CasePackageAssignment[];
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
}

interface UseCasePackageAssignmentsReturn extends UseCasePackageAssignmentsState {
  refresh: () => Promise<void>;
  applyPackageAssignment: (data: ApplyCasePackageAssignmentRequest) => Promise<CasePackageAssignment>;
  voidPackageAssignment: (id: string, data: VoidCasePackageAssignmentRequest) => Promise<CasePackageAssignment>;
  clearError: () => void;
}

export function useCasePackageAssignments(caseFileId: string | null): UseCasePackageAssignmentsReturn {
  const [state, setState] = useState<UseCasePackageAssignmentsState>({
    casePackages: [],
    isLoading: true,
    isMutating: false,
    error: null,
  });

  const refresh = useCallback(async () => {
    if (!caseFileId) return;
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const resp = await casePackageAssignmentService.listByCaseFile(caseFileId).catch(err => {
        if (err instanceof ApiError && err.statusCode === 422) return EMPTY_LIST_RESPONSE;
        throw err;
      });
      setState(prev => ({ ...prev, casePackages: resp.data ?? [], isLoading: false, error: null }));
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Error al cargar los paquetes del expediente";
      setState(prev => ({ ...prev, isLoading: false, error: message }));
    }
  }, [caseFileId]);

  const applyPackageAssignment = useCallback(
    async (data: ApplyCasePackageAssignmentRequest): Promise<CasePackageAssignment> => {
      if (!caseFileId) throw new Error("caseFileId is required");
      setState(prev => ({ ...prev, isMutating: true, error: null }));
      try {
        const resp = await casePackageAssignmentService.apply(caseFileId, data);
        try {
          await refresh();
        } catch {
          /* refresh already populated state.error if relevant */
        }
        setState(prev => ({ ...prev, isMutating: false }));
        return resp.data;
      } catch (error) {
        setState(prev => ({
          ...prev,
          isMutating: false,
          error: error instanceof ApiError ? error.message : "Error al registrar el cargo",
        }));
        throw error;
      }
    },
    [caseFileId, refresh]
  );

  const voidPackageAssignment = useCallback(
    async (id: string, data: VoidCasePackageAssignmentRequest): Promise<CasePackageAssignment> => {
      setState(prev => ({ ...prev, isMutating: true, error: null }));
      try {
        const resp = await casePackageAssignmentService.void(id, data);
        try {
          await refresh();
        } catch {
          /* same as applyPackageAssignment */
        }
        setState(prev => ({ ...prev, isMutating: false }));
        return resp.data;
      } catch (error) {
        setState(prev => ({
          ...prev,
          isMutating: false,
          error: error instanceof ApiError ? error.message : "Error al anular el cargo",
        }));
        throw error;
      }
    },
    [refresh]
  );

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...state, refresh, applyPackageAssignment, voidPackageAssignment, clearError };
}
