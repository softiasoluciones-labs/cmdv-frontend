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
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  RefreshCw,
  Tag,
  DollarSign,
  ClipboardCheck,
  Ban,
  FileText,
  AlertTriangle,
  Receipt,
  User,
  Calendar,
  Loader2,
  Printer,
} from "lucide-react";
import { useInvoice } from "@/hooks/billing-hooks/use-invoice";
import {
  InvoiceStatus,
  Payment,
  InvoiceDiscount,
} from "@/lib/api/types/billing-types/billing.types";
import { InvoiceStatusBadge } from "@/components/billing/invoice-status-badge";
import { InvoiceItemsTable } from "@/components/billing/invoice-items-table";
import { InvoiceTotalsCard } from "@/components/billing/invoice-totals-card";
import { InvoicePaymentsList } from "@/components/billing/invoice-payments-list";
import { InvoiceDiscountsList } from "@/components/billing/invoice-discounts-list";
import { ApplyDiscountDialog } from "@/components/billing/apply-discount-dialog";
import { RegisterPaymentDialog } from "@/components/billing/register-payment-dialog";
import { ConfirmInvoiceDialog } from "@/components/billing/confirm-invoice-dialog";
import { TaxInvoiceDialog } from "@/components/billing/tax-invoice-dialog";
import { ReasonDialog } from "@/components/billing/reason-dialog";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? null;

  const {
    invoice,
    isLoading,
    isMutating,
    error,
    fetchInvoice,
    confirm,
    voidInvoice,
    applyDiscount,
    approveDiscount,
    removeDiscount,
    recordPayment,
    voidPayment,
    createTaxInvoice,
    clearError,
  } = useInvoice(id);

  const [isDiscountOpen, setIsDiscountOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isVoidOpen, setIsVoidOpen] = useState(false);
  const [isTaxInvoiceOpen, setIsTaxInvoiceOpen] = useState(false);
  const [paymentToVoid, setPaymentToVoid] = useState<Payment | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccessMsg(null), 3000);
    return () => clearTimeout(t);
  }, [successMsg]);

  const pendingDiscounts = useMemo(
    () =>
      (invoice?.discounts ?? []).filter(
        (d) => d.requires_approval && !d.approved_by
      ),
    [invoice]
  );

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!invoice) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Factura no encontrada</AlertTitle>
            <AlertDescription>
              {error ?? "No se pudo cargar la factura solicitada."}
            </AlertDescription>
          </Alert>
          <Button
            variant="outline"
            onClick={() => router.push("/billing/invoices")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const canConfirm = invoice.status === InvoiceStatus.DRAFT;
  const canVoid =
    invoice.status !== InvoiceStatus.VOIDED &&
    invoice.status !== InvoiceStatus.PAID;
  const canApplyDiscount =
    invoice.status === InvoiceStatus.DRAFT ||
    invoice.status === InvoiceStatus.CONFIRMED;
  const canReceivePayment =
    invoice.status === InvoiceStatus.CONFIRMED ||
    invoice.status === InvoiceStatus.PARTIALLY_PAID;
  const canRequestFel =
    (invoice.status === InvoiceStatus.CONFIRMED ||
      invoice.status === InvoiceStatus.PARTIALLY_PAID ||
      invoice.status === InvoiceStatus.PAID) &&
    !invoice.tax_invoice;
  const canVoidPayment =
    invoice.status === InvoiceStatus.PARTIALLY_PAID ||
    invoice.status === InvoiceStatus.PAID;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ── Header ────────────────────────────────────────────────── */}
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/billing/invoices")}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight">
                {invoice.invoice_number}
              </h1>
              <InvoiceStatusBadge status={invoice.status} />
              {invoice.requires_tax_invoice && (
                <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                  Solicita FEL
                </Badge>
              )}
            </div>
            <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
              {invoice.case_number && (
                <span className="flex items-center gap-1.5">
                  <Receipt className="h-3.5 w-3.5" />
                  {invoice.case_number}
                </span>
              )}
              {invoice.patient_name && (
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  {invoice.patient_name}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(invoice.created_at)}
              </span>
            </div>
          </div>
          <div className="flex gap-2 shrink-0 flex-wrap justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchInvoice}
              disabled={isMutating}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualizar
            </Button>
            <Button variant="outline" size="sm" disabled>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
          </div>
        </div>

        {/* ── Alerts ────────────────────────────────────────────────── */}
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
          <Alert className="bg-emerald-500/10 border-emerald-500/30">
            <AlertDescription className="text-emerald-700 font-medium">
              {successMsg}
            </AlertDescription>
          </Alert>
        )}

        {pendingDiscounts.length > 0 && (
          <Alert className="bg-amber-500/10 border-amber-500/30">
            <AlertTriangle className="h-4 w-4 text-amber-700" />
            <AlertTitle className="text-amber-800">
              Descuentos pendientes de aprobación
            </AlertTitle>
            <AlertDescription className="text-amber-800">
              Hay {pendingDiscounts.length} descuento(s) esperando aprobación
              administrativa. La factura no puede confirmarse hasta resolverlos.
            </AlertDescription>
          </Alert>
        )}

        {/* ── Action bar ────────────────────────────────────────────── */}
        <Card>
          <CardContent className="flex flex-wrap gap-2 p-4">
            {canConfirm && (
              <Button
                onClick={() => setIsConfirmOpen(true)}
                disabled={isMutating || pendingDiscounts.length > 0}
              >
                <ClipboardCheck className="mr-2 h-4 w-4" />
                Confirmar factura
              </Button>
            )}
            {canApplyDiscount && (
              <Button
                variant="outline"
                onClick={() => setIsDiscountOpen(true)}
                disabled={isMutating}
              >
                <Tag className="mr-2 h-4 w-4" />
                Aplicar descuento
              </Button>
            )}
            {canRequestFel && (
              <Button
                variant="outline"
                onClick={() => setIsTaxInvoiceOpen(true)}
                disabled={isMutating}
              >
                <FileText className="mr-2 h-4 w-4" />
                Solicitar FEL
              </Button>
            )}
            {canReceivePayment && (
              <Button
                onClick={() => setIsPaymentOpen(true)}
                disabled={isMutating}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Registrar pago
              </Button>
            )}
            {canVoid && (
              <Button
                variant="outline"
                onClick={() => setIsVoidOpen(true)}
                disabled={isMutating}
                className="text-destructive border-destructive/40 hover:bg-destructive/10 ml-auto"
              >
                <Ban className="mr-2 h-4 w-4" />
                Anular factura
              </Button>
            )}
          </CardContent>
        </Card>

        {/* ── Tabs ──────────────────────────────────────────────────── */}
        <Tabs defaultValue="items" className="space-y-4">
          <TabsList>
            <TabsTrigger value="items" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Cargos
              {invoice.items && invoice.items.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {invoice.items.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="discounts" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Descuentos
              {invoice.discounts && invoice.discounts.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {invoice.discounts.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Pagos
              {invoice.payments && invoice.payments.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {invoice.payments.length}
                </Badge>
              )}
            </TabsTrigger>
            {invoice.tax_invoice && (
              <TabsTrigger value="fel" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                FEL
              </TabsTrigger>
            )}
          </TabsList>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <TabsContent value="items" className="mt-0">
                <InvoiceItemsTable items={invoice.items} />
              </TabsContent>
              <TabsContent value="discounts" className="mt-0">
                <InvoiceDiscountsList
                  discounts={invoice.discounts}
                  canManage={canApplyDiscount}
                  onApprove={async (d) => {
                    try {
                      await approveDiscount(d.id);
                      setSuccessMsg("Descuento aprobado");
                    } catch {
                      /* error already in hook */
                    }
                  }}
                  onRemove={async (d) => {
                    try {
                      await removeDiscount(d.id);
                      setSuccessMsg("Descuento eliminado");
                    } catch {
                      /* error already in hook */
                    }
                  }}
                />
              </TabsContent>
              <TabsContent value="payments" className="mt-0">
                <InvoicePaymentsList
                  payments={invoice.payments}
                  canVoid={canVoidPayment && invoice.status !== InvoiceStatus.PAID}
                  onVoid={(p) => setPaymentToVoid(p)}
                />
              </TabsContent>
              {invoice.tax_invoice && (
                <TabsContent value="fel" className="mt-0">
                  <FelCard invoice={invoice} />
                </TabsContent>
              )}
            </div>
            <div>
              <InvoiceTotalsCard invoice={invoice} />
            </div>
          </div>
        </Tabs>
      </div>

      {/* ── Dialogs ──────────────────────────────────────────────────── */}
      <ConfirmInvoiceDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        onSubmit={async (data) => {
          await confirm(data);
          setSuccessMsg("Factura confirmada");
        }}
        invoiceNumber={invoice.invoice_number}
        hasPendingDiscounts={pendingDiscounts.length > 0}
      />

      <ApplyDiscountDialog
        open={isDiscountOpen}
        onOpenChange={setIsDiscountOpen}
        onSubmit={async (data) => {
          const result = await applyDiscount(data);
          setSuccessMsg(result.message);
          return result;
        }}
        invoiceSubtotal={invoice.subtotal}
        invoiceTotal={invoice.total_amount}
      />

      <RegisterPaymentDialog
        open={isPaymentOpen}
        onOpenChange={setIsPaymentOpen}
        onSubmit={async (data) => {
          await recordPayment(data);
          setSuccessMsg("Pago registrado");
        }}
        amountPending={invoice.amount_pending}
        patientName={invoice.patient_name}
        invoiceNumber={invoice.invoice_number}
      />

      <ReasonDialog
        open={isVoidOpen}
        onOpenChange={setIsVoidOpen}
        title="Anular factura"
        description={invoice.invoice_number}
        label="Motivo de anulación"
        placeholder="Describe por qué se anula esta factura..."
        onSubmit={async (reason) => {
          await voidInvoice({ reason });
          setSuccessMsg("Factura anulada");
        }}
      />

      {paymentToVoid && (
        <ReasonDialog
          open={!!paymentToVoid}
          onOpenChange={(o) => !o && setPaymentToVoid(null)}
          title="Anular pago"
          description={`${paymentToVoid.payment_number} · ${formatCurrency(paymentToVoid.amount)}`}
          label="Motivo de anulación"
          placeholder="Describe por qué se anula este pago..."
          onSubmit={async (reason) => {
            await voidPayment(paymentToVoid.id, { void_reason: reason });
            setSuccessMsg("Pago anulado");
            setPaymentToVoid(null);
          }}
        />
      )}

      <TaxInvoiceDialog
        open={isTaxInvoiceOpen}
        onOpenChange={setIsTaxInvoiceOpen}
        onSubmit={async (data) => {
          await createTaxInvoice(data);
          setSuccessMsg("Factura fiscal registrada (pendiente SAT)");
        }}
        invoiceNumber={invoice.invoice_number}
      />
    </DashboardLayout>
  );
}

function FelCard({
  invoice,
}: {
  invoice: NonNullable<ReturnType<typeof useInvoice>["invoice"]>;
}) {
  const fel = invoice.tax_invoice;
  if (!fel) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-4 w-4" />
          Factura fiscal (FEL)
        </CardTitle>
        <CardDescription>
          Registro en espera de certificación SAT.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Row label="NIT" value={fel.nit} />
        <Row label="Razón social" value={fel.tax_name} />
        <Row label="Tipo de documento" value={fel.document_type} />
        <Row
          label="Estado FEL"
          value={fel.fel_status.toUpperCase()}
          badge
        />
        {fel.fel_uuid && <Row label="UUID" value={fel.fel_uuid} mono />}
        {fel.fel_series && <Row label="Serie" value={fel.fel_series} />}
        {fel.fel_number && <Row label="Número" value={fel.fel_number} />}
      </CardContent>
    </Card>
  );
}

function Row({
  label,
  value,
  badge,
  mono,
}: {
  label: string;
  value: string;
  badge?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      {badge ? (
        <Badge variant="outline">{value}</Badge>
      ) : (
        <span className={mono ? "font-mono text-xs" : "font-medium"}>
          {value}
        </span>
      )}
    </div>
  );
}
