"use client";

import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  Search, Wallet, Lock, Plus, AlertTriangle, DollarSign, Tag,
  Receipt, User, Calendar, CreditCard, CircleDollarSign,
} from "lucide-react";
import { useCashSession } from "@/hooks/billing-hooks/use-cash-session";
import { usePendingInvoices } from "@/hooks/billing-hooks/use-pending-invoices";
import { useInvoice } from "@/hooks/billing-hooks/use-invoice";
import { useAuth } from "@/hooks/auth-hooks/use-auth";
import {
  InvoiceStatus, CashSessionStatus, Payment,
} from "@/lib/api/types/billing-types/billing.types";
import { InvoiceStatusBadge } from "@/components/billing/invoice-status-badge";
import { InvoiceTotalsCard } from "@/components/billing/invoice-totals-card";
import { InvoiceItemsTable } from "@/components/billing/invoice-items-table";
import { InvoiceDiscountsList } from "@/components/billing/invoice-discounts-list";
import { InvoicePaymentsList } from "@/components/billing/invoice-payments-list";
import { ApplyDiscountDialog } from "@/components/billing/apply-discount-dialog";
import { RegisterPaymentDialog } from "@/components/billing/register-payment-dialog";
import { ReasonDialog } from "@/components/billing/reason-dialog";
import {
  OpenCashSessionDialog, CloseCashSessionDialog,
} from "@/components/billing/cash-session-dialogs";
import { formatCurrency } from "@/lib/utils";

const CASHIER_ROLES = new Set(["billing_staff", "admin", "super_admin"]);
const APPROVER_ROLES = new Set(["admin", "super_admin"]);

export default function CajaPage() {
  const { user } = useAuth();
  const isCashier = !!user && CASHIER_ROLES.has(user.role);
  const isApprover = !!user && APPROVER_ROLES.has(user.role);

  const {
    mySession, isLoadingMine, isMutating: isMutatingSession,
    openSession, closeSession, fetchMySession,
  } = useCashSession();

  const {
    invoices, isLoading, error, fetchPending, refresh, clearError,
  } = usePendingInvoices();

  const [search, setSearch] = useState("");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [isOpenSessionDialogOpen, setIsOpenSessionDialogOpen] = useState(false);
  const [isCloseSessionDialogOpen, setIsCloseSessionDialogOpen] = useState(false);
  const [isDiscountOpen, setIsDiscountOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentToVoid, setPaymentToVoid] = useState<Payment | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    invoice, isLoading: isLoadingInvoice, isMutating: isMutatingInvoice,
    error: invoiceError, applyDiscount, approveDiscount, recordPayment, voidPayment,
    clearError: clearInvoiceError,
  } = useInvoice(selectedInvoiceId);

  const filteredInvoices = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return invoices;
    return invoices.filter((inv) =>
      inv.invoice_number.toLowerCase().includes(q) ||
      (inv.case_number ?? "").toLowerCase().includes(q) ||
      (inv.patient_name ?? "").toLowerCase().includes(q)
    );
  }, [invoices, search]);

  const pendingDiscounts = useMemo(
    () => (invoice?.discounts ?? []).filter((d) => d.requires_approval && !d.approved_by),
    [invoice]
  );

  const flash = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const afterMutation = async () => {
    await refresh();
  };

  const canApplyDiscount =
    !!invoice &&
    (invoice.status === InvoiceStatus.CONFIRMED || invoice.status === InvoiceStatus.PARTIALLY_PAID);
  const canReceivePayment = canApplyDiscount;
  const canVoidPayment = invoice?.status === InvoiceStatus.PARTIALLY_PAID || invoice?.status === InvoiceStatus.PAID;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Caja de Cobro</h1>
          <p className="text-muted-foreground">
            Facturas confirmadas listas para cobrar.
          </p>
        </div>

        {/* ── Sesión de caja ────────────────────────────────────────── */}
        <Card>
          <CardContent className="p-4">
            {isLoadingMine ? (
              <Skeleton className="h-12 w-full" />
            ) : mySession && mySession.status === CashSessionStatus.OPEN ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                    <Wallet className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs">{mySession.session_number}</Badge>
                      <Badge className="bg-emerald-100 text-emerald-800">Abierta</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Inicial {formatCurrency(mySession.initial_cash)} · Cobrado{" "}
                      <span className="font-medium text-emerald-700">{formatCurrency(mySession.total_collected)}</span>
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCloseSessionDialogOpen(true)}
                  disabled={isMutatingSession}
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Cerrar sesión
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">No tienes una sesión de caja abierta</p>
                  <p className="text-sm text-muted-foreground">
                    Necesitas abrirla para poder cobrar en efectivo.
                  </p>
                </div>
                <Button onClick={() => setIsOpenSessionDialogOpen(true)} disabled={isMutatingSession || !isCashier}>
                  <Plus className="mr-2 h-4 w-4" />
                  Abrir sesión de caja
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="flex items-center justify-between gap-2">
              {error}
              <Button variant="ghost" size="sm" onClick={clearError}>Cerrar</Button>
            </AlertDescription>
          </Alert>
        )}

        {successMsg && (
          <Alert className="bg-emerald-500/10 border-emerald-500/30">
            <AlertDescription className="text-emerald-700 font-medium">{successMsg}</AlertDescription>
          </Alert>
        )}

        {/* ── Pendientes de cobro ───────────────────────────────────── */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Pendientes de cobro</CardTitle>
                <CardDescription>Facturas confirmadas o con saldo pendiente.</CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar factura, expediente o paciente..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    fetchPending(e.target.value || undefined);
                  }}
                  className="pl-9 sm:w-[280px]"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <CircleDollarSign className="mb-4 h-12 w-12 text-muted-foreground/40" />
                <p className="font-medium text-muted-foreground">No hay facturas pendientes de cobro</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Factura</TableHead>
                    <TableHead>No. Caso</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((inv) => (
                    <TableRow key={inv.id} className="hover:bg-muted/50">
                      <TableCell>
                        <Badge variant="secondary" className="font-mono text-xs">{inv.invoice_number}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">{inv.case_number ?? "—"}</Badge>
                      </TableCell>
                      <TableCell>{inv.patient_name ?? "—"}</TableCell>
                      <TableCell><InvoiceStatusBadge status={inv.status} /></TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {formatCurrency(inv.total_amount)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-destructive font-medium">
                        {formatCurrency(inv.amount_pending)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" onClick={() => setSelectedInvoiceId(inv.id)} className="bg-emerald-600 hover:bg-emerald-700">
                          <DollarSign className="mr-1.5 h-3.5 w-3.5" />
                          Cobrar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ═══ Panel de cobro ═══════════════════════════════════════════ */}
      <Sheet open={!!selectedInvoiceId} onOpenChange={(open) => !open && setSelectedInvoiceId(null)}>
        <SheetContent side="right" className="sm:max-w-xl p-0 gap-0 overflow-y-auto">
          <SheetHeader className="px-6 pt-6 pb-4 border-b gap-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                <CreditCard className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <SheetTitle className="flex items-center gap-2">
                  {invoice?.invoice_number ?? "Cobro"}
                  {invoice && <InvoiceStatusBadge status={invoice.status} />}
                </SheetTitle>
                <SheetDescription className="flex items-center gap-3 flex-wrap pt-0.5">
                  {invoice?.case_number && (
                    <span className="flex items-center gap-1 text-xs"><Receipt className="h-3 w-3" />{invoice.case_number}</span>
                  )}
                  {invoice?.patient_name && (
                    <span className="flex items-center gap-1 text-xs"><User className="h-3 w-3" />{invoice.patient_name}</span>
                  )}
                  {invoice && (
                    <span className="flex items-center gap-1 text-xs"><Calendar className="h-3 w-3" />{new Date(invoice.created_at).toLocaleDateString("es-GT")}</span>
                  )}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="p-6 space-y-5">
            {invoiceError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between gap-2">
                  {invoiceError}
                  <Button variant="ghost" size="sm" onClick={clearInvoiceError}>Cerrar</Button>
                </AlertDescription>
              </Alert>
            )}

            {pendingDiscounts.length > 0 && (
              <Alert className="bg-amber-500/10 border-amber-500/30">
                <AlertTriangle className="h-4 w-4 text-amber-700" />
                <AlertTitle className="text-amber-800">Descuento pendiente de aprobación</AlertTitle>
                <AlertDescription className="text-amber-800">
                  Hay {pendingDiscounts.length} descuento(s) esperando autorización.
                </AlertDescription>
              </Alert>
            )}

            {isLoadingInvoice || !invoice ? (
              <div className="space-y-3">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : (
              <>
                <InvoiceTotalsCard invoice={invoice} />

                <div className="flex flex-wrap gap-2">
                  {canApplyDiscount && isCashier && (
                    <Button variant="outline" size="sm" onClick={() => setIsDiscountOpen(true)} disabled={isMutatingInvoice}>
                      <Tag className="mr-2 h-4 w-4" />
                      Aplicar descuento
                    </Button>
                  )}
                  {canReceivePayment && (
                    <Button size="sm" onClick={() => setIsPaymentOpen(true)} disabled={isMutatingInvoice} className="bg-emerald-600 hover:bg-emerald-700">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Registrar pago
                    </Button>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-2">Cargos</h3>
                  <InvoiceItemsTable items={invoice.items} />
                </div>

                {(invoice.discounts?.length ?? 0) > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Descuentos</h3>
                    <InvoiceDiscountsList
                      discounts={invoice.discounts}
                      canManage={isApprover}
                      onApprove={async (d) => {
                        try {
                          await approveDiscount(d.id);
                          flash("Descuento aprobado");
                          await afterMutation();
                        } catch { /* error already in hook */ }
                      }}
                    />
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-semibold mb-2">Pagos</h3>
                  <InvoicePaymentsList
                    payments={invoice.payments}
                    canVoid={!!canVoidPayment && invoice.status !== InvoiceStatus.PAID && isCashier}
                    onVoid={(p) => setPaymentToVoid(p)}
                  />
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* ═══ Diálogos ═══════════════════════════════════════════════ */}
      {invoice && (
        <>
          <ApplyDiscountDialog
            open={isDiscountOpen}
            onOpenChange={setIsDiscountOpen}
            onSubmit={async (data) => {
              const result = await applyDiscount(data);
              flash(result.message);
              await afterMutation();
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
              flash("Pago registrado");
              await afterMutation();
              await fetchMySession();
            }}
            amountPending={invoice.amount_pending}
            patientName={invoice.patient_name}
            invoiceNumber={invoice.invoice_number}
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
                flash("Pago anulado");
                setPaymentToVoid(null);
                await afterMutation();
                await fetchMySession();
              }}
            />
          )}
        </>
      )}

      <OpenCashSessionDialog
        open={isOpenSessionDialogOpen}
        onOpenChange={setIsOpenSessionDialogOpen}
        onSubmit={async ({ initial_cash, notes }) => {
          await openSession({ initial_cash, ...(notes && { notes }) });
          flash("Sesión de caja abierta");
        }}
      />

      {mySession && (
        <CloseCashSessionDialog
          open={isCloseSessionDialogOpen}
          onOpenChange={setIsCloseSessionDialogOpen}
          onSubmit={async ({ actual_cash, notes }) => {
            await closeSession(mySession.id, { actual_cash, ...(notes && { notes }) });
            flash("Sesión cerrada (corte realizado)");
          }}
          sessionNumber={mySession.session_number}
          expectedCash={mySession.initial_cash + mySession.total_collected}
        />
      )}
    </DashboardLayout>
  );
}
