export interface ServiceType {
    id: string;
    name: string;
    code: string;
}

export interface MedicalService {
    id: string;
    code: string;
    name: string;
    service_type_id: string;
    description: string;
    base_price: string;
    estimated_duration_minutes: number;
    requires_preparation: boolean;
    preparation_instructions: string;
    is_active: boolean;
    use_doctor_consultation_fee?: boolean;
    service_type?: ServiceType;
}

export interface PaginationServicesResponse {
    services?: MedicalService[];
    data?: MedicalService[];
    total: number;
    page?: number;
    totalPages?: number;
}

export interface ServicesQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    serviceTypeId?: string;
}