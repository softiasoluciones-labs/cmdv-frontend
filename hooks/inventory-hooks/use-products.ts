"use client";

/**
 * use Products hook 
 * Custom hook for managing products data with loading and error states 
 */
import { useState, useEffect, useCallback } from "react";
import { productService } from "@/lib/api/services/inventory-services/productService";
import { Product, ProductsQueryParams } from "@/lib/api/types/inventory-types/inventory.types";
import { ApiError } from "@/lib/api/config";

interface UseProductState {
    products: Product[];
    pagination: {
        page: number;
        limit: number;
        total: number;
    };
    isLoading: boolean;
    error: string | null;
}

// Interface a cumplir con los eventos del contrato del hook
interface UseProductsReturn extends UseProductState {
    fetchProducts: (params: ProductsQueryParams) => Promise<void>;
    findById: (id: string) => Promise<void>;
    createProduct: (productData: Product) => Promise<void>;
    updateProduct: (id: string, productData: Product) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
}

export function useProducts(initialParams: ProductsQueryParams = {}): UseProductsReturn {
    const [state, setState] = useState<UseProductState>({
        products: [],
        pagination: {
            page: 1,
            limit: 20,
            total: 0
        },
        isLoading: true,
        error: null,
    });

    const [currentParams, setCurrentParams] = useState<ProductsQueryParams>(initialParams);

    // Function to fetch products
    const fetchProducts = useCallback(async (params: ProductsQueryParams = {}) => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await productService.getProducts(params);
            const data = response.data;
            console.log(data);

            setState({
                products: data.products || data.data || [],
                pagination: {
                    page: data.page || 1,
                    limit: data.limit || 20,
                    total: data.total || 0,
                },
                isLoading: false,
                error: null
            });

            setCurrentParams(params);
        } catch (error) {
            const errorMessage =
                error instanceof ApiError
                    ? error.message
                    : "Error al cargar los productos";

            setState((prev) => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
        }
    }, []);

    // Function to find by id 
    const findById = useCallback(async (id: string) => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await productService.getProductById(id);
            const data = response.data;

            setState((prev) => ({
                ...prev,
                products: [...prev.products, data],
                isLoading: false,
                error: null
            }));
        } catch (error) {
            const errorMessage =
                error instanceof ApiError
                    ? error.message
                    : "Error al cargar el producto";

            setState((prev) => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
        }
    }, []);

    // Function to create product
    const createProduct = useCallback(async (productData: Product) => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await productService.createProduct(productData);
            const data = response.data;

            setState((prev) => ({
                ...prev,
                products: [...prev.products, data],
                isLoading: false,
                error: null
            }));
        } catch (error) {
            const errorMessage =
                error instanceof ApiError
                    ? error.message
                    : "Error al crear el producto";

            setState((prev) => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
        }
    }, []);

    // Function to update product
    const updateProduct = useCallback(async (id: string, productData: Product) => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await productService.updateProduct(id, productData);
            const data = response.data;

            setState((prev) => ({
                ...prev,
                products: prev.products.map((product) =>
                    product.id === id ? data : product
                ),
                isLoading: false,
                error: null
            }));
        } catch (error) {
            const errorMessage =
                error instanceof ApiError
                    ? error.message
                    : "Error al actualizar el producto";

            setState((prev) => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
        }
    }, []);

    // Function to delete product
    const deleteProduct = useCallback(async (id: string) => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        try {
            await productService.deleteProduct(id);

            setState((prev) => ({
                ...prev,
                products: prev.products.filter((product) =>
                    product.id !== id
                ),
                isLoading: false,
                error: null
            }));
        } catch (error) {
            const errorMessage =
                error instanceof ApiError
                    ? error.message
                    : "Error al eliminar el producto";

            setState((prev) => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
        }
    }, []);

    useEffect(() => {
        fetchProducts(initialParams);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        ...state,
        fetchProducts,
        findById,
        createProduct,
        updateProduct,
        deleteProduct,
    };
}
