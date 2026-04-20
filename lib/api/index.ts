/**
 * API Module Index
 * Central export for the API layer
 */

// Core client
export { api, apiClient } from "./client";
export { API_CONFIG, ApiError } from "./config";
export type { ApiRequestConfig, ApiResponse, PaginatedResponse } from "./config";

// Types
export * from "./types";
export * from "./types/inventory-types/inventory.types";

// Services
export * from "./services";
export * from "./services/inventory-services/warehouseService";