"use client";

import { useState, useMemo, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
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
  Truck,
  ShoppingCart,
  FileText,
  DollarSign,
  Calendar,
  User,
  Warehouse,
  BarChart3,
  Copy,
  ArrowUpDown,
  AlertTriangle,
  Check,
  X,
  ListChecks,
  ClipboardCheck,
  PackageCheck,
  Trash,
  Activity,
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

// Configuración de estados
const statusConfig = {
  draft: {
    label: "Borrador",
    color: "bg-gray-100 text-gray-700",
    icon: FileText,
  },
  pending: {
    label: "Pendiente",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
  },
  approved: {
    label: "Aprobada",
    color: "bg-blue-100 text-blue-800",
    icon: CheckCircle,
  },
  received: {
    label: "Recibida",
    color: "bg-green-100 text-green-800",
    icon: PackageCheck,
  },
  cancelled: {
    label: "Cancelada",
    color: "bg-red-100 text-red-800",
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

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [warehouseFilter, setWarehouseFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] =
    useState<any>(null);
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
    paymentTerms: "immediate" as
      | "immediate"
      | "one_payment"
      | "two_payments"
      | "three_payments",
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

  // Filtrar productos disponibles (no agregados aún)
  const availableProducts = useMemo(() => {
    const addedProductIds = orderItems.map((item) => item.productId);
    return products.filter(
      (product) =>
        !addedProductIds.includes(product.id) &&
        (product.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
          product.code?.toLowerCase().includes(productSearch.toLowerCase())),
    );
  }, [products, orderItems, productSearch]);

  // Calcular total de la orden
  const orderSubtotal = useMemo(
    () => orderItems.reduce((sum, item) => sum + (item.totalCost || 0), 0),
    [orderItems],
  );
  const orderTotal = useMemo(
    () =>
      orderSubtotal - (orderForm.discount || 0) + (orderForm.shippingCost || 0),
    [orderSubtotal, orderForm.discount, orderForm.shippingCost],
  );

  // Filtrar órdenes
  const filteredOrders = useMemo(() => {
    if (!purchaseOrders.length) return [];

    return purchaseOrders.filter((order) => {
      const matchesSearch =
        order.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
        order.notes?.toLowerCase().includes(search.toLowerCase()) ||
        false;

      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;

      const matchesWarehouse =
        warehouseFilter === "all" || order.warehouseId === warehouseFilter;

      return matchesSearch && matchesStatus && matchesWarehouse;
    });
  }, [purchaseOrders, search, statusFilter, warehouseFilter]);

  // Estadísticas
  const stats = useMemo(() => {
    if (!purchaseOrders.length) {
      return {
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalAmount: 0,
        avgAmount: 0,
        overdueOrders: 0,
      };
    }

    const totalAmount = purchaseOrders.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0,
    );
    const pendingOrders = purchaseOrders.filter((o) =>
      ["pending"].includes(o.status),
    ).length;
    const completedOrders = purchaseOrders.filter((o) =>
      ["received"].includes(o.status),
    ).length;

    return {
      totalOrders: purchaseOrders.length,
      pendingOrders,
      completedOrders,
      totalAmount,
      avgAmount:
        purchaseOrders.length > 0 ? totalAmount / purchaseOrders.length : 0,
      overdueOrders: purchaseOrders.filter(
        (o) => o.status === "pending" && new Date(o.expectedDate) < new Date(),
      ).length,
    };
  }, [purchaseOrders]);

  // Handlers
  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setIsItemsDialogOpen(true);
  };

  const handleEditOrder = (order: any) => {
    setSelectedOrder(order);
    setOrderForm({
      supplierId: order.supplierId,
      warehouseId: order.warehouseId,
      orderDate:
        order.orderDate?.split("T")[0] ||
        new Date().toISOString().split("T")[0],
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
      alert(
        "Error al obtener detalles de la orden. Por favor, intenta de nuevo.",
      );
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
    if (
      !confirm(
        `¿Estás seguro de que deseas cancelar la orden ${order.orderNumber}?`,
      )
    )
      return;
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

  const handleUpdateItem = (
    index: number,
    field: keyof OrderItem,
    value: any,
  ) => {
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
        await updatePurchaseOrder(selectedOrder.id, {
          ...selectedOrder,
          ...orderData,
        } as any);
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

  const handleReceiptItemChange = (
    index: number,
    field: string,
    value: any,
  ) => {
    const newReceivedItems = [...receiptForm.receivedItems];
    newReceivedItems[index] = {
      ...newReceivedItems[index],
      [field]: value,
    };
    setReceiptForm({ ...receiptForm, receivedItems: newReceivedItems });
  };

  const getStatusConfig = (status: string) => {
    return (
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    );
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
      const totalItems = order.items.reduce(
        (sum: number, item: any) => sum + item.quantity,
        0,
      );
      const receivedItems = order.items.reduce(
        (sum: number, item: any) => sum + (item.receivedQuantity || 0),
        0,
      );
      return totalItems > 0 ? (receivedItems / totalItems) * 100 : 0;
    }
    return 0;
  };

  if (isLoading && !purchaseOrders.length) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
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
            <h1 className="text-2xl font-bold tracking-tight">
              Órdenes de Compra
            </h1>
            <p className="text-muted-foreground">
              Gestiona las órdenes de compra y recepción de insumos
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            <Button variant="outline" className="gap-2">
              <Printer className="h-4 w-4" />
              Imprimir Lista
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                setActiveTab(activeTab === "list" ? "stats" : "list")
              }
            >
              {activeTab === "list" ? (
                <>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Ver Estadísticas
                </>
              ) : (
                <>
                  <ListChecks className="mr-2 h-4 w-4" />
                  Ver Lista
                </>
              )}
            </Button>
            <Dialog
              open={isOrderDialogOpen}
              onOpenChange={(open) => {
                // Solo permitir cerrar si es por el botón de cancelar o si el modal se abre
                if (!open && !isOrderDialogOpen) {
                  // Esto evita que se cierre al hacer clic fuera
                  return;
                }
                setIsOrderDialogOpen(open);
              }}
            >
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
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Orden
                </Button>
              </DialogTrigger>
              <DialogContent
                className="!w-[95vw] !max-w-[95vw] !max-h-[90vh] sm:!rounded-lg"
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
              >
                <DialogHeader>
                  <DialogTitle>
                    {selectedOrder
                      ? "Editar Orden"
                      : "Crear Nueva Orden de Compra"}
                  </DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[70vh] pr-4">
                  <div className="space-y-6">
                    {/* Información básica */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="supplier">Proveedor *</Label>
                        <Select
                          value={orderForm.supplierId}
                          onValueChange={(value) =>
                            setOrderForm({ ...orderForm, supplierId: value })
                          }
                        >
                          <SelectTrigger className="w-full">
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
                        <Label htmlFor="warehouse">Bodega Destino *</Label>
                        <Select
                          value={orderForm.warehouseId}
                          onValueChange={(value) =>
                            setOrderForm({ ...orderForm, warehouseId: value })
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Seleccionar bodega" />
                          </SelectTrigger>
                          <SelectContent>
                            {warehouses
                              .filter((w) => w.isActive)
                              .map((warehouse) => (
                                <SelectItem
                                  key={warehouse.id}
                                  value={warehouse.id}
                                >
                                  {warehouse.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="orderDate">Fecha de Orden *</Label>
                        <Input
                          id="orderDate"
                          type="date"
                          value={orderForm.orderDate}
                          onChange={(e) =>
                            setOrderForm({
                              ...orderForm,
                              orderDate: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expectedDate">
                          Fecha de entrega esperada *
                        </Label>
                        <Input
                          id="expectedDate"
                          type="date"
                          value={orderForm.expectedDate}
                          onChange={(e) =>
                            setOrderForm({
                              ...orderForm,
                              expectedDate: e.target.value,
                            })
                          }
                          min={orderForm.orderDate}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="paymentTerms">Términos de Pago *</Label>
                        <Select
                          value={orderForm.paymentTerms}
                          onValueChange={(value) =>
                            setOrderForm({
                              ...orderForm,
                              paymentTerms:
                                value as typeof orderForm.paymentTerms,
                            })
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="immediate">Inmediato</SelectItem>
                            <SelectItem value="one_payment">1 cuota</SelectItem>
                            <SelectItem value="two_payments">
                              2 cuotas
                            </SelectItem>
                            <SelectItem value="three_payments">
                              3 cuotas
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="discount">Descuento (Q)</Label>
                        <Input
                          id="discount"
                          type="number"
                          min="0"
                          step="0.01"
                          value={orderForm.discount}
                          onChange={(e) =>
                            setOrderForm({
                              ...orderForm,
                              discount: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="shippingCost">Costo de Envío (Q)</Label>
                        <Input
                          id="shippingCost"
                          type="number"
                          min="0"
                          step="0.01"
                          value={orderForm.shippingCost}
                          onChange={(e) =>
                            setOrderForm({
                              ...orderForm,
                              shippingCost: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notas</Label>
                      <Textarea
                        id="notes"
                        placeholder="Notas adicionales sobre esta orden..."
                        value={orderForm.notes}
                        onChange={(e) =>
                          setOrderForm({ ...orderForm, notes: e.target.value })
                        }
                        rows={2}
                      />
                    </div>

                    <Separator />

                    {/* Sección de productos */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">
                            Productos de la Orden
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Agrega los productos que deseas solicitar
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <div className="grid grid-cols-12 gap-3 w-full">
                            {/* Buscador - ocupa 6 columnas */}
                            <div className="relative col-span-6">
                              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                placeholder="Buscar producto por nombre o código..."
                                value={productSearch}
                                onChange={(e) =>
                                  setProductSearch(e.target.value)
                                }
                                className="pl-10 h-12 text-base"
                              />
                            </div>

                            {/* Select - ocupa 4 columnas */}
                            <div className="col-span-4">
                              <Select
                                value={selectedProductId}
                                onValueChange={setSelectedProductId}
                              >
                                <SelectTrigger className="w-full h-12 text-base">
                                  <SelectValue placeholder="Seleccionar producto" />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableProducts
                                    .filter((product) => {
                                      if (!productSearch) return true;
                                      const searchLower =
                                        productSearch.toLowerCase();
                                      return (
                                        product.name
                                          .toLowerCase()
                                          .includes(searchLower) ||
                                        product.code
                                          .toLowerCase()
                                          .includes(searchLower)
                                      );
                                    })
                                    .map((product) => (
                                      <SelectItem
                                        key={product.id}
                                        value={product.id}
                                      >
                                        <div className="flex flex-col">
                                          <span>{product.name}</span>
                                          <span className="text-xs text-muted-foreground">
                                            Código: {product.code}
                                          </span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Botón - ocupa 2 columnas */}
                            <Button
                              type="button"
                              onClick={handleAddProduct}
                              disabled={!selectedProductId}
                              size="lg"
                              className="col-span-2 h-12 px-4 text-base"
                            >
                              <Plus className="h-5 w-5 mr-2" />
                              Agregar
                            </Button>
                          </div>
                        </div>
                      </div>

                      {orderItems.length === 0 ? (
                        <Card>
                          <CardContent className="p-8 text-center">
                            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">
                              No hay productos agregados
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Selecciona un producto del catálogo para comenzar
                            </p>
                          </CardContent>
                        </Card>
                      ) : (
                        <Card>
                          <CardContent className="p-0">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-[300px]">
                                    Producto
                                  </TableHead>
                                  <TableHead className="text-right w-[100px]">
                                    Cantidad
                                  </TableHead>
                                  <TableHead className="text-right w-[120px]">
                                    Costo Unitario
                                  </TableHead>
                                  <TableHead className="text-right w-[120px]">
                                    Total
                                  </TableHead>
                                  <TableHead className="w-[120px]">
                                    Lote
                                  </TableHead>
                                  <TableHead className="w-[120px]">
                                    Vencimiento
                                  </TableHead>
                                  <TableHead className="w-[200px]">
                                    Notas
                                  </TableHead>
                                  <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {orderItems.map((item, index) => (
                                  <TableRow key={index}>
                                    <TableCell>
                                      <div>
                                        <div className="font-medium">
                                          {item.productName}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          Código: {item.productCode}
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <Input
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) =>
                                          handleUpdateItem(
                                            index,
                                            "quantity",
                                            e.target.value,
                                          )
                                        }
                                        className="w-20 text-right"
                                      />
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={item.unitCost}
                                        onChange={(e) =>
                                          handleUpdateItem(
                                            index,
                                            "unitCost",
                                            e.target.value,
                                          )
                                        }
                                        className="w-28 text-right"
                                      />
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                      Q{item.totalCost.toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                      <Input
                                        placeholder="Lote"
                                        value={item.batchNumber || ""}
                                        onChange={(e) =>
                                          handleUpdateItem(
                                            index,
                                            "batchNumber",
                                            e.target.value,
                                          )
                                        }
                                        className="w-28"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Input
                                        type="date"
                                        value={item.expirationDate || ""}
                                        onChange={(e) =>
                                          handleUpdateItem(
                                            index,
                                            "expirationDate",
                                            e.target.value,
                                          )
                                        }
                                        className="w-32"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Input
                                        placeholder="Notas del producto"
                                        value={item.notes || ""}
                                        onChange={(e) =>
                                          handleUpdateItem(
                                            index,
                                            "notes",
                                            e.target.value,
                                          )
                                        }
                                        className="w-40"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRemoveItem(index)}
                                        className="text-destructive hover:text-destructive"
                                      >
                                        <Trash className="h-4 w-4" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </CardContent>
                        </Card>
                      )}

                      {/* Resumen de la orden */}
                      {orderItems.length > 0 && (
                        <Card className="bg-muted/50">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Total de productos
                                </p>
                                <p className="text-lg font-semibold">
                                  {orderItems.length} items
                                </p>
                              </div>
                              <div className="text-right space-y-1">
                                <div className="flex justify-between gap-8 text-sm text-muted-foreground">
                                  <span>Subtotal</span>
                                  <span>Q{orderSubtotal.toFixed(2)}</span>
                                </div>
                                {orderForm.discount > 0 && (
                                  <div className="flex justify-between gap-8 text-sm text-green-600">
                                    <span>Descuento</span>
                                    <span>
                                      - Q{orderForm.discount.toFixed(2)}
                                    </span>
                                  </div>
                                )}
                                {orderForm.shippingCost > 0 && (
                                  <div className="flex justify-between gap-8 text-sm text-muted-foreground">
                                    <span>Envío</span>
                                    <span>
                                      + Q{orderForm.shippingCost.toFixed(2)}
                                    </span>
                                  </div>
                                )}
                                <Separator className="my-1" />
                                <div className="flex justify-between gap-8">
                                  <span className="text-sm font-medium">
                                    Total
                                  </span>
                                  <span className="text-2xl font-bold text-primary">
                                    Q{orderTotal.toFixed(2)}
                                  </span>
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
                  <Button
                    variant="outline"
                    onClick={() => setIsOrderDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSaveOrder}
                    disabled={
                      !orderForm.supplierId ||
                      !orderForm.warehouseId ||
                      orderItems.length === 0
                    }
                  >
                    {selectedOrder ? "Actualizar Orden" : "Crear Orden"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Órdenes</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.pendingOrders} pendientes
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                <DollarSign className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold">
                  Q{stats.totalAmount.toLocaleString("es-GT")}
                </p>
                <p className="text-xs text-muted-foreground">
                  Q
                  {stats.avgAmount.toLocaleString("es-GT", {
                    maximumFractionDigits: 2,
                  })}{" "}
                  promedio
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vencidas</p>
                <p className="text-2xl font-bold text-warning">
                  {stats.overdueOrders}
                </p>
                <p className="text-xs text-muted-foreground">Por recibir</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10">
                <PackageCheck className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completadas</p>
                <p className="text-2xl font-bold">{stats.completedOrders}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.totalOrders > 0
                    ? (
                        (stats.completedOrders / stats.totalOrders) *
                        100
                      ).toFixed(1)
                    : 0}
                  % del total
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <ListChecks className="h-4 w-4" />
              Lista de Órdenes
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Estadísticas
            </TabsTrigger>
            <TabsTrigger value="flow" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Flujo de Órdenes
            </TabsTrigger>
          </TabsList>

          {/* Tab: Lista de Órdenes */}
          <TabsContent value="list" className="space-y-4">
            {/* Filtros */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar órdenes por número o notas..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-[150px]">
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
                    <Select
                      value={warehouseFilter}
                      onValueChange={setWarehouseFilter}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Bodega" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        {Array.from(
                          new Set(
                            purchaseOrders
                              .map((o) => o.warehouseName)
                              .filter(Boolean),
                          ),
                        ).map((warehouse) => (
                          <SelectItem key={warehouse} value={warehouse}>
                            {warehouse}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabla de Órdenes */}
            <Card>
              <CardHeader>
                <CardTitle>Órdenes de Compra</CardTitle>
                <CardDescription>
                  {filteredOrders.length}{" "}
                  {filteredOrders.length === 1
                    ? "orden encontrada"
                    : "órdenes encontradas"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Proveedor</TableHead>
                      <TableHead>Bodega</TableHead>
                      <TableHead>Fechas</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => {
                      const daysRemaining = getDaysRemaining(
                        order.expectedDate,
                      );
                      const StatusIcon = getStatusConfig(order.status).icon;
                      const isOverdue =
                        daysRemaining < 0 && order.status === "pending";

                      return (
                        <TableRow key={order.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span className="font-mono">
                                {order.orderNumber}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {order.items?.length || 0} items
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>
                                {suppliers.find(
                                  (s) => s.id === order.supplierId,
                                )?.name || order.supplierId}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Orden:{" "}
                                {new Date(order.orderDate).toLocaleDateString(
                                  "es-GT",
                                )}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Warehouse className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">
                                {order.warehouseName}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                <span className="text-sm">
                                  Esperada:{" "}
                                  {new Date(
                                    order.expectedDate,
                                  ).toLocaleDateString("es-GT")}
                                </span>
                              </div>
                              <div className="mt-1">
                                {isOverdue ? (
                                  <Badge
                                    variant="outline"
                                    className="gap-1 text-xs bg-destructive/10 text-destructive"
                                  >
                                    <AlertTriangle className="h-3 w-3" />
                                    {Math.abs(daysRemaining)} días vencida
                                  </Badge>
                                ) : daysRemaining >= 0 &&
                                  order.status === "pending" ? (
                                  <Badge
                                    variant="outline"
                                    className="gap-1 text-xs"
                                  >
                                    <Clock className="h-3 w-3" />
                                    {daysRemaining} días restantes
                                  </Badge>
                                ) : null}
                              </div>
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
                              <div className="flex items-center gap-1 mt-1">
                                <Progress
                                  value={getReceivedPercentage(order)}
                                  className="h-2 w-16"
                                />
                                <span className="text-xs text-muted-foreground">
                                  {getReceivedPercentage(order)}%
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`gap-1 ${getStatusConfig(order.status).color}`}
                            >
                              <StatusIcon className="h-3 w-3" />
                              {getStatusConfig(order.status).label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewOrder(order)}
                                title="Ver detalles"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>

                              {order.status === "pending" && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleApproveOrder(order)}
                                  title="Aprobar orden"
                                  className="text-blue-600 hover:text-blue-600"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}

                              {["pending", "approved"].includes(
                                order.status,
                              ) && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleReceiveOrder(order)}
                                  title="Recibir orden"
                                  className="text-success hover:text-success"
                                >
                                  <PackageCheck className="h-4 w-4" />
                                </Button>
                              )}

                              {["draft", "pending"].includes(order.status) && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditOrder(order)}
                                  title="Editar"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Filter className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>
                                    Acciones
                                  </DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={() => handleViewOrder(order)}
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    Ver Detalles
                                  </DropdownMenuItem>

                                  {order.status === "pending" && (
                                    <DropdownMenuItem
                                      onClick={() => handleApproveOrder(order)}
                                    >
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Aprobar Orden
                                    </DropdownMenuItem>
                                  )}

                                  {["pending", "approved"].includes(
                                    order.status,
                                  ) && (
                                    <DropdownMenuItem
                                      onClick={() => handleReceiveOrder(order)}
                                    >
                                      <PackageCheck className="mr-2 h-4 w-4" />
                                      Recibir Orden
                                    </DropdownMenuItem>
                                  )}

                                  {["draft", "pending"].includes(
                                    order.status,
                                  ) && (
                                    <DropdownMenuItem
                                      onClick={() => handleEditOrder(order)}
                                    >
                                      <Edit className="mr-2 h-4 w-4" />
                                      Editar
                                    </DropdownMenuItem>
                                  )}

                                  <DropdownMenuItem>
                                    <Printer className="mr-2 h-4 w-4" />
                                    Imprimir
                                  </DropdownMenuItem>

                                  <DropdownMenuItem>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Duplicar
                                  </DropdownMenuItem>

                                  {["draft", "pending", "approved"].includes(
                                    order.status,
                                  ) && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        className="text-destructive"
                                        onClick={() => handleCancelOrder(order)}
                                      >
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Cancelar Orden
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex-col items-start gap-2 border-t px-6 py-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-100"></div>
                    <span>Recibida</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue-100"></div>
                    <span>Aprobada</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-yellow-100"></div>
                    <span>Pendiente</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-100"></div>
                    <span>Cancelada</span>
                  </div>
                </div>
                <div className="flex gap-2"></div>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Tab: Estadísticas */}
          <TabsContent value="stats">
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas de Compras</CardTitle>
                <CardDescription>
                  Resumen y análisis de las órdenes de compra
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Órdenes por Estado
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(statusConfig).map(
                          ([status, config]) => {
                            const count = purchaseOrders.filter(
                              (o) => o.status === status,
                            ).length;
                            const percentage =
                              purchaseOrders.length > 0
                                ? (count / purchaseOrders.length) * 100
                                : 0;
                            const Icon = config.icon;

                            return (
                              <div
                                key={status}
                                className="flex items-center justify-between"
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`p-1 rounded ${config.color}`}
                                  >
                                    <Icon className="h-3 w-3" />
                                  </div>
                                  <span className="text-sm">
                                    {config.label}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="w-32">
                                    <Progress
                                      value={percentage}
                                      className="h-2"
                                    />
                                  </div>
                                  <span className="text-sm font-medium w-12 text-right">
                                    {count} ({percentage.toFixed(1)}%)
                                  </span>
                                </div>
                              </div>
                            );
                          },
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Distribución por Bodega
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Array.from(
                          new Set(
                            purchaseOrders
                              .map((o) => o.warehouseName)
                              .filter(Boolean),
                          ),
                        ).map((warehouse) => {
                          const orders = purchaseOrders.filter(
                            (o) => o.warehouseName === warehouse,
                          );
                          const totalAmount = orders.reduce(
                            (sum, o) => sum + (o.totalAmount || 0),
                            0,
                          );

                          return (
                            <div
                              key={warehouse}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <Warehouse className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{warehouse}</span>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">
                                  {orders.length} órdenes
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Q
                                  {totalAmount.toLocaleString("es-GT", {
                                    minimumFractionDigits: 2,
                                  })}
                                </div>
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
                      <CardTitle className="text-base">
                        Desempeño de Proveedores
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Proveedor</TableHead>
                            <TableHead className="text-right">
                              Órdenes
                            </TableHead>
                            <TableHead className="text-right">
                              Monto Total
                            </TableHead>
                            <TableHead className="text-right">
                              Promedio/Orden
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {suppliers.map((supplier) => {
                            const supplierOrders = purchaseOrders.filter(
                              (o) => o.supplierId === supplier.id,
                            );
                            const totalAmount = supplierOrders.reduce(
                              (sum, o) => sum + (o.totalAmount || 0),
                              0,
                            );
                            const avgAmount =
                              supplierOrders.length > 0
                                ? totalAmount / supplierOrders.length
                                : 0;

                            return (
                              <TableRow key={supplier.id}>
                                <TableCell>
                                  <div className="font-medium">
                                    {supplier.name}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {supplier.email}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  {supplierOrders.length}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="font-medium">
                                    Q
                                    {totalAmount.toLocaleString("es-GT", {
                                      minimumFractionDigits: 2,
                                    })}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  Q
                                  {avgAmount.toLocaleString("es-GT", {
                                    minimumFractionDigits: 2,
                                  })}
                                </TableCell>
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
        </Tabs>

        {/* Dialog para Recepción de Orden */}
        <Dialog
          open={isReceiptDialogOpen}
          onOpenChange={setIsReceiptDialogOpen}
        >
          <DialogContent className="!w-[95vw] !max-w-[95vw] !max-h-[90vh] sm:!rounded-lg">
            {selectedOrderForReceipt && (
              <>
                <DialogHeader className="px-6 pt-6 pb-2">
                  <DialogTitle>Recepción de Orden</DialogTitle>
                  <CardDescription className="pt-1">
                    Orden:{" "}
                    <span className="font-mono">
                      {selectedOrderForReceipt.orderNumber}
                    </span>{" "}
                    • Proveedor:{" "}
                    <span className="font-medium">
                      {
                        suppliers.find(
                          (s) => s.id === selectedOrderForReceipt.supplierId,
                        )?.name
                      }
                    </span>{" "}
                    • Bodega:{" "}
                    <span className="font-medium">
                      {selectedOrderForReceipt.warehouseName}
                    </span>
                  </CardDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 px-6">
                  <div className="space-y-6 pb-4">
                    {/* Alerta */}
                    <Alert>
                      <PackageCheck className="h-4 w-4" />
                      <AlertTitle>Instrucciones para recepción</AlertTitle>
                      <AlertDescription>
                        Registra la cantidad recibida de cada producto.
                        Asegúrate de verificar los números de lote y fechas de
                        vencimiento.
                      </AlertDescription>
                    </Alert>

                    {/* Tabla de productos - más ancha */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Productos a Recibir</h3>
                        <span className="text-sm text-muted-foreground">
                          {receiptForm.receivedItems.length} productos
                        </span>
                      </div>

                      <Card>
                        <CardContent className="p-0 overflow-x-auto">
                          <Table className="min-w-[800px]">
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[350px]">
                                  Producto
                                </TableHead>
                                <TableHead className="text-right w-[100px]">
                                  Ordenado
                                </TableHead>
                                <TableHead className="text-right w-[120px]">
                                  Recibido
                                </TableHead>
                                <TableHead className="w-[150px]">
                                  Lote
                                </TableHead>
                                <TableHead className="w-[150px]">
                                  Vencimiento
                                </TableHead>
                                <TableHead className="text-right w-[100px]">
                                  Estado
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {(selectedOrderForReceipt.items || []).map(
                                (item: any, index: number) => {
                                  const receivedItem =
                                    receiptForm.receivedItems.find(
                                      (ri) => ri.productId === item.productId,
                                    );
                                  const isComplete =
                                    receivedItem &&
                                    receivedItem.quantity >= item.quantity;
                                  const isPartial =
                                    receivedItem &&
                                    receivedItem.quantity > 0 &&
                                    receivedItem.quantity < item.quantity;

                                  return (
                                    <TableRow key={item.id}>
                                      <TableCell>
                                        <div className="flex flex-col">
                                          <span className="font-medium">
                                            {item.productName}
                                          </span>
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground font-mono">
                                              {item.productCode}
                                            </span>
                                          </div>
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <div className="font-medium">
                                          {item.quantity}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          Q{item.unitCost?.toFixed(2) || 0}/unit
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <Input
                                          type="number"
                                          min="0"
                                          max={item.quantity}
                                          value={receivedItem?.quantity || 0}
                                          onChange={(e) =>
                                            handleReceiptItemChange(
                                              index,
                                              "quantity",
                                              parseInt(e.target.value) || 0,
                                            )
                                          }
                                          className="w-24 ml-auto"
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <Input
                                          placeholder="Número de lote"
                                          value={
                                            receivedItem?.batchNumber || ""
                                          }
                                          onChange={(e) =>
                                            handleReceiptItemChange(
                                              index,
                                              "batchNumber",
                                              e.target.value,
                                            )
                                          }
                                          className="w-32"
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <Input
                                          type="date"
                                          value={
                                            receivedItem?.expirationDate || ""
                                          }
                                          onChange={(e) =>
                                            handleReceiptItemChange(
                                              index,
                                              "expirationDate",
                                              e.target.value,
                                            )
                                          }
                                          className="w-32"
                                        />
                                      </TableCell>
                                      <TableCell className="text-right">
                                        {isComplete ? (
                                          <Badge className="gap-1 bg-success/10 text-success">
                                            <Check className="h-3 w-3" />
                                            Completo
                                          </Badge>
                                        ) : isPartial ? (
                                          <Badge className="gap-1 bg-warning/10 text-warning">
                                            <Clock className="h-3 w-3" />
                                            Parcial
                                          </Badge>
                                        ) : (
                                          <Badge
                                            variant="outline"
                                            className="text-muted-foreground"
                                          >
                                            Pendiente
                                          </Badge>
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  );
                                },
                              )}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Resumen de recepción */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Resumen de Recepción</h3>
                        <div className="text-sm text-muted-foreground">
                          Total recibido:{" "}
                          {receiptForm.receivedItems.reduce(
                            (sum, item) => sum + item.quantity,
                            0,
                          )}{" "}
                          unidades
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-success">
                              {
                                receiptForm.receivedItems.filter(
                                  (item) => item.quantity > 0,
                                ).length
                              }
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Productos recibidos
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-warning">
                              {
                                receiptForm.receivedItems.filter(
                                  (item) =>
                                    item.quantity > 0 &&
                                    item.quantity <
                                      (selectedOrderForReceipt.items?.find(
                                        (i: any) =>
                                          i.productId === item.productId,
                                      )?.quantity || 0),
                                ).length
                              }
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Recepción parcial
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-destructive">
                              {
                                receiptForm.receivedItems.filter(
                                  (item) => item.quantity === 0,
                                ).length
                              }
                            </div>
                            <div className="text-sm text-muted-foreground">
                              No recibidos
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    {/* Notas */}
                    <div className="space-y-2">
                      <Label htmlFor="receiptNotes">Notas de Recepción</Label>
                      <Textarea
                        id="receiptNotes"
                        placeholder="Describe el estado de la entrega, observaciones sobre los productos, o razones por faltantes..."
                        value={receiptForm.notes}
                        onChange={(e) =>
                          setReceiptForm({
                            ...receiptForm,
                            notes: e.target.value,
                          })
                        }
                        rows={3}
                      />
                      <p className="text-sm text-muted-foreground">
                        Ej: "Entrega conforme. Se verifican lotes y fechas de
                        vencimiento. No se recibieron 50 unidades porque no
                        fueron necesarias."
                      </p>
                    </div>
                  </div>
                </ScrollArea>

                <DialogFooter className="px-6 py-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setIsReceiptDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
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
          <DialogContent className="max-w-4xl">
            {selectedOrder && (
              <>
                <DialogHeader>
                  <DialogTitle>Detalles de Orden</DialogTitle>
                  <CardDescription className="pt-2">
                    Orden:{" "}
                    <span className="font-mono">
                      {selectedOrder.orderNumber}
                    </span>
                  </CardDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Header de la orden */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">
                          Información General
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Proveedor:
                            </span>
                            <span className="font-medium">
                              {suppliers.find(
                                (s) => s.id === selectedOrder.supplierId,
                              )?.name || selectedOrder.supplierId}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Bodega Destino:
                            </span>
                            <span className="font-medium">
                              {selectedOrder.warehouseName}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Creado por:
                            </span>
                            <span className="font-medium">
                              {selectedOrder.createdBy}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Fechas</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Fecha Orden:
                            </span>
                            <span>
                              {new Date(
                                selectedOrder.orderDate,
                              ).toLocaleDateString("es-GT")}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Fecha Esperada:
                            </span>
                            <span>
                              {new Date(
                                selectedOrder.expectedDate,
                              ).toLocaleDateString("es-GT")}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Estado:
                            </span>
                            <Badge
                              className={`gap-1 ${getStatusConfig(selectedOrder.status).color}`}
                            >
                              {getStatusConfig(selectedOrder.status).label}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Items de la orden */}
                  <div>
                    <h4 className="font-medium mb-4">
                      Productos ({selectedOrder.items?.length || 0})
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
                                Precio Unitario
                              </TableHead>
                              <TableHead className="text-right">
                                Total
                              </TableHead>
                              <TableHead>Estado</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(selectedOrder.items || []).map((item: any) => (
                              <TableRow key={item.id}>
                                <TableCell>
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {item.productName}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-muted-foreground font-mono">
                                        {item.productCode}
                                      </span>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="font-medium">
                                    {item.quantity}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Recibido: {item.receivedQuantity || 0}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  Q{(item.unitCost || 0).toFixed(2)}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="font-medium">
                                    Q{(item.totalCost || 0).toFixed(2)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="text-xs">
                                    {item.receivedQuantity &&
                                    item.receivedQuantity >= item.quantity
                                      ? "Recibido"
                                      : "Pendiente"}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Resumen financiero */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm text-muted-foreground">
                            Total de la Orden
                          </div>
                          <div className="text-3xl font-bold text-primary">
                            Q
                            {(selectedOrder.totalAmount || 0).toLocaleString(
                              "es-GT",
                              { minimumFractionDigits: 2 },
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">
                            IVA incluido
                          </div>
                          <div className="text-sm">
                            {selectedOrder.items?.length || 0} productos
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Notas */}
                  {selectedOrder.notes && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Notas</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {selectedOrder.notes}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsItemsDialogOpen(false)}
                  >
                    Cerrar
                  </Button>
                  {["pending", "approved"].includes(selectedOrder.status) && (
                    <Button
                      onClick={() => {
                        setIsItemsDialogOpen(false);
                        handleReceiveOrder(selectedOrder);
                      }}
                    >
                      <PackageCheck className="mr-2 h-4 w-4" />
                      Recibir Orden
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
