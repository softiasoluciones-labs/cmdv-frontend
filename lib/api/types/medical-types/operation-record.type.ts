export interface OperationRecord {
    id: string;
    scheduled_operation_id: string;
    scheduled_operation?: {
        id: string;
        case_file_id: string;
        operation_type_id: string;
        scheduled_date: Date | string;
    } | null;
    actual_start_time: Date | string;
    actual_end_time: Date | string;
    anesthesia_type?: string | null;
    procedure_performed: string;
    findings?: string | null;
    complications?: string | null;
    blood_loss_ml?: number | null;
    specimens_sent?: string[] | null;
    post_operative_orders?: string | null;
    created_at: Date | string;
    created_by?: string | null;
    created_by_user?: {
        id: string;
        first_name: string;
        last_name: string;
    } | null;
}

export interface CreateOperationRecordRequest {
    scheduled_operation_id: string;
    actual_start_time: Date | string;
    actual_end_time: Date | string;
    anesthesia_type?: string | null;
    procedure_performed: string;
    findings?: string | null;
    complications?: string | null;
    blood_loss_ml?: number | null;
    specimens_sent?: string[] | null;
    post_operative_orders?: string | null;
}

export interface UpdateOperationRecordRequest {
    actual_start_time?: Date | string | null;
    actual_end_time?: Date | string | null;
    anesthesia_type?: string | null;
    procedure_performed?: string | null;
    findings?: string | null;
    complications?: string | null;
    blood_loss_ml?: number | null;
    specimens_sent?: string[] | null;
    post_operative_orders?: string | null;
}

export interface OperationRecordListParams {
    page?: number;
    limit?: number;
    scheduled_operation_id?: string;
}

export interface PaginatedOperationRecordsResponse {
    data: OperationRecord[];
    page: number;
    limit: number;
    total: number;
}
