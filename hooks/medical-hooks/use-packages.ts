"use client";

import { useState, useEffect, useCallback } from "react";
import { packageService } from "@/lib/api/services/medical-services/packageService";
import { Packages, PackagesQueryParams } from "@/lib/api/types/medical-types/package.type";
import { ApiError } from "@/lib/api";

interface usePackagesState {
    packages: Packages[];
    pagination: {
        page: number;
        total: number;
    };
    isLoading: boolean;
    error: string | null;
};

interface usePackagesReturn extends usePackagesState {
    fetchPackages: (params?: PackagesQueryParams) => Promise<void>;
    createPackage: (data: Packages) => Promise<Packages>;
    copyPackage: (id: string, data: { name: string; description?: string; external_doctor_price?: number; internal_doctor_price?: number }) => Promise<Packages>;
    updatePackage: (id: string, data: { description?: string; external_doctor_price?: number; internal_doctor_price?: number }) => Promise<Packages>;
    deactivatePackage: (id: string) => Promise<Packages>;
    removePackageDetail: (detailId: string) => Promise<void>;
    addPackageDetail: (data: { package_id: string; product_id: string; quantity: number; notes?: string }) => Promise<void>;
}

export function usePackages(initialParams: PackagesQueryParams = {}): usePackagesReturn {
    const [state, setState] = useState<usePackagesState>({
        packages: [],
        pagination: { page: 1, total: 0 },
        isLoading: true,
        error: null,
    });

    const [currentParams, setCurrentParams] = useState<PackagesQueryParams>(initialParams);

    const fetchPackages = useCallback(async (params: PackagesQueryParams = {}) => {
        setState((prev) => ({...prev, isLoading:true, error: null}));
        try {
            const response = await packageService.getAllPackages(params);
            const data = response.data;
            setState({
                packages: data.packages || data.data || [],
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
                error instanceof ApiError ? error.message : "Error al cargar los paquetes";
            setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
        }
    }, []);

    const createPackage = useCallback(async (data: Packages): Promise<Packages> => {
        const response = await packageService.createNewPackage(data);
        await fetchPackages(currentParams);
        return response.data;
    }, [fetchPackages, currentParams]);

    const copyPackage = useCallback(async (id: string, data: { name: string; description?: string; external_doctor_price?: number; internal_doctor_price?: number }): Promise<Packages> => {
        const response = await packageService.copyPackage(id, data);
        await fetchPackages(currentParams);
        return response.data;
    }, [fetchPackages, currentParams]);

    const updatePackage = useCallback(async (id: string, data: { description?: string; external_doctor_price?: number; internal_doctor_price?: number }): Promise<Packages> => {
        const response = await packageService.updatePackage(id, data);
        await fetchPackages(currentParams);
        return response.data;
    }, [fetchPackages, currentParams]);

    const deactivatePackage = useCallback(async (id: string): Promise<Packages> => {
        const response = await packageService.deactivatePackage(id);
        await fetchPackages(currentParams);
        return response.data;
    }, [fetchPackages, currentParams]);

    const removePackageDetail = useCallback(async (detailId: string): Promise<void> => {
        await packageService.removePackageDetail(detailId);
        await fetchPackages(currentParams);
    }, [fetchPackages, currentParams]);

    const addPackageDetail = useCallback(async (data: { package_id: string; product_id: string; quantity: number; notes?: string }): Promise<void> => {
        await packageService.addPackageDetail(data);
        await fetchPackages(currentParams);
    }, [fetchPackages, currentParams]);

    useEffect(() => {
        fetchPackages(initialParams);
    }, [fetchPackages]);

    return {
        ...state,
        fetchPackages,
        createPackage,
        copyPackage,
        updatePackage,
        deactivatePackage,
        removePackageDetail,
        addPackageDetail,
    }
}