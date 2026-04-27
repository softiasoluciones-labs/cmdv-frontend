"use client"; 

/**
 * usePurchaseOrder Hook
 * Custom hook for managing purchase orders data with loading and error states
 */
import { useState, useCallback, useEffect } from "react";
import { purchaseOrderService, PurchaseOrder, ApiError } from "@/lib/api";
import { CreatePurchaseOrderPayload, PurchaseOrderChangeStatus, PurchaseOrderReceivedItems } from "@/lib/api/types/inventory-types/inventory.types";

interface UsePurchaseOrdersState {
    purchaseOrders: PurchaseOrder[];
    isLoading: boolean;
    error: string | null;
}

interface UsePurchaseOrdersReturn extends UsePurchaseOrdersState {
    fetchPurchaseOrders: () => Promise<void>;
    findById: (id: string) => Promise<PurchaseOrder | null>;
    createPurchaseOrder: (purchaseOrderData: CreatePurchaseOrderPayload) => Promise<void>;
    updatePurchaseOrder: (id: string, purchaseOrderData: PurchaseOrderChangeStatus) => Promise<void>;
    receivePurchaseOrder: (id: string, receivedItems: PurchaseOrderReceivedItems) => Promise<void>;
}

export function usePurchaseOrders(): UsePurchaseOrdersReturn {
    const [state, setState] = useState<UsePurchaseOrdersState>({
        purchaseOrders: [],
        isLoading: true,
        error: null,
    });

    const fetchPurchaseOrders = useCallback(async () => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await purchaseOrderService.getPurchaseOrders({});
            setState((prev) => ({ ...prev, purchaseOrders: response.data?.orders || [], isLoading: false }));
        } catch (error) {
            const apiError = error as ApiError;
            setState((prev) => ({ ...prev, error: apiError.message, isLoading: false }));
        }
    }, []);

    const findById = useCallback(async (id: string): Promise<PurchaseOrder | null> => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await purchaseOrderService.getPurchaseOrderById(id);
            setState((prev) => ({
                ...prev,
                purchaseOrders: prev.purchaseOrders.some(po => po.id === id)
                    ? prev.purchaseOrders.map(po => po.id === id ? response.data : po)
                    : [...prev.purchaseOrders, response.data],
                isLoading: false
            }));
            return response.data;
        } catch (error) {
            const apiError = error as ApiError;
            setState((prev) => ({ ...prev, error: apiError.message, isLoading: false }));
            return null;
        }
    }, []);

    const createPurchaseOrder = useCallback(async (purchaseOrderData: CreatePurchaseOrderPayload) => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await purchaseOrderService.createPurchaseOrder(purchaseOrderData);
            setState((prev) => ({ ...prev, purchaseOrders: [...prev.purchaseOrders, response.data], isLoading: false }));
        } catch (error) {
            const apiError = error as ApiError;
            setState((prev) => ({ ...prev, error: apiError.message, isLoading: false }));
        }
    }, []);

    const updatePurchaseOrder = useCallback(async (id: string, purchaseOrderData: PurchaseOrderChangeStatus) => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await purchaseOrderService.updatePurchaseOrder(id, purchaseOrderData);
            setState((prev) => ({ 
                ...prev, 
                purchaseOrders: prev.purchaseOrders.map(po => po.id === id ? response.data : po), 
                isLoading: false 
            }));
        } catch (error) {
            const apiError = error as ApiError;
            setState((prev) => ({ ...prev, error: apiError.message, isLoading: false }));
        }
    }, []);

    const receivePurchaseOrder = useCallback(async (id: string, receivedItems: PurchaseOrderReceivedItems) => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        try {
            await purchaseOrderService.receivePurchaseOrder(id, receivedItems);
            setState((prev) => ({ 
                ...prev, 
                purchaseOrders: prev.purchaseOrders.map(po => po.id === id ? { ...po, status: "received" } : po), 
                isLoading: false 
            }));
        } catch (error) {
            const apiError = error as ApiError;
            setState((prev) => ({ ...prev, error: apiError.message, isLoading: false }));
        }
    }, []);

    useEffect(() => {
        fetchPurchaseOrders();
    }, [fetchPurchaseOrders]);

    return {
        ...state,
        fetchPurchaseOrders,
        findById,
        createPurchaseOrder,
        updatePurchaseOrder,
        receivePurchaseOrder
    };
}