"use client";

/**
 * Payments page
 *
 * The backend exposes payments as a sub-resource of invoices
 * (`GET /billing/invoices/:id/payments`) rather than a flat list. To build
 * a flat, paginated view we fan out from the case files in billable state
 * flows and aggregate their payments client-side.
 *
 * Direct deep-links (open an invoice → register payment → land here) are
 * still served by the invoice detail page; this is the overview.
 */

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CreditCard, Banknote, Building2, FileText, Wallet,
  Search, AlertTriangle, Eye, Calendar, DollarSign, RefreshCw,
} from "lucide-react";
import { useInvoices } from "@/hooks/billing-hooks/use-invoices";
import { paymentService } from "@/lib/api/services/billing-services/paymentService";
import {
  Payment,
  PaymentMethod,
  PAYMENT_METHOD_LABELS,
  PaymentStatus,
} from "@/lib/api/types/billing-types/billing.types";
import { ApiError } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

const METHOD_ICON: Record<PaymentMethod, React.ElementType> = {
  [PaymentMethod.CASH]: Banknote,
  [PaymentMethod.CARD_CREDIT]: CreditCard,
  [PaymentMethod.CARD_DEBIT]: CreditCard,
  [PaymentMethod.BANK_TRANSFER]: Building2,
  [PaymentMethod.CHECK]: FileText,
  [PaymentMethod.INSURANCE]: Wallet,
};

interface EnrichedPayment extends Payment {
  invoice_id: string;
  invoice_number: string;
  case_number?: string;
  patient_name?: string;
}

export default function PaymentsPage() {
  const router = useRouter();
  const { rows, isLoading: isLoadingInvoices, error: invoicesError } =
    useInvoices();

  const [payments, setPayments] = useState<EnrichedPayment[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);
  const [paymentsError, setPaymentsError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState<string>("all");

  // Resolve payments for every loaded invoice that has one.
  const loadPayments = async () => {
    const invoices = rows.filter((r) => r.invoice !== null);
    if (invoices.length === 0) {
      setPayments([]);
      return;
    }
    setIsLoadingPayments(true);
    setPaymentsError(null);
    try {
      const results = await Promise.allSettled(
        invoices.map(async (row) => {
          const resp = await paymentService.listByInvoice(row.invoice!.id);
          const list = (resp.data as unknown as Payment[]) ?? [];
          return list.map((p) => ({
            ...p,
            invoice_id: row.invoice!.id,
            invoice_number: row.invoice!.invoice_number,
            case_number: row.case.case_number,
            patient_name: row.invoice!.patient_name ?? row.case.patient_name,
          }));
        })
      );
      const merged: EnrichedPayment[] = [];
      results.forEach((r) => {
        if (r.status === "fulfilled") merged.push(...r.value);
      });
      // Sort by payment_date desc.
      merged.sort(
        (a, b) =>
          new Date(b.payment_date).getTime() -
          new Date(a.payment_date).getTime()
      );
      setPayments(merged);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Error al cargar los pagos";
      setPaymentsError(message);
    } finally {
      setIsLoadingPayments(false);
    }
  };

  useEffect(() => {
    loadPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  const enriched = useMemo(() => {
    return payments.filter((p) => p.status === PaymentStatus.CONFIRMED);
  }, [payments]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return enriched.filter((p) => {
      const matchesSearch =
        !q ||
        p.payment_number.toLowerCase().includes(q) ||
        (p.invoice_number ?? "").toLowerCase().includes(q) ||
        (p.case_number ?? "").toLowerCase().includes(q) ||
        (p.patient_name ?? "").toLowerCase().includes(q) ||
        (p.reference_number ?? "").toLowerCase().includes(q);
      const matchesMethod =
        methodFilter === "all" || p.payment_method === methodFilter;
      return matchesSearch && matchesMethod;
    });
  }, [enriched, search, methodFilter]);

  const stats = useMemo(() => {
    const total = enriched.reduce((acc, p) => acc + p.amount, 0);
    const today = new Date().toDateString();
    const todayList = enriched.filter(
      (p) => new Date(p.payment_date).toDateString() === today
    );
    const todayTotal = todayList.reduce((acc, p) => acc + p.amount, 0);
    return {
      count: enriched.length,
      total,
      todayCount: todayList.length,
      todayTotal,
    };
  }, [enriched]);

  const error = paymentsError ?? invoicesError;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Pagos</h1>
            <p className="text-muted-foreground">
              Registro de cobros a pacientes.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadPayments}
            disabled={isLoadingPayments}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoadingPayments ? "animate-spin" : ""}`}
            />
            Actualizar
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pagos registrados</p>
                <p className="text-2xl font-bold">{stats.count}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cobrado hoy</p>
                <p className="text-2xl font-bold text-emerald-700">
                  {formatCurrency(stats.todayTotal)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {stats.todayCount} pago(s)
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-chart-1/10">
                <Wallet className="h-6 w-6 text-chart-1" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total acumulado</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.total)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Historial de pagos</CardTitle>
                <CardDescription>
                  {isLoadingPayments || isLoadingInvoices
                    ? "Cargando pagos..."
                    : `${filtered.length} pago(s) encontrado(s)`}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por factura, paciente o referencia..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 sm:w-[300px]"
                  />
                </div>
                <Select value={methodFilter} onValueChange={setMethodFilter}>
                  <SelectTrigger className="w-[170px]">
                    <SelectValue placeholder="Método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {Object.values(PaymentMethod).map((m) => (
                      <SelectItem key={m} value={m}>
                        {PAYMENT_METHOD_LABELS[m]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingPayments || isLoadingInvoices ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <CreditCard className="mb-4 h-12 w-12 text-muted-foreground/40" />
                <p className="font-medium text-muted-foreground">
                  Aún no hay pagos registrados
                </p>
                <p className="text-sm text-muted-foreground">
                  Cuando registres un pago en una factura aparecerá aquí.
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {filtered.map((p) => {
                  const Icon = METHOD_ICON[p.payment_method] ?? CreditCard;
                  return (
                    <li
                      key={`${p.invoice_id}-${p.id}`}
                      className="flex items-center gap-4 rounded-lg border p-4 hover:bg-muted/30"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-700">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{p.patient_name ?? "—"}</span>
                          <Badge variant="outline">
                            {PAYMENT_METHOD_LABELS[p.payment_method]}
                          </Badge>
                          <Badge variant="secondary" className="font-mono text-xs">
                            {p.invoice_number}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-0.5 flex-wrap">
                          <span className="font-mono">{p.payment_number}</span>
                          {p.reference_number && (
                            <span>Ref: {p.reference_number}</span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(p.payment_date).toLocaleString("es-GT", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-bold text-emerald-700 tabular-nums">
                          {formatCurrency(p.amount)}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            router.push(`/billing/invoices/${p.invoice_id}`)
                          }
                          title="Ver factura"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
