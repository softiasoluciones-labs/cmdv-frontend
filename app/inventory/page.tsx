"use client"

import { useState, useMemo, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useProducts } from "@/hooks/inventory-hooks/use-products"
import { Product } from "@/lib/api/types/inventory-types/inventory.types"
import {
  Search, Plus, Package, AlertTriangle, TrendingDown,
  Filter, Edit, Trash2, ChevronUp, ChevronDown,
  AlertCircle, Thermometer, Calendar, ChevronLeft, ChevronRight,
  ArrowUpDown, Save, X, Clock, DollarSign, TrendingUp
} from "lucide-react"
import { InventoryForm } from "@/components/inventory/inventory-form"
import { Progress } from "@/components/ui/progress"

type SortField = 'name' | 'code' | 'currentStock' | 'categoryName' | 'unitCost'
type SortOrder = 'asc' | 'desc'

export default function InventoryPage() {
  const { products, isLoading, fetchProducts, createProduct, updateProduct, deleteProduct } = useProducts()

  useEffect(() => { fetchProducts({}) }, [])

  // Estados
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedItem, setSelectedItem] = useState<Product | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [savedFilters, setSavedFilters] = useState<any[]>([])
  const [filterName, setFilterName] = useState("")
  const [showSaveFilterDialog, setShowSaveFilterDialog] = useState(false)

  // Cargar filtros guardados del localStorage
  useEffect(() => {
    const saved = localStorage.getItem("savedInventoryFilters")
    if (saved) {
      try {
        setSavedFilters(JSON.parse(saved))
      } catch (e) {
        console.error("Error loading saved filters:", e)
      }
    }
  }, [])

  // Guardar filtros en localStorage
  useEffect(() => {
    localStorage.setItem("savedInventoryFilters", JSON.stringify(savedFilters))
  }, [savedFilters])

  // Obtener stock actual (con validación)
  const getCurrentStock = (item: Product) => (item as any).totalStockQuantity || 0

  // Categorías únicas
  const categories = useMemo(() => {
    const cats = new Set((products || []).map((item) => item.categoryName).filter(Boolean))
    return Array.from(cats)
  }, [products])

  // Filtrar y ordenar items
  const processedItems = useMemo(() => {
    let filtered = (products || []).filter((item) => {
      const matchesSearch =
        item.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.code?.toLowerCase().includes(search.toLowerCase())

      const matchesCategory = categoryFilter === "all" || item.categoryName === categoryFilter

      const currentStock = getCurrentStock(item)
      let matchesStatus = true
      if (statusFilter === "critical") {
        matchesStatus = currentStock === 0
      } else if (statusFilter === "low") {
        matchesStatus = currentStock > 0 && currentStock <= item.minimumStock
      } else if (statusFilter === "reorder") {
        matchesStatus = currentStock <= item.reorderPoint && currentStock > item.minimumStock
      } else if (statusFilter === "ok") {
        matchesStatus = currentStock > item.reorderPoint
      }

      return matchesSearch && matchesCategory && matchesStatus
    })

    // Ordenar
    filtered.sort((a, b) => {
      let aValue: any = a[sortField as keyof Product]
      let bValue: any = b[sortField as keyof Product]

      if (sortField === 'currentStock') {
        aValue = getCurrentStock(a)
        bValue = getCurrentStock(b)
      }

      if (sortField === 'unitCost') {
        aValue = a.unitCost || 0
        bValue = b.unitCost || 0
      }

      if (typeof aValue === 'string') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
    })

    return filtered
  }, [products, search, categoryFilter, statusFilter, sortField, sortOrder])

  // Paginación
  const totalPages = Math.ceil(processedItems.length / itemsPerPage)
  const paginatedItems = processedItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Stats con diseño de gradientes
  const stats = useMemo(() => {
    const products_list = products || []
    const critical = products_list.filter(i => getCurrentStock(i) === 0).length
    const lowStock = products_list.filter(i => getCurrentStock(i) > 0 && getCurrentStock(i) <= i.minimumStock).length
    const totalValue = products_list.reduce((acc, i) => acc + (getCurrentStock(i) * (i.unitCost || 0)), 0)
    const total = products_list.length
    const stockLevel = total > 0 ? ((total - critical - lowStock) / total * 100).toFixed(1) : 0

    return {
      total,
      critical,
      lowStock,
      totalValue,
      stockLevel: parseFloat(stockLevel as string)
    }
  }, [products])

  // Función para ordenar
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
    setCurrentPage(1)
  }

  // Handlers de filtros guardados
  const handleSaveFilter = () => {
    if (filterName.trim()) {
      const newFilter = {
        id: Date.now(),
        name: filterName,
        search,
        categoryFilter,
        statusFilter,
        createdAt: new Date().toISOString(),
      }
      setSavedFilters([...savedFilters, newFilter])
      setFilterName("")
      setShowSaveFilterDialog(false)
    }
  }

  const handleLoadFilter = (filter: any) => {
    setSearch(filter.search)
    setCategoryFilter(filter.categoryFilter)
    setStatusFilter(filter.statusFilter)
    setCurrentPage(1)
  }

  const handleDeleteFilter = (filterId: number) => {
    setSavedFilters(savedFilters.filter(f => f.id !== filterId))
  }

  const handleClearFilters = () => {
    setSearch("")
    setCategoryFilter("all")
    setStatusFilter("all")
    setCurrentPage(1)
  }

  // Badge de stock mejorado
  const getStockBadge = (item: Product) => {
    const currentStock = getCurrentStock(item)
    const percentage = (currentStock / item.maximumStock) * 100

    if (currentStock === 0) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="destructive" className="gap-1 animate-pulse">
                <AlertCircle className="h-3 w-3" />
                ¡Sin Stock!
              </Badge>
            </TooltipTrigger>
            <TooltipContent>Requiere reposición urgente</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    if (currentStock <= item.minimumStock) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="destructive" className="gap-1 bg-red-600">
                <AlertTriangle className="h-3 w-3" />
                Stock Crítico
              </Badge>
            </TooltipTrigger>
            <TooltipContent>Stock por debajo del mínimo ({item.minimumStock})</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    if (currentStock <= item.reorderPoint) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge className="gap-1 bg-yellow-500 text-white border-none">
                <TrendingDown className="h-3 w-3" />
                Punto de Reorden
              </Badge>
            </TooltipTrigger>
            <TooltipContent>Alcanzó punto de reorden ({item.reorderPoint})</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="secondary" className="bg-green-500/10 text-green-600 gap-1">
              <Package className="h-3 w-3" />
              Stock Óptimo
            </Badge>
          </TooltipTrigger>
          <TooltipContent>{percentage.toFixed(0)}% del máximo</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Barra de progreso de stock
  const StockProgressBar = ({ item }: { item: Product }) => {
    const currentStock = getCurrentStock(item)
    const percentage = Math.min((currentStock / item.maximumStock) * 100, 100)

    let bgColor = "bg-green-500"
    if (currentStock <= item.minimumStock) bgColor = "bg-red-500"
    else if (currentStock <= item.reorderPoint) bgColor = "bg-yellow-500"

    return (
      <div className="w-full">
        <div className="flex justify-between text-xs mb-1">
          <span className="font-medium">{currentStock}</span>
          <span className="text-muted-foreground">/{item.maximumStock}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full ${bgColor} transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-gradient-to-br from-primary to-primary/70 rounded-xl shadow-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Inventario
                </h1>
                <p className="text-muted-foreground">Gestión inteligente de insumos y medicamentos</p>
              </div>
            </div>
          </div>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-lg hover:shadow-xl transition-all">
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

        {/* Stats Cards con diseño de gradientes */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-none shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Artículos</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground mt-1">Productos registrados</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950/20 dark:to-red-950/20 border-none shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sin Stock</p>
                  <p className="text-3xl font-bold text-rose-600">{stats.critical}</p>
                  <p className="text-xs text-muted-foreground mt-1">Requieren reposición</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-rose-500/10 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-rose-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-none shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Stock Bajo</p>
                  <p className="text-3xl font-bold text-amber-600">{stats.lowStock}</p>
                  <p className="text-xs text-muted-foreground mt-1">Por debajo del mínimo</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-none shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                  <p className="text-2xl font-bold text-emerald-600">Q{stats.totalValue.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">En inventario</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros Avanzados */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-3">
                {/* Search Input */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre o código..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="pl-9"
                  />
                </div>

                {/* Categoría Filter */}
                <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setCurrentPage(1) }}>
                  <SelectTrigger className="w-[160px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Estado Stock Filter */}
                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1) }}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Estado stock" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="critical">Sin Stock</SelectItem>
                    <SelectItem value="low">Stock Crítico</SelectItem>
                    <SelectItem value="reorder">Punto Reorden</SelectItem>
                    <SelectItem value="ok">Stock Óptimo</SelectItem>
                  </SelectContent>
                </Select>

                {/* Botones de Acción */}
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleClearFilters} className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Limpiar
                  </Button>

                  {/* Botón Guardar Filtro */}
                  <Dialog open={showSaveFilterDialog} onOpenChange={setShowSaveFilterDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <Save className="h-4 w-4" />
                        <span className="hidden sm:inline">Guardar filtro</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Guardar filtro personalizado</DialogTitle>
                        <DialogDescription>
                          Guarda la combinación actual de búsqueda y filtros para usarla rápidamente después.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="p-3 bg-muted/30 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-2">Vista previa del filtro:</p>
                          <div className="space-y-1 text-sm">
                            {search && <div>🔍 Buscar: "{search}"</div>}
                            {categoryFilter !== "all" && <div>📁 Categoría: {categoryFilter}</div>}
                            {statusFilter !== "all" && (
                              <div>⚠️ Estado: {
                                statusFilter === "critical" ? "Sin Stock" :
                                  statusFilter === "low" ? "Stock Crítico" :
                                    statusFilter === "reorder" ? "Punto Reorden" :
                                      statusFilter === "ok" ? "Stock Óptimo" : statusFilter
                              }</div>
                            )}
                            {!search && categoryFilter === "all" && statusFilter === "all" && (
                              <div className="text-muted-foreground">Mostrando todos los artículos</div>
                            )}
                          </div>
                        </div>
                        <div>
                          <Label>Nombre del filtro</Label>
                          <Input
                            value={filterName}
                            onChange={(e) => setFilterName(e.target.value)}
                            placeholder="Ej: Productos críticos de alta rotación"
                            className="mt-1"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Usa un nombre descriptivo para identificar fácilmente este filtro después
                          </p>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowSaveFilterDialog(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleSaveFilter}>
                          <Save className="mr-2 h-4 w-4" />
                          Guardar filtro
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Filtros Guardados */}
              {savedFilters.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t">
                  <span className="text-xs text-muted-foreground">Filtros guardados:</span>
                  {savedFilters.map(filter => (
                    <Badge
                      key={filter.id}
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/80 group"
                      onClick={() => handleLoadFilter(filter)}
                    >
                      {filter.name}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1 p-0 hover:bg-transparent"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFilter(filter.id);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Table Card - SIN MODIFICAR, EXACTAMENTE COMO ESTÁ */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <CardTitle className="text-xl">Artículos en Inventario</CardTitle>
              <div className="flex flex-wrap gap-2">
                {/* Los filtros ya están arriba, aquí solo mantenemos la estructura original */}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="cursor-pointer hover:bg-muted" onClick={() => handleSort('code')}>
                      <div className="flex items-center gap-1">
                        Código
                        {sortField === 'code' && (sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                        {sortField !== 'code' && <ArrowUpDown className="h-3 w-3 opacity-50" />}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted" onClick={() => handleSort('name')}>
                      <div className="flex items-center gap-1">
                        Nombre
                        {sortField === 'name' && (sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                        {sortField !== 'name' && <ArrowUpDown className="h-3 w-3 opacity-50" />}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted" onClick={() => handleSort('categoryName')}>
                      <div className="flex items-center gap-1">
                        Categoría
                        {sortField === 'categoryName' && (sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                        {sortField !== 'categoryName' && <ArrowUpDown className="h-3 w-3 opacity-50" />}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted" onClick={() => handleSort('currentStock')}>
                      <div className="flex items-center gap-1">
                        Stock
                        {sortField === 'currentStock' && (sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                        {sortField !== 'currentStock' && <ArrowUpDown className="h-3 w-3 opacity-50" />}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted" onClick={() => handleSort('unitCost')}>
                      <div className="flex items-center gap-1">
                        Costo Unit.
                        {sortField === 'unitCost' && (sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                        {sortField !== 'unitCost' && <ArrowUpDown className="h-3 w-3 opacity-50" />}
                      </div>
                    </TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                        No se encontraron artículos
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedItems.map((item) => (
                      <TableRow key={item.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-mono text-xs">{item.code}</TableCell>
                        <TableCell className="font-medium">
                          <div className="space-y-1">
                            <div>{item.name}</div>
                            {item.requiresRefrigeration && (
                              <Badge variant="outline" className="text-xs gap-1">
                                <Thermometer className="h-3 w-3" />
                                Refrigeración
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{item.categoryName || 'N/A'}</TableCell>
                        <TableCell>
                          <StockProgressBar item={item} />
                        </TableCell>
                        <TableCell>Q{(item.unitCost || 0).toFixed(2)}</TableCell>
                        <TableCell>{getStockBadge(item)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
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
                                </TooltipTrigger>
                                <TooltipContent>Editar artículo</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:bg-destructive/10"
                                    onClick={() => {
                                      if (confirm('¿Estás seguro de eliminar este artículo?')) {
                                        deleteProduct(item.id)
                                      }
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Eliminar artículo</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Paginación */}
            {processedItems.length > 0 && (
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, processedItems.length)} de {processedItems.length}
                  </p>
                  <Select value={itemsPerPage.toString()} onValueChange={(v) => { setItemsPerPage(Number(v)); setCurrentPage(1) }}>
                    <SelectTrigger className="w-[70px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum = currentPage
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-9"
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

// Componente Label (si no existe en shadcn)
const Label = ({ children, htmlFor, className }: { children: React.ReactNode; htmlFor?: string; className?: string }) => (
  <label htmlFor={htmlFor} className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className || ""}`}>
    {children}
  </label>
)