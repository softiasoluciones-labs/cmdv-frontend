"use client";

/**
 * useCashSession
 *
 * Wraps `cashSessionService` for the cashier (caja) screens.
 * Surfaces three things via dedicated methods:
 *   - mySession()      → the cashier's currently active session (or null)
 *   - listOpen()       → every open session across all cashiers
 *   - open() / close() → mutations
 *
 * `mySession` auto-refreshes on mount so the sidebar/menu can show whether
 * a session is active.
 */

import { useState, useEffect, useCallback } from "react";
import { ApiError } from "@/lib/api";
import { cashSessionService } from "@/lib/api/services/billing-services/cashSessionService";
import {
  CashSession,
  OpenCashSessionRequest,
  CloseCashSessionRequest,
} from "@/lib/api/types/billing-types/billing.types";

interface UseCashSessionState {
  mySession: CashSession | null;
  openSessions: CashSession[];
  isLoadingMine: boolean;
  isLoadingOpen: boolean;
  isMutating: boolean;
  error: string | null;
}

interface UseCashSessionReturn extends UseCashSessionState {
  fetchMySession: () => Promise<CashSession | null>;
  fetchOpenSessions: () => Promise<void>;
  openSession: (data: OpenCashSessionRequest) => Promise<CashSession>;
  closeSession: (id: string, data: CloseCashSessionRequest) => Promise<CashSession>;
  clearError: () => void;
}

export function useCashSession(): UseCashSessionReturn {
  const [state, setState] = useState<UseCashSessionState>({
    mySession: null,
    openSessions: [],
    isLoadingMine: true,
    isLoadingOpen: false,
    isMutating: false,
    error: null,
  });

  const fetchMySession = useCallback(async (): Promise<CashSession | null> => {
    setState((prev) => ({ ...prev, isLoadingMine: true, error: null }));
    try {
      const resp = await cashSessionService.getMine();
      const session = (resp.data as unknown as CashSession | null) ?? null;
      setState((prev) => ({
        ...prev,
        mySession: session,
        isLoadingMine: false,
      }));
      return session;
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Error al cargar tu sesión de caja";
      setState((prev) => ({
        ...prev,
        isLoadingMine: false,
        error: message,
      }));
      return null;
    }
  }, []);

  const fetchOpenSessions = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoadingOpen: true, error: null }));
    try {
      const resp = await cashSessionService.listOpen();
      const list = (resp.data as unknown as CashSession[]) ?? [];
      setState((prev) => ({
        ...prev,
        openSessions: list,
        isLoadingOpen: false,
      }));
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Error al cargar las sesiones abiertas";
      setState((prev) => ({
        ...prev,
        isLoadingOpen: false,
        error: message,
      }));
    }
  }, []);

  const openSession = useCallback(
    async (data: OpenCashSessionRequest): Promise<CashSession> => {
      setState((prev) => ({ ...prev, isMutating: true, error: null }));
      try {
        const resp = await cashSessionService.open(data);
        const created = resp.data as unknown as CashSession;
        setState((prev) => ({
          ...prev,
          mySession: created,
          isMutating: false,
        }));
        return created;
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message
            : "Error al abrir la sesión de caja";
        setState((prev) => ({ ...prev, isMutating: false, error: message }));
        throw error;
      }
    },
    []
  );

  const closeSession = useCallback(
    async (
      id: string,
      data: CloseCashSessionRequest
    ): Promise<CashSession> => {
      setState((prev) => ({ ...prev, isMutating: true, error: null }));
      try {
        const resp = await cashSessionService.close(id, data);
        const closed = resp.data as unknown as CashSession;
        setState((prev) => ({
          ...prev,
          mySession: null,
          openSessions: prev.openSessions.filter((s) => s.id !== id),
          isMutating: false,
        }));
        return closed;
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message
            : "Error al cerrar la sesión de caja";
        setState((prev) => ({ ...prev, isMutating: false, error: message }));
        throw error;
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  useEffect(() => {
    fetchMySession();
  }, [fetchMySession]);

  return {
    ...state,
    fetchMySession,
    fetchOpenSessions,
    openSession,
    closeSession,
    clearError,
  };
}
