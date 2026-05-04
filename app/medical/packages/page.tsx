"use client";

import { useState, useMemo, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Plus,
  Edit,
  Copy,
  Package as PackageIcon,
  User,
  UserCheck,
  Calendar,
  DollarSign,
  CheckCircle,
  Eye,
  Filter,
  Download,
  Printer,
  Trash2,
  AlertTriangle,
  Box,
  RefreshCw,
  Archive,
  TrendingUp,
  TrendingDown,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { usePackages } from "@/hooks/medical-hooks/use-packages";
import { useProducts } from "@/hooks/inventory-hooks/use-products";
import { Packages } from "@/lib/api/types/medical-types/package.type";

export default function PackagesPage() {
  const { packages, pagination, isLoading, error, fetchPackages } = usePackages(
    { limit: 100 },
  );

  const { products } = useProducts(); // para seleccionar productos en el diálogo (mock pendiente de reemplazar)

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [doctorTypeFilter, setDoctorTypeFilter] = useState("all");
  const [selectedPackage, setSelectedPackage] = useState<Packages | null>(null);
  const [selectedPackageForCopy, setSelectedPackageForCopy] =
    useState<Packages | null>(null);
  const [isPackageDialogOpen, setIsPackageDialogOpen] = useState(false);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const [isProductsDialogOpen, setIsProductsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("list");

  // Formulario para crear/editar paquete
  const [packageForm, setPackageForm] = useState({
    code: "",
    name: "",
    description: "",
    doctor_type: "internal",
    internal_doctor_price: "",
    external_doctor_price: "",
    validity_days: "365",
    is_active: true,
  });

  const [copyForm, setCopyForm] = useState({
    new_year: new Date().getFullYear() + 1,
    price_increase_percentage: "10",
    copy_products: true,
  });

  // Lista temporal de productos asociados al paquete (mock, pendiente de integrar)
  const [packageProducts, setPackageProducts] = useState<any[]>([]);

  // Filtrar paquetes locales (búsqueda y filtros)
  const filteredPackages = useMemo(() => {
    if (!packages.length) return [];

    return packages.filter((pkg) => {
      const matchesSearch =
        pkg.name.toLowerCase().includes(search.toLowerCase()) ||
        pkg.code.toLowerCase().includes(search.toLowerCase()) ||
        (pkg.description &&
          pkg.description.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && pkg.is_active) ||
        (statusFilter === "inactive" && !pkg.is_active);

      const matchesDoctorType =
        doctorTypeFilter === "all" || pkg.doctor_type === doctorTypeFilter;

      return matchesSearch && matchesStatus && matchesDoctorType;
    });
  }, [packages, search, statusFilter, doctorTypeFilter]);

  // Estadísticas calculadas a partir de datos reales
  const stats = useMemo(() => {
    const activePackages = packages.filter((pkg) => pkg.is_active);
    const totalRevenue = activePackages.reduce((sum, pkg) => {
      const price =
        pkg.doctor_type === "internal"
          ? pkg.internal_doctor_price
          : pkg.external_doctor_price;
      return sum + (price || 0);
    }, 0);

    // Nota: estimated_cost no existe en el modelo real; lo simulamos con un promedio temporal
    // En un escenario real, deberías calcular el costo sumando los productos del paquete.
    const totalCost = activePackages.length * 1000; // placeholder

    const internalPackages = packages.filter(
      (pkg) => pkg.doctor_type === "internal",
    ).length;
    const externalPackages = packages.filter(
      (pkg) => pkg.doctor_type === "external",
    ).length;

    return {
      totalPackages: packages.length,
      activePackages: activePackages.length,
      internalPackages,
      externalPackages,
      totalRevenue,
      totalCost,
      totalProfit: totalRevenue - totalCost,
      avgProfitMargin: activePackages.length ? 35 : 0, // placeholder, debería calcularse con datos reales
    };
  }, [packages]);

  // Handlers
  const handleViewPackage = (pkg: Packages) => {
    setSelectedPackage(pkg);
    // Aquí deberías cargar los productos reales del paquete desde el backend
    setPackageProducts([]);
    setIsProductsDialogOpen(true);
  };

  const handleEditPackage = (pkg: Packages) => {
    setSelectedPackage(pkg);
    setPackageForm({
      code: pkg.code,
      name: pkg.name,
      description: pkg.description || "",
      doctor_type: pkg.doctor_type,
      internal_doctor_price: pkg.internal_doctor_price?.toString() || "",
      external_doctor_price: pkg.external_doctor_price?.toString() || "",
      validity_days: pkg.validity_days?.toString() || "365",
      is_active: pkg.is_active,
    });
    setIsPackageDialogOpen(true);
  };

  const handleCopyPackage = (pkg: Packages) => {
    setSelectedPackageForCopy(pkg);
    setCopyForm({
      new_year: new Date().getFullYear() + 1,
      price_increase_percentage: "10",
      copy_products: true,
    });
    setIsCopyDialogOpen(true);
  };

  const handleSavePackage = async () => {
    // Aquí llamar al servicio create/update
    console.log("Guardando paquete:", packageForm);
    setIsPackageDialogOpen(false);
    setSelectedPackage(null);
    setPackageForm({
      code: "",
      name: "",
      description: "",
      doctor_type: "internal",
      internal_doctor_price: "",
      external_doctor_price: "",
      validity_days: "365",
      is_active: true,
    });
    await fetchPackages(); // refrescar lista
  };

  const handleCopyPackageSubmit = async () => {
    console.log("Copiando paquete:", selectedPackageForCopy, "con:", copyForm);
    setIsCopyDialogOpen(false);
    setSelectedPackageForCopy(null);
    await fetchPackages();
  };

  const handleAddProduct = () => {
    // Lógica para añadir producto al paquete
  };

  const handleRemoveProduct = (index: number) => {
    // Lógica para eliminar producto
  };

  const handleProductChange = (index: number, field: string, value: any) => {
    // Lógica para modificar producto
  };

  const getPackagePrice = (pkg: Packages) => {
    return pkg.doctor_type === "internal"
      ? pkg.internal_doctor_price || 0
      : pkg.external_doctor_price || 0;
  };

  const getDoctorTypeIcon = (type: string) => {
    return type === "internal" ? (
      <UserCheck className="h-4 w-4" />
    ) : (
      <User className="h-4 w-4" />
    );
  };

  const calculateTotalCost = () => {
    return packageProducts.reduce(
      (sum, p) => sum + parseFloat(p.total_cost || 0),
      0,
    );
  };

  if (isLoading && !packages.length) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Loader2 className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <p className="mt-4 text-muted-foreground">Cargando paquetes...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <PackageIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Gestión de Paquetes
              </h1>
              <p className="text-muted-foreground">
                Administra paquetes quirúrgicos y médicos para procedimientos
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() =>
                setActiveTab(activeTab === "list" ? "analysis" : "list")
              }
            >
              {activeTab === "list" ? (
                <>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Análisis
                </>
              ) : (
                <>
                  <PackageIcon className="mr-2 h-4 w-4" />
                  Ver Lista
                </>
              )}
            </Button>
            <Dialog
              open={isPackageDialogOpen}
              onOpenChange={setIsPackageDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setSelectedPackage(null);
                    setPackageForm({
                      code: "",
                      name: "",
                      description: "",
                      doctor_type: "internal",
                      internal_doctor_price: "",
                      external_doctor_price: "",
                      validity_days: "365",
                      is_active: true,
                    });
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Paquete
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {selectedPackage ? "Editar Paquete" : "Crear Nuevo Paquete"}
                  </DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[60vh] pr-4">
                  <div className="space-y-6">
                    {/* Formulario similar al original, pero usando datos reales */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="code">Código *</Label>
                        <Input
                          id="code"
                          value={packageForm.code}
                          onChange={(e) =>
                            setPackageForm({
                              ...packageForm,
                              code: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="name">Nombre *</Label>
                        <Input
                          id="name"
                          value={packageForm.name}
                          onChange={(e) =>
                            setPackageForm({
                              ...packageForm,
                              name: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Descripción</Label>
                      <Textarea
                        id="description"
                        value={packageForm.description}
                        onChange={(e) =>
                          setPackageForm({
                            ...packageForm,
                            description: e.target.value,
                          })
                        }
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo de Médico *</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div
                          className={`flex items-center space-x-2 p-4 border rounded-lg cursor-pointer ${
                            packageForm.doctor_type === "internal"
                              ? "border-primary bg-primary/5"
                              : "border-muted"
                          }`}
                          onClick={() =>
                            setPackageForm({
                              ...packageForm,
                              doctor_type: "internal",
                            })
                          }
                        >
                          <UserCheck className="h-5 w-5" />
                          <div className="flex-1">
                            <div className="font-medium">Médico Interno</div>
                            <div className="text-sm text-muted-foreground">
                              Personal del hospital
                            </div>
                          </div>
                          {packageForm.doctor_type === "internal" && (
                            <CheckCircle className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div
                          className={`flex items-center space-x-2 p-4 border rounded-lg cursor-pointer ${
                            packageForm.doctor_type === "external"
                              ? "border-primary bg-primary/5"
                              : "border-muted"
                          }`}
                          onClick={() =>
                            setPackageForm({
                              ...packageForm,
                              doctor_type: "external",
                            })
                          }
                        >
                          <User className="h-5 w-5" />
                          <div className="flex-1">
                            <div className="font-medium">Médico Externo</div>
                            <div className="text-sm text-muted-foreground">
                              Médico externo
                            </div>
                          </div>
                          {packageForm.doctor_type === "external" && (
                            <CheckCircle className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="internal_price">
                          Precio Médico Interno (Q)
                        </Label>
                        <Input
                          id="internal_price"
                          type="number"
                          step="0.01"
                          value={packageForm.internal_doctor_price}
                          onChange={(e) =>
                            setPackageForm({
                              ...packageForm,
                              internal_doctor_price: e.target.value,
                            })
                          }
                          disabled={packageForm.doctor_type === "external"}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="external_price">
                          Precio Médico Externo (Q)
                        </Label>
                        <Input
                          id="external_price"
                          type="number"
                          step="0.01"
                          value={packageForm.external_doctor_price}
                          onChange={(e) =>
                            setPackageForm({
                              ...packageForm,
                              external_doctor_price: e.target.value,
                            })
                          }
                          disabled={packageForm.doctor_type === "internal"}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="validity_days">Días de Validez *</Label>
                        <Input
                          id="validity_days"
                          type="number"
                          value={packageForm.validity_days}
                          onChange={(e) =>
                            setPackageForm({
                              ...packageForm,
                              validity_days: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status">Estado</Label>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="status"
                            checked={packageForm.is_active}
                            onCheckedChange={(checked) =>
                              setPackageForm({
                                ...packageForm,
                                is_active: checked,
                              })
                            }
                          />
                          <Label htmlFor="status" className="cursor-pointer">
                            {packageForm.is_active ? "Activo" : "Inactivo"}
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsPackageDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleSavePackage}>
                    {selectedPackage ? "Actualizar Paquete" : "Crear Paquete"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards (con datos reales) */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <PackageIcon className="h-8 w-8 text-primary flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    Total Paquetes
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalPackages}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {stats.activePackages} activos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    Ingreso Total
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    Q
                    {stats.totalRevenue.toLocaleString("es-GT", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Q
                    {stats.totalProfit.toLocaleString("es-GT", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    ganancia
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <UserCheck className="h-8 w-8 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    Paquetes Internos
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.internalPackages}
                  </p>
                  <p className="text-[11px] text-gray-500">Médicos internos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <User className="h-8 w-8 text-purple-600 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    Paquetes Externos
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.externalPackages}
                  </p>
                  <p className="text-[11px] text-gray-500">Médicos externos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="list">Lista de Paquetes</TabsTrigger>
            <TabsTrigger value="analysis">Análisis Financiero</TabsTrigger>
          </TabsList>

          {/* Lista de Paquetes */}
          <TabsContent value="list" className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar paquetes por nombre, código o descripción..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="active">Activos</SelectItem>
                        <SelectItem value="inactive">Inactivos</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={doctorTypeFilter}
                      onValueChange={setDoctorTypeFilter}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Tipo Médico" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="internal">Interno</SelectItem>
                        <SelectItem value="external">Externo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Paquetes del Sistema</CardTitle>
                <CardDescription>
                  {filteredPackages.length}{" "}
                  {filteredPackages.length === 1
                    ? "paquete encontrado"
                    : "paquetes encontrados"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Precio</TableHead>
                      <TableHead>Validez</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPackages.map((pkg) => {
                      const price = getPackagePrice(pkg);
                      const isExpired =
                        (pkg.validity_days || 0) < 365 && pkg.is_active;

                      return (
                        <TableRow key={pkg.id}>
                          <TableCell className="font-medium">
                            <Badge variant="outline" className="font-mono">
                              {pkg.code}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{pkg.name}</span>
                              {pkg.description && (
                                <span className="text-xs text-muted-foreground line-clamp-1">
                                  {pkg.description}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getDoctorTypeIcon(pkg.doctor_type)}
                              <Badge variant="outline" className="text-xs">
                                {pkg.doctor_type === "internal"
                                  ? "Interno"
                                  : "Externo"}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="font-medium">
                              Q
                              {price.toLocaleString("es-GT", {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">
                                {pkg.validity_days} días
                              </span>
                              {isExpired && (
                                <Badge
                                  variant="outline"
                                  className="gap-1 text-xs bg-warning/10 text-warning"
                                >
                                  <AlertTriangle className="h-3 w-3" />
                                  Corta
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={pkg.is_active ? "default" : "secondary"}
                            >
                              {pkg.is_active ? "Activo" : "Inactivo"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewPackage(pkg)}
                                title="Ver productos"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {pkg.is_active && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleCopyPackage(pkg)}
                                  title="Copiar para próximo año"
                                  className="text-blue-600"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditPackage(pkg)}
                                title="Editar"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Filter className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>
                                    Acciones
                                  </DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={() => handleViewPackage(pkg)}
                                  >
                                    <Eye className="mr-2 h-4 w-4" /> Ver
                                    Productos
                                  </DropdownMenuItem>
                                  {pkg.is_active && (
                                    <DropdownMenuItem
                                      onClick={() => handleCopyPackage(pkg)}
                                    >
                                      <Copy className="mr-2 h-4 w-4" /> Copiar
                                      para {new Date().getFullYear() + 1}
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem
                                    onClick={() => handleEditPackage(pkg)}
                                  >
                                    <Edit className="mr-2 h-4 w-4" /> Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Printer className="mr-2 h-4 w-4" />{" "}
                                    Imprimir
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-destructive">
                                    <Archive className="mr-2 h-4 w-4" />{" "}
                                    {pkg.is_active ? "Desactivar" : "Activar"}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex-col items-start gap-2 border-t px-6 py-4">
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Margen promedio:</span>{" "}
                  {stats.avgProfitMargin.toFixed(1)}%
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" /> Exportar
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Printer className="h-4 w-4" /> Imprimir Catálogo
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Análisis Financiero (simplificado, usando datos reales) */}
          <TabsContent value="analysis">
            <Card>
              <CardHeader>
                <CardTitle>Análisis Financiero de Paquetes</CardTitle>
                <CardDescription>
                  Rentabilidad y comparación de paquetes activos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                          Ingresos Totales
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-success">
                          Q
                          {stats.totalRevenue.toLocaleString("es-GT", {
                            minimumFractionDigits: 2,
                          })}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          De {stats.activePackages} paquetes activos
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                          Costos Totales (estimado)
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-destructive">
                          Q
                          {stats.totalCost.toLocaleString("es-GT", {
                            minimumFractionDigits: 2,
                          })}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Cálculo basado en productos promedio
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                          Ganancia Neta
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-primary">
                          Q
                          {stats.totalProfit.toLocaleString("es-GT", {
                            minimumFractionDigits: 2,
                          })}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {stats.avgProfitMargin.toFixed(1)}% margen promedio
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Rentabilidad por Paquete
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Paquete</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead className="text-right">Precio</TableHead>
                            <TableHead className="text-right">
                              Costo Estimado
                            </TableHead>
                            <TableHead className="text-right">
                              Ganancia
                            </TableHead>
                            <TableHead className="text-right">Margen</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {packages
                            .filter((pkg) => pkg.is_active)
                            .map((pkg) => {
                              const price = getPackagePrice(pkg);
                              const cost = 1000; // placeholder
                              const profit = price - cost;
                              const margin = (profit / price) * 100;
                              return (
                                <TableRow key={pkg.id}>
                                  <TableCell>
                                    <div className="font-medium">
                                      {pkg.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {pkg.code}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline">
                                      {pkg.doctor_type === "internal"
                                        ? "Interno"
                                        : "Externo"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    Q{Number(price).toFixed(2)}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    Q{Number(cost).toFixed(2)}
                                  </TableCell>
                                  <TableCell className="text-right font-medium text-success">
                                    Q{profit.toFixed(2)}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Badge
                                      className={
                                        margin > 40
                                          ? "bg-success/10 text-success"
                                          : margin > 20
                                            ? "bg-warning/10 text-warning"
                                            : "bg-destructive/10 text-destructive"
                                      }
                                    >
                                      {margin.toFixed(1)}%
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Diálogo Copiar Paquete (similar al mock) */}
        <Dialog open={isCopyDialogOpen} onOpenChange={setIsCopyDialogOpen}>
          <DialogContent className="max-w-md">
            {selectedPackageForCopy && (
              <>
                <DialogHeader>
                  <DialogTitle>Copiar Paquete</DialogTitle>
                  <CardDescription>
                    Crear una nueva versión del paquete para el próximo año
                  </CardDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <PackageIcon className="h-8 w-8 text-primary" />
                      <div>
                        <div className="font-medium">
                          {selectedPackageForCopy.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {selectedPackageForCopy.code}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Año Nuevo</Label>
                      <Select
                        value={copyForm.new_year.toString()}
                        onValueChange={(v) =>
                          setCopyForm({ ...copyForm, new_year: parseInt(v) })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[2025, 2026, 2027, 2028].map((y) => (
                            <SelectItem key={y} value={y.toString()}>
                              {y}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Aumento de Precio (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="50"
                        step="0.5"
                        value={copyForm.price_increase_percentage}
                        onChange={(e) =>
                          setCopyForm({
                            ...copyForm,
                            price_increase_percentage: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="copy_products"
                        checked={copyForm.copy_products}
                        onCheckedChange={(c) =>
                          setCopyForm({ ...copyForm, copy_products: !!c })
                        }
                      />
                      <Label htmlFor="copy_products">
                        Copiar productos del paquete
                      </Label>
                    </div>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">
                          Nuevo código:
                        </div>
                        <div className="font-mono text-lg font-bold text-primary">
                          {selectedPackageForCopy.code.replace(
                            /\d{4}$/,
                            copyForm.new_year.toString(),
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Precio estimado: Q
                          {(
                            getPackagePrice(selectedPackageForCopy) *
                            (1 +
                              parseFloat(copyForm.price_increase_percentage) /
                                100)
                          ).toFixed(2)}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCopyDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleCopyPackageSubmit}>
                    <Copy className="mr-2 h-4 w-4" />
                    Crear Nuevo Paquete
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Diálogo Productos del Paquete (pendiente de conectar a API real) */}
        <Dialog
          open={isProductsDialogOpen}
          onOpenChange={setIsProductsDialogOpen}
        >
          <DialogContent className="max-w-4xl">
            {selectedPackage && (
              <>
                <DialogHeader>
                  <DialogTitle>Productos del Paquete</DialogTitle>
                  <CardDescription>
                    Paquete:{" "}
                    <span className="font-mono">{selectedPackage.code}</span>
                  </CardDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold">
                          {packageProducts.length}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Productos
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold">
                          {packageProducts.reduce((s, p) => s + p.quantity, 0)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Total unidades
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-destructive">
                          Q{calculateTotalCost().toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Costo total
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <h3 className="font-semibold">Lista de Productos</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddProduct}
                      >
                        <Plus className="mr-2 h-3 w-3" />
                        Agregar Producto
                      </Button>
                    </div>
                    <Card>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Producto</TableHead>
                              <TableHead>Cantidad</TableHead>
                              <TableHead className="text-right">
                                Costo Unitario
                              </TableHead>
                              <TableHead className="text-right">
                                Costo Total
                              </TableHead>
                              <TableHead></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {packageProducts.map((prod, idx) => (
                              <TableRow key={idx}>
                                <TableCell>
                                  <Select
                                    value={prod.product_id}
                                    onValueChange={(v) =>
                                      handleProductChange(idx, "product_id", v)
                                    }
                                  >
                                    <SelectTrigger className="w-[300px]">
                                      <SelectValue placeholder="Seleccionar" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {/* mock productos */}
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    min="1"
                                    value={prod.quantity}
                                    onChange={(e) =>
                                      handleProductChange(
                                        idx,
                                        "quantity",
                                        e.target.value,
                                      )
                                    }
                                    className="w-24"
                                  />
                                </TableCell>
                                <TableCell className="text-right">
                                  Q{parseFloat(prod.unit_cost || 0).toFixed(2)}
                                </TableCell>
                                <TableCell className="text-right">
                                  Q{parseFloat(prod.total_cost || 0).toFixed(2)}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveProduct(idx)}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsProductsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={() => setIsProductsDialogOpen(false)}>
                    Guardar Cambios
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
