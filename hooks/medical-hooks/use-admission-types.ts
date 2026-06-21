"use client";

import { useState, useEffect, useCallback } from "react";
import { admissionTypeService } from "@/lib/api/services/medical-services/admissionTypeService";
import {
  AdmissionTypeListResponse,
  AdmissionTypeResponse,
  AdmissionTypeRules,
  AdmissionTypeQueryParams,
} from "@/lib/api/types/medical-types/admission-type.types";
import { ApiError } from "@/lib/api";

interface useAdmissionTypesState {
  admissionTypes: AdmissionTypeListResponse[];
  selectedAdmissionType: AdmissionTypeResponse | null;
  isLoading: boolean;
  error: string | null;
}

interface useAdmissionTypesReturn extends useAdmissionTypesState {
  fetchAdmissionTypes: (params?: AdmissionTypeQueryParams) => Promise<void>;
  fetchAdmissionTypeById: (id: string) => Promise<AdmissionTypeResponse | null>;
  getAdmissionTypeRules: (id: string) => Promise<AdmissionTypeRules | null>;
  clearSelectedAdmissionType: () => void;
  clearError: () => void;
}

export function useAdmissionTypes(
  initialParams: AdmissionTypeQueryParams = {}
): useAdmissionTypesReturn {
  const [state, setState] = useState<useAdmissionTypesState>({
    admissionTypes: [],
    selectedAdmissionType: null,
    isLoading: true,
    error: null,
  });

  const fetchAdmissionTypes = useCallback(
    async (params: AdmissionTypeQueryParams = {}) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const response = await admissionTypeService.getAllAdmissionTypes(params);
        setState({
          admissionTypes: Array.isArray(response.data)
            ? response.data
            : [],
          selectedAdmissionType: null,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        const errorMessage =
          error instanceof ApiError
            ? error.message
            : "Error al cargar los tipos de admisión";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
      }
    },
    []
  );

  const fetchAdmissionTypeById = useCallback(async (id: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await admissionTypeService.getAdmissionTypeById(id);
      const data = response.data as unknown as AdmissionTypeResponse;
      setState((prev) => ({
        ...prev,
        selectedAdmissionType: data,
        isLoading: false,
        error: null,
      }));
      return data;
    } catch (error) {
      const errorMessage =
        error instanceof ApiError
          ? error.message
          : "Error al cargar el tipo de admisión";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return null;
    }
  }, []);

  const getAdmissionTypeRules = useCallback(async (id: string) => {
    try {
      const response = await admissionTypeService.getAdmissionTypeRules(id);
      return response.data as unknown as AdmissionTypeRules;
    } catch (error) {
      const errorMessage =
        error instanceof ApiError
          ? error.message
          : "Error al cargar las reglas del tipo de admisión";
      setState((prev) => ({
        ...prev,
        error: errorMessage,
      }));
      return null;
    }
  }, []);

  const clearSelectedAdmissionType = useCallback(() => {
    setState((prev) => ({ ...prev, selectedAdmissionType: null }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  useEffect(() => {
    fetchAdmissionTypes({ ...initialParams, is_active: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchAdmissionTypes]);

  return {
    ...state,
    fetchAdmissionTypes,
    fetchAdmissionTypeById,
    getAdmissionTypeRules,
    clearSelectedAdmissionType,
    clearError,
  };
}
