"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface PatientFormProps {
  onClose: () => void
}

export function PatientForm({ onClose }: PatientFormProps) {
  const [allergies, setAllergies] = useState<string[]>([])
  const [conditions, setConditions] = useState<string[]>([])
  const [newAllergy, setNewAllergy] = useState("")
  const [newCondition, setNewCondition] = useState("")

  const addAllergy = () => {
    if (newAllergy.trim()) {
      setAllergies([...allergies, newAllergy.trim()])
      setNewAllergy("")
    }
  }

  const addCondition = () => {
    if (newCondition.trim()) {
      setConditions([...conditions, newCondition.trim()])
      setNewCondition("")
    }
  }

  return (
    <form className="space-y-6">
      {/* Personal Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Información Personal</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">Nombres *</Label>
            <Input id="firstName" placeholder="Juan Carlos" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Apellidos *</Label>
            <Input id="lastName" placeholder="García Mendoza" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dpi">DPI *</Label>
            <Input id="dpi" placeholder="1234 56789 0101" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="birthDate">Fecha de Nacimiento *</Label>
            <Input id="birthDate" type="date" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Sexo *</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M">Masculino</SelectItem>
                <SelectItem value="F">Femenino</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bloodType">Tipo de Sangre</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A+">A+</SelectItem>
                <SelectItem value="A-">A-</SelectItem>
                <SelectItem value="B+">B+</SelectItem>
                <SelectItem value="B-">B-</SelectItem>
                <SelectItem value="AB+">AB+</SelectItem>
                <SelectItem value="AB-">AB-</SelectItem>
                <SelectItem value="O+">O+</SelectItem>
                <SelectItem value="O-">O-</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Información de Contacto</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono *</Label>
            <Input id="phone" placeholder="+502 1234-5678" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input id="email" type="email" placeholder="correo@ejemplo.com" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">Dirección</Label>
            <Textarea id="address" placeholder="Zona 10, Ciudad de Guatemala" />
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Contacto de Emergencia</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="emergencyContact">Nombre del Contacto</Label>
            <Input id="emergencyContact" placeholder="Nombre completo" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergencyPhone">Teléfono de Emergencia</Label>
            <Input id="emergencyPhone" placeholder="+502 1234-5678" />
          </div>
        </div>
      </div>

      {/* Medical Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Información Médica</h3>

        {/* Allergies */}
        <div className="space-y-2">
          <Label>Alergias</Label>
          <div className="flex gap-2">
            <Input
              value={newAllergy}
              onChange={(e) => setNewAllergy(e.target.value)}
              placeholder="Agregar alergia"
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAllergy())}
            />
            <Button type="button" variant="outline" onClick={addAllergy}>
              Agregar
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {allergies.map((allergy, index) => (
              <Badge key={index} variant="destructive" className="gap-1">
                {allergy}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setAllergies(allergies.filter((_, i) => i !== index))}
                />
              </Badge>
            ))}
          </div>
        </div>

        {/* Chronic Conditions */}
        <div className="space-y-2">
          <Label>Condiciones Crónicas</Label>
          <div className="flex gap-2">
            <Input
              value={newCondition}
              onChange={(e) => setNewCondition(e.target.value)}
              placeholder="Agregar condición"
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCondition())}
            />
            <Button type="button" variant="outline" onClick={addCondition}>
              Agregar
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {conditions.map((condition, index) => (
              <Badge key={index} variant="secondary" className="gap-1">
                {condition}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setConditions(conditions.filter((_, i) => i !== index))}
                />
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Insurance Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Información de Seguro</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="insuranceProvider">Proveedor de Seguro</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="seguros_gt">Seguros G&T</SelectItem>
                <SelectItem value="el_roble">El Roble</SelectItem>
                <SelectItem value="mapfre">Mapfre</SelectItem>
                <SelectItem value="universal">Seguros Universal</SelectItem>
                <SelectItem value="ninguno">Sin Seguro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="insuranceNumber">Número de Póliza</Label>
            <Input id="insuranceNumber" placeholder="SGT-123456" />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit">Guardar Paciente</Button>
      </div>
    </form>
  )
}
