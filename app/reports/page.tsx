"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileText, DollarSign, Users, Package, Pill, TrendingUp, Download, Calendar, BarChart3 } from "lucide-react"

const reportTypes = [
  {
    id: "financial",
    title: "Reporte Financiero",
    description: "Ingresos, egresos y balance general",
    icon: DollarSign,
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    id: "patients",
    title: "Reporte de Pacientes",
    description: "Estadísticas de admisiones y altas",
    icon: Users,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: "inventory",
    title: "Reporte de Inventario",
    description: "Stock actual y movimientos",
    icon: Package,
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    id: "pharmacy",
    title: "Reporte de Farmacia",
    description: "Despacho de medicamentos",
    icon: Pill,
    color: "text-chart-1",
    bgColor: "bg-chart-1/10",
  },
  {
    id: "billing",
    title: "Reporte de Facturación",
    description: "Facturas emitidas y cobros",
    icon: FileText,
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
  },
  {
    id: "occupancy",
    title: "Ocupación Hospitalaria",
    description: "Uso de habitaciones y camas",
    icon: TrendingUp,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
]

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState({ from: "", to: "" })
  const [format, setFormat] = useState("pdf")

  const handleGenerateReport = (reportId: string) => {
    // In a real app, this would generate and download the report
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Reportes</h1>
          <p className="text-muted-foreground">Generación de reportes y estadísticas</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Período del Reporte
            </CardTitle>
            <CardDescription>Selecciona el rango de fechas para los reportes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-2">
                <Label htmlFor="from">Fecha Inicio</Label>
                <Input
                  id="from"
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                  className="w-[180px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="to">Fecha Fin</Label>
                <Input
                  id="to"
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                  className="w-[180px]"
                />
              </div>
              <div className="space-y-2">
                <Label>Formato</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reportTypes.map((report) => (
            <Card key={report.id} className="group cursor-pointer transition-all hover:shadow-md">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${report.bgColor}`}>
                    <report.icon className={`h-6 w-6 ${report.color}`} />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2 opacity-0 transition-opacity group-hover:opacity-100 bg-transparent"
                    onClick={() => handleGenerateReport(report.id)}
                  >
                    <Download className="h-4 w-4" />
                    Generar
                  </Button>
                </div>
                <CardTitle className="text-lg">{report.title}</CardTitle>
                <CardDescription>{report.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full gap-2" variant="secondary" onClick={() => handleGenerateReport(report.id)}>
                  <BarChart3 className="h-4 w-4" />
                  Ver Reporte
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
