"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tag, Check, Trash2, Clock,
} from "lucide-react";
import {
  InvoiceDiscount,
  DiscountType,
  DISCOUNT_TYPE_LABELS,
} from "@/lib/api/types/billing-types/billing.types";
import { formatCurrency } from "@/lib/utils";

interface InvoiceDiscountsListProps {
  discounts: InvoiceDiscount[] | undefined;
  isLoading?: boolean;
  canManage?: boolean;
  onApprove?: (discount: InvoiceDiscount) => void;
  onRemove?: (discount: InvoiceDiscount) => void;
}

export function InvoiceDiscountsList({
  discounts,
  isLoading,
  canManage,
  onApprove,
  onRemove,
}: InvoiceDiscountsListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const list = discounts ?? [];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Tag className="h-4 w-4" />
          Descuentos aplicados
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        {list.length === 0 ? (
          <div className="px-6 pb-6 text-center text-sm text-muted-foreground">
            Esta factura no tiene descuentos.
          </div>
        ) : (
          <ul className="divide-y">
            {list.map((d) => {
              const pending = d.requires_approval && !d.approved_by;
              return (
                <li key={d.id} className="px-6 py-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                        pending
                          ? "bg-amber-500/10 text-amber-700"
                          : "bg-emerald-500/10 text-emerald-700"
                      }`}
                    >
                      <Tag className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{d.description}</span>
                        {pending ? (
                          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                            <Clock className="mr-1 h-3 w-3" />
                            Pendiente de aprobación
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                            Aplicado
                          </Badge>
                        )}
                        <Badge variant="outline" className="font-mono text-xs">
                          {DISCOUNT_TYPE_LABELS[d.discount_type as DiscountType]} ·{" "}
                          {d.value}
                          {d.discount_type === DiscountType.PERCENTAGE ? "%" : ""}
                        </Badge>
                      </div>
                      {d.reason && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Motivo: {d.reason}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-base font-bold tabular-nums text-emerald-700">
                        − {formatCurrency(d.calculated_amount)}
                      </p>
                      {canManage && pending && onApprove && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onApprove(d)}
                          className="mt-1 text-xs"
                        >
                          <Check className="mr-1 h-3 w-3" />
                          Aprobar
                        </Button>
                      )}
                      {canManage && pending && onRemove && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemove(d)}
                          className="mt-1 text-xs text-destructive hover:text-destructive"
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          Eliminar
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
