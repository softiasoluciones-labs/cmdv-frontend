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
    
    useEffect(() => { 
        fetchPackages(initialParams); 
    }, [fetchPackages]); 

    return {
        ...state, 
        fetchPackages
    }
}
