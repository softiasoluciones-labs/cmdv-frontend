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
import { payments, invoices, patients, type Payment } from "@/lib/mock-data"
import { Search, Plus, CreditCard, Banknote, Building2, Wallet, Calendar } from "lucide-react"
import { Label } from "@/components/ui/label"

const methodConfig: Record<Payment["method"], { label: string; icon: React.ReactNode }> = {
  cash: { label: "Efectivo", icon: <Banknote className="h-4 w-4" /> },
  card: { label: "Tarjeta", icon: <CreditCard className="h-4 w-4" /> },
  transfer: { label: "Transferencia", icon: <Building2 className="h-4 w-4" /> },
  insurance: { label: "Seguro", icon: <Wallet className="h-4 w-4" /> },
}

export default function PaymentsPage() {
  const [search, setSearch] = useState("")
  const [methodFilter, setMethodFilter] = useState<string>("all")
  const [showForm, setShowForm] = useState(false)

  const filteredPayments = useMemo(() => {
    return payments
      .filter((pay) => {
        const invoice = invoices.find((i) => i.id === pay.invoiceId)
        const patient = patients.find((p) => p.id === invoice?.patientId)
        const matchesSearch =
          pay.receiptNumber.toLowerCase().includes(search.toLowerCase()) ||
          patient?.name.toLowerCase().includes(search.toLowerCase())
        const matchesMethod = methodFilter === "all" || pay.method === methodFilter
        return matchesSearch && matchesMethod
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [search, methodFilter])

  const stats = useMemo(() => {
    const today = new Date().toDateString()
    const todayPayments = payments.filter((p) => new Date(p.date).toDateString() === today)
    const todayTotal = todayPayments.reduce((acc, p) => acc + p.amount, 0)
    const monthTotal = payments.reduce((acc, p) => acc + p.amount, 0)
    return { todayCount: todayPayments.length, todayTotal, monthTotal }
  }, [])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Pagos</h1>
            <p className="text-muted-foreground">Registro de pagos y cobros</p>
          </div>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Pago
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Pago</DialogTitle>
              </DialogHeader>
              <PaymentForm onClose={() => setShowForm(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pagos Hoy</p>
                <p className="text-2xl font-bold">{stats.todayCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                <Banknote className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cobrado Hoy</p>
                <p className="text-2xl font-bold text-success">Q{stats.todayTotal.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-chart-1/10">
                <Wallet className="h-6 w-6 text-chart-1" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Mes</p>
                <p className="text-2xl font-bold">Q{stats.monthTotal.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Historial de Pagos</CardTitle>
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
                <Select value={methodFilter} onValueChange={setMethodFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="cash">Efectivo</SelectItem>
                    <SelectItem value="card">Tarjeta</SelectItem>
                    <SelectItem value="transfer">Transferencia</SelectItem>
                    <SelectItem value="insurance">Seguro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredPayments.map((pay) => {
                const invoice = invoices.find((i) => i.id === pay.invoiceId)
                const patient = patients.find((p) => p.id === invoice?.patientId)
                const config = methodConfig[pay.method]
                return (
                  <div key={pay.id} className="flex items-center gap-4 rounded-lg border p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10 text-success">
                      {config.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{patient?.name}</span>
                        <Badge variant="outline">{config.label}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Recibo: {pay.receiptNumber}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(pay.date).toLocaleDateString("es-GT")}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-success">Q{pay.amount.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Factura: {invoice?.invoiceNumber}</p>
                    </div>
                  </div>
                )
              })}
              {filteredPayments.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">No se encontraron pagos</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

function PaymentForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    invoiceId: "",
    amount: 0,
    method: "cash" as Payment["method"],
    reference: "",
  })

  const pendingInvoices = invoices.filter((i) => i.status === "pending" || i.status === "partial")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Factura</Label>
        <Select value={formData.invoiceId} onValueChange={(v) => setFormData({ ...formData, invoiceId: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar factura" />
          </SelectTrigger>
          <SelectContent>
            {pendingInvoices.map((inv) => {
              const patient = patients.find((p) => p.id === inv.patientId)
              const balance = inv.total - inv.paidAmount
              return (
                <SelectItem key={inv.id} value={inv.id}>
                  {inv.invoiceNumber} - {patient?.name} (Saldo: Q{balance.toLocaleString()})
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="amount">Monto (Q)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
            min={0}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Método de Pago</Label>
          <Select
            value={formData.method}
            onValueChange={(v) => setFormData({ ...formData, method: v as Payment["method"] })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Efectivo</SelectItem>
              <SelectItem value="card">Tarjeta</SelectItem>
              <SelectItem value="transfer">Transferencia</SelectItem>
              <SelectItem value="insurance">Seguro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reference">Referencia</Label>
        <Input
          id="reference"
          value={formData.reference}
          onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
          placeholder="Número de transacción, cheque, etc."
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit">Registrar Pago</Button>
      </div>
    </form>
  )
}
