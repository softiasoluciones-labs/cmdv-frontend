"use client";

import { useState, useMemo, useEffect, Activity } from "react";
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
    DialogTrigger,
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Search,
    Plus,
    Eye,
    Trash2,
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    ChevronDown,
    ArrowUpDown,
    Filter,
    Save,
    X,
    Loader2,
    Warehouse,
    Truck,
    User,
    Package,
    Calendar,
    FileText,
    Send,
    Check,
    TrendingUp,
    Minus,
    Building2,
    ActivityIcon,
    Printer,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useWarehouses } from "@/hooks/inventory-hooks/use-warehouses";
import { useProducts } from "@/hooks/inventory-hooks/use-products";
import { useWarehouseDispatches } from "@/hooks/inventory-hooks/use-warehouse-dispatches";

// Types
type DispatchStatus = 'pending' | 'approved' | 'dispatched' | 'completed' | 'cancelled';
type SortField = 'dispatch_number' | 'requester_name' | 'status' | 'requested_date' | 'dispatch_date';

interface DispatchItem {
    productId: string;
    productCode?: string;
    productName?: string;
    quantity: number;
    notes?: string;
}

interface DispatchFormData {
    sourceWarehouseId: string;
    destinationWarehouseId: string;
    requesterName: string;
    requesterUserId?: string;
    requestedDate: string;
    notes?: string;
    items: DispatchItem[];
}

const statusConfig: Record<DispatchStatus, {
    label: string;
    color: string;
    icon: any;
    nextActions: string[];
}> = {
    pending: {
        label: "Pendiente",
        color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400",
        icon: Clock,
        nextActions: ["approved", "cancelled"],
    },
    approved: {
        label: "Aprobado",
        color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400",
        icon: CheckCircle,
        nextActions: ["dispatched", "cancelled"],
    },
    dispatched: {
        label: "Despachado",
        color: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400",
        icon: Truck,
        nextActions: ["completed", "cancelled"],
    },
    completed: {
        label: "Completado",
        color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400",
        icon: CheckCircle,
        nextActions: [],
    },
    cancelled: {
        label: "Cancelado",
        color: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400",
        icon: XCircle,
        nextActions: [],
    },
};

export default function WarehouseDispatchesPage() {
    const { warehouses, isLoading: isLoadingWarehouses } = useWarehouses();
    const { products, isLoading: isLoadingProducts } = useProducts({ isActive: true, limit: 500 });
    const {
        dispatches,
        summary,
        isLoading,
        error,
        fetchDispatches,
        createDispatch,
        updateDispatchStatus,
        deleteDispatch,
    } = useWarehouseDispatches();

    // Estados para filtros y ordenamiento
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [warehouseFilter, setWarehouseFilter] = useState<string>("all");
    const [sortField, setSortField] = useState<SortField>("requested_date");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [savedFilters, setSavedFilters] = useState<any[]>([]);
    const [filterName, setFilterName] = useState("");
    const [showSaveFilterDialog, setShowSaveFilterDialog] = useState(false);

    // Estados para diálogos
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
    const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedDispatch, setSelectedDispatch] = useState<any>(null);
    const [selectedStatus, setSelectedStatus] = useState<DispatchStatus | null>(null);

    // Estados del formulario
    const [dispatchForm, setDispatchForm] = useState<DispatchFormData>({
        sourceWarehouseId: "",
        destinationWarehouseId: "",
        requesterName: "",
        requesterUserId: "",
        requestedDate: new Date().toISOString().split("T")[0],
        notes: "",
        items: [],
    });

    const [selectedProductId, setSelectedProductId] = useState("");
    const [productSearch, setProductSearch] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Cargar filtros guardados
    useEffect(() => {
        const saved = localStorage.getItem("savedDispatchFilters");
        if (saved) {
            try {
                setSavedFilters(JSON.parse(saved));
            } catch (e) {
                console.error("Error loading saved filters:", e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("savedDispatchFilters", JSON.stringify(savedFilters));
    }, [savedFilters]);

    // Filtrar y ordenar despachos
    const filteredDispatches = useMemo(() => {
        if (!dispatches.length) return [];

        let filtered = dispatches.filter((dispatch) => {
            const matchesSearch =
                dispatch.dispatch_number?.toLowerCase().includes(search.toLowerCase()) ||
                dispatch.requester_name?.toLowerCase().includes(search.toLowerCase()) ||
                false;

            const matchesStatus = statusFilter === "all" || dispatch.status === statusFilter;
            const matchesWarehouse =
                warehouseFilter === "all" ||
                dispatch.source_warehouse_id === warehouseFilter ||
                dispatch.destination_warehouse_id === warehouseFilter;

            return matchesSearch && matchesStatus && matchesWarehouse;
        });

        // Ordenar
        filtered.sort((a, b) => {
            let aValue: any = a[sortField];
            let bValue: any = b[sortField];

            if (sortField === "requested_date") {
                aValue = new Date(a.requested_date || a.created_at).getTime();
                bValue = new Date(b.requested_date || b.created_at).getTime();
            }
            if (sortField === "dispatch_date") {
                aValue = a.dispatch_date ? new Date(a.dispatch_date).getTime() : 0;
                bValue = b.dispatch_date ? new Date(b.dispatch_date).getTime() : 0;
            }

            if (typeof aValue === "string") {
                return sortOrder === "asc"
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }

            return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
        });

        return filtered;
    }, [dispatches, search, statusFilter, warehouseFilter, sortField, sortOrder]);

    // Paginación
    const totalPages = Math.ceil(filteredDispatches.length / itemsPerPage);
    const paginatedDispatches = filteredDispatches.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Productos disponibles para agregar
    const availableProducts = useMemo(() => {
        const addedProductIds = dispatchForm.items.map((item) => item.productId);
        return products.filter(
            (product) =>
                !addedProductIds.includes(product.id) &&
                (product.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
                    product.code?.toLowerCase().includes(productSearch.toLowerCase()))
        );
    }, [products, dispatchForm.items, productSearch]);

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
        setWarehouseFilter("all");
        setCurrentPage(1);
    };

    const handleSaveFilter = () => {
        if (filterName.trim()) {
            const newFilter = {
                id: Date.now(),
                name: filterName,
                search,
                statusFilter,
                warehouseFilter,
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
        setWarehouseFilter(filter.warehouseFilter);
        setCurrentPage(1);
    };

    const handleDeleteFilter = (filterId: number) => {
        setSavedFilters(savedFilters.filter((f) => f.id !== filterId));
    };

    const handleAddProduct = () => {
        if (!selectedProductId) return;

        const product = products.find((p) => p.id === selectedProductId);
        if (!product) return;

        const newItem: DispatchItem = {
            productId: product.id,
            productCode: product.code,
            productName: product.name,
            quantity: 1,
        };

        setDispatchForm({ ...dispatchForm, items: [...dispatchForm.items, newItem] });
        setSelectedProductId("");
        setProductSearch("");
    };

    const handleUpdateItem = (index: number, quantity: number) => {
        const updatedItems = [...dispatchForm.items];
        updatedItems[index].quantity = quantity;
        setDispatchForm({ ...dispatchForm, items: updatedItems });
    };

    const handleRemoveItem = (index: number) => {
        const updatedItems = dispatchForm.items.filter((_, i) => i !== index);
        setDispatchForm({ ...dispatchForm, items: updatedItems });
    };

    const handleCreateDispatch = async () => {
        if (dispatchForm.items.length === 0) {
            alert("Debe agregar al menos un producto");
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await createDispatch(dispatchForm);
            if (result) {
                setIsCreateDialogOpen(false);
                setDispatchForm({
                    sourceWarehouseId: "",
                    destinationWarehouseId: "",
                    requesterName: "",
                    requesterUserId: "",
                    requestedDate: new Date().toISOString().split("T")[0],
                    notes: "",
                    items: [],
                });
            }
        } catch (error) {
            console.error("Error creating dispatch:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateStatus = async () => {
        if (!selectedDispatch || !selectedStatus) return;

        setIsSubmitting(true);
        try {
            await updateDispatchStatus(selectedDispatch.id, selectedStatus);
            setIsStatusDialogOpen(false);
            setSelectedDispatch(null);
            setSelectedStatus(null);
        } catch (error) {
            console.error("Error updating status:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteDispatch = async () => {
        if (!selectedDispatch) return;

        setIsSubmitting(true);
        try {
            await deleteDispatch(selectedDispatch.id);
            setIsDeleteDialogOpen(false);
            setSelectedDispatch(null);
        } catch (error) {
            console.error("Error deleting dispatch:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusBadge = (status: DispatchStatus) => {
        const config = statusConfig[status];
        const Icon = config.icon;
        return (
            <Badge className={`gap-1 ${config.color} border`}>
                <Icon className="h-3 w-3" />
                {config.label}
            </Badge>
        );
    };

    const formatDate = (dateString: string | Date | undefined) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleDateString("es-GT", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatDateTime = (dateString: string | Date | undefined) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleString("es-GT", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Función para obtener el orden numérico de los estados
    const getStatusOrder = (status: string): number => {
        const order = {
            pending: 0,
            approved: 1,
            dispatched: 2,
            completed: 3,
            cancelled: 4,
        };
        return order[status as keyof typeof order] ?? 0;
    };

    if (isLoading && !dispatches.length) {
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
                                <Truck className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                    Despachos entre Bodegas
                                </h1>
                                <p className="text-muted-foreground">
                                    Gestiona los movimientos de productos entre bodegas
                                </p>
                            </div>
                        </div>
                    </div>

                    <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Nuevo Despacho
                    </Button>
                </div>

                {/* Stats Cards */}
                {summary && (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-none shadow-md hover:shadow-lg transition-all">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Total Despachos</p>
                                        <p className="text-3xl font-bold">{summary.total}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{summary.pending} pendientes</p>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                                        <FileText className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-none shadow-md hover:shadow-lg transition-all">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Completados</p>
                                        <p className="text-3xl font-bold text-emerald-600">{summary.completed}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{summary.completionRate}% del total</p>
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
                                        <p className="text-sm font-medium text-muted-foreground">En Proceso</p>
                                        <p className="text-3xl font-bold text-purple-600">{summary.inProgress}</p>
                                        <p className="text-xs text-muted-foreground mt-1">Aprobados/Despachados</p>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                                        <TrendingUp className="h-6 w-6 text-purple-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-none shadow-md hover:shadow-lg transition-all">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Cancelados</p>
                                        <p className="text-3xl font-bold text-amber-600">{summary.cancelled}</p>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                                        <XCircle className="h-6 w-6 text-amber-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Filtros */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-wrap gap-3">
                                <div className="relative flex-1 min-w-[200px]">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar por número o solicitante..."
                                        value={search}
                                        onChange={(e) => {
                                            setSearch(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="pl-9"
                                    />
                                </div>

                                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
                                    <SelectTrigger className="w-[150px]">
                                        <Filter className="mr-2 h-4 w-4" />
                                        <SelectValue placeholder="Estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        <SelectItem value="pending">Pendiente</SelectItem>
                                        <SelectItem value="approved">Aprobado</SelectItem>
                                        <SelectItem value="dispatched">Despachado</SelectItem>
                                        <SelectItem value="completed">Completado</SelectItem>
                                        <SelectItem value="cancelled">Cancelado</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={warehouseFilter} onValueChange={(v) => { setWarehouseFilter(v); setCurrentPage(1); }}>
                                    <SelectTrigger className="w-[180px]">
                                        <Warehouse className="mr-2 h-4 w-4" />
                                        <SelectValue placeholder="Bodega" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas</SelectItem>
                                        {warehouses.filter(w => w.isActive).map((w) => (
                                            <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                                        ))}
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
                                                        {statusFilter !== "all" && <div>📊 Estado: {statusFilter}</div>}
                                                        {warehouseFilter !== "all" && <div>🏭 Bodega: {warehouses.find(w => w.id === warehouseFilter)?.name}</div>}
                                                        {!search && statusFilter === "all" && warehouseFilter === "all" && (
                                                            <div className="text-muted-foreground">Mostrando todos los despachos</div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label>Nombre del filtro</Label>
                                                    <Input
                                                        value={filterName}
                                                        onChange={(e) => setFilterName(e.target.value)}
                                                        placeholder="Ej: Despachos pendientes"
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

                {/* Tabla de Despachos */}
                <Card>
                    <CardHeader>
                        <CardTitle>Listado de Despachos</CardTitle>
                        <CardDescription>
                            {filteredDispatches.length} {filteredDispatches.length === 1 ? "despacho encontrado" : "despachos encontrados"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {filteredDispatches.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                                    <Truck className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">No hay despachos registrados</h3>
                                <p className="text-muted-foreground mb-4">
                                    {search ? "No hay resultados con los filtros aplicados" : "Crea tu primer despacho"}
                                </p>
                                <Button onClick={() => setIsCreateDialogOpen(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Nuevo Despacho
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/50">
                                                <TableHead className="cursor-pointer hover:bg-muted w-[120px]" onClick={() => handleSort("dispatch_number")}>
                                                    <div className="flex items-center gap-1">
                                                        # Despacho
                                                        {sortField === "dispatch_number" && (sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                                                        {sortField !== "dispatch_number" && <ArrowUpDown className="h-3 w-3 opacity-50" />}
                                                    </div>
                                                </TableHead>
                                                <TableHead>Origen → Destino</TableHead>
                                                <TableHead className="cursor-pointer hover:bg-muted" onClick={() => handleSort("requester_name")}>
                                                    <div className="flex items-center gap-1">
                                                        Solicitante
                                                        {sortField === "requester_name" && (sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                                                        {sortField !== "requester_name" && <ArrowUpDown className="h-3 w-3 opacity-50" />}
                                                    </div>
                                                </TableHead>
                                                <TableHead className="cursor-pointer hover:bg-muted" onClick={() => handleSort("requested_date")}>
                                                    <div className="flex items-center gap-1">
                                                        Fecha Solicitud
                                                        {sortField === "requested_date" && (sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                                                        {sortField !== "requested_date" && <ArrowUpDown className="h-3 w-3 opacity-50" />}
                                                    </div>
                                                </TableHead>
                                                <TableHead>Productos</TableHead>
                                                <TableHead className="cursor-pointer hover:bg-muted" onClick={() => handleSort("status")}>
                                                    <div className="flex items-center gap-1">
                                                        Estado
                                                        {sortField === "status" && (sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                                                        {sortField !== "status" && <ArrowUpDown className="h-3 w-3 opacity-50" />}
                                                    </div>
                                                </TableHead>
                                                <TableHead className="text-right">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {paginatedDispatches.map((dispatch) => {
                                                const sourceWarehouse = warehouses.find(w => w.id === dispatch.source_warehouse_id);
                                                const destWarehouse = warehouses.find(w => w.id === dispatch.destination_warehouse_id);
                                                const totalItems = dispatch.details?.length || 0;
                                                const totalQuantity = dispatch.details?.reduce((sum: number, d: any) => sum + d.quantity, 0) || 0;

                                                return (
                                                    <TableRow key={dispatch.id} className="hover:bg-muted/50 transition-colors">
                                                        <TableCell className="font-mono font-medium">
                                                            {dispatch.dispatch_number}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-col">
                                                                <div className="flex items-center gap-1">
                                                                    <Warehouse className="h-3 w-3 text-muted-foreground" />
                                                                    <span className="text-sm">{sourceWarehouse?.name || "—"}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                                    <ChevronRight className="h-3 w-3" />
                                                                    <span>{destWarehouse?.name || "—"}</span>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-col">
                                                                <span className="font-medium">{dispatch.requester_name}</span>
                                                                {dispatch.dispatched_by && (
                                                                    <span className="text-xs text-muted-foreground">
                                                                        Despachado por: {dispatch.dispatched_by}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                                                <span className="text-sm">{formatDate(dispatch.requested_date || dispatch.created_at)}</span>
                                                            </div>
                                                            {dispatch.dispatch_date && (
                                                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                                    <Truck className="h-3 w-3" />
                                                                    <span>Despachado: {formatDate(dispatch.dispatch_date)}</span>
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-medium">{totalItems} productos</span>
                                                                <span className="text-xs text-muted-foreground">{totalQuantity} unidades</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {getStatusBadge(dispatch.status as DispatchStatus)}
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
                                                                                onClick={() => {
                                                                                    setSelectedDispatch(dispatch);
                                                                                    setIsDetailDialogOpen(true);
                                                                                }}
                                                                            >
                                                                                <Eye className="h-4 w-4" />
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>Ver detalles</TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>

                                                                {statusConfig[dispatch.status as DispatchStatus].nextActions.length > 0 && (
                                                                    <TooltipProvider>
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                    className="h-8 w-8 text-primary"
                                                                                    onClick={() => {
                                                                                        setSelectedDispatch(dispatch);
                                                                                        setIsStatusDialogOpen(true);
                                                                                    }}
                                                                                >
                                                                                    <Send className="h-4 w-4" />
                                                                                </Button>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>Cambiar estado</TooltipContent>
                                                                        </Tooltip>
                                                                    </TooltipProvider>
                                                                )}

                                                                {dispatch.status === "pending" && (
                                                                    <TooltipProvider>
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                                                                    onClick={() => {
                                                                                        setSelectedDispatch(dispatch);
                                                                                        setIsDeleteDialogOpen(true);
                                                                                    }}
                                                                                >
                                                                                    <Trash2 className="h-4 w-4" />
                                                                                </Button>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>Eliminar despacho</TooltipContent>
                                                                        </Tooltip>
                                                                    </TooltipProvider>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Paginación */}
                                {filteredDispatches.length > 0 && (
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm text-muted-foreground">
                                                Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredDispatches.length)} de {filteredDispatches.length}
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

            {/* Dialog para Crear Despacho */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
                    {/* Header con gradiente */}
                    <div className="sticky top-0 z-10 bg-gradient-to-r from-primary/5 via-background to-background border-b px-6 py-4">
                        <DialogHeader className="p-0">
                            <DialogTitle className="flex items-center gap-2 text-xl">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <Truck className="h-5 w-5 text-primary" />
                                </div>
                                Nuevo Despacho entre Bodegas
                            </DialogTitle>
                            <DialogDescription className="mt-1">
                                Registra el movimiento de productos de una bodega a otra
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <ScrollArea className="h-[65vh] px-6">
                        <div className="space-y-8 py-6">
                            {/* Sección: Información del Despacho */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30">
                                        <FileText className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <h3 className="font-semibold text-base">Información del Despacho</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Bodega Origen */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium flex items-center gap-1">
                                            <Warehouse className="h-4 w-4 text-muted-foreground" />
                                            Bodega Origen <span className="text-destructive">*</span>
                                        </Label>
                                        <Select
                                            value={dispatchForm.sourceWarehouseId}
                                            onValueChange={(v) => setDispatchForm({ ...dispatchForm, sourceWarehouseId: v })}
                                        >
                                            <SelectTrigger className="h-11">
                                                <SelectValue placeholder="Seleccionar bodega origen" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {warehouses.filter(w => w.isActive).map((w) => (
                                                    <SelectItem key={w.id} value={w.id}>
                                                        <div className="flex items-center gap-2">
                                                            <Warehouse className="h-4 w-4" />
                                                            {w.name}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground">
                                            Productos saldrán de esta bodega
                                        </p>
                                    </div>

                                    {/* Bodega Destino */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium flex items-center gap-1">
                                            <Building2 className="h-4 w-4 text-muted-foreground" />
                                            Bodega Destino <span className="text-destructive">*</span>
                                        </Label>
                                        <Select
                                            value={dispatchForm.destinationWarehouseId}
                                            onValueChange={(v) => setDispatchForm({ ...dispatchForm, destinationWarehouseId: v })}
                                            disabled={!dispatchForm.sourceWarehouseId}
                                        >
                                            <SelectTrigger className="h-11">
                                                <SelectValue placeholder={
                                                    !dispatchForm.sourceWarehouseId
                                                        ? "Primero selecciona bodega origen"
                                                        : "Seleccionar bodega destino"
                                                } />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {warehouses
                                                    .filter(w => w.isActive && w.id !== dispatchForm.sourceWarehouseId)
                                                    .map((w) => (
                                                        <SelectItem key={w.id} value={w.id}>
                                                            <div className="flex items-center gap-2">
                                                                <Building2 className="h-4 w-4" />
                                                                {w.name}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground">
                                            Productos llegarán a esta bodega
                                        </p>
                                    </div>
                                </div>

                                {/* Indicador visual de transferencia */}
                                {dispatchForm.sourceWarehouseId && dispatchForm.destinationWarehouseId && (
                                    <div className="flex items-center justify-center gap-3 py-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Badge variant="outline" className="bg-blue-50">
                                                {warehouses.find(w => w.id === dispatchForm.sourceWarehouseId)?.name}
                                            </Badge>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                            <Badge variant="outline" className="bg-emerald-50">
                                                {warehouses.find(w => w.id === dispatchForm.destinationWarehouseId)?.name}
                                            </Badge>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Solicitante */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium flex items-center gap-1">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            Nombre del Solicitante <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            placeholder="Ej: Enfermera María López"
                                            value={dispatchForm.requesterName}
                                            onChange={(e) => setDispatchForm({ ...dispatchForm, requesterName: e.target.value })}
                                            className="h-11"
                                        />
                                    </div>

                                    {/* Fecha */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium flex items-center gap-1">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            Fecha de Solicitud <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            type="date"
                                            value={dispatchForm.requestedDate}
                                            onChange={(e) => setDispatchForm({ ...dispatchForm, requestedDate: e.target.value })}
                                            className="h-11"
                                        />
                                    </div>
                                </div>

                                {/* Notas */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium flex items-center gap-1">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        Notas
                                    </Label>
                                    <Textarea
                                        placeholder="Motivo del despacho, observaciones importantes, etc."
                                        value={dispatchForm.notes}
                                        onChange={(e) => setDispatchForm({ ...dispatchForm, notes: e.target.value })}
                                        rows={3}
                                        className="resize-none"
                                    />
                                </div>
                            </div>

                            <Separator className="my-2" />

                            {/* Sección: Productos a Despachar */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between flex-wrap gap-3">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-md bg-emerald-100 dark:bg-emerald-900/30">
                                            <Package className="h-4 w-4 text-emerald-600" />
                                        </div>
                                        <h3 className="font-semibold text-base">Productos a Despachar</h3>
                                        {dispatchForm.items.length > 0 && (
                                            <Badge variant="secondary" className="ml-2">
                                                {dispatchForm.items.length} items
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {/* Selector de productos mejorado */}
                                <Card className="border-dashed bg-muted/30">
                                    <CardContent className="p-4">
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <div className="relative flex-1">
                                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    placeholder="Buscar producto por nombre o código..."
                                                    value={productSearch}
                                                    onChange={(e) => setProductSearch(e.target.value)}
                                                    className="pl-9 h-10"
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                                                    <SelectTrigger className="w-[280px] h-10">
                                                        <SelectValue placeholder="Seleccionar producto" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {availableProducts.length === 0 ? (
                                                            <div className="p-4 text-center text-muted-foreground">
                                                                <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                                <p className="text-sm">No hay productos disponibles</p>
                                                                <p className="text-xs">Todos los productos ya fueron agregados</p>
                                                            </div>
                                                        ) : (
                                                            availableProducts.map((product) => (
                                                                <SelectItem key={product.id} value={product.id}>
                                                                    <div className="flex flex-col">
                                                                        <span className="font-medium">{product.name}</span>
                                                                        <span className="text-xs text-muted-foreground">
                                                                            Código: {product.code} | Stock: {product.totalStockQuantity || 0} {product.unitOfMeasure}
                                                                        </span>
                                                                    </div>
                                                                </SelectItem>
                                                            ))
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                <Button
                                                    type="button"
                                                    onClick={handleAddProduct}
                                                    disabled={!selectedProductId}
                                                    className="gap-1"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                    Agregar
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Tabla de productos mejorada */}
                                {dispatchForm.items.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-muted/20">
                                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                            <Package className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <h4 className="font-medium text-muted-foreground">No hay productos agregados</h4>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Selecciona un producto del catálogo para comenzar
                                        </p>
                                    </div>
                                ) : (
                                    <div className="rounded-xl border overflow-hidden">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-muted/50">
                                                    <TableHead className="w-[40%]">Producto</TableHead>
                                                    <TableHead className="text-right w-[20%]">Cantidad</TableHead>
                                                    <TableHead className="w-[30%]">Notas</TableHead>
                                                    <TableHead className="w-[10%] text-center"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {dispatchForm.items.map((item, index) => (
                                                    <TableRow key={index} className="group">
                                                        <TableCell>
                                                            <div>
                                                                <div className="font-medium">{item.productName}</div>
                                                                <div className="text-xs text-muted-foreground font-mono mt-0.5">
                                                                    Código: {item.productCode}
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="h-7 w-7"
                                                                    onClick={() => {
                                                                        const newQty = Math.max(1, item.quantity - 1);
                                                                        handleUpdateItem(index, newQty);
                                                                    }}
                                                                >
                                                                    <Minus className="h-3 w-3" />
                                                                </Button>
                                                                <Input
                                                                    type="number"
                                                                    min="1"
                                                                    value={item.quantity}
                                                                    onChange={(e) => handleUpdateItem(index, parseInt(e.target.value) || 1)}
                                                                    className="w-20 text-center h-8"
                                                                />
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="h-7 w-7"
                                                                    onClick={() => handleUpdateItem(index, item.quantity + 1)}
                                                                >
                                                                    <Plus className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                placeholder="Notas del producto (opcional)"
                                                                value={item.notes || ""}
                                                                onChange={(e) => {
                                                                    const updatedItems = [...dispatchForm.items];
                                                                    updatedItems[index].notes = e.target.value;
                                                                    setDispatchForm({ ...dispatchForm, items: updatedItems });
                                                                }}
                                                                className="h-8 text-sm"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleRemoveItem(index)}
                                                                className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}

                                {/* Resumen mejorado */}
                                {dispatchForm.items.length > 0 && (
                                    <Card className="bg-gradient-to-r from-primary/5 via-primary/3 to-transparent border-primary/20">
                                        <CardContent className="p-4">
                                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                                <div className="flex items-center gap-6">
                                                    <div>
                                                        <p className="text-xs text-muted-foreground uppercase tracking-wide">
                                                            Total Productos
                                                        </p>
                                                        <p className="text-2xl font-bold">{dispatchForm.items.length}</p>
                                                        <p className="text-xs text-muted-foreground">items diferentes</p>
                                                    </div>
                                                    <div className="h-10 w-px bg-border" />
                                                    <div>
                                                        <p className="text-xs text-muted-foreground uppercase tracking-wide">
                                                            Cantidad Total
                                                        </p>
                                                        <p className="text-2xl font-bold text-primary">
                                                            {dispatchForm.items.reduce((sum, i) => sum + i.quantity, 0).toLocaleString()}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">unidades</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <AlertTriangle className="h-4 w-4" />
                                                    <span>Verifica las cantidades antes de crear el despacho</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </ScrollArea>

                    {/* Footer con acciones */}
                    <div className="sticky bottom-0 z-10 bg-background border-t px-6 py-4">
                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setIsCreateDialogOpen(false)}
                                className="min-w-[100px]"
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleCreateDispatch}
                                disabled={isSubmitting || dispatchForm.items.length === 0 || !dispatchForm.sourceWarehouseId || !dispatchForm.destinationWarehouseId || !dispatchForm.requesterName}
                                className="min-w-[140px] gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Creando...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4" />
                                        Crear Despacho
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Dialog para Ver Detalles */}
            <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
                    {selectedDispatch && (
                        <>
                            {/* Header con fondo y estado */}
                            <div className="sticky top-0 z-10 bg-muted/50 border-b px-6 py-4">
                                <div className="flex items-center justify-between flex-wrap gap-3">
                                    <DialogHeader className="p-0">
                                        <DialogTitle className="flex items-center gap-2 text-xl">
                                            <div className="p-2 rounded-lg bg-primary/10">
                                                <Truck className="h-5 w-5 text-primary" />
                                            </div>
                                            Detalles del Despacho
                                        </DialogTitle>
                                        <DialogDescription className="mt-1">
                                            Despacho: <span className="font-mono font-medium">{selectedDispatch.dispatch_number}</span>
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="flex items-center gap-2">
                                        {getStatusBadge(selectedDispatch.status)}
                                    </div>
                                </div>
                            </div>

                            <ScrollArea className="h-[calc(90vh-140px)] px-6 py-4">
                                <div className="space-y-8 py-6">
                                    {/* Timeline de estados */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 rounded-md bg-purple-100 dark:bg-purple-900/30">
                                                <ActivityIcon className="h-4 w-4 text-purple-600" />
                                            </div>
                                            <h3 className="font-semibold text-base">Seguimiento del Despacho</h3>
                                        </div>
                                        <div className="relative">
                                            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800" />
                                            <div className="relative flex justify-between">
                                                {[
                                                    { status: "pending", label: "Pendiente", icon: Clock, color: "amber" },
                                                    { status: "approved", label: "Aprobado", icon: CheckCircle, color: "blue" },
                                                    { status: "dispatched", label: "Despachado", icon: Truck, color: "purple" },
                                                    { status: "completed", label: "Completado", icon: CheckCircle, color: "emerald" },
                                                ].map((step, idx) => {
                                                    const isCompleted = getStatusOrder(selectedDispatch.status) >= getStatusOrder(step.status);
                                                    const isCurrent = selectedDispatch.status === step.status;
                                                    const Icon = step.icon;
                                                    const colorMap = {
                                                        amber: "from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-950/20 border-amber-200",
                                                        blue: "from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-950/20 border-blue-200",
                                                        purple: "from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-950/20 border-purple-200",
                                                        emerald: "from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-950/20 border-emerald-200",
                                                    };

                                                    return (
                                                        <div key={step.status} className="relative z-10 flex flex-col items-center flex-1">
                                                            <div className={cn(
                                                                "w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center border-2 transition-all",
                                                                isCompleted ? colorMap[step.color as keyof typeof colorMap] : "bg-muted border-muted-foreground/20",
                                                                isCurrent && "ring-2 ring-primary ring-offset-2"
                                                            )}>
                                                                <Icon className={cn(
                                                                    "h-4 w-4",
                                                                    isCompleted ? `text-${step.color}-600` : "text-muted-foreground"
                                                                )} />
                                                            </div>
                                                            <p className={cn(
                                                                "text-xs font-medium mt-2",
                                                                isCompleted ? "text-foreground" : "text-muted-foreground"
                                                            )}>
                                                                {step.label}
                                                            </p>
                                                            {isCurrent && (
                                                                <Badge variant="outline" className="text-[10px] mt-1 bg-primary/10">
                                                                    Actual
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Información General - Layout de dos columnas mejorado */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30">
                                                <FileText className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <h3 className="font-semibold text-base">Información General</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Columna izquierda */}
                                            <div className="space-y-4">
                                                <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Warehouse className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-muted-foreground">Origen:</span>
                                                        <span className="font-medium">{warehouses.find(w => w.id === selectedDispatch.source_warehouse_id)?.name || "—"}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-muted-foreground">Destino:</span>
                                                        <span className="font-medium">{warehouses.find(w => w.id === selectedDispatch.destination_warehouse_id)?.name || "—"}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <User className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-muted-foreground">Solicitante:</span>
                                                        <span className="font-medium">{selectedDispatch.requester_name}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Columna derecha */}
                                            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-muted-foreground">Solicitud:</span>
                                                    <span className="font-medium">{formatDateTime(selectedDispatch.requested_date || selectedDispatch.created_at)}</span>
                                                </div>
                                                {selectedDispatch.dispatch_date && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Truck className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-muted-foreground">Despacho:</span>
                                                        <span className="font-medium">{formatDateTime(selectedDispatch.dispatch_date)}</span>
                                                    </div>
                                                )}
                                                {selectedDispatch.dispatched_by && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <User className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-muted-foreground">Despachado por:</span>
                                                        <span className="font-medium">{selectedDispatch.dispatched_by}</span>
                                                    </div>
                                                )}
                                                {selectedDispatch.completed_date && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                                                        <span className="text-muted-foreground">Completado:</span>
                                                        <span className="font-medium">{formatDateTime(selectedDispatch.completed_date)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Productos Despachados - Tabla mejorada */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between flex-wrap gap-3">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 rounded-md bg-emerald-100 dark:bg-emerald-900/30">
                                                    <Package className="h-4 w-4 text-emerald-600" />
                                                </div>
                                                <h3 className="font-semibold text-base">Productos Despachados</h3>
                                                <Badge variant="secondary">
                                                    {selectedDispatch.details?.length || 0} items
                                                </Badge>
                                            </div>
                                        </div>

                                        {selectedDispatch.details?.length === 0 ? (
                                            <div className="text-center py-8 border rounded-lg bg-muted/20">
                                                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                                                <p className="text-muted-foreground">No hay productos en este despacho</p>
                                            </div>
                                        ) : (
                                            <div className="rounded-xl border overflow-hidden">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow className="bg-muted/50">
                                                            <TableHead className="w-[50%]">Producto</TableHead>
                                                            <TableHead className="text-right w-[20%]">Cantidad</TableHead>
                                                            <TableHead className="w-[30%]">Notas</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {selectedDispatch.details?.map((item: any, idx: number) => (
                                                            <TableRow key={item.id} className="hover:bg-muted/30">
                                                                <TableCell>
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                                            <span className="text-xs font-medium text-primary">
                                                                                {idx + 1}
                                                                            </span>
                                                                        </div>
                                                                        <div>
                                                                            <div className="font-medium">{item.product?.name || item.productName}</div>
                                                                            <div className="text-xs text-muted-foreground font-mono">
                                                                                Código: {item.product?.code || item.productCode}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    <Badge variant="outline" className="text-sm font-medium px-3 py-1">
                                                                        {item.quantity.toLocaleString()} unidades
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell className="text-muted-foreground">
                                                                    {item.notes ? (
                                                                        <div className="flex items-center gap-1">
                                                                            <FileText className="h-3 w-3" />
                                                                            <span className="text-sm">{item.notes}</span>
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-sm italic">—</span>
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        )}

                                        {/* Resumen de productos */}
                                        {selectedDispatch.details && selectedDispatch.details.length > 0 && (
                                            <div className="flex justify-end">
                                                <Card className="bg-gradient-to-r from-primary/5 to-transparent border-primary/20">
                                                    <CardContent className="p-3">
                                                        <div className="flex items-center gap-6">
                                                            <div>
                                                                <p className="text-xs text-muted-foreground">Total Productos</p>
                                                                <p className="text-xl font-bold">{selectedDispatch.details.length}</p>
                                                            </div>
                                                            <div className="h-8 w-px bg-border" />
                                                            <div>
                                                                <p className="text-xs text-muted-foreground">Cantidad Total</p>
                                                                <p className="text-xl font-bold text-primary">
                                                                    {selectedDispatch.details.reduce((sum: number, d: any) => sum + d.quantity, 0).toLocaleString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        )}
                                    </div>

                                    {/* Notas generales */}
                                    {selectedDispatch.notes && (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 rounded-md bg-amber-100 dark:bg-amber-900/30">
                                                    <FileText className="h-4 w-4 text-amber-600" />
                                                </div>
                                                <h3 className="font-semibold text-base">Notas Adicionales</h3>
                                            </div>
                                            <div className="bg-muted/20 rounded-lg p-4 border-l-4 border-l-amber-400">
                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                    {selectedDispatch.notes}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>

                            {/* Footer con acciones */}
                            <div className="sticky bottom-0 z-10 bg-muted/50 border-t px-6 py-4">
                                <div className="flex justify-end gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsDetailDialogOpen(false)}
                                        className="min-w-[100px]"
                                    >
                                        Cerrar
                                    </Button>
                                    {statusConfig[selectedDispatch.status as DispatchStatus].nextActions.length > 0 && (
                                        <Button
                                            onClick={() => {
                                                setIsDetailDialogOpen(false);
                                                setIsStatusDialogOpen(true);
                                            }}
                                            className="min-w-[140px] gap-2"
                                        >
                                            <Send className="h-4 w-4" />
                                            Cambiar Estado
                                        </Button>
                                    )}
                                    {/* Botón para imprimir 
                                    <Button
                                        variant="outline"
                                        onClick={() => handlePrintDispatch(selectedDispatch.id)}
                                        className="gap-2"
                                    >
                                        <Printer className="h-4 w-4" />
                                        Imprimir
                                    </Button>*/}
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Dialog para Cambiar Estado */}
            <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
                <DialogContent className="max-w-md p-6">
                    {selectedDispatch && (
                        <>
                            <DialogHeader className="space-y-2 pb-2">
                                <DialogTitle className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        <ActivityIcon className="h-5 w-5 text-primary" />
                                    </div>
                                    Cambiar Estado del Despacho
                                </DialogTitle>
                                <DialogDescription className="pt-2">
                                    Despacho: <span className="font-mono font-medium">{selectedDispatch.dispatch_number}</span>
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-5 py-4">
                                {/* Estado Actual */}
                                <div className="space-y-3">
                                    <Label className="text-sm font-medium">Estado Actual</Label>
                                    <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg border">
                                        {(() => {
                                            const config = statusConfig[selectedDispatch.status as DispatchStatus];
                                            const Icon = config.icon;
                                            return (
                                                <>
                                                    <div className={cn(
                                                        "w-12 h-12 rounded-full flex items-center justify-center",
                                                        selectedDispatch.status === "pending" && "bg-amber-100",
                                                        selectedDispatch.status === "approved" && "bg-blue-100",
                                                        selectedDispatch.status === "dispatched" && "bg-purple-100",
                                                        selectedDispatch.status === "completed" && "bg-emerald-100",
                                                        selectedDispatch.status === "cancelled" && "bg-rose-100"
                                                    )}>
                                                        <Icon className={cn(
                                                            "h-6 w-6",
                                                            selectedDispatch.status === "pending" && "text-amber-600",
                                                            selectedDispatch.status === "approved" && "text-blue-600",
                                                            selectedDispatch.status === "dispatched" && "text-purple-600",
                                                            selectedDispatch.status === "completed" && "text-emerald-600",
                                                            selectedDispatch.status === "cancelled" && "text-rose-600"
                                                        )} />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-base">{config.label}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {selectedDispatch.status === "pending" && "Esperando aprobación"}
                                                            {selectedDispatch.status === "approved" && "Aprobado, listo para despachar"}
                                                            {selectedDispatch.status === "dispatched" && "Productos en tránsito"}
                                                            {selectedDispatch.status === "completed" && "Despacho completado"}
                                                            {selectedDispatch.status === "cancelled" && "Despacho cancelado"}
                                                        </div>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>

                                {/* Flecha de transición */}
                                <div className="flex justify-center py-2">
                                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                </div>

                                {/* Nuevo Estado */}
                                <div className="space-y-3">
                                    <Label className="text-sm font-medium">Nuevo Estado</Label>
                                    <Select onValueChange={(v) => setSelectedStatus(v as DispatchStatus)} value={selectedStatus || undefined}>
                                        <SelectTrigger className="w-full h-11">
                                            <SelectValue placeholder="Seleccionar nuevo estado" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statusConfig[selectedDispatch.status as DispatchStatus].nextActions.map((action) => {
                                                const config = statusConfig[action as DispatchStatus];
                                                const Icon = config.icon;
                                                return (
                                                    <SelectItem key={action} value={action}>
                                                        <div className="flex items-center gap-2">
                                                            <Icon className="h-4 w-4" />
                                                            <span>{config.label}</span>
                                                        </div>
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Información adicional según el estado seleccionado */}
                                {selectedStatus === "dispatched" && (
                                    <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                                        <div className="flex items-start gap-3">
                                            <Truck className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                                Los productos se marcarán como "en tránsito" hacia la bodega destino.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {selectedStatus === "completed" && (
                                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                        <div className="flex items-start gap-3">
                                            <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                                            <p className="text-sm text-emerald-700 dark:text-emerald-300">
                                                Los productos serán transferidos oficialmente a la bodega destino.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {selectedStatus === "cancelled" && (
                                    <div className="p-4 bg-rose-50 dark:bg-rose-950/30 rounded-lg border border-rose-200 dark:border-rose-800">
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className="h-5 w-5 text-rose-600 mt-0.5 flex-shrink-0" />
                                            <p className="text-sm text-rose-700 dark:text-rose-300">
                                                El despacho será cancelado. Esta acción no se puede deshacer.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Resumen del despacho */}
                                <div className="space-y-3 pt-3 border-t">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Productos:</span>
                                        <span className="font-medium">{selectedDispatch.details?.length || 0} items</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Cantidad total:</span>
                                        <span className="font-medium">
                                            {selectedDispatch.details?.reduce((sum: number, d: any) => sum + d.quantity, 0).toLocaleString()} unidades
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Solicitante:</span>
                                        <span className="font-medium">{selectedDispatch.requester_name}</span>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="gap-3 pt-4 border-t">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsStatusDialogOpen(false);
                                        setSelectedStatus(null);
                                    }}
                                    className="min-w-[100px]"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={handleUpdateStatus}
                                    disabled={!selectedStatus || isSubmitting}
                                    className={cn(
                                        "min-w-[140px]",
                                        selectedStatus === "approved" && "bg-blue-600 hover:bg-blue-700",
                                        selectedStatus === "dispatched" && "bg-purple-600 hover:bg-purple-700",
                                        selectedStatus === "completed" && "bg-emerald-600 hover:bg-emerald-700",
                                        selectedStatus === "cancelled" && "bg-rose-600 hover:bg-rose-700"
                                    )}
                                >
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {!isSubmitting && selectedStatus && (
                                        <>
                                            {selectedStatus === "approved" && <CheckCircle className="mr-2 h-4 w-4" />}
                                            {selectedStatus === "dispatched" && <Truck className="mr-2 h-4 w-4" />}
                                            {selectedStatus === "completed" && <Check className="mr-2 h-4 w-4" />}
                                            {selectedStatus === "cancelled" && <XCircle className="mr-2 h-4 w-4" />}
                                        </>
                                    )}
                                    {selectedStatus
                                        ? `Confirmar ${statusConfig[selectedStatus as DispatchStatus]?.label || ""}`
                                        : "Actualizar Estado"
                                    }
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Dialog para Eliminar */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="max-w-md p-6">
                    {selectedDispatch && (
                        <>
                            <DialogHeader className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                                        <AlertTriangle className="h-6 w-6 text-rose-600" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-lg">Eliminar Despacho</DialogTitle>
                                        <DialogDescription className="mt-1">
                                            Esta acción no se puede deshacer.
                                        </DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                                {/* Información del despacho a eliminar */}
                                <div className="p-4 bg-muted/30 rounded-lg border space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Número de Despacho</span>
                                        <span className="font-mono font-medium">{selectedDispatch.dispatch_number}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Estado</span>
                                        {getStatusBadge(selectedDispatch.status)}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Solicitante</span>
                                        <span className="font-medium">{selectedDispatch.requester_name}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Productos</span>
                                        <span className="font-medium">{selectedDispatch.details?.length || 0} items</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Cantidad total</span>
                                        <span className="font-medium">
                                            {selectedDispatch.details?.reduce((sum: number, d: any) => sum + d.quantity, 0).toLocaleString()} unidades
                                        </span>
                                    </div>
                                </div>

                                {/* Advertencia */}
                                <div className="p-4 bg-rose-50 dark:bg-rose-950/30 rounded-lg border border-rose-200 dark:border-rose-800">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="h-5 w-5 text-rose-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-rose-800 dark:text-rose-300">
                                                ¿Estás seguro de eliminar este despacho?
                                            </p>
                                            <p className="text-sm text-rose-700 dark:text-rose-400 mt-1">
                                                Se perderá todo el registro del despacho y los productos no serán transferidos.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsDeleteDialogOpen(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleDeleteDispatch}
                                    disabled={isSubmitting}
                                    className="gap-2"
                                >
                                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {!isSubmitting && <Trash2 className="h-4 w-4" />}
                                    Eliminar Despacho
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}