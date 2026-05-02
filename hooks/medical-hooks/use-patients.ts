"use client";

import { useState, useEffect, useCallback } from "react";
import { patientService } from "@/lib/api/services/medical-services/patientService";
import { Patients, PatientsQueryParams } from "@/lib/api/types/medical-types/patient.types";
import { ApiError } from "@/lib/api";

interface usePatientsState {
    patients: Patients[];
    pagination: {
        page: number;
        total: number;
    };
    isLoading: boolean;
    error: string | null;
}

interface usePatientsReturn extends usePatientsState {
    fetchPatients: (params?: PatientsQueryParams) => Promise<void>;
    createPatient: (data: Patients) => Promise<void>;
    updatePatient: (id: string, data: Patients) => Promise<void>;
    deletePatient: (id: string) => Promise<void>;
}

export function usePatients(initialParams: PatientsQueryParams = {}): usePatientsReturn {
    const [state, setState] = useState<usePatientsState>({
        patients: [],
        pagination: { page: 1, total: 0 },
        isLoading: true,
        error: null,
    });

    const [currentParams, setCurrentParams] = useState<PatientsQueryParams>(initialParams);

    const fetchPatients = useCallback(async (params: PatientsQueryParams = {}) => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await patientService.getAllPatients(params);
            const data = response.data;
            setState({
                patients: data.patients || data.data || [],
                pagination: {
                    page: data.page || 1,
                    total: data.total || 0,
                },
                isLoading: false,
                error: null,
            });
            setCurrentParams(params);
        } catch (error) {
            const errorMessage =
                error instanceof ApiError ? error.message : "Error al cargar los pacientes";
            setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
        }
    }, []);

    const createPatient = useCallback(async (data: Patients) => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        try {
            await patientService.createPatient(data);
            await fetchPatients(currentParams);
        } catch (error) {
            const errorMessage =
                error instanceof ApiError ? error.message : "Error al crear el paciente";
            setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
        }
    }, [fetchPatients, currentParams]);

    const updatePatient = useCallback(async (id: string, data: Patients) => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        try {
            await patientService.updatePatient(id, data);
            await fetchPatients(currentParams);
        } catch (error) {
            const errorMessage =
                error instanceof ApiError ? error.message : "Error al actualizar el paciente";
            setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
        }
    }, [fetchPatients, currentParams]);

    const deletePatient = useCallback(async (id: string) => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        try {
            await patientService.deleteProduct(id);
            await fetchPatients(currentParams);
        } catch (error) {
            const errorMessage =
                error instanceof ApiError ? error.message : "Error al eliminar el paciente";
            setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
        }
    }, [fetchPatients, currentParams]);

    useEffect(() => {
        fetchPatients(initialParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchPatients]);

    return {
        ...state,
        fetchPatients,
        createPatient,
        updatePatient,
        deletePatient,
    };
}
