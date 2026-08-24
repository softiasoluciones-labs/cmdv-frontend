"use client";

/**
 * useCaseRooms — same shape as useCaseProducts / useCaseServices.
 */

import { useState, useCallback, useEffect } from "react";
import { caseRoomService } from "@/lib/api/services/medical-services/caseRoomService";
import {
  CaseRoom,
  ApplyCaseRoomRequest,
  VoidCaseRoomRequest,
} from "@/lib/api/types/medical-types/case-room.types";
import { ApiError, ApiResponse } from "@/lib/api/config";

const EMPTY_LIST_RESPONSE = {
  success: true,
  code: 200,
  message: "",
  data: [] as CaseRoom[],
} as unknown as ApiResponse<CaseRoom[]>;

interface UseCaseRoomsState {
  caseRooms: CaseRoom[];
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
}

interface UseCaseRoomsReturn extends UseCaseRoomsState {
  refresh: () => Promise<void>;
  applyRoom: (data: ApplyCaseRoomRequest) => Promise<CaseRoom>;
  voidRoom: (caseRoomId: string, data: VoidCaseRoomRequest) => Promise<CaseRoom>;
  clearError: () => void;
}

export function useCaseRooms(caseFileId: string | null): UseCaseRoomsReturn {
  const [state, setState] = useState<UseCaseRoomsState>({
    caseRooms: [],
    isLoading: true,
    isMutating: false,
    error: null,
  });

  const refresh = useCallback(async () => {
    if (!caseFileId) return;
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const resp = await caseRoomService.listByCaseFile(caseFileId).catch(err => {
        if (err instanceof ApiError && err.statusCode === 422) return EMPTY_LIST_RESPONSE;
        throw err;
      });
      setState(prev => ({ ...prev, caseRooms: resp.data ?? [], isLoading: false, error: null }));
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Error al cargar las habitaciones del expediente";
      setState(prev => ({ ...prev, isLoading: false, error: message }));
    }
  }, [caseFileId]);

  const applyRoom = useCallback(
    async (data: ApplyCaseRoomRequest): Promise<CaseRoom> => {
      if (!caseFileId) throw new Error("caseFileId is required");
      setState(prev => ({ ...prev, isMutating: true, error: null }));
      try {
        const resp = await caseRoomService.apply(caseFileId, data);
        try {
          await refresh();
        } catch {
          /* refresh already populated state.error if relevant */
        }
        setState(prev => ({ ...prev, isMutating: false }));
        return resp.data;
      } catch (error) {
        setState(prev => ({
          ...prev,
          isMutating: false,
          error: error instanceof ApiError ? error.message : "Error al registrar el cargo",
        }));
        throw error;
      }
    },
    [caseFileId, refresh]
  );

  const voidRoom = useCallback(
    async (caseRoomId: string, data: VoidCaseRoomRequest): Promise<CaseRoom> => {
      setState(prev => ({ ...prev, isMutating: true, error: null }));
      try {
        const resp = await caseRoomService.void(caseRoomId, data);
        try {
          await refresh();
        } catch {
          /* same as applyRoom */
        }
        setState(prev => ({ ...prev, isMutating: false }));
        return resp.data;
      } catch (error) {
        setState(prev => ({
          ...prev,
          isMutating: false,
          error: error instanceof ApiError ? error.message : "Error al anular el cargo",
        }));
        throw error;
      }
    },
    [refresh]
  );

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...state, refresh, applyRoom, voidRoom, clearError };
}
