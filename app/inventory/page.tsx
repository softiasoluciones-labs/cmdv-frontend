"use client"

import { useState, useMemo, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useProducts } from "@/hooks/inventory-hooks/use-products"
import { Product } from "@/lib/api/types/inventory-types/inventory.types"
import { Search, Plus, Package, AlertTriangle, TrendingDown, Filter, Edit, Trash2 } from "lucide-react"
import { InventoryForm } from "@/components/inventory/inventory-form"

export default function InventoryPage() {
  const { products, isLoading, fetchProducts, createProduct, updateProduct, deleteProduct } = useProducts()

  // Use useEffect to fetch data on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchProducts({}) }, [])

  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedItem, setSelectedItem] = useState<Product | null>(null)
  const [showForm, setShowForm] = useState(false)

  const categories = useMemo(() => {
    const cats = new Set((products || []).map((item) => item.categoryName).filter(Boolean))
    return Array.from(cats)
  }, [products])

  const filteredItems = useMemo(() => {
    return (products || []).filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) || 
        (item.code || "").toLowerCase().includes(search.toLowerCase())
      
      const categoryName = item.categoryName || ""
      const matchesCategory = categoryFilter === "all" || categoryName === categoryFilter

      const currentStock = (item as any).currentStock || 0
      let matchesStatus = true
      if (statusFilter === "low") {
        matchesStatus = currentStock <= item.minimumStock
      } else if (statusFilter === "ok") {
        matchesStatus = currentStock > item.minimumStock
      }

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [products, search, categoryFilter, statusFilter])

  const stats = useMemo(() => {
    const lowStock = (products || []).filter((i) => ((i as any).currentStock || 0) <= i.minimumStock).length
    const totalValue = (products || []).reduce((acc, i) => acc + (((i as any).currentStock || 0) * i.unitCost), 0)
    return { total: (products || []).length, lowStock, totalValue }
  }, [products])

  const getStockBadge = (item: Product) => {
    const currentStock = (item as any).currentStock || 0
    if (currentStock <= item.minimumStock) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          Stock Bajo
        </Badge>
      )
    }
    return (
      <Badge variant="secondary" className="bg-success/10 text-success">
        Normal
      </Badge>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Inventario</h1>
            <p className="text-muted-foreground">Gestión de insumos y medicamentos</p>
          </div>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Artículo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{selectedItem ? "Editar Artículo" : "Nuevo Artículo"}</DialogTitle>
              </DialogHeader>
              <InventoryForm
                item={selectedItem}
                onSubmit={async (data: any) => {
                  try {
                    if (selectedItem) {
                      await updateProduct(selectedItem.id, data as any);
                    } else {
                      await createProduct(data as any);
                    }
                    setShowForm(false);
                    setSelectedItem(null);
                    fetchProducts({});
                  } catch (e) {
                    console.error("Error saving product", e);
                  }
                }}
                onClose={() => {
                  setShowForm(false)
                  setSelectedItem(null)
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Artículos</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <TrendingDown className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Stock Bajo</p>
                <p className="text-2xl font-bold text-destructive">{stats.lowStock}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                <Package className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold">Q{stats.totalValue.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Artículos en Inventario</CardTitle>
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 sm:w-[200px]"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[150px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="low">Stock Bajo</SelectItem>
                    <SelectItem value="ok">Normal</SelectItem>
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
                    <th className="pb-3 font-medium">Código</th>
                    <th className="pb-3 font-medium">Nombre</th>
                    <th className="pb-3 font-medium">Categoría</th>
                    <th className="pb-3 font-medium text-right">Stock</th>
                    <th className="pb-3 font-medium text-right">Mínimo</th>
                    <th className="pb-3 font-medium text-right">Costo Unit.</th>
                    <th className="pb-3 font-medium">Estado</th>
                    <th className="pb-3 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/50">
                      <td className="py-3 font-mono text-sm">{item.code}</td>
                      <td className="py-3 font-medium">{item.name}</td>
                      <td className="py-3 text-sm text-muted-foreground">{item.categoryName || 'N/A'}</td>
                      <td className="py-3 text-right">
                        {((item as any).currentStock || 0)} {item.unitOfMeasure || 'Unidades'}
                      </td>
                      <td className="py-3 text-right text-muted-foreground">{item.minimumStock}</td>
                      <td className="py-3 text-right">Q{(item.unitCost || 0).toFixed(2)}</td>
                      <td className="py-3">{getStockBadge(item)}</td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedItem(item)
                              setShowForm(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteProduct(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredItems.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">No se encontraron artículos</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
