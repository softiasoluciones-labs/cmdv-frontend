/**
 * Cash session service
 *
 * Endpoints (all under /api/v1/billing):
 *   POST  /cash-sessions                  → open a session
 *   GET   /cash-sessions/open             → list open sessions
 *   GET   /cash-sessions/me               → my active session
 *   GET   /cash-sessions/:id              → get by id
 *   PATCH /cash-sessions/:id/close        → close (corte de caja)
 */

import { api } from "../../client";
import {
  CashSession,
  OpenCashSessionRequest,
  CloseCashSessionRequest,
} from "../../types/billing-types/billing.types";

const ENDPOINT = "/billing/cash-sessions";

export const cashSessionService = {
  /** Open a new cash session for the authenticated cashier. */
  open: async (data: OpenCashSessionRequest) => {
    return api.post<CashSession>(ENDPOINT, data);
  },

  /** Close a session with the physical cash count (corte de caja). */
  close: async (id: string, data: CloseCashSessionRequest) => {
    return api.patch<CashSession>(`${ENDPOINT}/${id}/close`, data);
  },

  /** List every currently open cash session. */
  listOpen: async () => {
    return api.get<CashSession[]>(`${ENDPOINT}/open`);
  },

  /** Fetch the authenticated user's currently active session (or null). */
  getMine: async () => {
    return api.get<CashSession | null>(`${ENDPOINT}/me`);
  },

  /** Fetch a session by id. */
  getById: async (id: string) => {
    return api.get<CashSession>(`${ENDPOINT}/${id}`);
  },
};
