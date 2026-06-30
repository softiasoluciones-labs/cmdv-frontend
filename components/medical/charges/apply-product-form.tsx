"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Package, Loader2, AlertTriangle, Search, Warehouse as WarehouseIcon,
} from "lucide-react";
import { useProducts } from "@/hooks/inventory-hooks/use-products";
import { useWarehouses } from "@/hooks/inventory-hooks/use-warehouses";
import { ApiError } from "@/lib/api/config";
import { ApplyCaseProductRequest } from "@/lib/api/types/medical-types/case-product.types";

interface ApplyProductFormProps {
  onSubmit: (data: ApplyCaseProductRequest) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const EMPTY: ApplyCaseProductRequest = {
  product_id: "",
  warehouse_id: "",
  quantity: 1,
  notes: "",
};

export function ApplyProductForm({
  onSubmit,
  onCancel,
  isSubmitting,
}: ApplyProductFormProps) {
  const { products, isLoading: isLoadingProducts, fetchProducts } =
    useProducts();
  const { warehouses, isLoading: isLoadingWarehouses, fetchWarehouses } =
    useWarehouses();

  const [form, setForm] = useState<ApplyCaseProductRequest>(EMPTY);
  const [productSearch, setProductSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchProducts({ limit: 20, isActive: true });
    fetchWarehouses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleProductSearch = async (value: string) => {
    setProductSearch(value);
    setShowDropdown(true);
    await fetchProducts({ search: value.trim() || undefined, limit: 20, isActive: true });
  };

  const handleSelectProduct = (productId: string, label: string) => {
    setForm(f => ({ ...f, product_id: productId }));
    setProductSearch(label);
    setShowDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.product_id) {
      setError("Selecciona un producto");
      return;
    }
    if (!form.warehouse_id) {
      setError("Selecciona una bodega");
      return;
    }
    if (!form.quantity || form.quantity <= 0) {
      setError("La cantidad debe ser mayor a cero");
      return;
    }
    try {
      await onSubmit({
        product_id: form.product_id,
        warehouse_id: form.warehouse_id,
        quantity: form.quantity,
        notes: form.notes?.trim() || undefined,
      });
      setForm(EMPTY);
      setProductSearch("");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "No se pudo registrar el cargo. Intenta de nuevo.";
      setError(message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No se pudo registrar el cargo</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="product" className="text-sm font-medium flex items-center gap-1.5">
          <Package className="h-3.5 w-3.5 text-muted-foreground" />
          Producto <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            id="product"
            placeholder="Buscar por nombre o código..."
            value={productSearch}
            onChange={e => handleProductSearch(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            className="pl-9 h-10"
            autoComplete="off"
          />
          {showDropdown && (
            <div className="absolute z-50 top-full left-0 right-0 mt-1 max-h-64 overflow-y-auto rounded-md border bg-background shadow-lg">
              {isLoadingProducts ? (
                <div className="space-y-1 p-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Sin resultados
                </div>
              ) : (
                <div className="py-1">
                  {products.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      className="w-full px-3 py-2 text-left hover:bg-muted/50 flex items-start justify-between gap-3"
                      onClick={() => handleSelectProduct(p.id, `${p.code} — ${p.name}`)}
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{p.code}</p>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {p.unitOfMeasure}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="warehouse" className="text-sm font-medium flex items-center gap-1.5">
          <WarehouseIcon className="h-3.5 w-3.5 text-muted-foreground" />
          Bodega <span className="text-destructive">*</span>
        </Label>
        <Select
          value={form.warehouse_id || "none"}
          onValueChange={v => setForm(f => ({ ...f, warehouse_id: v === "none" ? "" : v }))}
          disabled={isLoadingWarehouses}
        >
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Seleccionar bodega..." />
          </SelectTrigger>
          <SelectContent>
            {isLoadingWarehouses ? (
              <SelectItem value="loading" disabled>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Cargando...
              </SelectItem>
            ) : warehouses.length === 0 ? (
              <SelectItem value="empty" disabled>No hay bodegas disponibles</SelectItem>
            ) : (
              warehouses
                .filter(w => w.isActive)
                .map(w => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.name} {w.temperatureControlled ? "(Refrigerada)" : ""}
                  </SelectItem>
                ))
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="quantity" className="text-sm font-medium">
          Cantidad <span className="text-destructive">*</span>
        </Label>
        <Input
          id="quantity"
          type="number"
          min={1}
          step={1}
          value={form.quantity}
          onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) || 0 }))}
          className="h-10"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes" className="text-sm font-medium">
          Notas <span className="text-xs text-muted-foreground font-normal">(opcional)</span>
        </Label>
        <Textarea
          id="notes"
          placeholder="Observaciones sobre la aplicación del producto..."
          value={form.notes ?? ""}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          rows={3}
          className="resize-none"
        />
      </div>

      <div className="flex items-center gap-2 pt-2 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Package className="mr-2 h-4 w-4" />
          )}
          Registrar Cargo
        </Button>
      </div>
    </form>
  );
}
