"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft, Plus, AlertTriangle, Receipt, Package, Wallet,
  Ban, Loader2, User, Calendar, FileText,
} from "lucide-react";
import { useCaseFile } from "@/hooks/medical-hooks/use-casefile";
import { useCaseProducts } from "@/hooks/medical-hooks/use-case-products";
import { ChargesTable } from "@/components/medical/charges/charges-table";
import { ApplyProductForm } from "@/components/medical/charges/apply-product-form";
import { BillingSummaryCard } from "@/components/medical/charges/billing-summary-card";
import { ApiError } from "@/lib/api/config";
import { CaseProduct } from "@/lib/api/types/medical-types/case-product.types";

const currency = new Intl.NumberFormat("es-GT", {
  style: "currency",
  currency: "GTQ",
  minimumFractionDigits: 2,
});

export default function CargosPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const caseFileId = params?.id ?? null;

  const {
    selectedCaseFile,
    fetchCaseFileById,
    isLoading: isLoadingCase,
  } = useCaseFile();
  const {
    caseProducts, billingSummary,
    isLoading, isMutating, error,
    refresh, applyProduct, voidProduct, clearError,
  } = useCaseProducts(caseFileId);

  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [chargeToVoid, setChargeToVoid] = useState<CaseProduct | null>(null);
  const [voidReason, setVoidReason] = useState("");
  const [voidError, setVoidError] = useState<string | null>(null);
  const [isVoidingLocal, setIsVoidingLocal] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (caseFileId) fetchCaseFileById(caseFileId);
  }, [caseFileId, fetchCaseFileById]);

  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccessMsg(null), 3000);
    return () => clearTimeout(t);
  }, [successMsg]);

  const totals = useMemo(() => {
    const active = caseProducts.filter(c => !c.is_voided);
    const subtotal = active.reduce((s, c) => s + c.total_price, 0);
    const voided = caseProducts.filter(c => c.is_voided).length;
    return { activeCount: active.length, subtotal, voided };
  }, [caseProducts]);

  if (!caseFileId) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Expediente no especificado</AlertTitle>
            <AlertDescription>
              No se proporcionó un ID de expediente válido.
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  const handleApply = async (data: Parameters<typeof applyProduct>[0]) => {
    await applyProduct(data);
    setSuccessMsg("Cargo registrado correctamente");
    setIsApplyOpen(false);
  };

  const handleConfirmVoid = async () => {
    if (!chargeToVoid) return;
    if (!voidReason.trim()) {
      setVoidError("Indica el motivo de la anulación");
      return;
    }
    setIsVoidingLocal(true);
    setVoidError(null);
    try {
      await voidProduct(chargeToVoid.id, { void_reason: voidReason.trim() });
      setSuccessMsg("Cargo anulado correctamente");
      setChargeToVoid(null);
      setVoidReason("");
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "No se pudo anular el cargo";
      setVoidError(message);
    } finally {
      setIsVoidingLocal(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/medical/case-files")}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight">Cargos del Expediente</h1>
              {isLoadingCase ? (
                <Skeleton className="h-5 w-24" />
              ) : selectedCaseFile ? (
                <Badge variant="outline" className="font-mono text-xs">
                  {selectedCaseFile.case_number}
                </Badge>
              ) : null}
            </div>

            <div className="text-muted-foreground mt-1 text-sm">
              {isLoadingCase ? (
                <Skeleton className="h-4 w-64 mt-1" />
              ) : selectedCaseFile ? (
                <span className="flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    {selectedCaseFile.patient
                      ? `${selectedCaseFile.patient.first_name} ${selectedCaseFile.patient.last_name}`
                      : "—"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {selectedCaseFile.admission_date
                      ? new Date(selectedCaseFile.admission_date).toLocaleDateString("es-GT")
                      : "—"}
                  </span>
                </span>
              ) : (
                "Gestión de cargos (productos) aplicados al expediente"
              )}
            </div>
          </div>

          <Button
            onClick={() => setIsApplyOpen(true)}
            disabled={isMutating}
            className="shrink-0"
          >
            <Plus className="mr-2 h-4 w-4" />
            Agregar Cargo
          </Button>
        </div>

        {/* ── Alerts ─────────────────────────────────────────────────── */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="flex items-center justify-between gap-2">
              {error}
              <Button variant="ghost" size="sm" onClick={clearError}>
                Cerrar
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {successMsg && (
          <Alert className="bg-success/10 border-success/30">
            <Plus className="h-4 w-4 text-success" />
            <AlertDescription className="text-success font-medium">
              {successMsg}
            </AlertDescription>
          </Alert>
        )}

        {/* ── Stat strip ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cargos activos</p>
                <p className="text-xl font-bold tabular-nums">{totals.activeCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                <Ban className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Anulados</p>
                <p className="text-xl font-bold tabular-nums">{totals.voided}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-2">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/10">
                <Wallet className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Subtotal de cargos (productos)</p>
                <p className="text-xl font-bold tabular-nums text-success">
                  {currency.format(totals.subtotal)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Tabs ───────────────────────────────────────────────────── */}
        <Tabs defaultValue="charges" className="space-y-4">
          <TabsList>
            <TabsTrigger value="charges" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Cargos aplicados
            </TabsTrigger>
            <TabsTrigger value="summary" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Resumen de cuenta
            </TabsTrigger>
          </TabsList>

          <TabsContent value="charges">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Cargos registrados
                </CardTitle>
                <CardDescription>
                  Lista completa de productos aplicados. Los anulados se conservan para trazabilidad.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6">
                <ChargesTable
                  charges={caseProducts}
                  isLoading={isLoading}
                  isVoiding={isVoidingLocal || isMutating}
                  onVoid={charge => {
                    setChargeToVoid(charge);
                    setVoidReason("");
                    setVoidError(null);
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary">
            <BillingSummaryCard summary={billingSummary} isLoading={isLoading} />
          </TabsContent>
        </Tabs>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          Sheet: AGREGAR CARGO (drawer lateral)
      ═══════════════════════════════════════════════════════════════════ */}
      <Sheet open={isApplyOpen} onOpenChange={open => !isMutating && setIsApplyOpen(open)}>
        <SheetContent side="right" className="sm:max-w-md p-0 gap-0 overflow-hidden flex flex-col">
          <SheetHeader className="px-6 pt-6 pb-4 border-b gap-3">
            <div className="flex items-center gap-3 pr-8">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <SheetTitle>Registrar Cargo</SheetTitle>
                <SheetDescription className="flex items-center gap-2 pt-0.5">
                  {selectedCaseFile && (
                    <>
                      <span className="font-mono text-xs">{selectedCaseFile.case_number}</span>
                      <span>·</span>
                      <span className="font-medium text-xs truncate">
                        {selectedCaseFile.patient
                          ? `${selectedCaseFile.patient.first_name} ${selectedCaseFile.patient.last_name}`
                          : ""}
                      </span>
                    </>
                  )}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            <ApplyProductForm
              onSubmit={handleApply}
              onCancel={() => setIsApplyOpen(false)}
              isSubmitting={isMutating}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* ═══════════════════════════════════════════════════════════════════
          Dialog: ANULAR CARGO
      ═══════════════════════════════════════════════════════════════════ */}
      <Dialog
        open={!!chargeToVoid}
        onOpenChange={open => !isVoidingLocal && !open && setChargeToVoid(null)}
      >
        <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                <Ban className="h-5 w-5 text-destructive" />
              </div>
              <div className="min-w-0">
                <DialogTitle>Anular Cargo</DialogTitle>
                <p className="text-sm text-muted-foreground pt-0.5">
                  Esta acción no se puede revertir.
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 px-6 py-5">
            {chargeToVoid && (
              <div className="rounded-md border bg-muted/30 p-3 text-sm space-y-1">
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Producto:</span>
                  <span className="font-medium">{chargeToVoid.product_name}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Cantidad:</span>
                  <span className="font-medium tabular-nums">
                    {chargeToVoid.quantity} {chargeToVoid.unit_of_measure}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-semibold tabular-nums">
                    {currency.format(chargeToVoid.total_price)}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="void-reason" className="text-sm font-medium">
                Motivo de la anulación <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="void-reason"
                placeholder="Describe por qué se anula este cargo..."
                value={voidReason}
                onChange={e => setVoidReason(e.target.value)}
                rows={3}
                className="resize-none"
                autoFocus
              />
            </div>

            {voidError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{voidError}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter className="px-6 pb-6 pt-4 border-t gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setChargeToVoid(null)}
              disabled={isVoidingLocal}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmVoid}
              disabled={isVoidingLocal}
              className="flex-1"
            >
              {isVoidingLocal ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Ban className="mr-2 h-4 w-4" />
              )}
              Confirmar Anulación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
