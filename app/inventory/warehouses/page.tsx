"use client"

import { useState, useMemo } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
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
    ThermometerSun
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

// Datos de ejemplo para bodegas
const mockWarehouses = [
    {
        id: "1e959a01-2a1f-4455-988f-e202614fc78f",
        code: "BODE-QX",
        name: "Almacén Quirófano Central",
        location: "Segundo Piso, Zona Estéril",
        managerId: "9e1e00c0-4f39-44ed-8704-a35befc53925",
        managerName: "Mario Fernando Fuentes",
        capacityM3: 30,
        currentUsageM3: 22.5,
        temperatureControlled: true,
        temperatureRange: "2°C - 8°C",
        isActive: true,
        productCount: 45,
        lowStockProducts: 3,
        createdAt: "2025-12-02T15:15:06.958Z"
    },
    {
        id: "2b959a01-2a1f-4455-988f-e202614fc79g",
        code: "BODE-PRIN",
        name: "Bodega Principal",
        location: "Planta Baja, Ala Norte",
        managerId: "8e1e00c0-4f39-44ed-8704-a35befc53926",
        managerName: "Ana Lucía Rodríguez",
        capacityM3: 150,
        currentUsageM3: 127.8,
        temperatureControlled: false,
        temperatureRange: "Ambiente",
        isActive: true,
        productCount: 320,
        lowStockProducts: 12,
        createdAt: "2025-11-15T10:30:45.123Z"
    },
    {
        id: "3c959a01-2a1f-4455-988f-e202614fc80h",
        code: "BODE-FARM",
        name: "Almacén de Farmacia",
        location: "Primer Piso, Farmacia Central",
        managerId: "7e1e00c0-4f39-44ed-8704-a35befc53927",
        managerName: "Carlos Enrique García",
        capacityM3: 45,
        currentUsageM3: 41.2,
        temperatureControlled: true,
        temperatureRange: "15°C - 25°C",
        isActive: true,
        productCount: 185,
        lowStockProducts: 8,
        createdAt: "2025-12-10T08:45:22.789Z"
    },
    {
        id: "4d959a01-2a1f-4455-988f-e202614fc81i",
        code: "BODE-LAB",
        name: "Bodega de Laboratorio",
        location: "Tercer Piso, Laboratorio Clínico",
        managerId: "6e1e00c0-4f39-44ed-8704-a35befc53928",
        managerName: "María José Martínez",
        capacityM3: 25,
        currentUsageM3: 18.7,
        temperatureControlled: true,
        temperatureRange: "-20°C - -80°C",
        isActive: true,
        productCount: 67,
        lowStockProducts: 2,
        createdAt: "2025-11-28T14:20:33.456Z"
    },
    {
        id: "5e959a01-2a1f-4455-988f-e202614fc82j",
        code: "BODE-EMER",
        name: "Almacén de Emergencias",
        location: "Sótano, Sala de Emergencias",
        managerId: "5e1e00c0-4f39-44ed-8704-a35befc53929",
        managerName: "Luis Alberto Sánchez",
        capacityM3: 60,
        currentUsageM3: 32.4,
        temperatureControlled: true,
        temperatureRange: "2°C - 8°C",
        isActive: false,
        productCount: 89,
        lowStockProducts: 15,
        createdAt: "2025-10-05T09:15:18.345Z"
    }
]

// Datos de ejemplo para stock de productos
const mockStockDetails = [
    {
        id: "1",
        warehouse_name: "Bodega Principal",
        warehouse_code: "BODE-PRIN",
        product_code: "EPP-GNM",
        product_name: "Guantes de Nitrilo Talla M",
        category: "Equipo de Protección Personal",
        current_stock: 200,
        reserved_quantity: 0,
        available_quantity: 200,
        minimum_stock: 70,
        reorder_point: 120,
        stock_level: "normal",
        unit_cost: "5.50",
        total_value: "1100.00",
        last_restock: "2025-12-10",
        expiry_date: "2026-12-01"
    },
    {
        id: "2",
        warehouse_name: "Almacén de Farmacia",
        warehouse_code: "BODE-FARM",
        product_code: "MED-ABX-001",
        product_name: "Amoxicilina 500mg",
        category: "Medicamentos",
        current_stock: 45,
        reserved_quantity: 15,
        available_quantity: 30,
        minimum_stock: 20,
        reorder_point: 30,
        stock_level: "low",
        unit_cost: "0.85",
        total_value: "38.25",
        last_restock: "2025-12-01",
        expiry_date: "2026-06-15"
    },
    {
        id: "3",
        warehouse_name: "Almacén Quirófano Central",
        warehouse_code: "BODE-QX",
        product_code: "INS-SUT-005",
        product_name: "Sutura Quirúrgica 3-0",
        category: "Instrumental Quirúrgico",
        current_stock: 120,
        reserved_quantity: 40,
        available_quantity: 80,
        minimum_stock: 50,
        reorder_point: 80,
        stock_level: "normal",
        unit_cost: "12.75",
        total_value: "1530.00",
        last_restock: "2025-12-05",
        expiry_date: "2027-03-30"
    },
    {
        id: "4",
        warehouse_name: "Bodega de Laboratorio",
        warehouse_code: "BODE-LAB",
        product_code: "LAB-REA-012",
        product_name: "Reactivo para PCR",
        category: "Reactivos de Laboratorio",
        current_stock: 8,
        reserved_quantity: 2,
        available_quantity: 6,
        minimum_stock: 10,
        reorder_point: 15,
        stock_level: "critical",
        unit_cost: "245.00",
        total_value: "1960.00",
        last_restock: "2025-11-20",
        expiry_date: "2026-02-28"
    },
    {
        id: "5",
        warehouse_name: "Almacén de Emergencias",
        warehouse_code: "BODE-EMER",
        product_code: "EQP-DES-003",
        product_name: "Desfibrilador Portátil",
        category: "Equipo Médico",
        current_stock: 3,
        reserved_quantity: 0,
        available_quantity: 3,
        minimum_stock: 2,
        reorder_point: 3,
        stock_level: "normal",
        unit_cost: "1250.00",
        total_value: "3750.00",
        last_restock: "2025-11-15",
        expiry_date: "2028-12-31"
    }
]

// Mock de managers disponibles
const mockManagers = [
    { id: "9e1e00c0-4f39-44ed-8704-a35befc53925", name: "Mario Fernando Fuentes" },
    { id: "8e1e00c0-4f39-44ed-8704-a35befc53926", name: "Ana Lucía Rodríguez" },
    { id: "7e1e00c0-4f39-44ed-8704-a35befc53927", name: "Carlos Enrique García" },
    { id: "6e1e00c0-4f39-44ed-8704-a35befc53928", name: "María José Martínez" },
    { id: "5e1e00c0-4f39-44ed-8704-a35befc53929", name: "Luis Alberto Sánchez" },
    { id: "4e1e00c0-4f39-44ed-8704-a35befc53930", name: "Patricia Elizabeth López" },
    { id: "3e1e00c0-4f39-44ed-8704-a35befc53931", name: "Roberto Antonio Díaz" }
]

export default function WarehousesPage() {
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [temperatureFilter, setTemperatureFilter] = useState("all")
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

    // Filtrar bodegas
    const filteredWarehouses = useMemo(() => {
        return mockWarehouses.filter(warehouse => {
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
    }, [search, statusFilter, temperatureFilter])

    // Estadísticas
    const stats = useMemo(() => {
        const totalCapacity = mockWarehouses.reduce((sum, w) => sum + w.capacityM3, 0)
        const totalUsage = mockWarehouses.reduce((sum, w) => sum + w.currentUsageM3, 0)
        const totalProducts = mockWarehouses.reduce((sum, w) => sum + w.productCount, 0)
        const totalLowStock = mockWarehouses.reduce((sum, w) => sum + w.lowStockProducts, 0)

        return {
            totalWarehouses: mockWarehouses.length,
            activeWarehouses: mockWarehouses.filter(w => w.isActive).length,
            totalCapacity,
            totalUsage,
            usagePercentage: totalCapacity > 0 ? (totalUsage / totalCapacity) * 100 : 0,
            totalProducts,
            totalLowStock,
            avgCapacity: mockWarehouses.length > 0 ? totalCapacity / mockWarehouses.length : 0
        }
    }, [])

    // Handlers
    const handleEditWarehouse = (warehouse: any) => {
        setSelectedWarehouse(warehouse)
        setWarehouseForm({
            code: warehouse.code,
            name: warehouse.name,
            location: warehouse.location,
            managerId: warehouse.managerId,
            capacityM3: warehouse.capacityM3.toString(),
            temperatureControlled: warehouse.temperatureControlled,
            temperatureRange: warehouse.temperatureRange,
            isActive: warehouse.isActive
        })
        setIsWarehouseDialogOpen(true)
    }

    const handleViewStock = (warehouse: any) => {
        setSelectedWarehouse(warehouse)
        setActiveTab("stock")
    }

    const handleViewProductDetail = (product: any) => {
        setSelectedStock(product)
        setIsStockDialogOpen(true)
    }

    const handleSaveWarehouse = () => {
        console.log("Guardando bodega:", warehouseForm)
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
    }

    // Calcular nivel de uso
    const getUsagePercentage = (warehouse: any) => {
        return warehouse.capacityM3 > 0 ? (warehouse.currentUsageM3 / warehouse.capacityM3) * 100 : 0
    }

    // Obtener color según nivel de stock
    const getStockLevelColor = (level: string) => {
        switch (level.toLowerCase()) {
            case "critical": return "bg-destructive text-destructive-foreground"
            case "low": return "bg-warning text-warning-foreground"
            case "normal": return "bg-success text-success-foreground"
            default: return "bg-muted text-muted-foreground"
        }
    }

    // Obtener icono según nivel de stock
    const getStockLevelIcon = (level: string) => {
        switch (level.toLowerCase()) {
            case "critical": return <AlertTriangle className="h-4 w-4" />
            case "low": return <TrendingDown className="h-4 w-4" />
            case "normal": return <CheckCircle className="h-4 w-4" />
            default: return <Package className="h-4 w-4" />
        }
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Gestión de Bodegas</h1>
                        <p className="text-muted-foreground">
                            Administra las bodegas, inventario y niveles de stock
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setActiveTab(activeTab === "warehouses" ? "stock" : "warehouses")}
                        >
                            {activeTab === "warehouses" ? (
                                <>
                                    <Package className="mr-2 h-4 w-4" />
                                    Ver Stock
                                </>
                            ) : (
                                <>
                                    <Warehouse className="mr-2 h-4 w-4" />
                                    Ver Bodegas
                                </>
                            )}
                        </Button>
                        <Dialog open={isWarehouseDialogOpen} onOpenChange={setIsWarehouseDialogOpen}>
                            <DialogTrigger asChild>
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
                                }}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Nueva Bodega
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
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
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar encargado" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {mockManagers.map(manager => (
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
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                <Warehouse className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Bodegas</p>
                                <p className="text-2xl font-bold">{stats.totalWarehouses}</p>
                                <p className="text-xs text-muted-foreground">
                                    {stats.activeWarehouses} activas
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                                <Box className="h-6 w-6 text-success" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Capacidad Total</p>
                                <p className="text-2xl font-bold">{stats.totalCapacity.toFixed(1)} m³</p>
                                <p className="text-xs text-muted-foreground">
                                    {stats.usagePercentage.toFixed(1)}% en uso
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
                                <Package className="h-6 w-6 text-warning" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Productos</p>
                                <p className="text-2xl font-bold">{stats.totalProducts}</p>
                                <p className="text-xs text-muted-foreground">
                                    {stats.totalLowStock} con stock bajo
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10">
                                <Thermometer className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Bodegas Frías</p>
                                <p className="text-2xl font-bold">
                                    {mockWarehouses.filter(w => w.temperatureControlled).length}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Control de temperatura
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList>
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
                        {/* Filtros */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar bodegas por nombre, código o ubicación..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="pl-9"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                                            <SelectTrigger className="w-[150px]">
                                                <SelectValue placeholder="Estado" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todos</SelectItem>
                                                <SelectItem value="active">Activas</SelectItem>
                                                <SelectItem value="inactive">Inactivas</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select value={temperatureFilter} onValueChange={setTemperatureFilter}>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Temperatura" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todas</SelectItem>
                                                <SelectItem value="controlled">Controlada</SelectItem>
                                                <SelectItem value="ambient">Ambiente</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
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
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Código</TableHead>
                                            <TableHead>Nombre</TableHead>
                                            <TableHead>Ubicación</TableHead>
                                            <TableHead>Capacidad</TableHead>
                                            <TableHead>Encargado</TableHead>
                                            <TableHead>Productos</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead className="text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredWarehouses.map((warehouse) => {
                                            const usagePercentage = getUsagePercentage(warehouse)
                                            return (
                                                <TableRow key={warehouse.id} className="hover:bg-muted/50">
                                                    <TableCell className="font-medium">
                                                        <Badge variant="outline" className="font-mono">
                                                            {warehouse.code}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            {warehouse.temperatureControlled ? (
                                                                <ThermometerSnowflake className="h-4 w-4 text-blue-500" />
                                                            ) : (
                                                                <Warehouse className="h-4 w-4 text-muted-foreground" />
                                                            )}
                                                            <span>{warehouse.name}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="h-3 w-3 text-muted-foreground" />
                                                            <span className="text-sm">{warehouse.location}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div className="flex justify-between text-xs">
                                                                <span>{warehouse.currentUsageM3.toFixed(1)}/{warehouse.capacityM3} m³</span>
                                                                <span>{usagePercentage.toFixed(0)}%</span>
                                                            </div>
                                                            <Progress value={usagePercentage} className="h-2" />
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <User className="h-3 w-3 text-muted-foreground" />
                                                            <span className="text-sm">{warehouse.managerName}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-2">
                                                                <Package className="h-3 w-3 text-muted-foreground" />
                                                                <span className="text-sm">{warehouse.productCount} productos</span>
                                                            </div>
                                                            {warehouse.lowStockProducts > 0 && (
                                                                <Badge variant="outline" className="w-fit gap-1 text-xs bg-warning/10 text-warning">
                                                                    <AlertTriangle className="h-3 w-3" />
                                                                    {warehouse.lowStockProducts} bajo stock
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant={warehouse.isActive ? "default" : "secondary"}>
                                                                {warehouse.isActive ? "Activa" : "Inactiva"}
                                                            </Badge>
                                                            {warehouse.temperatureControlled && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    {warehouse.temperatureRange}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleViewStock(warehouse)}
                                                                title="Ver stock"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleEditWarehouse(warehouse)}
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
                                                                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                                    <DropdownMenuItem onClick={() => handleViewStock(warehouse)}>
                                                                        <Eye className="mr-2 h-4 w-4" />
                                                                        Ver Stock
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleEditWarehouse(warehouse)}>
                                                                        <Edit className="mr-2 h-4 w-4" />
                                                                        Editar
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem>
                                                                        <BarChart3 className="mr-2 h-4 w-4" />
                                                                        Reportes
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem className="text-destructive">
                                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                                        Desactivar
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </CardContent>
                            <CardFooter className="flex-col items-start gap-2 border-t px-6 py-4">
                                <div className="text-sm text-muted-foreground">
                                    <span className="font-medium">Capacidad promedio:</span> {stats.avgCapacity.toFixed(1)} m³ por bodega
                                </div>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Download className="h-4 w-4" />
                                    Exportar Lista
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    {/* Tab: Stock Global */}
                    <TabsContent value="stock">
                        <Card>
                            <CardHeader>
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <CardTitle>Stock por Producto</CardTitle>
                                        <CardDescription>
                                            Niveles de stock en todas las bodegas
                                        </CardDescription>
                                    </div>
                                    {selectedWarehouse && (
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="gap-2">
                                                <Warehouse className="h-3 w-3" />
                                                {selectedWarehouse.name}
                                            </Badge>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setSelectedWarehouse(null)}
                                            >
                                                <XCircle className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Producto</TableHead>
                                            <TableHead>Categoría</TableHead>
                                            <TableHead>Bodega</TableHead>
                                            <TableHead className="text-right">Stock Actual</TableHead>
                                            <TableHead className="text-right">Disponible</TableHead>
                                            <TableHead>Nivel</TableHead>
                                            <TableHead className="text-right">Valor Total</TableHead>
                                            <TableHead className="text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {mockStockDetails
                                            .filter(product =>
                                                !selectedWarehouse || product.warehouse_code === selectedWarehouse.code
                                            )
                                            .map((product) => (
                                                <TableRow key={product.id}>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{product.product_name}</span>
                                                            <span className="text-xs text-muted-foreground font-mono">
                                                                {product.product_code}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="text-xs">
                                                            {product.category}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="outline" className="font-mono text-xs">
                                                                {product.warehouse_code}
                                                            </Badge>
                                                            <span className="text-sm text-muted-foreground">
                                                                {product.warehouse_name}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex flex-col items-end">
                                                            <span className="font-medium">{product.current_stock} units</span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {product.reserved_quantity} reservados
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex flex-col items-end">
                                                            <span className="font-medium">{product.available_quantity}</span>
                                                            <div className="text-xs text-muted-foreground">
                                                                Mín: {product.minimum_stock} | Reorden: {product.reorder_point}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={`gap-1 ${getStockLevelColor(product.stock_level)}`}>
                                                            {getStockLevelIcon(product.stock_level)}
                                                            {product.stock_level.toUpperCase()}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex flex-col items-end">
                                                            <span className="font-medium">Q{product.total_value}</span>
                                                            <span className="text-xs text-muted-foreground">
                                                                Q{product.unit_cost}/unit
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleViewProductDetail(product)}
                                                                title="Ver detalle"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                title="Reabastecer"
                                                            >
                                                                <TrendingUp className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Dialog para Detalle de Producto */}
                <Dialog open={isStockDialogOpen} onOpenChange={setIsStockDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        {selectedStock && (
                            <>
                                <DialogHeader>
                                    <DialogTitle>Detalle de Stock</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-6">
                                    {/* Header del producto */}
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold">{selectedStock.product_name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="outline" className="font-mono">
                                                    {selectedStock.product_code}
                                                </Badge>
                                                <Badge variant="outline">
                                                    {selectedStock.category}
                                                </Badge>
                                                <Badge className={`gap-1 ${getStockLevelColor(selectedStock.stock_level)}`}>
                                                    {getStockLevelIcon(selectedStock.stock_level)}
                                                    {selectedStock.stock_level.toUpperCase()}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-primary">
                                                Q{selectedStock.total_value}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                Q{selectedStock.unit_cost} por unidad
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Información de bodega */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="font-medium mb-2">Información de Bodega</h4>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Bodega:</span>
                                                        <span className="font-medium">{selectedStock.warehouse_name}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Código:</span>
                                                        <Badge variant="outline" className="font-mono">
                                                            {selectedStock.warehouse_code}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="font-medium mb-2">Información de Stock</h4>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Último reabastecimiento:</span>
                                                        <span>{new Date(selectedStock.last_restock).toLocaleDateString('es-GT')}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Fecha de vencimiento:</span>
                                                        <span>{new Date(selectedStock.expiry_date).toLocaleDateString('es-GT')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="font-medium mb-2">Niveles de Stock</h4>
                                                <div className="space-y-3">
                                                    <div>
                                                        <div className="flex justify-between text-sm mb-1">
                                                            <span>Stock Actual</span>
                                                            <span className="font-medium">{selectedStock.current_stock} unidades</span>
                                                        </div>
                                                        <Progress
                                                            value={(selectedStock.current_stock / selectedStock.reorder_point) * 100}
                                                            className="h-2"
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-3 gap-4">
                                                        <div className="text-center p-2 bg-muted rounded-lg">
                                                            <div className="text-xs text-muted-foreground">Disponible</div>
                                                            <div className="text-xl font-bold text-success">
                                                                {selectedStock.available_quantity}
                                                            </div>
                                                        </div>
                                                        <div className="text-center p-2 bg-muted rounded-lg">
                                                            <div className="text-xs text-muted-foreground">Reservado</div>
                                                            <div className="text-xl font-bold text-warning">
                                                                {selectedStock.reserved_quantity}
                                                            </div>
                                                        </div>
                                                        <div className="text-center p-2 bg-muted rounded-lg">
                                                            <div className="text-xs text-muted-foreground">Mínimo</div>
                                                            <div className="text-xl font-bold">
                                                                {selectedStock.minimum_stock}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <Alert variant={selectedStock.stock_level === "critical" ? "destructive" : "default"}>
                                                        {selectedStock.stock_level === "critical" ? (
                                                            <AlertTriangle className="h-4 w-4" />
                                                        ) : selectedStock.stock_level === "low" ? (
                                                            <TrendingDown className="h-4 w-4" />
                                                        ) : (
                                                            <CheckCircle className="h-4 w-4" />
                                                        )}
                                                        <AlertTitle>
                                                            {selectedStock.stock_level === "critical"
                                                                ? "¡Stock Crítico!"
                                                                : selectedStock.stock_level === "low"
                                                                    ? "Stock Bajo"
                                                                    : "Stock Normal"}
                                                        </AlertTitle>
                                                        <AlertDescription>
                                                            {selectedStock.stock_level === "critical"
                                                                ? `El stock está por debajo del mínimo (${selectedStock.minimum_stock}). Se requiere reabastecimiento inmediato.`
                                                                : selectedStock.stock_level === "low"
                                                                    ? `El stock está por debajo del punto de reorden (${selectedStock.reorder_point}). Planificar reabastecimiento.`
                                                                    : "El stock se encuentra en niveles normales."}
                                                        </AlertDescription>
                                                    </Alert>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Acciones */}
                                    <div className="flex justify-end gap-2 pt-4 border-t">
                                        <Button variant="outline">
                                            <TrendingUp className="mr-2 h-4 w-4" />
                                            Reabastecer
                                        </Button>
                                        <Button variant="outline">
                                            <BarChart3 className="mr-2 h-4 w-4" />
                                            Ver Historial
                                        </Button>
                                        <Button>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Editar Stock
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    )
}