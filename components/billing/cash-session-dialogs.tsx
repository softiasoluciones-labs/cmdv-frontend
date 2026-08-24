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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Wallet, AlertTriangle } from "lucide-react";
import { ApiError } from "@/lib/api";
import {
  OpenCashSessionRequest,
  CloseCashSessionRequest,
} from "@/lib/api/types/billing-types/billing.types";
import { formatCurrency } from "@/lib/utils";

interface OpenCashSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: OpenCashSessionRequest) => Promise<void>;
}

export function OpenCashSessionDialog({
  open,
  onOpenChange,
  onSubmit,
}: OpenCashSessionDialogProps) {
  const [initialCash, setInitialCash] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (initialCash < 0) {
      setError("El monto inicial no puede ser negativo");
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit({
        initial_cash: initialCash,
        notes: notes.trim() || undefined,
      });
      onOpenChange(false);
      setInitialCash(0);
      setNotes("");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "No se pudo abrir la sesión de caja";
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
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
              <Wallet className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <DialogTitle>Abrir sesión de caja</DialogTitle>
              <DialogDescription>
                Ingresa el efectivo inicial con el que arrancas el turno.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div className="space-y-2">
            <Label htmlFor="initial" className="text-sm font-medium">
              Efectivo inicial (Q) <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                Q
              </span>
              <Input
                id="initial"
                type="number"
                min={0}
                step={0.01}
                value={initialCash || ""}
                onChange={(e) => setInitialCash(Number(e.target.value) || 0)}
                className="pl-9 h-10"
                disabled={isSubmitting}
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Notas <span className="text-xs text-muted-foreground">(opcional)</span>
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="resize-none"
              disabled={isSubmitting}
              placeholder="Observaciones de la apertura..."
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>No se pudo abrir la sesión</AlertTitle>
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
            <Wallet className="mr-2 h-4 w-4" />
            Abrir sesión
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface CloseCashSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CloseCashSessionRequest) => Promise<void>;
  sessionNumber: string;
  expectedCash: number;
}

export function CloseCashSessionDialog({
  open,
  onOpenChange,
  onSubmit,
  sessionNumber,
  expectedCash,
}: CloseCashSessionDialogProps) {
  const [actualCash, setActualCash] = useState<number>(expectedCash);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (actualCash < 0) {
      setError("El efectivo reportado no puede ser negativo");
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit({
        actual_cash: actualCash,
        notes: notes.trim() || undefined,
      });
      onOpenChange(false);
      setNotes("");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "No se pudo cerrar la sesión de caja";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const diff = actualCash - expectedCash;

  return (
    <Dialog open={open} onOpenChange={isSubmitting ? undefined : onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10">
              <Wallet className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <DialogTitle>Cerrar sesión (corte de caja)</DialogTitle>
              <DialogDescription>{sessionNumber}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div className="rounded-md border bg-muted/40 p-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Efectivo esperado</span>
            <span className="font-bold tabular-nums">
              {formatCurrency(expectedCash)}
            </span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="actual" className="text-sm font-medium">
              Efectivo contado (Q) <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                Q
              </span>
              <Input
                id="actual"
                type="number"
                min={0}
                step={0.01}
                value={actualCash || ""}
                onChange={(e) => setActualCash(Number(e.target.value) || 0)}
                className="pl-9 h-10"
                disabled={isSubmitting}
                autoFocus
              />
            </div>
          </div>

          <div
            className={`rounded-md border p-3 flex items-center justify-between ${
              Math.abs(diff) < 0.01
                ? "bg-emerald-500/10 border-emerald-500/30"
                : diff < 0
                ? "bg-red-500/10 border-red-500/30"
                : "bg-amber-500/10 border-amber-500/30"
            }`}
          >
            <span className="text-sm font-medium">Diferencia</span>
            <span
              className={`font-bold tabular-nums ${
                Math.abs(diff) < 0.01
                  ? "text-emerald-700"
                  : diff < 0
                  ? "text-red-700"
                  : "text-amber-700"
              }`}
            >
              {diff >= 0 ? "+" : ""}
              {formatCurrency(diff)}
            </span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Notas <span className="text-xs text-muted-foreground">(opcional)</span>
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="resize-none"
              disabled={isSubmitting}
              placeholder="Observaciones del cierre..."
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
            <Wallet className="mr-2 h-4 w-4" />
            Cerrar sesión
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
