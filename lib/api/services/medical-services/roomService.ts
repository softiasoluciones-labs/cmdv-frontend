/**
 * Room service
 * API service for room operations
 */

import { api } from "../../client";
import {
  RoomResponse,
  RoomListResponse,
  RoomQueryParams,
} from "../../types/medical-types/room.types";

const ROOM_ENDPOINT = "/medical/rooms";

function transformQueryParams(
  params: RoomQueryParams
): Record<string, string | number | boolean | undefined> {
  const result: Record<string, any> = {};
  if (params.search !== undefined) result.search = params.search;
  if (params.status !== undefined) result.status = params.status;
  if (params.is_active !== undefined) result.is_active = params.is_active;
  return result;
}

export const roomService = {
  /**
   * Get all rooms with filters
   */
  getAllRooms: async (params?: RoomQueryParams) => {
    const queryParams = params ? transformQueryParams(params) : undefined;
    return api.get<RoomListResponse[]>(ROOM_ENDPOINT, queryParams);
  },

  /**
   * Get room by ID
   */
  getRoomById: async (id: string) => {
    return api.get<RoomResponse>(`${ROOM_ENDPOINT}/${id}`);
  },
};
