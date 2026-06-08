"use client";

/**
 * usePurchaseOrdersReadyForPayment Hook
 * Custom hook for fetching purchase orders that are approved and ready for payment
 */
import { useState, useCallback, useEffect } from "react";
import { purchaseOrderService, ApiError } from "@/lib/api";
import { PurchaseOrder } from "@/lib/api/types/inventory-types/inventory.types";

// Extendemos el tipo PurchaseOrder para incluir paymentTerms
export interface PurchaseOrderWithPaymentTerms extends PurchaseOrder {
    paymentTerms: 'immediate' | 'one_payment' | 'two_payments' | 'three_payments';
}

interface UsePurchaseOrdersReadyForPaymentState {
    purchaseOrders: PurchaseOrderWithPaymentTerms[];
    isLoading: boolean;
    error: string | null;
}

interface UsePurchaseOrdersReadyForPaymentReturn extends UsePurchaseOrdersReadyForPaymentState {
    fetchPurchaseOrdersReadyForPayment: () => Promise<void>;
}

export function usePurchaseOrdersReadyForPayment(): UsePurchaseOrdersReadyForPaymentReturn {
    const [state, setState] = useState<UsePurchaseOrdersReadyForPaymentState>({
        purchaseOrders: [],
        isLoading: true,
        error: null,
    });

    const fetchPurchaseOrdersReadyForPayment = useCallback(async () => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await purchaseOrderService.getPurchaseOrdersReadyForPayment();

            // Aseguramos que los datos tengan el campo paymentTerms con un valor por defecto
            const ordersWithTerms = (response.data?.orders || []).map((order: any) => ({
                ...order,
                paymentTerms: order.paymentTerms || 'immediate' // Valor por defecto si no viene
            }));

            setState((prev) => ({
                ...prev,
                purchaseOrders: ordersWithTerms,
                isLoading: false
            }));
        } catch (error) {
            const apiError = error as ApiError;
            setState((prev) => ({
                ...prev,
                error: apiError.message,
                isLoading: false
            }));
        }
    }, []);

    useEffect(() => {
        fetchPurchaseOrdersReadyForPayment();
    }, [fetchPurchaseOrdersReadyForPayment]);

    return {
        ...state,
        fetchPurchaseOrdersReadyForPayment
    };
}