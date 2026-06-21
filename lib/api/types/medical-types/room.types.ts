/**
 * Room status enum
 */
export enum RoomStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  MAINTENANCE = 'maintenance',
  CLEANING = 'cleaning',
  RESERVED = 'reserved',
}

/**
 * Response DTO for room
 */
export interface RoomResponse {
  id: string;
  room_number: string;
  room_type: string;
  floor?: number;
  capacity: number;
  daily_rate: number;
  has_bathroom?: boolean;
  has_oxygen?: boolean;
  has_monitor?: boolean;
  equipment?: Record<string, unknown>;
  status?: RoomStatus;
  is_active?: boolean;
  created_at?: string;
}

/**
 * Simplified response for listing rooms
 */
export interface RoomListResponse {
  id: string;
  room_number: string;
  room_type: string;
  floor?: number;
  status?: RoomStatus;
  is_active?: boolean;
}

/**
 * Query params for room list
 */
export interface RoomQueryParams {
  search?: string;
  status?: RoomStatus;
  is_active?: boolean;
}
