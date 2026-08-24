/**
 * Doctor type enum
 */
export enum DoctorType {
  INTERNAL = 'internal',
  EXTERNAL = 'external',
}

/**
 * Response DTO for doctor
 */
export interface DoctorResponse {
  id: string;
  user_id?: string;
  full_name?: string;
  medical_license: string;
  specialty_id?: string;
  doctor_type: DoctorType;
  consultation_fee?: number;
  surgery_fee?: number;
  identification_number?: string;
  phone?: string;
  email?: string;
  address?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  specialty_name?: string;
}

/**
 * Simplified response for listing doctors
 */
export interface DoctorListResponse {
  id: string;
  full_name?: string;
  medical_license: string;
  doctor_type: DoctorType;
  consultation_fee?: number;
  is_active?: boolean;
  specialty_name?: string;
}

/**
 * Query params for doctor list
 */
export interface DoctorQueryParams {
  search?: string;
  doctor_type?: DoctorType;
  specialty_id?: string;
  isActive?: boolean;
}
