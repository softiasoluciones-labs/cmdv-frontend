"use client"

import { useState, useEffect, useMemo } from "react"
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
import { Search, Plus, Edit, Trash2, Shield, Users, Eye, EyeOff, Copy, Save, X, Check, MoreVertical, RefreshCw, Loader2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Permission, ApiRole } from "@/lib/api/types/core-types/user.types"
import { useRoles } from "@/hooks/use-roles"
import { roleService } from "@/lib/api"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Mapeo de recursos a nombres de módulos
const resourceToModule: Record<string, string> = {
    "users": "Usuarios",
    "patients": "Pacientes",
    "appointments": "Citas",
    "medical_records": "Historias Clínicas",
    "billing": "Facturación",
    "inventory": "Inventario",
    "reports": "Reportes",
    "settings": "Configuración",
    "laboratory": "Laboratorio",
    "imaging": "Imágenes",
    "roles": "Roles",
    "warehouses": "Bodegas",
    "case_files": "Expedientes",
    "audit": "Auditoría",
    "invoices": "Facturas",
    "suppliers": "Proveedores",
    "products": "Productos",
    "system": "Configuración del Sistema",
    "pharmacy": "Farmacia",
    "lab_tests": "Examenes de Laboratorio",
    "rooms": "Habitaciones",
    "operations": "Quirófanos",
    "surgeries": "Cirugías",
    "consultations": "Consultas",
    "doctors": "Doctores",
    "nurses": "Enfermeras",
    "pharmacists": "Farmacéuticos",
    "receptionists": "Recepcionistas",
    "lab_technicians": "Técnicos de Laboratorio",
    "billing_staff": "Personal de Facturación",
    "warehouse_managers": "Gerentes de Bodega",
}

// Mapeo de acciones a nombres legibles
const actionToType: Record<string, { label: string; color: string }> = {
    "create": { label: "Crear", color: "bg-green-100 text-green-800" },
    "read": { label: "Leer", color: "bg-blue-100 text-blue-800" },
    "update": { label: "Actualizar", color: "bg-yellow-100 text-yellow-800" },
    "delete": { label: "Eliminar", color: "bg-red-100 text-red-800" },
    "approve": { label: "Aprobar", color: "bg-purple-100 text-purple-800" },
    "export": { label: "Exportar", color: "bg-indigo-100 text-indigo-800" },
    "import": { label: "Importar", color: "bg-orange-100 text-orange-800" },
}

// Componente para mostrar los permisos en un popover
const PopoverPermissionCell = ({ permissions }: { permissions: Permission[] }) => {
    const grouped = groupPermissionsByResource(permissions)
    const totalModules = Object.keys(grouped).length
    const totalActions = permissions.length

    if (permissions.length === 0) {
        return <span className="text-xs text-muted-foreground">Sin permisos</span>
    }

    // Crear texto resumen
    const getSummaryText = () => {
        const firstModules = Object.keys(grouped).slice(0, 2)
        const summaries = firstModules.map(module => {
            const actions = grouped[module].map(p => actionToType[p.action]?.label || p.action).join(',')
            return `${resourceToModule[module] || module}(${actions})`
        })
        const summary = summaries.join(', ')
        return totalModules > 2 ? `${summary} +${totalModules - 2} más` : summary
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    {totalModules} módulos • {totalActions}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3" align="start">
                <div className="space-y-2">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Permisos asignados
                    </h4>
                    <div className="max-h-64 overflow-y-auto">
                        {Object.entries(grouped).map(([resource, perms]) => (
                            <div key={resource} className="mb-3 last:mb-0">
                                <div className="text-xs font-medium text-muted-foreground mb-1">
                                    {resourceToModule[resource] || resource}:
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {perms.map(perm => {
                                        const actionInfo = actionToType[perm.action]
                                        return actionInfo ? (
                                            <Badge key={perm.id} variant="secondary" className={`text-xs ${actionInfo.color}`}>
                                                {actionInfo.label}
                                            </Badge>
                                        ) : (
                                            <Badge key={perm.id} variant="outline" className="text-xs">
                                                {perm.action}
                                            </Badge>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="text-xs text-muted-foreground pt-2 border-t">
                        Total: {totalActions} permisos en {totalModules} módulos
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}

// Obtener módulos únicos de los permisos
const getUniqueModules = (roles: ApiRole[]): string[] => {
    const modules = new Set<string>()
    roles.forEach(role => {
        role.permissions.forEach(permission => {
            if (resourceToModule[permission.resource]) {
                modules.add(permission.resource)
            }
        })
    })
    return Array.from(modules).sort()
}

// Agrupar permisos por recurso
const groupPermissionsByResource = (permissions: Permission[]): Record<string, Permission[]> => {
    const grouped: Record<string, Permission[]> = {}
    permissions.forEach(permission => {
        if (!grouped[permission.resource]) {
            grouped[permission.resource] = []
        }
        grouped[permission.resource].push(permission)
    })
    return grouped
}

export default function RolesPage() {
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [selectedRole, setSelectedRole] = useState<ApiRole | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isCloneDialogOpen, setIsCloneDialogOpen] = useState(false)
    const { roles, stats, isLoading: loading, refetch: fetchRoles, deleteRole } = useRoles()

    const [roleForm, setRoleForm] = useState({
        name: "",
        displayName: "",
        description: "",
        status: "active" as "active" | "inactive",
        permissions: {} as Record<string, string[]>,
    })
    const [activeTab, setActiveTab] = useState("list")

    // fetchRoles is handled by useRoles

    // Filtrar roles
    const filteredRoles = useMemo(() => {
        return roles.filter(role => {
            const matchesSearch =
                role.displayName.toLowerCase().includes(search.toLowerCase()) ||
                role.name.toLowerCase().includes(search.toLowerCase()) ||
                (role.description && role.description.toLowerCase().includes(search.toLowerCase()))

            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "active" && role.status === "active") ||
                (statusFilter === "inactive" && role.status === "inactive")

            return matchesSearch && matchesStatus
        })
    }, [roles, search, statusFilter])

    // Obtener módulos únicos
    const modules = useMemo(() => getUniqueModules(roles), [roles])

    // Handlers
    const handleEditRole = (role: ApiRole) => {
        setSelectedRole(role)

        // Convertir permisos a formato del formulario
        const permissionsForm: Record<string, string[]> = {}
        role.permissions.forEach(permission => {
            if (!permissionsForm[permission.resource]) {
                permissionsForm[permission.resource] = []
            }
            if (!permissionsForm[permission.resource].includes(permission.action)) {
                permissionsForm[permission.resource].push(permission.action)
            }
        })

        setRoleForm({
            name: role.name,
            displayName: role.displayName,
            description: role.description || "",
            status: role.status,
            permissions: permissionsForm,
        })
        setIsDialogOpen(true)
    }

    const handleCloneRole = (role: ApiRole) => {
        setSelectedRole(role)

        const permissionsForm: Record<string, string[]> = {}
        role.permissions.forEach(permission => {
            if (!permissionsForm[permission.resource]) {
                permissionsForm[permission.resource] = []
            }
            if (!permissionsForm[permission.resource].includes(permission.action)) {
                permissionsForm[permission.resource].push(permission.action)
            }
        })

        setRoleForm({
            name: `${role.name}_copy`,
            displayName: `${role.displayName} (Copia)`,
            description: role.description || "",
            status: "active",
            permissions: permissionsForm,
        })
        setIsCloneDialogOpen(true)
    }

    const handleDeleteRole = (role: ApiRole) => {
        setSelectedRole(role)
        setIsDeleteDialogOpen(true)
    }

    const handleSaveRole = async () => {
        try {
            // Convertir permisos a array de objetos para el API
            const permissionsArray: { resource: string; action: string }[] = []
            Object.entries(roleForm.permissions).forEach(([resource, actions]) => {
                actions.forEach(action => {
                    permissionsArray.push({ resource, action })
                })
            })

            const payload = {
                name: roleForm.name,
                displayName: roleForm.displayName,
                description: roleForm.description,
                permissions: permissionsArray,
                status: roleForm.status,
            }

            if (selectedRole) {
                await roleService.updateRole(selectedRole.id, payload as any)
            } else {
                await roleService.createRole(payload as any)
            }

            toast.success(selectedRole ? "Rol actualizado correctamente" : "Rol creado correctamente")
            setIsDialogOpen(false)
            setIsCloneDialogOpen(false)
            setSelectedRole(null)
            setRoleForm({
                name: "",
                displayName: "",
                description: "",
                status: "active",
                permissions: {},
            })
            fetchRoles() // Recargar lista
        } catch (error: any) {
            console.error("Error saving role:", error)
            toast.error(error.message || "Error al guardar el rol")
        }
    }

    const handleConfirmDelete = async () => {
        if (!selectedRole) return

        const success = await deleteRole(selectedRole.id)

        if (success) {
            toast.success("Rol eliminado correctamente")
            setIsDeleteDialogOpen(false)
            setSelectedRole(null)
            fetchRoles()
        }
    }

    const handlePermissionChange = (resource: string, action: string, checked: boolean) => {
        setRoleForm(prev => {
            const currentActions = prev.permissions[resource] || []
            let newActions = [...currentActions]

            if (checked) {
                if (!newActions.includes(action)) {
                    newActions.push(action)
                }
            } else {
                newActions = newActions.filter(a => a !== action)
            }

            return {
                ...prev,
                permissions: {
                    ...prev.permissions,
                    [resource]: newActions,
                },
            }
        })
    }

    const handleSelectAllPermissions = (resource: string, selectAll: boolean) => {
        setRoleForm(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [resource]: selectAll ? Object.keys(actionToType) : [],
            },
        }))
    }

    // Render badge de permisos
    const renderPermissionBadges = (permissions: Permission[]) => {
        const grouped = groupPermissionsByResource(permissions)

        return Object.entries(grouped).map(([resource, perms]) => (
            <div key={resource} className="mb-2 last:mb-0">
                <div className="text-xs font-medium text-muted-foreground mb-1">
                    {resourceToModule[resource] || resource}:
                </div>
                <div className="flex flex-wrap gap-1">
                    {perms.map(perm => {
                        const actionInfo = actionToType[perm.action]
                        return actionInfo ? (
                            <Badge key={perm.id} variant="secondary" className={`text-xs ${actionInfo.color}`}>
                                {actionInfo.label}
                            </Badge>
                        ) : (
                            <Badge key={perm.id} variant="outline" className="text-xs">
                                {perm.action}
                            </Badge>
                        )
                    })}
                </div>
            </div>
        ))
    }

    if (loading) {
        return (
            <DashboardLayout>
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-4 w-64 mt-2" />
                        </div>
                        <Skeleton className="h-10 w-32" />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-4">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="h-24 w-full" />
                        ))}
                    </div>
                    <Skeleton className="h-[400px] w-full" />
                </div>
            </DashboardLayout>
        )
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
                        <Button variant="outline" onClick={fetchRoles}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Actualizar
                        </Button>
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
                                        displayName: "",
                                        description: "",
                                        status: "active",
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
                                                    <Label htmlFor="name">Nombre del Rol (identificador) *</Label>
                                                    <Input
                                                        id="name"
                                                        placeholder="Ej: medical_doctor"
                                                        value={roleForm.name}
                                                        onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                                                    />
                                                    <p className="text-xs text-muted-foreground">
                                                        Identificador único del rol (snake_case)
                                                    </p>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="displayName">Nombre Mostrado *</Label>
                                                    <Input
                                                        id="displayName"
                                                        placeholder="Ej: Médico Especialista"
                                                        value={roleForm.displayName}
                                                        onChange={(e) => setRoleForm({ ...roleForm, displayName: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="status">Estado</Label>
                                                    <div className="flex items-center space-x-2">
                                                        <Switch
                                                            id="status"
                                                            checked={roleForm.status === "active"}
                                                            onCheckedChange={(checked) =>
                                                                setRoleForm({ ...roleForm, status: checked ? "active" : "inactive" })
                                                            }
                                                        />
                                                        <Label htmlFor="status">
                                                            {roleForm.status === "active" ? "Activo" : "Inactivo"}
                                                        </Label>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="description">Descripción</Label>
                                                <textarea
                                                    id="description"
                                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    rows={3}
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
                                                {modules.map(resource => (
                                                    <Card key={resource}>
                                                        <CardHeader className="py-3">
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <CardTitle className="text-base">
                                                                        {resourceToModule[resource] || resource}
                                                                    </CardTitle>
                                                                    <CardDescription className="text-xs">
                                                                        Permisos para {resourceToModule[resource]?.toLowerCase() || resource}
                                                                    </CardDescription>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleSelectAllPermissions(resource, true)}
                                                                    >
                                                                        <Check className="h-3 w-3 mr-1" />
                                                                        Todos
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleSelectAllPermissions(resource, false)}
                                                                    >
                                                                        <X className="h-3 w-3 mr-1" />
                                                                        Ninguno
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </CardHeader>
                                                        <CardContent className="py-3">
                                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                                {Object.entries(actionToType).map(([action, { label }]) => {
                                                                    const currentActions = roleForm.permissions[resource] || []
                                                                    const isChecked = currentActions.includes(action)
                                                                    return (
                                                                        <div key={action} className="flex items-center space-x-2">
                                                                            <Checkbox
                                                                                id={`${resource}-${action}`}
                                                                                checked={isChecked}
                                                                                onCheckedChange={(checked) =>
                                                                                    handlePermissionChange(resource, action, checked as boolean)
                                                                                }
                                                                            />
                                                                            <Label
                                                                                htmlFor={`${resource}-${action}`}
                                                                                className="text-sm cursor-pointer"
                                                                            >
                                                                                {label}
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
                                <p className="text-2xl font-bold">{stats.assignedUsers}</p>
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
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2">
                                                            <Shield className="h-4 w-4 text-muted-foreground" />
                                                            <span>{role.displayName}</span>
                                                        </div>
                                                        <code className="text-xs text-muted-foreground mt-1">
                                                            {role.name}
                                                        </code>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="max-w-xs">
                                                    <span className="text-sm text-muted-foreground line-clamp-2">
                                                        {role.description || "Sin descripción"}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <PopoverPermissionCell permissions={role.permissions} />
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="gap-1">
                                                        <Users className="h-3 w-3" />
                                                        {role.usersCount}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={role.status === "active" ? "default" : "secondary"}>
                                                        {role.status === "active" ? "Activo" : "Inactivo"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm text-muted-foreground">
                                                        {role.createdAt
                                                            ? new Date(role.createdAt).toLocaleDateString('es-GT')
                                                            : "N/A"}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleEditRole(role)}
                                                            title="Editar"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleCloneRole(role)}
                                                            title="Clonar"
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
                                                {roles.map(role => (
                                                    <TableHead key={role.id} className="text-center min-w-[100px]">
                                                        <div className="flex flex-col items-center">
                                                            <span className="font-medium">{role.displayName}</span>
                                                            <Badge variant="outline" className="mt-1 text-xs px-2 py-0.5">
                                                                {role.usersCount} usuarios
                                                            </Badge>
                                                        </div>
                                                    </TableHead>
                                                ))}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {modules.map(resource => {
                                                const moduleName = resourceToModule[resource] || resource
                                                return (
                                                    <TableRow key={resource}>
                                                        <TableCell className="font-medium align-top">
                                                            <div>
                                                                <p>{moduleName}</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {resource}
                                                                </p>
                                                            </div>
                                                        </TableCell>
                                                        {roles.map(role => {
                                                            const rolePermissions = role.permissions.filter(p => p.resource === resource)
                                                            return (
                                                                <TableCell key={role.id} className="text-center align-top">
                                                                    <div className="flex flex-wrap justify-center gap-1">
                                                                        {rolePermissions.map(perm => {
                                                                            const actionInfo = actionToType[perm.action]
                                                                            return actionInfo ? (
                                                                                <Badge
                                                                                    key={perm.id}
                                                                                    variant="secondary"
                                                                                    className={`text-xs ${actionInfo.color}`}
                                                                                >
                                                                                    {actionInfo.label.charAt(0)}
                                                                                </Badge>
                                                                            ) : (
                                                                                <Badge
                                                                                    key={perm.id}
                                                                                    variant="outline"
                                                                                    className="text-xs"
                                                                                >
                                                                                    {perm.action.charAt(0).toUpperCase()}
                                                                                </Badge>
                                                                            )
                                                                        })}
                                                                        {rolePermissions.length === 0 && (
                                                                            <span className="text-xs text-muted-foreground">—</span>
                                                                        )}
                                                                    </div>
                                                                </TableCell>
                                                            )
                                                        })}
                                                    </TableRow>
                                                )
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                            <CardFooter className="flex-col items-start gap-2 border-t px-6 py-4">
                                <div className="flex items-center gap-4 flex-wrap">
                                    {Object.entries(actionToType).map(([action, { label, color }]) => (
                                        <div key={action} className="flex items-center gap-2">
                                            <div className={`h-3 w-3 rounded-full ${color.replace('text-', 'bg-')}`}></div>
                                            <span className="text-xs">{label} ({action.charAt(0).toUpperCase()})</span>
                                        </div>
                                    ))}
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
                                    ¿Estás seguro de que deseas eliminar el rol "{selectedRole?.displayName}"?
                                    Esta acción no se puede deshacer y afectará a {selectedRole?.usersCount} usuarios.
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
                            <Button variant="destructive" onClick={handleConfirmDelete}>
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
                                <Label htmlFor="clone-name">Nombre del Rol (identificador)</Label>
                                <Input
                                    id="clone-name"
                                    value={roleForm.name}
                                    onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                                    placeholder="Ej: medical_doctor_copy"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="clone-displayName">Nombre Mostrado</Label>
                                <Input
                                    id="clone-displayName"
                                    value={roleForm.displayName}
                                    onChange={(e) => setRoleForm({ ...roleForm, displayName: e.target.value })}
                                    placeholder="Nombre para el nuevo rol"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="clone-description">Descripción (opcional)</Label>
                                <textarea
                                    id="clone-description"
                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    rows={2}
                                    value={roleForm.description}
                                    onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                                    placeholder="Descripción del nuevo rol"
                                />
                            </div>
                            <Alert>
                                <AlertDescription className="text-sm">
                                    Se copiarán todos los permisos del rol "{selectedRole?.displayName}"
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