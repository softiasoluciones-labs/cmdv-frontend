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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileText, Loader2, AlertTriangle } from "lucide-react";
import { ApiError } from "@/lib/api";
import {
  CreateTaxInvoiceRequest,
} from "@/lib/api/types/billing-types/billing.types";

interface TaxInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateTaxInvoiceRequest) => Promise<void>;
  invoiceNumber: string;
}

const DOC_TYPES = [
  { value: "FACT", label: "FACT — Factura" },
  { value: "FCAM", label: "FCAM — Factura Cambiaria" },
];

export function TaxInvoiceDialog({
  open,
  onOpenChange,
  onSubmit,
  invoiceNumber,
}: TaxInvoiceDialogProps) {
  const [nit, setNit] = useState("");
  const [taxName, setTaxName] = useState("");
  const [taxAddress, setTaxAddress] = useState("");
  const [documentType, setDocumentType] = useState("FACT");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!taxName.trim()) {
      setError("El nombre fiscal es obligatorio");
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit({
        nit: nit.trim() || "CF",
        tax_name: taxName.trim(),
        tax_address: taxAddress.trim() || undefined,
        document_type: documentType,
      });
      onOpenChange(false);
      setNit("");
      setTaxName("");
      setTaxAddress("");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "No se pudo registrar la factura fiscal";
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
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500/10">
              <FileText className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <DialogTitle>Solicitar factura fiscal (FEL)</DialogTitle>
              <DialogDescription>{invoiceNumber}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <Alert className="bg-amber-500/10 border-amber-500/30">
            <AlertTriangle className="h-4 w-4 text-amber-700" />
            <AlertTitle className="text-amber-800">Pendiente de integración SAT</AlertTitle>
            <AlertDescription className="text-amber-800 text-sm">
              La factura fiscal se registra con estado <code>pending</code> hasta
              que se complete la integración con el certificador autorizado.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nit" className="text-sm font-medium">
                NIT
              </Label>
              <Input
                id="nit"
                value={nit}
                onChange={(e) => setNit(e.target.value)}
                placeholder="CF (Consumidor Final)"
                className="h-10"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tipo de documento</Label>
              <Select
                value={documentType}
                onValueChange={setDocumentType}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOC_TYPES.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxName" className="text-sm font-medium">
              Nombre fiscal <span className="text-destructive">*</span>
            </Label>
            <Input
              id="taxName"
              value={taxName}
              onChange={(e) => setTaxName(e.target.value)}
              placeholder="Razón social del receptor"
              className="h-10"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxAddress" className="text-sm font-medium">
              Dirección fiscal <span className="text-xs text-muted-foreground">(opcional)</span>
            </Label>
            <Textarea
              id="taxAddress"
              value={taxAddress}
              onChange={(e) => setTaxAddress(e.target.value)}
              rows={2}
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
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <FileText className="mr-2 h-4 w-4" />
            Registrar FEL
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
