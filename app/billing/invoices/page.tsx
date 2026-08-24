"use client";

import { useState, useMemo } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Search, Plus, FileText, DollarSign, Wallet, Receipt,
  Loader2, AlertTriangle, Eye, ArrowRight,
} from "lucide-react";
import { useInvoices } from "@/hooks/billing-hooks/use-invoices";
import {
  InvoiceStatus,
  INVOICE_STATUS_LABELS,
} from "@/lib/api/types/billing-types/billing.types";
import { InvoiceStatusBadge } from "@/components/billing/invoice-status-badge";
import { formatCurrency } from "@/lib/utils";

export default function InvoicesPage() {
  const router = useRouter();
  const { rows, isLoading, isResolving, error, clearError } = useInvoices();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const enrichedRows = useMemo(() => {
    return rows.map((row) => {
      const inv = row.invoice;
      return {
        ...row,
        status: (inv?.status ??
          (row.case.current_status_flow === "CC_CONFIRMACION_CARGOS"
            ? InvoiceStatus.CONFIRMED
            : InvoiceStatus.DRAFT)) as InvoiceStatus,
      };
    });
  }, [rows]);

  const filteredRows = useMemo(() => {
    const q = search.toLowerCase().trim();
    return enrichedRows.filter((r) => {
      const matchesSearch =
        !q ||
        r.case.case_number.toLowerCase().includes(q) ||
        r.case.patient_name.toLowerCase().includes(q) ||
        (r.invoice?.invoice_number ?? "").toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all" || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [enrichedRows, search, statusFilter]);

  const stats = useMemo(() => {
    const issued = enrichedRows.filter(
      (r) => r.invoice !== null && r.invoice.status !== InvoiceStatus.VOIDED
    );
    const paid = enrichedRows.filter(
      (r) => r.invoice?.status === InvoiceStatus.PAID
    );
    const pending = enrichedRows.filter(
      (r) =>
        r.invoice &&
        (r.invoice.status === InvoiceStatus.DRAFT ||
          r.invoice.status === InvoiceStatus.CONFIRMED ||
          r.invoice.status === InvoiceStatus.PARTIALLY_PAID)
    );
    const totalBilled = enrichedRows.reduce(
      (acc, r) => acc + (r.invoice?.total_amount ?? 0),
      0
    );
    const totalCollected = enrichedRows.reduce(
      (acc, r) => acc + (r.invoice?.amount_paid ?? 0),
      0
    );
    return {
      issued: issued.length,
      paid: paid.length,
      pending: pending.length,
      totalBilled,
      totalCollected,
    };
  }, [enrichedRows]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Facturas</h1>
            <p className="text-muted-foreground">
              Cuentas generadas desde los expedientes clínicos.
            </p>
          </div>
        </div>

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

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Facturas generadas",
              value: stats.issued,
              icon: FileText,
              iconColor: "text-primary",
              bg: "bg-primary/10",
            },
            {
              label: "Pagadas",
              value: stats.paid,
              icon: Receipt,
              iconColor: "text-emerald-600",
              bg: "bg-emerald-500/10",
            },
            {
              label: "Pendientes de cobro",
              value: stats.pending,
              icon: Wallet,
              iconColor: "text-amber-600",
              bg: "bg-amber-500/10",
            },
            {
              label: "Cobrado",
              value: formatCurrency(stats.totalCollected),
              sub: `de ${formatCurrency(stats.totalBilled)} facturado`,
              icon: DollarSign,
              iconColor: "text-emerald-600",
              bg: "bg-emerald-500/10",
              isText: true,
            },
          ].map(
            ({ label, value, sub, icon: Icon, iconColor, bg, isText }) => (
              <Card key={label}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${bg}`}
                  >
                    <Icon className={`h-6 w-6 ${iconColor}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p
                      className={`font-bold ${isText ? "text-lg" : "text-2xl"}`}
                    >
                      {value}
                    </p>
                    {sub && (
                      <p className="text-xs text-muted-foreground">{sub}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Expedientes listos para facturación</CardTitle>
                <CardDescription>
                  Expedientes en cargos / confirmación / cerrados.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar expediente o paciente..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 sm:w-[260px]"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {Object.values(InvoiceStatus).map((s) => (
                      <SelectItem key={s} value={s}>
                        {INVOICE_STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : filteredRows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <FileText className="mb-4 h-12 w-12 text-muted-foreground/40" />
                <p className="font-medium text-muted-foreground">
                  No hay expedientes pendientes de facturación
                </p>
                <p className="text-sm text-muted-foreground">
                  Cuando un expediente avance al estado de cargos aparecerá aquí.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No. Caso</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Factura</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRows.map((row) => {
                    const inv = row.invoice;
                    return (
                      <TableRow key={row.case.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          <Badge variant="outline" className="font-mono text-xs">
                            {row.case.case_number}
                          </Badge>
                        </TableCell>
                        <TableCell>{row.case.patient_name}</TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {row.case.admission_type_name ?? "—"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {inv ? (
                            <Badge variant="secondary" className="font-mono text-xs">
                              {inv.invoice_number}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Sin factura
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {inv ? (
                            <InvoiceStatusBadge status={inv.status} />
                          ) : (
                            <Badge variant="outline">Sin generar</Badge>
                          )}
                          {isResolving && (
                            <Loader2 className="ml-2 inline h-3 w-3 animate-spin text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium tabular-nums">
                          {inv ? formatCurrency(inv.total_amount) : "—"}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {inv ? (
                            <span
                              className={
                                inv.amount_pending > 0
                                  ? "text-destructive font-medium"
                                  : "text-muted-foreground"
                              }
                            >
                              {formatCurrency(inv.amount_pending)}
                            </span>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {inv ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                router.push(`/billing/invoices/${inv.id}`)
                              }
                              title="Ver factura"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                router.push(
                                  `/billing/invoices/new?case_file_id=${row.case.id}`
                                )
                              }
                            >
                              <Plus className="mr-1 h-3 w-3" />
                              Generar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
