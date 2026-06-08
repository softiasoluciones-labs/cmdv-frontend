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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Search,
    Plus,
    Trash2,
    DollarSign,
    CreditCard,
    Calendar,
    FileText,
    CheckCircle,
    Clock,
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    ChevronDown,
    ArrowUpDown,
    Banknote,
    Landmark,
    Receipt,
    Filter,
    X,
    Loader2,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatCurrency, formatDate } from "@/lib/utils";
import { usePurchaseOrdersReadyForPayment } from "@/hooks/inventory-hooks/use-purchaseOrdersReadyForPayment";
import { usePurchaseOrders } from "@/hooks/inventory-hooks/use-purchaseOrder";
import { useSuppliers } from "@/hooks/inventory-hooks/use-suppliers";
import { usePaymentSuppliers } from "@/hooks/inventory-hooks/use-paymentSuppliers";
import { Payment, PaymentDetail, CreatePaymentPayload } from "@/lib/api/types/inventory-types/inventory.types";

type SortField = 'paymentNumber' | 'paymentDate' | 'amount' | 'paymentMethod';
type SortOrder = 'asc' | 'desc';
type PaymentTerms = 'immediate' | 'one_payment' | 'two_payments' | 'three_payments';

const paymentMethods = [
    { value: "cash", label: "Efectivo", icon: Banknote, color: "emerald" },
    { value: "bank_transfer", label: "Transferencia Bancaria", icon: Landmark, color: "blue" },
    { value: "check", label: "Cheque", icon: Receipt, color: "purple" },
    { value: "credit_card", label: "Tarjeta de Crédito", icon: CreditCard, color: "amber" },
    { value: "other", label: "Otro", icon: DollarSign, color: "gray" },
];

export default function PurchaseOrderPaymentsPage() {
    const [selectedOrderId, setSelectedOrderId] = useState<string>("");
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

    const [search, setSearch] = useState("");
    const [methodFilter, setMethodFilter] = useState("all");
    const [sortField, setSortField] = useState<SortField>("paymentDate");
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [paymentForm, setPaymentForm] = useState({
        paymentDate: new Date().toISOString().split("T")[0],
        amount: "",
        paymentMethod: "",
        bank: "",
        referenceNumber: "",
        authorizationCode: "",
        documentType: "",
        documentNumber: "",
        notes: "",
    });
    const [paymentDetails, setPaymentDetails] = useState<PaymentDetail[]>([
        { id: "1", paymentMethod: "", amount: 0, bank: "", referenceNumber: "", authorizationCode: "" }
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Nuevos estados para validaciones
    const [paymentTerms, setPaymentTerms] = useState<PaymentTerms>('immediate');
    const [maxAllowedAmount, setMaxAllowedAmount] = useState<number>(0);
    const [remainingPayments, setRemainingPayments] = useState<number>(1);
    const [formErrors, setFormErrors] = useState<{
        amount?: string;
        paymentLimit?: string;
    }>({});

    const { purchaseOrders, isLoading: isLoadingOrders, fetchPurchaseOrdersReadyForPayment } = usePurchaseOrdersReadyForPayment();
    const { findById } = usePurchaseOrders();
    const { suppliers } = useSuppliers();
    const { payments, isLoading: isLoadingPayments, error, summary, createPayment, deletePayment, fetchPayments, fetchSummary } = usePaymentSuppliers();

    // Funciones auxiliares para términos de pago
    const getAllowedPaymentCount = (terms: PaymentTerms): number => {
        switch (terms) {
            case 'immediate':
                return 1;
            case 'one_payment':
                return 1;
            case 'two_payments':
                return 2;
            case 'three_payments':
                return 3;
            default:
                return 1;
        }
    };

    const getRemainingPaymentsCount = (totalPaymentsAllowed: number, currentPaymentsCount: number): number => {
        return Math.max(0, totalPaymentsAllowed - currentPaymentsCount);
    };

    useEffect(() => {
        fetchPurchaseOrdersReadyForPayment();
    }, [fetchPurchaseOrdersReadyForPayment]);

    useEffect(() => {
        if (selectedOrderId) {
            const loadOrder = async () => {
                const order = await findById(selectedOrderId);
                setSelectedOrder(order);

                // Obtener los términos de pago de la orden seleccionada
                const orderWithTerms = purchaseOrders.find(o => o.id === selectedOrderId);
                if (orderWithTerms && (orderWithTerms as any).paymentTerms) {
                    setPaymentTerms((orderWithTerms as any).paymentTerms as PaymentTerms);
                }
            };
            loadOrder();
            fetchPayments(selectedOrderId);
            fetchSummary(selectedOrderId);
        }
    }, [selectedOrderId, findById, fetchPayments, fetchSummary, purchaseOrders]);

    // Validar montos y pagos restantes cuando cambia el resumen
    useEffect(() => {
        if (selectedOrder && summary) {
            const totalAmount = selectedOrder.totalAmount;
            const paidAmount = summary.totalPaid;
            const remaining = totalAmount - paidAmount;
            setMaxAllowedAmount(remaining);

            // Calcular pagos restantes
            const allowedPayments = getAllowedPaymentCount(paymentTerms);
            const remainingPaymentsCount = getRemainingPaymentsCount(allowedPayments, summary.paymentCount);
            setRemainingPayments(remainingPaymentsCount);

            // Validar si ya se alcanzó el límite de pagos
            if (remainingPaymentsCount === 0 && summary.paymentCount > 0) {
                setFormErrors(prev => ({
                    ...prev,
                    paymentLimit: `Esta orden solo permite ${allowedPayments} pago(s) y ya se han realizado ${summary.paymentCount}`,
                }));
            } else {
                setFormErrors(prev => ({ ...prev, paymentLimit: undefined }));
            }
        }
    }, [selectedOrder, summary, paymentTerms]);

    const filteredPayments = useMemo(() => {
        if (!payments.length) return [];

        let filtered = payments.filter((payment) => {
            const matchesSearch =
                payment.paymentNumber.toString().includes(search.toLowerCase()) ||
                payment.referenceNumber?.toLowerCase().includes(search.toLowerCase()) ||
                false;

            const matchesMethod = methodFilter === "all" || payment.paymentMethod === methodFilter;

            return matchesSearch && matchesMethod;
        });

        filtered.sort((a, b) => {
            let aValue: any = a[sortField];
            let bValue: any = b[sortField];

            if (sortField === "paymentDate") {
                aValue = new Date(a.paymentDate).getTime();
                bValue = new Date(b.paymentDate).getTime();
            }

            return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
        });

        return filtered;
    }, [payments, search, methodFilter, sortField, sortOrder]);

    const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
    const paginatedPayments = filteredPayments.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const paidPercentage = useMemo(() => {
        if (!selectedOrder || !summary.totalPaid) return 0;
        return (summary.totalPaid / selectedOrder.totalAmount) * 100;
    }, [selectedOrder, summary]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
        setCurrentPage(1);
    };

    const handleClearFilters = () => {
        setSearch("");
        setMethodFilter("all");
        setCurrentPage(1);
    };

    const handleAddPaymentDetail = () => {
        if (remainingPayments === 0) return;
        setPaymentDetails([
            ...paymentDetails,
            { id: Date.now().toString(), paymentMethod: "", amount: 0, bank: "", referenceNumber: "", authorizationCode: "" }
        ]);
    };

    const handleRemovePaymentDetail = (id: string) => {
        if (paymentDetails.length === 1) return;
        const updatedDetails = paymentDetails.filter(d => d.id !== id);
        setPaymentDetails(updatedDetails);

        // Revalidar el total después de eliminar un detalle
        const totalAmount = updatedDetails.reduce((sum, d) => sum + (d.amount || 0), 0);
        if (totalAmount > maxAllowedAmount) {
            setFormErrors({ amount: `El monto total excede el saldo pendiente de ${formatCurrency(maxAllowedAmount)}` });
        } else {
            setFormErrors(prev => ({ ...prev, amount: undefined }));
        }
    };

    const handlePaymentDetailChange = (id: string, field: keyof PaymentDetail, value: any) => {
        const updatedDetails = paymentDetails.map(detail =>
            detail.id === id ? { ...detail, [field]: value } : detail
        );

        // Validar el total después del cambio
        const totalAmount = updatedDetails.reduce((sum, d) => sum + (d.amount || 0), 0);

        if (totalAmount > maxAllowedAmount) {
            setFormErrors({ amount: `El monto total (${formatCurrency(totalAmount)}) excede el saldo pendiente (${formatCurrency(maxAllowedAmount)})` });
        } else if (totalAmount === 0) {
            setFormErrors({ amount: "El monto debe ser mayor a 0" });
        } else {
            setFormErrors(prev => ({ ...prev, amount: undefined }));
        }

        setPaymentDetails(updatedDetails);
    };

    const handleSubmitPayment = async () => {
        if (!selectedOrderId) return;

        // Validaciones previas
        const totalAmount = paymentDetails.reduce((sum, d) => sum + (d.amount || 0), 0);

        // Validar monto máximo
        if (totalAmount > maxAllowedAmount) {
            setFormErrors({
                amount: `El monto total (${formatCurrency(totalAmount)}) excede el saldo pendiente (${formatCurrency(maxAllowedAmount)})`,
            });
            return;
        }

        if (totalAmount <= 0) {
            setFormErrors({ amount: "El monto debe ser mayor a 0" });
            return;
        }

        // Validar pagos restantes
        if (remainingPayments <= 0 && summary.paymentCount > 0) {
            setFormErrors({
                paymentLimit: `No se pueden realizar más pagos. Esta orden solo permite ${getAllowedPaymentCount(paymentTerms)} pago(s).`,
            });
            return;
        }

        // Validar que cada detalle tenga método de pago
        const missingMethod = paymentDetails.some(d => !d.paymentMethod);
        if (missingMethod) {
            setFormErrors({ amount: "Todos los detalles de pago deben tener un método seleccionado" });
            return;
        }

        // Validar montos positivos en detalles
        const invalidAmount = paymentDetails.some(d => d.amount <= 0);
        if (invalidAmount) {
            setFormErrors({ amount: "Todos los montos deben ser mayores a 0" });
            return;
        }

        setIsSubmitting(true);
        try {
            const paymentData: CreatePaymentPayload = {
                paymentDate: paymentForm.paymentDate,
                amount: totalAmount,
                paymentMethod: paymentDetails.length === 1 ? paymentDetails[0].paymentMethod : "multiple",
                bank: paymentDetails[0]?.bank,
                referenceNumber: paymentDetails[0]?.referenceNumber,
                authorizationCode: paymentDetails[0]?.authorizationCode,
                documentType: paymentForm.documentType,
                documentNumber: paymentForm.documentNumber,
                notes: paymentForm.notes,
                paymentDetails: paymentDetails.map(d => ({
                    paymentMethod: d.paymentMethod,
                    amount: d.amount,
                    bank: d.bank,
                    referenceNumber: d.referenceNumber,
                    authorizationCode: d.authorizationCode,
                })),
            };

            await createPayment(selectedOrderId, paymentData);
            await fetchSummary(selectedOrderId);
            await fetchPayments(selectedOrderId);

            setIsPaymentDialogOpen(false);
            // Resetear formulario
            setPaymentForm({
                paymentDate: new Date().toISOString().split("T")[0],
                amount: "",
                paymentMethod: "",
                bank: "",
                referenceNumber: "",
                authorizationCode: "",
                documentType: "",
                documentNumber: "",
                notes: "",
            });
            setPaymentDetails([{ id: "1", paymentMethod: "", amount: 0, bank: "", referenceNumber: "", authorizationCode: "" }]);
            setFormErrors({});
        } catch (error: any) {
            console.error("Error creating payment:", error);
            // Mostrar error del API
            if (error.response?.data?.message) {
                setFormErrors({ amount: error.response.data.message });
            } else {
                setFormErrors({ amount: "Error al registrar el pago. Intente nuevamente." });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeletePayment = async () => {
        if (!selectedPayment || !selectedOrderId) return;
        try {
            await deletePayment(selectedOrderId, selectedPayment.id);
            await fetchSummary(selectedOrderId);
            await fetchPayments(selectedOrderId);
            setIsDeleteDialogOpen(false);
            setSelectedPayment(null);
        } catch (error) {
            console.error("Error deleting payment:", error);
        }
    };

    const getPaymentMethodBadge = (method: string) => {
        const config = paymentMethods.find(m => m.value === method);
        if (!config) return <Badge variant="outline">{method}</Badge>;

        const Icon = config.icon;
        const colorMap: Record<string, string> = {
            emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
            blue: "bg-blue-50 text-blue-700 border-blue-200",
            purple: "bg-purple-50 text-purple-700 border-purple-200",
            amber: "bg-amber-50 text-amber-700 border-amber-200",
            gray: "bg-gray-50 text-gray-700 border-gray-200",
        };

        return (
            <Badge className={`gap-1 ${colorMap[config.color]}`}>
                <Icon className="h-3 w-3" />
                {config.label}
            </Badge>
        );
    };

    const totalPaymentAmount = paymentDetails.reduce((sum, d) => sum + (d.amount || 0), 0);
    const paymentProgress = maxAllowedAmount > 0 ? (totalPaymentAmount / maxAllowedAmount) * 100 : 0;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 bg-gradient-to-br from-primary to-primary/70 rounded-xl shadow-lg">
                                <DollarSign className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                    Pagos a Proveedores
                                </h1>
                                <p className="text-muted-foreground">
                                    Gestiona los pagos de órdenes de compra
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <div className="flex-1">
                                <Label>Orden de Compra</Label>
                                <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar orden de compra" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {purchaseOrders.map((order) => {
                                            const supplier = suppliers.find(s => s.id === order.supplierId);
                                            return (
                                                <SelectItem key={order.id} value={order.id}>
                                                    {order.orderNumber} - {supplier?.name} - {formatCurrency(order.totalAmount)}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>
                            {selectedOrderId && remainingPayments > 0 && (
                                <Button onClick={() => setIsPaymentDialogOpen(true)} className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Registrar Pago
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {!selectedOrderId ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Selecciona una orden</h3>
                            <p className="text-muted-foreground">
                                Selecciona una orden de compra para gestionar sus pagos
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {selectedOrder && (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-none shadow-md hover:shadow-lg transition-all">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Orden</p>
                                                <p className="text-lg font-bold">{selectedOrder.orderNumber}</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {suppliers.find(s => s.id === selectedOrder.supplierId)?.name}
                                                </p>
                                            </div>
                                            <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                                                <FileText className="h-6 w-6 text-blue-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-none shadow-md hover:shadow-lg transition-all">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Total Orden</p>
                                                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(selectedOrder.totalAmount)}</p>
                                            </div>
                                            <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                                <DollarSign className="h-6 w-6 text-emerald-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-none shadow-md hover:shadow-lg transition-all">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Pagado</p>
                                                <p className="text-2xl font-bold text-purple-600">{formatCurrency(summary.totalPaid)}</p>
                                                <p className="text-xs text-muted-foreground mt-1">{summary.paymentCount} pagos</p>
                                            </div>
                                            <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                                                <CheckCircle className="h-6 w-6 text-purple-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-none shadow-md hover:shadow-lg transition-all">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Saldo Pendiente</p>
                                                <p className="text-2xl font-bold text-amber-600">{formatCurrency(selectedOrder.totalAmount - summary.totalPaid)}</p>
                                                <div className="mt-1 w-32">
                                                    <Progress value={paidPercentage} className="h-1.5" />
                                                </div>
                                            </div>
                                            <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                                                <Clock className="h-6 w-6 text-amber-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Mostrar alerta si se alcanzó el límite de pagos */}
                        {remainingPayments === 0 && summary.paymentCount > 0 && (
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Límite de pagos alcanzado</AlertTitle>
                                <AlertDescription>
                                    Esta orden tiene término de pago "{paymentTerms.replace('_', ' ')}" que permite solo {getAllowedPaymentCount(paymentTerms)} pago(s).
                                    Ya se han realizado {summary.paymentCount} pago(s).
                                </AlertDescription>
                            </Alert>
                        )}

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-wrap gap-3">
                                        <div className="relative flex-1 min-w-[200px]">
                                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                placeholder="Buscar por número de pago o referencia..."
                                                value={search}
                                                onChange={(e) => {
                                                    setSearch(e.target.value);
                                                    setCurrentPage(1);
                                                }}
                                                className="pl-9"
                                            />
                                        </div>

                                        <Select value={methodFilter} onValueChange={(v) => { setMethodFilter(v); setCurrentPage(1); }}>
                                            <SelectTrigger className="w-[180px]">
                                                <Filter className="mr-2 h-4 w-4" />
                                                <SelectValue placeholder="Método de pago" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todos</SelectItem>
                                                {paymentMethods.map(m => (
                                                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <Button variant="outline" onClick={handleClearFilters} className="gap-2">
                                            <Trash2 className="h-4 w-4" />
                                            Limpiar
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Historial de Pagos</CardTitle>
                                <CardDescription>
                                    {filteredPayments.length} {filteredPayments.length === 1 ? "pago encontrado" : "pagos encontrados"}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoadingPayments ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                        <span className="ml-3 text-muted-foreground">Cargando pagos...</span>
                                    </div>
                                ) : filteredPayments.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                                            <DollarSign className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <h3 className="text-lg font-semibold mb-2">No hay pagos registrados</h3>
                                        <p className="text-muted-foreground mb-4">
                                            {search ? "No hay resultados con los filtros aplicados" : "Esta orden aún no tiene pagos registrados"}
                                        </p>
                                        {remainingPayments > 0 && (
                                            <Button onClick={() => setIsPaymentDialogOpen(true)}>
                                                <Plus className="mr-2 h-4 w-4" />
                                                Registrar primer pago
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <div className="rounded-md border">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="bg-muted/50">
                                                        <TableHead className="cursor-pointer hover:bg-muted w-[100px]" onClick={() => handleSort("paymentNumber")}>
                                                            <div className="flex items-center gap-1">
                                                                # Pago
                                                                {sortField === "paymentNumber" && (sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                                                                {sortField !== "paymentNumber" && <ArrowUpDown className="h-3 w-3 opacity-50" />}
                                                            </div>
                                                        </TableHead>
                                                        <TableHead className="cursor-pointer hover:bg-muted" onClick={() => handleSort("paymentDate")}>
                                                            <div className="flex items-center gap-1">
                                                                Fecha
                                                                {sortField === "paymentDate" && (sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                                                                {sortField !== "paymentDate" && <ArrowUpDown className="h-3 w-3 opacity-50" />}
                                                            </div>
                                                        </TableHead>
                                                        <TableHead>Método</TableHead>
                                                        <TableHead>Referencia</TableHead>
                                                        <TableHead className="cursor-pointer hover:bg-muted text-right" onClick={() => handleSort("amount")}>
                                                            <div className="flex items-center justify-end gap-1">
                                                                Monto
                                                                {sortField === "amount" && (sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                                                                {sortField !== "amount" && <ArrowUpDown className="h-3 w-3 opacity-50" />}
                                                            </div>
                                                        </TableHead>
                                                        <TableHead>Documento</TableHead>
                                                        <TableHead className="text-right">Acciones</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {paginatedPayments.map((payment) => (
                                                        <TableRow key={payment.id} className="hover:bg-muted/50 transition-colors">
                                                            <TableCell className="font-mono font-medium">#{payment.paymentNumber}</TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-2">
                                                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                                                    {formatDate(payment.paymentDate)}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>{getPaymentMethodBadge(payment.paymentMethod)}</TableCell>
                                                            <TableCell>
                                                                {payment.referenceNumber && (
                                                                    <div className="flex flex-col">
                                                                        <span className="text-sm font-mono">{payment.referenceNumber}</span>
                                                                        {payment.bank && <span className="text-xs text-muted-foreground">{payment.bank}</span>}
                                                                    </div>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-right font-bold">{formatCurrency(payment.amount)}</TableCell>
                                                            <TableCell>
                                                                {payment.documentNumber && (
                                                                    <div className="flex flex-col">
                                                                        <span className="text-xs text-muted-foreground">{payment.documentType || "Documento"}</span>
                                                                        <span className="text-sm font-mono">{payment.documentNumber}</span>
                                                                    </div>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <div className="flex justify-end gap-1">
                                                                    <TooltipProvider>
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                                    onClick={() => {
                                                                                        setSelectedPayment(payment);
                                                                                        setIsDeleteDialogOpen(true);
                                                                                    }}
                                                                                >
                                                                                    <Trash2 className="h-4 w-4" />
                                                                                </Button>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>Eliminar pago</TooltipContent>
                                                                        </Tooltip>
                                                                    </TooltipProvider>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        {filteredPayments.length > 0 && (
                                            <div className="flex items-center justify-between mt-4">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm text-muted-foreground">
                                                        Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredPayments.length)} de {filteredPayments.length}
                                                    </p>
                                                    <Select value={itemsPerPage.toString()} onValueChange={(v) => { setItemsPerPage(Number(v)); setCurrentPage(1); }}>
                                                        <SelectTrigger className="w-[70px]">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="10">10</SelectItem>
                                                            <SelectItem value="25">25</SelectItem>
                                                            <SelectItem value="50">50</SelectItem>
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
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Registrar Pago</DialogTitle>
                        <DialogDescription>
                            <div className="space-y-1">
                                <p>Orden: <span className="font-mono">{selectedOrder?.orderNumber}</span> •
                                    Proveedor: <span className="font-medium">{selectedOrder && suppliers.find(s => s.id === selectedOrder.supplierId)?.name}</span></p>
                                <div className="text-sm space-y-0.5 mt-2 pt-2 border-t">
                                    <p className="flex justify-between">
                                        <span className="text-muted-foreground">Término de pago:</span>
                                        <span className="font-medium capitalize">{paymentTerms.replace('_', ' ')}</span>
                                    </p>
                                    <p className="flex justify-between">
                                        <span className="text-muted-foreground">Pagos permitidos:</span>
                                        <span className="font-medium">{getAllowedPaymentCount(paymentTerms)}</span>
                                    </p>
                                    <p className="flex justify-between">
                                        <span className="text-muted-foreground">Pagos realizados:</span>
                                        <span className="font-medium">{summary.paymentCount}</span>
                                    </p>
                                    <p className="flex justify-between">
                                        <span className="text-muted-foreground">Pagos restantes:</span>
                                        <span className={`font-medium ${remainingPayments === 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            {remainingPayments}
                                        </span>
                                    </p>
                                    <p className="flex justify-between">
                                        <span className="text-muted-foreground">Saldo pendiente:</span>
                                        <span className="font-bold text-primary">{formatCurrency(maxAllowedAmount)}</span>
                                    </p>
                                </div>
                            </div>
                        </DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="h-[60vh] pr-4">
                        <div className="space-y-6">
                            {/* Alerta de límite de pagos */}
                            {formErrors.paymentLimit && (
                                <Alert variant="destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Límite de pagos alcanzado</AlertTitle>
                                    <AlertDescription>{formErrors.paymentLimit}</AlertDescription>
                                </Alert>
                            )}

                            {/* Alerta de monto excedido */}
                            {formErrors.amount && !formErrors.paymentLimit && (
                                <Alert variant="destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Error en el monto</AlertTitle>
                                    <AlertDescription>{formErrors.amount}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label>Fecha de Pago *</Label>
                                <Input
                                    type="date"
                                    value={paymentForm.paymentDate}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label>Detalles de Pago *</Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleAddPaymentDetail}
                                        disabled={remainingPayments === 0}
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Agregar método
                                    </Button>
                                </div>

                                {paymentDetails.map((detail, index) => (
                                    <Card key={detail.id} className="relative">
                                        <CardContent className="p-4 space-y-3">
                                            {paymentDetails.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute top-2 right-2 h-6 w-6 text-destructive"
                                                    onClick={() => handleRemovePaymentDetail(detail.id)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-2">
                                                    <Label>Método de Pago *</Label>
                                                    <Select
                                                        value={detail.paymentMethod}
                                                        onValueChange={(v) => handlePaymentDetailChange(detail.id, "paymentMethod", v)}
                                                        disabled={remainingPayments === 0}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Seleccionar" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {paymentMethods.map(m => (
                                                                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Monto *</Label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        max={maxAllowedAmount}
                                                        step="0.01"
                                                        placeholder="0.00"
                                                        value={detail.amount || ""}
                                                        onChange={(e) => {
                                                            const value = parseFloat(e.target.value) || 0;
                                                            handlePaymentDetailChange(detail.id, "amount", value);
                                                        }}
                                                        disabled={remainingPayments === 0}
                                                        className={formErrors.amount ? "border-red-500" : ""}
                                                    />
                                                    {detail.amount > maxAllowedAmount && detail.amount > 0 && (
                                                        <p className="text-xs text-red-600">
                                                            Excede el saldo pendiente de {formatCurrency(maxAllowedAmount)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {(detail.paymentMethod === "bank_transfer" || detail.paymentMethod === "check") && (
                                                <div className="space-y-2">
                                                    <Label>Banco</Label>
                                                    <Input
                                                        placeholder="Nombre del banco"
                                                        value={detail.bank || ""}
                                                        onChange={(e) => handlePaymentDetailChange(detail.id, "bank", e.target.value)}
                                                    />
                                                </div>
                                            )}

                                            {(detail.paymentMethod === "bank_transfer" || detail.paymentMethod === "credit_card") && (
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-2">
                                                        <Label>Número de Referencia</Label>
                                                        <Input
                                                            placeholder="Referencia"
                                                            value={detail.referenceNumber || ""}
                                                            onChange={(e) => handlePaymentDetailChange(detail.id, "referenceNumber", e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Código de Autorización</Label>
                                                        <Input
                                                            placeholder="Código"
                                                            value={detail.authorizationCode || ""}
                                                            onChange={(e) => handlePaymentDetailChange(detail.id, "authorizationCode", e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Tipo de Documento</Label>
                                    <Select
                                        value={paymentForm.documentType}
                                        onValueChange={(v) => setPaymentForm({ ...paymentForm, documentType: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="invoice">Factura</SelectItem>
                                            <SelectItem value="receipt">Recibo</SelectItem>
                                            <SelectItem value="voucher">Comprobante</SelectItem>
                                            <SelectItem value="other">Otro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Número de Documento</Label>
                                    <Input
                                        placeholder="Número"
                                        value={paymentForm.documentNumber}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, documentNumber: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Notas</Label>
                                <Textarea
                                    placeholder="Notas adicionales sobre el pago..."
                                    value={paymentForm.notes}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                                    rows={2}
                                />
                            </div>

                            <Card className={`bg-muted/50 ${formErrors.amount ? 'border-red-500' : ''}`}>
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Total a Pagar</p>
                                            <p className={`text-2xl font-bold ${formErrors.amount ? 'text-red-600' : 'text-primary'}`}>
                                                {formatCurrency(totalPaymentAmount)}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Límite máximo: {formatCurrency(maxAllowedAmount)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-muted-foreground">Métodos de pago</p>
                                            <p className="text-lg font-semibold">{paymentDetails.length}</p>
                                        </div>
                                    </div>
                                    {maxAllowedAmount > 0 && totalPaymentAmount > 0 && (
                                        <div className="mt-3">
                                            <Progress value={paymentProgress} className="h-2" />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </ScrollArea>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setIsPaymentDialogOpen(false);
                            setFormErrors({});
                        }}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSubmitPayment}
                            disabled={isSubmitting || remainingPayments === 0 || !!formErrors.amount || totalPaymentAmount === 0 || totalPaymentAmount > maxAllowedAmount || paymentDetails.some(d => !d.paymentMethod)}
                        >
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Registrar Pago
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Eliminar Pago</DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de que deseas eliminar el pago #{selectedPayment?.paymentNumber}?
                            Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
                        <Button variant="destructive" onClick={handleDeletePayment}>
                            Eliminar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}