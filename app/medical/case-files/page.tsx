"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { caseFiles, formatDate, formatCurrency, getStageLabel, type CaseFile } from "@/lib/mock-data"
import { Plus, MoreHorizontal, Eye, Edit, FileText, BedDouble, Users, DollarSign, AlertTriangle } from "lucide-react"
import { CaseFileDetail } from "@/components/medical/case-file-detail"

const stageColors: Record<CaseFile["stage"], string> = {
  emergency: "bg-destructive text-destructive-foreground",
  consultation: "bg-primary text-primary-foreground",
  hospitalized: "bg-chart-1 text-primary-foreground",
  surgery: "bg-warning text-warning-foreground",
  recovery: "bg-success text-success-foreground",
  discharged: "bg-muted text-muted-foreground",
}

export default function CaseFilesPage() {
  const [selectedCase, setSelectedCase] = useState<CaseFile | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const activeCases = caseFiles.filter((c) => c.stage !== "discharged")
  const totalCost = activeCases.reduce((sum, c) => sum + c.totalCost, 0)
  const totalPaid = activeCases.reduce((sum, c) => sum + c.paidAmount, 0)

  const columns = [
    {
      key: "caseNumber",
      header: "No. Caso",
      render: (caseFile: CaseFile) => <span className="font-medium text-primary">{caseFile.caseNumber}</span>,
    },
    {
      key: "patientName",
      header: "Paciente",
      render: (caseFile: CaseFile) => <span className="font-medium">{caseFile.patientName}</span>,
    },
    {
      key: "admissionDate",
      header: "Fecha Ingreso",
      render: (caseFile: CaseFile) => formatDate(caseFile.admissionDate),
    },
    {
      key: "stage",
      header: "Etapa",
      render: (caseFile: CaseFile) => (
        <Badge className={stageColors[caseFile.stage]}>{getStageLabel(caseFile.stage)}</Badge>
      ),
    },
    {
      key: "primaryDoctor",
      header: "Doctor Principal",
    },
    {
      key: "assignedRoom",
      header: "Habitación",
      render: (caseFile: CaseFile) => caseFile.assignedRoom || "-",
    },
    {
      key: "totalCost",
      header: "Costo Total",
      render: (caseFile: CaseFile) => <span className="font-medium">{formatCurrency(caseFile.totalCost)}</span>,
    },
    {
      key: "balance",
      header: "Saldo",
      render: (caseFile: CaseFile) => {
        const balance = caseFile.totalCost - caseFile.paidAmount
        return (
          <span className={balance > 0 ? "text-destructive font-medium" : "text-success font-medium"}>
            {formatCurrency(balance)}
          </span>
        )
      },
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Expedientes Médicos</h1>
            <p className="text-muted-foreground">Gestión de casos y expedientes activos</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Expediente
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Casos Activos</p>
                  <p className="text-2xl font-bold">{activeCases.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">En Emergencia</p>
                  <p className="text-2xl font-bold">{activeCases.filter((c) => c.stage === "emergency").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                  <DollarSign className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Facturado</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalCost)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                  <DollarSign className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Saldo Pendiente</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalCost - totalPaid)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <DataTable
          data={caseFiles}
          columns={columns}
          searchPlaceholder="Buscar por caso, paciente, doctor..."
          actions={(caseFile) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedCase(caseFile)
                    setIsDetailOpen(true)
                  }}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Detalle
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <BedDouble className="mr-2 h-4 w-4" />
                  Asignar Habitación
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Users className="mr-2 h-4 w-4" />
                  Asignar Doctor
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        />

        {/* Case Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalle del Expediente</DialogTitle>
            </DialogHeader>
            {selectedCase && <CaseFileDetail caseFile={selectedCase} />}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
