"use client";

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Package, Ban, FileText, Boxes, BedDouble, Stethoscope, Receipt,
} from "lucide-react";
import { ChargeRow, ChargeType } from "@/lib/api/types/medical-types/charge-row.types";

interface ChargesTableProps {
  charges: ChargeRow[];
  isLoading: boolean;
  isVoiding: boolean;
  onVoid: (charge: ChargeRow) => void;
}

const currency = new Intl.NumberFormat("es-GT", {
  style: "currency",
  currency: "GTQ",
  minimumFractionDigits: 2,
});

const dateFmt = new Intl.DateTimeFormat("es-GT", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const TYPE_META: Record<ChargeType, { label: string; icon: React.ElementType }> = {
  product: { label: "Insumo", icon: Package },
  service: { label: "Servicio", icon: Stethoscope },
  room: { label: "Habitación", icon: BedDouble },
  package: { label: "Paquete", icon: Boxes },
};

export function ChargesTable({
  charges,
  isLoading,
  isVoiding,
  onVoid,
}: ChargesTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (charges.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground border border-dashed rounded-lg">
        <Receipt className="mb-3 h-10 w-10 opacity-30" />
        <p className="font-medium">Sin cargos registrados</p>
        <p className="text-sm mt-1">
          Usa el botón <span className="font-semibold">+ Agregar Cargo</span> para registrar el primero.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background shadow-sm">
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-center">Cantidad</TableHead>
              <TableHead className="text-right">P. Unitario</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Aplicado</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {charges.map(charge => {
              const meta = TYPE_META[charge.charge_type];
              const Icon = meta.icon;
              return (
                <TableRow
                  key={`${charge.charge_type}-${charge.id}`}
                  className={charge.is_voided ? "opacity-60 bg-muted/30" : "hover:bg-muted/40"}
                >
                  <TableCell>
                    <Badge variant="outline" className="gap-1.5 font-normal">
                      <Icon className="h-3 w-3" />
                      {meta.label}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="min-w-0">
                      <p className={`font-medium text-sm ${charge.is_voided ? "line-through text-muted-foreground" : ""}`}>
                        {charge.description}
                      </p>
                      {charge.detail && (
                        <p className="text-xs text-muted-foreground">{charge.detail}</p>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-center">
                    <span className="font-medium tabular-nums">{charge.quantity}</span>
                  </TableCell>

                  <TableCell className="text-right tabular-nums text-sm">
                    {currency.format(charge.unit_price)}
                  </TableCell>

                  <TableCell className="text-right tabular-nums font-semibold">
                    {currency.format(charge.total_price)}
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {dateFmt.format(new Date(charge.applied_at))}
                  </TableCell>

                  <TableCell>
                    {charge.is_voided ? (
                      <Badge variant="destructive" className="gap-1">
                        <Ban className="h-3 w-3" />
                        Anulado
                      </Badge>
                    ) : (
                      <Badge className="bg-success/10 text-success border-success/20">
                        Activo
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    {!charge.is_voided ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onVoid(charge)}
                        disabled={isVoiding}
                        className="text-destructive hover:text-destructive"
                      >
                        <Ban className="mr-1.5 h-3.5 w-3.5" />
                        Anular
                      </Button>
                    ) : charge.void_reason ? (
                      <div
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground italic"
                        title={charge.void_reason}
                      >
                        <FileText className="h-3 w-3 shrink-0" />
                        <span className="line-clamp-1 max-w-[180px]">{charge.void_reason}</span>
                      </div>
                    ) : null}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
