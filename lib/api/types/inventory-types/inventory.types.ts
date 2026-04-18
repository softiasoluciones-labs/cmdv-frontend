/**
 * Medical products interfaces
 */

export interface ProductsQueryParams {
    categoryId?: string;
    isActive?: boolean;
    requiresPrescription?: boolean;
    page?: number;
    limit?: number;
    search?: string;
}

export interface PaginatedProductsResponse {
    products?: Product[];
    data?: Product[];
    total: number;
    page: number;
    limit: number;
}

export interface Product {
    id: string;
    code: string;
    barcode: string;
    name: string;
    categoryId: string;
    categoryName: string;
    description: string;
    unitOfMeasure: string;
    minimumStock: number;
    maximumStock: number;
    reorderPoint: number;
    unitCost: number;
    sellingPrice: number;
    requiresPrescription: boolean;
    requiresRefrigeration: boolean;
    expirationAlertDays: number;
    isActive: boolean;
    createdAt: string; // ISO date
    updatedAt: string; // ISO date
}



/*****************************************************************/
/**
 * Warehouses interfaces
 */
export interface Warehouse {
    id: string;
    code: string;
    name: string;
    location: string;
    managerId: string;
    managerName: string;
    capacityM3: number;
    temperatureControlled: boolean;
    productCount: number;
    isActive: boolean;
    createdAt: string; // ISO date
}


/*****************************************************************/
