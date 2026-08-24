/**
 * Tax invoice (FEL) service
 *
 * The backend records the FEL request with `fel_status = 'pending'` until a
 * certified SAT issuer is integrated. Once integrated, the service should
 * update fel_uuid/fel_series/fel_number and flip status to 'issued'.
 *
 * Endpoints (under /api/v1/billing):
 *   POST /invoices/:id/tax-invoice → create tax invoice record
 */

import { api } from "../../client";
import {
  TaxInvoice,
  CreateTaxInvoiceRequest,
} from "../../types/billing-types/billing.types";

const INVOICE_BASE = "/billing/invoices";

export const taxInvoiceService = {
  /** Create a tax invoice (FEL) record for a confirmed invoice. */
  create: async (invoiceId: string, data: CreateTaxInvoiceRequest) => {
    return api.post<TaxInvoice>(
      `${INVOICE_BASE}/${invoiceId}/tax-invoice`,
      data
    );
  },
};
