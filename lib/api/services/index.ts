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
export { paymentSupplierService } from "./inventory-services/paymentSupplierService";

export { patientService } from "./medical-services/patientService";
export { caseFileService } from "./medical-services/caseFileService";
export { caseProductService } from "./medical-services/caseProductService";
export { caseServiceService } from "./medical-services/caseServiceService";
export { caseRoomService } from "./medical-services/caseRoomService";
export { casePackageAssignmentService } from "./medical-services/casePackageAssignmentService";

export { invoiceService } from "./billing-services/invoiceService";
export { paymentService } from "./billing-services/paymentService";
export { discountService } from "./billing-services/discountService";
export { cashSessionService } from "./billing-services/cashSessionService";
export { taxInvoiceService } from "./billing-services/taxInvoiceService";
