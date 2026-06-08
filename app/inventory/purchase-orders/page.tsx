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
  DialogTrigger,
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
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Filter,
  Download,
  Printer,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  ShoppingCart,
  DollarSign,
  Calendar,
  User,
  Warehouse,
  BarChart3,
  ArrowUpDown,
  AlertTriangle,
  Check,
  X,
  ListChecks,
  PackageCheck,
  Trash,
  Activity,
  Save,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Building2,
  TrendingUp,
  FileText,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { usePurchaseOrders } from "@/hooks/inventory-hooks/use-purchaseOrder";
import { useSuppliers } from "@/hooks/inventory-hooks/use-suppliers";
import { useProducts } from "@/hooks/inventory-hooks/use-products";
import { useWarehouses } from "@/hooks/inventory-hooks/use-warehouses";

type SortField = 'orderNumber' | 'totalAmount' | 'orderDate' | 'status'
type SortOrder = 'asc' | 'desc'

// Configuración de estados
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
    color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400",
    icon: CheckCircle,
  },
  received: {
    label: "Recibida",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400",
    icon: PackageCheck,
  },
  cancelled: {
    label: "Cancelada",
    color: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400",
    icon: XCircle,
  },
};

interface OrderItem {
  id?: string;
  productId: string;
  productCode?: string;
  productName?: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  receivedQuantity?: number;
  expirationDate?: string;
  batchNumber?: string;
  notes?: string;
}

export default function PurchaseOrdersPage() {
  const {
    purchaseOrders,
    isLoading,
    error,
    findById,
    fetchPurchaseOrders,
    createPurchaseOrder,
    updatePurchaseOrder,
    receivePurchaseOrder,
  } = usePurchaseOrders();

  const { suppliers } = useSuppliers();
  const { products } = useProducts({ isActive: true, limit: 500 });
  const { warehouses } = useWarehouses();

  // Estados para filtros y ordenamiento
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [warehouseFilter, setWarehouseFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>('orderDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [savedFilters, setSavedFilters] = useState<any[]>([]);
  const [filterName, setFilterName] = useState("");
  const [showSaveFilterDialog, setShowSaveFilterDialog] = useState(false);

  // Estados generales
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<any>(null);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [isItemsDialogOpen, setIsItemsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("list");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [productSearch, setProductSearch] = useState("");

  const [orderForm, setOrderForm] = useState({
    supplierId: "",
    warehouseId: "",
    orderDate: new Date().toISOString().split("T")[0],
    expectedDate: "",
    paymentTerms: "immediate" as "immediate" | "one_payment" | "two_payments" | "three_payments",
    discount: 0,
    shippingCost: 0,
    notes: "",
    status: "pending",
  });

  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  const [receiptForm, setReceiptForm] = useState({
    notes: "",
    receivedItems: [] as Array<{
      productId: string;
      quantity: number;
      batchNumber: string;
      expirationDate: string;
    }>,
  });

  // Cargar filtros guardados
  useEffect(() => {
    const saved = localStorage.getItem("savedPurchaseOrderFilters");
    if (saved) {
      try {
        setSavedFilters(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading saved filters:", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("savedPurchaseOrderFilters", JSON.stringify(savedFilters));
  }, [savedFilters]);

  // Filtrar y ordenar órdenes
  const filteredOrders = useMemo(() => {
    if (!purchaseOrders.length) return [];

    let filtered = purchaseOrders.filter((order) => {
      const supplier = suppliers.find((s) => s.id === order.supplierId);
      const matchesSearch =
        order.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
        order.notes?.toLowerCase().includes(search.toLowerCase()) ||
        supplier?.name?.toLowerCase().includes(search.toLowerCase()) ||
        false;

      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const matchesWarehouse = warehouseFilter === "all" || order.warehouseId === warehouseFilter;

      return matchesSearch && matchesStatus && matchesWarehouse;
    });

    // Ordenar
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'orderNumber') {
        return sortOrder === 'asc'
          ? a.orderNumber.localeCompare(b.orderNumber)
          : b.orderNumber.localeCompare(a.orderNumber);
      }
      if (sortField === 'status') {
        return sortOrder === 'asc'
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status);
      }
      if (sortField === 'totalAmount') {
        aValue = a.totalAmount || 0;
        bValue = b.totalAmount || 0;
      }
      if (sortField === 'orderDate') {
        aValue = new Date(a.orderDate).getTime();
        bValue = new Date(b.orderDate).getTime();
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }, [purchaseOrders, search, statusFilter, warehouseFilter, sortField, sortOrder, suppliers]);

  // Paginación
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Filtrar productos disponibles
  const availableProducts = useMemo(() => {
    const addedProductIds = orderItems.map((item) => item.productId);
    return products.filter(
      (product) =>
        !addedProductIds.includes(product.id) &&
        (product.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
          product.code?.toLowerCase().includes(productSearch.toLowerCase())),
    );
  }, [products, orderItems, productSearch]);

  // Calcular totales
  const orderSubtotal = useMemo(
    () => orderItems.reduce((sum, item) => sum + (item.totalCost || 0), 0),
    [orderItems],
  );
  const orderTotal = useMemo(
    () => orderSubtotal - (orderForm.discount || 0) + (orderForm.shippingCost || 0),
    [orderSubtotal, orderForm.discount, orderForm.shippingCost],
  );

  // Estadísticas
  const stats = useMemo(() => {
    if (!purchaseOrders.length) {
      return {
        totalOrders: 0,
        pendingOrders: 0,
        approvedOrders: 0,
        receivedOrders: 0,
        totalAmount: 0,
        avgAmount: 0,
        overdueOrders: 0,
        completionRate: 0,
      };
    }

    const totalAmount = purchaseOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const pendingOrders = purchaseOrders.filter((o) => o.status === "pending").length;
    const approvedOrders = purchaseOrders.filter((o) => o.status === "approved").length;
    const receivedOrders = purchaseOrders.filter((o) => o.status === "received").length;

    return {
      totalOrders: purchaseOrders.length,
      pendingOrders,
      approvedOrders,
      receivedOrders,
      totalAmount,
      avgAmount: purchaseOrders.length > 0 ? totalAmount / purchaseOrders.length : 0,
      overdueOrders: purchaseOrders.filter(
        (o) => o.status === "pending" && new Date(o.expectedDate) < new Date(),
      ).length,
      completionRate: purchaseOrders.length > 0 ? (receivedOrders / purchaseOrders.length) * 100 : 0,
    };
  }, [purchaseOrders]);

  // Handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setWarehouseFilter("all");
    setCurrentPage(1);
  };

  const handleSaveFilter = () => {
    if (filterName.trim()) {
      const newFilter = {
        id: Date.now(),
        name: filterName,
        search,
        statusFilter,
        warehouseFilter,
        createdAt: new Date().toISOString(),
      };
      setSavedFilters([...savedFilters, newFilter]);
      setFilterName("");
      setShowSaveFilterDialog(false);
    }
  };

  const handleLoadFilter = (filter: any) => {
    setSearch(filter.search);
    setStatusFilter(filter.statusFilter);
    setWarehouseFilter(filter.warehouseFilter);
    setCurrentPage(1);
  };

  const handleDeleteFilter = (filterId: number) => {
    setSavedFilters(savedFilters.filter(f => f.id !== filterId));
  };

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setIsItemsDialogOpen(true);
  };

  const handleEditOrder = (order: any) => {
    setSelectedOrder(order);
    setOrderForm({
      supplierId: order.supplierId,
      warehouseId: order.warehouseId,
      orderDate: order.orderDate?.split("T")[0] || new Date().toISOString().split("T")[0],
      expectedDate: order.expectedDate?.split("T")[0] || "",
      paymentTerms: order.paymentTerms || "immediate",
      discount: order.discount || 0,
      shippingCost: order.shippingCost || 0,
      notes: order.notes || "",
      status: order.status,
    });
    setOrderItems(
      (order.items || []).map((item: any) => ({
        ...item,
        totalCost: item.quantity * item.unitCost,
      })),
    );
    setIsOrderDialogOpen(true);
  };

  const handleReceiveOrder = async (order: any) => {
    try {
      const fullOrder = await findById(order.id);
      if (!fullOrder) {
        alert("No se pudo cargar la información de la orden.");
        return;
      }
      setSelectedOrderForReceipt(fullOrder);
      setReceiptForm({
        notes: "",
        receivedItems: (fullOrder.items || []).map((item: any) => ({
          productId: item.productId,
          quantity: 0,
          batchNumber: "",
          expirationDate: "",
        })),
      });
      setIsReceiptDialogOpen(true);
    } catch (error) {
      console.error("Error fetching order details:", error);
      alert("Error al obtener detalles de la orden. Por favor, intenta de nuevo.");
    }
  };

  const handleApproveOrder = async (order: any) => {
    try {
      await updatePurchaseOrder(order.id, { status: "approved" });
      await fetchPurchaseOrders();
    } catch (error) {
      console.error("Error approving order:", error);
    }
  };

  const handleCancelOrder = async (order: any) => {
    if (!confirm(`¿Estás seguro de que deseas cancelar la orden ${order.orderNumber}?`)) return;
    try {
      await updatePurchaseOrder(order.id, { status: "cancelled" });
      await fetchPurchaseOrders();
    } catch (error) {
      console.error("Error cancelling order:", error);
    }
  };

  const handleAddProduct = () => {
    if (!selectedProductId) return;

    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;

    const newItem: OrderItem = {
      productId: product.id,
      productCode: product.code,
      productName: product.name,
      quantity: 1,
      unitCost: 0,
      totalCost: 0,
      expirationDate: "",
      batchNumber: "",
      notes: "",
    };

    setOrderItems([...orderItems, newItem]);
    setSelectedProductId("");
    setProductSearch("");
  };

  const handleUpdateItem = (index: number, field: keyof OrderItem, value: any) => {
    const updatedItems = [...orderItems];
    const item = { ...updatedItems[index] };

    if (field === "quantity") {
      item.quantity = parseFloat(value) || 0;
      item.totalCost = item.quantity * item.unitCost;
    } else if (field === "unitCost") {
      item.unitCost = parseFloat(value) || 0;
      item.totalCost = item.quantity * item.unitCost;
    } else {
      (item[field] as any) = value;
    }

    updatedItems[index] = item;
    setOrderItems(updatedItems);
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = orderItems.filter((_, i) => i !== index);
    setOrderItems(updatedItems);
  };

  const handleSaveOrder = async () => {
    try {
      if (orderItems.length === 0) {
        alert("Debe agregar al menos un producto a la orden");
        return;
      }

      const orderData = {
        supplierId: orderForm.supplierId,
        warehouseId: orderForm.warehouseId,
        expectedDate: orderForm.expectedDate || undefined,
        paymentTerms: orderForm.paymentTerms,
        discount: orderForm.discount || undefined,
        shippingCost: orderForm.shippingCost || undefined,
        notes: orderForm.notes || undefined,
        items: orderItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitCost: item.unitCost,
          expirationDate: item.expirationDate || undefined,
          batchNumber: item.batchNumber || undefined,
          notes: item.notes || undefined,
        })),
      };

      if (selectedOrder) {
        await updatePurchaseOrder(selectedOrder.id, { ...selectedOrder, ...orderData } as any);
      } else {
        await createPurchaseOrder(orderData);
      }

      setIsOrderDialogOpen(false);
      setSelectedOrder(null);
      setOrderForm({
        supplierId: "",
        warehouseId: "",
        orderDate: new Date().toISOString().split("T")[0],
        expectedDate: "",
        paymentTerms: "immediate",
        discount: 0,
        shippingCost: 0,
        notes: "",
        status: "pending",
      });
      setOrderItems([]);
      await fetchPurchaseOrders();
    } catch (error) {
      console.error("Error saving order:", error);
    }
  };

  const handleSubmitReceipt = async () => {
    if (!selectedOrderForReceipt) return;

    try {
      const payload = {
        receivedItems: receiptForm.receivedItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          batchNumber: item.batchNumber || undefined,
          expirationDate: item.expirationDate || undefined,
        })),
        notes: receiptForm.notes || undefined,
      };

      await receivePurchaseOrder(selectedOrderForReceipt.id, payload);
      setIsReceiptDialogOpen(false);
      setSelectedOrderForReceipt(null);
      setReceiptForm({
        notes: "",
        receivedItems: [],
      });
      await fetchPurchaseOrders();
    } catch (error) {
      console.error("Error receiving order:", error);
    }
  };

  const handleReceiptItemChange = (index: number, field: string, value: any) => {
    const newReceivedItems = [...receiptForm.receivedItems];
    newReceivedItems[index] = {
      ...newReceivedItems[index],
      [field]: value,
    };
    setReceiptForm({ ...receiptForm, receivedItems: newReceivedItems });
  };

  const getStatusConfig = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  };

  const getDaysRemaining = (expectedDate: string) => {
    const today = new Date();
    const expected = new Date(expectedDate);
    const diffTime = expected.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getReceivedPercentage = (order: any) => {
    if (order.status === "received") return 100;
    if (order.items && order.items.length > 0) {
      const totalItems = order.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
      const receivedItems = order.items.reduce((sum: number, item: any) => sum + (item.receivedQuantity || 0), 0);
      return totalItems > 0 ? (receivedItems / totalItems) * 100 : 0;
    }
    return 0;
  };

  if (isLoading && !purchaseOrders.length) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="h-32 w-full bg-muted animate-pulse rounded-lg" />
          <div className="h-64 w-full bg-muted animate-pulse rounded-lg" />
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
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-gradient-to-br from-primary to-primary/70 rounded-xl shadow-lg">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Órdenes de Compra
                </h1>
                <p className="text-muted-foreground">
                  Gestiona las órdenes de compra y recepción de insumos
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setSelectedOrder(null);
                    setOrderForm({
                      supplierId: "",
                      warehouseId: "",
                      orderDate: new Date().toISOString().split("T")[0],
                      expectedDate: "",
                      paymentTerms: "immediate",
                      discount: 0,
                      shippingCost: 0,
                      notes: "",
                      status: "pending",
                    });
                    setOrderItems([]);
                  }}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Nueva Orden
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{selectedOrder ? "Editar Orden" : "Crear Nueva Orden de Compra"}</DialogTitle>
                  <DialogDescription>
                    Complete la información de la orden de compra
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[65vh] pr-4">
                  <div className="space-y-6">
                    {/* Información básica */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Proveedor *</Label>
                        <Select value={orderForm.supplierId} onValueChange={(value) => setOrderForm({ ...orderForm, supplierId: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar proveedor" />
                          </SelectTrigger>
                          <SelectContent>
                            {suppliers.map((supplier) => (
                              <SelectItem key={supplier.id} value={supplier.id}>
                                {supplier.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Bodega Destino *</Label>
                        <Select value={orderForm.warehouseId} onValueChange={(value) => setOrderForm({ ...orderForm, warehouseId: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar bodega" />
                          </SelectTrigger>
                          <SelectContent>
                            {warehouses.filter((w) => w.isActive).map((warehouse) => (
                              <SelectItem key={warehouse.id} value={warehouse.id}>
                                {warehouse.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Fecha de Orden *</Label>
                        <Input type="date" value={orderForm.orderDate} onChange={(e) => setOrderForm({ ...orderForm, orderDate: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Fecha de entrega esperada *</Label>
                        <Input type="date" value={orderForm.expectedDate} onChange={(e) => setOrderForm({ ...orderForm, expectedDate: e.target.value })} min={orderForm.orderDate} />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Términos de Pago *</Label>
                        <Select value={orderForm.paymentTerms} onValueChange={(value) => setOrderForm({ ...orderForm, paymentTerms: value as any })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="immediate">Inmediato</SelectItem>
                            <SelectItem value="one_payment">1 cuota</SelectItem>
                            <SelectItem value="two_payments">2 cuotas</SelectItem>
                            <SelectItem value="three_payments">3 cuotas</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Descuento (Q)</Label>
                        <Input type="number" min="0" step="0.01" value={orderForm.discount} onChange={(e) => setOrderForm({ ...orderForm, discount: parseFloat(e.target.value) || 0 })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Costo de Envío (Q)</Label>
                        <Input type="number" min="0" step="0.01" value={orderForm.shippingCost} onChange={(e) => setOrderForm({ ...orderForm, shippingCost: parseFloat(e.target.value) || 0 })} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Notas</Label>
                      <Textarea placeholder="Notas adicionales sobre esta orden..." value={orderForm.notes} onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })} rows={2} />
                    </div>

                    <Separator />

                    {/* Sección de productos */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">Productos de la Orden</h3>
                          <p className="text-sm text-muted-foreground">Agrega los productos que deseas solicitar</p>
                        </div>
                        <div className="flex gap-3">
                          <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input placeholder="Buscar producto..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)} className="pl-9" />
                          </div>
                          <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                            <SelectTrigger className="w-64">
                              <SelectValue placeholder="Seleccionar producto" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableProducts.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  <div className="flex flex-col">
                                    <span>{product.name}</span>
                                    <span className="text-xs text-muted-foreground">Código: {product.code}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button type="button" onClick={handleAddProduct} disabled={!selectedProductId}>
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar
                          </Button>
                        </div>
                      </div>

                      {orderItems.length === 0 ? (
                        <Card>
                          <CardContent className="p-8 text-center">
                            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No hay productos agregados</p>
                            <p className="text-sm text-muted-foreground">Selecciona un producto del catálogo para comenzar</p>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-muted/50">
                                <TableHead className="w-[300px]">Producto</TableHead>
                                <TableHead className="text-right w-[100px]">Cantidad</TableHead>
                                <TableHead className="text-right w-[120px]">Costo Unitario</TableHead>
                                <TableHead className="text-right w-[120px]">Total</TableHead>
                                <TableHead className="w-[100px]">Lote</TableHead>
                                <TableHead className="w-[120px]">Vencimiento</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {orderItems.map((item, index) => (
                                <TableRow key={index}>
                                  <TableCell>
                                    <div>
                                      <div className="font-medium">{item.productName}</div>
                                      <div className="text-xs text-muted-foreground">Código: {item.productCode}</div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Input type="number" min="1" value={item.quantity} onChange={(e) => handleUpdateItem(index, "quantity", e.target.value)} className="w-20 text-right" />
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Input type="number" min="0" step="0.01" value={item.unitCost} onChange={(e) => handleUpdateItem(index, "unitCost", e.target.value)} className="w-28 text-right" />
                                  </TableCell>
                                  <TableCell className="text-right font-medium">Q{item.totalCost.toFixed(2)}</TableCell>
                                  <TableCell>
                                    <Input placeholder="Lote" value={item.batchNumber || ""} onChange={(e) => handleUpdateItem(index, "batchNumber", e.target.value)} className="w-28" />
                                  </TableCell>
                                  <TableCell>
                                    <Input type="date" value={item.expirationDate || ""} onChange={(e) => handleUpdateItem(index, "expirationDate", e.target.value)} className="w-32" />
                                  </TableCell>
                                  <TableCell>
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)} className="text-destructive hover:text-destructive">
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}

                      {/* Resumen de la orden */}
                      {orderItems.length > 0 && (
                        <Card className="bg-muted/50">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm text-muted-foreground">Total de productos</p>
                                <p className="text-lg font-semibold">{orderItems.length} items</p>
                              </div>
                              <div className="text-right space-y-1">
                                <div className="flex justify-between gap-8 text-sm text-muted-foreground">
                                  <span>Subtotal</span>
                                  <span>Q{orderSubtotal.toFixed(2)}</span>
                                </div>
                                {orderForm.discount > 0 && (
                                  <div className="flex justify-between gap-8 text-sm text-green-600">
                                    <span>Descuento</span>
                                    <span>- Q{orderForm.discount.toFixed(2)}</span>
                                  </div>
                                )}
                                {orderForm.shippingCost > 0 && (
                                  <div className="flex justify-between gap-8 text-sm text-muted-foreground">
                                    <span>Envío</span>
                                    <span>+ Q{orderForm.shippingCost.toFixed(2)}</span>
                                  </div>
                                )}
                                <Separator className="my-1" />
                                <div className="flex justify-between gap-8">
                                  <span className="text-sm font-medium">Total</span>
                                  <span className="text-2xl font-bold text-primary">Q{orderTotal.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                </ScrollArea>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsOrderDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={handleSaveOrder} disabled={!orderForm.supplierId || !orderForm.warehouseId || orderItems.length === 0}>
                    {selectedOrder ? "Actualizar Orden" : "Crear Orden"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards con diseño de gradientes */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-none shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Órdenes</p>
                  <p className="text-3xl font-bold">{stats.totalOrders}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stats.pendingOrders} pendientes</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-none shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                  <p className="text-2xl font-bold text-emerald-600">Q{stats.totalAmount.toLocaleString("es-GT")}</p>
                  <p className="text-xs text-muted-foreground mt-1">Promedio: Q{stats.avgAmount.toLocaleString("es-GT", { maximumFractionDigits: 2 })}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-none shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Vencidas</p>
                  <p className="text-3xl font-bold text-amber-600">{stats.overdueOrders}</p>
                  <p className="text-xs text-muted-foreground mt-1">Por recibir</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-none shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completadas</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.receivedOrders}</p>
                  <div className="mt-1">
                    <Progress value={stats.completionRate} className="h-1.5" />
                  </div>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <PackageCheck className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-[400px] grid-cols-3">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <ListChecks className="h-4 w-4" />
              Lista
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Estadísticas
            </TabsTrigger>
            <TabsTrigger value="flow" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Flujo
            </TabsTrigger>
          </TabsList>

          {/* Tab: Lista de Órdenes */}
          <TabsContent value="list" className="space-y-4">
            {/* Filtros Avanzados */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por número, proveedor o notas..."
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="pl-9"
                      />
                    </div>

                    <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
                      <SelectTrigger className="w-[150px]">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="draft">Borrador</SelectItem>
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="approved">Aprobada</SelectItem>
                        <SelectItem value="received">Recibida</SelectItem>
                        <SelectItem value="cancelled">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={warehouseFilter} onValueChange={(v) => { setWarehouseFilter(v); setCurrentPage(1); }}>
                      <SelectTrigger className="w-[180px]">
                        <Warehouse className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Bodega" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        {Array.from(new Set(purchaseOrders.map((o) => o.warehouseName).filter(Boolean))).map((warehouse) => (
                          <SelectItem key={warehouse} value={warehouse}>{warehouse}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleClearFilters} className="gap-2">
                        <Trash2 className="h-4 w-4" />
                        Limpiar
                      </Button>

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
                                {statusFilter !== "all" && <div>📊 Estado: {statusFilter}</div>}
                                {warehouseFilter !== "all" && <div>🏭 Bodega: {warehouseFilter}</div>}
                                {!search && statusFilter === "all" && warehouseFilter === "all" && (
                                  <div className="text-muted-foreground">Mostrando todas las órdenes</div>
                                )}
                              </div>
                            </div>
                            <div>
                              <Label>Nombre del filtro</Label>
                              <Input
                                value={filterName}
                                onChange={(e) => setFilterName(e.target.value)}
                                placeholder="Ej: Órdenes pendientes urgentes"
                                className="mt-1"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setShowSaveFilterDialog(false)}>Cancelar</Button>
                            <Button onClick={handleSaveFilter}>Guardar filtro</Button>
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

            {/* Tabla de Órdenes con ordenamiento */}
            <Card>
              <CardHeader>
                <CardTitle>Órdenes de Compra</CardTitle>
                <CardDescription>
                  {filteredOrders.length} {filteredOrders.length === 1 ? "orden encontrada" : "órdenes encontradas"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="cursor-pointer hover:bg-muted w-[140px]" onClick={() => handleSort('orderNumber')}>
                          <div className="flex items-center gap-1">
                            Número
                            {sortField === 'orderNumber' && (sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                            {sortField !== 'orderNumber' && <ArrowUpDown className="h-3 w-3 opacity-50" />}
                          </div>
                        </TableHead>
                        <TableHead>Proveedor</TableHead>
                        <TableHead>Bodega</TableHead>
                        <TableHead className="cursor-pointer hover:bg-muted" onClick={() => handleSort('orderDate')}>
                          <div className="flex items-center gap-1">
                            Fechas
                            {sortField === 'orderDate' && (sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                            {sortField !== 'orderDate' && <ArrowUpDown className="h-3 w-3 opacity-50" />}
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer hover:bg-muted text-right" onClick={() => handleSort('totalAmount')}>
                          <div className="flex items-center justify-end gap-1">
                            Monto
                            {sortField === 'totalAmount' && (sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                            {sortField !== 'totalAmount' && <ArrowUpDown className="h-3 w-3 opacity-50" />}
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer hover:bg-muted" onClick={() => handleSort('status')}>
                          <div className="flex items-center gap-1">
                            Estado
                            {sortField === 'status' && (sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                            {sortField !== 'status' && <ArrowUpDown className="h-3 w-3 opacity-50" />}
                          </div>
                        </TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedOrders.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                            No se encontraron órdenes de compra
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedOrders.map((order) => {
                          const supplier = suppliers.find((s) => s.id === order.supplierId);
                          const daysRemaining = getDaysRemaining(order.expectedDate);
                          const StatusIcon = getStatusConfig(order.status).icon;
                          const isOverdue = daysRemaining < 0 && order.status === "pending";

                          return (
                            <TableRow key={order.id} className="hover:bg-muted/50 transition-colors">
                              <TableCell className="font-medium">
                                <div className="flex flex-col">
                                  <span className="font-mono text-sm">{order.orderNumber}</span>
                                  <span className="text-xs text-muted-foreground">{order.items?.length || 0} items</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-medium">{supplier?.name || "N/A"}</span>
                                  <span className="text-xs text-muted-foreground">{new Date(order.orderDate).toLocaleDateString("es-GT")}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Warehouse className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-sm">{order.warehouseName}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-sm">Esperada: {new Date(order.expectedDate).toLocaleDateString("es-GT")}</span>
                                  </div>
                                  <div className="mt-1">
                                    {isOverdue ? (
                                      <Badge variant="outline" className="gap-1 text-xs bg-red-500/10 text-red-600 border-red-200">
                                        <AlertTriangle className="h-3 w-3" />
                                        {Math.abs(daysRemaining)} días vencida
                                      </Badge>
                                    ) : daysRemaining >= 0 && order.status === "pending" ? (
                                      <Badge variant="outline" className="gap-1 text-xs">
                                        <Clock className="h-3 w-3" />
                                        {daysRemaining} días restantes
                                      </Badge>
                                    ) : null}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex flex-col items-end">
                                  <span className="font-bold">Q{(order.totalAmount || 0).toLocaleString("es-GT", { minimumFractionDigits: 2 })}</span>
                                  <div className="flex items-center gap-1 mt-1 w-24">
                                    <Progress value={getReceivedPercentage(order)} className="h-1.5 flex-1" />
                                    <span className="text-xs text-muted-foreground">{getReceivedPercentage(order)}%</span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={`gap-1 ${getStatusConfig(order.status).color} border`}>
                                  <StatusIcon className="h-3 w-3" />
                                  {getStatusConfig(order.status).label}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewOrder(order)}>
                                          <Eye className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Ver detalles</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>

                                  {order.status === "pending" && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:text-emerald-700" onClick={() => handleApproveOrder(order)}>
                                            <CheckCircle className="h-4 w-4" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Aprobar orden</TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}

                                  {["pending", "approved"].includes(order.status) && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700" onClick={() => handleReceiveOrder(order)}>
                                            <PackageCheck className="h-4 w-4" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Recibir orden</TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}

                                  {["draft", "pending"].includes(order.status) && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditOrder(order)}>
                                            <Edit className="h-4 w-4" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Editar orden</TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}

                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                      <DropdownMenuItem onClick={() => handleViewOrder(order)}>
                                        <Eye className="mr-2 h-4 w-4" /> Ver Detalles
                                      </DropdownMenuItem>
                                      {order.status === "pending" && (
                                        <DropdownMenuItem onClick={() => handleApproveOrder(order)}>
                                          <CheckCircle className="mr-2 h-4 w-4" /> Aprobar Orden
                                        </DropdownMenuItem>
                                      )}
                                      {["pending", "approved"].includes(order.status) && (
                                        <DropdownMenuItem onClick={() => handleReceiveOrder(order)}>
                                          <PackageCheck className="mr-2 h-4 w-4" /> Recibir Orden
                                        </DropdownMenuItem>
                                      )}
                                      {["draft", "pending"].includes(order.status) && (
                                        <DropdownMenuItem onClick={() => handleEditOrder(order)}>
                                          <Edit className="mr-2 h-4 w-4" /> Editar
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuItem>
                                        <Printer className="mr-2 h-4 w-4" /> Imprimir
                                      </DropdownMenuItem>
                                      {["draft", "pending", "approved"].includes(order.status) && (
                                        <>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem className="text-destructive" onClick={() => handleCancelOrder(order)}>
                                            <XCircle className="mr-2 h-4 w-4" /> Cancelar Orden
                                          </DropdownMenuItem>
                                        </>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Paginación */}
                {filteredOrders.length > 0 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">
                        Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredOrders.length)} de {filteredOrders.length}
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
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
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
          </TabsContent>

          {/* Tab: Estadísticas */}
          <TabsContent value="stats">
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas de Compras</CardTitle>
                <CardDescription>Resumen y análisis de las órdenes de compra</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Órdenes por Estado</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(statusConfig).map(([status, config]) => {
                          const count = purchaseOrders.filter((o) => o.status === status).length;
                          const percentage = purchaseOrders.length > 0 ? (count / purchaseOrders.length) * 100 : 0;
                          const Icon = config.icon;
                          return (
                            <div key={status} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={`p-1 rounded ${config.color}`}>
                                  <Icon className="h-3 w-3" />
                                </div>
                                <span className="text-sm">{config.label}</span>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="w-32">
                                  <Progress value={percentage} className="h-2" />
                                </div>
                                <span className="text-sm font-medium w-12 text-right">{count} ({percentage.toFixed(1)}%)</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Distribución por Bodega</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Array.from(new Set(purchaseOrders.map((o) => o.warehouseName).filter(Boolean))).map((warehouse) => {
                          const orders = purchaseOrders.filter((o) => o.warehouseName === warehouse);
                          const totalAmount = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
                          return (
                            <div key={warehouse} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Warehouse className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{warehouse}</span>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">{orders.length} órdenes</div>
                                <div className="text-xs text-muted-foreground">Q{totalAmount.toLocaleString("es-GT", { minimumFractionDigits: 2 })}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Desempeño de Proveedores</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead>Proveedor</TableHead>
                            <TableHead className="text-right">Órdenes</TableHead>
                            <TableHead className="text-right">Monto Total</TableHead>
                            <TableHead className="text-right">Promedio/Orden</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {suppliers.map((supplier) => {
                            const supplierOrders = purchaseOrders.filter((o) => o.supplierId === supplier.id);
                            const totalAmount = supplierOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
                            const avgAmount = supplierOrders.length > 0 ? totalAmount / supplierOrders.length : 0;
                            return (
                              <TableRow key={supplier.id} className="hover:bg-muted/50">
                                <TableCell>
                                  <div className="font-medium">{supplier.name}</div>
                                  <div className="text-xs text-muted-foreground">{supplier.email}</div>
                                </TableCell>
                                <TableCell className="text-right font-medium">{supplierOrders.length}</TableCell>
                                <TableCell className="text-right">Q{totalAmount.toLocaleString("es-GT", { minimumFractionDigits: 2 })}</TableCell>
                                <TableCell className="text-right">Q{avgAmount.toLocaleString("es-GT", { minimumFractionDigits: 2 })}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Flujo de Órdenes */}
          <TabsContent value="flow">
            <Card>
              <CardHeader>
                <CardTitle>Flujo de Órdenes de Compra</CardTitle>
                <CardDescription>Visualiza el proceso completo de una orden de compra</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 -translate-y-1/2 hidden lg:block" />
                  <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6">
                    {[
                      { status: "draft", label: "Borrador", icon: FileText, color: "gray", description: "Creación inicial", actions: ["Enviar a aprobación"] },
                      { status: "pending", label: "Pendiente", icon: Clock, color: "amber", description: "Espera revisión", actions: ["Aprobar", "Rechazar"] },
                      { status: "approved", label: "Aprobada", icon: CheckCircle, color: "blue", description: "Orden autorizada", actions: ["Recibir", "Cancelar"] },
                      { status: "received", label: "Recibida", icon: PackageCheck, color: "emerald", description: "Completada", actions: [] },
                    ].map((step, idx, arr) => {
                      const getGradientClass = () => {
                        const gradients = {
                          gray: "from-gray-50 to-gray-100 dark:from-gray-950/30 dark:to-gray-950/20",
                          amber: "from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/20",
                          blue: "from-blue-50 to-sky-50 dark:from-blue-950/30 dark:to-sky-950/20",
                          emerald: "from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/20",
                        };
                        return gradients[step.color as keyof typeof gradients] || gradients.gray;
                      };
                      const getIconColorClass = () => {
                        const colors = {
                          gray: "text-gray-600",
                          amber: "text-amber-600",
                          blue: "text-blue-600",
                          emerald: "text-emerald-600",
                        };
                        return colors[step.color as keyof typeof colors] || colors.gray;
                      };
                      const count = purchaseOrders.filter((o) => o.status === step.status).length;
                      return (
                        <div key={step.status} className="relative flex-1 text-center z-10">
                          <div className="inline-flex flex-col items-center">
                            <div className={cn("w-20 h-20 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg mb-3 transition-all hover:scale-105", getGradientClass())}>
                              <step.icon className={cn("h-8 w-8", getIconColorClass())} />
                            </div>
                            <p className="font-semibold text-base">{step.label}</p>
                            <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                            <p className="text-xs font-medium mt-1">{count} órdenes</p>
                            <div className="mt-2 flex flex-wrap justify-center gap-1">
                              {step.actions.map(action => (
                                <Badge key={action} variant="secondary" className="text-[10px]">{action}</Badge>
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog para Recepción de Orden */}
        <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            {selectedOrderForReceipt && (
              <>
                <DialogHeader>
                  <DialogTitle>Recepción de Orden</DialogTitle>
                  <DialogDescription>
                    Orden: <span className="font-mono">{selectedOrderForReceipt.orderNumber}</span> •
                    Proveedor: <span className="font-medium">{suppliers.find((s) => s.id === selectedOrderForReceipt.supplierId)?.name}</span>
                  </DialogDescription>
                </DialogHeader>

                <Alert>
                  <PackageCheck className="h-4 w-4" />
                  <AlertTitle>Instrucciones para recepción</AlertTitle>
                  <AlertDescription>
                    Registra la cantidad recibida de cada producto. Asegúrate de verificar los números de lote y fechas de vencimiento.
                  </AlertDescription>
                </Alert>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[350px]">Producto</TableHead>
                        <TableHead className="text-right w-[100px]">Ordenado</TableHead>
                        <TableHead className="text-right w-[120px]">Recibido</TableHead>
                        <TableHead className="w-[150px]">Lote</TableHead>
                        <TableHead className="w-[150px]">Vencimiento</TableHead>
                        <TableHead className="text-right w-[100px]">Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(selectedOrderForReceipt.items || []).map((item: any, index: number) => {
                        const receivedItem = receiptForm.receivedItems.find((ri) => ri.productId === item.productId);
                        const isComplete = receivedItem && receivedItem.quantity >= item.quantity;
                        const isPartial = receivedItem && receivedItem.quantity > 0 && receivedItem.quantity < item.quantity;
                        return (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">{item.productName}</span>
                                <span className="text-xs text-muted-foreground font-mono">{item.productCode}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="font-medium">{item.quantity}</div>
                              <div className="text-xs text-muted-foreground">Q{item.unitCost?.toFixed(2) || 0}/unit</div>
                            </TableCell>
                            <TableCell>
                              <Input type="number" min="0" max={item.quantity} value={receivedItem?.quantity || 0} onChange={(e) => handleReceiptItemChange(index, "quantity", parseInt(e.target.value) || 0)} className="w-24 ml-auto" />
                            </TableCell>
                            <TableCell>
                              <Input placeholder="Número de lote" value={receivedItem?.batchNumber || ""} onChange={(e) => handleReceiptItemChange(index, "batchNumber", e.target.value)} />
                            </TableCell>
                            <TableCell>
                              <Input type="date" value={receivedItem?.expirationDate || ""} onChange={(e) => handleReceiptItemChange(index, "expirationDate", e.target.value)} />
                            </TableCell>
                            <TableCell className="text-right">
                              {isComplete ? (
                                <Badge className="gap-1 bg-green-500/10 text-green-600">
                                  <Check className="h-3 w-3" /> Completo
                                </Badge>
                              ) : isPartial ? (
                                <Badge className="gap-1 bg-yellow-500/10 text-yellow-600">
                                  <Clock className="h-3 w-3" /> Parcial
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-muted-foreground">Pendiente</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                <div className="space-y-2">
                  <Label>Notas de Recepción</Label>
                  <Textarea placeholder="Describe el estado de la entrega, observaciones sobre los productos..." value={receiptForm.notes} onChange={(e) => setReceiptForm({ ...receiptForm, notes: e.target.value })} rows={3} />
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsReceiptDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={handleSubmitReceipt}>
                    <PackageCheck className="mr-2 h-4 w-4" />
                    Confirmar Recepción
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog para Ver Detalles de Orden */}
        <Dialog open={isItemsDialogOpen} onOpenChange={setIsItemsDialogOpen}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            {selectedOrder && (
              <>
                <DialogHeader>
                  <DialogTitle>Detalles de Orden</DialogTitle>
                  <DialogDescription>Orden: <span className="font-mono">{selectedOrder.orderNumber}</span></DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Información General</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Proveedor:</span><span className="font-medium">{suppliers.find((s) => s.id === selectedOrder.supplierId)?.name}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Bodega Destino:</span><span className="font-medium">{selectedOrder.warehouseName}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Estado:</span><Badge className={`gap-1 ${getStatusConfig(selectedOrder.status).color} border`}>{getStatusConfig(selectedOrder.status).label}</Badge></div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Fechas</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Fecha Orden:</span><span>{new Date(selectedOrder.orderDate).toLocaleDateString("es-GT")}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Fecha Esperada:</span><span>{new Date(selectedOrder.expectedDate).toLocaleDateString("es-GT")}</span></div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-4">Productos ({selectedOrder.items?.length || 0})</h4>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>Producto</TableHead>
                          <TableHead className="text-right">Cantidad</TableHead>
                          <TableHead className="text-right">Precio Unitario</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead>Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(selectedOrder.items || []).map((item: any) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div><span className="font-medium">{item.productName}</span><div className="text-xs text-muted-foreground font-mono">{item.productCode}</div></div>
                            </TableCell>
                            <TableCell className="text-right"><div className="font-medium">{item.quantity}</div><div className="text-xs text-muted-foreground">Recibido: {item.receivedQuantity || 0}</div></TableCell>
                            <TableCell className="text-right">Q{(item.unitCost || 0).toFixed(2)}</TableCell>
                            <TableCell className="text-right font-medium">Q{(item.totalCost || 0).toFixed(2)}</TableCell>
                            <TableCell><Badge variant="outline" className="text-xs">{item.receivedQuantity && item.receivedQuantity >= item.quantity ? "Recibido" : "Pendiente"}</Badge></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div><p className="text-sm text-muted-foreground">Total de la Orden</p><p className="text-3xl font-bold text-primary">Q{(selectedOrder.totalAmount || 0).toLocaleString("es-GT", { minimumFractionDigits: 2 })}</p></div>
                      <div className="text-right"><p className="text-sm text-muted-foreground">Productos</p><p className="text-lg font-semibold">{selectedOrder.items?.length || 0} items</p></div>
                    </div>
                  </CardContent>
                </Card>

                {selectedOrder.notes && (
                  <Card>
                    <CardHeader><CardTitle className="text-base">Notas</CardTitle></CardHeader>
                    <CardContent><p className="text-sm text-muted-foreground">{selectedOrder.notes}</p></CardContent>
                  </Card>
                )}

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsItemsDialogOpen(false)}>Cerrar</Button>
                  {["pending", "approved"].includes(selectedOrder.status) && (
                    <Button onClick={() => { setIsItemsDialogOpen(false); handleReceiveOrder(selectedOrder); }}>
                      <PackageCheck className="mr-2 h-4 w-4" /> Recibir Orden
                    </Button>
                  )}
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

// Componente helper para cn
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}