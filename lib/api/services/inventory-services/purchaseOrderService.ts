import { api } from "../../client"
import { PurchaseOrder, PaginatedPurchaseOrdersResponse, PurchaseOrdersQueryParams, CreatePurchaseOrderPayload, PurchaseOrderChangeStatus, PurchaseOrderReceivedItems } from '../../types/inventory-types/inventory.types'

const PURCHASE_ORDER_ENDPOINT = "/inventory/purchase-orders/"

function transformQueryParams(params: PurchaseOrdersQueryParams): Record<string, string | boolean | number> {

    const result: Record<string, any> = {};
    if (params.supplierId !== undefined) result.supplierId = params.supplierId;
    if (params.status !== undefined) result.status = params.status;
    if (params.page !== undefined) result.page = params.page;
    if (params.limit !== undefined) result.limit = params.limit;
    if (params.search !== undefined) result.search = params.search;
    return result;
}

export const purchaseOrderService = {
    getPurchaseOrders: async (params: PurchaseOrdersQueryParams) => {
        const queryParams = transformQueryParams(params);
        return api.get<PaginatedPurchaseOrdersResponse>(PURCHASE_ORDER_ENDPOINT, queryParams);
    },

    getPurchaseOrdersReadyForPayment: async () => {
        return api.get<PaginatedPurchaseOrdersResponse>(PURCHASE_ORDER_ENDPOINT, { status: "approved" });
    },

    getPurchaseOrderById: async (id: string) => {
        return api.get<PurchaseOrder>(`${PURCHASE_ORDER_ENDPOINT}${id}`);
    },

    createPurchaseOrder: async (purchaseOrderData: CreatePurchaseOrderPayload) => {
        return api.post<PurchaseOrder>(PURCHASE_ORDER_ENDPOINT, purchaseOrderData);
    },

    updatePurchaseOrder: async (id: string, data: PurchaseOrderChangeStatus) => {
        return api.patch<PurchaseOrder>(`${PURCHASE_ORDER_ENDPOINT}${id}/status`, data);
    },

    receivePurchaseOrder: async (id: string, data: PurchaseOrderReceivedItems) => {
        return api.post(`${PURCHASE_ORDER_ENDPOINT}${id}/receive`, data);
    }
}