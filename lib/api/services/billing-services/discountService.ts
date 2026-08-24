/**
 * Discount service
 *
 * Two concerns:
 *   1) Per-invoice discounts (`/billing/invoices/:id/discounts/...`)
 *   2) Discount catalog management (`/billing/discount-catalog`)
 *
 * Per-invoice discounts may require admin approval before they are reflected
 * in the invoice total. See `cmdv-backend/docs/billing-flow.md` §4 for the
 * approval flow.
 */

import { api } from "../../client";
import {
  ApplyDiscountRequest,
  ApplyDiscountResponse,
  DiscountCatalogItem,
  CreateDiscountCatalogRequest,
} from "../../types/billing-types/billing.types";

const INVOICE_BASE = "/billing/invoices";
const CATALOG_ENDPOINT = "/billing/discount-catalog";

export const discountService = {
  /** Apply a discount to an invoice. Returns whether approval is required. */
  apply: async (invoiceId: string, data: ApplyDiscountRequest) => {
    return api.post<ApplyDiscountResponse>(
      `${INVOICE_BASE}/${invoiceId}/discounts`,
      data
    );
  },

  /** Approve a pending discount (admin/superadmin only). */
  approve: async (invoiceId: string, discountId: string) => {
    return api.patch(
      `${INVOICE_BASE}/${invoiceId}/discounts/${discountId}/approve`
    );
  },

  /** Remove an unapproved discount from an invoice. */
  remove: async (invoiceId: string, discountId: string) => {
    return api.delete(
      `${INVOICE_BASE}/${invoiceId}/discounts/${discountId}`
    );
  },

  // ─── Catalog ────────────────────────────────────────────────────────────

  /** List active discount catalog items. */
  listCatalog: async () => {
    return api.get<DiscountCatalogItem[]>(CATALOG_ENDPOINT);
  },

  /** Create a new discount catalog item. */
  createCatalogItem: async (data: CreateDiscountCatalogRequest) => {
    return api.post<DiscountCatalogItem>(CATALOG_ENDPOINT, data);
  },
};
