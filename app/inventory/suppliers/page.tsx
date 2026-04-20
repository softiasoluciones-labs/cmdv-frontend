"use client"

import { useState, useMemo } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
    Search,
    Plus,
    MoreVertical,
    Edit,
    Trash2,
    Phone,
    Mail,
    MapPin,
    Building,
    Eye,
    Copy,
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
    AlertTriangle
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useSuppliers } from "@/hooks/inventory-hooks/use-suppliers";

export default function SuppliersPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [paymentFilter, setPaymentFilter] = useState<string>("all")

    const { suppliers, loading: isLoadingSuppliers, error: suppliersError, createSupplier, updateSupplier, deleteSupplier } = useSuppliers()

    // Nuevo proveedor
    const [newSupplier, setNewSupplier] = useState({
        code: "",
        name: "",
        contactName: "",
        email: "",
        phone: "",
        address: "",
        city: "Guatemala",
        state: "Guatemala",
        taxId: "",
        paymentTerms: "net_30",
        creditLimit: 0,
        isActive: true
    })

    // Formatear términos de pago
    const formatPaymentTerms = (terms: string) => {
        switch (terms) {
            case "immediate": return "Contado"
            case "net_15": return "Neto 15 días"
            case "net_30": return "Neto 30 días"
            case "net_60": return "Neto 60 días"
            default: return terms
        }
    }

    // Formatear moneda
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-GT', {
            style: 'currency',
            currency: 'GTQ',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount)
    }

    // Filtrar proveedores
    const filteredSuppliers = useMemo(() => suppliers.filter(supplier => {
        const matchesSearch =
            supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            supplier.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            supplier.contactName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            supplier.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            supplier.phone?.includes(searchQuery) ||
            supplier.taxId?.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesStatus = statusFilter === "all" ||
            (statusFilter === "active" && supplier.isActive) ||
            (statusFilter === "inactive" && !supplier.isActive)

        const matchesPayment = paymentFilter === "all" ||
            supplier.paymentTerms === paymentFilter

        return matchesSearch && matchesStatus && matchesPayment
    }), [suppliers, searchQuery, statusFilter, paymentFilter])

    const handleCreateSupplier = () => {
        console.log("Creando proveedor:", newSupplier)
        // Aquí iría la lógica para guardar en el backend
    }

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
                        <Button variant="outline" className="gap-2">
                            <Download className="h-4 w-4" />
                            Exportar
                        </Button>
                        <Button variant="outline" className="gap-2">
                            <Upload className="h-4 w-4" />
                            Importar
                        </Button>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Nuevo Proveedor
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Registrar Nuevo Proveedor</DialogTitle>
                                    <DialogDescription>
                                        Complete la información del proveedor de suministros médicos
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-6">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="supplier-code">Código *</Label>
                                            <Input
                                                id="supplier-code"
                                                placeholder="Ej: DISA-GT, FARMEX"
                                                value={newSupplier.code}
                                                onChange={(e) => setNewSupplier({ ...newSupplier, code: e.target.value.toUpperCase() })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="supplier-name">Nombre Empresa *</Label>
                                            <Input
                                                id="supplier-name"
                                                placeholder="Nombre completo de la empresa"
                                                value={newSupplier.name}
                                                onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="supplier-contact">Contacto Principal</Label>
                                            <Input
                                                id="supplier-contact"
                                                placeholder="Nombre del contacto"
                                                value={newSupplier.contactName}
                                                onChange={(e) => setNewSupplier({ ...newSupplier, contactName: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="supplier-tax">NIT / Identificación Tributaria</Label>
                                            <Input
                                                id="supplier-tax"
                                                placeholder="NIT-1234567-8"
                                                value={newSupplier.taxId}
                                                onChange={(e) => setNewSupplier({ ...newSupplier, taxId: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="supplier-phone">Teléfono</Label>
                                            <Input
                                                id="supplier-phone"
                                                placeholder="2255-0000"
                                                value={newSupplier.phone}
                                                onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="supplier-email">Email</Label>
                                            <Input
                                                id="supplier-email"
                                                type="email"
                                                placeholder="contacto@empresa.com"
                                                value={newSupplier.email}
                                                onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="supplier-address">Dirección</Label>
                                        <Input
                                            id="supplier-address"
                                            placeholder="Dirección completa"
                                            value={newSupplier.address}
                                            onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="supplier-city">Ciudad</Label>
                                            <Input
                                                id="supplier-city"
                                                value={newSupplier.city}
                                                onChange={(e) => setNewSupplier({ ...newSupplier, city: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="supplier-state">Departamento</Label>
                                            <Input
                                                id="supplier-state"
                                                value={newSupplier.state}
                                                onChange={(e) => setNewSupplier({ ...newSupplier, state: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="supplier-payment">Términos de Pago</Label>
                                            <Select
                                                value={newSupplier.paymentTerms}
                                                onValueChange={(v) => setNewSupplier({ ...newSupplier, paymentTerms: v })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="immediate">Contado</SelectItem>
                                                    <SelectItem value="net_15">Neto 15 días</SelectItem>
                                                    <SelectItem value="net_30">Neto 30 días</SelectItem>
                                                    <SelectItem value="net_60">Neto 60 días</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="supplier-credit">Límite de Crédito (Q)</Label>
                                        <Input
                                            id="supplier-credit"
                                            type="number"
                                            placeholder="50000"
                                            value={newSupplier.creditLimit}
                                            onChange={(e) => setNewSupplier({ ...newSupplier, creditLimit: Number(e.target.value) })}
                                        />
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="supplier-active"
                                            checked={newSupplier.isActive}
                                            onCheckedChange={(checked) => setNewSupplier({ ...newSupplier, isActive: checked })}
                                        />
                                        <Label htmlFor="supplier-active">Proveedor activo</Label>
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button variant="outline">Cancelar</Button>
                                    <Button onClick={handleCreateSupplier}>Guardar Proveedor</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Loading State */}
                {isLoadingSuppliers && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="ml-3 text-muted-foreground">Cargando proveedores...</span>
                    </div>
                )}

                {/* Error State */}
                {suppliersError && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error al cargar proveedores</AlertTitle>
                        <AlertDescription>{suppliersError.message}</AlertDescription>
                    </Alert>
                )}

                {/* Estadísticas rápidas */}
                {!isLoadingSuppliers && !suppliersError && (
                <div className="grid gap-6 md:grid-cols-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Proveedores</p>
                                    <p className="text-2xl font-bold">{suppliers.length}</p>
                                </div>
                                <Truck className="h-8 w-8 text-blue-500/60" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Activos</p>
                                    <p className="text-2xl font-bold">{suppliers.filter(s => s.isActive).length}</p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-500/60" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Límite Total</p>
                                    <p className="text-2xl font-bold">
                                        {formatCurrency(suppliers.reduce((acc, s) => acc + s.creditLimit, 0))}
                                    </p>
                                </div>
                                <CreditCard className="h-8 w-8 text-purple-500/60" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Pago 30+ días</p>
                                    <p className="text-2xl font-bold">
                                        {suppliers.filter(s => s.paymentTerms.includes('30') || s.paymentTerms.includes('60')).length}
                                    </p>
                                </div>
                                <Calendar className="h-8 w-8 text-amber-500/60" />
                            </div>
                        </CardContent>
                    </Card>
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
                                        <SelectItem value="net_15">Neto 15 días</SelectItem>
                                        <SelectItem value="net_30">Neto 30 días</SelectItem>
                                        <SelectItem value="net_60">Neto 60 días</SelectItem>
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
                                <h3 className="font-semibold text-lg mb-2">No se encontraron proveedores</h3>
                                <p className="text-muted-foreground mb-4">
                                    {searchQuery
                                        ? `No hay resultados para "${searchQuery}"`
                                        : "No hay proveedores registrados"}
                                </p>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button className="gap-2">
                                            <Plus className="h-4 w-4" />
                                            Registrar Primer Proveedor
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl">
                                        <DialogHeader>
                                            <DialogTitle>Registrar Nuevo Proveedor</DialogTitle>
                                        </DialogHeader>
                                        {/* Formulario de nuevo proveedor */}
                                    </DialogContent>
                                </Dialog>
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
                                            <TableHead className="w-[100px] text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredSuppliers.map((supplier) => (
                                            <TableRow key={supplier.id} className="hover:bg-muted/50">
                                                <TableCell>
                                                    <div className="font-mono font-semibold">{supplier.code}</div>
                                                    <div className="text-xs text-muted-foreground truncate" title={supplier.taxId}>
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
                                                        <div className="font-medium">{supplier.contactName || "—"}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {supplier.city}, {supplier.state}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        <div className="flex items-center gap-1">
                                                            <MapPin className="h-3 w-3" />
                                                            <span className="truncate" title={supplier.address}>
                                                                {supplier.address}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <Badge variant="outline" className="text-xs">
                                                            {formatPaymentTerms(supplier.paymentTerms)}
                                                        </Badge>
                                                        <div className="text-sm">
                                                            <span className="font-medium">Límite:</span> {formatCurrency(supplier.creditLimit)}
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
                                                        <Badge variant="outline" className="text-gray-600 border-gray-300">
                                                            <XCircle className="h-3 w-3 mr-1" />
                                                            Inactivo
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <Edit className="h-4 w-4" />
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
                        <CardTitle className="text-base">Tipos de Proveedores Médicos</CardTitle>
                        <CardDescription>Proveedores comunes en el sector salud</CardDescription>
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
                                    <p className="text-sm text-muted-foreground">Material desechable</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 rounded-lg border">
                                <div className="p-2 rounded-lg bg-purple-100">
                                    <Truck className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="font-medium">Equipos</p>
                                    <p className="text-sm text-muted-foreground">Equipos médicos</p>
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
        </DashboardLayout>
    )
}