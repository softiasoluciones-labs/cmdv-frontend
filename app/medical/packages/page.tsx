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
    XCircle,
    Eye,
    Filter,
    Download,
    Printer,
    Trash2,
    Layers,
    Clock,
    AlertTriangle,
    Box,
    RefreshCw,
    Archive,
    TrendingUp,
    TrendingDown
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"

// Datos de ejemplo para paquetes
const mockPackages = [
    {
        id: "21298516-1a28-491c-be62-9789881ef700",
        code: "HRN-E-2025",
        name: "Hernia - Médico Externo 2025",
        description: "Reparación de hernia con médico externo para el año 2025",
        doctor_type: "external",
        internal_doctor_price: "0.00",
        external_doctor_price: "2675.00",
        validity_days: 365,
        is_active: true,
        created_at: "2024-12-01T10:30:00.000Z",
        product_count: 8,
        estimated_cost: "1525.50",
        profit_margin: "43%"
    },
    {
        id: "31298516-1a28-491c-be62-9789881ef701",
        code: "HRN-I-2025",
        name: "Hernia - Médico Interno 2025",
        description: "Reparación de hernia con médico interno para el año 2025",
        doctor_type: "internal",
        internal_doctor_price: "1850.00",
        external_doctor_price: "0.00",
        validity_days: 365,
        is_active: true,
        created_at: "2024-12-01T11:15:00.000Z",
        product_count: 8,
        estimated_cost: "1525.50",
        profit_margin: "21%"
    },
    {
        id: "41298516-1a28-491c-be62-9789881ef702",
        code: "APP-E-2024",
        name: "Apéndice - Médico Externo 2024",
        description: "Apendicectomía con médico externo para el año 2024",
        doctor_type: "external",
        internal_doctor_price: "0.00",
        external_doctor_price: "3250.00",
        validity_days: 180,
        is_active: false,
        created_at: "2023-12-15T09:45:00.000Z",
        product_count: 12,
        estimated_cost: "2100.75",
        profit_margin: "55%"
    },
    {
        id: "51298516-1a28-491c-be62-9789881ef703",
        code: "VSC-I-2025",
        name: "Vesícula - Médico Interno 2025",
        description: "Colecistectomía con médico interno para el año 2025",
        doctor_type: "internal",
        internal_doctor_price: "2450.00",
        external_doctor_price: "0.00",
        validity_days: 365,
        is_active: true,
        created_at: "2024-11-20T14:20:00.000Z",
        product_count: 10,
        estimated_cost: "1780.25",
        profit_margin: "38%"
    }
]

// Datos de ejemplo para productos de un paquete
const mockPackageProducts = [
    {
        id: "1",
        package_id: "21298516-1a28-491c-be62-9789881ef700",
        product_id: "393f7a7e-bb88-4c60-bf03-d16fb8c3bb7d",
        product_code: "MED-INS-001",
        product_name: "Insulina Lantus 100UI/ml",
        category: "Medicamentos",
        quantity: 2,
        unit_cost: "25.50",
        total_cost: "51.00"
    },
    {
        id: "2",
        package_id: "21298516-1a28-491c-be62-9789881ef700",
        product_id: "fe5af97c-10e3-4d8e-8864-fef46b4f9d36",
        product_code: "EPP-GNM-002",
        product_name: "Guantes de Nitrilo Talla M",
        category: "Equipo de Protección",
        quantity: 10,
        unit_cost: "5.50",
        total_cost: "55.00"
    },
    {
        id: "3",
        package_id: "21298516-1a28-491c-be62-9789881ef700",
        product_id: "a3b5c7d9-e1f3-45g7-89h1-j23k45l67m89",
        product_code: "INS-SUT-003",
        product_name: "Sutura Quirúrgica 4-0",
        category: "Instrumental",
        quantity: 3,
        unit_cost: "28.63",
        total_cost: "85.89"
    },
    {
        id: "4",
        package_id: "21298516-1a28-491c-be62-9789881ef700",
        product_id: "b4c6d8e0-f2g4-56h8-90i2-k34l56m78n90",
        product_code: "ANE-PRO-004",
        product_name: "Propofol 200mg",
        category: "Anestésicos",
        quantity: 5,
        unit_cost: "12.80",
        total_cost: "64.00"
    }
]

// Datos de ejemplo para productos disponibles
const mockAvailableProducts = [
    { id: "1", code: "MED-INS-001", name: "Insulina Lantus 100UI/ml", category: "Medicamentos", unit_cost: "25.50" },
    { id: "2", code: "EPP-GNM-002", name: "Guantes de Nitrilo Talla M", category: "Equipo de Protección", unit_cost: "5.50" },
    { id: "3", code: "INS-SUT-003", name: "Sutura Quirúrgica 4-0", category: "Instrumental", unit_cost: "28.63" },
    { id: "4", code: "ANE-PRO-004", name: "Propofol 200mg", category: "Anestésicos", unit_cost: "12.80" },
    { id: "5", code: "MAT-GAZ-005", name: "Gasas Estériles 10x10", category: "Materiales", unit_cost: "3.25" },
    { id: "6", code: "EQU-MON-006", name: "Monitor de Signos Vitales", category: "Equipo", unit_cost: "150.00" },
    { id: "7", code: "MED-ABX-007", name: "Amoxicilina 500mg", category: "Medicamentos", unit_cost: "0.85" },
    { id: "8", code: "INS-AGU-008", name: "Agujas 21G", category: "Instrumental", unit_cost: "0.75" }
]

export default function PackagesPage() {
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [doctorTypeFilter, setDoctorTypeFilter] = useState("all")
    const [selectedPackage, setSelectedPackage] = useState<any>(null)
    const [selectedPackageForCopy, setSelectedPackageForCopy] = useState<any>(null)
    const [isPackageDialogOpen, setIsPackageDialogOpen] = useState(false)
    const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false)
    const [isProductsDialogOpen, setIsProductsDialogOpen] = useState(false)
    const [activeTab, setActiveTab] = useState("list")

    const [packageForm, setPackageForm] = useState({
        code: "",
        name: "",
        description: "",
        doctor_type: "internal",
        internal_doctor_price: "",
        external_doctor_price: "",
        validity_days: "365",
        is_active: true
    })

    const [copyForm, setCopyForm] = useState({
        new_year: new Date().getFullYear() + 1,
        price_increase_percentage: "10",
        copy_products: true
    })

    const [packageProducts, setPackageProducts] = useState([...mockPackageProducts])

    // Filtrar paquetes
    const filteredPackages = useMemo(() => {
        return mockPackages.filter(pkg => {
            const matchesSearch =
                pkg.name.toLowerCase().includes(search.toLowerCase()) ||
                pkg.code.toLowerCase().includes(search.toLowerCase()) ||
                pkg.description.toLowerCase().includes(search.toLowerCase())

            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "active" && pkg.is_active) ||
                (statusFilter === "inactive" && !pkg.is_active)

            const matchesDoctorType =
                doctorTypeFilter === "all" ||
                pkg.doctor_type === doctorTypeFilter

            return matchesSearch && matchesStatus && matchesDoctorType
        })
    }, [search, statusFilter, doctorTypeFilter])

    // Estadísticas
    const stats = useMemo(() => {
        const activePackages = mockPackages.filter(pkg => pkg.is_active)
        const totalRevenue = activePackages.reduce((sum, pkg) => {
            const price = pkg.doctor_type === "internal"
                ? parseFloat(pkg.internal_doctor_price)
                : parseFloat(pkg.external_doctor_price)
            return sum + price
        }, 0)

        const totalCost = activePackages.reduce((sum, pkg) => {
            return sum + parseFloat(pkg.estimated_cost)
        }, 0)

        return {
            totalPackages: mockPackages.length,
            activePackages: activePackages.length,
            internalPackages: mockPackages.filter(pkg => pkg.doctor_type === "internal").length,
            externalPackages: mockPackages.filter(pkg => pkg.doctor_type === "external").length,
            totalRevenue,
            totalCost,
            totalProfit: totalRevenue - totalCost,
            avgProfitMargin: activePackages.length > 0
                ? activePackages.reduce((sum, pkg) => sum + parseInt(pkg.profit_margin), 0) / activePackages.length
                : 0
        }
    }, [])

    // Handlers
    const handleViewPackage = (pkg: any) => {
        setSelectedPackage(pkg)
        setIsProductsDialogOpen(true)
    }

    const handleEditPackage = (pkg: any) => {
        setSelectedPackage(pkg)
        setPackageForm({
            code: pkg.code,
            name: pkg.name,
            description: pkg.description,
            doctor_type: pkg.doctor_type,
            internal_doctor_price: pkg.internal_doctor_price,
            external_doctor_price: pkg.external_doctor_price,
            validity_days: pkg.validity_days.toString(),
            is_active: pkg.is_active
        })
        setIsPackageDialogOpen(true)
    }

    const handleCopyPackage = (pkg: any) => {
        setSelectedPackageForCopy(pkg)
        setCopyForm({
            new_year: new Date().getFullYear() + 1,
            price_increase_percentage: "10",
            copy_products: true
        })
        setIsCopyDialogOpen(true)
    }

    const handleSavePackage = () => {
        console.log("Guardando paquete:", packageForm)
        setIsPackageDialogOpen(false)
        setSelectedPackage(null)
        setPackageForm({
            code: "",
            name: "",
            description: "",
            doctor_type: "internal",
            internal_doctor_price: "",
            external_doctor_price: "",
            validity_days: "365",
            is_active: true
        })
    }

    const handleCopyPackageSubmit = () => {
        console.log("Copiando paquete:", selectedPackageForCopy, "con:", copyForm)
        // Aquí iría la lógica para copiar el paquete al siguiente año
        setIsCopyDialogOpen(false)
        setSelectedPackageForCopy(null)
    }

    const handleAddProduct = () => {
        const newProduct = {
            id: `${packageProducts.length + 1}`,
            package_id: selectedPackage?.id || "",
            product_id: "",
            product_code: "",
            product_name: "",
            category: "",
            quantity: 1,
            unit_cost: "0.00",
            total_cost: "0.00"
        }
        setPackageProducts([...packageProducts, newProduct])
    }

    const handleRemoveProduct = (index: number) => {
        const newProducts = [...packageProducts]
        newProducts.splice(index, 1)
        setPackageProducts(newProducts)
    }

    const handleProductChange = (index: number, field: string, value: any) => {
        const newProducts = [...packageProducts]
        newProducts[index] = {
            ...newProducts[index],
            [field]: value
        }

        // Si cambia el producto seleccionado, actualizar información
        if (field === "product_id" && value) {
            const product = mockAvailableProducts.find(p => p.id === value)
            if (product) {
                newProducts[index].product_code = product.code
                newProducts[index].product_name = product.name
                newProducts[index].category = product.category
                newProducts[index].unit_cost = product.unit_cost
                newProducts[index].total_cost = (parseFloat(product.unit_cost) * newProducts[index].quantity).toFixed(2)
            }
        }

        // Si cambia la cantidad, actualizar total
        if (field === "quantity") {
            const qty = parseInt(value) || 0
            newProducts[index].quantity = qty
            newProducts[index].total_cost = (parseFloat(newProducts[index].unit_cost) * qty).toFixed(2)
        }

        setPackageProducts(newProducts)
    }

    // Obtener precio según tipo de doctor
    const getPackagePrice = (pkg: any) => {
        return pkg.doctor_type === "internal"
            ? parseFloat(pkg.internal_doctor_price)
            : parseFloat(pkg.external_doctor_price)
    }

    // Obtener icono según tipo de doctor
    const getDoctorTypeIcon = (type: string) => {
        return type === "internal" ? <UserCheck className="h-4 w-4" /> : <User className="h-4 w-4" />
    }

    // Calcular costo total de productos
    const calculateTotalCost = () => {
        return packageProducts.reduce((sum, product) => sum + parseFloat(product.total_cost), 0)
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Gestión de Paquetes</h1>
                        <p className="text-muted-foreground">
                            Administra paquetes quirúrgicos y médicos para procedimientos
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setActiveTab(activeTab === "list" ? "analysis" : "list")}
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
                        <Dialog open={isPackageDialogOpen} onOpenChange={setIsPackageDialogOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={() => {
                                    setSelectedPackage(null)
                                    setPackageForm({
                                        code: "",
                                        name: "",
                                        description: "",
                                        doctor_type: "internal",
                                        internal_doctor_price: "",
                                        external_doctor_price: "",
                                        validity_days: "365",
                                        is_active: true
                                    })
                                }}>
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
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="code">Código *</Label>
                                                <Input
                                                    id="code"
                                                    placeholder="Ej: HRN-E-2025"
                                                    value={packageForm.code}
                                                    onChange={(e) => setPackageForm({ ...packageForm, code: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Nombre *</Label>
                                                <Input
                                                    id="name"
                                                    placeholder="Ej: Hernia - Médico Externo 2025"
                                                    value={packageForm.name}
                                                    onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="description">Descripción</Label>
                                            <Textarea
                                                id="description"
                                                placeholder="Describe el procedimiento y características del paquete..."
                                                value={packageForm.description}
                                                onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })}
                                                rows={3}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Tipo de Médico *</Label>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className={`flex items-center space-x-2 p-4 border rounded-lg cursor-pointer ${packageForm.doctor_type === "internal"
                                                    ? "border-primary bg-primary/5"
                                                    : "border-muted"
                                                    }`}
                                                    onClick={() => setPackageForm({ ...packageForm, doctor_type: "internal" })}>
                                                    <UserCheck className="h-5 w-5" />
                                                    <div className="flex-1">
                                                        <div className="font-medium">Médico Interno</div>
                                                        <div className="text-sm text-muted-foreground">Personal del hospital</div>
                                                    </div>
                                                    {packageForm.doctor_type === "internal" && (
                                                        <CheckCircle className="h-5 w-5 text-primary" />
                                                    )}
                                                </div>
                                                <div className={`flex items-center space-x-2 p-4 border rounded-lg cursor-pointer ${packageForm.doctor_type === "external"
                                                    ? "border-primary bg-primary/5"
                                                    : "border-muted"
                                                    }`}
                                                    onClick={() => setPackageForm({ ...packageForm, doctor_type: "external" })}>
                                                    <User className="h-5 w-5" />
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
                                                <Label htmlFor="internal_price">Precio Médico Interno (Q)</Label>
                                                <Input
                                                    id="internal_price"
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    value={packageForm.internal_doctor_price}
                                                    onChange={(e) => setPackageForm({ ...packageForm, internal_doctor_price: e.target.value })}
                                                    disabled={packageForm.doctor_type === "external"}
                                                    className={packageForm.doctor_type === "external" ? "opacity-50" : ""}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="external_price">Precio Médico Externo (Q)</Label>
                                                <Input
                                                    id="external_price"
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    value={packageForm.external_doctor_price}
                                                    onChange={(e) => setPackageForm({ ...packageForm, external_doctor_price: e.target.value })}
                                                    disabled={packageForm.doctor_type === "internal"}
                                                    className={packageForm.doctor_type === "internal" ? "opacity-50" : ""}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="validity_days">Días de Validez *</Label>
                                                <Input
                                                    id="validity_days"
                                                    type="number"
                                                    placeholder="365"
                                                    value={packageForm.validity_days}
                                                    onChange={(e) => setPackageForm({ ...packageForm, validity_days: e.target.value })}
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Duración en días del paquete
                                                </p>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="status">Estado</Label>
                                                <div className="flex items-center space-x-2">
                                                    <Switch
                                                        id="status"
                                                        checked={packageForm.is_active}
                                                        onCheckedChange={(checked) => setPackageForm({ ...packageForm, is_active: checked })}
                                                    />
                                                    <Label htmlFor="status" className="cursor-pointer">
                                                        {packageForm.is_active ? "Activo" : "Inactivo"}
                                                    </Label>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    Los paquetes inactivos no estarán disponibles
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </ScrollArea>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsPackageDialogOpen(false)}>
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

                {/* Stats Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                <PackageIcon className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Paquetes</p>
                                <p className="text-2xl font-bold">{stats.totalPackages}</p>
                                <p className="text-xs text-muted-foreground">
                                    {stats.activePackages} activos
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
                                <p className="text-sm text-muted-foreground">Ingreso Total</p>
                                <p className="text-2xl font-bold">Q{stats.totalRevenue.toLocaleString('es-GT', { minimumFractionDigits: 2 })}</p>
                                <p className="text-xs text-muted-foreground">
                                    Q{stats.totalProfit.toLocaleString('es-GT', { minimumFractionDigits: 2 })} ganancia
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                                <UserCheck className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Paquetes Internos</p>
                                <p className="text-2xl font-bold">{stats.internalPackages}</p>
                                <p className="text-xs text-muted-foreground">
                                    Médicos internos
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10">
                                <User className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Paquetes Externos</p>
                                <p className="text-2xl font-bold">{stats.externalPackages}</p>
                                <p className="text-xs text-muted-foreground">
                                    Médicos externos
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="list" className="flex items-center gap-2">
                            <PackageIcon className="h-4 w-4" />
                            Lista de Paquetes
                        </TabsTrigger>
                        <TabsTrigger value="analysis" className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Análisis Financiero
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab: Lista de Paquetes */}
                    <TabsContent value="list" className="space-y-4">
                        {/* Filtros */}
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
                                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                                            <SelectTrigger className="w-[150px]">
                                                <SelectValue placeholder="Estado" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todos</SelectItem>
                                                <SelectItem value="active">Activos</SelectItem>
                                                <SelectItem value="inactive">Inactivos</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select value={doctorTypeFilter} onValueChange={setDoctorTypeFilter}>
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

                        {/* Tabla de Paquetes */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Paquetes del Sistema</CardTitle>
                                <CardDescription>
                                    {filteredPackages.length} {filteredPackages.length === 1 ? 'paquete encontrado' : 'paquetes encontrados'}
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
                                            <TableHead>Productos</TableHead>
                                            <TableHead>Validez</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead className="text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredPackages.map((pkg) => {
                                            const price = getPackagePrice(pkg)
                                            const isExpired = pkg.validity_days < 365 && pkg.is_active

                                            return (
                                                <TableRow key={pkg.id} className="hover:bg-muted/50">
                                                    <TableCell className="font-medium">
                                                        <Badge variant="outline" className="font-mono">
                                                            {pkg.code}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{pkg.name}</span>
                                                            <span className="text-xs text-muted-foreground line-clamp-1">
                                                                {pkg.description}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            {getDoctorTypeIcon(pkg.doctor_type)}
                                                            <Badge variant="outline" className="text-xs">
                                                                {pkg.doctor_type === "internal" ? "Interno" : "Externo"}
                                                            </Badge>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex flex-col items-end">
                                                            <span className="font-medium">
                                                                Q{price.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                                                            </span>
                                                            <div className="text-xs text-muted-foreground">
                                                                Costo: Q{parseFloat(pkg.estimated_cost).toFixed(2)}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Box className="h-3 w-3 text-muted-foreground" />
                                                            <span className="text-sm">{pkg.product_count} productos</span>
                                                            <Badge variant="outline" className="text-xs">
                                                                {pkg.profit_margin}
                                                            </Badge>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-3 w-3 text-muted-foreground" />
                                                            <span className="text-sm">{pkg.validity_days} días</span>
                                                            {isExpired && (
                                                                <Badge variant="outline" className="gap-1 text-xs bg-warning/10 text-warning">
                                                                    <AlertTriangle className="h-3 w-3" />
                                                                    Corta
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant={pkg.is_active ? "default" : "secondary"}>
                                                                {pkg.is_active ? "Activo" : "Inactivo"}
                                                            </Badge>
                                                            {parseInt(pkg.code.slice(-4)) < new Date().getFullYear() && (
                                                                <Badge variant="outline" className="text-xs text-muted-foreground">
                                                                    {pkg.code.slice(-4)}
                                                                </Badge>
                                                            )}
                                                        </div>
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
                                                                    className="text-blue-600 hover:text-blue-700"
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
                                                                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                                    <DropdownMenuItem onClick={() => handleViewPackage(pkg)}>
                                                                        <Eye className="mr-2 h-4 w-4" />
                                                                        Ver Productos
                                                                    </DropdownMenuItem>

                                                                    {pkg.is_active && (
                                                                        <DropdownMenuItem onClick={() => handleCopyPackage(pkg)}>
                                                                            <Copy className="mr-2 h-4 w-4" />
                                                                            Copiar para {new Date().getFullYear() + 1}
                                                                        </DropdownMenuItem>
                                                                    )}

                                                                    <DropdownMenuItem onClick={() => handleEditPackage(pkg)}>
                                                                        <Edit className="mr-2 h-4 w-4" />
                                                                        Editar
                                                                    </DropdownMenuItem>

                                                                    <DropdownMenuItem>
                                                                        <Printer className="mr-2 h-4 w-4" />
                                                                        Imprimir
                                                                    </DropdownMenuItem>

                                                                    <DropdownMenuSeparator />

                                                                    <DropdownMenuItem className="text-destructive">
                                                                        <Archive className="mr-2 h-4 w-4" />
                                                                        {pkg.is_active ? "Desactivar" : "Activar"}
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
                                    <span className="font-medium">Margen promedio:</span> {stats.avgProfitMargin.toFixed(1)}%
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <Download className="h-4 w-4" />
                                        Exportar
                                    </Button>
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <Printer className="h-4 w-4" />
                                        Imprimir Catálogo
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    {/* Tab: Análisis Financiero */}
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
                                    {/* Resumen financiero */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-base">Ingresos Totales</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-3xl font-bold text-success">
                                                    Q{stats.totalRevenue.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                                                </div>
                                                <div className="text-sm text-muted-foreground mt-1">
                                                    De {stats.activePackages} paquetes activos
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-base">Costos Totales</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-3xl font-bold text-destructive">
                                                    Q{stats.totalCost.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                                                </div>
                                                <div className="text-sm text-muted-foreground mt-1">
                                                    Estimado de productos
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-base">Ganancia Neta</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-3xl font-bold text-primary">
                                                    Q{stats.totalProfit.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                                                </div>
                                                <div className="text-sm text-muted-foreground mt-1">
                                                    {stats.avgProfitMargin.toFixed(1)}% margen promedio
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Tabla de rentabilidad */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base">Rentabilidad por Paquete</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Paquete</TableHead>
                                                        <TableHead>Tipo</TableHead>
                                                        <TableHead className="text-right">Precio</TableHead>
                                                        <TableHead className="text-right">Costo</TableHead>
                                                        <TableHead className="text-right">Ganancia</TableHead>
                                                        <TableHead className="text-right">Margen</TableHead>
                                                        <TableHead className="text-right">Rentabilidad</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {mockPackages
                                                        .filter(pkg => pkg.is_active)
                                                        .map((pkg) => {
                                                            const price = getPackagePrice(pkg)
                                                            const cost = parseFloat(pkg.estimated_cost)
                                                            const profit = price - cost
                                                            const margin = (profit / price) * 100
                                                            const profitability = margin > 40 ? "Alta" : margin > 20 ? "Media" : "Baja"

                                                            return (
                                                                <TableRow key={pkg.id}>
                                                                    <TableCell>
                                                                        <div className="flex flex-col">
                                                                            <span className="font-medium">{pkg.name}</span>
                                                                            <span className="text-xs text-muted-foreground font-mono">
                                                                                {pkg.code}
                                                                            </span>
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Badge variant="outline" className="text-xs">
                                                                            {pkg.doctor_type === "internal" ? "Interno" : "Externo"}
                                                                        </Badge>
                                                                    </TableCell>
                                                                    <TableCell className="text-right">
                                                                        <span className="font-medium">
                                                                            Q{price.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                                                                        </span>
                                                                    </TableCell>
                                                                    <TableCell className="text-right">
                                                                        Q{cost.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                                                                    </TableCell>
                                                                    <TableCell className="text-right">
                                                                        <span className={`font-medium ${profit > 0 ? "text-success" : "text-destructive"
                                                                            }`}>
                                                                            Q{profit.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                                                                        </span>
                                                                    </TableCell>
                                                                    <TableCell className="text-right">
                                                                        <Badge className={`gap-1 ${margin > 40 ? "bg-success/10 text-success" :
                                                                            margin > 20 ? "bg-warning/10 text-warning" :
                                                                                "bg-destructive/10 text-destructive"
                                                                            }`}>
                                                                            {margin.toFixed(1)}%
                                                                        </Badge>
                                                                    </TableCell>
                                                                    <TableCell className="text-right">
                                                                        <div className="flex items-center justify-end gap-2">
                                                                            <span>{profitability}</span>
                                                                            {profitability === "Alta" ? (
                                                                                <TrendingUp className="h-4 w-4 text-success" />
                                                                            ) : profitability === "Media" ? (
                                                                                <RefreshCw className="h-4 w-4 text-warning" />
                                                                            ) : (
                                                                                <TrendingDown className="h-4 w-4 text-destructive" />
                                                                            )}
                                                                        </div>
                                                                    </TableCell>
                                                                </TableRow>
                                                            )
                                                        })}
                                                </TableBody>
                                            </Table>
                                        </CardContent>
                                    </Card>

                                    {/* Comparación Interno vs Externo */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base">Comparación: Interno vs Externo</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <h4 className="font-medium mb-4">Médico Interno</h4>
                                                    <div className="space-y-3">
                                                        {mockPackages
                                                            .filter(pkg => pkg.is_active && pkg.doctor_type === "internal")
                                                            .map((pkg) => (
                                                                <div key={pkg.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                                    <div>
                                                                        <div className="font-medium">{pkg.name}</div>
                                                                        <div className="text-sm text-muted-foreground">
                                                                            Q{parseFloat(pkg.internal_doctor_price).toLocaleString('es-GT')}
                                                                        </div>
                                                                    </div>
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {pkg.profit_margin}
                                                                    </Badge>
                                                                </div>
                                                            ))}
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="font-medium mb-4">Médico Externo</h4>
                                                    <div className="space-y-3">
                                                        {mockPackages
                                                            .filter(pkg => pkg.is_active && pkg.doctor_type === "external")
                                                            .map((pkg) => (
                                                                <div key={pkg.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                                    <div>
                                                                        <div className="font-medium">{pkg.name}</div>
                                                                        <div className="text-sm text-muted-foreground">
                                                                            Q{parseFloat(pkg.external_doctor_price).toLocaleString('es-GT')}
                                                                        </div>
                                                                    </div>
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {pkg.profit_margin}
                                                                    </Badge>
                                                                </div>
                                                            ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Dialog para Copiar Paquete */}
                <Dialog open={isCopyDialogOpen} onOpenChange={setIsCopyDialogOpen}>
                    <DialogContent className="max-w-md">
                        {selectedPackageForCopy && (
                            <>
                                <DialogHeader>
                                    <DialogTitle>Copiar Paquete</DialogTitle>
                                    <CardDescription className="pt-2">
                                        Crear una nueva versión del paquete para el próximo año
                                    </CardDescription>
                                </DialogHeader>

                                <div className="space-y-6 py-4">
                                    <div className="p-4 border rounded-lg bg-muted/50">
                                        <div className="flex items-center gap-3">
                                            <PackageIcon className="h-8 w-8 text-primary" />
                                            <div>
                                                <div className="font-medium">{selectedPackageForCopy.name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {selectedPackageForCopy.code} • {selectedPackageForCopy.doctor_type === "internal" ? "Médico Interno" : "Médico Externo"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="new_year">Año Nuevo</Label>
                                            <Select
                                                value={copyForm.new_year.toString()}
                                                onValueChange={(value) => setCopyForm({ ...copyForm, new_year: parseInt(value) })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar año" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {[2025, 2026, 2027, 2028].map(year => (
                                                        <SelectItem key={year} value={year.toString()}>
                                                            {year}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="price_increase">Aumento de Precio (%)</Label>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    id="price_increase"
                                                    type="number"
                                                    min="0"
                                                    max="50"
                                                    step="0.5"
                                                    value={copyForm.price_increase_percentage}
                                                    onChange={(e) => setCopyForm({ ...copyForm, price_increase_percentage: e.target.value })}
                                                    className="flex-1"
                                                />
                                                <span className="text-sm text-muted-foreground">%</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Incremento porcentual aplicado al precio actual
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="copy_products"
                                                    checked={copyForm.copy_products}
                                                    onCheckedChange={(checked) =>
                                                        setCopyForm({ ...copyForm, copy_products: checked as boolean })
                                                    }
                                                />
                                                <Label htmlFor="copy_products" className="cursor-pointer">
                                                    Copiar productos del paquete
                                                </Label>
                                            </div>
                                            <p className="text-xs text-muted-foreground pl-6">
                                                Incluir todos los productos y cantidades del paquete original
                                            </p>
                                        </div>

                                        {/* Preview del nuevo código */}
                                        <Card>
                                            <CardContent className="p-4">
                                                <div className="space-y-2">
                                                    <div className="text-sm text-muted-foreground">Nuevo código del paquete:</div>
                                                    <div className="font-mono text-lg font-bold text-primary">
                                                        {selectedPackageForCopy.code.replace(/\d{4}$/, copyForm.new_year.toString())}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Precio estimado: Q{
                                                            (getPackagePrice(selectedPackageForCopy) *
                                                                (1 + (parseFloat(copyForm.price_increase_percentage) / 100)))
                                                                .toLocaleString('es-GT', { minimumFractionDigits: 2 })
                                                        }
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsCopyDialogOpen(false)}>
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

                {/* Dialog para Ver/Editar Productos del Paquete */}
                <Dialog open={isProductsDialogOpen} onOpenChange={setIsProductsDialogOpen}>
                    <DialogContent className="max-w-4xl">
                        {selectedPackage && (
                            <>
                                <DialogHeader>
                                    <DialogTitle>Productos del Paquete</DialogTitle>
                                    <CardDescription className="pt-2">
                                        Paquete: <span className="font-mono">{selectedPackage.code}</span> •
                                        Nombre: <span className="font-medium">{selectedPackage.name}</span>
                                    </CardDescription>
                                </DialogHeader>

                                <div className="space-y-6">
                                    {/* Resumen del paquete */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <Card>
                                            <CardContent className="p-4 text-center">
                                                <div className="text-2xl font-bold text-primary">
                                                    {packageProducts.length}
                                                </div>
                                                <div className="text-sm text-muted-foreground">Productos</div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="p-4 text-center">
                                                <div className="text-2xl font-bold text-success">
                                                    {packageProducts.reduce((sum, product) => sum + product.quantity, 0)}
                                                </div>
                                                <div className="text-sm text-muted-foreground">Total unidades</div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="p-4 text-center">
                                                <div className="text-2xl font-bold text-destructive">
                                                    Q{calculateTotalCost().toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                                                </div>
                                                <div className="text-sm text-muted-foreground">Costo total</div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Tabla de productos */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold">Lista de Productos</h3>
                                            <Button variant="outline" size="sm" onClick={handleAddProduct}>
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
                                                            <TableHead className="text-right">Costo Unitario</TableHead>
                                                            <TableHead className="text-right">Costo Total</TableHead>
                                                            <TableHead className="w-[50px]"></TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {packageProducts.map((product, index) => (
                                                            <TableRow key={product.id || index}>
                                                                <TableCell>
                                                                    <Select
                                                                        value={product.product_id}
                                                                        onValueChange={(value) => handleProductChange(index, "product_id", value)}
                                                                    >
                                                                        <SelectTrigger className="w-[300px]">
                                                                            <SelectValue placeholder="Seleccionar producto" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {mockAvailableProducts.map(prod => (
                                                                                <SelectItem key={prod.id} value={prod.id}>
                                                                                    <div className="flex flex-col">
                                                                                        <span>{prod.name}</span>
                                                                                        <span className="text-xs text-muted-foreground">
                                                                                            {prod.code} • {prod.category}
                                                                                        </span>
                                                                                    </div>
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Input
                                                                        type="number"
                                                                        min="1"
                                                                        value={product.quantity}
                                                                        onChange={(e) => handleProductChange(index, "quantity", e.target.value)}
                                                                        className="w-24"
                                                                    />
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    <div className="font-medium">
                                                                        Q{parseFloat(product.unit_cost).toFixed(2)}
                                                                    </div>
                                                                    <div className="text-xs text-muted-foreground">
                                                                        {product.category}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    <div className="font-medium">
                                                                        Q{parseFloat(product.total_cost).toFixed(2)}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => handleRemoveProduct(index)}
                                                                        className="text-destructive"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Análisis de rentabilidad */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base">Análisis de Rentabilidad</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div>
                                                        <div className="text-sm text-muted-foreground">Costo Total Productos</div>
                                                        <div className="text-2xl font-bold text-destructive">
                                                            Q{calculateTotalCost().toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-muted-foreground">Precio de Venta</div>
                                                        <div className="text-2xl font-bold text-success">
                                                            Q{getPackagePrice(selectedPackage).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-muted-foreground">Ganancia Estimada</div>
                                                        <div className="text-2xl font-bold text-primary">
                                                            Q{(getPackagePrice(selectedPackage) - calculateTotalCost()).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span>Margen de Ganancia</span>
                                                        <span>
                                                            {((getPackagePrice(selectedPackage) - calculateTotalCost()) / getPackagePrice(selectedPackage) * 100).toFixed(1)}%
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                        <div
                                                            className="bg-primary h-2.5 rounded-full"
                                                            style={{
                                                                width: `${((getPackagePrice(selectedPackage) - calculateTotalCost()) / getPackagePrice(selectedPackage) * 100)}%`,
                                                                maxWidth: '100%'
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsProductsDialogOpen(false)}>
                                        Cancelar
                                    </Button>
                                    <Button onClick={() => {
                                        console.log("Guardando productos:", packageProducts)
                                        setIsProductsDialogOpen(false)
                                    }}>
                                        Guardar Cambios
                                    </Button>
                                </DialogFooter>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    )
}