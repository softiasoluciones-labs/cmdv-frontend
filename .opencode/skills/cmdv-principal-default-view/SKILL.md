# Guía de Estándares de Diseño - Sistema de Inventario

## 🎨 Principios Generales

- **Consistencia**: Todos los componentes deben seguir las mismas reglas de espaciado, colores y comportamientos
- **Feedback Visual**: Cada interacción debe tener retroalimentación visual (hover, focus, active)
- **Responsive**: Diseño mobile-first con breakpoints en sm, md, lg
- **Accesibilidad**: Uso de Tooltips para acciones, textos claros y contrastes adecuados

---

## 📊 Sección 1: Tarjetas de Resumen (Stats Cards)

### Estructura Base
```tsx
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-none shadow-md hover:shadow-lg transition-all">
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Título</p>
          <p className="text-3xl font-bold">Valor</p>
          <p className="text-xs text-muted-foreground mt-1">Subtítulo</p>
        </div>
        <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
      </div>
    </CardContent>
  </Card>
</div>

Paleta de Colores (Gradientes)
Tipo	Gradiente	Icon Background	Icon Color
Primario	from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20	bg-blue-500/10	text-blue-600
Advertencia	from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20	bg-amber-500/10	text-amber-600
Éxito	from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20	bg-emerald-500/10	text-emerald-600
Información	from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20	bg-purple-500/10	text-purple-600
Reglas
Grid: Siempre usar grid gap-4 sm:grid-cols-2 lg:grid-cols-4

Padding: p-4 en CardContent

Tipografía: Título text-sm font-medium text-muted-foreground, Valor text-3xl font-bold, Subtítulo text-xs text-muted-foreground mt-1

Icono: Contenedor h-12 w-12 rounded-full, Icono h-6 w-6

Animación: hover:shadow-lg transition-all

🔍 Sección 2: Barra de Filtros
Estructura Base
tsx
<Card>
  <CardContent className="p-4">
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filtros Select */}
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[160px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filtrar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {/* Opciones dinámicas */}
          </SelectContent>
        </Select>

        {/* Botones de Acción */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleClear} className="gap-2">
            <Trash2 className="h-4 w-4" />
            Limpiar
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Save className="h-4 w-4" />
                <span className="hidden sm:inline">Guardar filtro</span>
              </Button>
            </DialogTrigger>
            {/* Dialog Content */}
          </Dialog>
        </div>

        {/* Toggle de Vista (opcional) */}
        <div className="flex gap-1 ml-auto">
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("table")}
            className="gap-1"
          >
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">Tabla</span>
          </Button>
          <Button
            variant={viewMode === "kanban" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("kanban")}
            className="gap-1"
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline">Kanban</span>
          </Button>
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
              onClick={() => loadFilter(filter)}
            >
              {filter.name}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 p-0 hover:bg-transparent"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteFilter(filter.id);
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
Reglas
Container: Siempre dentro de <Card><CardContent className="p-4">

Layout: flex flex-col gap-4 principal, flex flex-wrap gap-3 para controles

Search Input: relative flex-1 min-w-[200px], icono absolute left-3 top-1/2 -translate-y-1/2

Selects: Ancho fijo w-[160px] o w-[180px]

Botones: variant="outline" className="gap-2"

Toggle Vista: ml-auto para alinear a la derecha

Filtros Guardados: flex flex-wrap gap-2 pt-2 border-t

📋 Sección 3: Tabla de Datos
Estructura Base
tsx
<Card>
  <CardHeader>
    <CardTitle>Título de la Tabla</CardTitle>
    <CardDescription>{data.length} registros encontrados</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="cursor-pointer hover:bg-muted" onClick={() => handleSort('code')}>
              <div className="flex items-center gap-1">
                Código
                {sortField === 'code' && sortOrder === 'asc' && <ChevronUp className="h-4 w-4" />}
                {sortField === 'code' && sortOrder === 'desc' && <ChevronDown className="h-4 w-4" />}
                {sortField !== 'code' && <ArrowUpDown className="h-3 w-3 opacity-50" />}
              </div>
            </TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                No se encontraron registros
              </TableCell>
            </TableRow>
          ) : (
            paginatedData.map((item) => (
              <TableRow key={item.id} className="hover:bg-muted/50 transition-colors">
                <TableCell className="font-mono text-xs">{item.code}</TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Editar</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(item)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Eliminar</TooltipContent>
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
    {totalItems > 0 && (
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Mostrando {startItem} - {endItem} de {totalItems}
          </p>
          <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
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
            {getPageNumbers().map(pageNum => (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(pageNum)}
                className="w-9"
              >
                {pageNum}
              </Button>
            ))}
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
Reglas
Container: rounded-md border alrededor de la tabla

TableHeader: TableRow className="bg-muted/50"

Sorting:

Columnas sortables: className="cursor-pointer hover:bg-muted"

Iconos: ChevronUp/ChevronDown cuando está ordenando, ArrowUpDown cuando no

TableRows: className="hover:bg-muted/50 transition-colors"

Empty State: TableCell colSpan={n} className="h-32 text-center text-muted-foreground"

Acciones: Siempre alineadas a la derecha con text-right y flex justify-end gap-1

Tooltips: Envolver cada acción con TooltipProvider > Tooltip > TooltipTrigger

Botones de acción: variant="ghost" size="icon", eliminar con text-destructive hover:bg-destructive/10

Paginación - Reglas
Layout: flex items-center justify-between mt-4

Info texto: text-sm text-muted-foreground

Items por página: Select con ancho w-[70px]

Botones navegación: variant="outline" size="sm"

Páginas: Botones de w-9, variante default para página actual, outline para las demás

Algoritmo páginas: Mostrar máximo 5 números, con lógica para primeros, intermedios y últimos

tsx
// Función para generar números de página
const getPageNumbers = () => {
  const pages = [];
  const maxVisible = 5;
  
  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else if (currentPage <= 3) {
    for (let i = 1; i <= maxVisible; i++) pages.push(i);
  } else if (currentPage >= totalPages - 2) {
    for (let i = totalPages - maxVisible + 1; i <= totalPages; i++) pages.push(i);
  } else {
    for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i);
  }
  return pages;
};
🎯 Componentes Reutilizables
Badge de Estado
tsx
const statusConfig = {
  draft: {
    label: "Borrador",
    color: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300",
    icon: FileText,
  },
  pending: {
    label: "Pendiente",
    color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400",
    icon: Clock,
  },
  approved: {
    label: "Aprobada",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelada",
    color: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400",
    icon: XCircle,
  },
};

const getStatusBadge = (status: string) => {
  const config = statusConfig[status as keyof typeof statusConfig];
  const Icon = config.icon;
  return (
    <Badge className={`gap-1 ${config.color} border`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};
Tooltip para Acciones
tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="ghost" size="icon" onClick={handler}>
        <Icon className="h-4 w-4" />
      </Button>
    </TooltipTrigger>
    <TooltipContent>Texto de ayuda</TooltipContent>
  </Tooltip>
</TooltipProvider>
Barra de Progreso
tsx
const ProgressBar = ({ value, max, minimumStock, reorderPoint }: Props) => {
  const percentage = Math.min((value / max) * 100, 100);
  let bgColor = "bg-green-500";
  if (value <= minimumStock) bgColor = "bg-red-500";
  else if (value <= reorderPoint) bgColor = "bg-yellow-500";
  
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1">
        <span className="font-medium">{value}</span>
        <span className="text-muted-foreground">/{max}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className={`h-full ${bgColor} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
📱 Responsive Breakpoints
Breakpoint	Clase	Comportamiento
Móvil	(default)	Stack vertical, inputs full width
Tablet	sm:	Grid 2 columnas, selects con ancho fijo
Desktop	lg:	Grid 4 columnas, elementos en línea
Reglas de Ocultamiento
Textos largos: hidden sm:inline para mostrar solo en desktop

Botones de acción: Siempre visibles pero adaptados

Tabla: Scroll horizontal en móvil con overflow-x-auto

🎨 Paleta de Colores Semántica
Rol	Light Mode	Dark Mode
Primary	from-primary/10 to-primary/5	from-primary/20 to-primary/10
Success	bg-emerald-50 text-emerald-700	bg-emerald-950/30 text-emerald-400
Warning	bg-amber-50 text-amber-700	bg-amber-950/30 text-amber-400
Error	bg-rose-50 text-rose-700	bg-rose-950/30 text-rose-400
Info	bg-blue-50 text-blue-700	bg-blue-950/30 text-blue-400
Neutral	bg-gray-50 text-gray-700	bg-gray-800 text-gray-300
⚡ Animaciones y Transiciones
css
/* Transiciones estándar */
transition-all duration-300
transition-colors duration-200
transition-opacity duration-150

/* Hover effects */
hover:shadow-lg
hover:scale-105
hover:bg-muted/50

/* Estados */
group-hover:opacity-100
focus:ring-2 focus:ring-primary focus:ring-offset-2
📝 Checklist de Implementación
Para cada nueva vista:
Header con título y descripción

Grid de stats cards (4 items en desktop, 2 en tablet, 1 en móvil)

Card de filtros con search input y selects

Botón "Limpiar" para resetear filtros

Toggle de vista si aplica (Table/Kanban)

Card de tabla con bordered rounded

Columnas sortables con íconos

Tooltips en todas las acciones

Paginación con control de items por página

Empty state cuando no hay datos

Estados de carga (skeleton)

Modo oscuro soportado (clases dark:)

🚀 Template para Nuevas Vistas
tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Search, Trash2, Save, List, LayoutGrid, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, ArrowUpDown, Edit, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function MyListPage() {
  // Estados
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);

  // Lógica de filtrado y ordenamiento
  const filteredData = useMemo(() => {
    let result = [...data];
    
    // Filtrar
    result = result.filter(item => 
      item.name.toLowerCase().includes(search.toLowerCase())
    );
    
    if (filter !== "all") {
      result = result.filter(item => item.status === filter);
    }
    
    // Ordenar
    result.sort((a, b) => {
      const aVal = a[sortField as keyof typeof a];
      const bVal = b[sortField as keyof typeof b];
      if (typeof aVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });
    
    return result;
  }, [data, search, filter, sortField, sortOrder]);

  // Paginación
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handlers
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setFilter("all");
  };

  // Stats
  const stats = useMemo(() => ({
    total: data.length,
    active: data.filter(i => i.status === "active").length,
    inactive: data.filter(i => i.status === "inactive").length,
  }), [data]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Mi Lista
            </h1>
            <p className="text-muted-foreground">Descripción de la página</p>
          </div>
          <Button className="gap-2">
            Nuevo Item
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-none shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground mt-1">Registros</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Activos</SelectItem>
                    <SelectItem value="inactive">Inactivos</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" onClick={handleClearFilters} className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Limpiar
                </Button>

                <div className="flex gap-1 ml-auto">
                  <Button
                    variant={viewMode === "table" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("table")}
                    className="gap-1"
                  >
                    <List className="h-4 w-4" />
                    <span className="hidden sm:inline">Tabla</span>
                  </Button>
                  <Button
                    variant={viewMode === "kanban" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("kanban")}
                    className="gap-1"
                  >
                    <LayoutGrid className="h-4 w-4" />
                    <span className="hidden sm:inline">Kanban</span>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        {viewMode === "table" && (
          <Card>
            <CardHeader>
              <CardTitle>Listado</CardTitle>
              <CardDescription>{filteredData.length} registros encontrados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="cursor-pointer hover:bg-muted" onClick={() => handleSort('name')}>
                        <div className="flex items-center gap-1">
                          Nombre
                          {sortField === 'name' && sortOrder === 'asc' && <ChevronUp className="h-4 w-4" />}
                          {sortField === 'name' && sortOrder === 'desc' && <ChevronDown className="h-4 w-4" />}
                          {sortField !== 'name' && <ArrowUpDown className="h-3 w-3 opacity-50" />}
                        </div>
                      </TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} className="h-32 text-center text-muted-foreground">
                          No se encontraron registros
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedData.map((item) => (
                        <TableRow key={item.id} className="hover:bg-muted/50 transition-colors">
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Ver detalles</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Editar</TooltipContent>
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
              {filteredData.length > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                      Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredData.length)} de {filteredData.length}
                    </p>
                    <Select value={itemsPerPage.toString()} onValueChange={(v) => { setItemsPerPage(Number(v)); setCurrentPage(1); }}>
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
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum = currentPage;
                        if (totalPages <= 5) pageNum = i + 1;
                        else if (currentPage <= 3) pageNum = i + 1;
                        else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                        else pageNum = currentPage - 2 + i;
                        return (
                          <Button key={pageNum} variant={currentPage === pageNum ? "default" : "outline"} size="sm" onClick={() => setCurrentPage(pageNum)} className="w-9">
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
🔧 Componentes Necesarios (Shadcn/ui)
bash
# Instalar componentes base
npx shadcn-ui@latest add card
npx shadcn-ui@latest add table
npx shadcn-ui@latest add input
npx shadcn-ui@latest add button
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add select
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add tooltip
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add label
npx shadcn-ui@latest add scroll-area
📚 Ejemplos de Referencia
app/inventory/page.tsx - Tabla con progress bars y badges

app/purchase-orders/approve/page.tsx - Vista de aprobación con stats y filtros

app/products/page.tsx - CRUD completo con diálogos

*Última actualización: 2026-06-07*
Versión de la guía: 1.0.0
