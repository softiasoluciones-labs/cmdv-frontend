"use client";

import type { LucideIcon } from "lucide-react";
import {
  Clock,
  CheckCircle2,
  Wallet,
  Ban,
  Receipt,
} from "lucide-react";
import {
  InvoiceStatus,
  INVOICE_STATUS_LABELS,
} from "@/lib/api/types/billing-types/billing.types";

export interface InvoiceStatusStyle {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
  className: string;
  icon: LucideIcon;
}

export const INVOICE_STATUS_STYLE: Record<InvoiceStatus, InvoiceStatusStyle> = {
  [InvoiceStatus.DRAFT]: {
    label: INVOICE_STATUS_LABELS[InvoiceStatus.DRAFT],
    variant: "outline",
    className: "bg-gray-100 text-gray-800 border-gray-300",
    icon: Clock,
  },
  [InvoiceStatus.CONFIRMED]: {
    label: INVOICE_STATUS_LABELS[InvoiceStatus.CONFIRMED],
    variant: "secondary",
    className: "bg-blue-100 text-blue-800",
    icon: Receipt,
  },
  [InvoiceStatus.PARTIALLY_PAID]: {
    label: INVOICE_STATUS_LABELS[InvoiceStatus.PARTIALLY_PAID],
    variant: "outline",
    className: "bg-amber-100 text-amber-800 border-amber-300",
    icon: Wallet,
  },
  [InvoiceStatus.PAID]: {
    label: INVOICE_STATUS_LABELS[InvoiceStatus.PAID],
    variant: "default",
    className: "bg-emerald-100 text-emerald-800",
    icon: CheckCircle2,
  },
  [InvoiceStatus.VOIDED]: {
    label: INVOICE_STATUS_LABELS[InvoiceStatus.VOIDED],
    variant: "destructive",
    className: "bg-red-100 text-red-800",
    icon: Ban,
  },
};
