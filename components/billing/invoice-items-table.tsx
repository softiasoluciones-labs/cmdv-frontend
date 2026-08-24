"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Package, BedDouble, Stethoscope, Pill,
  Receipt,
} from "lucide-react";
import {
  InvoiceItem,
  InvoiceItemType,
  INVOICE_ITEM_TYPE_LABELS,
} from "@/lib/api/types/billing-types/billing.types";
import { formatCurrency } from "@/lib/utils";

interface InvoiceItemsTableProps {
  items: InvoiceItem[] | undefined;
  isLoading?: boolean;
}

const TYPE_ICON: Record<InvoiceItemType, React.ElementType> = {
  [InvoiceItemType.PACKAGE]: Package,
  [InvoiceItemType.ROOM]: BedDouble,
  [InvoiceItemType.SERVICE]: Stethoscope,
  [InvoiceItemType.PRODUCT]: Pill,
};

const TYPE_COLOR: Record<InvoiceItemType, string> = {
  [InvoiceItemType.PACKAGE]: "bg-purple-500/10 text-purple-700",
  [InvoiceItemType.ROOM]: "bg-blue-500/10 text-blue-700",
  [InvoiceItemType.SERVICE]: "bg-teal-500/10 text-teal-700",
  [InvoiceItemType.PRODUCT]: "bg-orange-500/10 text-orange-700",
};

export function InvoiceItemsTable({ items, isLoading }: InvoiceItemsTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const list = items ?? [];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Receipt className="h-4 w-4" />
          Cargos de la factura
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        {list.length === 0 ? (
          <div className="px-6 pb-6 text-center text-sm text-muted-foreground">
            Esta factura aún no tiene cargos.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-y bg-muted/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-6 py-2 font-medium">Tipo</th>
                  <th className="px-3 py-2 font-medium">Descripción</th>
                  <th className="px-3 py-2 font-medium text-right">Cant.</th>
                  <th className="px-3 py-2 font-medium text-right">P. Unit.</th>
                  <th className="px-3 py-2 font-medium text-right">Desc.</th>
                  <th className="px-6 py-2 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {list.map((item) => {
                  const Icon = TYPE_ICON[item.item_type] ?? Package;
                  return (
                    <tr key={item.id} className="hover:bg-muted/30">
                      <td className="px-6 py-3">
                        <Badge variant="secondary" className={TYPE_COLOR[item.item_type]}>
                          <Icon className="mr-1 h-3 w-3" />
                          {INVOICE_ITEM_TYPE_LABELS[item.item_type]}
                        </Badge>
                      </td>
                      <td className="px-3 py-3">
                        <p className="font-medium">{item.description}</p>
                        {item.is_iva_exempt && (
                          <p className="text-xs text-muted-foreground">Exento de IVA</p>
                        )}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums">
                        {item.quantity}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">
                        {formatCurrency(item.unit_price)}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">
                        {item.discount_amount > 0
                          ? `-${formatCurrency(item.discount_amount)}`
                          : "—"}
                      </td>
                      <td className="px-6 py-3 text-right font-medium tabular-nums">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
