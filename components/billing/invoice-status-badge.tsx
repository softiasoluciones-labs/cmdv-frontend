"use client";

import { Badge } from "@/components/ui/badge";
import { InvoiceStatus } from "@/lib/api/types/billing-types/billing.types";
import { INVOICE_STATUS_STYLE } from "./invoice-status-config";

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus | string;
}

export function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  const cfg =
    INVOICE_STATUS_STYLE[status as InvoiceStatus] ??
    INVOICE_STATUS_STYLE[InvoiceStatus.DRAFT];
  const Icon = cfg.icon;
  return (
    <Badge className={`gap-1 ${cfg.className}`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </Badge>
  );
}
