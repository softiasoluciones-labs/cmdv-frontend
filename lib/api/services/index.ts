/**
 * API Services Index
 * Central export for all API services
 */

export { userService } from "./core-services/user.service";
export { authService } from "./auth-services/authService";
export { roleService } from "./core-services/roleService";
export { productService } from "./inventory-services/productService";
export { purchaseOrderService } from "./inventory-services/purchaseOrderService";
export { supplierService } from "./inventory-services/supplierService";
export { warehouseService } from "./inventory-services/warehouseService";

export { patientService } from "./medical-services/patientService";
export { caseFileService } from "./medical-services/caseFileService";
