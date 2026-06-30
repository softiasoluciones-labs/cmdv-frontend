"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Receipt, Package as PackageIcon, BedDouble, Stethoscope,
  Boxes, TrendingUp, Wallet,
} from "lucide-react";
import { BillingSummary } from "@/lib/api/types/medical-types/case-product.types";

interface BillingSummaryCardProps {
  summary: BillingSummary | null;
  isLoading: boolean;
}

const currency = new Intl.NumberFormat("es-GT", {
  style: "currency",
  currency: "GTQ",
  minimumFractionDigits: 2,
});

interface SectionRow {
  key: keyof BillingSummary["breakdown"];
  label: string;
  icon: React.ElementType;
  iconColor: string;
  bg: string;
}

const SECTIONS: SectionRow[] = [
  { key: "packages", label: "Paquetes",  icon: Boxes,      iconColor: "text-purple-600", bg: "bg-purple-500/10" },
  { key: "rooms",    label: "Habitaciones", icon: BedDouble, iconColor: "text-blue-600",   bg: "bg-blue-500/10" },
  { key: "services", label: "Servicios",  icon: Stethoscope, iconColor: "text-teal-600",  bg: "bg-teal-500/10" },
  { key: "products", label: "Productos",  icon: PackageIcon, iconColor: "text-orange-600", bg: "bg-orange-500/10" },
];

export function BillingSummaryCard({ summary, isLoading }: BillingSummaryCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Receipt className="h-4 w-4" />
            Resumen de Cuenta
          </CardTitle>
          <CardDescription>
            No se pudo cargar el resumen de facturación.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Receipt className="h-4 w-4" />
          Resumen de Cuenta
        </CardTitle>
        <CardDescription>
          <span className="font-mono">{summary.case_number}</span>
          {" · "}
          <span className="font-medium">{summary.patient_name}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {SECTIONS.map(({ key, label, icon: Icon, iconColor, bg }) => {
            const section = summary.breakdown[key];
            const count = section.items.length;
            return (
              <div
                key={key}
                className="rounded-lg border bg-card p-3 flex flex-col gap-2"
              >
                <div className="flex items-center gap-2">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${bg}`}>
                    <Icon className={`h-4 w-4 ${iconColor}`} />
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{label}</p>
                </div>
                <p className="text-lg font-bold tabular-nums">
                  {currency.format(section.subtotal)}
                </p>
                <p className="text-xs text-muted-foreground -mt-1">
                  {count} {count === 1 ? "ítem" : "ítems"}
                </p>
              </div>
            );
          })}
        </div>

        <Separator />

        <div className="space-y-2">
          {SECTIONS.map(({ key, label, icon: Icon }) => {
            const section = summary.breakdown[key];
            if (section.items.length === 0) return null;
            return (
              <div key={key} className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </div>
                <div className="space-y-1 pl-5">
                  {section.items.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="min-w-0 truncate flex-1">
                        {item.description}
                        {item.quantity > 1 && (
                          <Badge variant="outline" className="ml-1.5 text-xs">
                            ×{item.quantity}
                          </Badge>
                        )}
                      </span>
                      <span className="tabular-nums text-muted-foreground shrink-0">
                        {currency.format(item.unit_price)}
                      </span>
                      <span className="tabular-nums font-medium shrink-0 w-24 text-right">
                        {currency.format(item.total_price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <Separator />

        <div className="flex items-center justify-between rounded-lg bg-primary/5 border border-primary/20 px-4 py-3">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold uppercase tracking-wide">
              Total Facturado
            </span>
          </div>
          <span className="text-2xl font-bold tabular-nums text-primary">
            {currency.format(summary.total)}
          </span>
        </div>

        <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <TrendingUp className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          El total incluye habitaciones según días de estadía, servicios, paquetes y productos activos.
        </p>
      </CardContent>
    </Card>
  );
}
