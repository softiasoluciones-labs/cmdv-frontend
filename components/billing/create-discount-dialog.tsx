"use client";

import { useState } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tag, Percent, DollarSign, Loader2, AlertTriangle } from "lucide-react";
import { ApiError } from "@/lib/api";
import {
  DiscountCategory,
  DiscountType,
  DISCOUNT_TYPE_LABELS,
  DISCOUNT_CATEGORY_LABELS,
  CreateDiscountCatalogRequest,
} from "@/lib/api/types/billing-types/billing.types";

interface CreateDiscountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateDiscountCatalogRequest) => Promise<void>;
}

export function CreateDiscountDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreateDiscountDialogProps) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<DiscountCategory>(
    DiscountCategory.MANUAL
  );
  const [discountType, setDiscountType] = useState<DiscountType>(
    DiscountType.PERCENTAGE
  );
  const [value, setValue] = useState<number>(0);
  const [maxAmount, setMaxAmount] = useState<string>("");
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!code.trim() || !name.trim()) {
      setError("Código y nombre son obligatorios");
      return;
    }
    if (value <= 0) {
      setError("El valor debe ser mayor a cero");
      return;
    }
    if (discountType === DiscountType.PERCENTAGE && value > 100) {
      setError("El porcentaje no puede superar el 100%");
      return;
    }
    const max = maxAmount.trim() ? Number(maxAmount) : undefined;
    if (max !== undefined && max < 0) {
      setError("El monto máximo no puede ser negativo");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        code: code.trim(),
        name: name.trim(),
        category,
        discount_type: discountType,
        value,
        ...(max !== undefined && { max_amount: max }),
        requires_approval: requiresApproval,
      });
      onOpenChange(false);
      setCode("");
      setName("");
      setValue(0);
      setMaxAmount("");
      setRequiresApproval(false);
      setNotes("");
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "No se pudo crear el descuento";
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
              <DialogTitle>Nuevo descuento</DialogTitle>
              <DialogDescription>
                Agrégalo al catálogo para reutilizarlo en futuras facturas.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="code" className="text-sm font-medium">
                Código <span className="text-destructive">*</span>
              </Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="DESC-PROMO"
                className="h-10 font-mono"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Categoría</Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as DiscountCategory)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(DiscountCategory).map((c) => (
                    <SelectItem key={c} value={c}>
                      {DISCOUNT_CATEGORY_LABELS[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Nombre <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Promoción de verano"
              className="h-10"
              disabled={isSubmitting}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tipo</Label>
              <Select
                value={discountType}
                onValueChange={(v) => setDiscountType(v as DiscountType)}
                disabled={isSubmitting}
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
                {discountType === DiscountType.PERCENTAGE ? "%" : "Monto (Q)"}
              </Label>
              <div className="relative">
                {discountType === DiscountType.PERCENTAGE ? (
                  <Percent className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                ) : (
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                )}
                <Input
                  id="value"
                  type="number"
                  min={0}
                  step={0.01}
                  value={value || ""}
                  onChange={(e) => setValue(Number(e.target.value) || 0)}
                  className="pl-9 h-10"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="max" className="text-sm font-medium">
                Tope (Q) <span className="text-xs text-muted-foreground">opcional</span>
              </Label>
              <Input
                id="max"
                type="number"
                min={0}
                step={0.01}
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                placeholder="—"
                className="h-10"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <label className="flex items-start gap-2 rounded-md border bg-muted/30 p-3 cursor-pointer">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-gray-300"
              checked={requiresApproval}
              onChange={(e) => setRequiresApproval(e.target.checked)}
              disabled={isSubmitting}
            />
            <div className="text-sm">
              <p className="font-medium">Requiere aprobación administrativa</p>
              <p className="text-xs text-muted-foreground">
                Si está activo, el descuento no se reflejará en el total hasta
                que un admin lo apruebe.
              </p>
            </div>
          </label>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
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
            Crear descuento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
