"use client";

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Package, Ban, AlertCircle, FileText,
} from "lucide-react";
import { CaseProduct } from "@/lib/api/types/medical-types/case-product.types";

interface ChargesTableProps {
  charges: CaseProduct[];
  isLoading: boolean;
  isVoiding: boolean;
  onVoid: (charge: CaseProduct) => void;
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
        <Package className="mb-3 h-10 w-10 opacity-30" />
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
              <TableHead>Producto</TableHead>
              <TableHead>Bodega</TableHead>
              <TableHead className="text-center">Cantidad</TableHead>
              <TableHead className="text-right">P. Unitario</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Aplicado</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {charges.map(charge => (
              <TableRow
                key={charge.id}
                className={charge.is_voided ? "opacity-60 bg-muted/30" : "hover:bg-muted/40"}
              >
                <TableCell>
                  <div className="flex items-start gap-2">
                    <Package className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className={`font-medium text-sm ${charge.is_voided ? "line-through text-muted-foreground" : ""}`}>
                        {charge.product_name}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {charge.product_code}
                      </p>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="text-sm">
                  {charge.warehouse_name}
                </TableCell>

                <TableCell className="text-center">
                  <span className="font-medium tabular-nums">{charge.quantity}</span>
                  <span className="text-xs text-muted-foreground ml-1">
                    {charge.unit_of_measure}
                  </span>
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
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
