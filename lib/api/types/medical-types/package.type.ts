/**
 * Medical packages entities 
 */

export interface Packages { 
    id: string; 
    code: string; 
    name: string; 
    description: string; 
    doctor_type: string; 
    internal_doctor_price: number; 
    external_doctor_price: number; 
    validity_days: number; 
    is_active: boolean;
}

export interface PaginationPackagesResponse { 
    packages?: Packages[]; 
    data?: Packages[];
    total?: number; 
    page?: number;
    totalPages?: number;
}

export interface PackagesQueryParams { 
    page?: number;
    limit?: number;
    search?: string;
    is_active?: boolean; 
    doctor_type?: string; 
    code?: string; 
    service_id?: string; 
    year?: number; 
}