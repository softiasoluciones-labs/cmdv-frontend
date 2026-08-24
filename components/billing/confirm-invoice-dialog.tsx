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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ClipboardCheck, Loader2, AlertTriangle, Ban } from "lucide-react";
import { ApiError } from "@/lib/api";
import {
  ConfirmInvoiceRequest,
  InvoiceStatus,
} from "@/lib/api/types/billing-types/billing.types";

interface ConfirmInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ConfirmInvoiceRequest) => Promise<void>;
  invoiceNumber: string;
  hasPendingDiscounts?: boolean;
}

export function ConfirmInvoiceDialog({
  open,
  onOpenChange,
  onSubmit,
  invoiceNumber,
  hasPendingDiscounts,
}: ConfirmInvoiceDialogProps) {
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({ notes: notes.trim() || undefined });
      onOpenChange(false);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "No se pudo confirmar la factura";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={isSubmitting ? undefined : onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
              <ClipboardCheck className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <DialogTitle>Confirmar factura</DialogTitle>
              <DialogDescription>{invoiceNumber}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <p className="text-sm text-muted-foreground">
            Al confirmar, los cargos quedan <strong>bloqueados</strong> y el
            expediente avanza al estado{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              CC_CONFIRMACION_CARGOS
            </code>
            . Después de confirmar no podrás editar los cargos.
          </p>

          {hasPendingDiscounts && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Hay descuentos pendientes de aprobación. Apruébalos o elimínalos
                antes de confirmar.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Notas <span className="text-xs text-muted-foreground">(opcional)</span>
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas sobre la confirmación..."
              rows={3}
              className="resize-none"
              disabled={isSubmitting}
            />
          </div>

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
            disabled={isSubmitting || hasPendingDiscounts}
            className="flex-1"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <ClipboardCheck className="mr-2 h-4 w-4" />
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function isConfirmable(status: InvoiceStatus | string): boolean {
  return status === InvoiceStatus.DRAFT;
}
