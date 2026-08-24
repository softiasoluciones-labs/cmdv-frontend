"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Percent, DollarSign, Loader2, AlertTriangle, Tag } from "lucide-react";
import { useDiscountCatalog } from "@/hooks/billing-hooks/use-discount-catalog";
import { ApiError } from "@/lib/api";
import {
  ApplyDiscountRequest,
  DiscountType,
  DISCOUNT_TYPE_LABELS,
  DISCOUNT_CATEGORY_LABELS,
} from "@/lib/api/types/billing-types/billing.types";

interface ApplyDiscountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ApplyDiscountRequest) => Promise<{ requires_approval: boolean; message: string }>;
  invoiceSubtotal: number;
  invoiceTotal: number;
}

const NONE = "__none__";

export function ApplyDiscountDialog({
  open,
  onOpenChange,
  onSubmit,
  invoiceSubtotal,
  invoiceTotal,
}: ApplyDiscountDialogProps) {
  const { items: catalog, isLoading: isLoadingCatalog } = useDiscountCatalog();

  const [discountType, setDiscountType] = useState<DiscountType>(
    DiscountType.PERCENTAGE
  );
  const [value, setValue] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [reason, setReason] = useState("");
  const [catalogId, setCatalogId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setError(null);
      setSuccess(null);
      setValue(0);
      setReason("");
      setCatalogId("");
    }
  }, [open]);

  // When user picks a catalog item, pre-fill type + value.
  useEffect(() => {
    if (!catalogId) return;
    const item = catalog.find((c) => c.id === catalogId);
    if (!item) return;
    setDiscountType(item.discount_type);
    setValue(item.value);
    setDescription(item.name);
  }, [catalogId, catalog]);

  const calculatedAmount =
    discountType === DiscountType.PERCENTAGE
      ? Math.min((invoiceSubtotal * value) / 100, invoiceTotal)
      : Math.min(value, invoiceTotal);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (value <= 0) {
      setError("El valor del descuento debe ser mayor a cero");
      return;
    }
    if (discountType === DiscountType.PERCENTAGE && value > 100) {
      setError("El porcentaje no puede superar el 100%");
      return;
    }
    if (!description.trim()) {
      setError("Indica una descripción para el descuento");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await onSubmit({
        ...(catalogId && catalogId !== NONE && { discount_id: catalogId }),
        description: description.trim(),
        discount_type: discountType,
        value,
        reason: reason.trim() || undefined,
      });
      setSuccess(result.message);
      // Close on next tick so the toast is visible briefly.
      setTimeout(() => onOpenChange(false), 1200);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "No se pudo aplicar el descuento";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={isSubmitting ? undefined : onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
              <Tag className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <DialogTitle>Aplicar descuento</DialogTitle>
              <DialogDescription>
                Se descontará del subtotal antes de impuestos.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>No se pudo aplicar el descuento</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-emerald-500/10 border-emerald-500/30">
              <AlertDescription className="text-emerald-700 font-medium">
                {success}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label className="text-sm font-medium">Catálogo (opcional)</Label>
            <Select
              value={catalogId || NONE}
              onValueChange={setCatalogId}
              disabled={isLoadingCatalog}
            >
              <SelectTrigger>
                <SelectValue placeholder="Descuento libre (sin catálogo)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>
                  Descuento libre (sin catálogo)
                </SelectItem>
                {isLoadingCatalog ? (
                  <SelectItem value="loading" disabled>
                    <Loader2 className="h-3 w-3 animate-spin mr-2" />
                    Cargando...
                  </SelectItem>
                ) : (
                  catalog.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.code} — {c.name}{" "}
                      <span className="text-muted-foreground">
                        ({DISCOUNT_CATEGORY_LABELS[c.category]})
                      </span>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tipo</Label>
              <Select
                value={discountType}
                onValueChange={(v) => setDiscountType(v as DiscountType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(DiscountType).map((t) => (
                    <SelectItem key={t} value={t}>
                      {DISCOUNT_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="value" className="text-sm font-medium">
                {discountType === DiscountType.PERCENTAGE ? "Porcentaje" : "Monto (Q)"}
              </Label>
              <div className="relative">
                {discountType === DiscountType.FIXED_AMOUNT ? (
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                ) : (
                  <Percent className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                )}
                <Input
                  id="value"
                  type="number"
                  min={0}
                  step={discountType === DiscountType.PERCENTAGE ? 0.01 : 0.01}
                  value={value || ""}
                  onChange={(e) => setValue(Number(e.target.value) || 0)}
                  className="pl-9 h-10"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm flex items-center justify-between">
            <span className="text-muted-foreground">Descuento calculado</span>
            <span className="font-semibold tabular-nums text-emerald-700">
              − Q{calculatedAmount.toFixed(2)}
            </span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Descripción <span className="text-destructive">*</span>
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej. Cortesía administrativa"
              className="h-10"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm font-medium">
              Motivo <span className="text-xs text-muted-foreground">(opcional)</span>
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Justificación del descuento..."
              rows={2}
              className="resize-none"
              disabled={isSubmitting}
            />
          </div>
        </form>

        <DialogFooter className="px-6 pb-6 pt-4 border-t gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Tag className="mr-2 h-4 w-4" />
            Aplicar descuento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
