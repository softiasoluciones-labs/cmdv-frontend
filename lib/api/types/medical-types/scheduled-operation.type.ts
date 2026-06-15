export enum ScheduledOperationStatus {
    SCHEDULED = 'scheduled',
    CONFIRMED = 'confirmed',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    POSTPONED = 'postponed'
}

export enum OperationTeamRole {
    SURGEON = 'surgeon',
    ANESTHESIOLOGIST = 'anesthesiologist',
    SCRUB_NURSE = 'scrub_nurse',
    CIRCULATING_NURSE = 'circulating_nurse',
    ASSISTANT = 'assistant'
}

export interface ScheduledOperation {
    id: string;
    case_file_id: string;
    case_file?: {
        id: string;
        case_number: string;
        patient?: {
            id: string;
            file_number: string;
            first_name: string;
            last_name: string;
        };
    };
    operation_type_id: string;
    operation_type?: {
        id: string;
        code: string;
        name: string;
        complexity: string;
    };
    primary_surgeon_id: string;
    primary_surgeon?: {
        id: string;
        first_name: string;
        last_name: string;
        specialty?: string;
    };
    anesthesiologist_id?: string;
    anesthesiologist?: {
        id: string;
        first_name: string;
        last_name: string;
    };
    scheduled_date: Date | string;
    estimated_duration_minutes: number;
    operating_room?: string;
    pre_operative_notes?: string;
    status: ScheduledOperationStatus;
    operation_teams?: Array<{
        id: string;
        doctor_id: string;
        doctor?: {
            first_name: string;
            last_name: string;
        };
        role: string;
    }>;
    created_at: Date | string;
    updated_at: Date | string;
}

export interface CreateScheduledOperationRequest {
    case_file_id: string;
    operation_type_id: string;
    primary_surgeon_id: string;
    anesthesiologist_id?: string;
    scheduled_date: Date | string;
    estimated_duration_minutes: number;
    operating_room?: string;
    pre_operative_notes?: string;
}

export interface UpdateScheduledOperationRequest {
    scheduled_date?: Date | string;
    estimated_duration_minutes?: number;
    operating_room?: string;
    pre_operative_notes?: string;
    status?: ScheduledOperationStatus;
}

export interface UpdateScheduledOperationStatusRequest {
    status: ScheduledOperationStatus;
    reason?: string;
}

export interface ScheduledOperationListParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: ScheduledOperationStatus | 'all';
    specialty?: string;
    surgeon_id?: string;
    date_from?: string;
    date_to?: string;
}

export interface PaginatedScheduledOperationsResponse {
    data: ScheduledOperation[];
    page: number;
    limit: number;
    total: number;
    total_pages: number;
}
