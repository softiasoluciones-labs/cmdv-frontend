"use client";

import { useState, useEffect, useCallback } from "react";
import { servicesService } from "@/lib/api/services/medical-services/servicesService";
import { MedicalService, ServicesQueryParams } from "@/lib/api/types/medical-types/services.types";
import { ApiError } from "@/lib/api";

interface UseServicesState {
    services: MedicalService[];
    pagination: {
        page: number;
        total: number;
    };
    isLoading: boolean;
    error: string | null;
}

interface UseServicesReturn extends UseServicesState {
    fetchServices: (params?: ServicesQueryParams) => Promise<void>;
    createService: (data: MedicalService) => Promise<void>;
    updateService: (id: string, data: MedicalService) => Promise<void>;
    deleteService: (id: string) => Promise<void>;
}

export function useServices(initialParams: ServicesQueryParams = {}): UseServicesReturn {
    const [state, setState] = useState<UseServicesState>({
        services: [],
        pagination: { page: 1, total: 0 },
        isLoading: true,
        error: null,
    });

    const [currentParams, setCurrentParams] = useState<ServicesQueryParams>(initialParams);

    const fetchServices = useCallback(async (params: ServicesQueryParams = {}) => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await servicesService.getAllServices(params);
            const data = response.data;
            setState({
                services: data.services || data.data || [],
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
                error instanceof ApiError ? error.message : "Error al cargar los servicios";
            setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
        }
    }, []);

    const createService = useCallback(async (data: MedicalService) => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        try {
            await servicesService.createService(data);
            await fetchServices(currentParams);
        } catch (error) {
            const errorMessage =
                error instanceof ApiError ? error.message : "Error al crear el servicio";
            setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
        }
    }, [fetchServices, currentParams]);

    const updateService = useCallback(async (id: string, data: MedicalService) => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        try {
            await servicesService.updateService(id, data);
            await fetchServices(currentParams);
        } catch (error) {
            const errorMessage =
                error instanceof ApiError ? error.message : "Error al actualizar el servicio";
            setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
        }
    }, [fetchServices, currentParams]);

    const deleteService = useCallback(async (id: string) => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        try {
            await servicesService.deleteService(id);
            await fetchServices(currentParams);
        } catch (error) {
            const errorMessage =
                error instanceof ApiError ? error.message : "Error al eliminar el servicio";
            setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
        }
    }, [fetchServices, currentParams]);

    useEffect(() => {
        fetchServices(initialParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchServices]);

    return {
        ...state,
        fetchServices,
        createService,
        updateService,
        deleteService,
    };
}