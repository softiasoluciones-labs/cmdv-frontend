/**
 * Medical entities interfaces 
 */
export interface Patients {
    id: string;
    fileNumber: string;
    firstName: string;
    lastName: string;
    fullName: string;
    identificationNumber: string;
    dateOfBirth: string;
    age: number;
    gender: string;
    bloodType: string;
    phone: string;
    mobile: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    emergencyContactRelationship: string;
    allergies: string | string[];
    chronicConditions: string | string[];
    currentMedications: string | string[];
    insuranceCompany: string;
    insurancePolicyNumber: string;
    isActive: boolean;
    notes: string;
}

export interface PaginationPatientsResponse {
    patients?: Patients[];
    data?: Patients[];
    total: number;
    page?: number;
    totalPages?: number;
}

export interface PatientsQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    gender?: string;
    isActive?: boolean;
    city?: string;
    state?: string;
} 