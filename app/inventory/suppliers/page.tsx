"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Building,
  Eye,
  Download,
  Upload,
  Truck,
  Package,
  FileText,
  CreditCard,
  Calendar,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Supplier,
  editSupplierData,
} from "@/lib/api/types/inventory-types/inventory.types";
import { SupplierDetailDialog } from "@/components/inventory/supplier-detail-dialog";
import {
  SupplierForm,
  SupplierFormValues,
} from "@/components/inventory/supplier-form";
import { useSuppliers } from "@/hooks/inventory-hooks/use-suppliers";
import { buildCsv, downloadCsv } from "@/lib/utils/csv";
import StatCard from "@/components/inventory/StatCard";

const PAYMENT_LABEL: Record<string, string> = {
  immediate: "Contado",
  one_payment: "one_payment",
  two_payments: "two_payments",
  three_payments: "three_payments",
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function SuppliersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  const {
    suppliers,
    loading,
    error,
    createSupplier,
    updateSupplier,
    deleteSupplier,
  } = useSuppliers();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<editSupplierData | null>(null);
  const [viewing, setViewing] = useState<Supplier | null>(null);
  const [deleting, setDeleting] = useState<Supplier | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const filteredSuppliers = useMemo(
    () =>
      suppliers.filter((supplier) => {
        const q = searchQuery.trim().toLowerCase();
        const matchesSearch =
          supplier.name.toLowerCase().includes(q) ||
          supplier.code.toLowerCase().includes(q) ||
          supplier.contactName?.toLowerCase().includes(q) ||
          supplier.email?.toLowerCase().includes(q) ||
          supplier.phone?.includes(q) ||
          supplier.taxId?.toLowerCase().includes(q);

        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active" && supplier.isActive) ||
          (statusFilter === "inactive" && !supplier.isActive);

        const matchesPayment =
          paymentFilter === "all" || supplier.paymentTerms === paymentFilter;

        return matchesSearch && matchesStatus && matchesPayment;
      }),
    [suppliers, searchQuery, statusFilter, paymentFilter],
  );

  const openCreate = () => {
    setEditing(null);
    setViewing(null);
    setFormOpen(true);
  };

  const openEdit = (supplier: Supplier) => {
    const editData: editSupplierData = {
      id: supplier.id,
      code: supplier.code,
      name: supplier.name,
      paymentTerms: supplier.paymentTerms,
      contactName: supplier.contactName,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      city: supplier.city,
      country: (supplier as any).country || "Guatemala",
      taxId: supplier.taxId,
      creditLimit: supplier.creditLimit,
    };
    setEditing(editData);
    setViewing(null);
    setFormOpen(true);
  };

  // Formatear términos de pago
  const formatPaymentTerms = (terms: string) => {
    switch (terms) {
      case "immediate":
        return "Contado";
      case "one_payment":
        return "Un pago";
      case "two_payments":
        return "Dos pagos";
      case "three_payments":
        return "Tres pagos";
      default:
        return terms;
    }
  };

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-GT", {
      style: "currency",
      currency: "GTQ",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = async (values: SupplierFormValues) => {
    setSubmitting(true);
    try {
      if (editing) {
        const payload: editSupplierData = {
          ...editing,
          ...values,
        } as editSupplierData;
        const updated = await updateSupplier(editing.id, payload);
        if (updated) {
          toast.success("Proveedor actualizado exitosamente");
          setFormOpen(false);
          setEditing(null);
        } else {
          toast.error("Error al actualizar el proveedor");
        }
      } else {
        const payload = { ...values, id: "" } as editSupplierData;
        const created = await createSupplier(payload);
        console.log("Create supplier response:", created);
        if (created) {
          toast.success("Proveedor creado exitosamente");
          setFormOpen(false);
        } else {
          toast.error("Error al crear el proveedor", {
            description: "Intente nuevamente o contacte al soporte",
          });
        }
      }
    } catch (error) {
      toast.error("Error al actualizar el proveedor");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleting) return;
    const ok = await deleteSupplier(deleting.id);
    if (ok) {
      toast.success("Proveedor eliminado exitosamente");
      setDeleting(null);
    } else {
      toast.error("Error al eliminar el proveedor");
    }
    setDeleting(null);
  };

  const handleExport = () => {
    if (filteredSuppliers.length === 0) {
      toast.error("No hay proveedores para exportar");
      return;
    }

    const csv = buildCsv(filteredSuppliers, [
      { header: "Código", accessor: (s) => s.code },
      { header: "Nombre", accessor: (s) => s.name },
      { header: "Contacto", accessor: (s) => s.contactName || "" },
      { header: "Email", accessor: (s) => s.email || "" },
      { header: "Teléfono", accessor: (s) => s.phone || "" },
      { header: "Ciudad", accessor: (s) => s.city || "" },
      { header: "Departamento", accessor: (s) => s.state || "" },
      { header: "Direccion", accessor: (s) => s.address || "" },
      {
        header: "Términos de Pago",
        accessor: (s) => PAYMENT_LABEL[s.paymentTerms] ?? s.paymentTerms,
      },
      {
        header: "Límite de Crédito",
        accessor: (s) => formatCurrency(s.creditLimit),
      },
      {
        header: "Estado",
        accessor: (s) => (s.isActive ? "Activo" : "Inactivo"),
      },
    ]);
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    downloadCsv(csv, `proveedores-${stamp}.csv`);
    toast.success("Proveedores exportados exitosamente");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Proveedores</h1>
            <p className="text-muted-foreground">
              Gestión de proveedores y suministros médicos
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            <Button variant="outline" className="gap-2" disabled>
              <Upload className="h-4 w-4" />
              Importar
            </Button>
            <Button className="gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Nuevo Proveedor
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading && suppliers.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">
              Cargando proveedores...
            </span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error al cargar proveedores</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        {/* Estadísticas rápidas */}
        {!error && (
          <div className="grid gap-6 md:grid-cols-4">
            <StatCard
              label="Total Proveedores"
              value={suppliers.length.toString()}
              icon={<Truck className="h-8 w-8 text-blue-500/60" />}
            />
            <StatCard
              label="Activos"
              value={suppliers.filter((s) => s.isActive).length.toString()}
              icon={<CheckCircle className="h-8 w-8 text-green-500/60" />}
            />
            <StatCard
              label="Límite Total"
              value={formatCurrency(
                suppliers.reduce((acc, s) => acc + s.creditLimit, 0),
              )}
              icon={<CreditCard className="h-8 w-8 text-purple-500/60" />}
            />
            <StatCard
              label="Pago 30+ días"
              value={suppliers
                .filter(
                  (s) =>
                    s.paymentTerms.includes("30") ||
                    s.paymentTerms.includes("60"),
                )
                .length.toString()}
              icon={<Calendar className="h-8 w-8 text-amber-500/60" />}
            />
          </div>
        )}

        {/* Tabla de proveedores con filtros integrados */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Listado de Proveedores</CardTitle>
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar proveedores..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 sm:w-[250px]"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Términos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="immediate">Contado</SelectItem>
                    <SelectItem value="one_payment">Un pago</SelectItem>
                    <SelectItem value="two_payments">Dos pagos</SelectItem>
                    <SelectItem value="three_payments">Tres pagos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <CardDescription>
              {filteredSuppliers.length} proveedores encontrados
            </CardDescription>
          </CardHeader>

          <CardContent>
            {filteredSuppliers.length === 0 ? (
              <div className="text-center py-12">
                <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">
                  No se encontraron proveedores
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery
                    ? `No hay resultados para "${searchQuery}"`
                    : "No hay proveedores registrados"}
                </p>
                <Button onClick={openCreate}>
                  <Plus className="h-4 w-4" />
                  Registrar primer proveedor
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Código</TableHead>
                      <TableHead className="min-w-[250px]">Proveedor</TableHead>
                      <TableHead className="min-w-[180px]">Contacto</TableHead>
                      <TableHead className="min-w-[150px]">Ubicación</TableHead>
                      <TableHead className="min-w-[150px]">Términos</TableHead>
                      <TableHead className="w-[100px]">Estado</TableHead>
                      <TableHead className="w-[140px] text-right">
                        Acciones
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSuppliers.map((supplier) => (
                      <TableRow key={supplier.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="font-mono font-semibold">
                            {supplier.code}
                          </div>
                          <div
                            className="text-xs text-muted-foreground truncate"
                            title={supplier.taxId}
                          >
                            {supplier.taxId}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{supplier.name}</div>
                          <div className="text-sm text-muted-foreground space-y-1 mt-1">
                            {supplier.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                <a
                                  href={`mailto:${supplier.email}`}
                                  className="hover:text-primary hover:underline truncate"
                                  title={supplier.email}
                                >
                                  {supplier.email}
                                </a>
                              </div>
                            )}
                            {supplier.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                <a
                                  href={`tel:${supplier.phone}`}
                                  className="hover:text-primary hover:underline"
                                >
                                  {supplier.phone}
                                </a>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">
                              {supplier.contactName || "—"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {supplier.city}, {supplier.state}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span
                                className="truncate"
                                title={supplier.address}
                              >
                                {supplier.address}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant="outline" className="text-xs">
                              {PAYMENT_LABEL[supplier.paymentTerms] ??
                                supplier.paymentTerms}
                            </Badge>
                            <div className="text-sm">
                              <span className="font-medium">Límite:</span>{" "}
                              {formatCurrency(supplier.creditLimit)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {supplier.isActive ? (
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
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              aria-label={`Ver detalles de ${supplier.name}`}
                              onClick={() => setViewing(supplier)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              aria-label={`Editar ${supplier.name}`}
                              onClick={() => openEdit(supplier)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:bg-red-700 hover:bg-red-50"
                              aria-label={`Eliminar ${supplier.name}`}
                              onClick={() => setDeleting(supplier)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tipos de proveedores comunes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Tipos de Proveedores Médicos
            </CardTitle>
            <CardDescription>
              Proveedores comunes en el sector salud
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Farmacéuticos</p>
                  <p className="text-sm text-muted-foreground">Medicamentos</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <div className="p-2 rounded-lg bg-green-100">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Insumos</p>
                  <p className="text-sm text-muted-foreground">
                    Material desechable
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Truck className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Equipos</p>
                  <p className="text-sm text-muted-foreground">
                    Equipos médicos
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <div className="p-2 rounded-lg bg-amber-100">
                  <Building className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium">Servicios</p>
                  <p className="text-sm text-muted-foreground">Mantenimiento</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar Proveedor" : "Registrar Nuevo Proveedor"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Actualiza la información del proveedor"
                : "Complete la información del proveedor de suministros médicos"}
            </DialogDescription>
          </DialogHeader>
          <SupplierForm
            key={editing?.id ?? "new"}
            initialData={editing ?? undefined}
            submitLabel={editing ? "Guardar cambios" : "Crear Proveedor"}
            isSubmitting={submitting}
            onSubmit={handleSubmit}
            onCancel={() => {
              setFormOpen(false);
              setEditing(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* View */}
      <SupplierDetailDialog
        supplier={viewing}
        open={!!viewing}
        onOpenChange={(open) => !open && setViewing(null)}
        onEdit={openEdit}
      />

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar proveedor</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Seguro que deseas eliminar{" "}
              <span className="font-semibold">{deleting?.name}</span>? Esta
              acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 focus-visible:ring-red-600"
              onClick={handleConfirmDelete}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
