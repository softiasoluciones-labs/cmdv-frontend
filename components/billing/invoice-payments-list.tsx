"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CreditCard, Banknote, Building2, FileText, Wallet, Ban,
} from "lucide-react";
import {
  Payment,
  PaymentMethod,
  PAYMENT_METHOD_LABELS,
  PaymentStatus,
} from "@/lib/api/types/billing-types/billing.types";
import { formatCurrency } from "@/lib/utils";

interface InvoicePaymentsListProps {
  payments: Payment[] | undefined;
  isLoading?: boolean;
  canVoid?: boolean;
  onVoid?: (payment: Payment) => void;
}

const METHOD_ICON: Record<PaymentMethod, React.ElementType> = {
  [PaymentMethod.CASH]: Banknote,
  [PaymentMethod.CARD_CREDIT]: CreditCard,
  [PaymentMethod.CARD_DEBIT]: CreditCard,
  [PaymentMethod.BANK_TRANSFER]: Building2,
  [PaymentMethod.CHECK]: FileText,
  [PaymentMethod.INSURANCE]: Wallet,
};

export function InvoicePaymentsList({
  payments,
  isLoading,
  canVoid,
  onVoid,
}: InvoicePaymentsListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const list = (payments ?? []).filter(
    (p) => p.status === PaymentStatus.CONFIRMED
  );
  const total = list.reduce((acc, p) => acc + p.amount, 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-4 w-4" />
            Pagos registrados
          </CardTitle>
          {list.length > 0 && (
            <Badge variant="outline" className="font-mono">
              Total: {formatCurrency(total)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        {list.length === 0 ? (
          <div className="px-6 pb-6 text-center text-sm text-muted-foreground">
            Aún no se han registrado pagos para esta factura.
          </div>
        ) : (
          <ul className="divide-y">
            {list.map((p) => {
              const Icon = METHOD_ICON[p.payment_method] ?? CreditCard;
              const isExpanded = expandedId === p.id;
              return (
                <li key={p.id} className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-700">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">
                          {PAYMENT_METHOD_LABELS[p.payment_method]}
                        </span>
                        {p.reference_number && (
                          <span className="text-xs font-mono text-muted-foreground">
                            Ref: {p.reference_number}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span className="font-mono">{p.payment_number}</span>
                        <span>
                          {new Date(p.payment_date).toLocaleString("es-GT", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </span>
                        <button
                          type="button"
                          className="text-primary hover:underline"
                          onClick={() =>
                            setExpandedId(isExpanded ? null : p.id)
                          }
                        >
                          {isExpanded ? "Ocultar detalle" : "Ver detalle"}
                        </button>
                      </div>
                      {isExpanded && (
                        <div className="mt-2 text-xs text-muted-foreground space-y-0.5">
                          {p.card_brand && (
                            <p>
                              <strong>Marca:</strong> {p.card_brand}
                              {p.card_last_four && ` ······${p.card_last_four}`}
                            </p>
                          )}
                          {p.bank_name && (
                            <p>
                              <strong>Banco:</strong> {p.bank_name}
                            </p>
                          )}
                          {p.notes && (
                            <p>
                              <strong>Notas:</strong> {p.notes}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-base font-bold tabular-nums text-emerald-700">
                        {formatCurrency(p.amount)}
                      </p>
                      {canVoid && onVoid && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onVoid(p)}
                          className="text-xs text-destructive hover:text-destructive"
                        >
                          <Ban className="mr-1 h-3 w-3" />
                          Anular
                        </Button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
