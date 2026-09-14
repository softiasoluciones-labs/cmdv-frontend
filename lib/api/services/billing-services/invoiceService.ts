/**
 * Invoice service
 *
 * Endpoints (all under /api/v1/billing):
 *   GET   /invoices                            → list (filter by status, search)
 *   POST  /invoices                            → generate from case file
 *   GET   /invoices/:id                        → get by id
 *   GET   /invoices/case-file/:caseFileId      → get by case file
 *   PATCH /invoices/:id/confirm                → confirm (lock charges)
 *   PATCH /invoices/:id/void                   → void
 */

import { api } from "../../client";
import {
  Invoice,
  InvoiceStatus,
  GenerateInvoiceRequest,
  ConfirmInvoiceRequest,
  VoidInvoiceRequest,
} from "../../types/billing-types/billing.types";

const INVOICE_ENDPOINT = "/billing/invoices";

export interface InvoiceListParams {
  status?: InvoiceStatus[];
  search?: string;
  page?: number;
  limit?: number;
}

export interface InvoiceListResult {
  invoices: Invoice[];
  total: number;
  page: number;
  totalPages: number;
}

export const invoiceService = {
  /** List invoices, optionally filtered by status and/or search term. */
  list: async (params: InvoiceListParams = {}) => {
    const query: Record<string, string | number> = {};
    if (params.status && params.status.length > 0) query.status = params.status.join(",");
    if (params.search) query.search = params.search;
    if (params.page) query.page = params.page;
    if (params.limit) query.limit = params.limit;
    return api.get<InvoiceListResult>(INVOICE_ENDPOINT, query);
  },

  /** Generate a new invoice snapshot from a case file. */
  generate: async (data: GenerateInvoiceRequest) => {
    return api.post<Invoice>(INVOICE_ENDPOINT, data);
  },

  /** Fetch an invoice by id (includes items, discounts, payments, tax invoice). */
  getById: async (id: string) => {
    return api.get<Invoice>(`${INVOICE_ENDPOINT}/${id}`);
  },

  /** Fetch the invoice associated with a specific case file. */
  getByCaseFile: async (caseFileId: string) => {
    return api.get<Invoice>(`${INVOICE_ENDPOINT}/case-file/${caseFileId}`);
  },

  /** Confirm an invoice so charges are locked and the case advances. */
  confirm: async (id: string, data: ConfirmInvoiceRequest = {}) => {
    return api.patch<Invoice>(`${INVOICE_ENDPOINT}/${id}/confirm`, data);
  },

  /** Void an invoice with a mandatory reason. */
  void: async (id: string, data: VoidInvoiceRequest) => {
    return api.patch<Invoice>(`${INVOICE_ENDPOINT}/${id}/void`, data);
  },
};
