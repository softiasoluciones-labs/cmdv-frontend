"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"
import { ApiUser, UserRole, userService, ApiError } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"

interface UserFormProps {
  user?: ApiUser | null
  onClose: () => void
}

const roles: { value: UserRole; label: string }[] = [
  { value: "super_admin", label: "Super Admin" },
  { value: "admin", label: "Administrador" },
  { value: "doctor", label: "Médico" },
  { value: "nurse", label: "Enfermero/a" },
  { value: "receptionist", label: "Recepción" },
  { value: "pharmacist", label: "Farmacia" },
  { value: "billing_staff", label: "Facturación" },
  { value: "lab_technician", label: "Laboratorio" },
  { value: "warehouse_manager", label: "Almacén" },
]

export function UserForm({ user, onClose }: UserFormProps) {
  const { user: currentUser } = useAuth()

  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    username: user?.username || "",
    email: user?.email || "",
    role: user?.role || ("receptionist" as UserRole),
    is_active: user?.is_active ?? true,
    password: "",
    confirmPassword: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateForm = (): string | null => {
    if (!formData.full_name.trim()) {
      return "El nombre completo es requerido"
    }
    if (!formData.username.trim()) {
      return "El nombre de usuario es requerido"
    }
    if (!formData.email.trim()) {
      return "El email es requerido"
    }
    if (!user) {
      if (!formData.password) {
        return "La contraseña es requerida"
      }
      if (formData.password.length < 8) {
        return "La contraseña debe tener al menos 8 caracteres"
      }
      if (formData.password !== formData.confirmPassword) {
        return "Las contraseñas no coinciden"
      }
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsSubmitting(true)

    try {
      if (user) {
        // Update existing user
        await userService.updateUser(user.id, {
          full_name: formData.full_name,
          username: formData.username,
          email: formData.email,
          role: formData.role,
          is_active: formData.is_active,
          updated_by: currentUser?.id,
        })
      } else {
        // Create new user
        await userService.createUser({
          full_name: formData.full_name,
          username: formData.username,
          email: formData.email,
          role: formData.role,
          is_active: formData.is_active,
          password_hash: formData.password,
          created_by: currentUser?.id,
        })
      }
      onClose()
    } catch (err) {
      const errorMessage =
        err instanceof ApiError
          ? err.message
          : "Error al guardar el usuario"
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="full_name">Nombre Completo</Label>
          <Input
            id="full_name"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            placeholder="Nombre del usuario"
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="username">Nombre de Usuario</Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            placeholder="usuario123"
            required
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="usuario@hospital.com"
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Rol</Label>
          <Select
            value={formData.role}
            onValueChange={(v) => setFormData({ ...formData, role: v as UserRole })}
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Estado</Label>
          <div className="flex items-center gap-2 pt-2">
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              disabled={isSubmitting}
            />
            <span className="text-sm">{formData.is_active ? "Activo" : "Inactivo"}</span>
          </div>
        </div>
      </div>

      {!user && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="********"
              required={!user}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="********"
              required={!user}
              disabled={isSubmitting}
            />
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {user ? "Guardar Cambios" : "Crear Usuario"}
        </Button>
      </div>
    </form>
  )
}
