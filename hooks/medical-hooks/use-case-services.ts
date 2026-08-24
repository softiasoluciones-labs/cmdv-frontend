"use client";

/**
 * useCaseServices
 *
 * Same shape as useCaseProducts (hooks/medical-hooks/use-case-products.ts):
 * refresh() lists charges, apply/void mutate then refresh, and apply/void
 * throw so the caller can show field-level errors while list fetch errors
 * only set `error`.
 */

import { useState, useCallback, useEffect } from "react";
import { caseServiceService } from "@/lib/api/services/medical-services/caseServiceService";
import {
  CaseService,
  ApplyCaseServiceRequest,
  VoidCaseServiceRequest,
} from "@/lib/api/types/medical-types/case-service.types";
import { ApiError, ApiResponse } from "@/lib/api/config";

const EMPTY_LIST_RESPONSE = {
  success: true,
  code: 200,
  message: "",
  data: [] as CaseService[],
} as unknown as ApiResponse<CaseService[]>;

interface UseCaseServicesState {
  caseServices: CaseService[];
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
}

interface UseCaseServicesReturn extends UseCaseServicesState {
  refresh: () => Promise<void>;
  applyService: (data: ApplyCaseServiceRequest) => Promise<CaseService>;
  voidService: (caseServiceId: string, data: VoidCaseServiceRequest) => Promise<CaseService>;
  clearError: () => void;
}

export function useCaseServices(caseFileId: string | null): UseCaseServicesReturn {
  const [state, setState] = useState<UseCaseServicesState>({
    caseServices: [],
    isLoading: true,
    isMutating: false,
    error: null,
  });

  const refresh = useCallback(async () => {
    if (!caseFileId) return;
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const resp = await caseServiceService.listByCaseFile(caseFileId).catch(err => {
        if (err instanceof ApiError && err.statusCode === 422) return EMPTY_LIST_RESPONSE;
        throw err;
      });
      setState(prev => ({ ...prev, caseServices: resp.data ?? [], isLoading: false, error: null }));
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Error al cargar los servicios del expediente";
      setState(prev => ({ ...prev, isLoading: false, error: message }));
    }
  }, [caseFileId]);

  const applyService = useCallback(
    async (data: ApplyCaseServiceRequest): Promise<CaseService> => {
      if (!caseFileId) throw new Error("caseFileId is required");
      setState(prev => ({ ...prev, isMutating: true, error: null }));
      try {
        const resp = await caseServiceService.apply(caseFileId, data);
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

  const voidService = useCallback(
    async (caseServiceId: string, data: VoidCaseServiceRequest): Promise<CaseService> => {
      setState(prev => ({ ...prev, isMutating: true, error: null }));
      try {
        const resp = await caseServiceService.void(caseServiceId, data);
        try {
          await refresh();
        } catch {
          /* same as applyService */
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

  return { ...state, refresh, applyService, voidService, clearError };
}
