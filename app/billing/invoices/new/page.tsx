"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft, Receipt, FileText, Loader2, AlertTriangle,
  ArrowRight, User, Calendar, Package,
} from "lucide-react";
import { useCaseFile } from "@/hooks/medical-hooks/use-casefile";
import { useCaseProducts } from "@/hooks/medical-hooks/use-case-products";
import { useInvoices } from "@/hooks/billing-hooks/use-invoices";
import { ApiError } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

export default function NewInvoicePage() {
  const router = useRouter();
  const params = useParams<{ case_file_id?: string }>();
  const searchParams =
    typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const caseFileId =
    params?.case_file_id ??
    searchParams?.get("case_file_id") ??
    null;

  const {
    selectedCaseFile,
    fetchCaseFileById,
    isLoading: isLoadingCase,
    error: caseError,
    clearError: clearCaseError,
  } = useCaseFile();
  const { billingSummary, isLoading: isLoadingSummary } =
    useCaseProducts(caseFileId);
  const { generateInvoice } = useInvoices();

  const [requiresTaxInvoice, setRequiresTaxInvoice] = useState(false);
  const [dueDate, setDueDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (caseFileId) fetchCaseFileById(caseFileId);
  }, [caseFileId, fetchCaseFileById]);

  const hasCharges = useMemo(() => {
    if (!billingSummary) return false;
    const b = billingSummary.breakdown;
    return (
      b.packages.items.length +
        b.rooms.items.length +
        b.services.items.length +
        b.products.items.length >
      0
    );
  }, [billingSummary]);

  if (!caseFileId) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Expediente requerido</AlertTitle>
            <AlertDescription>
              No se proporcionó un ID de expediente. Vuelve al listado y elige
              uno para facturar.
            </AlertDescription>
          </Alert>
          <Button
            variant="outline"
            onClick={() => router.push("/billing/invoices")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a facturas
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!hasCharges) {
      setError("El expediente no tiene cargos para facturar");
      return;
    }

    setIsSubmitting(true);
    try {
      const inv = await generateInvoice({
        case_file_id: caseFileId,
        requires_tax_invoice: requiresTaxInvoice,
        due_date: dueDate.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      router.push(`/billing/invoices/${inv.id}`);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "No se pudo generar la factura";
      setError(message);
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold tracking-tight">
              Generar factura
            </h1>
            <p className="text-muted-foreground">
              Toma un snapshot de los cargos del expediente y crea la cuenta de cobro.
            </p>
          </div>
        </div>

        {(caseError || error) && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="flex items-center justify-between gap-2">
              {error ?? caseError}
              <Button variant="ghost" size="sm" onClick={() => {
                setError(null);
                clearCaseError();
              }}>
                Cerrar
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 lg:grid-cols-3">
          {/* ── Resumen del expediente ──────────────────────────────── */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Receipt className="h-4 w-4" />
                Expediente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingCase ? (
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-40" />
                </div>
              ) : selectedCaseFile ? (
                <>
                  <div className="space-y-1.5">
                    <Badge variant="outline" className="font-mono text-xs">
                      {selectedCaseFile.case_number}
                    </Badge>
                    {selectedCaseFile.patient && (
                      <p className="flex items-center gap-1.5 text-sm">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        {selectedCaseFile.patient.first_name}{" "}
                        {selectedCaseFile.patient.last_name}
                      </p>
                    )}
                    <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(selectedCaseFile.admission_date).toLocaleDateString(
                        "es-GT"
                      )}
                    </p>
                  </div>
                  <div className="rounded-md border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">
                      Estado del expediente
                    </p>
                    <p className="font-medium">
                      {selectedCaseFile.current_status_flow}
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No se pudo cargar el expediente.
                </p>
              )}
            </CardContent>
          </Card>

          {/* ── Resumen de cargos ───────────────────────────────────── */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-4 w-4" />
                Cargos del expediente
              </CardTitle>
              <CardDescription>
                Snapshot que se copiará como invoice_items.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoadingSummary ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : billingSummary ? (
                <>
                  <BreakdownRow
                    label="Paquetes"
                    count={billingSummary.breakdown.packages.items.length}
                    subtotal={billingSummary.breakdown.packages.subtotal}
                  />
                  <BreakdownRow
                    label="Habitaciones"
                    count={billingSummary.breakdown.rooms.items.length}
                    subtotal={billingSummary.breakdown.rooms.subtotal}
                  />
                  <BreakdownRow
                    label="Servicios"
                    count={billingSummary.breakdown.services.items.length}
                    subtotal={billingSummary.breakdown.services.subtotal}
                  />
                  <BreakdownRow
                    label="Productos"
                    count={billingSummary.breakdown.products.items.length}
                    subtotal={billingSummary.breakdown.products.subtotal}
                  />
                  <div className="border-t pt-3 flex items-center justify-between">
                    <span className="font-semibold">Total a facturar</span>
                    <span className="text-xl font-bold tabular-nums">
                      {formatCurrency(billingSummary.total)}
                    </span>
                  </div>
                  {!hasCharges && (
                    <Alert variant="destructive">
                      <AlertDescription className="text-sm">
                        El expediente no tiene cargos registrados. Agrega
                        cargos antes de facturar.
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Sin resumen disponible.
                </p>
              )}
            </CardContent>
          </Card>

          {/* ── Form ───────────────────────────────────────────────── */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" />
                Configuración
              </CardTitle>
              <CardDescription>
                Datos opcionales para la factura.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerate} className="space-y-4">
                <label className="flex items-start gap-3 rounded-md border p-3 cursor-pointer">
                  <Switch
                    checked={requiresTaxInvoice}
                    onCheckedChange={setRequiresTaxInvoice}
                    disabled={isSubmitting}
                    className="mt-0.5"
                  />
                  <div className="text-sm">
                    <p className="font-medium">Solicita factura fiscal (FEL)</p>
                    <p className="text-xs text-muted-foreground">
                      El paciente quiere factura con NIT. Aún debe emitirse al
                      final del flujo.
                    </p>
                  </div>
                </label>

                <div className="space-y-2">
                  <Label htmlFor="dueDate" className="text-sm font-medium">
                    Fecha límite de pago{" "}
                    <span className="text-xs text-muted-foreground">(opcional)</span>
                  </Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="h-10"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-medium">
                    Notas{" "}
                    <span className="text-xs text-muted-foreground">(opcional)</span>
                  </Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="resize-none"
                    disabled={isSubmitting}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || !hasCharges || isLoadingSummary}
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="mr-2 h-4 w-4" />
                  )}
                  Generar factura
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

function BreakdownRow({
  label,
  count,
  subtotal,
}: {
  label: string;
  count: number;
  subtotal: number;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">
        {label} <span className="text-xs">({count})</span>
      </span>
      <span className="font-medium tabular-nums">
        {formatCurrency(subtotal)}
      </span>
    </div>
  );
}
