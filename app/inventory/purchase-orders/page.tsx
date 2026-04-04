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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
    Search,
    Plus,
    Edit,
    Trash2,
    Eye,
    Filter,
    Download,
    Printer,
    CheckCircle,
    XCircle,
    Clock,
    Package,
    Truck,
    ShoppingCart,
    FileText,
    DollarSign,
    Calendar,
    User,
    Warehouse,
    BarChart3,
    Copy,
    ArrowUpDown,
    AlertTriangle,
    Check,
    X,
    ListChecks,
    ClipboardCheck,
    PackageCheck
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"

// Datos de ejemplo para órdenes de compra
const mockPurchaseOrders = [
    {
        id: "5ad06b66-dc52-4f70-aae4-74fb2ab7fca2",
        orderNumber: "PO-251202-2761",
        supplierId: "9f2dbbf2-ee16-4be2-824e-f88914a4b8fe",
        supplierName: "MedTech Supplies SA",
        warehouseId: "43bbb488-92e2-47eb-8216-4010158feb19",
        warehouseName: "Bodega Principal",
        orderDate: "2025-12-03",
        expectedDate: "2025-12-12",
        receivedDate: null,
        status: "draft",
        totalAmount: 2540.75,
        itemsCount: 8,
        notes: "Requerimiento nuevo para Q1 2026",
        createdBy: "ba0a2b9b-c023-4368-82ea-a341a798cdd4",
        createdByName: "Carlos Martínez",
        lastUpdated: "2025-12-03T14:30:00.000Z"
    },
    {
        id: "6bd06b66-dc52-4f70-aae4-74fb2ab7fca3",
        orderNumber: "PO-251201-1892",
        supplierId: "8f2dbbf2-ee16-4be2-824e-f88914a4b8fd",
        supplierName: "Laboratorios Biológicos LTDA",
        warehouseId: "1e959a01-2a1f-4455-988f-e202614fc78f",
        warehouseName: "Almacén Quirófano Central",
        orderDate: "2025-12-01",
        expectedDate: "2025-12-15",
        receivedDate: null,
        status: "pending",
        totalAmount: 18750.20,
        itemsCount: 12,
        notes: "Urgente para cirugías programadas",
        createdBy: "ba0a2b9b-c023-4368-82ea-a341a798cdd4",
        createdByName: "Carlos Martínez",
        lastUpdated: "2025-12-01T10:15:00.000Z"
    },
    {
        id: "7cd06b66-dc52-4f70-aae4-74fb2ab7fca4",
        orderNumber: "PO-251130-1543",
        supplierId: "7f2dbbf2-ee16-4be2-824e-f88914a4b8fc",
        supplierName: "Farmacéutica Central",
        warehouseId: "3c959a01-2a1f-4455-988f-e202614fc80h",
        warehouseName: "Almacén de Farmacia",
        orderDate: "2025-11-30",
        expectedDate: "2025-12-05",
        receivedDate: "2025-12-04",
        status: "partially_received",
        totalAmount: 8450.60,
        itemsCount: 15,
        notes: "Medicamentos de uso regular",
        createdBy: "ca0a2b9b-c023-4368-82ea-a341a798cdd5",
        createdByName: "Ana Rodríguez",
        lastUpdated: "2025-12-04T16:45:00.000Z"
    },
    {
        id: "8dd06b66-dc52-4f70-aae4-74fb2ab7fca5",
        orderNumber: "PO-251128-0987",
        supplierId: "6f2dbbf2-ee16-4be2-824e-f88914a4b8fb",
        supplierName: "Equipos Médicos Internacionales",
        warehouseId: "4d959a01-2a1f-4455-988f-e202614fc81i",
        warehouseName: "Bodega de Laboratorio",
        orderDate: "2025-11-28",
        expectedDate: "2025-12-10",
        receivedDate: "2025-12-10",
        status: "completed",
        totalAmount: 32500.00,
        itemsCount: 5,
        notes: "Equipo nuevo para laboratorio",
        createdBy: "da0a2b9b-c023-4368-82ea-a341a798cdd6",
        createdByName: "Luis Sánchez",
        lastUpdated: "2025-12-10T09:20:00.000Z"
    },
    {
        id: "9ed06b66-dc52-4f70-aae4-74fb2ab7fca6",
        orderNumber: "PO-251125-0765",
        supplierId: "5f2dbbf2-ee16-4be2-824e-f88914a4b8fa",
        supplierName: "Suministros Hospitalarios SA",
        warehouseId: "2b959a01-2a1f-4455-988f-e202614fc79g",
        warehouseName: "Bodega Principal",
        orderDate: "2025-11-25",
        expectedDate: "2025-12-01",
        receivedDate: null,
        status: "cancelled",
        totalAmount: 1200.50,
        itemsCount: 20,
        notes: "Cancelado por cambio de especificaciones",
        createdBy: "ea0a2b9b-c023-4368-82ea-a341a798cdd7",
        createdByName: "María García",
        lastUpdated: "2025-11-28T11:30:00.000Z"
    },
    {
        id: "10fd06b66-dc52-4f70-aae4-74fb2ab7fca7",
        orderNumber: "PO-251120-0432",
        supplierId: "4f2dbbf2-ee16-4be2-824e-f88914a4b8f9",
        supplierName: "Insumos Quirúrgicos Premium",
        warehouseId: "1e959a01-2a1f-4455-988f-e202614fc78f",
        warehouseName: "Almacén Quirófano Central",
        orderDate: "2025-11-20",
        expectedDate: "2025-11-30",
        receivedDate: "2025-11-29",
        status: "completed",
        totalAmount: 8950.30,
        itemsCount: 25,
        notes: "Materiales estériles para quirófano",
        createdBy: "fa0a2b9b-c023-4368-82ea-a341a798cdd8",
        createdByName: "Roberto Díaz",
        lastUpdated: "2025-11-29T15:10:00.000Z"
    }
]

// Datos de ejemplo para items de una orden
const mockOrderItems = [
    {
        id: "1",
        orderId: "5ad06b66-dc52-4f70-aae4-74fb2ab7fca2",
        productId: "393f7a7e-bb88-4c60-bf03-d16fb8c3bb7d",
        productCode: "MED-INS-001",
        productName: "Insulina Lantus 100UI/ml",
        category: "Medicamentos",
        quantity: 50,
        unitPrice: 25.50,
        totalPrice: 1275.00,
        receivedQuantity: 0,
        batchNumber: null,
        expirationDate: null,
        status: "pending"
    },
    {
        id: "2",
        orderId: "5ad06b66-dc52-4f70-aae4-74fb2ab7fca2",
        productId: "fe5af97c-10e3-4d8e-8864-fef46b4f9d36",
        productCode: "EPP-GNM-002",
        productName: "Guantes de Nitrilo Talla M",
        category: "Equipo de Protección",
        quantity: 100,
        unitPrice: 5.50,
        totalPrice: 550.00,
        receivedQuantity: 0,
        batchNumber: null,
        expirationDate: null,
        status: "pending"
    },
    {
        id: "3",
        orderId: "5ad06b66-dc52-4f70-aae4-74fb2ab7fca2",
        productId: "a3b5c7d9-e1f3-45g7-89h1-j23k45l67m89",
        productCode: "INS-SUT-003",
        productName: "Sutura Quirúrgica 4-0",
        category: "Instrumental",
        quantity: 25,
        unitPrice: 28.63,
        totalPrice: 715.75,
        receivedQuantity: 0,
        batchNumber: null,
        expirationDate: null,
        status: "pending"
    }
]

// Datos de ejemplo para proveedores
const mockSuppliers = [
    { id: "9f2dbbf2-ee16-4be2-824e-f88914a4b8fe", name: "MedTech Supplies SA", contact: "contacto@medtech.com" },
    { id: "8f2dbbf2-ee16-4be2-824e-f88914a4b8fd", name: "Laboratorios Biológicos LTDA", contact: "ventas@labio.com" },
    { id: "7f2dbbf2-ee16-4be2-824e-f88914a4b8fc", name: "Farmacéutica Central", contact: "pedidos@farmaceutica.com" },
    { id: "6f2dbbf2-ee16-4be2-824e-f88914a4b8fb", name: "Equipos Médicos Internacionales", contact: "info@equiposmedicos.com" },
    { id: "5f2dbbf2-ee16-4be2-824e-f88914a4b8fa", name: "Suministros Hospitalarios SA", contact: "compras@suministros.com" }
]

// Configuración de estados
const statusConfig = {
    draft: { label: "Borrador", color: "bg-gray-100 text-gray-800", icon: FileText },
    pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800", icon: Clock },
    approved: { label: "Aprobada", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
    partially_received: { label: "Parcial", color: "bg-purple-100 text-purple-800", icon: Package },
    completed: { label: "Completada", color: "bg-green-100 text-green-800", icon: CheckCircle },
    cancelled: { label: "Cancelada", color: "bg-red-100 text-red-800", icon: XCircle }
}

export default function PurchaseOrdersPage() {
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [warehouseFilter, setWarehouseFilter] = useState("all")
    const [selectedOrder, setSelectedOrder] = useState<any>(null)
    const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<any>(null)
    const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false)
    const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false)
    const [isItemsDialogOpen, setIsItemsDialogOpen] = useState(false)
    const [activeTab, setActiveTab] = useState("list")

    const [orderForm, setOrderForm] = useState({
        supplierId: "",
        warehouseId: "",
        orderDate: new Date().toISOString().split('T')[0],
        expectedDate: "",
        notes: "",
        status: "draft"
    })

    const [receiptForm, setReceiptForm] = useState({
        notes: "",
        receivedItems: [] as Array<{
            productId: string
            quantity: number
            batchNumber: string
            expirationDate: string
        }>
    })

    // Filtrar órdenes
    const filteredOrders = useMemo(() => {
        return mockPurchaseOrders.filter(order => {
            const matchesSearch =
                order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
                order.supplierName.toLowerCase().includes(search.toLowerCase()) ||
                order.notes.toLowerCase().includes(search.toLowerCase())

            const matchesStatus =
                statusFilter === "all" ||
                order.status === statusFilter

            const matchesWarehouse =
                warehouseFilter === "all" ||
                order.warehouseId === warehouseFilter

            return matchesSearch && matchesStatus && matchesWarehouse
        })
    }, [search, statusFilter, warehouseFilter])

    // Estadísticas
    const stats = useMemo(() => {
        const totalAmount = mockPurchaseOrders.reduce((sum, order) => sum + order.totalAmount, 0)
        const pendingOrders = mockPurchaseOrders.filter(o =>
            ["draft", "pending", "approved"].includes(o.status)
        ).length
        const completedOrders = mockPurchaseOrders.filter(o =>
            ["completed", "partially_received"].includes(o.status)
        ).length

        return {
            totalOrders: mockPurchaseOrders.length,
            pendingOrders,
            completedOrders,
            totalAmount,
            avgAmount: mockPurchaseOrders.length > 0 ? totalAmount / mockPurchaseOrders.length : 0,
            overdueOrders: mockPurchaseOrders.filter(o =>
                o.status === "pending" &&
                new Date(o.expectedDate) < new Date() &&
                !o.receivedDate
            ).length
        }
    }, [])

    // Handlers
    const handleViewOrder = (order: any) => {
        setSelectedOrder(order)
        setIsItemsDialogOpen(true)
    }

    const handleEditOrder = (order: any) => {
        setSelectedOrder(order)
        setOrderForm({
            supplierId: order.supplierId,
            warehouseId: order.warehouseId,
            orderDate: order.orderDate,
            expectedDate: order.expectedDate,
            notes: order.notes || "",
            status: order.status
        })
        setIsOrderDialogOpen(true)
    }

    const handleReceiveOrder = (order: any) => {
        setSelectedOrderForReceipt(order)
        // Inicializar los items para recepción
        const initialReceivedItems = mockOrderItems
            .filter(item => item.orderId === order.id)
            .map(item => ({
                productId: item.productId,
                quantity: 0,
                batchNumber: "",
                expirationDate: ""
            }))

        setReceiptForm({
            notes: "",
            receivedItems: initialReceivedItems
        })
        setIsReceiptDialogOpen(true)
    }

    const handleSaveOrder = () => {
        console.log("Guardando orden:", orderForm)
        setIsOrderDialogOpen(false)
        setSelectedOrder(null)
        setOrderForm({
            supplierId: "",
            warehouseId: "",
            orderDate: new Date().toISOString().split('T')[0],
            expectedDate: "",
            notes: "",
            status: "draft"
        })
    }

    const handleSubmitReceipt = () => {
        console.log("Enviando recepción:", receiptForm)
        // Aquí iría la llamada a la API para aceptar la PO
        setIsReceiptDialogOpen(false)
        setSelectedOrderForReceipt(null)
        setReceiptForm({
            notes: "",
            receivedItems: []
        })
    }

    const handleReceiptItemChange = (index: number, field: string, value: any) => {
        const newReceivedItems = [...receiptForm.receivedItems]
        newReceivedItems[index] = {
            ...newReceivedItems[index],
            [field]: value
        }
        setReceiptForm({ ...receiptForm, receivedItems: newReceivedItems })
    }

    // Obtener configuración del estado
    const getStatusConfig = (status: string) => {
        return statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    }

    // Calcular días restantes
    const getDaysRemaining = (expectedDate: string) => {
        const today = new Date()
        const expected = new Date(expectedDate)
        const diffTime = expected.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
    }

    // Calcular porcentaje recibido
    const getReceivedPercentage = (order: any) => {
        if (order.status === "completed") return 100
        if (order.status === "partially_received") return 50
        return 0
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Órdenes de Compra</h1>
                        <p className="text-muted-foreground">
                            Gestiona las órdenes de compra y recepción de insumos
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setActiveTab(activeTab === "list" ? "stats" : "list")}
                        >
                            {activeTab === "list" ? (
                                <>
                                    <BarChart3 className="mr-2 h-4 w-4" />
                                    Ver Estadísticas
                                </>
                            ) : (
                                <>
                                    <ListChecks className="mr-2 h-4 w-4" />
                                    Ver Lista
                                </>
                            )}
                        </Button>
                        <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={() => {
                                    setSelectedOrder(null)
                                    setOrderForm({
                                        supplierId: "",
                                        warehouseId: "",
                                        orderDate: new Date().toISOString().split('T')[0],
                                        expectedDate: "",
                                        notes: "",
                                        status: "draft"
                                    })
                                }}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Nueva Orden
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>
                                        {selectedOrder ? "Editar Orden" : "Crear Nueva Orden de Compra"}
                                    </DialogTitle>
                                </DialogHeader>
                                <ScrollArea className="h-[60vh] pr-4">
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="supplier">Proveedor *</Label>
                                                <Select
                                                    value={orderForm.supplierId}
                                                    onValueChange={(value) => setOrderForm({ ...orderForm, supplierId: value })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccionar proveedor" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {mockSuppliers.map(supplier => (
                                                            <SelectItem key={supplier.id} value={supplier.id}>
                                                                {supplier.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="warehouse">Bodega Destino *</Label>
                                                <Select
                                                    value={orderForm.warehouseId}
                                                    onValueChange={(value) => setOrderForm({ ...orderForm, warehouseId: value })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccionar bodega" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Array.from(new Set(mockPurchaseOrders.map(o => o.warehouseName))).map(warehouse => (
                                                            <SelectItem key={warehouse} value={warehouse}>
                                                                {warehouse}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="orderDate">Fecha de Orden *</Label>
                                                <Input
                                                    id="orderDate"
                                                    type="date"
                                                    value={orderForm.orderDate}
                                                    onChange={(e) => setOrderForm({ ...orderForm, orderDate: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="expectedDate">Fecha Esperada *</Label>
                                                <Input
                                                    id="expectedDate"
                                                    type="date"
                                                    value={orderForm.expectedDate}
                                                    onChange={(e) => setOrderForm({ ...orderForm, expectedDate: e.target.value })}
                                                    min={orderForm.orderDate}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="status">Estado</Label>
                                            <Select
                                                value={orderForm.status}
                                                onValueChange={(value) => setOrderForm({ ...orderForm, status: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar estado" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="draft">Borrador</SelectItem>
                                                    <SelectItem value="pending">Pendiente</SelectItem>
                                                    <SelectItem value="approved">Aprobada</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="notes">Notas</Label>
                                            <Textarea
                                                id="notes"
                                                placeholder="Notas adicionales sobre esta orden..."
                                                value={orderForm.notes}
                                                onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
                                                rows={3}
                                            />
                                        </div>

                                        {/* Sección para agregar items - sería un componente aparte en producción */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-base">Items de la Orden</Label>
                                                <Button variant="outline" size="sm">
                                                    <Plus className="mr-2 h-3 w-3" />
                                                    Agregar Producto
                                                </Button>
                                            </div>

                                            <Card>
                                                <CardContent className="p-4">
                                                    <div className="text-sm text-muted-foreground text-center py-8">
                                                        Los items se agregan en la vista de edición de la orden
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
                                </ScrollArea>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsOrderDialogOpen(false)}>
                                        Cancelar
                                    </Button>
                                    <Button onClick={handleSaveOrder}>
                                        {selectedOrder ? "Actualizar Orden" : "Crear Orden"}
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
                                <ShoppingCart className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Órdenes</p>
                                <p className="text-2xl font-bold">{stats.totalOrders}</p>
                                <p className="text-xs text-muted-foreground">
                                    {stats.pendingOrders} pendientes
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                                <DollarSign className="h-6 w-6 text-success" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Valor Total</p>
                                <p className="text-2xl font-bold">Q{stats.totalAmount.toLocaleString('es-GT')}</p>
                                <p className="text-xs text-muted-foreground">
                                    Q{stats.avgAmount.toLocaleString('es-GT', { maximumFractionDigits: 2 })} promedio
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
                                <Clock className="h-6 w-6 text-warning" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Vencidas</p>
                                <p className="text-2xl font-bold text-warning">{stats.overdueOrders}</p>
                                <p className="text-xs text-muted-foreground">
                                    Por recibir
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10">
                                <PackageCheck className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Completadas</p>
                                <p className="text-2xl font-bold">{stats.completedOrders}</p>
                                <p className="text-xs text-muted-foreground">
                                    {((stats.completedOrders / stats.totalOrders) * 100).toFixed(1)}% del total
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="list" className="flex items-center gap-2">
                            <ListChecks className="h-4 w-4" />
                            Lista de Órdenes
                        </TabsTrigger>
                        <TabsTrigger value="stats" className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Estadísticas
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab: Lista de Órdenes */}
                    <TabsContent value="list" className="space-y-4">
                        {/* Filtros */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar órdenes por número, proveedor o notas..."
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
                                                <SelectItem value="draft">Borrador</SelectItem>
                                                <SelectItem value="pending">Pendiente</SelectItem>
                                                <SelectItem value="approved">Aprobada</SelectItem>
                                                <SelectItem value="partially_received">Parcial</SelectItem>
                                                <SelectItem value="completed">Completada</SelectItem>
                                                <SelectItem value="cancelled">Cancelada</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Bodega" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todas</SelectItem>
                                                {Array.from(new Set(mockPurchaseOrders.map(o => o.warehouseName))).map(warehouse => (
                                                    <SelectItem key={warehouse} value={warehouse}>
                                                        {warehouse}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tabla de Órdenes */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Órdenes de Compra</CardTitle>
                                <CardDescription>
                                    {filteredOrders.length} {filteredOrders.length === 1 ? 'orden encontrada' : 'órdenes encontradas'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Número</TableHead>
                                            <TableHead>Proveedor</TableHead>
                                            <TableHead>Bodega</TableHead>
                                            <TableHead>Fechas</TableHead>
                                            <TableHead className="text-right">Monto</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead className="text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredOrders.map((order) => {
                                            const daysRemaining = getDaysRemaining(order.expectedDate)
                                            const StatusIcon = getStatusConfig(order.status).icon
                                            const isOverdue = daysRemaining < 0 && !order.receivedDate && order.status === "pending"

                                            return (
                                                <TableRow key={order.id} className="hover:bg-muted/50">
                                                    <TableCell className="font-medium">
                                                        <div className="flex flex-col">
                                                            <span className="font-mono">{order.orderNumber}</span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {order.itemsCount} items
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span>{order.supplierName}</span>
                                                            <span className="text-xs text-muted-foreground">
                                                                Orden: {new Date(order.orderDate).toLocaleDateString('es-GT')}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Warehouse className="h-3 w-3 text-muted-foreground" />
                                                            <span className="text-sm">{order.warehouseName}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                                                <span className="text-sm">
                                                                    Esperada: {new Date(order.expectedDate).toLocaleDateString('es-GT')}
                                                                </span>
                                                            </div>
                                                            <div className="mt-1">
                                                                {isOverdue ? (
                                                                    <Badge variant="outline" className="gap-1 text-xs bg-destructive/10 text-destructive">
                                                                        <AlertTriangle className="h-3 w-3" />
                                                                        {Math.abs(daysRemaining)} días vencida
                                                                    </Badge>
                                                                ) : daysRemaining >= 0 && order.status === "pending" ? (
                                                                    <Badge variant="outline" className="gap-1 text-xs">
                                                                        <Clock className="h-3 w-3" />
                                                                        {daysRemaining} días restantes
                                                                    </Badge>
                                                                ) : order.receivedDate ? (
                                                                    <Badge variant="outline" className="gap-1 text-xs bg-success/10 text-success">
                                                                        <PackageCheck className="h-3 w-3" />
                                                                        Recibida: {new Date(order.receivedDate).toLocaleDateString('es-GT')}
                                                                    </Badge>
                                                                ) : null}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex flex-col items-end">
                                                            <span className="font-medium">Q{order.totalAmount.toLocaleString('es-GT', { minimumFractionDigits: 2 })}</span>
                                                            <div className="flex items-center gap-1 mt-1">
                                                                <Progress
                                                                    value={getReceivedPercentage(order)}
                                                                    className="h-2 w-16"
                                                                />
                                                                <span className="text-xs text-muted-foreground">
                                                                    {getReceivedPercentage(order)}%
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={`gap-1 ${getStatusConfig(order.status).color}`}>
                                                            <StatusIcon className="h-3 w-3" />
                                                            {getStatusConfig(order.status).label}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleViewOrder(order)}
                                                                title="Ver detalles"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>

                                                            {["pending", "approved", "partially_received"].includes(order.status) && !order.receivedDate && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleReceiveOrder(order)}
                                                                    title="Recibir orden"
                                                                    className="text-success hover:text-success"
                                                                >
                                                                    <PackageCheck className="h-4 w-4" />
                                                                </Button>
                                                            )}

                                                            {order.status === "draft" && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleEditOrder(order)}
                                                                    title="Editar"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                            )}

                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon">
                                                                        <Filter className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                                    <DropdownMenuItem onClick={() => handleViewOrder(order)}>
                                                                        <Eye className="mr-2 h-4 w-4" />
                                                                        Ver Detalles
                                                                    </DropdownMenuItem>

                                                                    {["pending", "approved", "partially_received"].includes(order.status) && !order.receivedDate && (
                                                                        <DropdownMenuItem onClick={() => handleReceiveOrder(order)}>
                                                                            <PackageCheck className="mr-2 h-4 w-4" />
                                                                            Recibir Orden
                                                                        </DropdownMenuItem>
                                                                    )}

                                                                    {order.status === "draft" && (
                                                                        <DropdownMenuItem onClick={() => handleEditOrder(order)}>
                                                                            <Edit className="mr-2 h-4 w-4" />
                                                                            Editar
                                                                        </DropdownMenuItem>
                                                                    )}

                                                                    <DropdownMenuItem>
                                                                        <Printer className="mr-2 h-4 w-4" />
                                                                        Imprimir
                                                                    </DropdownMenuItem>

                                                                    <DropdownMenuItem>
                                                                        <Copy className="mr-2 h-4 w-4" />
                                                                        Duplicar
                                                                    </DropdownMenuItem>

                                                                    <DropdownMenuSeparator />

                                                                    {order.status === "draft" && (
                                                                        <DropdownMenuItem className="text-destructive">
                                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                                            Eliminar
                                                                        </DropdownMenuItem>
                                                                    )}

                                                                    {order.status === "pending" && (
                                                                        <DropdownMenuItem className="text-destructive">
                                                                            <XCircle className="mr-2 h-4 w-4" />
                                                                            Cancelar
                                                                        </DropdownMenuItem>
                                                                    )}
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
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-green-100"></div>
                                        <span>Completada</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-yellow-100"></div>
                                        <span>Pendiente</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-red-100"></div>
                                        <span>Cancelada/Vencida</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <Download className="h-4 w-4" />
                                        Exportar
                                    </Button>
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <Printer className="h-4 w-4" />
                                        Imprimir Lista
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    {/* Tab: Estadísticas */}
                    <TabsContent value="stats">
                        <Card>
                            <CardHeader>
                                <CardTitle>Estadísticas de Compras</CardTitle>
                                <CardDescription>
                                    Resumen y análisis de las órdenes de compra
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base">Órdenes por Estado</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {Object.entries(statusConfig).map(([status, config]) => {
                                                    const count = mockPurchaseOrders.filter(o => o.status === status).length
                                                    const percentage = (count / mockPurchaseOrders.length) * 100
                                                    const Icon = config.icon

                                                    return (
                                                        <div key={status} className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`p-1 rounded ${config.color}`}>
                                                                    <Icon className="h-3 w-3" />
                                                                </div>
                                                                <span className="text-sm">{config.label}</span>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-32">
                                                                    <Progress value={percentage} className="h-2" />
                                                                </div>
                                                                <span className="text-sm font-medium w-12 text-right">
                                                                    {count} ({percentage.toFixed(1)}%)
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base">Distribución por Bodega</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {Array.from(new Set(mockPurchaseOrders.map(o => o.warehouseName))).map(warehouse => {
                                                    const orders = mockPurchaseOrders.filter(o => o.warehouseName === warehouse)
                                                    const totalAmount = orders.reduce((sum, o) => sum + o.totalAmount, 0)

                                                    return (
                                                        <div key={warehouse} className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <Warehouse className="h-4 w-4 text-muted-foreground" />
                                                                <span className="text-sm">{warehouse}</span>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="font-medium">{orders.length} órdenes</div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    Q{totalAmount.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="mt-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base">Desempeño de Proveedores</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Proveedor</TableHead>
                                                        <TableHead className="text-right">Órdenes</TableHead>
                                                        <TableHead className="text-right">Monto Total</TableHead>
                                                        <TableHead className="text-right">Promedio/Orden</TableHead>
                                                        <TableHead className="text-right">Tiempo Promedio</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {mockSuppliers.map(supplier => {
                                                        const supplierOrders = mockPurchaseOrders.filter(o => o.supplierId === supplier.id)
                                                        const completedOrders = supplierOrders.filter(o => o.status === "completed" && o.receivedDate)
                                                        const totalAmount = supplierOrders.reduce((sum, o) => sum + o.totalAmount, 0)
                                                        const avgAmount = supplierOrders.length > 0 ? totalAmount / supplierOrders.length : 0

                                                        // Calcular tiempo promedio de entrega (días)
                                                        let avgDeliveryDays = 0
                                                        if (completedOrders.length > 0) {
                                                            const totalDays = completedOrders.reduce((sum, o) => {
                                                                const orderDate = new Date(o.orderDate)
                                                                const receivedDate = new Date(o.receivedDate!)
                                                                const diffTime = receivedDate.getTime() - orderDate.getTime()
                                                                return sum + Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                                                            }, 0)
                                                            avgDeliveryDays = totalDays / completedOrders.length
                                                        }

                                                        return (
                                                            <TableRow key={supplier.id}>
                                                                <TableCell>
                                                                    <div className="font-medium">{supplier.name}</div>
                                                                    <div className="text-xs text-muted-foreground">{supplier.contact}</div>
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    {supplierOrders.length}
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    <div className="font-medium">
                                                                        Q{totalAmount.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    Q{avgAmount.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    {avgDeliveryDays > 0 ? (
                                                                        <div className="flex items-center justify-end gap-1">
                                                                            <span>{avgDeliveryDays.toFixed(1)} días</span>
                                                                            {avgDeliveryDays <= 7 ? (
                                                                                <CheckCircle className="h-4 w-4 text-success" />
                                                                            ) : avgDeliveryDays <= 14 ? (
                                                                                <Clock className="h-4 w-4 text-warning" />
                                                                            ) : (
                                                                                <AlertTriangle className="h-4 w-4 text-destructive" />
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-muted-foreground">N/A</span>
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        )
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

                {/* Dialog para Recepción de Orden */}
                <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
                    <DialogContent className="max-w-4xl max-h-[90vh]">
                        {selectedOrderForReceipt && (
                            <>
                                <DialogHeader>
                                    <DialogTitle>Recepción de Orden</DialogTitle>
                                    <CardDescription className="pt-2">
                                        Orden: <span className="font-mono">{selectedOrderForReceipt.orderNumber}</span> •
                                        Proveedor: <span className="font-medium">{selectedOrderForReceipt.supplierName}</span> •
                                        Bodega: <span className="font-medium">{selectedOrderForReceipt.warehouseName}</span>
                                    </CardDescription>
                                </DialogHeader>

                                <ScrollArea className="h-[60vh] pr-4">
                                    <div className="space-y-6">
                                        <Alert>
                                            <PackageCheck className="h-4 w-4" />
                                            <AlertTitle>Instrucciones para recepción</AlertTitle>
                                            <AlertDescription>
                                                Registra la cantidad recibida de cada producto. Asegúrate de verificar los números de lote y fechas de vencimiento.
                                            </AlertDescription>
                                        </Alert>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold">Productos a Recibir</h3>
                                                <span className="text-sm text-muted-foreground">
                                                    {receiptForm.receivedItems.length} productos
                                                </span>
                                            </div>

                                            <Card>
                                                <CardContent className="p-0">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead className="w-[300px]">Producto</TableHead>
                                                                <TableHead className="text-right">Ordenado</TableHead>
                                                                <TableHead className="text-right">Recibido</TableHead>
                                                                <TableHead>Lote</TableHead>
                                                                <TableHead>Vencimiento</TableHead>
                                                                <TableHead className="text-right">Estado</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {mockOrderItems
                                                                .filter(item => item.orderId === selectedOrderForReceipt.id)
                                                                .map((item, index) => {
                                                                    const receivedItem = receiptForm.receivedItems.find(ri => ri.productId === item.productId)
                                                                    const isComplete = receivedItem && receivedItem.quantity >= item.quantity
                                                                    const isPartial = receivedItem && receivedItem.quantity > 0 && receivedItem.quantity < item.quantity

                                                                    return (
                                                                        <TableRow key={item.id}>
                                                                            <TableCell>
                                                                                <div className="flex flex-col">
                                                                                    <span className="font-medium">{item.productName}</span>
                                                                                    <div className="flex items-center gap-2">
                                                                                        <span className="text-xs text-muted-foreground font-mono">
                                                                                            {item.productCode}
                                                                                        </span>
                                                                                        <Badge variant="outline" className="text-xs">
                                                                                            {item.category}
                                                                                        </Badge>
                                                                                    </div>
                                                                                </div>
                                                                            </TableCell>
                                                                            <TableCell className="text-right">
                                                                                <div className="font-medium">{item.quantity}</div>
                                                                                <div className="text-xs text-muted-foreground">
                                                                                    Q{item.unitPrice.toFixed(2)}/unit
                                                                                </div>
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                <Input
                                                                                    type="number"
                                                                                    min="0"
                                                                                    max={item.quantity}
                                                                                    value={receivedItem?.quantity || 0}
                                                                                    onChange={(e) => handleReceiptItemChange(
                                                                                        index,
                                                                                        'quantity',
                                                                                        parseInt(e.target.value) || 0
                                                                                    )}
                                                                                    className="w-24 ml-auto"
                                                                                />
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                <Input
                                                                                    placeholder="Número de lote"
                                                                                    value={receivedItem?.batchNumber || ""}
                                                                                    onChange={(e) => handleReceiptItemChange(
                                                                                        index,
                                                                                        'batchNumber',
                                                                                        e.target.value
                                                                                    )}
                                                                                    className="w-32"
                                                                                />
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                <Input
                                                                                    type="date"
                                                                                    value={receivedItem?.expirationDate || ""}
                                                                                    onChange={(e) => handleReceiptItemChange(
                                                                                        index,
                                                                                        'expirationDate',
                                                                                        e.target.value
                                                                                    )}
                                                                                    className="w-32"
                                                                                />
                                                                            </TableCell>
                                                                            <TableCell className="text-right">
                                                                                {receivedItem?.quantity === item.quantity ? (
                                                                                    <Badge className="gap-1 bg-success/10 text-success">
                                                                                        <Check className="h-3 w-3" />
                                                                                        Completo
                                                                                    </Badge>
                                                                                ) : receivedItem?.quantity && receivedItem.quantity > 0 ? (
                                                                                    <Badge className="gap-1 bg-warning/10 text-warning">
                                                                                        <Clock className="h-3 w-3" />
                                                                                        Parcial
                                                                                    </Badge>
                                                                                ) : (
                                                                                    <Badge variant="outline" className="text-muted-foreground">
                                                                                        Pendiente
                                                                                    </Badge>
                                                                                )}
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    )
                                                                })}
                                                        </TableBody>
                                                    </Table>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold">Resumen de Recepción</h3>
                                                <div className="text-sm text-muted-foreground">
                                                    Total recibido: {
                                                        receiptForm.receivedItems.reduce((sum, item) => sum + item.quantity, 0)
                                                    } unidades
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-4">
                                                <Card>
                                                    <CardContent className="p-4 text-center">
                                                        <div className="text-2xl font-bold text-success">
                                                            {receiptForm.receivedItems.filter(item => item.quantity > 0).length}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">Productos recibidos</div>
                                                    </CardContent>
                                                </Card>
                                                <Card>
                                                    <CardContent className="p-4 text-center">
                                                        <div className="text-2xl font-bold text-warning">
                                                            {receiptForm.receivedItems.filter(item =>
                                                                item.quantity > 0 &&
                                                                item.quantity < (mockOrderItems.find(mi => mi.productId === item.productId)?.quantity || 0)
                                                            ).length}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">Recepción parcial</div>
                                                    </CardContent>
                                                </Card>
                                                <Card>
                                                    <CardContent className="p-4 text-center">
                                                        <div className="text-2xl font-bold text-destructive">
                                                            {receiptForm.receivedItems.filter(item => item.quantity === 0).length}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">No recibidos</div>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="receiptNotes">Notas de Recepción</Label>
                                            <Textarea
                                                id="receiptNotes"
                                                placeholder="Describe el estado de la entrega, observaciones sobre los productos, o razones por faltantes..."
                                                value={receiptForm.notes}
                                                onChange={(e) => setReceiptForm({ ...receiptForm, notes: e.target.value })}
                                                rows={3}
                                            />
                                            <p className="text-sm text-muted-foreground">
                                                Ej: "Entrega conforme. Se verifican lotes y fechas de vencimiento. No se recibieron 50 unidades porque no fueron necesarias."
                                            </p>
                                        </div>
                                    </div>
                                </ScrollArea>

                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsReceiptDialogOpen(false)}>
                                        Cancelar
                                    </Button>
                                    <Button onClick={handleSubmitReceipt}>
                                        <PackageCheck className="mr-2 h-4 w-4" />
                                        Confirmar Recepción
                                    </Button>
                                </DialogFooter>
                            </>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Dialog para Ver Detalles de Orden */}
                <Dialog open={isItemsDialogOpen} onOpenChange={setIsItemsDialogOpen}>
                    <DialogContent className="max-w-4xl">
                        {selectedOrder && (
                            <>
                                <DialogHeader>
                                    <DialogTitle>Detalles de Orden</DialogTitle>
                                    <CardDescription className="pt-2">
                                        Orden: <span className="font-mono">{selectedOrder.orderNumber}</span>
                                    </CardDescription>
                                </DialogHeader>

                                <div className="space-y-6">
                                    {/* Header de la orden */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="font-medium mb-2">Información General</h4>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Proveedor:</span>
                                                        <span className="font-medium">{selectedOrder.supplierName}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Bodega Destino:</span>
                                                        <span className="font-medium">{selectedOrder.warehouseName}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Creado por:</span>
                                                        <span className="font-medium">{selectedOrder.createdByName}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="font-medium mb-2">Fechas</h4>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Fecha Orden:</span>
                                                        <span>{new Date(selectedOrder.orderDate).toLocaleDateString('es-GT')}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Fecha Esperada:</span>
                                                        <span>{new Date(selectedOrder.expectedDate).toLocaleDateString('es-GT')}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Estado:</span>
                                                        <Badge className={`gap-1 ${getStatusConfig(selectedOrder.status).color}`}>
                                                            {getStatusConfig(selectedOrder.status).label}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Items de la orden */}
                                    <div>
                                        <h4 className="font-medium mb-4">Productos ({selectedOrder.itemsCount})</h4>
                                        <Card>
                                            <CardContent className="p-0">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Producto</TableHead>
                                                            <TableHead className="text-right">Cantidad</TableHead>
                                                            <TableHead className="text-right">Precio Unitario</TableHead>
                                                            <TableHead className="text-right">Total</TableHead>
                                                            <TableHead>Estado</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {mockOrderItems
                                                            .filter(item => item.orderId === selectedOrder.id)
                                                            .map((item) => (
                                                                <TableRow key={item.id}>
                                                                    <TableCell>
                                                                        <div className="flex flex-col">
                                                                            <span className="font-medium">{item.productName}</span>
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-xs text-muted-foreground font-mono">
                                                                                    {item.productCode}
                                                                                </span>
                                                                                <Badge variant="outline" className="text-xs">
                                                                                    {item.category}
                                                                                </Badge>
                                                                            </div>
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell className="text-right">
                                                                        <div className="font-medium">{item.quantity}</div>
                                                                        <div className="text-xs text-muted-foreground">
                                                                            Recibido: {item.receivedQuantity}
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell className="text-right">
                                                                        Q{item.unitPrice.toFixed(2)}
                                                                    </TableCell>
                                                                    <TableCell className="text-right">
                                                                        <div className="font-medium">Q{item.totalPrice.toFixed(2)}</div>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Badge variant="outline" className="text-xs">
                                                                            {item.status}
                                                                        </Badge>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                    </TableBody>
                                                </Table>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Resumen financiero */}
                                    <Card>
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <div className="text-sm text-muted-foreground">Total de la Orden</div>
                                                    <div className="text-3xl font-bold text-primary">
                                                        Q{selectedOrder.totalAmount.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm text-muted-foreground">IVA incluido</div>
                                                    <div className="text-sm">
                                                        {selectedOrder.itemsCount} productos
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Notas */}
                                    {selectedOrder.notes && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-base">Notas</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm text-muted-foreground">{selectedOrder.notes}</p>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>

                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsItemsDialogOpen(false)}>
                                        Cerrar
                                    </Button>
                                    {["pending", "approved", "partially_received"].includes(selectedOrder.status) && !selectedOrder.receivedDate && (
                                        <Button onClick={() => {
                                            setIsItemsDialogOpen(false)
                                            handleReceiveOrder(selectedOrder)
                                        }}>
                                            <PackageCheck className="mr-2 h-4 w-4" />
                                            Recibir Orden
                                        </Button>
                                    )}
                                </DialogFooter>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    )
}