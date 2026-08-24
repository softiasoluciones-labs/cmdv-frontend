"use client";

/**
 * useInvoices
 *
 * The backend does NOT expose a paginated list endpoint for invoices
 * (see `cmdv-backend/src/api/v1/routers/billing.routes.ts`). The natural
 * way to reach an invoice is via its case file:
 *
 *   GET /billing/invoices/case-file/:caseFileId   → returns the invoice
 *                                                    (404/422 if none yet)
 *
 * This hook therefore:
 *   1) Lists case files in billable status flows (CE_CARGOS_EXPEDIENTE,
 *      CC_CONFIRMACION_CARGOS, C3_CERRADO).
 *   2) For each one, lazily fetches the invoice (404/422 ⇒ "no invoice yet").
 *
 * Each row in the resulting list has `{ case, invoice | null }` so the page
 * can decide whether to show "Generate" or "Open invoice".
 *
 * Generation itself returns a fresh `Invoice` and triggers a re-fetch.
 */

import { useState, useEffect, useCallback } from "react";
import { ApiError } from "@/lib/api";
import { caseFileService } from "@/lib/api/services/medical-services/caseFileService";
import { invoiceService } from "@/lib/api/services/billing-services/invoiceService";
import {
  Invoice,
  GenerateInvoiceRequest,
  InvoiceStatus,
} from "@/lib/api/types/billing-types/billing.types";
import {
  CaseFileListResponse,
  CaseFileQueryParams,
  CaseStatusFlow,
} from "@/lib/api/types/medical-types/caseFile.type";

export interface InvoiceListRow {
  case: CaseFileListResponse;
  invoice: Invoice | null;
}

export interface InvoicesQueryParams {
  page?: number;
  limit?: number;
  status?: InvoiceStatus;
  case_file_id?: string;
  patient_id?: string;
  from_date?: string;
  to_date?: string;
}

const EMPTY_INVOICE: Invoice | null = null;

interface UseInvoicesState {
  rows: InvoiceListRow[];
  pagination: {
    page: number;
    total: number;
    totalPages: number;
  };
  isLoading: boolean;
  isResolving: boolean;
  error: string | null;
}

interface UseInvoicesReturn extends UseInvoicesState {
  fetchInvoices: (params: InvoicesQueryParams) => Promise<void>;
  generateInvoice: (data: GenerateInvoiceRequest) => Promise<Invoice>;
  refreshOne: (caseFileId: string) => Promise<void>;
  clearError: () => void;
}

export function useInvoices(
  initialParams: InvoicesQueryParams = {}
): UseInvoicesReturn {
  const [state, setState] = useState<UseInvoicesState>({
    rows: [],
    pagination: { page: 1, total: 0, totalPages: 0 },
    isLoading: true,
    isResolving: false,
    error: null,
  });

  const [currentParams, setCurrentParams] =
    useState<InvoicesQueryParams>(initialParams);

  const fetchInvoices = useCallback(
    async (params: InvoicesQueryParams = {}) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        // Backend has no paginated list of case files per status flow, so we
        // query by status_flow=CE_CARGOS_EXPEDIENTE to surface every case
        // that is ready to be invoiced (plus any others passed via params).
        const cfParams: CaseFileQueryParams = {
          limit: params.limit ?? 50,
          ...(params.page && { page: params.page }),
        };
        const cfResp = await caseFileService.getAllCaseFiles(cfParams);
        const cases: CaseFileListResponse[] = Array.isArray(cfResp.data)
          ? (cfResp.data as unknown as CaseFileListResponse[])
          : ((cfResp.data as any).cases ?? (cfResp.data as any).data ?? []);

        const page = Array.isArray(cfResp.data)
          ? 1
          : ((cfResp.data as any).page ?? 1);
        const total = Array.isArray(cfResp.data)
          ? (cfResp.data as any).length ?? 0
          : ((cfResp.data as any).total ?? 0);
        const totalPages = Array.isArray(cfResp.data)
          ? 1
          : ((cfResp.data as any).totalPages ?? 0);

        // Keep only cases in billable state flows.
        const BILLABLE = new Set<string>([
          CaseStatusFlow.CE_CARGOS_EXPEDIENTE,
          CaseStatusFlow.CC_CONFIRMACION_CARGOS,
          CaseStatusFlow.C3_CERRADO,
          CaseStatusFlow.RA_REAPERTURA,
        ]);
        const billable = cases.filter((c) =>
          BILLABLE.has(c.current_status_flow)
        );

        // First, surface rows without invoice info so the UI shows instantly.
        setState((prev) => ({
          ...prev,
          rows: billable.map((c) => ({ case: c, invoice: null })),
          pagination: { page, total, totalPages },
          isLoading: false,
          isResolving: billable.length > 0,
        }));

        // Then resolve invoices in parallel. 404/422 means "no invoice yet".
        const resolved = await Promise.all(
          billable.map((c) =>
            invoiceService
              .getByCaseFile(c.id)
              .then((r) => r.data as unknown as Invoice)
              .catch((err) => {
                if (err instanceof ApiError &&
                    (err.statusCode === 404 || err.statusCode === 422)) {
                  return EMPTY_INVOICE;
                }
                return EMPTY_INVOICE;
              })
          )
        );

        setState((prev) => ({
          ...prev,
          rows: billable.map((c, i) => ({ case: c, invoice: resolved[i] })),
          isResolving: false,
        }));
        setCurrentParams(params);
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message
            : "Error al cargar las facturas";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isResolving: false,
          error: message,
        }));
      }
    },
    []
  );

  const generateInvoice = useCallback(
    async (data: GenerateInvoiceRequest): Promise<Invoice> => {
      try {
        const response = await invoiceService.generate(data);
        const created = response.data as unknown as Invoice;
        try {
          await fetchInvoices(currentParams);
        } catch {
          /* noop */
        }
        return created;
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message
            : "Error al generar la factura";
        setState((prev) => ({ ...prev, error: message }));
        throw error;
      }
    },
    [fetchInvoices, currentParams]
  );

  const refreshOne = useCallback(
    async (caseFileId: string) => {
      try {
        const resp = await invoiceService.getByCaseFile(caseFileId);
        const inv = resp.data as unknown as Invoice;
        setState((prev) => ({
          ...prev,
          rows: prev.rows.map((row) =>
            row.case.id === caseFileId ? { ...row, invoice: inv } : row
          ),
        }));
      } catch (err) {
        if (err instanceof ApiError &&
            (err.statusCode === 404 || err.statusCode === 422)) {
          setState((prev) => ({
            ...prev,
            rows: prev.rows.map((row) =>
              row.case.id === caseFileId ? { ...row, invoice: null } : row
            ),
          }));
          return;
        }
        const message =
          err instanceof ApiError ? err.message : "Error al actualizar la factura";
        setState((prev) => ({ ...prev, error: message }));
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  useEffect(() => {
    fetchInvoices(initialParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    ...state,
    fetchInvoices,
    generateInvoice,
    refreshOne,
    clearError,
  };
}
