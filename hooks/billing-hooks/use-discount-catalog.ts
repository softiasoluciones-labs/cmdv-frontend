"use client";

/**
 * useDiscountCatalog
 *
 * Lists active catalog items (used in the discount-picker inside the
 * invoice detail page) and exposes a `create` mutation for the catalog
 * admin screen.
 */

import { useState, useEffect, useCallback } from "react";
import { ApiError } from "@/lib/api";
import { discountService } from "@/lib/api/services/billing-services/discountService";
import {
  DiscountCatalogItem,
  CreateDiscountCatalogRequest,
} from "@/lib/api/types/billing-types/billing.types";

interface UseDiscountCatalogState {
  items: DiscountCatalogItem[];
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
}

interface UseDiscountCatalogReturn extends UseDiscountCatalogState {
  fetchCatalog: () => Promise<void>;
  createItem: (data: CreateDiscountCatalogRequest) => Promise<DiscountCatalogItem>;
  clearError: () => void;
}

export function useDiscountCatalog(): UseDiscountCatalogReturn {
  const [state, setState] = useState<UseDiscountCatalogState>({
    items: [],
    isLoading: true,
    isMutating: false,
    error: null,
  });

  const fetchCatalog = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const resp = await discountService.listCatalog();
      const list = (resp.data as unknown as DiscountCatalogItem[]) ?? [];
      setState((prev) => ({
        ...prev,
        items: list,
        isLoading: false,
      }));
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Error al cargar el catálogo de descuentos";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
    }
  }, []);

  const createItem = useCallback(
    async (data: CreateDiscountCatalogRequest): Promise<DiscountCatalogItem> => {
      setState((prev) => ({ ...prev, isMutating: true, error: null }));
      try {
        const resp = await discountService.createCatalogItem(data);
        const created = resp.data as unknown as DiscountCatalogItem;
        setState((prev) => ({
          ...prev,
          items: [created, ...prev.items],
          isMutating: false,
        }));
        return created;
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message
            : "Error al crear el descuento";
        setState((prev) => ({ ...prev, isMutating: false, error: message }));
        throw error;
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  return {
    ...state,
    fetchCatalog,
    createItem,
    clearError,
  };
}
