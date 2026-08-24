import { CaseProduct } from "./case-product.types";
import { CaseService } from "./case-service.types";
import { CaseRoom } from "./case-room.types";
import { CasePackageAssignment } from "./case-package-assignment.types";

export type ChargeType = "product" | "service" | "room" | "package";

interface ChargeRowBase {
  id: string;
  charge_type: ChargeType;
  description: string;
  detail?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  applied_at: string;
  is_voided: boolean;
  void_reason?: string;
}

export interface ProductChargeRow extends ChargeRowBase {
  charge_type: "product";
  source: CaseProduct;
}

export interface ServiceChargeRow extends ChargeRowBase {
  charge_type: "service";
  source: CaseService;
}

export interface RoomChargeRow extends ChargeRowBase {
  charge_type: "room";
  source: CaseRoom;
}

export interface PackageChargeRow extends ChargeRowBase {
  charge_type: "package";
  source: CasePackageAssignment;
}

export type ChargeRow = ProductChargeRow | ServiceChargeRow | RoomChargeRow | PackageChargeRow;

export function toChargeRows(
  products: CaseProduct[],
  services: CaseService[],
  rooms: CaseRoom[],
  packages: CasePackageAssignment[]
): ChargeRow[] {
  const rows: ChargeRow[] = [
    ...products.map((p): ProductChargeRow => ({
      id: p.id,
      charge_type: "product",
      description: p.product_name,
      detail: `${p.product_code} · ${p.warehouse_name}`,
      quantity: p.quantity,
      unit_price: p.unit_price,
      total_price: p.total_price,
      applied_at: p.applied_at,
      is_voided: p.is_voided,
      void_reason: p.void_reason,
      source: p,
    })),
    ...services.map((s): ServiceChargeRow => ({
      id: s.id,
      charge_type: "service",
      description: s.service_name,
      detail: s.is_consultation && s.doctor_name ? `Dr(a). ${s.doctor_name}` : undefined,
      quantity: s.quantity,
      unit_price: s.unit_price,
      total_price: s.total_price,
      applied_at: s.applied_at,
      is_voided: s.is_voided,
      void_reason: s.void_reason,
      source: s,
    })),
    ...rooms.map((r): RoomChargeRow => ({
      id: r.id,
      charge_type: "room",
      description: `Habitación ${r.room_number} (${r.room_type})`,
      detail: `${r.nights} ${r.nights === 1 ? "noche" : "noches"}`,
      quantity: r.nights,
      unit_price: r.daily_rate,
      total_price: r.total_price,
      applied_at: r.check_in,
      is_voided: r.is_voided,
      void_reason: r.void_reason,
      source: r,
    })),
    ...packages.map((pa): PackageChargeRow => ({
      id: pa.id,
      charge_type: "package",
      description: pa.package_name,
      detail: pa.doctor_name ? `Dr(a). ${pa.doctor_name}` : undefined,
      quantity: 1,
      unit_price: pa.price_applied,
      total_price: pa.price_applied,
      applied_at: pa.assigned_date,
      is_voided: pa.is_voided,
      void_reason: pa.void_reason,
      source: pa,
    })),
  ];

  return rows.sort((a, b) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime());
}
