"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { patients, formatDate, type Patient } from "@/lib/mock-data"
import { Plus, MoreHorizontal, Eye, Edit, FolderOpen } from "lucide-react"
import { PatientForm } from "@/components/medical/patient-form"
import { PatientDetail } from "@/components/medical/patient-detail"

export default function PatientsPage() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const columns = [
    {
      key: "fileNumber",
      header: "No. Expediente",
      render: (patient: Patient) => <span className="font-medium text-primary">{patient.fileNumber}</span>,
    },
    {
      key: "fullName",
      header: "Nombre Completo",
      render: (patient: Patient) => (
        <div>
          <p className="font-medium">{`${patient.firstName} ${patient.lastName}`}</p>
          <p className="text-sm text-muted-foreground">{patient.dpi}</p>
        </div>
      ),
    },
    {
      key: "age",
      header: "Edad",
      render: (patient: Patient) => `${patient.age} años`,
    },
    {
      key: "gender",
      header: "Sexo",
      render: (patient: Patient) => (patient.gender === "M" ? "Masculino" : "Femenino"),
    },
    {
      key: "bloodType",
      header: "Tipo Sangre",
      render: (patient: Patient) => (
        <Badge variant="outline" className="font-mono">
          {patient.bloodType}
        </Badge>
      ),
    },
    {
      key: "phone",
      header: "Teléfono",
    },
    {
      key: "lastVisit",
      header: "Última Visita",
      render: (patient: Patient) => formatDate(patient.lastVisit),
    },
    {
      key: "hasActiveCase",
      header: "Estado",
      render: (patient: Patient) =>
        patient.hasActiveCase ? (
          <Badge className="bg-success text-success-foreground">Caso Activo</Badge>
        ) : (
          <Badge variant="secondary">Sin Caso</Badge>
        ),
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Pacientes</h1>
            <p className="text-muted-foreground">Gestión de pacientes del hospital</p>
          </div>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Paciente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Registrar Nuevo Paciente</DialogTitle>
                <DialogDescription>Complete la información del paciente</DialogDescription>
              </DialogHeader>
              <PatientForm onClose={() => setIsFormOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Data Table */}
        <DataTable
          data={patients}
          columns={columns}
          searchPlaceholder="Buscar por nombre, DPI, expediente..."
          actions={(patient) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedPatient(patient)
                    setIsDetailOpen(true)
                  }}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Detalle
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedPatient(patient)
                    setIsFormOpen(true)
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FolderOpen className="mr-2 h-4 w-4" />
                  Nuevo Expediente
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        />

        {/* Patient Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalle del Paciente</DialogTitle>
            </DialogHeader>
            {selectedPatient && <PatientDetail patient={selectedPatient} />}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
