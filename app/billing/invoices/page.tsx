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
import { invoices, patients, type Invoice } from "@/lib/mock-data"
import { Search, Plus, FileText, DollarSign, Clock, CheckCircle, XCircle, Eye } from "lucide-react"
import { InvoiceDetail } from "@/components/billing/invoice-detail"

const statusConfig: Record<
  Invoice["status"],
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }
> = {
  pending: { label: "Pendiente", variant: "secondary", icon: <Clock className="h-3 w-3" /> },
  partial: { label: "Pago Parcial", variant: "outline", icon: <DollarSign className="h-3 w-3" /> },
  paid: { label: "Pagada", variant: "default", icon: <CheckCircle className="h-3 w-3" /> },
  cancelled: { label: "Cancelada", variant: "destructive", icon: <XCircle className="h-3 w-3" /> },
}

export default function InvoicesPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  const filteredInvoices = useMemo(() => {
    return invoices
      .filter((inv) => {
        const patient = patients.find((p) => p.id === inv.patientId)
        const matchesSearch =
          inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
          patient?.name.toLowerCase().includes(search.toLowerCase())
        const matchesStatus = statusFilter === "all" || inv.status === statusFilter
        return matchesSearch && matchesStatus
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [search, statusFilter])

  const stats = useMemo(() => {
    const total = invoices.reduce((acc, inv) => acc + inv.total, 0)
    const paid = invoices.filter((i) => i.status === "paid").reduce((acc, inv) => acc + inv.total, 0)
    const pending = invoices
      .filter((i) => i.status === "pending" || i.status === "partial")
      .reduce((acc, inv) => acc + (inv.total - inv.paidAmount), 0)
    return { total, paid, pending, count: invoices.length }
  }, [])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Facturas</h1>
            <p className="text-muted-foreground">Gestión de facturación y cobros</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva Factura
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Facturas</p>
                <p className="text-2xl font-bold">{stats.count}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-chart-1/10">
                <DollarSign className="h-6 w-6 text-chart-1" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Facturado</p>
                <p className="text-2xl font-bold">Q{stats.total.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cobrado</p>
                <p className="text-2xl font-bold text-success">Q{stats.paid.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendiente</p>
                <p className="text-2xl font-bold text-warning">Q{stats.pending.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Listado de Facturas</CardTitle>
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
                    <SelectItem value="partial">Pago Parcial</SelectItem>
                    <SelectItem value="paid">Pagada</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
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
                    <th className="pb-3 font-medium">No. Factura</th>
                    <th className="pb-3 font-medium">Paciente</th>
                    <th className="pb-3 font-medium">Fecha</th>
                    <th className="pb-3 font-medium text-right">Total</th>
                    <th className="pb-3 font-medium text-right">Pagado</th>
                    <th className="pb-3 font-medium text-right">Saldo</th>
                    <th className="pb-3 font-medium">Estado</th>
                    <th className="pb-3 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredInvoices.map((inv) => {
                    const patient = patients.find((p) => p.id === inv.patientId)
                    const balance = inv.total - inv.paidAmount
                    const config = statusConfig[inv.status]
                    return (
                      <tr key={inv.id} className="hover:bg-muted/50">
                        <td className="py-3 font-mono text-sm">{inv.invoiceNumber}</td>
                        <td className="py-3 font-medium">{patient?.name}</td>
                        <td className="py-3 text-sm text-muted-foreground">
                          {new Date(inv.date).toLocaleDateString("es-GT")}
                        </td>
                        <td className="py-3 text-right font-medium">Q{inv.total.toLocaleString()}</td>
                        <td className="py-3 text-right text-success">Q{inv.paidAmount.toLocaleString()}</td>
                        <td
                          className={`py-3 text-right font-medium ${balance > 0 ? "text-destructive" : "text-muted-foreground"}`}
                        >
                          Q{balance.toLocaleString()}
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
                              <Button variant="ghost" size="icon" onClick={() => setSelectedInvoice(inv)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                              <DialogHeader>
                                <DialogTitle>Detalle de Factura</DialogTitle>
                              </DialogHeader>
                              <InvoiceDetail invoice={inv} />
                            </DialogContent>
                          </Dialog>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {filteredInvoices.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">No se encontraron facturas</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
