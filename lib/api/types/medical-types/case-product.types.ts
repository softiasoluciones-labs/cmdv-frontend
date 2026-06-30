/**
 * Case-product (cargo / charge) types
 *
 * A "cargo" is a product (insumo o medicamento) applied to a case file.
 * All three endpoints (GET list, POST apply, PATCH void) return the same
 * shape — the canonical `CaseProduct` row. Void metadata is only present
 * when `is_voided` is true.
 */

export interface CaseProduct {
  id: string;
  case_file_id: string;
  product_id: string;
  product_name: string;
  product_code: string;
  unit_of_measure: string;
  warehouse_id: string;
  warehouse_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  applied_by: string;
  applied_at: string; // ISO timestamp
  notes?: string | null;
  is_voided: boolean;
  // Only present when is_voided === true
  voided_by?: string;
  voided_at?: string;
  void_reason?: string;
}

export interface ApplyCaseProductRequest {
  product_id: string;
  warehouse_id: string;
  quantity: number;
  notes?: string;
}

export interface VoidCaseProductRequest {
  void_reason: string;
}

/* ──────────────────────────────────────────────────────────────────────────
 * Billing summary
 * ───────────────────────────────────────────────────────────────────────── */

export interface BillingSummaryItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface BillingSummarySection {
  items: BillingSummaryItem[];
  subtotal: number;
}

export interface BillingSummary {
  case_id: string;
  case_number: string;
  patient_name: string;
  breakdown: {
    packages: BillingSummarySection;
    rooms: BillingSummarySection;
    services: BillingSummarySection;
    products: BillingSummarySection;
  };
  total: number;
}
