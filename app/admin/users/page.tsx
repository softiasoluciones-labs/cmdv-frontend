"use client"

import { useState, useMemo, useCallback } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Plus, Users, Shield, UserCheck, UserX, Edit, Trash2, Lock, Unlock, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { UserForm } from "@/components/admin/user-form"
import { useUsers } from "@/hooks/core-hooks/use-users"
import { ApiUser, UserRole, UsersQueryParams } from "@/lib/api"
import { Alert, AlertDescription } from "@/components/ui/alert"

const roleConfig: Record<string, { label: string; className: string }> = {
  admin: { label: "Administrador", className: "bg-destructive/10 text-destructive" },
  super_admin: { label: "Super Admin", className: "bg-destructive/10 text-destructive" },
  doctor: { label: "Médico", className: "bg-primary/10 text-primary" },
  nurse: { label: "Enfermero/a", className: "bg-success/10 text-success" },
  receptionist: { label: "Recepción", className: "bg-chart-1/10 text-chart-1" },
  pharmacist: { label: "Farmacia", className: "bg-warning/10 text-warning" },
  billing: { label: "Facturación", className: "bg-chart-2/10 text-chart-2" },
  billing_staff: { label: "Facturación", className: "bg-chart-2/10 text-chart-2" },
  lab_technician: { label: "Laboratorio", className: "bg-chart-3/10 text-chart-3" },
  warehouse_manager: { label: "Almacén", className: "bg-chart-4/10 text-chart-4" },
}

const getConfig = (role: string) => roleConfig[role] || { label: role, className: "bg-muted text-muted-foreground" }

export default function UsersPage() {
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [isDeactivating, setIsDeactivating] = useState<string | null>(null)

  const { users, stats, isLoading, error, fetchUsers, refetch, blockUser, unblockUser, deactivateUser } = useUsers()

  // Helper to check if a user is currently locked
  const isUserLocked = useCallback((user: ApiUser) => {
    if (!user.locked_until) return false
    return new Date(user.locked_until) > new Date()
  }, [])

  // Handle filter changes
  const handleFiltersChange = useCallback(() => {
    const params: UsersQueryParams = {
      search: search || undefined,
      role: roleFilter as UserRole | "all",
      status: statusFilter as "active" | "inactive" | "all",
    }
    fetchUsers(params)
  }, [search, roleFilter, statusFilter, fetchUsers])

  // Filter users locally for instant feedback (debounced API call can be added)
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.full_name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.username.toLowerCase().includes(search.toLowerCase())
      const matchesRole = roleFilter === "all" || user.role === roleFilter
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && user.is_active) ||
        (statusFilter === "inactive" && !user.is_active)
      return matchesSearch && matchesRole && matchesStatus
    })
  }, [users, search, roleFilter, statusFilter])

  // Handle block/unblock toggle
  const handleToggleBlock = async (user: ApiUser) => {
    const locked = isUserLocked(user)
    if (locked) {
      if (!confirm(`¿Estás seguro de que deseas desbloquear al usuario ${user.full_name}?`)) return
      await unblockUser(user.id)
    } else {
      if (!confirm(`¿Estás seguro de que deseas bloquear al usuario ${user.full_name}?`)) return
      await blockUser(user.id)
    }
  }

  // Handle deactivate user
  const handleDeactivateUser = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas desactivar este usuario?")) return

    setIsDeactivating(id)
    await deactivateUser(id)
    setIsDeactivating(null)
  }

  // Handle form close
  const handleFormClose = () => {
    setShowForm(false)
    setSelectedUser(null)
    refetch()
  }

  // Get initials from full name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
  }

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("es-GT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    } catch {
      return "N/A"
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Usuarios</h1>
            <p className="text-muted-foreground">Gestión de usuarios del sistema</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={refetch} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogTrigger asChild>
                <Button className="gap-2" onClick={() => setSelectedUser(null)}>
                  <Plus className="h-4 w-4" />
                  Nuevo Usuario
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{selectedUser ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle>
                </DialogHeader>
                <UserForm
                  user={selectedUser}
                  onClose={handleFormClose}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Usuarios</p>
                <p className="text-2xl font-bold">{isLoading ? "-" : stats.totalUsers}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                <UserCheck className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Activos</p>
                <p className="text-2xl font-bold text-success">{isLoading ? "-" : stats.activeUsers}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <UserX className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Inactivos</p>
                <p className="text-2xl font-bold text-muted-foreground">{isLoading ? "-" : stats.inactiveUsers}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <Shield className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold">{isLoading ? "-" : stats.admins}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Listado de Usuarios</CardTitle>
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 sm:w-[200px]"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="doctor">Médico</SelectItem>
                    <SelectItem value="nurse">Enfermero/a</SelectItem>
                    <SelectItem value="receptionist">Recepción</SelectItem>
                    <SelectItem value="pharmacist">Farmacia</SelectItem>
                    <SelectItem value="billing_staff">Facturación</SelectItem>
                    <SelectItem value="lab_technician">Laboratorio</SelectItem>
                    <SelectItem value="warehouse_manager">Almacén</SelectItem>
                  </SelectContent>
                </Select>
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
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Cargando usuarios...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-muted-foreground">
                      <th className="pb-3 font-medium">Usuario</th>
                      <th className="pb-3 font-medium">Email</th>
                      <th className="pb-3 font-medium">Rol</th>
                      <th className="pb-3 font-medium">Fecha Creación</th>
                      <th className="pb-3 font-medium">Estado</th>
                      <th className="pb-3 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredUsers.map((user) => {
                      const config = getConfig(user.role)
                      return (
                        <tr key={user.id} className="hover:bg-muted/50">
                          <td className="py-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {getInitials(user.full_name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="font-medium">{user.full_name}</span>
                                <span className="text-xs text-muted-foreground">@{user.username}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 text-sm text-muted-foreground">{user.email}</td>
                          <td className="py-3">
                            <Badge className={config.className}>{config.label}</Badge>
                          </td>
                          <td className="py-3 text-sm text-muted-foreground">
                            {formatDate(user.created_at)}
                          </td>
                          <td className="py-3">
                             <div className="flex flex-col gap-1 items-start">
                               <Badge variant={user.is_active ? "default" : "secondary"}>
                                 {user.is_active ? "Activo" : "Inactivo"}
                               </Badge>
                               {isUserLocked(user) && (
                                 <Badge variant="destructive" className="text-[10px] py-0 px-1.5 leading-none">
                                   Bloqueado
                                 </Badge>
                               )}
                             </div>
                           </td>
                           <td className="py-3">
                             <div className="flex gap-1">
                               <Button
                                 variant="ghost"
                                 size="icon"
                                 onClick={() => {
                                   setSelectedUser(user)
                                   setShowForm(true)
                                 }}
                                 title="Editar usuario"
                               >
                                 <Edit className="h-4 w-4" />
                               </Button>
                               {isUserLocked(user) ? (
                                 <Button
                                   variant="ghost"
                                   size="icon"
                                   className="text-destructive hover:bg-destructive/10"
                                   onClick={() => handleToggleBlock(user)}
                                   title="Desbloquear usuario"
                                 >
                                   <Lock className="h-4 w-4 text-destructive" />
                                 </Button>
                               ) : (
                                 <Button
                                   variant="ghost"
                                   size="icon"
                                   className="text-muted-foreground hover:bg-muted"
                                   onClick={() => handleToggleBlock(user)}
                                   title="Bloquear usuario"
                                 >
                                   <Unlock className="h-4 w-4 text-muted-foreground" />
                                 </Button>
                               )}
                               <Button
                                 variant="ghost"
                                 size="icon"
                                 className="text-destructive hover:bg-destructive/10"
                                 onClick={() => handleDeactivateUser(user.id)}
                                 disabled={isDeactivating === user.id || !user.is_active}
                                 title={user.is_active ? "Desactivar usuario" : "Usuario ya desactivado"}
                               >
                                 {isDeactivating === user.id ? (
                                   <Loader2 className="h-4 w-4 animate-spin" />
                                 ) : (
                                   <Trash2 className="h-4 w-4" />
                                 )}
                               </Button>
                             </div>
                           </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && !isLoading && (
                  <div className="py-12 text-center text-muted-foreground">No se encontraron usuarios</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
