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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { usePurchaseOrders } from "@/hooks/inventory-hooks/use-purchaseOrder";
import { useSuppliers } from "@/hooks/inventory-hooks/use-suppliers";
import { cn } from "@/lib/utils";

// Configuración de estados en español
const statusConfig = {
  draft: {
    label: "Borrador",
    color: "bg-gray-100 text-gray-700 border-gray-200",
    icon: FileText,
    description: "Orden en creación",
  },
  pending: {
    label: "Pendiente",
    color: "bg-yellow-50 text-yellow-700 border-yellow-200",
    icon: Clock,
    description: "Esperando aprobación",
  },
  approved: {
    label: "Aprobada",
    color: "bg-green-50 text-green-700 border-green-200",
    icon: CheckCircle,
    description: "Aprobada para continuar",
  },
  cancelled: {
    label: "Cancelada",
    color: "bg-red-50 text-red-700 border-red-200",
    icon: XCircle,
    description: "Orden cancelada",
  },
  received: {
    label: "Recibida",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Package,
    description: "Completamente recibida",
  },
};

// Acciones permitidas por estado actual
const availableActions = {
  pending: [
    {
      action: "approved",
      label: "Aprobar",
      icon: CheckCircle,
      color: "success",
    },
    {
      action: "cancelled",
      label: "Rechazar",
      icon: XCircle,
      color: "destructive",
    },
  ],
  draft: [
    {
      action: "pending",
      label: "Enviar a Aprobación",
      icon: Clock,
      color: "warning",
    },
    {
      action: "cancelled",
      label: "Cancelar",
      icon: XCircle,
      color: "destructive",
    },
  ],
  approved: [
    {
      action: "cancelled",
      label: "Cancelar",
      icon: XCircle,
      color: "destructive",
    },
  ],
  received: [],
  cancelled: [],
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
  const [showFlow, setShowFlow] = useState(false);

  // Filtrar órdenes (solo mostrar las que pueden ser aprobadas/rechazadas)
  const filterableOrders = useMemo(() => {
    if (!purchaseOrders.length) return [];

    return purchaseOrders.filter((order) => {
      // Solo mostrar órdenes que tienen acciones disponibles
      const actions =
        availableActions[order.status as keyof typeof availableActions];
      if (!actions || actions.length === 0) return false;

      const matchesSearch =
        order.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
        order.notes?.toLowerCase().includes(search.toLowerCase()) ||
        suppliers
          .find((s) => s.id === order.supplierId)
          ?.name?.toLowerCase()
          .includes(search.toLowerCase()) ||
        false;

      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [purchaseOrders, search, statusFilter, suppliers]);

  // Estadísticas para aprobación
  const approvalStats = useMemo(() => {
    const pending = purchaseOrders.filter((o) => o.status === "pending").length;
    const draft = 2; // purchaseOrders.filter((o) => o.status === "draft").length;
    const approved = purchaseOrders.filter(
      (o) => o.status === "approved",
    ).length;
    const total = pending + draft;

    return {
      pending,
      draft,
      approved,
      total,
      completionRate: total > 0 ? ((approved / total) * 100).toFixed(1) : 0,
    };
  }, [purchaseOrders]);

  const handleOpenAction = (
    order: any,
    action: { action: string; label: string },
  ) => {
    setSelectedOrder(order);
    setSelectedAction(action);
    setActionComment("");
    setIsActionDialogOpen(true);
  };

  const handleSubmitAction = async () => {
    if (!selectedOrder || !selectedAction) return;

    setIsSubmitting(true);
    try {
      // Actualizar el estado de la orden
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

  const getStatusBadge = (status: string) => {
    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;
    return (
      <Badge className={`gap-1 ${config.color} border`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getTotalItems = (order: any) => {
    return (
      order?.items?.reduce(
        (sum: number, item: any) => sum + item.quantity,
        0,
      ) || 0
    );
  };

  if (isLoading && !purchaseOrders.length) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Loader2 className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <p className="mt-4 text-muted-foreground">
              Cargando órdenes de compra...
            </p>
          </div>
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
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Aprobación de Órdenes de Compra
                </h1>
                <p className="text-muted-foreground">
                  Revisa, aprueba o rechaza las órdenes de compra pendientes
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500">
                    Pendientes
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {approvalStats.pending}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Esperando aprobación
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <FileText className="h-8 w-8 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500">
                    Borradores
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {approvalStats.draft}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    En proceso de creación
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500">Aprobadas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {approvalStats.approved}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Listas para recibir
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500">
                    Tasa de Aprobación
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {approvalStats.completionRate}%
                  </p>
                  <div className="mt-1">
                    <Progress
                      value={parseFloat(
                        approvalStats.completionRate.toString(),
                      )}
                      className="h-1.5"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Diagrama de flujo elegante - Colapsable */}
        <Card className="border-0 bg-white shadow-sm">
          <CardHeader
            className="pb-2 cursor-pointer hover:bg-muted/50 transition-colors rounded-t-lg"
            onClick={() => setShowFlow(!showFlow)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <GitBranch className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-sm font-medium">
                  Flujo de aprobación
                </CardTitle>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                {showFlow ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          {showFlow && (
            <CardContent className="p-4 pt-0">
              {/* Contenido del diagrama (sin cambios) */}
              <div className="flex items-center justify-between">
                {/* Borrador */}
                <div className="flex-1">
                  <div className="relative flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 flex items-center justify-center shadow-sm">
                      <FileText className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="mt-2 text-center">
                      <p className="font-semibold text-gray-800 text-sm">
                        1. Borrador
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Creación inicial
                      </p>
                    </div>
                    <div className="absolute -right-8 top-5 hidden lg:block">
                      <div className="flex items-center gap-1">
                        <div className="w-8 h-0.5 bg-gradient-to-r from-gray-300 to-gray-400" />
                        <ChevronRight className="h-3 w-3 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-center gap-1">
                    <div className="px-1.5 py-0.5 bg-yellow-50 rounded-md flex items-center gap-0.5">
                      <Clock className="h-2.5 w-2.5 text-yellow-600" />
                      <span className="text-[10px] text-yellow-700">
                        Enviar
                      </span>
                    </div>
                    <div className="px-1.5 py-0.5 bg-red-50 rounded-md flex items-center gap-0.5">
                      <XCircle className="h-2.5 w-2.5 text-red-600" />
                      <span className="text-[10px] text-red-700">Cancelar</span>
                    </div>
                  </div>
                </div>

                {/* Pendiente */}
                <div className="flex-1">
                  <div className="relative flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300 flex items-center justify-center shadow-sm">
                      <Clock className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="mt-2 text-center">
                      <p className="font-semibold text-yellow-700 text-sm">
                        2. Pendiente
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Espera revisión
                      </p>
                    </div>
                    <div className="absolute -right-8 top-5 hidden lg:block">
                      <div className="flex items-center gap-1">
                        <div className="w-8 h-0.5 bg-gradient-to-r from-gray-300 to-gray-400" />
                        <ChevronRight className="h-3 w-3 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-center gap-1">
                    <div className="px-1.5 py-0.5 bg-green-50 rounded-md flex items-center gap-0.5">
                      <CheckCircle className="h-2.5 w-2.5 text-green-600" />
                      <span className="text-[10px] text-green-700">
                        Aprobar
                      </span>
                    </div>
                    <div className="px-1.5 py-0.5 bg-red-50 rounded-md flex items-center gap-0.5">
                      <XCircle className="h-2.5 w-2.5 text-red-600" />
                      <span className="text-[10px] text-red-700">Rechazar</span>
                    </div>
                  </div>
                </div>

                {/* Aprobada */}
                <div className="flex-1">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 flex items-center justify-center shadow-sm">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="mt-2 text-center">
                      <p className="font-semibold text-green-700 text-sm">
                        3. Aprobada
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Orden autorizada
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-center">
                    <div className="px-1.5 py-0.5 bg-red-50 rounded-md flex items-center gap-0.5">
                      <XCircle className="h-2.5 w-2.5 text-red-600" />
                      <span className="text-[10px] text-red-700">Cancelar</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Leyenda adicional */}
              <div className="mt-4 pt-3 border-t">
                <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    <span>Acción positiva</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span>Acción negativa</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                    <span>Acción de transición</span>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Filtros */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por número de orden, proveedor o notas..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="approved">Aprobada</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de órdenes */}
        <Card>
          <CardHeader>
            <CardTitle>Órdenes para revisión</CardTitle>
            <CardDescription>
              {filterableOrders.length}{" "}
              {filterableOrders.length === 1 ? "orden" : "órdenes"} encontrada
              {filterableOrders.length !== 1 && "s"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filterableOrders.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <CheckCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  No hay órdenes para revisar
                </h3>
                <p className="text-muted-foreground">
                  Todas las órdenes han sido procesadas o no hay órdenes
                  pendientes
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número de Orden</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead>Estado Actual</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filterableOrders.map((order) => {
                    const supplier = suppliers.find(
                      (s) => s.id === order.supplierId,
                    );
                    const actions =
                      availableActions[
                        order.status as keyof typeof availableActions
                      ];

                    return (
                      <TableRow key={order.id} className="group">
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span className="font-mono text-sm">
                              {order.orderNumber}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {getTotalItems(order)} productos
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span>{supplier?.name || "N/A"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {new Date(order.orderDate).toLocaleDateString(
                                "es-GT",
                              )}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-medium">
                              Q
                              {(order.totalAmount || 0).toLocaleString(
                                "es-GT",
                                { minimumFractionDigits: 2 },
                              )}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Total
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(order)}
                              className="gap-1"
                            >
                              <Eye className="h-4 w-4" />
                              Ver
                            </Button>
                            {actions?.map((action) => {
                              const Icon = action.icon;
                              const colorClass =
                                action.color === "success"
                                  ? "text-green-600 hover:text-green-700 hover:bg-green-50"
                                  : action.color === "destructive"
                                    ? "text-red-600 hover:text-red-700 hover:bg-red-50"
                                    : "text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50";
                              return (
                                <Button
                                  key={action.action}
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleOpenAction(order, action)
                                  }
                                  className={`gap-1 ${colorClass}`}
                                >
                                  <Icon className="h-4 w-4" />
                                  {action.label}
                                </Button>
                              );
                            })}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog para confirmar acción */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedAction?.action === "approved" && (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
              {selectedAction?.action === "cancelled" && (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              {selectedAction?.action === "pending" && (
                <Clock className="h-5 w-5 text-yellow-600" />
              )}
              {selectedAction?.label}
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas {selectedAction?.label.toLowerCase()}{" "}
              la orden{" "}
              <span className="font-mono font-medium">
                {selectedOrder?.orderNumber}
              </span>
              ?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Información de la orden */}
            <Card className="bg-muted/50">
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Proveedor:</span>
                  <span className="font-medium">
                    {suppliers.find((s) => s.id === selectedOrder?.supplierId)
                      ?.name || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Monto total:</span>
                  <span className="font-medium">
                    Q
                    {(selectedOrder?.totalAmount || 0).toLocaleString("es-GT", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Productos:</span>
                  <span className="font-medium">
                    {getTotalItems(selectedOrder)} unidades
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Comentario opcional */}
            <div className="space-y-2">
              <Label htmlFor="comment">
                Comentario{" "}
                {selectedAction?.action === "cancelled" && "(opcional)"}
              </Label>
              <Textarea
                id="comment"
                placeholder={
                  selectedAction?.action === "approved"
                    ? "Ej: Revisión de inventario completada, proceder con la orden."
                    : selectedAction?.action === "cancelled"
                      ? "Ej: Proveedor no cumple con requisitos, orden cancelada."
                      : "Ej: Enviar a aprobación para revisión del equipo."
                }
                value={actionComment}
                onChange={(e) => setActionComment(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                {selectedAction?.action === "cancelled"
                  ? "Se recomienda agregar un motivo de cancelación"
                  : "Opcional: Agrega notas adicionales sobre esta decisión"}
              </p>
            </div>
          </div>

          <DialogFooter>
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
                selectedAction?.action === "approved" &&
                  "bg-green-600 hover:bg-green-700",
                selectedAction?.action === "cancelled" &&
                  "bg-red-600 hover:bg-red-700",
                selectedAction?.action === "pending" &&
                  "bg-yellow-600 hover:bg-yellow-700",
              )}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {selectedAction?.action === "approved" && (
                <Check className="mr-2 h-4 w-4" />
              )}
              {selectedAction?.action === "cancelled" && (
                <X className="mr-2 h-4 w-4" />
              )}
              {selectedAction?.action === "pending" && (
                <Clock className="mr-2 h-4 w-4" />
              )}
              Confirmar {selectedAction?.label}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para ver detalles de la orden */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          {selectedOrderDetail && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>Detalles de la Orden</span>
                  {getStatusBadge(selectedOrderDetail.status)}
                </DialogTitle>
                <DialogDescription>
                  Orden:{" "}
                  <span className="font-mono font-medium">
                    {selectedOrderDetail.orderNumber}
                  </span>
                </DialogDescription>
              </DialogHeader>

              <ScrollArea className="h-[60vh] pr-4">
                <div className="space-y-6">
                  {/* Información general */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Información del Proveedor
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Nombre:</span>
                          <span className="font-medium">
                            {suppliers.find(
                              (s) => s.id === selectedOrderDetail.supplierId,
                            )?.name || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email:</span>
                          <span>
                            {suppliers.find(
                              (s) => s.id === selectedOrderDetail.supplierId,
                            )?.email || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Warehouse className="h-4 w-4" />
                        Información de Entrega
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Bodega destino:
                          </span>
                          <span className="font-medium">
                            {selectedOrderDetail.warehouseName || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Fecha esperada:
                          </span>
                          <span>
                            {new Date(
                              selectedOrderDetail.expectedDate,
                            ).toLocaleDateString("es-GT")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Productos */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Productos ({selectedOrderDetail.items?.length || 0})
                    </h4>
                    <Card>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Producto</TableHead>
                              <TableHead className="text-right">
                                Cantidad
                              </TableHead>
                              <TableHead className="text-right">
                                Costo Unitario
                              </TableHead>
                              <TableHead className="text-right">
                                Subtotal
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(selectedOrderDetail.items || []).map(
                              (item: any) => (
                                <TableRow key={item.id}>
                                  <TableCell>
                                    <div>
                                      <div className="font-medium">
                                        {item.productName}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        Código: {item.productCode}
                                      </div>
                                      {item.batchNumber && (
                                        <div className="text-xs text-muted-foreground">
                                          Lote: {item.batchNumber}
                                        </div>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {item.quantity}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    Q{item.unitCost?.toFixed(2) || 0}
                                  </TableCell>
                                  <TableCell className="text-right font-medium">
                                    Q
                                    {(item.quantity * item.unitCost).toFixed(2)}
                                  </TableCell>
                                </TableRow>
                              ),
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Resumen financiero */}
                  <Card className="bg-primary/5">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Total de la Orden
                          </p>
                          <p className="text-2xl font-bold text-primary">
                            Q
                            {(
                              selectedOrderDetail.totalAmount || 0
                            ).toLocaleString("es-GT", {
                              minimumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            Estado actual
                          </p>
                          {getStatusBadge(selectedOrderDetail.status)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Notas */}
                  {selectedOrderDetail.notes && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Notas
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm whitespace-pre-wrap">
                          {selectedOrderDetail.notes}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </ScrollArea>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailDialogOpen(false)}
                >
                  Cerrar
                </Button>
                {availableActions[
                  selectedOrderDetail.status as keyof typeof availableActions
                ]?.map((action) => {
                  const Icon = action.icon;
                  const colorClass =
                    action.action === "approved"
                      ? "bg-green-600 hover:bg-green-700"
                      : action.action === "cancelled"
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-yellow-600 hover:bg-yellow-700";
                  return (
                    <Button
                      key={action.action}
                      onClick={() => {
                        setIsDetailDialogOpen(false);
                        handleOpenAction(selectedOrderDetail, action);
                      }}
                      className={colorClass}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {action.label}
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
