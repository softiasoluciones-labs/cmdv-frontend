/**
 * Payment service
 *
 * Endpoints (all under /api/v1/billing):
 *   POST  /invoices/:id/payments                       → record a payment
 *   GET   /invoices/:id/payments                       → list payments for invoice
 *   PATCH /invoices/:id/payments/:paymentId/void       → void a payment
 */

import { api } from "../../client";
import {
  Payment,
  RecordPaymentRequest,
  RecordPaymentResponse,
  VoidPaymentRequest,
} from "../../types/billing-types/billing.types";

const PAYMENT_BASE = "/billing/invoices";

export const paymentService = {
  /** Record a payment (cash, card, transfer, check, insurance). */
  record: async (invoiceId: string, data: RecordPaymentRequest) => {
    return api.post<RecordPaymentResponse>(
      `${PAYMENT_BASE}/${invoiceId}/payments`,
      data
    );
  },

  /** List every payment recorded against an invoice. */
  listByInvoice: async (invoiceId: string) => {
    return api.get<Payment[]>(`${PAYMENT_BASE}/${invoiceId}/payments`);
  },

  /** Void a previously recorded payment (requires reason). */
  void: async (
    invoiceId: string,
    paymentId: string,
    data: VoidPaymentRequest
  ) => {
    return api.patch<Payment>(
      `${PAYMENT_BASE}/${invoiceId}/payments/${paymentId}/void`,
      data
    );
  },
};
