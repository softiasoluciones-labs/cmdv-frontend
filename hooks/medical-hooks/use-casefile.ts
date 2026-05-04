"use client";

import { useState, useEffect, useCallback } from "react";
import { caseFileService } from "@/lib/api/services/medical-services/caseFileService";
import {
  CaseFileResponse,
  CaseFileListResponse,
  CaseFileQueryParams,
  CreateCaseFileRequest,
  UpdateCaseFileRequest,
  UpdateCaseStatusRequest,
  CaseValidationResponse,
  TransferabilityResponse,
  ClosabilityResponse,
} from "@/lib/api/types/medical-types/caseFile.type";
import { ApiError } from "@/lib/api";

interface useCaseFileState {
  caseFiles: CaseFileListResponse[];
  selectedCaseFile: CaseFileResponse | null;
  pagination: {
    page: number;
    total: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: string | null;
}

interface useCaseFileReturn extends useCaseFileState {
  fetchCaseFiles: (params?: CaseFileQueryParams) => Promise<void>;
  fetchCaseFileById: (id: string) => Promise<CaseFileResponse | void>;
  fetchCaseFileByCaseNumber: (caseNumber: string) => Promise<CaseFileResponse | void>;
  createCaseFile: (data: CreateCaseFileRequest) => Promise<void>;
  updateCaseFile: (id: string, data: UpdateCaseFileRequest) => Promise<void>;
  updateCaseStatus: (id: string, data: UpdateCaseStatusRequest) => Promise<void>;
  deleteCaseFile: (id: string) => Promise<void>;
  validateCaseFile: (id: string) => Promise<CaseValidationResponse | null>;
  canTransferCase: (id: string) => Promise<TransferabilityResponse | null>;
  canCloseCase: (id: string) => Promise<ClosabilityResponse | null>;
  clearSelectedCaseFile: () => void;
  clearError: () => void;
}

export function useCaseFile(
  initialParams: CaseFileQueryParams = {}
): useCaseFileReturn {
  const [state, setState] = useState<useCaseFileState>({
    caseFiles: [],
    selectedCaseFile: null,
    pagination: { page: 1, total: 0, totalPages: 0 },
    isLoading: true,
    error: null,
  });

  const [currentParams, setCurrentParams] =
    useState<CaseFileQueryParams>(initialParams);

  const fetchCaseFiles = useCallback(
    async (params: CaseFileQueryParams = {}) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const response = await caseFileService.getAllCaseFiles(params);
        const data = response.data;
        const list = Array.isArray(data) ? data : (data.cases || data.data || []);
        const page = Array.isArray(data) ? 1 : (data.page || 1);
        const total = Array.isArray(data) ? data.length : (data.total || 0);
        const totalPages = Array.isArray(data) ? 1 : (data.totalPages || 0);
        setState({
          caseFiles: list,
          pagination: { page, total, totalPages },
          selectedCaseFile: null,
          isLoading: false,
          error: null,
        });
        setCurrentParams(params);
      } catch (error) {
        const errorMessage =
          error instanceof ApiError
            ? error.message
            : "Error al cargar los expedientes";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
      }
    },
    []
  );

  const fetchCaseFileById = useCallback(async (id: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await caseFileService.getCaseFileById(id);
      setState((prev) => ({
        ...prev,
        selectedCaseFile: response.data as unknown as CaseFileResponse,
        isLoading: false,
        error: null,
      }));
      return response.data as unknown as CaseFileResponse;
    } catch (error) {
      const errorMessage =
        error instanceof ApiError
          ? error.message
          : "Error al cargar el expediente";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  const fetchCaseFileByCaseNumber = useCallback(async (caseNumber: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response =
        await caseFileService.getCaseFileByCaseNumber(caseNumber);
      setState((prev) => ({
        ...prev,
        selectedCaseFile: response.data as unknown as CaseFileResponse,
        isLoading: false,
        error: null,
      }));
      return response.data as unknown as CaseFileResponse;
    } catch (error) {
      const errorMessage =
        error instanceof ApiError
          ? error.message
          : "Error al cargar el expediente";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  const createCaseFile = useCallback(
    async (data: CreateCaseFileRequest) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        await caseFileService.createCaseFile(data);
        await fetchCaseFiles(currentParams);
      } catch (error) {
        const errorMessage =
          error instanceof ApiError
            ? error.message
            : "Error al crear el expediente";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    [fetchCaseFiles, currentParams]
  );

  const updateCaseFile = useCallback(
    async (id: string, data: UpdateCaseFileRequest) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        await caseFileService.updateCaseFile(id, data);
        await fetchCaseFiles(currentParams);
        if (id === state.selectedCaseFile?.id) {
          await fetchCaseFileById(id);
        }
      } catch (error) {
        const errorMessage =
          error instanceof ApiError
            ? error.message
            : "Error al actualizar el expediente";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    [fetchCaseFiles, currentParams, state.selectedCaseFile?.id]
  );

  const updateCaseStatus = useCallback(
    async (id: string, data: UpdateCaseStatusRequest) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        await caseFileService.updateCaseStatus(id, data);
        await fetchCaseFiles(currentParams);
        if (id === state.selectedCaseFile?.id) {
          await fetchCaseFileById(id);
        }
      } catch (error) {
        const errorMessage =
          error instanceof ApiError
            ? error.message
            : "Error al actualizar el estado";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    [fetchCaseFiles, currentParams, state.selectedCaseFile?.id]
  );

  const deleteCaseFile = useCallback(
    async (id: string) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        await caseFileService.deleteCaseFile(id);
        await fetchCaseFiles(currentParams);
      } catch (error) {
        const errorMessage =
          error instanceof ApiError
            ? error.message
            : "Error al eliminar el expediente";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    [fetchCaseFiles, currentParams]
  );

  const validateCaseFile = useCallback(async (id: string) => {
    try {
      const response = await caseFileService.validateCaseFile(id);
      return response.data as unknown as CaseValidationResponse;
    } catch (error) {
      const errorMessage =
        error instanceof ApiError ? error.message : "Error al validar el expediente";
      setState((prev) => ({
        ...prev,
        error: errorMessage,
      }));
      return null;
    }
  }, []);

  const canTransferCase = useCallback(async (id: string) => {
    try {
      const response = await caseFileService.canTransferCase(id);
      return response.data as unknown as TransferabilityResponse;
    } catch (error) {
      const errorMessage =
        error instanceof ApiError ? error.message : "Error al verificar transferencia";
      setState((prev) => ({
        ...prev,
        error: errorMessage,
      }));
      return null;
    }
  }, []);

  const canCloseCase = useCallback(async (id: string) => {
    try {
      const response = await caseFileService.canCloseCase(id);
      return response.data as unknown as ClosabilityResponse;
    } catch (error) {
      const errorMessage =
        error instanceof ApiError ? error.message : "Error al verificar cierre";
      setState((prev) => ({
        ...prev,
        error: errorMessage,
      }));
      return null;
    }
  }, []);

  const clearSelectedCaseFile = useCallback(() => {
    setState((prev) => ({ ...prev, selectedCaseFile: null }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  useEffect(() => {
    fetchCaseFiles(initialParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchCaseFiles]);

  return {
    ...state,
    fetchCaseFiles,
    fetchCaseFileById,
    fetchCaseFileByCaseNumber,
    createCaseFile,
    updateCaseFile,
    updateCaseStatus,
    deleteCaseFile,
    validateCaseFile,
    canTransferCase,
    canCloseCase,
    clearSelectedCaseFile,
    clearError,
  };
}
