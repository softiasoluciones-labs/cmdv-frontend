export interface ApplyCaseServiceRequest {
  service_id: string;
  quantity?: number;
  doctor_id?: string;
  unit_price?: number;
  notes?: string;
}

export interface VoidCaseServiceRequest {
  void_reason: string;
}

export type ServicePricingMode = "catalog" | "doctor_fee" | "manual";

export interface CaseService {
  id: string;
  case_file_id: string;
  service_id: string;
  service_name: string;
  service_code: string;
  pricing_mode: ServicePricingMode;
  doctor_id?: string;
  doctor_name?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  applied_by?: string;
  applied_at: string;
  notes?: string;
  is_voided: boolean;
  voided_by?: string;
  voided_at?: string;
  void_reason?: string;
}
