"use client";

/**
 * useCaseProducts
 *
 * Wraps caseProductService for the cargos page.
 * Tracks the applied-products list AND the billing summary together:
 *   - refresh() re-fetches both
 *   - applyProduct() applies a charge then refreshes both
 *   - voidProduct() voids a charge then refreshes both
 *
 * The hook throws on apply/void so the caller can show field-level errors
 * (e.g. 422 stock validation). List/summary fetches set `error` instead.
 *
 * Backend quirk: GET /products and GET /billing-summary may return 422 when
 * the case file has no cargos yet (rather than 200 with an empty array).
 * Those cases are treated as "empty" instead of a blocking error — only
 * genuine failures (401, 5xx, network errors) surface to `state.error`.
 */

import { useState, useCallback, useEffect } from "react";
import { caseProductService } from "@/lib/api/services/medical-services/caseProductService";
import {
  CaseProduct,
  ApplyCaseProductRequest,
  VoidCaseProductRequest,
  BillingSummary,
} from "@/lib/api/types/medical-types/case-product.types";
import { ApiError, ApiResponse } from "@/lib/api/config";

const EMPTY_LIST_RESPONSE = {
  success: true,
  code: 200,
  message: "",
  data: [] as CaseProduct[],
} as unknown as ApiResponse<CaseProduct[]>;

interface UseCaseProductsState {
  caseProducts: CaseProduct[];
  billingSummary: BillingSummary | null;
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
}

interface UseCaseProductsReturn extends UseCaseProductsState {
  refresh: () => Promise<void>;
  applyProduct: (data: ApplyCaseProductRequest) => Promise<CaseProduct>;
  voidProduct: (
    caseProductId: string,
    data: VoidCaseProductRequest
  ) => Promise<CaseProduct>;
  clearError: () => void;
}

export function useCaseProducts(
  caseFileId: string | null
): UseCaseProductsReturn {
  const [state, setState] = useState<UseCaseProductsState>({
    caseProducts: [],
    billingSummary: null,
    isLoading: true,
    isMutating: false,
    error: null,
  });

  const refresh = useCallback(async () => {
    if (!caseFileId) return;
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const [listResp, summaryResp] = await Promise.all([
        caseProductService.listByCaseFile(caseFileId).catch(err => {
          if (err instanceof ApiError && err.statusCode === 422) {
            return EMPTY_LIST_RESPONSE;
          }
          throw err;
        }),
        caseProductService.getBillingSummary(caseFileId).catch(err => {
          if (err instanceof ApiError && err.statusCode === 422) {
            return null;
          }
          throw err;
        }),
      ]);
      setState(prev => ({
        ...prev,
        caseProducts: listResp.data ?? [],
        billingSummary: summaryResp?.data ?? prev.billingSummary,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Error al cargar los cargos del expediente";
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
    }
  }, [caseFileId]);

  const applyProduct = useCallback(
    async (data: ApplyCaseProductRequest): Promise<CaseProduct> => {
      if (!caseFileId) throw new Error("caseFileId is required");
      setState(prev => ({ ...prev, isMutating: true, error: null }));
      try {
        const resp = await caseProductService.apply(caseFileId, data);
        const created = resp.data;
        // The charge was applied — a failed refresh afterwards (e.g. a
        // transient 422 from the listing endpoint) must not surface as an
        // apply error to the caller. The apply was successful.
        try {
          await refresh();
        } catch {
          /* refresh already populated state.error if relevant */
        }
        setState(prev => ({ ...prev, isMutating: false }));
        return created;
      } catch (error) {
        setState(prev => ({
          ...prev,
          isMutating: false,
          error:
            error instanceof ApiError
              ? error.message
              : "Error al registrar el cargo",
        }));
        throw error;
      }
    },
    [caseFileId, refresh]
  );

  const voidProduct = useCallback(
    async (
      caseProductId: string,
      data: VoidCaseProductRequest
    ): Promise<CaseProduct> => {
      setState(prev => ({ ...prev, isMutating: true, error: null }));
      try {
        const resp = await caseProductService.void(caseProductId, data);
        try {
          await refresh();
        } catch {
          /* same as applyProduct */
        }
        setState(prev => ({ ...prev, isMutating: false }));
        return resp.data;
      } catch (error) {
        setState(prev => ({
          ...prev,
          isMutating: false,
          error:
            error instanceof ApiError
              ? error.message
              : "Error al anular el cargo",
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

  return {
    ...state,
    refresh,
    applyProduct,
    voidProduct,
    clearError,
  };
}
