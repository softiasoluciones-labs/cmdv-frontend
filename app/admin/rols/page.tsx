"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, Edit, Trash2, Shield, Users, Eye, EyeOff, Copy, Save, X, Check, MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"

// Datos de ejemplo para roles
const mockRoles = [
    {
        id: "1",
        name: "Administrador",
        description: "Acceso completo a todas las funcionalidades del sistema",
        userCount: 3,
        isActive: true,
        permissions: {
            users: ["read", "write", "delete"],
            patients: ["read", "write", "delete"],
            appointments: ["read", "write", "delete"],
            billing: ["read", "write", "delete"],
            inventory: ["read", "write", "delete"],
            reports: ["read", "write", "delete"],
            settings: ["read", "write", "delete"],
        },
        createdAt: "2024-01-15",
    },
    {
        id: "2",
        name: "Médico",
        description: "Puede gestionar pacientes, citas y ver historiales médicos",
        userCount: 12,
        isActive: true,
        permissions: {
            users: ["read"],
            patients: ["read", "write"],
            appointments: ["read", "write"],
            billing: [],
            inventory: ["read"],
            reports: ["read"],
            settings: [],
        },
        createdAt: "2024-01-16",
    },
    {
        id: "3",
        name: "Enfermero/a",
        description: "Gestiona signos vitales, medicamentos y apoyo en consultas",
        userCount: 8,
        isActive: true,
        permissions: {
            users: [],
            patients: ["read", "write"],
            appointments: ["read"],
            billing: [],
            inventory: ["read"],
            reports: ["read"],
            settings: [],
        },
        createdAt: "2024-01-17",
    },
    {
        id: "4",
        name: "Recepción",
        description: "Gestiona citas, registra pacientes y facturación básica",
        userCount: 5,
        isActive: true,
        permissions: {
            users: [],
            patients: ["read", "write"],
            appointments: ["read", "write"],
            billing: ["read", "write"],
            inventory: ["read"],
            reports: ["read"],
            settings: [],
        },
        createdAt: "2024-01-18",
    },
    {
        id: "5",
        name: "Farmacia",
        description: "Gestiona inventario de medicamentos y dispensación",
        userCount: 4,
        isActive: true,
        permissions: {
            users: [],
            patients: ["read"],
            appointments: ["read"],
            billing: ["read"],
            inventory: ["read", "write", "delete"],
            reports: ["read", "write"],
            settings: [],
        },
        createdAt: "2024-01-19",
    },
    {
        id: "6",
        name: "Facturación",
        description: "Gestión completa de facturación y reportes financieros",
        userCount: 2,
        isActive: false,
        permissions: {
            users: [],
            patients: ["read"],
            appointments: ["read"],
            billing: ["read", "write", "delete"],
            inventory: ["read"],
            reports: ["read", "write"],
            settings: [],
        },
        createdAt: "2024-01-20",
    },
]

// Permisos disponibles
const permissionModules = [
    { id: "users", label: "Usuarios", description: "Gestión de usuarios del sistema" },
    { id: "patients", label: "Pacientes", description: "Registro y gestión de pacientes" },
    { id: "appointments", label: "Citas", description: "Agenda y gestión de citas" },
    { id: "medical_records", label: "Historias Clínicas", description: "Acceso a historias médicas" },
    { id: "billing", label: "Facturación", description: "Facturación y pagos" },
    { id: "inventory", label: "Inventario", description: "Gestión de medicamentos y suministros" },
    { id: "reports", label: "Reportes", description: "Generación de reportes" },
    { id: "settings", label: "Configuración", description: "Configuración del sistema" },
    { id: "laboratory", label: "Laboratorio", description: "Resultados de laboratorio" },
    { id: "imaging", label: "Imágenes", description: "Estudios de imagen" },
]

const permissionTypes = [
    { id: "read", label: "Lectura", color: "bg-blue-100 text-blue-800" },
    { id: "write", label: "Escritura", color: "bg-green-100 text-green-800" },
    { id: "delete", label: "Eliminar", color: "bg-red-100 text-red-800" },
    { id: "approve", label: "Aprobar", color: "bg-purple-100 text-purple-800" },
]

export default function RolesPage() {
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [selectedRole, setSelectedRole] = useState<any>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isCloneDialogOpen, setIsCloneDialogOpen] = useState(false)
    const [roleForm, setRoleForm] = useState({
        name: "",
        description: "",
        isActive: true,
        permissions: {},
    })
    const [activeTab, setActiveTab] = useState("list")

    // Filtrar roles
    const filteredRoles = mockRoles.filter(role => {
        const matchesSearch =
            role.name.toLowerCase().includes(search.toLowerCase()) ||
            role.description.toLowerCase().includes(search.toLowerCase())
        const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "active" && role.isActive) ||
            (statusFilter === "inactive" && !role.isActive)
        return matchesSearch && matchesStatus
    })

    // Estadísticas
    const stats = {
        totalRoles: mockRoles.length,
        activeRoles: mockRoles.filter(r => r.isActive).length,
        inactiveRoles: mockRoles.filter(r => !r.isActive).length,
        totalUsers: mockRoles.reduce((sum, role) => sum + role.userCount, 0),
    }

    // Handlers
    const handleEditRole = (role: any) => {
        setSelectedRole(role)
        setRoleForm({
            name: role.name,
            description: role.description,
            isActive: role.isActive,
            permissions: { ...role.permissions },
        })
        setIsDialogOpen(true)
    }

    const handleCloneRole = (role: any) => {
        setSelectedRole(role)
        setRoleForm({
            name: `${role.name} (Copia)`,
            description: role.description,
            isActive: true,
            permissions: { ...role.permissions },
        })
        setIsCloneDialogOpen(true)
    }

    const handleDeleteRole = (role: any) => {
        setSelectedRole(role)
        setIsDeleteDialogOpen(true)
    }

    const handleSaveRole = () => {
        console.log("Guardando rol:", roleForm)
        setIsDialogOpen(false)
        setIsCloneDialogOpen(false)
        setSelectedRole(null)
        setRoleForm({
            name: "",
            description: "",
            isActive: true,
            permissions: {},
        })
    }

    const handlePermissionChange = (module: string, permission: string, checked: boolean) => {
        setRoleForm(prev => {
            const modulePerms: string[] = prev.permissions[module as keyof typeof prev.permissions] || []
            let newPerms = [...modulePerms]

            if (checked) {
                if (!newPerms.includes(permission)) {
                    newPerms.push(permission)
                }
            } else {
                newPerms = newPerms.filter(p => p !== permission)
            }

            return {
                ...prev,
                permissions: {
                    ...prev.permissions,
                    [module]: newPerms,
                },
            }
        })
    }

    const handleSelectAllPermissions = (module: string, selectAll: boolean) => {
        setRoleForm(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [module]: selectAll ? permissionTypes.map(p => p.id) : [],
            },
        }))
    }

    // Render badge de permisos
    const renderPermissionBadges = (permissions: string[]) => {
        return permissionTypes
            .filter(pt => permissions.includes(pt.id))
            .map(pt => (
                <Badge key={pt.id} variant="secondary" className={`mr-1 ${pt.color}`}>
                    {pt.label}
                </Badge>
            ))
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Gestión de Roles</h1>
                        <p className="text-muted-foreground">
                            Define y administra los permisos de acceso para cada tipo de usuario
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setActiveTab(activeTab === "list" ? "permissions" : "list")}
                        >
                            {activeTab === "list" ? (
                                <>
                                    <Shield className="mr-2 h-4 w-4" />
                                    Ver Permisos
                                </>
                            ) : (
                                <>
                                    <Users className="mr-2 h-4 w-4" />
                                    Ver Lista
                                </>
                            )}
                        </Button>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={() => {
                                    setSelectedRole(null)
                                    setRoleForm({
                                        name: "",
                                        description: "",
                                        isActive: true,
                                        permissions: {},
                                    })
                                }}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Nuevo Rol
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh]">
                                <DialogHeader>
                                    <DialogTitle>
                                        {selectedRole ? "Editar Rol" : "Crear Nuevo Rol"}
                                    </DialogTitle>
                                </DialogHeader>
                                <ScrollArea className="h-[60vh] pr-4">
                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="name">Nombre del Rol *</Label>
                                                    <Input
                                                        id="name"
                                                        placeholder="Ej: Médico Especialista"
                                                        value={roleForm.name}
                                                        onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="status">Estado</Label>
                                                    <div className="flex items-center space-x-2">
                                                        <Switch
                                                            id="status"
                                                            checked={roleForm.isActive}
                                                            onCheckedChange={(checked) => setRoleForm({ ...roleForm, isActive: checked })}
                                                        />
                                                        <Label htmlFor="status">
                                                            {roleForm.isActive ? "Activo" : "Inactivo"}
                                                        </Label>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="description">Descripción</Label>
                                                <Input
                                                    id="description"
                                                    placeholder="Describe las responsabilidades y acceso de este rol..."
                                                    value={roleForm.description}
                                                    onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        {/* Permisos */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-lg font-semibold">Permisos</h3>
                                                <div className="text-sm text-muted-foreground">
                                                    Selecciona los permisos para este rol
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                {permissionModules.map(module => (
                                                    <Card key={module.id}>
                                                        <CardHeader className="py-3">
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <CardTitle className="text-base">{module.label}</CardTitle>
                                                                    <CardDescription className="text-xs">
                                                                        {module.description}
                                                                    </CardDescription>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleSelectAllPermissions(module.id, true)}
                                                                    >
                                                                        <Check className="h-3 w-3 mr-1" />
                                                                        Todos
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleSelectAllPermissions(module.id, false)}
                                                                    >
                                                                        <X className="h-3 w-3 mr-1" />
                                                                        Ninguno
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </CardHeader>
                                                        <CardContent className="py-3">
                                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                                {permissionTypes.map(perm => {
                                                                    const modulePerms: string[] = roleForm.permissions[module.id as keyof typeof roleForm.permissions] || []
                                                                    const isChecked = modulePerms.includes(perm.id)
                                                                    return (
                                                                        <div key={perm.id} className="flex items-center space-x-2">
                                                                            <Checkbox
                                                                                id={`${module.id}-${perm.id}`}
                                                                                checked={isChecked}
                                                                                onCheckedChange={(checked) =>
                                                                                    handlePermissionChange(module.id, perm.id, checked as boolean)
                                                                                }
                                                                            />
                                                                            <Label
                                                                                htmlFor={`${module.id}-${perm.id}`}
                                                                                className="text-sm cursor-pointer"
                                                                            >
                                                                                {perm.label}
                                                                            </Label>
                                                                        </div>
                                                                    )
                                                                })}
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </ScrollArea>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                        Cancelar
                                    </Button>
                                    <Button onClick={handleSaveRole}>
                                        <Save className="mr-2 h-4 w-4" />
                                        {selectedRole ? "Actualizar Rol" : "Crear Rol"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 sm:grid-cols-4">
                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                <Shield className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Roles</p>
                                <p className="text-2xl font-bold">{stats.totalRoles}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                                <Users className="h-6 w-6 text-success" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Roles Activos</p>
                                <p className="text-2xl font-bold text-success">{stats.activeRoles}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                <EyeOff className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Roles Inactivos</p>
                                <p className="text-2xl font-bold text-muted-foreground">{stats.inactiveRoles}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10">
                                <Users className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Usuarios Asignados</p>
                                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="list" className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Lista de Roles
                        </TabsTrigger>
                        <TabsTrigger value="permissions" className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Matriz de Permisos
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab: Lista de Roles */}
                    <TabsContent value="list" className="space-y-4">
                        {/* Filtros */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar roles por nombre o descripción..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="pl-9"
                                        />
                                    </div>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Filtrar por estado" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos los estados</SelectItem>
                                            <SelectItem value="active">Solo activos</SelectItem>
                                            <SelectItem value="inactive">Solo inactivos</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tabla de Roles */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Roles del Sistema</CardTitle>
                                <CardDescription>
                                    {filteredRoles.length} {filteredRoles.length === 1 ? 'rol encontrado' : 'roles encontrados'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nombre</TableHead>
                                            <TableHead>Descripción</TableHead>
                                            <TableHead>Permisos</TableHead>
                                            <TableHead>Usuarios</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead>Fecha Creación</TableHead>
                                            <TableHead className="text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredRoles.map((role) => (
                                            <TableRow key={role.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <Shield className="h-4 w-4 text-muted-foreground" />
                                                        {role.name}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="max-w-xs truncate">
                                                    <span className="text-sm text-muted-foreground">
                                                        {role.description}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1 max-w-xs">
                                                        {renderPermissionBadges(role.permissions.users || [])}
                                                        {role.permissions.users?.length === 0 && (
                                                            <span className="text-xs text-muted-foreground">Sin permisos</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="gap-1">
                                                        <Users className="h-3 w-3" />
                                                        {role.userCount}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={role.isActive ? "default" : "secondary"}>
                                                        {role.isActive ? "Activo" : "Inactivo"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm text-muted-foreground">
                                                        {new Date(role.createdAt).toLocaleDateString('es-GT')}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleEditRole(role)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleCloneRole(role)}
                                                        >
                                                            <Copy className="h-4 w-4" />
                                                        </Button>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon">
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                                <DropdownMenuItem onClick={() => handleEditRole(role)}>
                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                    Editar
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleCloneRole(role)}>
                                                                    <Copy className="mr-2 h-4 w-4" />
                                                                    Clonar
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    className="text-destructive"
                                                                    onClick={() => handleDeleteRole(role)}
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Eliminar
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab: Matriz de Permisos */}
                    <TabsContent value="permissions">
                        <Card>
                            <CardHeader>
                                <CardTitle>Matriz de Permisos</CardTitle>
                                <CardDescription>
                                    Visualiza todos los permisos por rol en una sola vista
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[200px]">Módulo</TableHead>
                                                {mockRoles.map(role => (
                                                    <TableHead key={role.id} className="text-center">
                                                        <div className="flex flex-col items-center">
                                                            <span className="font-medium">{role.name}</span>
                                                            <Badge variant="outline" className="mt-1 text-xs px-2 py-0.5">
                                                                {role.userCount} users
                                                            </Badge>
                                                        </div>
                                                    </TableHead>
                                                ))}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {permissionModules.map(module => (
                                                <TableRow key={module.id}>
                                                    <TableCell className="font-medium">
                                                        <div>
                                                            <p>{module.label}</p>
                                                            <p className="text-xs text-muted-foreground">{module.description}</p>
                                                        </div>
                                                    </TableCell>
                                                    {mockRoles.map(role => (
                                                        <TableCell key={role.id} className="text-center">
                                                            <div className="flex justify-center gap-1">
                                                                {permissionTypes.map(perm => {
                                                                    const hasPermission = role.permissions[module.id as keyof typeof role.permissions]?.includes(perm.id)
                                                                    return hasPermission ? (
                                                                        <Badge
                                                                            key={perm.id}
                                                                            variant="secondary"
                                                                            className={`text-xs ${perm.color}`}
                                                                        >
                                                                            {perm.label.charAt(0)}
                                                                        </Badge>
                                                                    ) : null
                                                                })}
                                                                {!role.permissions[module.id as keyof typeof role.permissions]?.length && (
                                                                    <span className="text-xs text-muted-foreground">—</span>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                            <CardFooter className="flex-col items-start gap-2 border-t px-6 py-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-blue-100"></div>
                                        <span className="text-xs">Lectura (R)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-green-100"></div>
                                        <span className="text-xs">Escritura (W)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-red-100"></div>
                                        <span className="text-xs">Eliminar (D)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-purple-100"></div>
                                        <span className="text-xs">Aprobar (A)</span>
                                    </div>
                                </div>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Dialog para Eliminar Rol */}
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Eliminar Rol</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            <Alert variant="destructive">
                                <AlertDescription>
                                    ¿Estás seguro de que deseas eliminar el rol "{selectedRole?.name}"?
                                    Esta acción no se puede deshacer y afectará a {selectedRole?.userCount} usuarios.
                                </AlertDescription>
                            </Alert>
                            <p className="mt-4 text-sm text-muted-foreground">
                                Los usuarios con este rol perderán sus permisos y deberán ser reasignados.
                            </p>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                                Cancelar
                            </Button>
                            <Button variant="destructive" onClick={() => {
                                console.log("Eliminando rol:", selectedRole)
                                setIsDeleteDialogOpen(false)
                            }}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar Rol
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Dialog para Clonar Rol */}
                <Dialog open={isCloneDialogOpen} onOpenChange={setIsCloneDialogOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Clonar Rol</DialogTitle>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="clone-name">Nombre del Nuevo Rol</Label>
                                <Input
                                    id="clone-name"
                                    value={roleForm.name}
                                    onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                                    placeholder="Ingresa un nombre para el nuevo rol"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="clone-description">Descripción (opcional)</Label>
                                <Input
                                    id="clone-description"
                                    value={roleForm.description}
                                    onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                                    placeholder="Descripción del nuevo rol"
                                />
                            </div>
                            <Alert>
                                <AlertDescription className="text-sm">
                                    Se copiarán todos los permisos del rol "{selectedRole?.name}"
                                </AlertDescription>
                            </Alert>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCloneDialogOpen(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={handleSaveRole}>
                                <Copy className="mr-2 h-4 w-4" />
                                Clonar Rol
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    )
}