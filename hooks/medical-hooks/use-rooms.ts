"use client";

import { useState, useEffect, useCallback } from "react";
import { roomService } from "@/lib/api/services/medical-services/roomService";
import {
  RoomListResponse,
  RoomResponse,
  RoomQueryParams,
  RoomStatus,
} from "@/lib/api/types/medical-types/room.types";
import { ApiError } from "@/lib/api";

interface useRoomsState {
  rooms: RoomListResponse[];
  selectedRoom: RoomResponse | null;
  isLoading: boolean;
  error: string | null;
}

interface useRoomsReturn extends useRoomsState {
  fetchRooms: (params?: RoomQueryParams) => Promise<void>;
  fetchRoomById: (id: string) => Promise<RoomResponse | null>;
  clearSelectedRoom: () => void;
  clearError: () => void;
}

export function useRooms(initialParams: RoomQueryParams = {}): useRoomsReturn {
  const [state, setState] = useState<useRoomsState>({
    rooms: [],
    selectedRoom: null,
    isLoading: true,
    error: null,
  });

  const fetchRooms = useCallback(async (params: RoomQueryParams = {}) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await roomService.getAllRooms(params);
      const data = response.data as any;
      const roomsArray = data.rooms || data.data || data || [];
      setState({
        rooms: Array.isArray(roomsArray) ? roomsArray : [],
        selectedRoom: null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage =
        error instanceof ApiError
          ? error.message
          : "Error al cargar las habitaciones";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, []);

  const fetchRoomById = useCallback(async (id: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await roomService.getRoomById(id);
      const data = response.data as unknown as RoomResponse;
      setState((prev) => ({
        ...prev,
        selectedRoom: data,
        isLoading: false,
        error: null,
      }));
      return data;
    } catch (error) {
      const errorMessage =
        error instanceof ApiError
          ? error.message
          : "Error al cargar la habitación";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return null;
    }
  }, []);

  const clearSelectedRoom = useCallback(() => {
    setState((prev) => ({ ...prev, selectedRoom: null }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  useEffect(() => {
    fetchRooms({ ...initialParams, is_active: true, status: RoomStatus.AVAILABLE });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchRooms]);

  return {
    ...state,
    fetchRooms,
    fetchRoomById,
    clearSelectedRoom,
    clearError,
  };
}
