"use client";

/**
 * usePaymentSuppliers Hook
 * Custom hook for managing supplier payments data with loading and error states
 */
import { useState, useCallback, useEffect } from "react";
import { paymentSupplierService, ApiError } from "@/lib/api";
import { Payment, PaymentSummary, CreatePaymentPayload } from "@/lib/api/types/inventory-types/inventory.types";

interface UsePaymentsState {
    payments: Payment[];
    summary: PaymentSummary;
    isLoading: boolean;
    error: string | null;
}

interface UsePaymentsReturn extends UsePaymentsState {
    fetchPayments: (orderId: string) => Promise<void>;
    fetchSummary: (orderId: string) => Promise<void>;
    createPayment: (orderId: string, paymentData: CreatePaymentPayload) => Promise<Payment | null>;
    deletePayment: (orderId: string, paymentId: string) => Promise<void>;
}

export function usePaymentSuppliers(): UsePaymentsReturn {
    const [state, setState] = useState<UsePaymentsState>({
        payments: [],
        summary: { totalPaid: 0, remainingAmount: 0, paymentCount: 0 },
        isLoading: false,
        error: null,
    });

    const fetchPayments = useCallback(async (orderId: string) => {
        if (!orderId) return;
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await paymentSupplierService.getPaymentsByOrderId(orderId);
            setState((prev) => ({ ...prev, payments: response.data || [], isLoading: false }));
        } catch (error) {
            const apiError = error as ApiError;
            setState((prev) => ({ ...prev, error: apiError.message, isLoading: false }));
        }
    }, []);

    const fetchSummary = useCallback(async (orderId: string) => {
        if (!orderId) return;

        try {
            const response = await paymentSupplierService.getPaymentSummary(orderId);
            setState((prev) => ({ ...prev, summary: response.data }));
        } catch (error) {
            const apiError = error as ApiError;
            setState((prev) => ({ ...prev, error: apiError.message }));
        }
    }, []);

    const createPayment = useCallback(async (orderId: string, paymentData: CreatePaymentPayload): Promise<Payment | null> => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await paymentSupplierService.createPayment(orderId, paymentData);
            setState((prev) => ({
                ...prev,
                payments: [response.data, ...prev.payments],
                isLoading: false
            }));
            return response.data;
        } catch (error) {
            const apiError = error as ApiError;
            setState((prev) => ({ ...prev, error: apiError.message, isLoading: false }));
            return null;
        }
    }, []);

    const deletePayment = useCallback(async (orderId: string, paymentId: string) => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        try {
            await paymentSupplierService.deletePayment(orderId, paymentId);
            setState((prev) => ({
                ...prev,
                payments: prev.payments.filter(p => p.id !== paymentId),
                isLoading: false
            }));
        } catch (error) {
            const apiError = error as ApiError;
            setState((prev) => ({ ...prev, error: apiError.message, isLoading: false }));
        }
    }, []);

    return {
        ...state,
        fetchPayments,
        fetchSummary,
        createPayment,
        deletePayment
    };
}