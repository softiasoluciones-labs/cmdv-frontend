"use client";

import { useState, useMemo, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
  DialogFooter,
  DialogDescription,
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
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
  TrendingUp,
  TrendingDown,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Save,
  X,
  MoreHorizontal,
  Building2,
  Heart,
  XCircle,
  Archive,
  HelpCircle,
  FileText,
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { usePackages } from "@/hooks/medical-hooks/use-packages";
import { useProducts } from "@/hooks/inventory-hooks/use-products";
import { useServices } from "@/hooks/medical-hooks/use-services";
import { Packages } from "@/lib/api/types/medical-types/package.type";
import { cn } from "@/lib/utils";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { Separator } from "@radix-ui/react-dropdown-menu";

type SortField = 'code' | 'name' | 'doctor_type' | 'validity_days' | 'is_active' | 'price';
type SortOrder = 'asc' | 'desc';

export default function PackagesPage() {
  const { packages, pagination, isLoading, error, fetchPackages, createPackage, copyPackage, updatePackage, deactivatePackage } = usePackages({ limit: 1000 });
  const { products } = useProducts();
  const { services } = useServices({ limit: 100 });

  // Estados para filtros y ordenamiento
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [doctorTypeFilter, setDoctorTypeFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [savedFilters, setSavedFilters] = useState<any[]>([]);
  const [filterName, setFilterName] = useState("");
  const [showSaveFilterDialog, setShowSaveFilterDialog] = useState(false);

  // Estados generales
  const [selectedPackage, setSelectedPackage] = useState<Packages | null>(null);
  const [selectedPackageForCopy, setSelectedPackageForCopy] = useState<Packages | null>(null);
  const [isPackageDialogOpen, setIsPackageDialogOpen] = useState(false);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const [isProductsDialogOpen, setIsProductsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("list");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formulario para crear/editar paquete
  const [packageForm, setPackageForm] = useState({
    code: "",
    name: "",
    service_id: "",
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
    new_name: "",
  });

  const [packageProducts, setPackageProducts] = useState<any[]>([]);

  // Cargar filtros guardados
  useEffect(() => {
    const saved = localStorage.getItem("savedPackageFilters");
    if (saved) {
      try {
        setSavedFilters(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading saved filters:", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("savedPackageFilters", JSON.stringify(savedFilters));
  }, [savedFilters]);

  // Filtrar y ordenar paquetes
  const filteredPackages = useMemo(() => {
    if (!packages.length) return [];

    let filtered = packages.filter((pkg) => {
      const matchesSearch =
        pkg.name.toLowerCase().includes(search.toLowerCase()) ||
        pkg.code.toLowerCase().includes(search.toLowerCase()) ||
        (pkg.description && pkg.description.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && pkg.is_active) ||
        (statusFilter === "inactive" && !pkg.is_active);

      const matchesDoctorType =
        doctorTypeFilter === "all" || pkg.doctor_type === doctorTypeFilter;

      return matchesSearch && matchesStatus && matchesDoctorType;
    });

    // Ordenar - manejando campos especiales por separado
    filtered.sort((a, b) => {
      // Caso especial para precio (campo calculado)
      if (sortField === 'price') {
        const aPrice = a.doctor_type === "internal" ? a.internal_doctor_price || 0 : a.external_doctor_price || 0;
        const bPrice = b.doctor_type === "internal" ? b.internal_doctor_price || 0 : b.external_doctor_price || 0;
        return sortOrder === 'asc' ? aPrice - bPrice : bPrice - aPrice;
      }

      // Caso especial para doctor_type (para ordenar por texto legible)
      if (sortField === 'doctor_type') {
        const aLabel = a.doctor_type === "internal" ? "Interno" : "Externo";
        const bLabel = b.doctor_type === "internal" ? "Interno" : "Externo";
        return sortOrder === 'asc'
          ? aLabel.localeCompare(bLabel)
          : bLabel.localeCompare(aLabel);
      }

      // Caso especial para is_active (booleano)
      if (sortField === 'is_active') {
        const aValue = a.is_active ? 1 : 0;
        const bValue = b.is_active ? 1 : 0;
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Para campos normales que existen en el tipo
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

    return filtered;
  }, [packages, search, statusFilter, doctorTypeFilter, sortField, sortOrder]);

  // Paginación
  const totalPages = Math.ceil(filteredPackages.length / itemsPerPage);
  const paginatedPackages = filteredPackages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Estadísticas
  const stats = useMemo(() => {
    const activePackages = packages.filter((pkg) => pkg.is_active);
    const totalRevenue = activePackages.reduce((sum, pkg) => {
      const price = pkg.doctor_type === "internal" ? pkg.internal_doctor_price : pkg.external_doctor_price;
      return sum + (price || 0);
    }, 0);
    const totalCost = activePackages.length * 1000;
    const internalPackages = packages.filter((pkg) => pkg.doctor_type === "internal").length;
    const externalPackages = packages.filter((pkg) => pkg.doctor_type === "external").length;

    return {
      totalPackages: packages.length,
      activePackages: activePackages.length,
      internalPackages,
      externalPackages,
      totalRevenue,
      totalCost,
      totalProfit: totalRevenue - totalCost,
      avgProfitMargin: activePackages.length ? 35 : 0,
      activeRate: packages.length ? (activePackages.length / packages.length) * 100 : 0,
    };
  }, [packages]);

  // Handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setDoctorTypeFilter("all");
    setCurrentPage(1);
  };

  const handleSaveFilter = () => {
    if (filterName.trim()) {
      const newFilter = {
        id: Date.now(),
        name: filterName,
        search,
        statusFilter,
        doctorTypeFilter,
        createdAt: new Date().toISOString(),
      };
      setSavedFilters([...savedFilters, newFilter]);
      setFilterName("");
      setShowSaveFilterDialog(false);
    }
  };

  const handleLoadFilter = (filter: any) => {
    setSearch(filter.search);
    setStatusFilter(filter.statusFilter);
    setDoctorTypeFilter(filter.doctorTypeFilter);
    setCurrentPage(1);
  };

  const handleDeleteFilter = (filterId: number) => {
    setSavedFilters(savedFilters.filter((f) => f.id !== filterId));
  };

  const handleViewPackage = (pkg: Packages) => {
    setSelectedPackage(pkg);
    setPackageProducts(pkg.package_details || []);
    setIsProductsDialogOpen(true);
  };

  const handleEditPackage = (pkg: Packages) => {
    setSelectedPackage(pkg);
    setPackageForm({
      code: pkg.code,
      name: pkg.name,
      service_id: pkg.service_id || "",
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
      new_name: ""
    });
    setIsCopyDialogOpen(true);
  };

  const handleSavePackage = async () => {
    setIsSubmitting(true);
    try {
      const codeValue = packageForm.code.trim().toUpperCase().slice(0, 30);
      const nameValue = packageForm.name.trim().slice(0, 200);

      const packageData = {
        code: codeValue,
        name: nameValue,
        service_id: packageForm.service_id || undefined,
        description: packageForm.description,
        doctor_type: packageForm.doctor_type as "internal" | "external",
        internal_doctor_price: packageForm.internal_doctor_price ? parseFloat(packageForm.internal_doctor_price) : undefined,
        external_doctor_price: packageForm.external_doctor_price ? parseFloat(packageForm.external_doctor_price) : undefined,
        validity_days: packageForm.validity_days ? parseInt(packageForm.validity_days, 10) : 365,
        is_active: packageForm.is_active,
      };

      if (selectedPackage) {
        await updatePackage(selectedPackage.id, {
          description: packageData.description,
          external_doctor_price: packageData.external_doctor_price,
          internal_doctor_price: packageData.internal_doctor_price,
        });
      } else {
        await createPackage(packageData as any);
      }

      setIsPackageDialogOpen(false);
      setSelectedPackage(null);
      setPackageForm({
        code: "",
        name: "",
        service_id: "",
        description: "",
        doctor_type: "internal",
        internal_doctor_price: "",
        external_doctor_price: "",
        validity_days: "365",
        is_active: true,
      });
    } catch (error) {
      console.error("Error saving package:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyPackageSubmit = async () => {
    if (!selectedPackageForCopy) return;

    setIsSubmitting(true);
    try {
      const currentPrice = selectedPackageForCopy.doctor_type === "internal"
        ? selectedPackageForCopy.internal_doctor_price
        : selectedPackageForCopy.external_doctor_price;

      const newPrice = currentPrice
        ? currentPrice * (1 + parseFloat(copyForm.price_increase_percentage) / 100)
        : undefined;

      await copyPackage(selectedPackageForCopy.id, {
        name: `${selectedPackageForCopy.name} ${copyForm.new_year}`.slice(0, 200),
        description: selectedPackageForCopy.description || undefined,
        internal_doctor_price: selectedPackageForCopy.doctor_type === "internal" ? newPrice : undefined,
        external_doctor_price: selectedPackageForCopy.doctor_type === "external" ? newPrice : undefined,
      });

      setIsCopyDialogOpen(false);
      setSelectedPackageForCopy(null);
      setCopyForm({
        new_year: new Date().getFullYear() + 1,
        price_increase_percentage: "10",
        copy_products: true,
        new_name: ""
      });
    } catch (error) {
      console.error("Error copying package:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePackageStatus = async (pkg: Packages) => {
    try {
      await deactivatePackage(pkg.id);
    } catch (error) {
      console.error("Error toggling package status:", error);
    }
  };

  const getPackagePrice = (pkg: Packages) => {
    return pkg.doctor_type === "internal" ? pkg.internal_doctor_price || 0 : pkg.external_doctor_price || 0;
  };

  const getDoctorTypeIcon = (type: string) => {
    return type === "internal" ? <UserCheck className="h-4 w-4" /> : <User className="h-4 w-4" />;
  };

  const getDoctorTypeBadge = (type: string) => {
    return type === "internal" ? (
      <Badge className="bg-purple-100 text-purple-700 gap-1">
        <UserCheck className="h-3 w-3" />
        Interno
      </Badge>
    ) : (
      <Badge className="bg-orange-100 text-orange-700 gap-1">
        <User className="h-3 w-3" />
        Externo
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-GT", {
      style: "currency",
      currency: "GTQ",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (isLoading && !packages.length) {
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
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-gradient-to-br from-primary to-primary/70 rounded-xl shadow-lg">
                <PackageIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Gestión de Paquetes
                </h1>
                <p className="text-muted-foreground">
                  Administra paquetes quirúrgicos y médicos para procedimientos
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setActiveTab(activeTab === "list" ? "analysis" : "list")}
              className="gap-2"
            >
              {activeTab === "list" ? (
                <>
                  <TrendingUp className="h-4 w-4" />
                  Análisis
                </>
              ) : (
                <>
                  <PackageIcon className="h-4 w-4" />
                  Ver Lista
                </>
              )}
            </Button>
            <Button
              onClick={() => {
                setSelectedPackage(null);
                setPackageForm({
                  code: "",
                  name: "",
                  service_id: "",
                  description: "",
                  doctor_type: "internal",
                  internal_doctor_price: "",
                  external_doctor_price: "",
                  validity_days: "365",
                  is_active: true,
                });
                setIsPackageDialogOpen(true);
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Nuevo Paquete
            </Button>
          </div>
        </div>

        {/* Stats Cards con gradientes */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-none shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Paquetes</p>
                  <p className="text-3xl font-bold">{stats.totalPackages}</p>
                  <div className="mt-1 w-24">
                    <Progress value={stats.activeRate} className="h-1.5" />
                  </div>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <PackageIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-none shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ingreso Total</p>
                  <p className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.totalRevenue)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatCurrency(stats.totalProfit)} ganancia</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-none shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Paquetes Internos</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.internalPackages}</p>
                  <p className="text-xs text-muted-foreground mt-1">Médicos internos</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-none shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Paquetes Externos</p>
                  <p className="text-3xl font-bold text-amber-600">{stats.externalPackages}</p>
                  <p className="text-xs text-muted-foreground mt-1">Médicos externos</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-[300px] grid-cols-2">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <PackageIcon className="h-4 w-4" />
              Lista
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Análisis
            </TabsTrigger>
          </TabsList>

          {/* Tab: Lista de Paquetes */}
          <TabsContent value="list" className="space-y-4">
            {/* Filtros Avanzados */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por nombre, código o descripción..."
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="pl-9"
                      />
                    </div>

                    <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
                      <SelectTrigger className="w-[140px]">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="active">Activos</SelectItem>
                        <SelectItem value="inactive">Inactivos</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={doctorTypeFilter} onValueChange={(v) => { setDoctorTypeFilter(v); setCurrentPage(1); }}>
                      <SelectTrigger className="w-[160px]">
                        <User className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Tipo Médico" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="internal">Interno</SelectItem>
                        <SelectItem value="external">Externo</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleClearFilters} className="gap-2">
                        <Trash2 className="h-4 w-4" />
                        Limpiar
                      </Button>

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
                                {search && <div>🔍 Buscar: "{search}"</div>}
                                {statusFilter !== "all" && <div>📊 Estado: {statusFilter === "active" ? "Activos" : "Inactivos"}</div>}
                                {doctorTypeFilter !== "all" && <div>👨‍⚕️ Tipo: {doctorTypeFilter === "internal" ? "Interno" : "Externo"}</div>}
                              </div>
                            </div>
                            <div>
                              <Label>Nombre del filtro</Label>
                              <Input
                                value={filterName}
                                onChange={(e) => setFilterName(e.target.value)}
                                placeholder="Ej: Paquetes activos internos"
                                className="mt-1"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setShowSaveFilterDialog(false)}>Cancelar</Button>
                            <Button onClick={handleSaveFilter}>Guardar filtro</Button>
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

            {/* Tabla de Paquetes */}
            <Card>
              <CardHeader>
                <CardTitle>Paquetes del Sistema</CardTitle>
                <CardDescription>
                  {filteredPackages.length} {filteredPackages.length === 1 ? "paquete encontrado" : "paquetes encontrados"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="cursor-pointer hover:bg-muted w-[120px]" onClick={() => handleSort("code")}>
                          <div className="flex items-center gap-1">
                            Código
                            {sortField === "code" && (sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                            {sortField !== "code" && <ArrowUpDown className="h-3 w-3 opacity-50" />}
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer hover:bg-muted" onClick={() => handleSort("name")}>
                          <div className="flex items-center gap-1">
                            Nombre
                            {sortField === "name" && (sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                            {sortField !== "name" && <ArrowUpDown className="h-3 w-3 opacity-50" />}
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer hover:bg-muted w-[120px]" onClick={() => handleSort("doctor_type")}>
                          <div className="flex items-center gap-1">
                            Tipo
                            {sortField === "doctor_type" && (sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                            {sortField !== "doctor_type" && <ArrowUpDown className="h-3 w-3 opacity-50" />}
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer hover:bg-muted text-right w-[150px]" onClick={() => handleSort("price")}>
                          <div className="flex items-center justify-end gap-1">
                            Precio
                            {sortField === "price" && (sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                            {sortField !== "price" && <ArrowUpDown className="h-3 w-3 opacity-50" />}
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer hover:bg-muted w-[100px]" onClick={() => handleSort("validity_days")}>
                          <div className="flex items-center gap-1">
                            Validez
                            {sortField === "validity_days" && (sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                            {sortField !== "validity_days" && <ArrowUpDown className="h-3 w-3 opacity-50" />}
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer hover:bg-muted w-[100px]" onClick={() => handleSort("is_active")}>
                          <div className="flex items-center gap-1">
                            Estado
                            {sortField === "is_active" && (sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                            {sortField !== "is_active" && <ArrowUpDown className="h-3 w-3 opacity-50" />}
                          </div>
                        </TableHead>
                        <TableHead className="text-right w-[100px]">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedPackages.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                            No se encontraron paquetes
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedPackages.map((pkg) => {
                          const price = getPackagePrice(pkg);
                          const isExpired = (pkg.validity_days || 0) < 365 && pkg.is_active;

                          return (
                            <TableRow key={pkg.id} className="hover:bg-muted/50 transition-colors">
                              <TableCell className="font-mono text-sm font-medium">
                                {pkg.code}
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
                              <TableCell>{getDoctorTypeBadge(pkg.doctor_type)}</TableCell>
                              <TableCell className="text-right font-bold text-primary">
                                {formatCurrency(price)}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-sm">{pkg.validity_days} días</span>
                                  {isExpired && (
                                    <Badge variant="outline" className="gap-1 text-xs bg-yellow-500/10 text-yellow-600">
                                      <AlertTriangle className="h-3 w-3" />
                                      Corta
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                {pkg.is_active ? (
                                  <Badge className="bg-green-100 text-green-800 gap-1">
                                    <CheckCircle className="h-3 w-3" />
                                    Activo
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-muted-foreground gap-1">
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
                                          onClick={() => handleViewPackage(pkg)}
                                        >
                                          <Eye className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Ver productos</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>

                                  {pkg.is_active && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-blue-600"
                                            onClick={() => handleCopyPackage(pkg)}
                                          >
                                            <Copy className="h-4 w-4" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Copiar para próximo año</TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}

                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={() => handleEditPackage(pkg)}
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Editar paquete</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>

                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                      <DropdownMenuItem onClick={() => handleViewPackage(pkg)}>
                                        <Eye className="mr-2 h-4 w-4" /> Ver Productos
                                      </DropdownMenuItem>
                                      {pkg.is_active && (
                                        <DropdownMenuItem onClick={() => handleCopyPackage(pkg)}>
                                          <Copy className="mr-2 h-4 w-4" /> Copiar para {new Date().getFullYear() + 1}
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuItem onClick={() => handleEditPackage(pkg)}>
                                        <Edit className="mr-2 h-4 w-4" /> Editar
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <Printer className="mr-2 h-4 w-4" /> Imprimir
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      {pkg.is_active && (
                                        <DropdownMenuItem className="text-destructive" onClick={() => handleTogglePackageStatus(pkg)}>
                                          <Archive className="mr-2 h-4 w-4" /> Desactivar
                                        </DropdownMenuItem>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Paginación */}
                {filteredPackages.length > 0 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">
                        Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredPackages.length)} de {filteredPackages.length}
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Análisis Financiero */}
          <TabsContent value="analysis">
            <Card>
              <CardHeader>
                <CardTitle>Análisis Financiero de Paquetes</CardTitle>
                <CardDescription>Rentabilidad y comparación de paquetes activos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-none">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Ingresos Totales</p>
                            <p className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.totalRevenue)}</p>
                            <p className="text-xs text-muted-foreground">De {stats.activePackages} paquetes activos</p>
                          </div>
                          <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-emerald-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950/20 dark:to-red-950/20 border-none">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Costos Totales</p>
                            <p className="text-2xl font-bold text-rose-600">{formatCurrency(stats.totalCost)}</p>
                            <p className="text-xs text-muted-foreground">Cálculo basado en productos promedio</p>
                          </div>
                          <div className="h-10 w-10 rounded-full bg-rose-500/10 flex items-center justify-center">
                            <TrendingDown className="h-5 w-5 text-rose-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-none">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Ganancia Neta</p>
                            <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.totalProfit)}</p>
                            <p className="text-xs text-muted-foreground">{stats.avgProfitMargin.toFixed(1)}% margen promedio</p>
                          </div>
                          <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Rentabilidad por Paquete</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead>Paquete</TableHead>
                              <TableHead>Tipo</TableHead>
                              <TableHead className="text-right">Precio</TableHead>
                              <TableHead className="text-right">Costo Estimado</TableHead>
                              <TableHead className="text-right">Ganancia</TableHead>
                              <TableHead className="text-right">Margen</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {packages.filter((pkg) => pkg.is_active).map((pkg) => {
                              const price = getPackagePrice(pkg);
                              const cost = 1000;
                              const profit = price - cost;
                              const margin = (profit / price) * 100;
                              return (
                                <TableRow key={pkg.id} className="hover:bg-muted/50">
                                  <TableCell>
                                    <div className="font-medium">{pkg.name}</div>
                                    <div className="text-xs text-muted-foreground">{pkg.code}</div>
                                  </TableCell>
                                  <TableCell>{getDoctorTypeBadge(pkg.doctor_type)}</TableCell>
                                  <TableCell className="text-right font-medium">{formatCurrency(price)}</TableCell>
                                  <TableCell className="text-right text-muted-foreground">{formatCurrency(cost)}</TableCell>
                                  <TableCell className="text-right font-medium text-emerald-600">{formatCurrency(profit)}</TableCell>
                                  <TableCell className="text-right">
                                    <Badge className={cn(
                                      margin > 40 ? "bg-emerald-100 text-emerald-700" : margin > 20 ? "bg-yellow-100 text-yellow-700" : "bg-rose-100 text-rose-700"
                                    )}>
                                      {margin.toFixed(1)}%
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog para Crear/Editar Paquete */}
      <Dialog open={isPackageDialogOpen} onOpenChange={setIsPackageDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="sticky top-0 z-10 bg-background border-b px-6 py-4">
            <DialogTitle>{selectedPackage ? "Editar Paquete" : "Crear Nuevo Paquete"}</DialogTitle>
            <DialogDescription>
              Complete la información del paquete médico
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] px-6 py-4">
            <div className="space-y-6">
              {/* Servicio - Nuevo campo */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  Servicio <span className="text-destructive">*</span>
                </Label>
                {selectedPackage ? (
                  <Input
                    value={services.find(s => s.id === packageForm.service_id)?.name || "Servicio no encontrado"}
                    readOnly
                    disabled
                    className="h-11 bg-muted"
                  />
                ) : (
                  <Select
                    value={packageForm.service_id}
                    onValueChange={(v) => setPackageForm({ ...packageForm, service_id: v })}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Seleccionar servicio" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span>{service.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <p className="text-xs text-muted-foreground">
                  {selectedPackage ? "El servicio no puede ser modificado al editar" : "Servicio médico al que pertenece este paquete"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Código *</Label>
                  <Input
                    value={packageForm.code}
                    onChange={(e) => setPackageForm({ ...packageForm, code: e.target.value })}
                    placeholder="Ej: PAQ-001"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nombre *</Label>
                  <Input
                    value={packageForm.name}
                    onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                    placeholder="Ej: Cirugía de Cataratas"
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descripción</Label>
                <Textarea
                  value={packageForm.description}
                  onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })}
                  placeholder="Descripción del paquete..."
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label>Tipo de Médico *</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all",
                      packageForm.doctor_type === "internal"
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-muted hover:border-primary/50"
                    )}
                    onClick={() => setPackageForm({ ...packageForm, doctor_type: "internal" })}
                  >
                    <div className="p-2 rounded-full bg-blue-100">
                      <UserCheck className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Médico Interno</div>
                      <div className="text-sm text-muted-foreground">Personal del hospital</div>
                    </div>
                    {packageForm.doctor_type === "internal" && (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    )}
                  </div>

                  <div
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all",
                      packageForm.doctor_type === "external"
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-muted hover:border-primary/50"
                    )}
                    onClick={() => setPackageForm({ ...packageForm, doctor_type: "external" })}
                  >
                    <div className="p-2 rounded-full bg-purple-100">
                      <User className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Médico Externo</div>
                      <div className="text-sm text-muted-foreground">Médico externo</div>
                    </div>
                    {packageForm.doctor_type === "external" && (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Precio Médico Interno (Q)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={packageForm.internal_doctor_price}
                    onChange={(e) => setPackageForm({ ...packageForm, internal_doctor_price: e.target.value })}
                    disabled={packageForm.doctor_type === "external"}
                    className={cn("h-11", packageForm.doctor_type === "external" && "bg-muted")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Precio Médico Externo (Q)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={packageForm.external_doctor_price}
                    onChange={(e) => setPackageForm({ ...packageForm, external_doctor_price: e.target.value })}
                    disabled={packageForm.doctor_type === "internal"}
                    className={cn("h-11", packageForm.doctor_type === "internal" && "bg-muted")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Días de Validez *</Label>
                  <Input
                    type="number"
                    value={packageForm.validity_days}
                    onChange={(e) => setPackageForm({ ...packageForm, validity_days: e.target.value })}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <div className="flex items-center gap-3 pt-2">
                    <Switch
                      checked={packageForm.is_active}
                      onCheckedChange={(checked) => setPackageForm({ ...packageForm, is_active: checked })}
                    />
                    <span className={cn(
                      "text-sm",
                      packageForm.is_active ? "text-green-600" : "text-muted-foreground"
                    )}>
                      {packageForm.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="sticky bottom-0 z-10 bg-background border-t px-6 py-4">
            <Button variant="outline" onClick={() => setIsPackageDialogOpen(false)} className="min-w-[100px]">
              Cancelar
            </Button>
            <Button onClick={handleSavePackage} disabled={isSubmitting} className="min-w-[140px] gap-2">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {selectedPackage ? "Actualizar Paquete" : "Crear Paquete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para Copiar Paquete */}
      <Dialog open={isCopyDialogOpen} onOpenChange={setIsCopyDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0">
          {selectedPackageForCopy && (
            <>
              {/* Header sticky */}
              <div className="sticky top-0 z-10 bg-gradient-to-r from-primary/5 via-background to-background border-b px-6 py-4">
                <DialogHeader className="p-0">
                  <DialogTitle className="flex items-center gap-2 text-xl">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Copy className="h-5 w-5 text-primary" />
                    </div>
                    Copiar Paquete
                  </DialogTitle>
                  <DialogDescription className="mt-1">
                    Crear una nueva versión del paquete para el próximo año
                  </DialogDescription>
                </DialogHeader>
              </div>

              {/* Contenido scrolleable */}
              <ScrollArea className="h-[55vh] px-6 py-4">
                <div className="space-y-5">
                  {/* Información del paquete original */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-primary/5 via-primary/3 to-transparent border border-primary/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-lg">
                        <PackageIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-lg">{selectedPackageForCopy.name}</div>
                        <div className="text-sm text-muted-foreground font-mono">{selectedPackageForCopy.code}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Nuevo Nombre del Paquete */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <PackageIcon className="h-4 w-4 text-muted-foreground" />
                        Nuevo Nombre del Paquete <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          value={copyForm.new_name}
                          onChange={(e) => {
                            const newName = e.target.value.slice(0, 200)
                            setCopyForm({ ...copyForm, new_name: newName })
                          }}
                          placeholder={`Ej: ${selectedPackageForCopy.name} ${copyForm.new_year}`}
                          className="h-11 pr-16"
                          maxLength={200}
                        />
                        <span className={cn(
                          "absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono",
                          copyForm.new_name?.length === 200 ? "text-destructive" : "text-muted-foreground"
                        )}>
                          {copyForm.new_name?.length || 0}/200
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Ingrese el nuevo nombre del paquete (máximo 200 caracteres)
                      </p>
                    </div>

                    {/* Año Nuevo */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        Año Nuevo <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={copyForm.new_year.toString()}
                        onValueChange={(v) => {
                          const newYear = parseInt(v)
                          setCopyForm({
                            ...copyForm,
                            new_year: newYear,
                            // Sugerir nombre automáticamente si el campo está vacío
                            new_name: copyForm.new_name || `${selectedPackageForCopy.name} ${newYear}`
                          })
                        }}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Seleccionar año" />
                        </SelectTrigger>
                        <SelectContent>
                          {[2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                            <SelectItem key={y} value={y.toString()}>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {y}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        El código del paquete se actualizará con el nuevo año
                      </p>
                    </div>

                    {/* Aumento de Precio */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        Aumento de Precio (%)
                      </Label>
                      <div className="relative">
                        <Input
                          type="number"
                          min="0"
                          max="50"
                          step="0.5"
                          value={copyForm.price_increase_percentage}
                          onChange={(e) => setCopyForm({ ...copyForm, price_increase_percentage: e.target.value })}
                          className="h-11 pr-12"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          %
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Incremento porcentual aplicado al precio actual
                      </p>
                    </div>

                    {/* Checkbox Copiar Productos */}
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="copy_products"
                          checked={copyForm.copy_products}
                          onCheckedChange={(c) => setCopyForm({ ...copyForm, copy_products: !!c })}
                          className="h-5 w-5"
                        />
                        <Label htmlFor="copy_products" className="cursor-pointer font-medium">
                          Copiar productos del paquete
                        </Label>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="text-muted-foreground cursor-help">
                              <HelpCircle className="h-4 w-4" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            Los productos asociados se copiarán al nuevo paquete
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    {/* Resumen del nuevo paquete */}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1 rounded-md bg-blue-100 dark:bg-blue-900/30">
                          <FileText className="h-3.5 w-3.5 text-blue-600" />
                        </div>
                        <h4 className="text-sm font-semibold">Resumen del Nuevo Paquete</h4>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Nombre:</span>
                          <span className="font-medium max-w-[200px] truncate">
                            {copyForm.new_name || "—"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Código:</span>
                          <Badge variant="outline" className="font-mono">
                            {selectedPackageForCopy.code.replace(/\d{4}$/, copyForm.new_year.toString())}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Precio actual:</span>
                          <span className="font-medium">{formatCurrency(getPackagePrice(selectedPackageForCopy))}</span>
                        </div>
                        <Separator className="my-1" />
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Nuevo precio:</span>
                          <span className="text-xl font-bold text-primary">
                            {formatCurrency(
                              getPackagePrice(selectedPackageForCopy) *
                              (1 + parseFloat(copyForm.price_increase_percentage) / 100)
                            )}
                          </span>
                        </div>
                        {copyForm.copy_products && (
                          <div className="flex items-center gap-2 mt-2 pt-2 border-t">
                            <PackageIcon className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              Los productos serán copiados automáticamente
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              {/* Footer sticky */}
              <div className="sticky bottom-0 z-10 bg-background border-t px-6 py-4">
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsCopyDialogOpen(false)}
                    className="min-w-[100px]"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleCopyPackageSubmit}
                    disabled={isSubmitting || !copyForm.new_name?.trim()}
                    className="min-w-[160px] gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
                  >
                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    {!isSubmitting && <Copy className="h-4 w-4" />}
                    {isSubmitting ? "Creando..." : "Crear Nuevo Paquete"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para Ver Productos del Paquete */}
      <Dialog open={isProductsDialogOpen} onOpenChange={setIsProductsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          {selectedPackage && (
            <>
              <DialogHeader className="sticky top-0 z-10 bg-background border-b px-6 py-4">
                <DialogTitle>Productos del Paquete</DialogTitle>
                <DialogDescription>
                  Paquete: <span className="font-mono font-medium">{selectedPackage.code}</span> - {selectedPackage.name}
                </DialogDescription>
              </DialogHeader>

              <div className="px-6 py-4 space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <Card className="bg-muted/30">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold">{packageProducts.length}</div>
                      <div className="text-sm text-muted-foreground">Productos</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/30">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold">{packageProducts.reduce((s, p) => s + p.quantity, 0)}</div>
                      <div className="text-sm text-muted-foreground">Unidades</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">{formatCurrency(packageProducts.reduce((s, p) => s + (p.quantity * (p.product?.unit_cost || 0)), 0))}</div>
                      <div className="text-sm text-muted-foreground">Costo Total</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Producto</TableHead>
                        <TableHead className="text-right w-[100px]">Cantidad</TableHead>
                        <TableHead className="text-right w-[120px]">Costo Unitario</TableHead>
                        <TableHead className="text-right w-[120px]">Costo Total</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {packageProducts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                            No hay productos agregados
                          </TableCell>
                        </TableRow>
                      ) : (
                        packageProducts.map((prod, idx) => (
                          <TableRow key={idx}>
                            <TableCell>
                              <div className="font-medium">{prod.product?.name || "Producto"}</div>
                              <div className="text-xs text-muted-foreground">Código: {prod.product?.code || "—"}</div>
                            </TableCell>
                            <TableCell className="text-right font-medium">{prod.quantity}</TableCell>
                            <TableCell className="text-right">{formatCurrency(prod.product?.unit_cost || 0)}</TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency((prod.quantity * (prod.product?.unit_cost || 0)) || 0)}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <DialogFooter className="sticky bottom-0 z-10 bg-background border-t px-6 py-4">
                <Button variant="outline" onClick={() => setIsProductsDialogOpen(false)}>Cerrar</Button>
                <Button>Guardar Cambios</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}