"use client";

import { useState, useMemo, useEffect } from "react";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
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
  Filter,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Lightbulb,
  HelpCircle,
  TrendingUp,
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
import { formatCurrency } from "@/lib/utils";

const PAYMENT_LABEL: Record<string, string> = {
  immediate: "Contado",
  one_payment: "Un pago",
  two_payments: "Dos pagos",
  three_payments: "Tres pagos",
};

export default function SuppliersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [sortField, setSortField] = useState<"name" | "code" | "creditLimit">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [savedFilters, setSavedFilters] = useState<any[]>([]);
  const [filterName, setFilterName] = useState("");
  const [showSaveFilterDialog, setShowSaveFilterDialog] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);

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

  // Cargar filtros guardados
  useEffect(() => {
    const saved = localStorage.getItem("savedSupplierFilters");
    if (saved) {
      try {
        setSavedFilters(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading saved filters:", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("savedSupplierFilters", JSON.stringify(savedFilters));
  }, [savedFilters]);

  // Filtrar y ordenar
  const filteredSuppliers = useMemo(() => {
    let filtered = suppliers.filter((supplier) => {
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
    });

    // Ordenar
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (typeof aValue === 'string') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }, [suppliers, searchQuery, statusFilter, paymentFilter, sortField, sortOrder]);

  // Paginación
  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
  const paginatedSuppliers = filteredSuppliers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Stats con gradientes
  const stats = useMemo(() => {
    const active = suppliers.filter((s) => s.isActive).length;
    const inactive = suppliers.filter((s) => !s.isActive).length;
    const totalCredit = suppliers.reduce((acc, s) => acc + s.creditLimit, 0);
    const avgCredit = suppliers.length > 0 ? totalCredit / suppliers.length : 0;

    return {
      total: suppliers.length,
      active,
      inactive,
      totalCredit,
      avgCredit,
      activeRate: suppliers.length > 0 ? (active / suppliers.length) * 100 : 0,
    };
  }, [suppliers]);

  // Handlers
  const handleSort = (field: "name" | "code" | "creditLimit") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setPaymentFilter("all");
    setCurrentPage(1);
  };

  const handleSaveFilter = () => {
    if (filterName.trim()) {
      const newFilter = {
        id: Date.now(),
        name: filterName,
        search: searchQuery,
        statusFilter,
        paymentFilter,
        createdAt: new Date().toISOString(),
      };
      setSavedFilters([...savedFilters, newFilter]);
      setFilterName("");
      setShowSaveFilterDialog(false);
    }
  };

  const handleLoadFilter = (filter: any) => {
    setSearchQuery(filter.search);
    setStatusFilter(filter.statusFilter);
    setPaymentFilter(filter.paymentFilter);
    setCurrentPage(1);
  };

  const handleDeleteFilter = (filterId: number) => {
    setSavedFilters(savedFilters.filter(f => f.id !== filterId));
  };

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
        if (created) {
          toast.success("Proveedor creado exitosamente");
          setFormOpen(false);
        } else {
          toast.error("Error al crear el proveedor");
        }
      }
    } catch (error) {
      toast.error("Error al guardar el proveedor");
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

    const csvData = filteredSuppliers.map(s => ({
      Código: s.code,
      Nombre: s.name,
      Contacto: s.contactName || "",
      Email: s.email || "",
      Teléfono: s.phone || "",
      Ciudad: s.city || "",
      Dirección: s.address || "",
      "Términos de Pago": PAYMENT_LABEL[s.paymentTerms] ?? s.paymentTerms,
      "Límite de Crédito": formatCurrency(s.creditLimit),
      Estado: s.isActive ? "Activo" : "Inactivo",
    }));

    const headers = Object.keys(csvData[0]);
    const csv = [headers.join(","), ...csvData.map(row => headers.map(h => JSON.stringify(row[h as keyof typeof row] || "")).join(","))].join("\n");

    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `proveedores-${stamp}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success("Proveedores exportados exitosamente");
  };

  if (loading && suppliers.length === 0) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="h-32 w-full bg-muted animate-pulse rounded-lg" />
          <div className="h-64 w-full bg-muted animate-pulse rounded-lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error al cargar proveedores</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-gradient-to-br from-primary to-primary/70 rounded-xl shadow-lg">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Proveedores
                </h1>
                <p className="text-muted-foreground">
                  Gestión de proveedores y suministros médicos
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            <Button className="gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Nuevo Proveedor
            </Button>
          </div>
        </div>

        {/* Stats Cards con diseño de gradientes */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-none shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Proveedores</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground mt-1">Registrados en el sistema</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Building className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-none shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Activos</p>
                  <p className="text-3xl font-bold text-emerald-600">{stats.active}</p>
                  <div className="mt-1">
                    <Progress value={stats.activeRate} className="h-1.5" />
                  </div>
                </div>
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-none shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Límite Total</p>
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.totalCredit)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Crédito disponible</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-none shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Promedio Crédito</p>
                  <p className="text-2xl font-bold text-amber-600">{formatCurrency(stats.avgCredit)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Por proveedor</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros Avanzados */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-3">
                {/* Search Input */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre, código, contacto..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-9"
                  />
                </div>

                {/* Estado Filter */}
                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[130px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                  </SelectContent>
                </Select>

                {/* Términos Pago Filter */}
                <Select value={paymentFilter} onValueChange={(v) => { setPaymentFilter(v); setCurrentPage(1); }}>
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

                {/* Botones de Acción */}
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleClearFilters} className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Limpiar
                  </Button>

                  {/* Botón de ayuda - Tipos de Proveedores */}
                  <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <HelpCircle className="h-4 w-4" />
                        <span className="hidden sm:inline">Tipos</span>
                        <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-primary/10 text-primary text-[10px] font-bold ml-1">
                          ?
                        </span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-primary/10">
                            <Truck className="h-5 w-5 text-primary" />
                          </div>
                          Tipos de Proveedores Médicos
                        </DialogTitle>
                        <DialogDescription>
                          Clasificación común de proveedores en el sector salud
                        </DialogDescription>
                      </DialogHeader>

                      <div className="py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-3 p-4 rounded-lg border bg-gradient-to-br from-blue-50/50 to-transparent">
                            <div className="p-2 rounded-lg bg-blue-100">
                              <Package className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold">Farmacéuticos</p>
                              <p className="text-sm text-muted-foreground">Medicamentos, vacunas, sueros</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-4 rounded-lg border bg-gradient-to-br from-green-50/50 to-transparent">
                            <div className="p-2 rounded-lg bg-green-100">
                              <FileText className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-semibold">Insumos Médicos</p>
                              <p className="text-sm text-muted-foreground">Material desechable, gasas, jeringas</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-4 rounded-lg border bg-gradient-to-br from-purple-50/50 to-transparent">
                            <div className="p-2 rounded-lg bg-purple-100">
                              <Truck className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-semibold">Equipos Médicos</p>
                              <p className="text-sm text-muted-foreground">Monitores, ventiladores, rayos X</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-4 rounded-lg border bg-gradient-to-br from-amber-50/50 to-transparent">
                            <div className="p-2 rounded-lg bg-amber-100">
                              <Building className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                              <p className="font-semibold">Servicios</p>
                              <p className="text-sm text-muted-foreground">Mantenimiento, calibración, soporte</p>
                            </div>
                          </div>
                        </div>

                        {/* Tips adicionales */}
                        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                          <div className="flex items-start gap-3">
                            <Lightbulb className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                              <p className="text-sm font-medium mb-1">Tips para gestionar proveedores:</p>
                              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                                <li>Mantén actualizada la información de contacto</li>
                                <li>Registra los términos de pago acordados</li>
                                <li>Establece límites de crédito según el historial</li>
                                <li>Clasifica proveedores por tipo para mejor organización</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>

                      <DialogFooter>
                        <Button onClick={() => setShowHelpDialog(false)} variant="outline">
                          Entendido
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* Botón Guardar Filtro */}
                  <Dialog open={showSaveFilterDialog} onOpenChange={setShowSaveFilterDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <Save className="h-4 w-4" />
                        <span className="hidden sm:inline">Guardar filtro</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Guardar filtro personalizado</DialogTitle>
                        <DialogDescription>
                          Guarda la combinación actual de búsqueda y filtros para usarla rápidamente después.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="p-3 bg-muted/30 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-2">Vista previa del filtro:</p>
                          <div className="space-y-1 text-sm">
                            {searchQuery && <div>🔍 Buscar: "{searchQuery}"</div>}
                            {statusFilter !== "all" && <div>📊 Estado: {statusFilter === "active" ? "Activo" : "Inactivo"}</div>}
                            {paymentFilter !== "all" && <div>💰 Pago: {PAYMENT_LABEL[paymentFilter]}</div>}
                            {!searchQuery && statusFilter === "all" && paymentFilter === "all" && (
                              <div className="text-muted-foreground">Mostrando todos los proveedores</div>
                            )}
                          </div>
                        </div>
                        <div>
                          <Label>Nombre del filtro</Label>
                          <Input
                            value={filterName}
                            onChange={(e) => setFilterName(e.target.value)}
                            placeholder="Ej: Proveedores activos con crédito"
                            className="mt-1"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Usa un nombre descriptivo para identificar fácilmente este filtro después
                          </p>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowSaveFilterDialog(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleSaveFilter}>
                          <Save className="mr-2 h-4 w-4" />
                          Guardar filtro
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Filtros Guardados */}
              {savedFilters.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t">
                  <span className="text-xs text-muted-foreground">Filtros guardados:</span>
                  {savedFilters.map(filter => (
                    <Badge
                      key={filter.id}
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/80 group"
                      onClick={() => handleLoadFilter(filter)}
                    >
                      {filter.name}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1 p-0 hover:bg-transparent"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFilter(filter.id);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabla de Proveedores */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>Listado de Proveedores</CardTitle>
                <CardDescription>
                  {filteredSuppliers.length} proveedores encontrados
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredSuppliers.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <Truck className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No se encontraron proveedores</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery
                    ? `No hay resultados para "${searchQuery}"`
                    : "No hay proveedores registrados"}
                </p>
                <Button onClick={openCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar primer proveedor
                </Button>
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="cursor-pointer hover:bg-muted w-[120px]" onClick={() => handleSort('code')}>
                          <div className="flex items-center gap-1">
                            Código
                            {sortField === 'code' && (sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                            {sortField !== 'code' && <ArrowUpDown className="h-3 w-3 opacity-50" />}
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer hover:bg-muted min-w-[250px]" onClick={() => handleSort('name')}>
                          <div className="flex items-center gap-1">
                            Proveedor
                            {sortField === 'name' && (sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                            {sortField !== 'name' && <ArrowUpDown className="h-3 w-3 opacity-50" />}
                          </div>
                        </TableHead>
                        <TableHead className="min-w-[180px]">Contacto</TableHead>
                        <TableHead className="min-w-[150px]">Ubicación</TableHead>
                        <TableHead className="min-w-[150px]">Términos</TableHead>
                        <TableHead className="cursor-pointer hover:bg-muted w-[100px]" onClick={() => handleSort('creditLimit')}>
                          <div className="flex items-center gap-1">
                            Límite
                            {sortField === 'creditLimit' && (sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                            {sortField !== 'creditLimit' && <ArrowUpDown className="h-3 w-3 opacity-50" />}
                          </div>
                        </TableHead>
                        <TableHead className="w-[100px]">Estado</TableHead>
                        <TableHead className="w-[120px] text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedSuppliers.map((supplier) => (
                        <TableRow key={supplier.id} className="hover:bg-muted/50 transition-colors">
                          <TableCell>
                            <div className="font-mono text-xs font-semibold">
                              {supplier.code}
                            </div>
                            {supplier.taxId && (
                              <div className="text-xs text-muted-foreground truncate" title={supplier.taxId}>
                                {supplier.taxId}
                              </div>
                            )}
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
                                {supplier.city && `${supplier.city}, `}{supplier.state || ""}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center gap-1 text-sm cursor-help">
                                    <MapPin className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate max-w-[120px]" title={supplier.address}>
                                      {supplier.address || "—"}
                                    </span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>{supplier.address || "Dirección no registrada"}</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Badge variant="outline" className="text-xs">
                                {PAYMENT_LABEL[supplier.paymentTerms] ?? supplier.paymentTerms}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="gap-1 font-mono">
                              {formatCurrency(supplier.creditLimit)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {supplier.isActive ? (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100 gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Activo
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-gray-600 border-gray-300 gap-1">
                                <XCircle className="h-3 w-3" />
                                Inactivo
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => setViewing(supplier)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Ver detalles</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => openEdit(supplier)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Editar proveedor</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                      onClick={() => setDeleting(supplier)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Eliminar proveedor</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Paginación */}
                {filteredSuppliers.length > 0 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">
                        Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredSuppliers.length)} de {filteredSuppliers.length}
                      </p>
                      <Select value={itemsPerPage.toString()} onValueChange={(v) => { setItemsPerPage(Number(v)); setCurrentPage(1); }}>
                        <SelectTrigger className="w-[70px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Anterior
                      </Button>
                      <div className="flex gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum = currentPage;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              className="w-9"
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Siguiente
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
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

      {/* View Dialog */}
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