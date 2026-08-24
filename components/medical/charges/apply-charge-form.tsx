"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Package, Loader2, AlertTriangle, Search, Warehouse as WarehouseIcon,
  Stethoscope, BedDouble, Boxes, User,
} from "lucide-react";
import { useProducts } from "@/hooks/inventory-hooks/use-products";
import { useWarehouses } from "@/hooks/inventory-hooks/use-warehouses";
import { useServices } from "@/hooks/medical-hooks/use-services";
import { useRooms } from "@/hooks/medical-hooks/use-rooms";
import { usePackages } from "@/hooks/medical-hooks/use-packages";
import { useDoctors } from "@/hooks/medical-hooks/use-doctors";
import { ApiError } from "@/lib/api/config";
import { ApplyCaseProductRequest } from "@/lib/api/types/medical-types/case-product.types";
import { ApplyCaseServiceRequest } from "@/lib/api/types/medical-types/case-service.types";
import { ApplyCaseRoomRequest } from "@/lib/api/types/medical-types/case-room.types";
import { ApplyCasePackageAssignmentRequest } from "@/lib/api/types/medical-types/case-package-assignment.types";
import { ChargeType } from "@/lib/api/types/medical-types/charge-row.types";

const currency = new Intl.NumberFormat("es-GT", {
  style: "currency",
  currency: "GTQ",
  minimumFractionDigits: 2,
});

const TYPE_OPTIONS: Record<ChargeType, { label: string; icon: React.ElementType }> = {
  product: { label: "Insumo", icon: Package },
  service: { label: "Servicio / Consulta", icon: Stethoscope },
  package: { label: "Paquete", icon: Boxes },
  room: { label: "Habitación", icon: BedDouble },
};

interface ApplyChargeFormProps {
  availableTypes: ChargeType[];
  onSubmitProduct: (data: ApplyCaseProductRequest) => Promise<void>;
  onSubmitService: (data: ApplyCaseServiceRequest) => Promise<void>;
  onSubmitRoom: (data: ApplyCaseRoomRequest) => Promise<void>;
  onSubmitPackage: (data: ApplyCasePackageAssignmentRequest) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function ApplyChargeForm({
  availableTypes,
  onSubmitProduct,
  onSubmitService,
  onSubmitRoom,
  onSubmitPackage,
  onCancel,
  isSubmitting,
}: ApplyChargeFormProps) {
  const [chargeType, setChargeType] = useState<ChargeType>(availableTypes[0] ?? "product");
  const [error, setError] = useState<string | null>(null);

  // ── Insumo ──────────────────────────────────────────────────────────────
  const { products, isLoading: isLoadingProducts, fetchProducts } = useProducts();
  const { warehouses, isLoading: isLoadingWarehouses, fetchWarehouses } = useWarehouses();
  const [productId, setProductId] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [warehouseId, setWarehouseId] = useState("");
  const [productQuantity, setProductQuantity] = useState(1);

  // ── Servicio / Consulta ────────────────────────────────────────────────
  const { services, isLoading: isLoadingServices } = useServices({ isActive: true });
  const [serviceId, setServiceId] = useState("");
  const [serviceQuantity, setServiceQuantity] = useState(1);
  const [serviceDoctorId, setServiceDoctorId] = useState("");
  const { doctors, isLoading: isLoadingDoctors } = useDoctors();

  // ── Habitación ──────────────────────────────────────────────────────────
  const { rooms, isLoading: isLoadingRooms } = useRooms();
  const [roomId, setRoomId] = useState("");

  // ── Paquete ─────────────────────────────────────────────────────────────
  const { packages, isLoading: isLoadingPackages } = usePackages();
  const [packageId, setPackageId] = useState("");
  const [packageDoctorId, setPackageDoctorId] = useState("");
  const [doctorTypeUsed, setDoctorTypeUsed] = useState<"internal" | "external">("internal");

  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (chargeType === "product") {
      fetchProducts({ limit: 20, isActive: true });
      fetchWarehouses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chargeType]);

  const handleProductSearch = async (value: string) => {
    setProductSearch(value);
    setShowProductDropdown(true);
    await fetchProducts({ search: value.trim() || undefined, limit: 20, isActive: true });
  };

  const selectedService = services.find(s => s.id === serviceId);
  const selectedDoctorForService = doctors.find(d => d.id === serviceDoctorId);
  const consultationPricePreview = selectedService?.use_doctor_consultation_fee
    ? selectedDoctorForService?.consultation_fee ?? Number(selectedService.base_price)
    : undefined;

  const selectedPackage = packages.find(p => p.id === packageId);
  const packagePricePreview = selectedPackage
    ? (doctorTypeUsed === "internal" ? selectedPackage.internal_doctor_price : selectedPackage.external_doctor_price)
    : undefined;

  const resetForm = () => {
    setProductId(""); setProductSearch(""); setWarehouseId(""); setProductQuantity(1);
    setServiceId(""); setServiceQuantity(1); setServiceDoctorId("");
    setRoomId("");
    setPackageId(""); setPackageDoctorId(""); setDoctorTypeUsed("internal");
    setNotes("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (chargeType === "product") {
        if (!productId) return setError("Selecciona un producto");
        if (!warehouseId) return setError("Selecciona una bodega");
        if (!productQuantity || productQuantity <= 0) return setError("La cantidad debe ser mayor a cero");
        await onSubmitProduct({
          product_id: productId,
          warehouse_id: warehouseId,
          quantity: productQuantity,
          notes: notes.trim() || undefined,
        });
      } else if (chargeType === "service") {
        if (!serviceId) return setError("Selecciona un servicio");
        if (selectedService?.use_doctor_consultation_fee && !serviceDoctorId) {
          return setError("Selecciona el médico que atiende la consulta");
        }
        await onSubmitService({
          service_id: serviceId,
          quantity: serviceQuantity,
          doctor_id: serviceDoctorId || undefined,
          notes: notes.trim() || undefined,
        });
      } else if (chargeType === "room") {
        if (!roomId) return setError("Selecciona una habitación");
        await onSubmitRoom({ room_id: roomId, notes: notes.trim() || undefined });
      } else if (chargeType === "package") {
        if (!packageId) return setError("Selecciona un paquete");
        if (!packageDoctorId) return setError("Selecciona el médico responsable");
        await onSubmitPackage({
          package_id: packageId,
          doctor_id: packageDoctorId,
          doctor_type_used: doctorTypeUsed,
          notes: notes.trim() || undefined,
        });
      }
      resetForm();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "No se pudo registrar el cargo. Intenta de nuevo.";
      setError(message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No se pudo registrar el cargo</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {availableTypes.length > 1 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Tipo de cargo</Label>
          <Select value={chargeType} onValueChange={v => setChargeType(v as ChargeType)}>
            <SelectTrigger className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableTypes.map(type => {
                const { label, icon: Icon } = TYPE_OPTIONS[type];
                return (
                  <SelectItem key={type} value={type}>
                    <span className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      )}

      {chargeType === "product" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="product" className="text-sm font-medium flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5 text-muted-foreground" />
              Producto <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                id="product"
                placeholder="Buscar por nombre o código..."
                value={productSearch}
                onChange={e => handleProductSearch(e.target.value)}
                onFocus={() => setShowProductDropdown(true)}
                className="pl-9 h-10"
                autoComplete="off"
              />
              {showProductDropdown && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 max-h-64 overflow-y-auto rounded-md border bg-background shadow-lg">
                  {isLoadingProducts ? (
                    <div className="space-y-1 p-2">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                      ))}
                    </div>
                  ) : products.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">Sin resultados</div>
                  ) : (
                    <div className="py-1">
                      {products.map(p => (
                        <button
                          key={p.id}
                          type="button"
                          className="w-full px-3 py-2 text-left hover:bg-muted/50 flex items-start justify-between gap-3"
                          onClick={() => {
                            setProductId(p.id);
                            setProductSearch(`${p.code} — ${p.name}`);
                            setShowProductDropdown(false);
                          }}
                        >
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{p.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">{p.code}</p>
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0">{p.unitOfMeasure}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="warehouse" className="text-sm font-medium flex items-center gap-1.5">
              <WarehouseIcon className="h-3.5 w-3.5 text-muted-foreground" />
              Bodega <span className="text-destructive">*</span>
            </Label>
            <Select value={warehouseId || "none"} onValueChange={v => setWarehouseId(v === "none" ? "" : v)} disabled={isLoadingWarehouses}>
              <SelectTrigger className="h-10"><SelectValue placeholder="Seleccionar bodega..." /></SelectTrigger>
              <SelectContent>
                {isLoadingWarehouses ? (
                  <SelectItem value="loading" disabled><Loader2 className="h-4 w-4 animate-spin mr-2" />Cargando...</SelectItem>
                ) : warehouses.length === 0 ? (
                  <SelectItem value="empty" disabled>No hay bodegas disponibles</SelectItem>
                ) : (
                  warehouses.filter(w => w.isActive).map(w => (
                    <SelectItem key={w.id} value={w.id}>{w.name} {w.temperatureControlled ? "(Refrigerada)" : ""}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-sm font-medium">Cantidad <span className="text-destructive">*</span></Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              step={1}
              value={productQuantity}
              onChange={e => setProductQuantity(Number(e.target.value) || 0)}
              className="h-10"
            />
          </div>
        </>
      )}

      {chargeType === "service" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="service" className="text-sm font-medium flex items-center gap-1.5">
              <Stethoscope className="h-3.5 w-3.5 text-muted-foreground" />
              Servicio <span className="text-destructive">*</span>
            </Label>
            <Select value={serviceId || "none"} onValueChange={v => { setServiceId(v === "none" ? "" : v); setServiceDoctorId(""); }} disabled={isLoadingServices}>
              <SelectTrigger className="h-10"><SelectValue placeholder="Seleccionar servicio..." /></SelectTrigger>
              <SelectContent>
                {isLoadingServices ? (
                  <SelectItem value="loading" disabled><Loader2 className="h-4 w-4 animate-spin mr-2" />Cargando...</SelectItem>
                ) : services.length === 0 ? (
                  <SelectItem value="empty" disabled>No hay servicios disponibles</SelectItem>
                ) : (
                  services.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} {!s.use_doctor_consultation_fee && `— ${currency.format(Number(s.base_price))}`}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedService?.use_doctor_consultation_fee && (
            <div className="space-y-2">
              <Label htmlFor="service-doctor" className="text-sm font-medium flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                Médico <span className="text-destructive">*</span>
              </Label>
              <Select value={serviceDoctorId || "none"} onValueChange={v => setServiceDoctorId(v === "none" ? "" : v)} disabled={isLoadingDoctors}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Seleccionar médico..." /></SelectTrigger>
                <SelectContent>
                  {isLoadingDoctors ? (
                    <SelectItem value="loading" disabled><Loader2 className="h-4 w-4 animate-spin mr-2" />Cargando...</SelectItem>
                  ) : doctors.length === 0 ? (
                    <SelectItem value="empty" disabled>No hay médicos disponibles</SelectItem>
                  ) : (
                    doctors.map(doc => (
                      <SelectItem key={doc.id} value={doc.id}>
                        {doc.full_name ?? "Médico"}{doc.specialty_name ? ` - ${doc.specialty_name}` : ""}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {consultationPricePreview !== undefined && (
                <p className="text-xs text-muted-foreground">
                  Precio estimado: <span className="font-medium tabular-nums">{currency.format(consultationPricePreview)}</span>
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="service-quantity" className="text-sm font-medium">Cantidad</Label>
            <Input
              id="service-quantity"
              type="number"
              min={1}
              step={1}
              value={serviceQuantity}
              onChange={e => setServiceQuantity(Number(e.target.value) || 0)}
              className="h-10"
            />
          </div>
        </>
      )}

      {chargeType === "room" && (
        <div className="space-y-2">
          <Label htmlFor="room" className="text-sm font-medium flex items-center gap-1.5">
            <BedDouble className="h-3.5 w-3.5 text-muted-foreground" />
            Habitación <span className="text-destructive">*</span>
          </Label>
          <Select value={roomId || "none"} onValueChange={v => setRoomId(v === "none" ? "" : v)} disabled={isLoadingRooms}>
            <SelectTrigger className="h-10"><SelectValue placeholder="Seleccionar habitación..." /></SelectTrigger>
            <SelectContent>
              {isLoadingRooms ? (
                <SelectItem value="loading" disabled><Loader2 className="h-4 w-4 animate-spin mr-2" />Cargando...</SelectItem>
              ) : rooms.length === 0 ? (
                <SelectItem value="empty" disabled>No hay habitaciones disponibles</SelectItem>
              ) : (
                rooms.map(r => (
                  <SelectItem key={r.id} value={r.id}>{r.room_number} — {r.room_type}</SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      {chargeType === "package" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="package" className="text-sm font-medium flex items-center gap-1.5">
              <Boxes className="h-3.5 w-3.5 text-muted-foreground" />
              Paquete <span className="text-destructive">*</span>
            </Label>
            <Select value={packageId || "none"} onValueChange={v => setPackageId(v === "none" ? "" : v)} disabled={isLoadingPackages}>
              <SelectTrigger className="h-10"><SelectValue placeholder="Seleccionar paquete..." /></SelectTrigger>
              <SelectContent>
                {isLoadingPackages ? (
                  <SelectItem value="loading" disabled><Loader2 className="h-4 w-4 animate-spin mr-2" />Cargando...</SelectItem>
                ) : packages.filter(p => p.is_active).length === 0 ? (
                  <SelectItem value="empty" disabled>No hay paquetes disponibles</SelectItem>
                ) : (
                  packages.filter(p => p.is_active).map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Tipo de médico</Label>
            <Select value={doctorTypeUsed} onValueChange={v => setDoctorTypeUsed(v as "internal" | "external")}>
              <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="internal">Interno</SelectItem>
                <SelectItem value="external">Externo</SelectItem>
              </SelectContent>
            </Select>
            {packagePricePreview !== undefined && (
              <p className="text-xs text-muted-foreground">
                Precio: <span className="font-medium tabular-nums">{currency.format(packagePricePreview)}</span>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="package-doctor" className="text-sm font-medium flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              Médico responsable <span className="text-destructive">*</span>
            </Label>
            <Select value={packageDoctorId || "none"} onValueChange={v => setPackageDoctorId(v === "none" ? "" : v)} disabled={isLoadingDoctors}>
              <SelectTrigger className="h-10"><SelectValue placeholder="Seleccionar médico..." /></SelectTrigger>
              <SelectContent>
                {isLoadingDoctors ? (
                  <SelectItem value="loading" disabled><Loader2 className="h-4 w-4 animate-spin mr-2" />Cargando...</SelectItem>
                ) : doctors.length === 0 ? (
                  <SelectItem value="empty" disabled>No hay médicos disponibles</SelectItem>
                ) : (
                  doctors.map(doc => (
                    <SelectItem key={doc.id} value={doc.id}>
                      {doc.full_name ?? "Médico"}{doc.specialty_name ? ` - ${doc.specialty_name}` : ""}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="notes" className="text-sm font-medium">
          Notas <span className="text-xs text-muted-foreground font-normal">(opcional)</span>
        </Label>
        <Textarea
          id="notes"
          placeholder="Observaciones sobre la aplicación del cargo..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          className="resize-none"
        />
      </div>

      <div className="flex items-center gap-2 pt-2 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Package className="mr-2 h-4 w-4" />}
          Registrar Cargo
        </Button>
      </div>
    </form>
  );
}
