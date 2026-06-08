"use client"

import { useState, useMemo, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    Search,
    Plus,
    Edit,
    Trash2,
    Warehouse,
    Thermometer,
    User,
    Package,
    AlertTriangle,
    CheckCircle,
    XCircle,
    BarChart3,
    Download,
    Eye,
    Filter,
    Box,
    TrendingDown,
    TrendingUp,
    MapPin,
    ThermometerSnowflake,
    ThermometerSun,
    Loader2,
    Save,
    X,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    ChevronDown,
    ArrowUpDown,
    DollarSign,
    Building2,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useWarehouses } from "@/hooks/inventory-hooks/use-warehouses"
import { useProducts } from "@/hooks/inventory-hooks/use-products"
import { useManagers } from "@/hooks/core-hooks/use-managers"

type SortField = 'name' | 'code' | 'capacityM3' | 'productCount'
type SortOrder = 'asc' | 'desc'

export default function WarehousesPage() {
    const { warehouses, isLoading: isLoadingWarehouses, error: warehousesError, createWarehouse, updateWarehouse } = useWarehouses()
    const { products, isLoading: isLoadingProducts } = useProducts({ isActive: true })
    const { managers, isLoading: isLoadingManagers } = useManagers()

    // Estados para bodegas
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [temperatureFilter, setTemperatureFilter] = useState("all")
    const [sortField, setSortField] = useState<SortField>('name')
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [savedFilters, setSavedFilters] = useState<any[]>([])
    const [filterName, setFilterName] = useState("")
    const [showSaveFilterDialog, setShowSaveFilterDialog] = useState(false)

    // Estados para stock
    const [stockSearch, setStockSearch] = useState("")
    const [stockCategoryFilter, setStockCategoryFilter] = useState("all")
    const [stockLevelFilter, setStockLevelFilter] = useState("all")
    const [stockCurrentPage, setStockCurrentPage] = useState(1)
    const [stockItemsPerPage, setStockItemsPerPage] = useState(10)

    // Estados generales
    const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null)
    const [selectedStock, setSelectedStock] = useState<any>(null)
    const [isWarehouseDialogOpen, setIsWarehouseDialogOpen] = useState(false)
    const [isStockDialogOpen, setIsStockDialogOpen] = useState(false)
    const [activeTab, setActiveTab] = useState("warehouses")

    const [warehouseForm, setWarehouseForm] = useState({
        code: "",
        name: "",
        location: "",
        managerId: "",
        capacityM3: "",
        temperatureControlled: false,
        temperatureRange: "",
        isActive: true
    })

    // Cargar filtros guardados
    useEffect(() => {
        const saved = localStorage.getItem("savedWarehouseFilters")
        if (saved) {
            try {
                setSavedFilters(JSON.parse(saved))
            } catch (e) {
                console.error("Error loading saved filters:", e)
            }
        }
    }, [])

    useEffect(() => {
        localStorage.setItem("savedWarehouseFilters", JSON.stringify(savedFilters))
    }, [savedFilters])

    // Filtrar y ordenar bodegas
    const filteredWarehouses = useMemo(() => {
        let filtered = warehouses.filter(warehouse => {
            const matchesSearch =
                warehouse.name.toLowerCase().includes(search.toLowerCase()) ||
                warehouse.code.toLowerCase().includes(search.toLowerCase()) ||
                warehouse.location.toLowerCase().includes(search.toLowerCase())

            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "active" && warehouse.isActive) ||
                (statusFilter === "inactive" && !warehouse.isActive)

            const matchesTemperature =
                temperatureFilter === "all" ||
                (temperatureFilter === "controlled" && warehouse.temperatureControlled) ||
                (temperatureFilter === "ambient" && !warehouse.temperatureControlled)

            return matchesSearch && matchesStatus && matchesTemperature
        })

        // Ordenar
        filtered.sort((a, b) => {
            let aValue: any = a[sortField]
            let bValue: any = b[sortField]

            if (typeof aValue === 'string') {
                return sortOrder === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue)
            }

            return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
        })

        return filtered
    }, [warehouses, search, statusFilter, temperatureFilter, sortField, sortOrder])

    // Paginación bodegas
    const totalPages = Math.ceil(filteredWarehouses.length / itemsPerPage)
    const paginatedWarehouses = filteredWarehouses.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    // Estadísticas
    const stats = useMemo(() => {
        const totalCapacity = warehouses.reduce((sum, w) => sum + (w.capacityM3 || 0), 0)
        const totalProducts = warehouses.reduce((sum, w) => sum + (w.productCount || 0), 0)

        return {
            totalWarehouses: warehouses.length,
            activeWarehouses: warehouses.filter(w => w.isActive).length,
            totalCapacity,
            totalProducts,
            avgCapacity: warehouses.length > 0 ? totalCapacity / warehouses.length : 0,
            controlledCount: warehouses.filter(w => w.temperatureControlled).length,
        }
    }, [warehouses])

    // Calcular nivel de stock
    const getStockLevel = (product: { totalStockQuantity?: number; minimumStock?: number; reorderPoint?: number }) => {
        const stock = product.totalStockQuantity ?? 0
        const min = product.minimumStock ?? 0
        const reorder = product.reorderPoint ?? min
        if (stock <= min) return "critical"
        if (stock <= reorder) return "low"
        return "normal"
    }

    // Filtrar productos
    const filteredStockProducts = useMemo(() => {
        return products.filter(product => {
            const matchesSearch =
                !stockSearch ||
                product.name.toLowerCase().includes(stockSearch.toLowerCase()) ||
                product.code.toLowerCase().includes(stockSearch.toLowerCase())

            const matchesCategory =
                stockCategoryFilter === "all" || product.categoryName === stockCategoryFilter

            const matchesLevel =
                stockLevelFilter === "all" || getStockLevel(product) === stockLevelFilter

            return matchesSearch && matchesCategory && matchesLevel
        })
    }, [products, stockSearch, stockCategoryFilter, stockLevelFilter])

    // Paginación stock
    const stockTotalPages = Math.ceil(filteredStockProducts.length / stockItemsPerPage)
    const paginatedStockProducts = filteredStockProducts.slice(
        (stockCurrentPage - 1) * stockItemsPerPage,
        stockCurrentPage * stockItemsPerPage
    )

    // Handlers
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortOrder('asc')
        }
        setCurrentPage(1)
    }

    const handleClearFilters = () => {
        setSearch("")
        setStatusFilter("all")
        setTemperatureFilter("all")
        setCurrentPage(1)
    }

    const handleSaveFilter = () => {
        if (filterName.trim()) {
            const newFilter = {
                id: Date.now(),
                name: filterName,
                search,
                statusFilter,
                temperatureFilter,
                createdAt: new Date().toISOString(),
            }
            setSavedFilters([...savedFilters, newFilter])
            setFilterName("")
            setShowSaveFilterDialog(false)
        }
    }

    const handleLoadFilter = (filter: any) => {
        setSearch(filter.search)
        setStatusFilter(filter.statusFilter)
        setTemperatureFilter(filter.temperatureFilter)
        setCurrentPage(1)
    }

    const handleDeleteFilter = (filterId: number) => {
        setSavedFilters(savedFilters.filter(f => f.id !== filterId))
    }

    const handleEditWarehouse = (warehouse: any) => {
        setSelectedWarehouse(warehouse)
        setWarehouseForm({
            code: warehouse.code,
            name: warehouse.name,
            location: warehouse.location,
            managerId: warehouse.managerId,
            capacityM3: warehouse.capacityM3.toString(),
            temperatureControlled: warehouse.temperatureControlled,
            temperatureRange: warehouse.temperatureRange || "",
            isActive: warehouse.isActive
        })
        setIsWarehouseDialogOpen(true)
    }

    const handleViewProductDetail = (product: any) => {
        setSelectedStock(product)
        setIsStockDialogOpen(true)
    }

    const handleSaveWarehouse = async () => {
        try {
            const payload = {
                ...warehouseForm,
                capacityM3: Number(warehouseForm.capacityM3) || 0,
            }
            if (selectedWarehouse) {
                await updateWarehouse(selectedWarehouse.id, payload as any)
            } else {
                await createWarehouse(payload as any)
            }
            setIsWarehouseDialogOpen(false)
            setSelectedWarehouse(null)
            setWarehouseForm({
                code: "",
                name: "",
                location: "",
                managerId: "",
                capacityM3: "",
                temperatureControlled: false,
                temperatureRange: "",
                isActive: true
            })
        } catch (error) {
            console.error("Error saving warehouse", error)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-GT', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const getStockLevelIcon = (level: string) => {
        switch (level.toLowerCase()) {
            case "critical": return <AlertTriangle className="h-4 w-4" />
            case "low": return <TrendingDown className="h-4 w-4" />
            case "normal": return <CheckCircle className="h-4 w-4" />
            default: return <Package className="h-4 w-4" />
        }
    }

    const stockStats = useMemo(() => {
        const critical = filteredStockProducts.filter(p => getStockLevel(p) === "critical").length
        const low = filteredStockProducts.filter(p => getStockLevel(p) === "low").length
        const normal = filteredStockProducts.filter(p => getStockLevel(p) === "normal").length
        return { critical, low, normal }
    }, [filteredStockProducts])

    if (isLoadingWarehouses && warehouses.length === 0) {
        return (
            <DashboardLayout>
                <div className="space-y-6">
                    <div className="h-32 w-full bg-muted animate-pulse rounded-lg" />
                    <div className="h-64 w-full bg-muted animate-pulse rounded-lg" />
                </div>
            </DashboardLayout>
        )
    }

    if (warehousesError) {
        return (
            <DashboardLayout>
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error al cargar bodegas</AlertTitle>
                    <AlertDescription>{warehousesError}</AlertDescription>
                </Alert>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 bg-gradient-to-br from-primary to-primary/70 rounded-xl shadow-lg">
                                <Warehouse className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                    Gestión de Bodegas
                                </h1>
                                <p className="text-muted-foreground">
                                    Administra las bodegas, inventario y niveles de stock
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setActiveTab(activeTab === "warehouses" ? "stock" : "warehouses")}
                            className="gap-2"
                        >
                            {activeTab === "warehouses" ? (
                                <>
                                    <Package className="h-4 w-4" />
                                    Ver Stock
                                </>
                            ) : (
                                <>
                                    <Warehouse className="h-4 w-4" />
                                    Ver Bodegas
                                </>
                            )}
                        </Button>
                        <Button onClick={() => {
                            setSelectedWarehouse(null)
                            setWarehouseForm({
                                code: "",
                                name: "",
                                location: "",
                                managerId: "",
                                capacityM3: "",
                                temperatureControlled: false,
                                temperatureRange: "",
                                isActive: true
                            })
                            setIsWarehouseDialogOpen(true)
                        }} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Nueva Bodega
                        </Button>
                    </div>
                </div>

                {/* Stats Cards con gradientes */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-none shadow-md hover:shadow-lg transition-all">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Bodegas</p>
                                    <p className="text-3xl font-bold">{stats.totalWarehouses}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{stats.activeWarehouses} activas</p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                                    <Building2 className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-none shadow-md hover:shadow-lg transition-all">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Capacidad Total</p>
                                    <p className="text-3xl font-bold text-emerald-600">{stats.totalCapacity.toFixed(1)} m³</p>
                                    <p className="text-xs text-muted-foreground mt-1">Promedio: {stats.avgCapacity.toFixed(1)} m³/bodega</p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                    <Box className="h-6 w-6 text-emerald-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-none shadow-md hover:shadow-lg transition-all">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Productos</p>
                                    <p className="text-3xl font-bold text-purple-600">{stats.totalProducts}</p>
                                    <p className="text-xs text-muted-foreground mt-1">En todas las bodegas</p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                                    <Package className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-cyan-50 to-sky-50 dark:from-cyan-950/20 dark:to-sky-950/20 border-none shadow-md hover:shadow-lg transition-all">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Bodegas Frías</p>
                                    <p className="text-3xl font-bold text-cyan-600">{stats.controlledCount}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Control de temperatura</p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-cyan-500/10 flex items-center justify-center">
                                    <ThermometerSnowflake className="h-6 w-6 text-cyan-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList className="grid w-[300px] grid-cols-2">
                        <TabsTrigger value="warehouses" className="flex items-center gap-2">
                            <Warehouse className="h-4 w-4" />
                            Bodegas
                        </TabsTrigger>
                        <TabsTrigger value="stock" className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Stock Global
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab: Bodegas */}
                    <TabsContent value="warehouses" className="space-y-4">
                        {/* Filtros Avanzados */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-wrap gap-3">
                                        <div className="relative flex-1 min-w-[200px]">
                                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                placeholder="Buscar por nombre, código o ubicación..."
                                                value={search}
                                                onChange={(e) => {
                                                    setSearch(e.target.value)
                                                    setCurrentPage(1)
                                                }}
                                                className="pl-9"
                                            />
                                        </div>

                                        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1) }}>
                                            <SelectTrigger className="w-[140px]">
                                                <Filter className="mr-2 h-4 w-4" />
                                                <SelectValue placeholder="Estado" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todos</SelectItem>
                                                <SelectItem value="active">Activas</SelectItem>
                                                <SelectItem value="inactive">Inactivas</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Select value={temperatureFilter} onValueChange={(v) => { setTemperatureFilter(v); setCurrentPage(1) }}>
                                            <SelectTrigger className="w-[160px]">
                                                <Thermometer className="mr-2 h-4 w-4" />
                                                <SelectValue placeholder="Temperatura" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todas</SelectItem>
                                                <SelectItem value="controlled">Controlada</SelectItem>
                                                <SelectItem value="ambient">Ambiente</SelectItem>
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
                                                                {statusFilter !== "all" && <div>📊 Estado: {statusFilter === "active" ? "Activas" : "Inactivas"}</div>}
                                                                {temperatureFilter !== "all" && <div>🌡️ Temperatura: {temperatureFilter === "controlled" ? "Controlada" : "Ambiente"}</div>}
                                                                {!search && statusFilter === "all" && temperatureFilter === "all" && (
                                                                    <div className="text-muted-foreground">Mostrando todas las bodegas</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <Label>Nombre del filtro</Label>
                                                            <Input
                                                                value={filterName}
                                                                onChange={(e) => setFilterName(e.target.value)}
                                                                placeholder="Ej: Bodegas activas con temperatura controlada"
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
                                                            e.stopPropagation()
                                                            handleDeleteFilter(filter.id)
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

                        {/* Tabla de Bodegas */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Bodegas del Sistema</CardTitle>
                                <CardDescription>
                                    {filteredWarehouses.length} {filteredWarehouses.length === 1 ? 'bodega encontrada' : 'bodegas encontradas'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/50">
                                                <TableHead className="cursor-pointer hover:bg-muted w-[100px]" onClick={() => handleSort('code')}>
                                                    <div className="flex items-center gap-1">
                                                        Código
                                                        {sortField === 'code' && (sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                                                        {sortField !== 'code' && <ArrowUpDown className="h-3 w-3 opacity-50" />}
                                                    </div>
                                                </TableHead>
                                                <TableHead className="cursor-pointer hover:bg-muted" onClick={() => handleSort('name')}>
                                                    <div className="flex items-center gap-1">
                                                        Nombre
                                                        {sortField === 'name' && (sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                                                        {sortField !== 'name' && <ArrowUpDown className="h-3 w-3 opacity-50" />}
                                                    </div>
                                                </TableHead>
                                                <TableHead>Ubicación</TableHead>
                                                <TableHead className="cursor-pointer hover:bg-muted text-right" onClick={() => handleSort('capacityM3')}>
                                                    <div className="flex items-center justify-end gap-1">
                                                        Capacidad
                                                        {sortField === 'capacityM3' && (sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                                                        {sortField !== 'capacityM3' && <ArrowUpDown className="h-3 w-3 opacity-50" />}
                                                    </div>
                                                </TableHead>
                                                <TableHead>Encargado</TableHead>
                                                <TableHead className="cursor-pointer hover:bg-muted text-right" onClick={() => handleSort('productCount')}>
                                                    <div className="flex items-center justify-end gap-1">
                                                        Productos
                                                        {sortField === 'productCount' && (sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                                                        {sortField !== 'productCount' && <ArrowUpDown className="h-3 w-3 opacity-50" />}
                                                    </div>
                                                </TableHead>
                                                <TableHead>Temp.</TableHead>
                                                <TableHead>Estado</TableHead>
                                                <TableHead>Creado</TableHead>
                                                <TableHead className="text-right">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {paginatedWarehouses.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={10} className="h-32 text-center text-muted-foreground">
                                                        No se encontraron bodegas
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                paginatedWarehouses.map((warehouse) => (
                                                    <TableRow key={warehouse.id} className="hover:bg-muted/50 transition-colors">
                                                        <TableCell className="font-mono text-xs font-medium">
                                                            {warehouse.code}
                                                        </TableCell>
                                                        <TableCell className="font-medium">
                                                            <div className="flex items-center gap-2">
                                                                {warehouse.temperatureControlled ? (
                                                                    <ThermometerSnowflake className="h-4 w-4 text-blue-500" />
                                                                ) : (
                                                                    <Warehouse className="h-4 w-4 text-muted-foreground" />
                                                                )}
                                                                {warehouse.name}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-1">
                                                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                                                <span className="text-sm">{warehouse.location}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right font-medium">
                                                            {warehouse.capacityM3} m³
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <User className="h-3 w-3 text-muted-foreground" />
                                                                <span className="text-sm">{warehouse.managerName || "—"}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Package className="h-3 w-3 text-muted-foreground" />
                                                                <span className="text-sm">{warehouse.productCount || 0}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {warehouse.temperatureControlled ? (
                                                                <Badge variant="outline" className="gap-1 text-xs bg-blue-500/10 text-blue-600 border-blue-200">
                                                                    <ThermometerSnowflake className="h-3 w-3" />
                                                                    Controlada
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="outline" className="gap-1 text-xs">
                                                                    <ThermometerSun className="h-3 w-3" />
                                                                    Ambiente
                                                                </Badge>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {warehouse.isActive ? (
                                                                <Badge className="bg-green-100 text-green-800 gap-1">
                                                                    <CheckCircle className="h-3 w-3" />
                                                                    Activa
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="outline" className="text-gray-500 gap-1">
                                                                    <XCircle className="h-3 w-3" />
                                                                    Inactiva
                                                                </Badge>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-sm text-muted-foreground">
                                                            {formatDate(warehouse.createdAt)}
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
                                                                                onClick={() => handleEditWarehouse(warehouse)}
                                                                            >
                                                                                <Edit className="h-4 w-4" />
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>Editar bodega</TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Paginación Bodegas */}
                                {filteredWarehouses.length > 0 && (
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm text-muted-foreground">
                                                Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredWarehouses.length)} de {filteredWarehouses.length}
                                            </p>
                                            <Select value={itemsPerPage.toString()} onValueChange={(v) => { setItemsPerPage(Number(v)); setCurrentPage(1) }}>
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
                                                    let pageNum = currentPage
                                                    if (totalPages <= 5) {
                                                        pageNum = i + 1
                                                    } else if (currentPage <= 3) {
                                                        pageNum = i + 1
                                                    } else if (currentPage >= totalPages - 2) {
                                                        pageNum = totalPages - 4 + i
                                                    } else {
                                                        pageNum = currentPage - 2 + i
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
                                                    )
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

                    {/* Tab: Stock Global */}
                    <TabsContent value="stock" className="space-y-4">
                        {/* Filtros Stock */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-wrap gap-3">
                                        <div className="relative flex-1 min-w-[200px]">
                                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                placeholder="Buscar por nombre o código..."
                                                value={stockSearch}
                                                onChange={(e) => {
                                                    setStockSearch(e.target.value)
                                                    setStockCurrentPage(1)
                                                }}
                                                className="pl-9"
                                            />
                                        </div>

                                        <Select value={stockCategoryFilter} onValueChange={(v) => { setStockCategoryFilter(v); setStockCurrentPage(1) }}>
                                            <SelectTrigger className="w-[180px]">
                                                <Filter className="mr-2 h-4 w-4" />
                                                <SelectValue placeholder="Categoría" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todas las categorías</SelectItem>
                                                {Array.from(new Set(products.map(p => p.categoryName).filter(Boolean))).map(cat => (
                                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <Select value={stockLevelFilter} onValueChange={(v) => { setStockLevelFilter(v); setStockCurrentPage(1) }}>
                                            <SelectTrigger className="w-[160px]">
                                                <AlertTriangle className="mr-2 h-4 w-4" />
                                                <SelectValue placeholder="Nivel de stock" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todos</SelectItem>
                                                <SelectItem value="critical">Crítico</SelectItem>
                                                <SelectItem value="low">Bajo</SelectItem>
                                                <SelectItem value="normal">Normal</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Resumen rápido */}
                        {!isLoadingProducts && filteredStockProducts.length > 0 && (
                            <div className="grid gap-3 grid-cols-3">
                                <Card className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 border-none">
                                    <CardContent className="p-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-muted-foreground">Stock Crítico</p>
                                                <p className="text-2xl font-bold text-red-600">{stockStats.critical}</p>
                                            </div>
                                            <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center">
                                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-none">
                                    <CardContent className="p-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-muted-foreground">Stock Bajo</p>
                                                <p className="text-2xl font-bold text-yellow-600">{stockStats.low}</p>
                                            </div>
                                            <div className="h-8 w-8 rounded-full bg-yellow-500/10 flex items-center justify-center">
                                                <TrendingDown className="h-4 w-4 text-yellow-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-none">
                                    <CardContent className="p-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-muted-foreground">Stock Normal</p>
                                                <p className="text-2xl font-bold text-green-600">{stockStats.normal}</p>
                                            </div>
                                            <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Tabla de Productos */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Catálogo de Productos</CardTitle>
                                <CardDescription>
                                    {isLoadingProducts
                                        ? "Cargando productos..."
                                        : `${filteredStockProducts.length} producto${filteredStockProducts.length !== 1 ? "s" : ""} encontrado${filteredStockProducts.length !== 1 ? "s" : ""}`
                                    }
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoadingProducts ? (
                                    <div className="flex items-center justify-center py-16">
                                        <Loader2 className="h-7 w-7 animate-spin text-primary" />
                                        <span className="ml-3 text-muted-foreground">Cargando inventario...</span>
                                    </div>
                                ) : filteredStockProducts.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                                            <Package className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <h3 className="text-lg font-semibold mb-2">No se encontraron productos</h3>
                                        <p className="text-muted-foreground">No hay productos con los filtros seleccionados</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="rounded-md border">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="bg-muted/50">
                                                        <TableHead>Producto</TableHead>
                                                        <TableHead>Categoría</TableHead>
                                                        <TableHead className="text-right">Stock Global</TableHead>
                                                        <TableHead className="text-right">Disponible</TableHead>
                                                        <TableHead className="text-right">Reservado</TableHead>
                                                        <TableHead>Nivel</TableHead>
                                                        <TableHead className="text-right">Precio Costo</TableHead>
                                                        <TableHead className="text-right">Precio Venta</TableHead>
                                                        <TableHead className="text-right">Acciones</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {paginatedStockProducts.map((product) => {
                                                        const stockLevel = getStockLevel(product)
                                                        const stockQty = product.totalStockQuantity ?? 0
                                                        const availableQty = product.totalAvailableQuantity ?? 0
                                                        const reservedQty = product.totalReservedQuantity ?? 0
                                                        const stockPct = product.maximumStock > 0
                                                            ? Math.min(100, Math.round((stockQty / product.maximumStock) * 100))
                                                            : 0

                                                        return (
                                                            <TableRow key={product.id} className="hover:bg-muted/50 transition-colors">
                                                                <TableCell>
                                                                    <div className="space-y-1">
                                                                        <div className="font-medium">{product.name}</div>
                                                                        <div className="flex items-center gap-1">
                                                                            <span className="text-xs text-muted-foreground font-mono">{product.code}</span>
                                                                            {product.requiresRefrigeration && (
                                                                                <span title="Requiere refrigeración">
                                                                                    <ThermometerSnowflake className="h-3 w-3 text-blue-500" />
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge variant="secondary" className="text-xs">
                                                                        {product.categoryName || "—"}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    <div className="space-y-1">
                                                                        <span className="font-semibold text-sm">
                                                                            {stockQty.toLocaleString()} <span className="text-xs text-muted-foreground">{product.unitOfMeasure}</span>
                                                                        </span>
                                                                        <Progress
                                                                            value={stockPct}
                                                                            className={`h-1.5 ${stockLevel === "critical" ? "[&>div]:bg-red-500" : stockLevel === "low" ? "[&>div]:bg-yellow-500" : "[&>div]:bg-green-500"}`}
                                                                        />
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    <span className={`font-medium text-sm ${availableQty === 0 ? "text-muted-foreground" : "text-green-600"}`}>
                                                                        {availableQty.toLocaleString()}
                                                                    </span>
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    <span className={`text-sm ${reservedQty > 0 ? "text-amber-600 font-medium" : "text-muted-foreground"}`}>
                                                                        {reservedQty.toLocaleString()}
                                                                    </span>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge
                                                                        variant="outline"
                                                                        className={`gap-1 text-xs ${stockLevel === "critical"
                                                                                ? "border-red-400/40 bg-red-400/10 text-red-700"
                                                                                : stockLevel === "low"
                                                                                    ? "border-yellow-400/40 bg-yellow-400/10 text-yellow-700"
                                                                                    : "border-green-400/40 bg-green-400/10 text-green-700"
                                                                            }`}
                                                                    >
                                                                        {getStockLevelIcon(stockLevel)}
                                                                        {stockLevel === "critical" ? "Crítico" : stockLevel === "low" ? "Bajo" : "Normal"}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    Q{(product.unitCost ?? 0).toLocaleString("es-GT", { minimumFractionDigits: 2 })}
                                                                </TableCell>
                                                                <TableCell className="text-right font-medium text-primary">
                                                                    Q{(product.sellingPrice ?? 0).toLocaleString("es-GT", { minimumFractionDigits: 2 })}
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    <TooltipProvider>
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                    className="h-8 w-8"
                                                                                    onClick={() => handleViewProductDetail(product)}
                                                                                >
                                                                                    <Eye className="h-4 w-4" />
                                                                                </Button>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>Ver detalle</TooltipContent>
                                                                        </Tooltip>
                                                                    </TooltipProvider>
                                                                </TableCell>
                                                            </TableRow>
                                                        )
                                                    })}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        {/* Paginación Stock */}
                                        {filteredStockProducts.length > 0 && (
                                            <div className="flex items-center justify-between mt-4">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm text-muted-foreground">
                                                        Mostrando {((stockCurrentPage - 1) * stockItemsPerPage) + 1} - {Math.min(stockCurrentPage * stockItemsPerPage, filteredStockProducts.length)} de {filteredStockProducts.length}
                                                    </p>
                                                    <Select value={stockItemsPerPage.toString()} onValueChange={(v) => { setStockItemsPerPage(Number(v)); setStockCurrentPage(1) }}>
                                                        <SelectTrigger className="w-[70px]">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="10">10</SelectItem>
                                                            <SelectItem value="25">25</SelectItem>
                                                            <SelectItem value="50">50</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setStockCurrentPage(p => Math.max(1, p - 1))}
                                                        disabled={stockCurrentPage === 1}
                                                    >
                                                        <ChevronLeft className="h-4 w-4" />
                                                        Anterior
                                                    </Button>
                                                    <div className="flex gap-1">
                                                        {Array.from({ length: Math.min(5, stockTotalPages) }, (_, i) => {
                                                            let pageNum = stockCurrentPage
                                                            if (stockTotalPages <= 5) {
                                                                pageNum = i + 1
                                                            } else if (stockCurrentPage <= 3) {
                                                                pageNum = i + 1
                                                            } else if (stockCurrentPage >= stockTotalPages - 2) {
                                                                pageNum = stockTotalPages - 4 + i
                                                            } else {
                                                                pageNum = stockCurrentPage - 2 + i
                                                            }
                                                            return (
                                                                <Button
                                                                    key={pageNum}
                                                                    variant={stockCurrentPage === pageNum ? "default" : "outline"}
                                                                    size="sm"
                                                                    onClick={() => setStockCurrentPage(pageNum)}
                                                                    className="w-9"
                                                                >
                                                                    {pageNum}
                                                                </Button>
                                                            )
                                                        })}
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setStockCurrentPage(p => Math.min(stockTotalPages, p + 1))}
                                                        disabled={stockCurrentPage === stockTotalPages}
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
                    </TabsContent>
                </Tabs>

                {/* Dialog para Crear/Editar Bodega */}
                <Dialog open={isWarehouseDialogOpen} onOpenChange={setIsWarehouseDialogOpen}>
                    <DialogContent className="max-w-2xl max-h-[90vh]">
                        <DialogHeader>
                            <DialogTitle>
                                {selectedWarehouse ? "Editar Bodega" : "Crear Nueva Bodega"}
                            </DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="h-[60vh] pr-4">
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="code">Código *</Label>
                                        <Input
                                            id="code"
                                            placeholder="Ej: BODE-PRIN"
                                            value={warehouseForm.code}
                                            onChange={(e) => setWarehouseForm({ ...warehouseForm, code: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nombre *</Label>
                                        <Input
                                            id="name"
                                            placeholder="Ej: Bodega Principal"
                                            value={warehouseForm.name}
                                            onChange={(e) => setWarehouseForm({ ...warehouseForm, name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="location">Ubicación *</Label>
                                    <Input
                                        id="location"
                                        placeholder="Ej: Planta Baja, Ala Norte"
                                        value={warehouseForm.location}
                                        onChange={(e) => setWarehouseForm({ ...warehouseForm, location: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="manager">Encargado</Label>
                                    <Select
                                        value={warehouseForm.managerId}
                                        onValueChange={(value) => setWarehouseForm({ ...warehouseForm, managerId: value })}
                                        disabled={isLoadingManagers}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={isLoadingManagers ? "Cargando encargados..." : "Seleccionar encargado"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {managers.map(manager => (
                                                <SelectItem key={manager.id} value={manager.id}>
                                                    {manager.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="capacity">Capacidad (m³) *</Label>
                                    <Input
                                        id="capacity"
                                        type="number"
                                        placeholder="Ej: 150"
                                        value={warehouseForm.capacityM3}
                                        onChange={(e) => setWarehouseForm({ ...warehouseForm, capacityM3: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Control de Temperatura</Label>
                                            <p className="text-sm text-muted-foreground">
                                                ¿Esta bodega requiere control de temperatura?
                                            </p>
                                        </div>
                                        <Switch
                                            checked={warehouseForm.temperatureControlled}
                                            onCheckedChange={(checked) => setWarehouseForm({ ...warehouseForm, temperatureControlled: checked })}
                                        />
                                    </div>

                                    {warehouseForm.temperatureControlled && (
                                        <div className="space-y-2">
                                            <Label htmlFor="temperatureRange">Rango de Temperatura</Label>
                                            <Input
                                                id="temperatureRange"
                                                placeholder="Ej: 2°C - 8°C"
                                                value={warehouseForm.temperatureRange}
                                                onChange={(e) => setWarehouseForm({ ...warehouseForm, temperatureRange: e.target.value })}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="status"
                                            checked={warehouseForm.isActive}
                                            onCheckedChange={(checked) => setWarehouseForm({ ...warehouseForm, isActive: checked })}
                                        />
                                        <Label htmlFor="status" className="cursor-pointer">
                                            Bodega Activa
                                        </Label>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Las bodegas inactivas no podrán recibir nuevos productos
                                    </p>
                                </div>
                            </div>
                        </ScrollArea>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsWarehouseDialogOpen(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={handleSaveWarehouse}>
                                {selectedWarehouse ? "Actualizar Bodega" : "Crear Bodega"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Dialog para Detalle de Producto */}
                <Dialog open={isStockDialogOpen} onOpenChange={setIsStockDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        {selectedStock && (() => {
                            const level = getStockLevel(selectedStock)
                            const stockQty = selectedStock.totalStockQuantity ?? 0
                            const availableQty = selectedStock.totalAvailableQuantity ?? 0
                            const reservedQty = selectedStock.totalReservedQuantity ?? 0
                            const maxStock = selectedStock.maximumStock ?? 0
                            const stockPct = maxStock > 0 ? Math.min(100, Math.round((stockQty / maxStock) * 100)) : 0

                            return (
                                <>
                                    <DialogHeader>
                                        <DialogTitle className="text-base">Detalle del Producto</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-5">
                                        {/* Header */}
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold leading-tight">{selectedStock.name}</h3>
                                                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                                    <Badge variant="outline" className="font-mono text-xs">{selectedStock.code}</Badge>
                                                    <Badge variant="secondary" className="text-xs">{selectedStock.categoryName}</Badge>
                                                    <Badge
                                                        variant="outline"
                                                        className={`gap-1 text-xs ${level === "critical" ? "border-red-400/40 bg-red-400/10 text-red-700" :
                                                                level === "low" ? "border-yellow-400/40 bg-yellow-400/10 text-yellow-700" :
                                                                    "border-green-400/40 bg-green-400/10 text-green-700"
                                                            }`}
                                                    >
                                                        {getStockLevelIcon(level)}
                                                        {level === "critical" ? "Crítico" : level === "low" ? "Bajo" : "Normal"}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <div className="text-xl font-bold text-primary">
                                                    Q{(selectedStock.sellingPrice ?? 0).toLocaleString("es-GT", { minimumFractionDigits: 2 })}
                                                </div>
                                                <div className="text-xs text-muted-foreground">precio venta</div>
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Stock global */}
                                        <div>
                                            <h4 className="text-sm font-medium mb-3">Stock Consolidado</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="text-muted-foreground">Nivel actual</span>
                                                    <span className="font-semibold">
                                                        {stockQty.toLocaleString()} {selectedStock.unitOfMeasure}
                                                        <span className="text-xs text-muted-foreground font-normal ml-1">({stockPct}% del máximo)</span>
                                                    </span>
                                                </div>
                                                <Progress
                                                    value={stockPct}
                                                    className={`h-2 ${level === "critical" ? "[&>div]:bg-red-500" : level === "low" ? "[&>div]:bg-yellow-500" : "[&>div]:bg-green-500"}`}
                                                />
                                            </div>
                                            <div className="grid grid-cols-3 gap-3 mt-3">
                                                <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                                                    <div className="text-xs text-muted-foreground mb-0.5">Disponible</div>
                                                    <div className="text-xl font-bold text-green-600">{availableQty.toLocaleString()}</div>
                                                </div>
                                                <div className="text-center p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                                                    <div className="text-xs text-muted-foreground mb-0.5">Reservado</div>
                                                    <div className="text-xl font-bold text-amber-600">{reservedQty.toLocaleString()}</div>
                                                </div>
                                                <div className="text-center p-3 bg-muted rounded-lg">
                                                    <div className="text-xs text-muted-foreground mb-0.5">Total</div>
                                                    <div className="text-xl font-bold">{stockQty.toLocaleString()}</div>
                                                </div>
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Detalles */}
                                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                                            <div className="flex justify-between py-1 border-b">
                                                <span className="text-muted-foreground">Unidad de medida</span>
                                                <span className="font-medium">{selectedStock.unitOfMeasure}</span>
                                            </div>
                                            <div className="flex justify-between py-1 border-b">
                                                <span className="text-muted-foreground">Precio costo</span>
                                                <span className="font-medium">Q{(selectedStock.unitCost ?? 0).toLocaleString("es-GT", { minimumFractionDigits: 2 })}</span>
                                            </div>
                                            <div className="flex justify-between py-1 border-b">
                                                <span className="text-muted-foreground">Stock mínimo</span>
                                                <span className="font-medium">{selectedStock.minimumStock ?? "—"}</span>
                                            </div>
                                            <div className="flex justify-between py-1 border-b">
                                                <span className="text-muted-foreground">Stock máximo</span>
                                                <span className="font-medium">{selectedStock.maximumStock ?? "—"}</span>
                                            </div>
                                            <div className="flex justify-between py-1 border-b">
                                                <span className="text-muted-foreground">Punto de reorden</span>
                                                <span className="font-medium">{selectedStock.reorderPoint ?? "—"}</span>
                                            </div>
                                            <div className="flex justify-between py-1 border-b">
                                                <span className="text-muted-foreground">Alerta vencimiento</span>
                                                <span className="font-medium">{selectedStock.expirationAlertDays ? `${selectedStock.expirationAlertDays} días` : "—"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )
                        })()}
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    )
}