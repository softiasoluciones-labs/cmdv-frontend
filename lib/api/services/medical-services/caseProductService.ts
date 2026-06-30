/**
 * Case-product (cargo / charge) service
 *
 * Endpoints (all under /api/v1/medical):
 *   GET    /case-files/:caseFileId/products            → list applied products
 *   POST   /case-files/:caseFileId/products            → apply a product
 *   PATCH  /case-products/:id/void                     → void an applied product
 *   GET    /case-files/:caseFileId/billing-summary     → billing summary
 */

import { api } from "../../client";
import {
  CaseProduct,
  ApplyCaseProductRequest,
  VoidCaseProductRequest,
  BillingSummary,
} from "../../types/medical-types/case-product.types";

const CASE_FILE_BASE = "/medical/case-files";
const CASE_PRODUCT_BASE = "/medical/case-products";

export const caseProductService = {
  /**
   * List every product applied to a given case file.
   * Includes voided rows for traceability.
   */
  listByCaseFile: async (caseFileId: string) => {
    return api.get<CaseProduct[]>(
      `${CASE_FILE_BASE}/${caseFileId}/products`
    );
  },

  /**
   * Apply a new charge to a case file. The backend resolves `unit_price`
   * server-side and returns the resulting row.
   */
  apply: async (caseFileId: string, data: ApplyCaseProductRequest) => {
    return api.post<CaseProduct>(
      `${CASE_FILE_BASE}/${caseFileId}/products`,
      data
    );
  },

  /**
   * Void an existing charge. Body must include a non-empty `void_reason`.
   */
  void: async (caseProductId: string, data: VoidCaseProductRequest) => {
    return api.patch<CaseProduct>(
      `${CASE_PRODUCT_BASE}/${caseProductId}/void`,
      data
    );
  },

  /**
   * Get the billing breakdown (packages, rooms, services, products).
   * Only active (non-voided) product charges are counted in the total.
   */
  getBillingSummary: async (caseFileId: string) => {
    return api.get<BillingSummary>(
      `${CASE_FILE_BASE}/${caseFileId}/billing-summary`
    );
  },
};
