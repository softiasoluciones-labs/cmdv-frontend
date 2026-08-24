/**
 * Billing types
 *
 * All DTOs for the billing module. Mirrors the backend at
 * `cmdv-backend/src/api/v1/dtos/billing-dtos/billing.dto.ts`
 * and the underlying database enums under
 * `cmdv-backend/src/database/billing/`.
 */

// ─── Enums ─────────────────────────────────────────────────────────────────

export enum InvoiceStatus {
  DRAFT = "draft",
  CONFIRMED = "confirmed",
  PARTIALLY_PAID = "partially_paid",
  PAID = "paid",
  VOIDED = "voided",
}

export enum PaymentMethod {
  CASH = "cash",
  CARD_CREDIT = "card_credit",
  CARD_DEBIT = "card_debit",
  BANK_TRANSFER = "bank_transfer",
  CHECK = "check",
  INSURANCE = "insurance",
}

export enum PaymentStatus {
  CONFIRMED = "confirmed",
  VOIDED = "voided",
}

export enum InvoiceItemType {
  PACKAGE = "package",
  ROOM = "room",
  SERVICE = "service",
  PRODUCT = "product",
}

export enum DiscountType {
  PERCENTAGE = "percentage",
  FIXED_AMOUNT = "fixed_amount",
}

export enum DiscountCategory {
  MANUAL = "manual",
  EMPLOYEE = "employee",
  INSURANCE = "insurance",
  PROMOTIONAL = "promotional",
  COURTESY = "courtesy",
}

export enum FelStatus {
  PENDING = "pending",
  ISSUED = "issued",
  CANCELLED = "cancelled",
}

export enum CashSessionStatus {
  OPEN = "open",
  CLOSED = "closed",
}

// ─── Display labels (Spanish) ───────────────────────────────────────────────

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: "Efectivo",
  [PaymentMethod.CARD_CREDIT]: "Tarjeta de crédito",
  [PaymentMethod.CARD_DEBIT]: "Tarjeta de débito",
  [PaymentMethod.BANK_TRANSFER]: "Transferencia",
  [PaymentMethod.CHECK]: "Cheque",
  [PaymentMethod.INSURANCE]: "Seguro",
};

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  [InvoiceStatus.DRAFT]: "Borrador",
  [InvoiceStatus.CONFIRMED]: "Confirmada",
  [InvoiceStatus.PARTIALLY_PAID]: "Pago parcial",
  [InvoiceStatus.PAID]: "Pagada",
  [InvoiceStatus.VOIDED]: "Anulada",
};

export const INVOICE_ITEM_TYPE_LABELS: Record<InvoiceItemType, string> = {
  [InvoiceItemType.PACKAGE]: "Paquete",
  [InvoiceItemType.ROOM]: "Habitación",
  [InvoiceItemType.SERVICE]: "Servicio",
  [InvoiceItemType.PRODUCT]: "Producto",
};

export const DISCOUNT_TYPE_LABELS: Record<DiscountType, string> = {
  [DiscountType.PERCENTAGE]: "Porcentaje",
  [DiscountType.FIXED_AMOUNT]: "Monto fijo",
};

export const DISCOUNT_CATEGORY_LABELS: Record<DiscountCategory, string> = {
  [DiscountCategory.MANUAL]: "Manual",
  [DiscountCategory.EMPLOYEE]: "Empleado",
  [DiscountCategory.INSURANCE]: "Seguro",
  [DiscountCategory.PROMOTIONAL]: "Promocional",
  [DiscountCategory.COURTESY]: "Cortesía",
};

// ─── Invoice item ──────────────────────────────────────────────────────────

export interface InvoiceItem {
  id: string;
  item_type: InvoiceItemType;
  reference_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  discount_amount: number;
  total: number;
  is_iva_exempt: boolean;
}

// ─── Invoice discount ──────────────────────────────────────────────────────

export interface InvoiceDiscount {
  id: string;
  discount_id?: string;
  description: string;
  discount_type: DiscountType;
  value: number;
  calculated_amount: number;
  applied_by: string;
  approved_by?: string;
  approved_at?: string;
  requires_approval: boolean;
  reason?: string;
  created_at: string;
}

// ─── Payment ───────────────────────────────────────────────────────────────

export interface Payment {
  id: string;
  payment_number: string;
  payment_method: PaymentMethod;
  amount: number;
  reference_number?: string;
  card_brand?: string;
  card_last_four?: string;
  bank_name?: string;
  payment_date: string;
  status: PaymentStatus;
  received_by?: string;
  notes?: string;
}

// ─── Tax invoice (FEL) ─────────────────────────────────────────────────────

export interface TaxInvoice {
  id: string;
  nit: string;
  tax_name: string;
  document_type: string;
  fel_status: FelStatus;
  fel_uuid?: string;
  fel_series?: string;
  fel_number?: string;
  fel_issued_at?: string;
}

// ─── Invoice ───────────────────────────────────────────────────────────────

export interface Invoice {
  id: string;
  invoice_number: string;
  case_file_id: string;
  case_number?: string;
  patient_id: string;
  patient_name?: string;
  status: InvoiceStatus;
  subtotal: number;
  discount_total: number;
  taxable_amount: number;
  iva_amount: number;
  total_amount: number;
  amount_paid: number;
  amount_pending: number;
  requires_tax_invoice: boolean;
  confirmed_at?: string;
  paid_at?: string;
  due_date?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  items?: InvoiceItem[];
  discounts?: InvoiceDiscount[];
  payments?: Payment[];
  tax_invoice?: TaxInvoice;
}

// ─── Request DTOs ──────────────────────────────────────────────────────────

export interface GenerateInvoiceRequest {
  case_file_id: string;
  requires_tax_invoice?: boolean;
  due_date?: string;
  notes?: string;
}

export interface ConfirmInvoiceRequest {
  notes?: string;
}

export interface VoidInvoiceRequest {
  reason: string;
}

export interface ApplyDiscountRequest {
  discount_id?: string;
  description: string;
  discount_type: DiscountType;
  value: number;
  reason?: string;
}

export interface RecordPaymentRequest {
  payment_method: PaymentMethod;
  amount: number;
  cash_session_id?: string;
  reference_number?: string;
  card_brand?: string;
  card_last_four?: string;
  bank_name?: string;
  notes?: string;
}

export interface VoidPaymentRequest {
  void_reason: string;
}

export interface CreateTaxInvoiceRequest {
  nit: string;
  tax_name: string;
  tax_address?: string;
  document_type?: string;
}

// ─── Cash session ──────────────────────────────────────────────────────────

export interface CashSession {
  id: string;
  session_number: string;
  cashier_id: string;
  cashier_name?: string;
  status: CashSessionStatus;
  opened_at: string;
  closed_at?: string;
  initial_cash: number;
  expected_cash?: number;
  actual_cash?: number;
  cash_difference?: number;
  total_collected: number;
  notes?: string;
}

export interface OpenCashSessionRequest {
  initial_cash: number;
  notes?: string;
}

export interface CloseCashSessionRequest {
  actual_cash: number;
  notes?: string;
}

// ─── Discount catalog ──────────────────────────────────────────────────────

export interface DiscountCatalogItem {
  id: string;
  code: string;
  name: string;
  category: DiscountCategory;
  discount_type: DiscountType;
  value: number;
  max_amount?: number;
  requires_approval: boolean;
  valid_from?: string;
  valid_until?: string;
  is_active: boolean;
  created_at?: string;
}

export interface CreateDiscountCatalogRequest {
  code: string;
  name: string;
  category: DiscountCategory;
  discount_type: DiscountType;
  value: number;
  max_amount?: number;
  requires_approval?: boolean;
  valid_from?: string;
  valid_until?: string;
}

// ─── Wrapper responses (apply discount returns invoice + approval flag) ────

export interface ApplyDiscountResponse {
  invoice: Invoice | null;
  requires_approval: boolean;
  message: string;
}

export interface RecordPaymentResponse {
  payment: Payment;
  invoice: Invoice | null;
}
