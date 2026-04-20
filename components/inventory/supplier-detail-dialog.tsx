"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  editSupplierData,
  Supplier,
} from "@/lib/api/types/inventory-types/inventory.types";

interface SupplierDetailDialogProps {
  supplier: Supplier | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (supplier: Supplier) => void;
}

const PAYMENT_LABEL: Record<string, string> = {
  immediate: "Contado",
  one_payment: "Un pago",
  two_payments: "Dos pagos",
  three_payments: "Tres pagos",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    minimumFractionDigits: 0,
  }).format(value);
}

export function SupplierDetailDialog({
  supplier,
  open,
  onOpenChange,
  onEdit,
}: SupplierDetailDialogProps) {
  if (!supplier) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-muted-foreground" />
            {supplier.name}
          </DialogTitle>
          <DialogDescription>
            Código <span className="font-mono">{supplier.code}</span>
            {supplier.taxId && <> · NIT {supplier.taxId}</>}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <DetailRow label="Contacto" value={supplier.contactName || "—"} />
          {/*<DetailRow
            label="Estado"
            value={
              supplier.isActive ? (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Activo
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-gray-600 border-gray-300"
                >
                  <XCircle className="h-3 w-3 mr-1" />
                  Inactivo
                </Badge>
              )
            }
          />*/}
          <DetailRow
            label="Email"
            icon={<Mail className="h-4 w-4" />}
            value={
              supplier.email ? (
                <a
                  href={`mailto:${supplier.email}`}
                  className="hover:underline text-primary break-all"
                >
                  {supplier.email}
                </a>
              ) : (
                "—"
              )
            }
          />
          <DetailRow
            label="Teléfono"
            icon={<Phone className="h-4 w-4" />}
            value={
              supplier.phone ? (
                <a
                  href={`tel:${supplier.phone}`}
                  className="hover:underline text-primary"
                >
                  {supplier.phone}
                </a>
              ) : (
                "—"
              )
            }
          />
          <DetailRow
            className="sm:col-span-2"
            label="Dirección"
            icon={<MapPin className="h-4 w-4" />}
            value={
              supplier.address ? `${supplier.address}, ${supplier.city}` : "—"
            }
          />
          <DetailRow
            label="Términos de pago"
            value={
              PAYMENT_LABEL[supplier.paymentTerms] ?? supplier.paymentTerms
            }
          />
          <DetailRow
            label="Límite de crédito"
            icon={<CreditCard className="h-4 w-4" />}
            value={formatCurrency(supplier.creditLimit)}
          />
          <DetailRow
            label="Pais"
            icon={<MapPin className="h-4 w-4" />}
            value={(supplier as any).country || "Guatemala"}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          {onEdit && <Button onClick={() => onEdit(supplier)}>Editar</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface DetailRowProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

function DetailRow({ label, value, icon, className }: DetailRowProps) {
  return (
    <div className={className}>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="mt-1 flex items-center gap-2 text-sm">
        {icon}
        <span>{value}</span>
      </div>
    </div>
  );
}
