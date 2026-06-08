"use client";

import { useState, useMemo, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Calendar,
  Warehouse,
  Package,
  FileText,
  Building2,
  Check,
  X,
  Loader2,
  AlertTriangle,
  TrendingUp,
  ChevronRight,
  GitBranch,
  ChevronDown,
  ChevronUp,
  Zap,
  Shield,
  AlertOctagon,
  Hourglass,
  LayoutGrid,
  List,
  Filter,
  Save,
  Trash2,
  MoreVertical,
  Send,
  RefreshCw,
  Bell,
  DollarSign,
  Lightbulb,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { usePurchaseOrders } from "@/hooks/inventory-hooks/use-purchaseOrder";
import { useSuppliers } from "@/hooks/inventory-hooks/use-suppliers";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

// Configuración de estados mejorada
const statusConfig = {
  draft: {
    label: "Borrador",
    color: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300",
    icon: FileText,
    description: "Orden en creación",
    gradient: "from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800",
    nextActions: ["pending", "cancelled"],
  },
  pending: {
    label: "Pendiente",
    color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400",
    icon: Clock,
    description: "Esperando aprobación",
    gradient: "from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20",
    nextActions: ["approved", "cancelled"],
  },
  approved: {
    label: "Aprobada",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400",
    icon: CheckCircle,
    description: "Aprobada para continuar",
    gradient: "from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20",
    nextActions: ["cancelled"],
  },
  cancelled: {
    label: "Cancelada",
    color: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400",
    icon: XCircle,
    description: "Orden cancelada",
    gradient: "from-rose-50 to-red-50 dark:from-rose-950/20 dark:to-red-950/20",
    nextActions: [],
  },
  received: {
    label: "Recibida",
    color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400",
    icon: Package,
    description: "Completamente recibida",
    gradient: "from-blue-50 to-sky-50 dark:from-blue-950/20 dark:to-sky-950/20",
    nextActions: [],
  },
};

// Prioridades
const priorities = [
  { value: "high", label: "Alta", color: "text-red-600 bg-red-50", icon: AlertOctagon },
  { value: "medium", label: "Media", color: "text-amber-600 bg-amber-50", icon: AlertTriangle },
  { value: "low", label: "Baja", color: "text-blue-600 bg-blue-50", icon: Shield },
];

// Componente de tarjeta Kanban
const KanbanCard = ({ order, supplier, onView, onAction, getStatusBadge, getTotalItems }: any) => {
  const daysWaiting = Math.floor(
    (new Date().getTime() - new Date(order.orderDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-primary">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-medium text-muted-foreground">
                #{order.orderNumber}
              </span>
              {getStatusBadge(order.status)}
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm font-medium">{supplier?.name || "N/A"}</span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(order)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver detalles
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Monto:</span>
            <span className="font-bold text-primary">
              Q{(order.totalAmount || 0).toLocaleString("es-GT", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Productos:</span>
            <span>{getTotalItems(order)} unidades</span>
          </div>

          {daysWaiting > 0 && (
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Hourglass className="h-3 w-3" />
                <span>Espera:</span>
              </div>
              <Badge variant={daysWaiting > 7 ? "destructive" : "secondary"} className="text-xs">
                {daysWaiting} días
              </Badge>
            </div>
          )}

          <div className="pt-2 flex gap-2">
            {statusConfig[order.status as keyof typeof statusConfig]?.nextActions.map((action) => {
              const actionConfig = {
                approved: { label: "Aprobar", icon: CheckCircle, color: "bg-emerald-600 hover:bg-emerald-700" },
                cancelled: { label: "Rechazar", icon: XCircle, color: "bg-rose-600 hover:bg-rose-700" },
                pending: { label: "Enviar", icon: Send, color: "bg-amber-600 hover:bg-amber-700" },
              }[action];

              if (!actionConfig) return null;

              return (
                <Button
                  key={action}
                  size="sm"
                  className={`flex-1 ${actionConfig.color} text-white`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAction(order, { action, label: actionConfig.label });
                  }}
                >
                  <actionConfig.icon className="mr-1 h-3 w-3" />
                  {actionConfig.label}
                </Button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function ApprovePurchaseOrdersPage() {
  const {
    purchaseOrders,
    isLoading,
    error,
    fetchPurchaseOrders,
    updatePurchaseOrder,
  } = usePurchaseOrders();

  const { suppliers } = useSuppliers();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<{
    action: string;
    label: string;
  } | null>(null);
  const [actionComment, setActionComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<any>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [savedFilters, setSavedFilters] = useState<any[]>([]);
  const [filterName, setFilterName] = useState("");

  // Cargar filtros guardados del localStorage al iniciar
  useEffect(() => {
    const saved = localStorage.getItem("savedPurchaseFilters");
    if (saved) {
      try {
        setSavedFilters(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading saved filters:", e);
      }
    }
  }, []);

  // Guardar filtros en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem("savedPurchaseFilters", JSON.stringify(savedFilters));
  }, [savedFilters]);

  // Filtrar órdenes
  const filterableOrders = useMemo(() => {
    if (!purchaseOrders.length) return [];

    return purchaseOrders.filter((order) => {
      const supplier = suppliers.find((s) => s.id === order.supplierId);

      const matchesSearch =
        order.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
        order.notes?.toLowerCase().includes(search.toLowerCase()) ||
        supplier?.name?.toLowerCase().includes(search.toLowerCase()) ||
        false;

      const matchesStatus = statusFilter === "all" || order.status === statusFilter;

      // Prioridad simulada basada en monto y tiempo
      const daysWaiting = (new Date().getTime() - new Date(order.orderDate).getTime()) / (1000 * 60 * 60 * 24);
      let priority = "medium";
      if (order.totalAmount > 50000 || daysWaiting > 7) priority = "high";
      if (order.totalAmount < 10000 && daysWaiting < 3) priority = "low";

      const matchesPriority = priorityFilter === "all" || priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [purchaseOrders, search, statusFilter, priorityFilter, suppliers]);

  // Estadísticas avanzadas
  const approvalStats = useMemo(() => {
    const total = purchaseOrders.filter(o =>
      ["draft", "pending", "approved"].includes(o.status)
    ).length;
    const pending = purchaseOrders.filter((o) => o.status === "pending").length;
    const approved = purchaseOrders.filter((o) => o.status === "approved").length;
    const draft = purchaseOrders.filter((o) => o.status === "draft").length;
    const cancelled = purchaseOrders.filter((o) => o.status === "cancelled").length;

    const avgTimeToApprove = purchaseOrders
      .filter(o => o.status === "approved" && (o as any).updatedAt)
      .reduce((acc, o) => {
        const days = (new Date((o as any).updatedAt).getTime() - new Date(o.orderDate).getTime()) / (1000 * 60 * 60 * 24);
        return acc + days;
      }, 0) / (purchaseOrders.filter(o => o.status === "approved").length || 1);

    const totalValue = purchaseOrders
      .filter(o => o.status === "approved")
      .reduce((acc, o) => acc + (o.totalAmount || 0), 0);

    return {
      pending,
      draft,
      approved,
      cancelled,
      total,
      completionRate: total > 0 ? parseFloat(((approved / total) * 100).toFixed(1)) : 0,
      avgTimeToApprove: avgTimeToApprove.toFixed(1),
      totalValue,
      urgencyCount: purchaseOrders.filter(o =>
        o.status === "pending" &&
        (o.totalAmount > 50000 ||
          (new Date().getTime() - new Date(o.orderDate).getTime()) / (1000 * 60 * 60 * 24) > 5)
      ).length,
    };
  }, [purchaseOrders]);

  // Agrupar órdenes por estado para Kanban
  const kanbanGroups = useMemo(() => {
    const groups: Record<string, any[]> = {
      draft: [],
      pending: [],
      approved: [],
    };

    filterableOrders.forEach(order => {
      if (groups[order.status]) {
        groups[order.status].push(order);
      }
    });

    return groups;
  }, [filterableOrders]);

  const handleOpenAction = (order: any, action: { action: string; label: string }) => {
    setSelectedOrder(order);
    setSelectedAction(action);
    setActionComment("");
    setIsActionDialogOpen(true);
  };

  const handleSubmitAction = async () => {
    if (!selectedOrder || !selectedAction) return;

    setIsSubmitting(true);
    try {
      const updatedOrder = {
        ...selectedOrder,
        status: selectedAction.action,
        notes: actionComment
          ? `${selectedOrder.notes || ""}\n[${new Date().toLocaleString("es-GT")}] ${selectedAction.label}: ${actionComment}`
          : selectedOrder.notes,
      };

      await updatePurchaseOrder(selectedOrder.id, updatedOrder);
      setIsActionDialogOpen(false);
      setSelectedOrder(null);
      setSelectedAction(null);
      setActionComment("");
      await fetchPurchaseOrders();
    } catch (error) {
      console.error("Error updating order:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = (order: any) => {
    setSelectedOrderDetail(order);
    setIsDetailDialogOpen(true);
  };

  const handleSaveFilter = () => {
    if (filterName.trim()) {
      const newFilter = {
        id: Date.now(),
        name: filterName,
        search,
        statusFilter,
        priorityFilter,
        createdAt: new Date().toISOString(),
      };
      setSavedFilters([...savedFilters, newFilter]);
      setFilterName("");
    }
  };

  const handleLoadFilter = (filter: any) => {
    setSearch(filter.search);
    setStatusFilter(filter.statusFilter);
    setPriorityFilter(filter.priorityFilter);
  };

  const handleDeleteFilter = (filterId: number) => {
    setSavedFilters(savedFilters.filter(f => f.id !== filterId));
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;
    return (
      <Badge className={`gap-1 ${config.color} border`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getTotalItems = (order: any) => {
    return order?.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
  };

  if (isLoading && !purchaseOrders.length) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header mejorado */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-gradient-to-br from-primary to-primary/70 rounded-xl shadow-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Aprobación de Órdenes
                </h1>
                <p className="text-muted-foreground">
                  Gestiona y revisa las órdenes de compra pendientes de aprobación
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => fetchPurchaseOrders()} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Actualizar
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" className="gap-2 relative">
                    <Bell className="h-4 w-4" />
                    Notificaciones
                    {approvalStats.urgencyCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                        {approvalStats.urgencyCount}
                      </span>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {approvalStats.urgencyCount} órdenes urgentes por revisar
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Stats Cards Avanzados */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-none shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
                  <p className="text-3xl font-bold">{approvalStats.pending}</p>
                  <p className="text-xs text-muted-foreground mt-1">Esperando revisión</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-none shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tasa de Aprobación</p>
                  <p className="text-3xl font-bold">{approvalStats.completionRate}%</p>
                  <Progress value={approvalStats.completionRate} className="mt-2 h-1.5" />
                </div>
                <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-none shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tiempo Promedio</p>
                  <p className="text-3xl font-bold">{approvalStats.avgTimeToApprove}</p>
                  <p className="text-xs text-muted-foreground mt-1">días en aprobar</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Hourglass className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-none shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Valor Aprobado</p>
                  <p className="text-2xl font-bold">Q{approvalStats.totalValue.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">Total en órdenes</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros Avanzados con botón de flujo integrado */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por número, proveedor o notas..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[160px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="approved">Aprobada</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-[160px]">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {priorities.map(p => (
                      <SelectItem key={p.value} value={p.value}>
                        <div className="flex items-center gap-2">
                          <p.icon className="h-3 w-3" />
                          {p.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                    setPriorityFilter("all");
                  }} className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Limpiar
                  </Button>

                  {/* Botón de ayuda para el flujo */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <GitBranch className="h-4 w-4" />
                        <span className="hidden sm:inline">Flujo</span>
                        <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-primary/10 text-primary text-[10px] font-bold ml-1">
                          ?
                        </span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-primary/10">
                            <GitBranch className="h-5 w-5 text-primary" />
                          </div>
                          Flujo de Aprobación de Órdenes
                        </DialogTitle>
                        <DialogDescription>
                          Visualiza el proceso completo de aprobación y las acciones disponibles en cada estado
                        </DialogDescription>
                      </DialogHeader>

                      <div className="py-6">
                        <div className="relative">
                          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 -translate-y-1/2 hidden lg:block" />
                          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6">
                            {[
                              { status: "draft", label: "Borrador", icon: FileText, color: "gray", description: "Creación inicial", actions: ["Enviar a aprobación", "Cancelar"] },
                              { status: "pending", label: "Pendiente", icon: Clock, color: "amber", description: "Espera revisión", actions: ["Aprobar", "Rechazar"] },
                              { status: "approved", label: "Aprobada", icon: CheckCircle, color: "emerald", description: "Orden autorizada", actions: ["Cancelar"] },
                              { status: "received", label: "Recibida", icon: Package, color: "blue", description: "Completada", actions: [] },
                            ].map((step, idx, arr) => {
                              const getGradientClass = () => {
                                const gradients = {
                                  gray: "from-gray-50 to-gray-100 dark:from-gray-950/30 dark:to-gray-950/20",
                                  amber: "from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/20",
                                  emerald: "from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/20",
                                  blue: "from-blue-50 to-sky-50 dark:from-blue-950/30 dark:to-sky-950/20",
                                };
                                return gradients[step.color as keyof typeof gradients] || gradients.gray;
                              };

                              const getIconColorClass = () => {
                                const colors = {
                                  gray: "text-gray-600",
                                  amber: "text-amber-600",
                                  emerald: "text-emerald-600",
                                  blue: "text-blue-600",
                                };
                                return colors[step.color as keyof typeof colors] || colors.gray;
                              };

                              return (
                                <div key={step.status} className="relative flex-1 text-center z-10">
                                  <div className="inline-flex flex-col items-center">
                                    <div className={cn(
                                      "w-20 h-20 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg mb-3 transition-all hover:scale-105",
                                      getGradientClass()
                                    )}>
                                      <step.icon className={cn("h-8 w-8", getIconColorClass())} />
                                    </div>
                                    <p className="font-semibold text-base">{step.label}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                                    <div className="mt-2 flex flex-wrap justify-center gap-1">
                                      {step.actions.map(action => (
                                        <Badge key={action} variant="secondary" className="text-[10px]">
                                          {action}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                  {idx < arr.length - 1 && (
                                    <div className="hidden lg:block absolute -right-8 top-10">
                                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Leyenda adicional */}
                        <div className="mt-8 pt-6 border-t">
                          <h4 className="text-sm font-semibold mb-3">Leyenda de acciones</h4>
                          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-emerald-500" />
                              <span className="text-muted-foreground">Acción positiva</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-rose-500" />
                              <span className="text-muted-foreground">Acción negativa</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-amber-500" />
                              <span className="text-muted-foreground">Acción de transición</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-blue-500" />
                              <span className="text-muted-foreground">Estado final</span>
                            </div>
                          </div>
                        </div>

                        {/* Tips adicionales */}
                        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                          <div className="flex items-start gap-3">
                            <Lightbulb className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                              <p className="text-sm font-medium mb-1">Tips rápidos:</p>
                              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                                <li>Las órdenes en estado <strong>Borrador</strong> pueden ser editadas completamente</li>
                                <li>Una vez <strong>Aprobada</strong>, la orden pasa al área de recepción</li>
                                <li>Las órdenes <strong>Canceladas</strong> no pueden ser reactivadas</li>
                                <li>Puedes agregar comentarios en cada acción para mantener trazabilidad</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>

                      <DialogFooter>
                        <Button onClick={() => { }} variant="outline">
                          Entendido
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* Botón guardar filtro */}
                  <Dialog>
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
                            {statusFilter !== "all" && <div>📊 Estado: {statusFilter === "pending" ? "Pendiente" : statusFilter === "approved" ? "Aprobada" : statusFilter}</div>}
                            {priorityFilter !== "all" && <div>⚠️ Prioridad: {priorityFilter === "high" ? "Alta" : priorityFilter === "medium" ? "Media" : "Baja"}</div>}
                            {!search && statusFilter === "all" && priorityFilter === "all" && (
                              <div className="text-muted-foreground">Mostrando todas las órdenes</div>
                            )}
                          </div>
                        </div>
                        <div>
                          <Label>Nombre del filtro</Label>
                          <Input
                            value={filterName}
                            onChange={(e) => setFilterName(e.target.value)}
                            placeholder="Ej: Órdenes urgentes de alto monto"
                            className="mt-1"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Usa un nombre descriptivo para identificar fácilmente este filtro después
                          </p>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setFilterName("")}>
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

                {/* Vista toggle */}
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

              {/* Filtros guardados */}
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

        {/* Vista de contenido */}
        {viewMode === "table" ? (
          <Card>
            <CardHeader>
              <CardTitle>Órdenes para revisión</CardTitle>
              <CardDescription>
                {filterableOrders.length} {filterableOrders.length === 1 ? "orden" : "órdenes"} encontrada{filterableOrders.length !== 1 && "s"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filterableOrders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <CheckCircle className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No hay órdenes para revisar</h3>
                  <p className="text-muted-foreground">
                    Todas las órdenes han sido procesadas o no hay órdenes pendientes
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Número de Orden</TableHead>
                        <TableHead>Proveedor</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Prioridad</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filterableOrders.map((order) => {
                        const supplier = suppliers.find((s) => s.id === order.supplierId);
                        const daysWaiting = Math.floor(
                          (new Date().getTime() - new Date(order.orderDate).getTime()) / (1000 * 60 * 60 * 24)
                        );

                        let priority = { value: "medium", label: "Media", color: "text-amber-600 bg-amber-50", icon: AlertTriangle };
                        if (order.totalAmount > 50000 || daysWaiting > 7) {
                          priority = { value: "high", label: "Alta", color: "text-red-600 bg-red-50", icon: AlertOctagon };
                        } else if (order.totalAmount < 10000 && daysWaiting < 3) {
                          priority = { value: "low", label: "Baja", color: "text-blue-600 bg-blue-50", icon: Shield };
                        }

                        const PriorityIcon = priority.icon;

                        return (
                          <TableRow key={order.id} className="group hover:bg-muted/50 transition-colors">
                            <TableCell className="font-medium">
                              <div className="flex flex-col">
                                <span className="font-mono text-sm">{order.orderNumber}</span>
                                <span className="text-xs text-muted-foreground">
                                  {getTotalItems(order)} productos
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs">
                                    {supplier?.name?.charAt(0) || "N"}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{supplier?.name || "N/A"}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                  {new Date(order.orderDate).toLocaleDateString("es-GT")}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex flex-col items-end">
                                <span className="font-bold">
                                  Q{(order.totalAmount || 0).toLocaleString("es-GT", { minimumFractionDigits: 2 })}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(order.status)}</TableCell>
                            <TableCell>
                              <Badge className={`gap-1 ${priority.color} border-0`}>
                                <PriorityIcon className="h-3 w-3" />
                                {priority.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleViewDetails(order)}
                                        className="h-8 w-8 p-0"
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Ver detalles</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>

                                {statusConfig[order.status as keyof typeof statusConfig]?.nextActions.map((action) => {
                                  const actionConfig = {
                                    approved: { label: "Aprobar", icon: CheckCircle, color: "success" },
                                    cancelled: { label: "Rechazar", icon: XCircle, color: "destructive" },
                                    pending: { label: "Enviar", icon: Send, color: "warning" },
                                  }[action];

                                  if (!actionConfig) return null;

                                  const colorClass = actionConfig.color === "success"
                                    ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                    : actionConfig.color === "destructive"
                                      ? "text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                      : "text-amber-600 hover:text-amber-700 hover:bg-amber-50";

                                  return (
                                    <Tooltip key={action}>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleOpenAction(order, { action, label: actionConfig.label })}
                                          className={`h-8 w-8 p-0 ${colorClass}`}
                                        >
                                          <actionConfig.icon className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>{actionConfig.label}</TooltipContent>
                                    </Tooltip>
                                  );
                                })}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {Object.entries(kanbanGroups).map(([status, orders]) => (
              <div key={status} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(status)}
                    <span className="text-sm text-muted-foreground">
                      ({orders.length})
                    </span>
                  </div>
                </div>
                <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                  {orders.map((order) => {
                    const supplier = suppliers.find((s) => s.id === order.supplierId);
                    return (
                      <KanbanCard
                        key={order.id}
                        order={order}
                        supplier={supplier}
                        onView={handleViewDetails}
                        onAction={handleOpenAction}
                        getStatusBadge={getStatusBadge}
                        getTotalItems={getTotalItems}
                      />
                    );
                  })}
                  {orders.length === 0 && (
                    <Card className="border-dashed">
                      <CardContent className="p-8 text-center text-muted-foreground">
                        <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No hay órdenes</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Diálogo de acción */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[500px] p-0 flex flex-col"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}>
          {selectedAction && selectedOrder && (
            <>
              {/* Header con gradiente según la acción */}
              <div className={cn(
                "p-5 pb-3 rounded-t-lg",
                selectedAction.action === "approved" && "bg-gradient-to-r from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20",
                selectedAction.action === "cancelled" && "bg-gradient-to-r from-rose-50 to-rose-100/50 dark:from-rose-950/30 dark:to-rose-900/20",
                selectedAction.action === "pending" && "bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20"
              )}>
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "p-2 rounded-full shrink-0",
                    selectedAction.action === "approved" && "bg-emerald-100 dark:bg-emerald-900/50",
                    selectedAction.action === "cancelled" && "bg-rose-100 dark:bg-rose-900/50",
                    selectedAction.action === "pending" && "bg-amber-100 dark:bg-amber-900/50"
                  )}>
                    {selectedAction.action === "approved" && <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
                    {selectedAction.action === "cancelled" && <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />}
                    {selectedAction.action === "pending" && <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
                  </div>
                  <div className="flex-1">
                    <DialogTitle className="text-lg font-semibold">
                      {selectedAction.label}
                    </DialogTitle>
                    <DialogDescription className="text-sm mt-0.5">
                      ¿Estás seguro de que deseas {selectedAction.label.toLowerCase()} la orden?
                    </DialogDescription>
                  </div>
                </div>
              </div>

              {/* Contenido scrollable */}
              <div className="flex-1 px-5 py-4">
                <div className="space-y-4">
                  {/* Información de la orden */}
                  <Card className="shadow-sm border">
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Orden:</span>
                        <span className="font-mono font-medium text-sm bg-muted/50 px-2 py-0.5 rounded">
                          {selectedOrder.orderNumber}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Proveedor:</span>
                        <span className="font-medium truncate ml-2">
                          {suppliers.find((s) => s.id === selectedOrder.supplierId)?.name || "N/A"}
                        </span>
                      </div>
                      <Separator className="my-1" />
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Monto total:</span>
                        <span className="text-lg font-bold text-primary">
                          Q{(selectedOrder.totalAmount || 0).toLocaleString("es-GT", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Productos:</span>
                        <span className="font-medium">{getTotalItems(selectedOrder)} unidades</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Comentario */}
                  <div className="space-y-1.5">
                    <Label htmlFor="comment" className="text-sm font-medium">
                      Comentario {selectedAction.action === "cancelled" &&
                        <span className="text-xs text-muted-foreground font-normal">(opcional)</span>
                      }
                    </Label>
                    <Textarea
                      id="comment"
                      placeholder={
                        selectedAction.action === "approved"
                          ? "Ej: Revisión de inventario completada, proceder con la orden..."
                          : selectedAction.action === "cancelled"
                            ? "Ej: Proveedor no cumple con requisitos, orden cancelada..."
                            : "Ej: Enviar a aprobación para revisión del equipo..."
                      }
                      value={actionComment}
                      onChange={(e) => setActionComment(e.target.value)}
                      rows={3}
                      className="resize-none text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <DialogFooter className="shrink-0 border-t bg-background p-4 gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsActionDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmitAction}
                  disabled={isSubmitting}
                  className={cn(
                    "gap-2 min-w-[120px]",
                    selectedAction.action === "approved" && "bg-emerald-600 hover:bg-emerald-700",
                    selectedAction.action === "cancelled" && "bg-rose-600 hover:bg-rose-700",
                    selectedAction.action === "pending" && "bg-amber-600 hover:bg-amber-700"
                  )}
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {!isSubmitting && <Check className="h-4 w-4" />}
                  Confirmar {selectedAction.label}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo de detalles */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent
          className="w-[95vw] max-w-[1200px] h-[85vh] p-0 flex flex-col"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          {selectedOrderDetail && (
            <>
              <DialogHeader className="p-5 pb-3 shrink-0 border-b">
                <div className="flex items-center justify-between pr-10">
                  <DialogTitle className="text-xl">
                    Detalles de la Orden
                  </DialogTitle>
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Orden:</span>
                    <span className="font-mono font-semibold text-sm bg-muted/50 px-2 py-0.5 rounded">
                      {selectedOrderDetail.orderNumber}
                    </span>
                  </div>
                  {getStatusBadge(selectedOrderDetail.status)}
                </div>
              </DialogHeader>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto px-5 py-4">
                <div className="space-y-5">
                  {/* Información del Proveedor y Entrega */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Información del Proveedor */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5" />
                        Información del Proveedor
                      </h4>
                      <div className="bg-muted/30 rounded-lg p-3 space-y-1.5">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Nombre:</span>
                          <span className="font-medium">
                            {suppliers.find((s) => s.id === selectedOrderDetail.supplierId)?.name || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Email:</span>
                          <span className="text-sm">
                            {suppliers.find((s) => s.id === selectedOrderDetail.supplierId)?.email || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Información de Entrega */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                        <Warehouse className="h-3.5 w-3.5" />
                        Información de Entrega
                      </h4>
                      <div className="bg-muted/30 rounded-lg p-3 space-y-1.5">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Bodega destino:</span>
                          <span className="font-medium">{selectedOrderDetail.warehouseName || "N/A"}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Fecha esperada:</span>
                          <span>
                            {selectedOrderDetail.expectedDate
                              ? new Date(selectedOrderDetail.expectedDate).toLocaleDateString("es-GT")
                              : "No definida"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-1" />

                  {/* Productos */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                        <Package className="h-3.5 w-3.5" />
                        Productos ({selectedOrderDetail.items?.length || 0})
                      </h4>
                      <Badge variant="secondary" className="text-[10px]">
                        Total: {selectedOrderDetail.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0} unidades
                      </Badge>
                    </div>

                    <div className="rounded-md border overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="min-w-[250px] text-xs">Producto</TableHead>
                            <TableHead className="text-right min-w-[80px] text-xs">Cantidad</TableHead>
                            <TableHead className="text-right min-w-[120px] text-xs">Costo Unitario</TableHead>
                            <TableHead className="text-right min-w-[120px] text-xs">Subtotal</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(selectedOrderDetail.items || []).map((item: any) => (
                            <TableRow key={item.id} className="hover:bg-muted/50">
                              <TableCell className="py-2">
                                <div>
                                  <div className="font-medium text-sm">{item.productName}</div>
                                  <div className="text-xs text-muted-foreground font-mono">Código: {item.productCode}</div>
                                </div>
                              </TableCell>
                              <TableCell className="text-right py-2">
                                <span className="font-mono text-sm">{item.quantity}</span>
                              </TableCell>
                              <TableCell className="text-right py-2 text-sm">
                                Q{(item.unitCost || 0).toFixed(2)}
                              </TableCell>
                              <TableCell className="text-right py-2 font-medium text-sm">
                                Q{((item.quantity || 0) * (item.unitCost || 0)).toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Total General */}
                  <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs text-muted-foreground">Total de la Orden</p>
                          <p className="text-2xl font-bold text-primary">
                            Q{(selectedOrderDetail.totalAmount || 0).toLocaleString("es-GT", { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Estado actual</p>
                          <div className="mt-1">{getStatusBadge(selectedOrderDetail.status)}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Notas */}
                  {selectedOrderDetail.notes && (
                    <Card className="bg-muted/30 shadow-sm">
                      <CardHeader className="pb-0 pt-1">
                        <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                          Notas adicionales
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 pb-1">
                        <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                          {selectedOrderDetail.notes}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              {/* Footer siempre visible */}
              <DialogFooter className="shrink-0 border-t bg-background p-4 gap-2">
                <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                  Cerrar
                </Button>
                {statusConfig[selectedOrderDetail.status as keyof typeof statusConfig]?.nextActions.map((action) => {
                  const actionConfig = {
                    approved: { label: "Aprobar", icon: CheckCircle, color: "bg-emerald-600 hover:bg-emerald-700" },
                    cancelled: { label: "Rechazar", icon: XCircle, color: "bg-rose-600 hover:bg-rose-700" },
                    pending: { label: "Enviar", icon: Send, color: "bg-amber-600 hover:bg-amber-700" },
                  }[action];

                  if (!actionConfig) return null;

                  const Icon = actionConfig.icon;

                  return (
                    <Button
                      key={action}
                      onClick={() => {
                        setIsDetailDialogOpen(false);
                        handleOpenAction(selectedOrderDetail, { action, label: actionConfig.label });
                      }}
                      className={actionConfig.color}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {actionConfig.label}
                    </Button>
                  );
                })}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}