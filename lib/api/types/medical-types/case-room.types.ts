export interface ApplyCaseRoomRequest {
  room_id: string;
  notes?: string;
}

export interface VoidCaseRoomRequest {
  void_reason: string;
}

export interface CaseRoom {
  id: string;
  case_file_id: string;
  room_id: string;
  room_number: string;
  room_type: string;
  daily_rate: number;
  check_in: string;
  check_out?: string;
  nights: number;
  total_price: number;
  notes?: string;
  is_voided: boolean;
  voided_by?: string;
  voided_at?: string;
  void_reason?: string;
}
