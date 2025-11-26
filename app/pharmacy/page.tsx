"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { prescriptions, patients, doctors, type Prescription } from "@/lib/mock-data"
import { Search, Plus, Pill, Clock, CheckCircle, XCircle, AlertTriangle, Eye } from "lucide-react"
import { PrescriptionDetail } from "@/components/pharmacy/prescription-detail"

const statusConfig: Record<
  Prescription["status"],
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }
> = {
  pending: { label: "Pendiente", variant: "secondary", icon: <Clock className="h-3 w-3" /> },
  dispensed: { label: "Despachada", variant: "default", icon: <CheckCircle className="h-3 w-3" /> },
  partial: { label: "Parcial", variant: "outline", icon: <AlertTriangle className="h-3 w-3" /> },
  cancelled: { label: "Cancelada", variant: "destructive", icon: <XCircle className="h-3 w-3" /> },
  expired: { label: "Vencida", variant: "destructive", icon: <AlertTriangle className="h-3 w-3" /> },
}

export default function PharmacyPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null)

  const filteredPrescriptions = useMemo(() => {
    return prescriptions
      .filter((rx) => {
        const patient = patients.find((p) => p.id === rx.patientId)
        const doctor = doctors.find((d) => d.id === rx.doctorId)
        const matchesSearch =
          rx.prescriptionNumber.toLowerCase().includes(search.toLowerCase()) ||
          (patient?.firstName.toLowerCase() + " " + patient?.lastName.toLowerCase()).includes(search.toLowerCase()) ||
          doctor?.name.toLowerCase().includes(search.toLowerCase())
        const matchesStatus = statusFilter === "all" || rx.status === statusFilter
        return matchesSearch && matchesStatus
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [search, statusFilter])

  const stats = useMemo(() => {
    const pending = prescriptions.filter((rx) => rx.status === "pending").length
    const dispensed = prescriptions.filter((rx) => rx.status === "dispensed").length
    return { total: prescriptions.length, pending, dispensed }
  }, [])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Farmacia</h1>
            <p className="text-muted-foreground">Gestión de recetas y despacho de medicamentos</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva Receta
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Pill className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Recetas</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold text-warning">{stats.pending}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Despachadas</p>
                <p className="text-2xl font-bold text-success">{stats.dispensed}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Recetas</CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 sm:w-[200px]"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="dispensed">Despachada</SelectItem>
                    <SelectItem value="partial">Parcial</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                    <SelectItem value="expired">Vencida</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">No. Receta</th>
                    <th className="pb-3 font-medium">Paciente</th>
                    <th className="pb-3 font-medium">Médico</th>
                    <th className="pb-3 font-medium">Fecha</th>
                    <th className="pb-3 font-medium">Medicamentos</th>
                    <th className="pb-3 font-medium">Estado</th>
                    <th className="pb-3 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredPrescriptions.map((rx) => {
                    const patient = patients.find((p) => p.id === rx.patientId)
                    const doctor = doctors.find((d) => d.id === rx.doctorId)
                    const config = statusConfig[rx.status]
                    return (
                      <tr key={rx.id} className="hover:bg-muted/50">
                        <td className="py-3 font-mono text-sm">{rx.prescriptionNumber}</td>
                        <td className="py-3 font-medium">{patient?.firstName + " " + patient?.lastName}</td>
                        <td className="py-3 text-sm text-muted-foreground">{doctor?.name}</td>
                        <td className="py-3 text-sm text-muted-foreground">
                          {new Date(rx.date).toLocaleDateString("es-GT")}
                        </td>
                        <td className="py-3">
                          <span className="text-sm">{rx.medications.length} medicamento(s)</span>
                        </td>
                        <td className="py-3">
                          <Badge variant={config.variant} className="gap-1">
                            {config.icon}
                            {config.label}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => setSelectedPrescription(rx)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Detalle de Receta</DialogTitle>
                              </DialogHeader>
                              <PrescriptionDetail prescription={rx} />
                            </DialogContent>
                          </Dialog>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {filteredPrescriptions.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">No se encontraron recetas</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
