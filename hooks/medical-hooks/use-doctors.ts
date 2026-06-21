"use client";

import { useState, useEffect, useCallback } from "react";
import { doctorService } from "@/lib/api/services/medical-services/doctorService";
import {
  DoctorListResponse,
  DoctorResponse,
  DoctorQueryParams,
} from "@/lib/api/types/medical-types/doctor.types";
import { ApiError } from "@/lib/api";

interface useDoctorsState {
  doctors: DoctorListResponse[];
  selectedDoctor: DoctorResponse | null;
  isLoading: boolean;
  error: string | null;
}

interface useDoctorsReturn extends useDoctorsState {
  fetchDoctors: (params?: DoctorQueryParams) => Promise<void>;
  fetchDoctorById: (id: string) => Promise<DoctorResponse | null>;
  clearSelectedDoctor: () => void;
  clearError: () => void;
}

export function useDoctors(initialParams: DoctorQueryParams = {}): useDoctorsReturn {
  const [state, setState] = useState<useDoctorsState>({
    doctors: [],
    selectedDoctor: null,
    isLoading: true,
    error: null,
  });

  const fetchDoctors = useCallback(async (params: DoctorQueryParams = {}) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await doctorService.getAllDoctors(params);
      const data = response.data as any;
      const doctorsArray = data.doctors || data.data || data || [];
      setState({
        doctors: Array.isArray(doctorsArray) ? doctorsArray : [],
        selectedDoctor: null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage =
        error instanceof ApiError
          ? error.message
          : "Error al cargar los médicos";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, []);

  const fetchDoctorById = useCallback(async (id: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await doctorService.getDoctorById(id);
      const data = response.data as unknown as DoctorResponse;
      setState((prev) => ({
        ...prev,
        selectedDoctor: data,
        isLoading: false,
        error: null,
      }));
      return data;
    } catch (error) {
      const errorMessage =
        error instanceof ApiError
          ? error.message
          : "Error al cargar el médico";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return null;
    }
  }, []);

  const clearSelectedDoctor = useCallback(() => {
    setState((prev) => ({ ...prev, selectedDoctor: null }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  useEffect(() => {
    fetchDoctors({ ...initialParams, isActive: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchDoctors]);

  return {
    ...state,
    fetchDoctors,
    fetchDoctorById,
    clearSelectedDoctor,
    clearError,
  };
}
