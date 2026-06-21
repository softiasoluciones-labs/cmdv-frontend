/**
 * Admission category enum
 */
export enum AdmissionCategory {
  E = 'E',
  P = 'P',
  NULL = 'NULL'
}

/**
 * Response DTO for admission type
 */
export interface AdmissionTypeResponse {
  id: string;
  code: string;
  name: string;
  requires_hospitalization: boolean;
  requires_package: boolean;
  allows_transfer: boolean;
  requires_immediate_payment: boolean;
  category?: AdmissionCategory;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Simplified response for listing admission types
 */
export interface AdmissionTypeListResponse {
  id: string;
  code: string;
  name: string;
  category?: AdmissionCategory;
  requires_hospitalization: boolean;
  requires_package: boolean;
  allows_transfer: boolean;
  is_active: boolean;
}

/**
 * Query params for admission type list
 */
export interface AdmissionTypeQueryParams {
  category?: AdmissionCategory;
  requires_hospitalization?: boolean;
  requires_package?: boolean;
  allows_transfer?: boolean;
  is_active?: boolean;
  search?: string;
}

/**
 * Admission type rules for UI
 */
export interface AdmissionTypeRules {
  id: string;
  code: string;
  name: string;
  requires_hospitalization: boolean;
  requires_package: boolean;
  allows_transfer: boolean;
  requires_immediate_payment: boolean;
  category?: AdmissionCategory;
}
