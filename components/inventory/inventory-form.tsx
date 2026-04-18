"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Product } from "@/lib/api/types/inventory-types/inventory.types"

interface InventoryFormProps {
  item?: Product | null
  onSubmit: (data: any) => void
  onClose: () => void
}

const categories = ["Medicamentos", "Insumos Quirúrgicos", "Equipo Médico", "Consumibles", "Laboratorio"]
const units = ["unidades", "cajas", "frascos", "paquetes", "litros", "ml"]

export function InventoryForm({ item, onSubmit, onClose }: InventoryFormProps) {
  const [formData, setFormData] = useState({
    code: item?.code || "",
    name: item?.name || "",
    categoryName: item?.categoryName || "",
    currentStock: (item as any)?.currentStock || 0,
    minimumStock: item?.minimumStock || 0,
    unitCost: item?.unitCost || 0,
    unitOfMeasure: item?.unitOfMeasure || "unidades",
    supplier: (item as any)?.supplier || "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="code">Código</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            placeholder="INV-001"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Nombre del artículo"
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Categoría</Label>
          <Select value={formData.categoryName} onValueChange={(v) => setFormData({ ...formData, categoryName: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Unidad</Label>
          <Select value={formData.unitOfMeasure} onValueChange={(v) => setFormData({ ...formData, unitOfMeasure: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              {units.map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {unit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="currentStock">Stock Actual</Label>
          <Input
            id="currentStock"
            type="number"
            value={formData.currentStock}
            onChange={(e) => setFormData({ ...formData, currentStock: Number(e.target.value) })}
            min={0}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="minimumStock">Stock Mínimo</Label>
          <Input
            id="minimumStock"
            type="number"
            value={formData.minimumStock}
            onChange={(e) => setFormData({ ...formData, minimumStock: Number(e.target.value) })}
            min={0}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="unitCost">Costo Unitario (Q)</Label>
          <Input
            id="unitCost"
            type="number"
            step="0.01"
            value={formData.unitCost}
            onChange={(e) => setFormData({ ...formData, unitCost: Number(e.target.value) })}
            min={0}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="supplier">Proveedor</Label>
        <Input
          id="supplier"
          value={formData.supplier}
          onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
          placeholder="Nombre del proveedor"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit">{item ? "Guardar Cambios" : "Crear Artículo"}</Button>
      </div>
    </form>
  )
}
