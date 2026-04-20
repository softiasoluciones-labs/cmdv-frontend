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
    temperatureRange?: string;
    productCount: number;
    isActive: boolean;
    createdAt: string; // ISO date
}


/*****************************************************************/


/*****************************************************************/
/**
 * Suppliers interfaces
 */
export interface Supplier {
    id: string;
    code: string;
    name: string;
    contactName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    taxId: string;
    paymentTerms: string;
    creditLimit: number;
    isActive: boolean;
}

export interface editSupplierData { 
    id: string;
    code: string;
    name: string;
    paymentTerms: string;
    contactName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    taxId: string;
    creditLimit: number;
}

export interface SupplierQueryParams {
    activeOnly?: boolean;
}

/*****************************************************************/

