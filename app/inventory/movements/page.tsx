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
import { inventoryMovements, inventoryItems, type InventoryMovement } from "@/lib/mock-data"
import { Search, Plus, ArrowUpCircle, ArrowDownCircle, RefreshCw, Calendar } from "lucide-react"
import { Label } from "@/components/ui/label"

export default function MovementsPage() {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [showForm, setShowForm] = useState(false)

  const filteredMovements = useMemo(() => {
    return inventoryMovements
      .filter((mov) => {
        const item = inventoryItems.find((i) => i.id === mov.itemId)
        const matchesSearch =
          item?.name.toLowerCase().includes(search.toLowerCase()) ||
          mov.reference?.toLowerCase().includes(search.toLowerCase())
        const matchesType = typeFilter === "all" || mov.type === typeFilter
        return matchesSearch && matchesType
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [search, typeFilter])

  const getTypeIcon = (type: InventoryMovement["type"]) => {
    switch (type) {
      case "entry":
        return <ArrowDownCircle className="h-5 w-5 text-success" />
      case "exit":
        return <ArrowUpCircle className="h-5 w-5 text-destructive" />
      case "adjustment":
        return <RefreshCw className="h-5 w-5 text-warning" />
    }
  }

  const getTypeBadge = (type: InventoryMovement["type"]) => {
    switch (type) {
      case "entry":
        return <Badge className="bg-success/10 text-success">Entrada</Badge>
      case "exit":
        return <Badge variant="destructive">Salida</Badge>
      case "adjustment":
        return <Badge className="bg-warning/10 text-warning">Ajuste</Badge>
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Movimientos de Inventario</h1>
            <p className="text-muted-foreground">Registro de entradas, salidas y ajustes</p>
          </div>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Movimiento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Movimiento</DialogTitle>
              </DialogHeader>
              <MovementForm onClose={() => setShowForm(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Historial de Movimientos</CardTitle>
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
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="entry">Entradas</SelectItem>
                    <SelectItem value="exit">Salidas</SelectItem>
                    <SelectItem value="adjustment">Ajustes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredMovements.map((mov) => {
                const item = inventoryItems.find((i) => i.id === mov.itemId)
                return (
                  <div key={mov.id} className="flex items-center gap-4 rounded-lg border p-4">
                    {getTypeIcon(mov.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item?.name}</span>
                        {getTypeBadge(mov.type)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(mov.date).toLocaleDateString("es-GT")}
                        </span>
                        {mov.reference && <span>Ref: {mov.reference}</span>}
                      </div>
                      {mov.notes && <p className="mt-1 text-sm text-muted-foreground">{mov.notes}</p>}
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-lg font-bold ${mov.type === "entry" ? "text-success" : mov.type === "exit" ? "text-destructive" : "text-warning"}`}
                      >
                        {mov.type === "entry" ? "+" : mov.type === "exit" ? "-" : "±"}
                        {mov.quantity}
                      </p>
                      <p className="text-sm text-muted-foreground">{item?.unit}</p>
                    </div>
                  </div>
                )
              })}
              {filteredMovements.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">No se encontraron movimientos</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

function MovementForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    itemId: "",
    type: "entry" as InventoryMovement["type"],
    quantity: 0,
    reference: "",
    notes: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Artículo</Label>
        <Select value={formData.itemId} onValueChange={(v) => setFormData({ ...formData, itemId: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar artículo" />
          </SelectTrigger>
          <SelectContent>
            {inventoryItems.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Tipo de Movimiento</Label>
          <Select
            value={formData.type}
            onValueChange={(v) => setFormData({ ...formData, type: v as InventoryMovement["type"] })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="entry">Entrada</SelectItem>
              <SelectItem value="exit">Salida</SelectItem>
              <SelectItem value="adjustment">Ajuste</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="quantity">Cantidad</Label>
          <Input
            id="quantity"
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
            min={1}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reference">Referencia</Label>
        <Input
          id="reference"
          value={formData.reference}
          onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
          placeholder="Número de factura, orden, etc."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Input
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Notas adicionales"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit">Registrar</Button>
      </div>
    </form>
  )
}
