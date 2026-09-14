export interface ApplyCasePackageAssignmentRequest {
  package_id: string;
  doctor_id: string;
  doctor_type_used: "internal" | "external";
  notes?: string;
}

export interface VoidCasePackageAssignmentRequest {
  void_reason: string;
}

export interface PackageDetailItem {
  id: string;
  product_id: string;
  product_name: string;
  unit_of_measure: string;
  quantity: number;
  notes?: string;
}

export interface CasePackageAssignment {
  id: string;
  case_file_id: string;
  package_id: string;
  package_name: string;
  internal_doctor_price: number;
  external_doctor_price: number;
  package_details: PackageDetailItem[];
  doctor_id: string;
  doctor_name?: string;
  doctor_type_used: "internal" | "external";
  price_applied: number;
  assigned_date: string;
  assigned_by?: string;
  notes?: string;
  is_voided: boolean;
  voided_by?: string;
  voided_at?: string;
  void_reason?: string;
}
