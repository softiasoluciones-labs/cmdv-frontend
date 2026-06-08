import { api } from "../../client"
import { Payment, PaymentSummary, CreatePaymentPayload, PaymentsQueryParams, PaginatedPaymentsResponse } from '../../types/inventory-types/inventory.types'

const PAYMENT_ENDPOINT = "/inventory/purchase-orders/"

function transformQueryParams(params: PaymentsQueryParams): Record<string, string | boolean | number> {
    const result: Record<string, any> = {};
    if (params.purchaseOrderId !== undefined) result.purchaseOrderId = params.purchaseOrderId;
    if (params.page !== undefined) result.page = params.page;
    if (params.limit !== undefined) result.limit = params.limit;
    if (params.search !== undefined) result.search = params.search;
    return result;
}

export const paymentSupplierService = {
    getPayments: async (params: PaymentsQueryParams) => {
        const queryParams = transformQueryParams(params);
        return api.get<PaginatedPaymentsResponse>(`${PAYMENT_ENDPOINT}payments/`, queryParams);
    },

    getPaymentsByOrderId: async (orderId: string) => {
        return api.get<Payment[]>(`${PAYMENT_ENDPOINT}${orderId}/payments`);
    },

    getPaymentSummary: async (orderId: string) => {
        return api.get<PaymentSummary>(`${PAYMENT_ENDPOINT}${orderId}/payments/summary`);
    },

    createPayment: async (orderId: string, paymentData: CreatePaymentPayload) => {
        return api.post<Payment>(`${PAYMENT_ENDPOINT}${orderId}/payments`, paymentData);
    },

    deletePayment: async (orderId: string, paymentId: string) => {
        return api.delete(`${PAYMENT_ENDPOINT}${orderId}/payments/${paymentId}`);
    }
}