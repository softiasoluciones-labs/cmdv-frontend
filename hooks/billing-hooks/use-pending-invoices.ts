"use client";

/**
 * usePendingInvoices
 *
 * Dedicated to the Caja (cashier) screen — lists invoices that are ready to
 * be collected (confirmed / partially_paid) via the real backend list
 * endpoint (`GET /billing/invoices`). This is separate from `useInvoices`
 * (used by /billing/invoices), which still does its own case-file fan-out
 * for that page — left untouched so it keeps working as-is.
 */

import { useState, useCallback, useEffect } from "react";
import { ApiError } from "@/lib/api";
import { invoiceService } from "@/lib/api/services/billing-services/invoiceService";
import { Invoice, InvoiceStatus } from "@/lib/api/types/billing-types/billing.types";

const PENDING_STATUSES = [InvoiceStatus.CONFIRMED, InvoiceStatus.PARTIALLY_PAID];

interface UsePendingInvoicesState {
  invoices: Invoice[];
  isLoading: boolean;
  error: string | null;
}

interface UsePendingInvoicesReturn extends UsePendingInvoicesState {
  fetchPending: (search?: string) => Promise<void>;
  refresh: () => Promise<void>;
  clearError: () => void;
}

export function usePendingInvoices(): UsePendingInvoicesReturn {
  const [state, setState] = useState<UsePendingInvoicesState>({
    invoices: [],
    isLoading: true,
    error: null,
  });
  const [lastSearch, setLastSearch] = useState<string | undefined>(undefined);

  const fetchPending = useCallback(async (search?: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    setLastSearch(search);
    try {
      const resp = await invoiceService.list({
        status: PENDING_STATUSES,
        ...(search && { search }),
      });
      setState({
        invoices: resp.data.invoices ?? [],
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Error al cargar las facturas pendientes de cobro";
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
    }
  }, []);

  const refresh = useCallback(() => fetchPending(lastSearch), [fetchPending, lastSearch]);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  useEffect(() => {
    fetchPending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ...state, fetchPending, refresh, clearError };
}
