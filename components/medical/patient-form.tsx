"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { type Patients } from "@/lib/api/types/medical-types/patient.types"

type PatientFormData = Omit<Patients, "id" | "fullName" | "age" | "allergies" | "chronicConditions" | "currentMedications"> & {
  allergies: string
  chronicConditions: string
  currentMedications: string
}

const toStr = (v: string | string[] | undefined): string =>
  Array.isArray(v) ? v.join(", ") : (v ?? "")

interface PatientFormProps {
  initialData?: Patients
  onClose: () => void
  onSubmit: (data: PatientFormData) => Promise<void>
}

const EMPTY_FORM: PatientFormData = {
  fileNumber: "",
  firstName: "",
  lastName: "",
  identificationNumber: "",
  dateOfBirth: "",
  gender: "",
  bloodType: "",
  phone: "",
  mobile: "",
  email: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  emergencyContactRelationship: "",
  allergies: "",
  chronicConditions: "",
  currentMedications: "",
  insuranceCompany: "",
  insurancePolicyNumber: "",
  isActive: true,
  notes: "",
}

export function PatientForm({ initialData, onClose, onSubmit }: PatientFormProps) {
  const [formData, setFormData] = useState<PatientFormData>(
    initialData
      ? {
          fileNumber: initialData.fileNumber,
          firstName: initialData.firstName,
          lastName: initialData.lastName,
          identificationNumber: initialData.identificationNumber,
          dateOfBirth: initialData.dateOfBirth,
          gender: initialData.gender,
          bloodType: initialData.bloodType,
          phone: initialData.phone,
          mobile: initialData.mobile,
          email: initialData.email,
          address: initialData.address,
          city: initialData.city,
          state: initialData.state,
          zipCode: initialData.zipCode,
          emergencyContactName: initialData.emergencyContactName,
          emergencyContactPhone: initialData.emergencyContactPhone,
          emergencyContactRelationship: initialData.emergencyContactRelationship,
          allergies: toStr(initialData.allergies),
          chronicConditions: toStr(initialData.chronicConditions),
          currentMedications: toStr(initialData.currentMedications),
          insuranceCompany: initialData.insuranceCompany,
          insurancePolicyNumber: initialData.insurancePolicyNumber,
          isActive: initialData.isActive,
          notes: initialData.notes,
        }
      : EMPTY_FORM
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const set = (field: keyof PatientFormData, value: string | boolean) =>
    setFormData((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Información Personal</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">Nombres *</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => set("firstName", e.target.value)}
              placeholder="Juan Carlos"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Apellidos *</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => set("lastName", e.target.value)}
              placeholder="García Mendoza"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="identificationNumber">DPI *</Label>
            <Input
              id="identificationNumber"
              value={formData.identificationNumber}
              onChange={(e) => set("identificationNumber", e.target.value)}
              placeholder="1234 56789 0101"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Fecha de Nacimiento *</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => set("dateOfBirth", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Sexo *</Label>
            <Select value={formData.gender} onValueChange={(v) => set("gender", v)}>
              <SelectTrigger id="gender">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Masculino</SelectItem>
                <SelectItem value="female">Femenino</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bloodType">Tipo de Sangre</Label>
            <Select value={formData.bloodType} onValueChange={(v) => set("bloodType", v)}>
              <SelectTrigger id="bloodType">
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
          <div className="space-y-2">
            <Label htmlFor="fileNumber">No. Expediente</Label>
            <Input
              id="fileNumber"
              value={formData.fileNumber}
              onChange={(e) => set("fileNumber", e.target.value)}
              placeholder="EXP-2024-001"
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Información de Contacto</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+502 1234-5678"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mobile">Móvil</Label>
            <Input
              id="mobile"
              value={formData.mobile}
              onChange={(e) => set("mobile", e.target.value)}
              placeholder="+502 5678-1234"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="paciente@email.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Ciudad</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => set("city", e.target.value)}
              placeholder="Ciudad de Guatemala"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">Departamento</Label>
            <Input
              id="state"
              value={formData.state}
              onChange={(e) => set("state", e.target.value)}
              placeholder="Guatemala"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="zipCode">Código Postal</Label>
            <Input
              id="zipCode"
              value={formData.zipCode}
              onChange={(e) => set("zipCode", e.target.value)}
              placeholder="01014"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">Dirección</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="Zona 10, Ciudad de Guatemala"
            />
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Contacto de Emergencia</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="emergencyContactName">Nombre del Contacto</Label>
            <Input
              id="emergencyContactName"
              value={formData.emergencyContactName}
              onChange={(e) => set("emergencyContactName", e.target.value)}
              placeholder="Nombre completo"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergencyContactPhone">Teléfono de Emergencia</Label>
            <Input
              id="emergencyContactPhone"
              value={formData.emergencyContactPhone}
              onChange={(e) => set("emergencyContactPhone", e.target.value)}
              placeholder="+502 1234-5678"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergencyContactRelationship">Parentesco</Label>
            <Input
              id="emergencyContactRelationship"
              value={formData.emergencyContactRelationship}
              onChange={(e) => set("emergencyContactRelationship", e.target.value)}
              placeholder="Esposo/a, Hijo/a, Padre/Madre..."
            />
          </div>
        </div>
      </div>

      {/* Medical History */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Historial Médico</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="allergies">Alergias</Label>
            <Textarea
              id="allergies"
              value={formData.allergies}
              onChange={(e) => set("allergies", e.target.value)}
              placeholder="Penicilina, Látex..."
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="chronicConditions">Condiciones Crónicas</Label>
            <Textarea
              id="chronicConditions"
              value={formData.chronicConditions}
              onChange={(e) => set("chronicConditions", e.target.value)}
              placeholder="Diabetes, Hipertensión..."
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currentMedications">Medicamentos Actuales</Label>
            <Textarea
              id="currentMedications"
              value={formData.currentMedications}
              onChange={(e) => set("currentMedications", e.target.value)}
              placeholder="Metformina 500mg, Enalapril 10mg..."
              rows={2}
            />
          </div>
        </div>
      </div>

      {/* Insurance Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Información de Seguro</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="insuranceCompany">Proveedor de Seguro</Label>
            <Input
              id="insuranceCompany"
              value={formData.insuranceCompany}
              onChange={(e) => set("insuranceCompany", e.target.value)}
              placeholder="Seguros G&T"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="insurancePolicyNumber">Número de Póliza</Label>
            <Input
              id="insurancePolicyNumber"
              value={formData.insurancePolicyNumber}
              onChange={(e) => set("insurancePolicyNumber", e.target.value)}
              placeholder="SGT-123456"
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Notas Médicas</h3>
        <div className="space-y-2">
          <Label htmlFor="notes">Notas</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Observaciones adicionales..."
            rows={4}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Guardar Paciente"}
        </Button>
      </div>
    </form>
  )
}
