"use client";

/**
 * useInvoice
 *
 * Owns the lifecycle of a single invoice (detail page):
 *   - fetch by id
 *   - confirm  → PATCH /invoices/:id/confirm
 *   - void     → PATCH /invoices/:id/void
 *   - applyDiscount / approveDiscount / removeDiscount
 *   - recordPayment / voidPayment
 *   - createTaxInvoice
 *
 * After every mutation, the local invoice is re-fetched so the page always
 * reflects authoritative totals from the backend.
 */

import { useState, useEffect, useCallback } from "react";
import { ApiError } from "@/lib/api";
import { invoiceService } from "@/lib/api/services/billing-services/invoiceService";
import { paymentService } from "@/lib/api/services/billing-services/paymentService";
import { discountService } from "@/lib/api/services/billing-services/discountService";
import { taxInvoiceService } from "@/lib/api/services/billing-services/taxInvoiceService";
import {
  Invoice,
  ConfirmInvoiceRequest,
  VoidInvoiceRequest,
  ApplyDiscountRequest,
  RecordPaymentRequest,
  VoidPaymentRequest,
  Payment,
  CreateTaxInvoiceRequest,
  TaxInvoice,
} from "@/lib/api/types/billing-types/billing.types";

interface UseInvoiceState {
  invoice: Invoice | null;
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
}

interface UseInvoiceReturn extends UseInvoiceState {
  fetchInvoice: () => Promise<void>;
  confirm: (data?: ConfirmInvoiceRequest) => Promise<Invoice>;
  voidInvoice: (data: VoidInvoiceRequest) => Promise<Invoice>;
  applyDiscount: (data: ApplyDiscountRequest) => Promise<{ requires_approval: boolean; message: string }>;
  approveDiscount: (discountId: string) => Promise<void>;
  removeDiscount: (discountId: string) => Promise<void>;
  recordPayment: (data: RecordPaymentRequest) => Promise<Payment>;
  voidPayment: (paymentId: string, data: VoidPaymentRequest) => Promise<Payment>;
  createTaxInvoice: (data: CreateTaxInvoiceRequest) => Promise<TaxInvoice>;
  clearError: () => void;
}

export function useInvoice(invoiceId: string | null): UseInvoiceReturn {
  const [state, setState] = useState<UseInvoiceState>({
    invoice: null,
    isLoading: true,
    isMutating: false,
    error: null,
  });

  const fetchInvoice = useCallback(async () => {
    if (!invoiceId) return;
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const resp = await invoiceService.getById(invoiceId);
      setState((prev) => ({
        ...prev,
        invoice: resp.data as unknown as Invoice,
        isLoading: false,
      }));
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Error al cargar la factura";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
    }
  }, [invoiceId]);

  const withMutation = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T> => {
      setState((prev) => ({ ...prev, isMutating: true, error: null }));
      try {
        const result = await fn();
        await fetchInvoice();
        setState((prev) => ({ ...prev, isMutating: false }));
        return result;
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message
            : "Operación no completada";
        setState((prev) => ({ ...prev, isMutating: false, error: message }));
        throw error;
      }
    },
    [fetchInvoice]
  );

  const confirm = useCallback(
    (data: ConfirmInvoiceRequest = {}) =>
      withMutation(async () => {
        const r = await invoiceService.confirm(invoiceId!, data);
        return r.data as unknown as Invoice;
      }),
    [withMutation, invoiceId]
  );

  const voidInvoice = useCallback(
    (data: VoidInvoiceRequest) =>
      withMutation(async () => {
        const r = await invoiceService.void(invoiceId!, data);
        return r.data as unknown as Invoice;
      }),
    [withMutation, invoiceId]
  );

  const applyDiscount = useCallback(
    (data: ApplyDiscountRequest) =>
      withMutation(async () => {
        const r = await discountService.apply(invoiceId!, data);
        return (r.data as unknown as {
          requires_approval: boolean;
          message: string;
        });
      }),
    [withMutation, invoiceId]
  );

  const approveDiscount = useCallback(
    (discountId: string) =>
      withMutation(async () => {
        await discountService.approve(invoiceId!, discountId);
      }),
    [withMutation, invoiceId]
  );

  const removeDiscount = useCallback(
    (discountId: string) =>
      withMutation(async () => {
        await discountService.remove(invoiceId!, discountId);
      }),
    [withMutation, invoiceId]
  );

  const recordPayment = useCallback(
    (data: RecordPaymentRequest) =>
      withMutation(async () => {
        const r = await paymentService.record(invoiceId!, data);
        return (r.data as unknown as { payment: Payment }).payment;
      }),
    [withMutation, invoiceId]
  );

  const voidPayment = useCallback(
    (paymentId: string, data: VoidPaymentRequest) =>
      withMutation(async () => {
        const r = await paymentService.void(invoiceId!, paymentId, data);
        return r.data as unknown as Payment;
      }),
    [withMutation, invoiceId]
  );

  const createTaxInvoice = useCallback(
    (data: CreateTaxInvoiceRequest) =>
      withMutation(async () => {
        const r = await taxInvoiceService.create(invoiceId!, data);
        return r.data as unknown as TaxInvoice;
      }),
    [withMutation, invoiceId]
  );

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  return {
    ...state,
    fetchInvoice,
    confirm,
    voidInvoice,
    applyDiscount,
    approveDiscount,
    removeDiscount,
    recordPayment,
    voidPayment,
    createTaxInvoice,
    clearError,
  };
}
