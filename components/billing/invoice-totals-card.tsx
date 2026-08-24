"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Wallet, Receipt } from "lucide-react";
import { Invoice } from "@/lib/api/types/billing-types/billing.types";
import { formatCurrency } from "@/lib/utils";

interface InvoiceTotalsCardProps {
  invoice: Invoice;
}

export function InvoiceTotalsCard({ invoice }: InvoiceTotalsCardProps) {
  const remaining = Math.max(invoice.amount_pending, 0);
  const progress = invoice.total_amount
    ? Math.min(100, (invoice.amount_paid / invoice.total_amount) * 100)
    : 0;

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center gap-2">
          <Receipt className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Resumen de la cuenta
          </h3>
        </div>

        <div className="space-y-2 text-sm">
          <Row label="Subtotal" value={invoice.subtotal} />
          {invoice.discount_total > 0 && (
            <Row
              label="Descuentos"
              value={-invoice.discount_total}
              className="text-emerald-600"
            />
          )}
          {invoice.taxable_amount > 0 && (
            <Row label="Base imponible" value={invoice.taxable_amount} />
          )}
          {invoice.iva_amount > 0 && (
            <Row label="IVA (12%)" value={invoice.iva_amount} />
          )}
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <span className="text-base font-semibold">Total</span>
          <span className="text-xl font-bold tabular-nums">
            {formatCurrency(invoice.total_amount)}
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Pagado</span>
            <span className="font-medium text-emerald-600 tabular-nums">
              {formatCurrency(invoice.amount_paid)}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Saldo pendiente</span>
            <span
              className={`font-semibold tabular-nums ${
                remaining > 0 ? "text-destructive" : "text-muted-foreground"
              }`}
            >
              {formatCurrency(remaining)}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-md bg-primary/5 p-3">
          <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-xs text-muted-foreground">
            Los servicios hospitalarios están <strong>exentos de IVA</strong>{" "}
            (Decreto 27-92, Artículo 7).
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function Row({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`tabular-nums ${className ?? ""}`}>
        {value < 0 ? `-${formatCurrency(Math.abs(value))}` : formatCurrency(value)}
      </span>
    </div>
  );
}
