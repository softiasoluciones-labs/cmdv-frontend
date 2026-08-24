/**
 * Case-room (cargo de habitación) service
 *
 * Endpoints (all under /api/v1/medical):
 *   GET    /case-files/:caseFileId/rooms   → list applied rooms
 *   POST   /case-files/:caseFileId/rooms   → apply a room
 *   PATCH  /case-rooms/:id/void            → void an applied room
 */

import { api } from "../../client";
import {
  CaseRoom,
  ApplyCaseRoomRequest,
  VoidCaseRoomRequest,
} from "../../types/medical-types/case-room.types";

const CASE_FILE_BASE = "/medical/case-files";
const CASE_ROOM_BASE = "/medical/case-rooms";

export const caseRoomService = {
  listByCaseFile: async (caseFileId: string) => {
    return api.get<CaseRoom[]>(`${CASE_FILE_BASE}/${caseFileId}/rooms`);
  },

  apply: async (caseFileId: string, data: ApplyCaseRoomRequest) => {
    return api.post<CaseRoom>(`${CASE_FILE_BASE}/${caseFileId}/rooms`, data);
  },

  void: async (caseRoomId: string, data: VoidCaseRoomRequest) => {
    return api.patch<CaseRoom>(`${CASE_ROOM_BASE}/${caseRoomId}/void`, data);
  },
};
