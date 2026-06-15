"use client"

import { useState, useMemo, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Search,
    Plus,
    Edit,
    Eye,
    Filter,
    Download,
    Printer,
    CheckCircle,
    XCircle,
    Clock,
    Calendar,
    Scissors,
    Stethoscope,
    Activity,
    AlertTriangle,
    User,
    Users,
    BedDouble,
    DollarSign,
    FileText,
    Shield,
    TrendingUp,
    MoreVertical,
    ClipboardCheck,
    Watch,
    Droplets,
    Syringe,
    Brain,
    Heart,
    Bone,
    RefreshCw,
    CalendarClock,
    CalendarDays,
    Loader2
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { useScheduledOperations } from "@/hooks/medical-hooks/use-scheduled-operations"
import { useOperationTypes } from "@/hooks/medical-hooks/use-operation-types"
import { useOperationRecords } from "@/hooks/medical-hooks/use-operation-records"
import { ScheduledOperation, ScheduledOperationStatus } from "@/lib/api/types/medical-types/scheduled-operation.type"
import { OperationRecord } from "@/lib/api/types/medical-types/operation-record.type"

// Transform API response to page-compatible format
function transformScheduledOperation(op: ScheduledOperation) {
    const scheduledDate = op.scheduled_date instanceof Date
        ? op.scheduled_date.toISOString()
        : op.scheduled_date;
    const createdAt = op.created_at instanceof Date
        ? op.created_at.toISOString()
        : op.created_at;

    return {
        id: op.id,
        case_file_id: op.case_file_id,
        case_number: op.case_file?.case_number || "",
        patient_name: op.case_file?.patient
            ? `${op.case_file.patient.first_name} ${op.case_file.patient.last_name}`
            : "Paciente no encontrado",
        patient_age: 0,
        patient_gender: "No especificado",
        operation_type_id: op.operation_type_id,
        operation_type_name: op.operation_type?.name || "Tipo no encontrado",
        operation_type_code: op.operation_type?.code || "",
        primary_surgeon_id: op.primary_surgeon_id,
        primary_surgeon_name: op.primary_surgeon
            ? `Dr(a). ${op.primary_surgeon.first_name} ${op.primary_surgeon.last_name}`
            : "Cirujano no asignado",
        anesthesiologist_id: op.anesthesiologist_id,
        anesthesiologist_name: op.anesthesiologist
            ? `Dr(a). ${op.anesthesiologist.first_name} ${op.anesthesiologist.last_name}`
            : undefined,
        scheduled_date: scheduledDate,
        estimated_duration_minutes: op.estimated_duration_minutes,
        operating_room: op.operating_room || "No asignado",
        pre_operative_notes: op.pre_operative_notes,
        status: op.status,
        complexity: op.operation_type?.complexity || "moderate",
        specialty: op.primary_surgeon?.specialty || "Cirugía General",
        base_cost: 0,
        created_at: createdAt
    };
}

type TransformedOperation = ReturnType<typeof transformScheduledOperation>;

// Configuración de estados
const operationStatusConfig = {
    scheduled: { label: "Programada", color: "bg-blue-100 text-blue-800", icon: CalendarClock },
    in_progress: { label: "En Proceso", color: "bg-warning/10 text-warning", icon: Activity },
    completed: { label: "Completada", color: "bg-success/10 text-success", icon: CheckCircle },
    cancelled: { label: "Cancelada", color: "bg-destructive/10 text-destructive", icon: XCircle },
    postponed: { label: "Aplazada", color: "bg-gray-100 text-gray-800", icon: Clock }
}

const complexityConfig = {
    minor: { label: "Menor", color: "bg-success/10 text-success", icon: Scissors },
    moderate: { label: "Moderada", color: "bg-warning/10 text-warning", icon: Activity },
    major: { label: "Mayor", color: "bg-destructive/10 text-destructive", icon: AlertTriangle }
}

const specialtyConfig = {
    "Cirugía General": { label: "Cirugía General", color: "bg-blue-500/10 text-blue-600", icon: Scissors },
    "Ginecología y Obstetricia": { label: "Gineco-Obstetricia", color: "bg-pink-500/10 text-pink-600", icon: Heart },
    "Ortopedia": { label: "Ortopedia", color: "bg-purple-500/10 text-purple-600", icon: Bone },
    "Neurocirugía": { label: "Neurocirugía", color: "bg-teal-500/10 text-teal-600", icon: Brain },
    "Cardiología": { label: "Cardiología", color: "bg-red-500/10 text-red-600", icon: Heart }
}

export default function OperationsPage() {
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState<ScheduledOperationStatus | "all">("all")
    const [specialtyFilter, setSpecialtyFilter] = useState("all")
    const [selectedOperation, setSelectedOperation] = useState<TransformedOperation | null>(null)
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

    const { operations, isLoading, error, fetchOperations, createOperation, updateOperation, updateOperationStatus, deleteOperation } = useScheduledOperations({ status: statusFilter === "all" ? undefined : statusFilter })

    const {
        operationTypes,
        isLoading: isLoadingTypes,
        fetchOperationTypes
    } = useOperationTypes({ is_active: true })

    const {
        records,
        isLoading: isLoadingRecords,
        fetchRecords,
        getRecordByScheduledOperation
    } = useOperationRecords()

    const [currentRecord, setCurrentRecord] = useState<OperationRecord | null>(null)

    useEffect(() => {
        if (selectedOperation) {
            getRecordByScheduledOperation(selectedOperation.id).then(setCurrentRecord)
        }
    }, [selectedOperation])

    const transformedOperations = useMemo(() => {
        return operations.map(transformScheduledOperation)
    }, [operations])
    const [selectedOperationType, setSelectedOperationType] = useState<any>(null)
    const [isOperationDialogOpen, setIsOperationDialogOpen] = useState(false)
    const [isRecordDialogOpen, setIsRecordDialogOpen] = useState(false)
    const [isTypeDialogOpen, setIsTypeDialogOpen] = useState(false)
    const [activeTab, setActiveTab] = useState("scheduled")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [operationForm, setOperationForm] = useState({
        case_file_id: "",
        operation_type_id: "",
        primary_surgeon_id: "",
        anesthesiologist_id: "",
        scheduled_date: "",
        estimated_duration_minutes: "",
        operating_room: "",
        pre_operative_notes: ""
    })

    const [recordForm, setRecordForm] = useState({
        actual_start_time: "",
        actual_end_time: "",
        anesthesia_type: "",
        procedure_performed: "",
        findings: "",
        complications: "",
        blood_loss_ml: "",
        specimens_sent: [] as string[],
        post_operative_orders: ""
    })

    // Filtrar operaciones
    const filteredOperations = useMemo(() => {
        return transformedOperations.filter(op => {
            const matchesSearch =
                op.patient_name.toLowerCase().includes(search.toLowerCase()) ||
                op.case_number.toLowerCase().includes(search.toLowerCase()) ||
                op.operation_type_name.toLowerCase().includes(search.toLowerCase()) ||
                op.primary_surgeon_name.toLowerCase().includes(search.toLowerCase())

            const matchesStatus =
                statusFilter === "all" ||
                op.status === statusFilter

            const matchesSpecialty =
                specialtyFilter === "all" ||
                op.specialty === specialtyFilter

            return matchesSearch && matchesStatus && matchesSpecialty
        })
    }, [search, statusFilter, specialtyFilter])

    // Estadísticas
    const stats = useMemo(() => {
        const today = new Date()
        const scheduledToday = transformedOperations.filter(op => {
            const opDate = new Date(op.scheduled_date)
            return opDate.toDateString() === today.toDateString() && op.status === "scheduled"
        }).length

        const completedThisWeek = transformedOperations.filter(op => {
            const opDate = new Date(op.scheduled_date)
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
            return opDate >= weekAgo && op.status === "completed"
        }).length

        const totalRevenue = transformedOperations
            .filter(op => op.status === "completed")
            .reduce((sum, op) => sum + op.base_cost, 0)

        const avgDuration = transformedOperations.length > 0
            ? transformedOperations.reduce((sum, op) => sum + op.estimated_duration_minutes, 0) / transformedOperations.length
            : 0

        return {
            totalScheduled: transformedOperations.filter(op => op.status === "scheduled").length,
            inProgress: transformedOperations.filter(op => op.status === "in_progress").length,
            scheduledToday,
            completedThisWeek,
            totalRevenue,
            avgDuration,
            cancellationRate: (transformedOperations.filter(op => op.status === "cancelled").length / transformedOperations.length) * 100
        }
    }, [])

    // Handlers
    const handleViewOperation = (operation: TransformedOperation) => {
        setSelectedOperation(operation)
        if (operation) {
            setOperationForm({
                case_file_id: operation.case_file_id,
                operation_type_id: operation.operation_type_id,
                primary_surgeon_id: operation.primary_surgeon_id,
                anesthesiologist_id: operation.anesthesiologist_id || "",
                scheduled_date: typeof operation.scheduled_date === 'string'
                    ? operation.scheduled_date.slice(0, 16)
                    : new Date(operation.scheduled_date).toISOString().slice(0, 16),
                estimated_duration_minutes: String(operation.estimated_duration_minutes),
                operating_room: operation.operating_room || "",
                pre_operative_notes: operation.pre_operative_notes || ""
            });
        }
        setIsOperationDialogOpen(true)
    }

    const handleRecordOperation = (operation: any) => {
        setSelectedOperation(operation)
        setIsRecordDialogOpen(true)
    }

    const handleViewOperationType = (type: any) => {
        setSelectedOperationType(type)
        setIsTypeDialogOpen(true)
    }

    const handleSaveOperation = async () => {
        try {
            if (selectedOperation) {
                await updateOperation(selectedOperation.id, {
                    scheduled_date: operationForm.scheduled_date,
                    estimated_duration_minutes: parseInt(operationForm.estimated_duration_minutes) || undefined,
                    operating_room: operationForm.operating_room || undefined,
                    pre_operative_notes: operationForm.pre_operative_notes || undefined
                });
            } else {
                await createOperation({
                    case_file_id: operationForm.case_file_id,
                    operation_type_id: operationForm.operation_type_id,
                    primary_surgeon_id: operationForm.primary_surgeon_id,
                    anesthesiologist_id: operationForm.anesthesiologist_id || undefined,
                    scheduled_date: operationForm.scheduled_date,
                    estimated_duration_minutes: parseInt(operationForm.estimated_duration_minutes) || 60,
                    operating_room: operationForm.operating_room || undefined,
                    pre_operative_notes: operationForm.pre_operative_notes || undefined
                });
            }
            setOperationForm({
                case_file_id: "",
                operation_type_id: "",
                primary_surgeon_id: "",
                anesthesiologist_id: "",
                scheduled_date: "",
                estimated_duration_minutes: "",
                operating_room: "",
                pre_operative_notes: ""
            });
            setIsOperationDialogOpen(false);
            setSelectedOperation(null);
        } catch (error) {
            console.error("Error saving operation:", error);
        }
    }

    const handleSaveRecord = () => {
        setIsRecordDialogOpen(false)
        setSelectedOperation(null)
    }

    // Obtener configuración del estado
    const getStatusConfig = (status: string) => {
        return operationStatusConfig[status as keyof typeof operationStatusConfig] || operationStatusConfig.scheduled
    }

    const getComplexityConfig = (complexity: string) => {
        return complexityConfig[complexity as keyof typeof complexityConfig] || complexityConfig.moderate
    }

    const getSpecialtyConfig = (specialty: string) => {
        return specialtyConfig[specialty as keyof typeof specialtyConfig] || specialtyConfig["Cirugía General"]
    }

    // Obtener icono según especialidad - CORREGIDO
    const getSpecialtyIcon = (specialty: string) => {
        const config = getSpecialtyConfig(specialty)
        return config.icon
    }

    // Formatear fecha
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-GT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    // Formatear duración
    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        return `${hours}h ${mins}m`
    }

    // Calcular tiempo restante
    const getTimeUntilScheduled = (scheduledDate: string) => {
        const now = new Date()
        const scheduled = new Date(scheduledDate)
        const diffMs = scheduled.getTime() - now.getTime()
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        const diffDays = Math.floor(diffHours / 24)

        if (diffMs < 0) return { text: "Vencida", color: "text-destructive" }
        if (diffDays > 0) return { text: `${diffDays} días`, color: "text-success" }
        if (diffHours > 0) return { text: `${diffHours} horas`, color: "text-warning" }
        return { text: "Próxima", color: "text-destructive" }
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Operaciones Quirúrgicas</h1>
                        <p className="text-muted-foreground">
                            Programación y seguimiento de procedimientos quirúrgicos
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setActiveTab(activeTab === "scheduled" ? "types" : "scheduled")}
                        >
                            {activeTab === "scheduled" ? (
                                <>
                                    <Scissors className="mr-2 h-4 w-4" />
                                    Ver Tipos
                                </>
                            ) : (
                                <>
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Ver Programadas
                                </>
                            )}
                        </Button>
                        {/* Dialog para Crear/Editar Operación */}
                        <Dialog open={isOperationDialogOpen} onOpenChange={setIsOperationDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Nueva Operación
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
                                <DialogHeader className="sticky top-0 z-10 bg-gradient-to-r from-primary/5 via-background to-background border-b px-6 py-4">
                                    <DialogTitle className="flex items-center gap-2 text-xl">
                                        <div className="p-2 rounded-lg bg-primary/10">
                                            <Scissors className="h-5 w-5 text-primary" />
                                        </div>
                                        {selectedOperation ? "Editar Operación" : "Programar Nueva Operación"}
                                    </DialogTitle>
                                    <DialogDescription className="mt-1">
                                        Complete los datos necesarios para la programación quirúrgica
                                    </DialogDescription>
                                </DialogHeader>

                                <ScrollArea className="h-[60vh] px-6 py-4">
                                    <div className="space-y-6">
                                        {/* Tipo de Operación y Paciente */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium flex items-center gap-2">
                                                    <Scissors className="h-4 w-4 text-muted-foreground" />
                                                    Tipo de Operación <span className="text-destructive">*</span>
                                                </Label>
                                                <Select
                                                    value={operationForm.operation_type_id}
                                                    onValueChange={(value) => setOperationForm({ ...operationForm, operation_type_id: value })}
                                                >
                                                    <SelectTrigger className="h-11">
                                                        <SelectValue placeholder="Seleccionar tipo" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {operationTypes.map((type) => (
                                                            <SelectItem key={type.id} value={type.id}>
                                                                <div className="flex items-center gap-2">
                                                                    <Scissors className="h-4 w-4" />
                                                                    {type.name}
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <p className="text-xs text-muted-foreground">
                                                    Procedimiento quirúrgico a realizar
                                                </p>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium flex items-center gap-2">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    Paciente <span className="text-destructive">*</span>
                                                </Label>
                                                <Select
                                                    value={operationForm.case_file_id}
                                                    onValueChange={(value) => setOperationForm({ ...operationForm, case_file_id: value })}
                                                >
                                                    <SelectTrigger className="h-11">
                                                        <SelectValue placeholder="Seleccionar paciente" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {/* Aquí deberías cargar los pacientes desde un hook */}
                                                        <SelectItem value="case-001">
                                                            <div className="flex flex-col">
                                                                <span className="font-medium">Ana Sofía Ramírez Soto</span>
                                                                <span className="text-xs text-muted-foreground">E-20251207-0001</span>
                                                            </div>
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <p className="text-xs text-muted-foreground">
                                                    Paciente que será intervenido
                                                </p>
                                            </div>
                                        </div>

                                        {/* Fecha y Duración */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    Fecha y Hora <span className="text-destructive">*</span>
                                                </Label>
                                                <Input
                                                    type="datetime-local"
                                                    value={operationForm.scheduled_date}
                                                    onChange={(e) => setOperationForm({ ...operationForm, scheduled_date: e.target.value })}
                                                    className="h-11"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium flex items-center gap-2">
                                                    <Watch className="h-4 w-4 text-muted-foreground" />
                                                    Duración Estimada <span className="text-destructive">*</span>
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        type="number"
                                                        placeholder="120"
                                                        value={operationForm.estimated_duration_minutes}
                                                        onChange={(e) => setOperationForm({ ...operationForm, estimated_duration_minutes: e.target.value })}
                                                        className="h-11 pr-16"
                                                    />
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                                                        minutos
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    Tiempo estimado del procedimiento
                                                </p>
                                            </div>
                                        </div>

                                        {/* Cirujano y Anestesiólogo */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium flex items-center gap-2">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    Cirujano Principal <span className="text-destructive">*</span>
                                                </Label>
                                                <Select
                                                    value={operationForm.primary_surgeon_id}
                                                    onValueChange={(value) => setOperationForm({ ...operationForm, primary_surgeon_id: value })}
                                                >
                                                    <SelectTrigger className="h-11">
                                                        <SelectValue placeholder="Seleccionar cirujano" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {/* Aquí deberías cargar los doctores desde un hook */}
                                                        <SelectItem value="doc-001">
                                                            <div className="flex items-center gap-2">
                                                                <User className="h-4 w-4" />
                                                                Dr. Mario Fuentes
                                                            </div>
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium flex items-center gap-2">
                                                    <Syringe className="h-4 w-4 text-muted-foreground" />
                                                    Anestesiólogo
                                                </Label>
                                                <Select
                                                    value={operationForm.anesthesiologist_id}
                                                    onValueChange={(value) => setOperationForm({ ...operationForm, anesthesiologist_id: value })}
                                                >
                                                    <SelectTrigger className="h-11">
                                                        <SelectValue placeholder="Seleccionar anestesiólogo" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="doc-002">
                                                            <div className="flex items-center gap-2">
                                                                <Syringe className="h-4 w-4" />
                                                                Dra. Ana Lucía Jiménez
                                                            </div>
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        {/* Quirófano y Urgencia */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium flex items-center gap-2">
                                                    <BedDouble className="h-4 w-4 text-muted-foreground" />
                                                    Quirófano <span className="text-destructive">*</span>
                                                </Label>
                                                <Select
                                                    value={operationForm.operating_room}
                                                    onValueChange={(value) => setOperationForm({ ...operationForm, operating_room: value })}
                                                >
                                                    <SelectTrigger className="h-11">
                                                        <SelectValue placeholder="Seleccionar quirófano" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Q01">Quirófano 01</SelectItem>
                                                        <SelectItem value="Q02">Quirófano 02</SelectItem>
                                                        <SelectItem value="Q03">Quirófano 03</SelectItem>
                                                        <SelectItem value="Q04">Quirófano 04</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium flex items-center gap-2">
                                                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                                                    Nivel de Urgencia
                                                </Label>
                                                <Select>
                                                    <SelectTrigger className="h-11">
                                                        <SelectValue placeholder="Seleccionar nivel" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="elective">
                                                            <div className="flex items-center gap-2">
                                                                <Clock className="h-4 w-4 text-green-600" />
                                                                Electiva
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="urgent">
                                                            <div className="flex items-center gap-2">
                                                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                                                Urgente
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="emergency">
                                                            <div className="flex items-center gap-2">
                                                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                                                Emergencia
                                                            </div>
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        {/* Notas Pre-operatorias */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                Notas Pre-operatorias
                                            </Label>
                                            <Textarea
                                                placeholder="Observaciones, preparación especial, alergias conocidas, etc."
                                                value={operationForm.pre_operative_notes}
                                                onChange={(e) => setOperationForm({ ...operationForm, pre_operative_notes: e.target.value })}
                                                rows={3}
                                                className="resize-none"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Información relevante antes de la cirugía
                                            </p>
                                        </div>

                                        {/* Alerta de confirmación */}
                                        <Alert className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                                            <AlertTitle className="text-amber-800 dark:text-amber-400">Confirmación Requerida</AlertTitle>
                                            <AlertDescription className="text-amber-700 dark:text-amber-500">
                                                Verifique la disponibilidad del quirófano y equipo antes de confirmar la programación.
                                            </AlertDescription>
                                        </Alert>
                                    </div>
                                </ScrollArea>

                                <DialogFooter className="sticky bottom-0 z-10 bg-background border-t px-6 py-4">
                                    <Button variant="outline" onClick={() => setIsOperationDialogOpen(false)} className="min-w-[100px]">
                                        Cancelar
                                    </Button>
                                    <Button onClick={handleSaveOperation} disabled={isSubmitting} className="min-w-[140px] gap-2">
                                        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                        <CalendarClock className="h-4 w-4" />
                                        {selectedOperation ? "Actualizar Operación" : "Programar Operación"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        {/* Dialog para Detalle de Operación */}
                        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
                                {selectedOperation && (
                                    <>
                                        {/* HEADER CORRECTO - DialogTitle DENTRO de DialogHeader */}
                                        <div className="sticky top-0 z-10 bg-gradient-to-r from-primary/5 via-background to-background border-b px-6 py-4">
                                            <DialogHeader className="p-0">
                                                <DialogTitle className="flex items-center gap-2 text-xl">
                                                    <div className="p-2 rounded-lg bg-primary/10">
                                                        <Eye className="h-5 w-5 text-primary" />
                                                    </div>
                                                    Detalle de Operación
                                                </DialogTitle>
                                                <DialogDescription className="mt-1">
                                                    Operación: <span className="font-medium">{selectedOperation.operation_type_name}</span>
                                                </DialogDescription>
                                            </DialogHeader>
                                        </div>

                                        <ScrollArea className="h-[60vh] px-6 py-4">
                                            {/* contenido... */}
                                        </ScrollArea>

                                        <DialogFooter className="sticky bottom-0 z-10 bg-background border-t px-6 py-4">
                                            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>Cerrar</Button>
                                            {selectedOperation.status === "scheduled" && (
                                                <Button onClick={() => {
                                                    setIsDetailDialogOpen(false)
                                                    handleRecordOperation(selectedOperation)
                                                }}>
                                                    <ClipboardCheck className="mr-2 h-4 w-4" />
                                                    Iniciar Operación
                                                </Button>
                                            )}
                                        </DialogFooter>
                                    </>
                                )}
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                <Calendar className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Programadas</p>
                                <p className="text-2xl font-bold">{stats.totalScheduled}</p>
                                <p className="text-xs text-muted-foreground">
                                    {stats.scheduledToday} hoy
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                                <Scissors className="h-6 w-6 text-success" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Esta Semana</p>
                                <p className="text-2xl font-bold">{stats.completedThisWeek}</p>
                                <p className="text-xs text-muted-foreground">
                                    Completadas
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
                                <Watch className="h-6 w-6 text-warning" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Duración Prom.</p>
                                <p className="text-2xl font-bold">{formatDuration(stats.avgDuration)}</p>
                                <p className="text-xs text-muted-foreground">
                                    Por operación
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10">
                                <DollarSign className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Ingresos</p>
                                <p className="text-2xl font-bold">Q{stats.totalRevenue.toLocaleString('es-GT', { minimumFractionDigits: 2 })}</p>
                                <p className="text-xs text-muted-foreground">
                                    Últimas completadas
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="scheduled" className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Operaciones Programadas
                        </TabsTrigger>
                        <TabsTrigger value="types" className="flex items-center gap-2">
                            <Scissors className="h-4 w-4" />
                            Tipos de Operación
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Análisis
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab: Operaciones Programadas */}
                    <TabsContent value="scheduled" className="space-y-4">
                        {/* Filtros */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar por paciente, caso, tipo de operación o cirujano..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="pl-9"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ScheduledOperationStatus | "all")}>
                                            <SelectTrigger className="w-[150px]">
                                                <SelectValue placeholder="Estado" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todos</SelectItem>
                                                <SelectItem value="scheduled">Programadas</SelectItem>
                                                <SelectItem value="in_progress">En Proceso</SelectItem>
                                                <SelectItem value="completed">Completadas</SelectItem>
                                                <SelectItem value="cancelled">Canceladas</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Especialidad" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todas</SelectItem>
                                                <SelectItem value="Cirugía General">Cirugía General</SelectItem>
                                                <SelectItem value="Ginecología y Obstetricia">Gineco-Obstetricia</SelectItem>
                                                <SelectItem value="Ortopedia">Ortopedia</SelectItem>
                                                <SelectItem value="Neurocirugía">Neurocirugía</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tabla de Operaciones */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Operaciones Programadas</CardTitle>
                                <CardDescription>
                                    {filteredOperations.length} {filteredOperations.length === 1 ? 'operación encontrada' : 'operaciones encontradas'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Paciente / Caso</TableHead>
                                            <TableHead>Operación</TableHead>
                                            <TableHead>Programación</TableHead>
                                            <TableHead>Quirófano</TableHead>
                                            <TableHead>Equipo Médico</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead className="text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredOperations.map((operation) => {
                                            const StatusIcon = getStatusConfig(operation.status).icon
                                            const timeUntil = getTimeUntilScheduled(operation.scheduled_date)
                                            const isUrgent = operation.status === "scheduled" && timeUntil.text === "Próxima"
                                            const SpecialtyIcon = getSpecialtyIcon(operation.specialty) // Obtener el componente

                                            return (
                                                <TableRow key={operation.id} className="hover:bg-muted/50">
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{operation.patient_name}</span>
                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                <span>{operation.patient_age} años</span>
                                                                <Separator orientation="vertical" className="h-3" />
                                                                <span>{operation.patient_gender}</span>
                                                                <Separator orientation="vertical" className="h-3" />
                                                                <Badge variant="outline" className="font-mono text-xs">
                                                                    {operation.case_number}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-2">
                                                                {/* CORRECCIÓN: Usar el componente directamente */}
                                                                <SpecialtyIcon className="h-4 w-4 text-muted-foreground" />
                                                                <span className="font-medium">{operation.operation_type_name}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <Badge className={getComplexityConfig(operation.complexity).color}>
                                                                    {getComplexityConfig(operation.complexity).label}
                                                                </Badge>
                                                                <Badge variant="outline" className="text-xs">
                                                                    {formatDuration(operation.estimated_duration_minutes)}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                                                <span className="text-sm">
                                                                    {formatDate(operation.scheduled_date)}
                                                                </span>
                                                            </div>
                                                            {operation.status === "scheduled" && (
                                                                <div className="mt-1">
                                                                    <Badge variant="outline" className={`gap-1 text-xs ${timeUntil.color}`}>
                                                                        <Clock className="h-3 w-3" />
                                                                        {timeUntil.text}
                                                                    </Badge>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <BedDouble className="h-4 w-4 text-muted-foreground" />
                                                            <Badge variant="outline" className="font-mono">
                                                                {operation.operating_room}
                                                            </Badge>
                                                        </div>
                                                        <div className="text-xs text-muted-foreground mt-1">
                                                            {operation.specialty}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <User className="h-3 w-3 text-muted-foreground" />
                                                                <span className="text-sm">{operation.primary_surgeon_name}</span>
                                                                <Badge variant="outline" className="text-xs">Cirujano</Badge>
                                                            </div>
                                                            {operation.anesthesiologist_name && (
                                                                <div className="flex items-center gap-2">
                                                                    <Syringe className="h-3 w-3 text-muted-foreground" />
                                                                    <span className="text-sm">{operation.anesthesiologist_name}</span>
                                                                    <Badge variant="outline" className="text-xs">Anestesia</Badge>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <StatusIcon className="h-4 w-4" />
                                                            <Badge className={getStatusConfig(operation.status).color}>
                                                                {getStatusConfig(operation.status).label}
                                                            </Badge>
                                                            {isUrgent && (
                                                                <Badge variant="outline" className="gap-1 text-xs bg-destructive/10 text-destructive">
                                                                    <AlertTriangle className="h-3 w-3" />
                                                                    Urgente
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground mt-1">
                                                            Q{operation.base_cost.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleViewOperation(operation)}
                                                                title="Ver detalles"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>

                                                            {operation.status === "scheduled" && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleRecordOperation(operation)}
                                                                    title="Registrar operación"
                                                                    className="text-success hover:text-success"
                                                                >
                                                                    <ClipboardCheck className="h-4 w-4" />
                                                                </Button>
                                                            )}

                                                            {operation.status === "in_progress" && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleRecordOperation(operation)}
                                                                    title="Completar registro"
                                                                    className="text-warning hover:text-warning"
                                                                >
                                                                    <Activity className="h-4 w-4" />
                                                                </Button>
                                                            )}

                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon">
                                                                        <MoreVertical className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                                    <DropdownMenuItem onClick={() => handleViewOperation(operation)}>
                                                                        <Eye className="mr-2 h-4 w-4" />
                                                                        Ver Detalles
                                                                    </DropdownMenuItem>

                                                                    {operation.status === "scheduled" && (
                                                                        <DropdownMenuItem onClick={async () => {
                                                                            try {
                                                                                await updateOperationStatus(operation.id, { status: ScheduledOperationStatus.IN_PROGRESS });
                                                                                handleRecordOperation(operation);
                                                                            } catch (error) {
                                                                                console.error("Error starting operation:", error);
                                                                            }
                                                                        }}>
                                                                            <ClipboardCheck className="mr-2 h-4 w-4" />
                                                                            Iniciar Operación
                                                                        </DropdownMenuItem>
                                                                    )}

                                                                    {operation.status === "in_progress" && (
                                                                        <DropdownMenuItem onClick={() => handleRecordOperation(operation)}>
                                                                            <Activity className="mr-2 h-4 w-4" />
                                                                            Completar Registro
                                                                        </DropdownMenuItem>
                                                                    )}

                                                                    {operation.status === "scheduled" && (
                                                                        <>
                                                                            <DropdownMenuItem>
                                                                                <Edit className="mr-2 h-4 w-4" />
                                                                                Re-programar
                                                                            </DropdownMenuItem>

                                                                            <DropdownMenuSeparator />

                                                                            <DropdownMenuItem
                                                                                className="text-destructive"
                                                                                onClick={async () => {
                                                                                    try {
                                                                                        await updateOperationStatus(operation.id, { status: ScheduledOperationStatus.CANCELLED });
                                                                                    } catch (error) {
                                                                                        console.error("Error cancelling operation:", error);
                                                                                    }
                                                                                }}
                                                                            >
                                                                                <XCircle className="mr-2 h-4 w-4" />
                                                                                Cancelar Operación
                                                                            </DropdownMenuItem>
                                                                        </>
                                                                    )}

                                                                    <DropdownMenuSeparator />

                                                                    <DropdownMenuItem>
                                                                        <Printer className="mr-2 h-4 w-4" />
                                                                        Imprimir Orden
                                                                    </DropdownMenuItem>

                                                                    <DropdownMenuItem>
                                                                        <FileText className="mr-2 h-4 w-4" />
                                                                        Ver Expediente
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </CardContent>
                            <CardFooter className="flex-col items-start gap-2 border-t px-6 py-4">
                                <div className="text-sm text-muted-foreground">
                                    <span className="font-medium">Tasa de cancelación:</span> {stats.cancellationRate.toFixed(1)}%
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <Download className="h-4 w-4" />
                                        Exportar Programa
                                    </Button>
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <Printer className="h-4 w-4" />
                                        Imprimir Programa
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    {/* Tab: Tipos de Operación */}
                    <TabsContent value="types">
                        <Card>
                            <CardHeader>
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <CardTitle>Tipos de Operación</CardTitle>
                                        <CardDescription>
                                            Catálogo de procedimientos quirúrgicos disponibles
                                        </CardDescription>
                                    </div>
                                    <Dialog open={isTypeDialogOpen} onOpenChange={setIsTypeDialogOpen}>
                                        <DialogContent className="max-w-2xl">
                                            <DialogHeader>
                                                <DialogTitle>
                                                    {selectedOperationType ? "Editar Tipo de Operación" : "Nuevo Tipo de Operación"}
                                                </DialogTitle>
                                                <DialogDescription>
                                                    Defina un nuevo tipo de procedimiento quirúrgico
                                                </DialogDescription>
                                            </DialogHeader>

                                            <div className="space-y-6 py-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="type_code">Código *</Label>
                                                        <Input
                                                            id="type_code"
                                                            placeholder="Ej: SUR-CHOL-LAP"
                                                            value={selectedOperationType?.code || ""}
                                                        />
                                                        <p className="text-xs text-muted-foreground">Identificador único para el sistema</p>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="type_name">Nombre *</Label>
                                                        <Input
                                                            id="type_name"
                                                            placeholder="Ej: Colecistectomía Laparoscópica"
                                                            value={selectedOperationType?.name || ""}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="type_description">Descripción</Label>
                                                    <Textarea
                                                        id="type_description"
                                                        placeholder="Descripción detallada del procedimiento..."
                                                        value={selectedOperationType?.description || ""}
                                                        rows={2}
                                                    />
                                                </div>

                                                <div className="grid grid-cols-3 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="type_specialty">Especialidad *</Label>
                                                        <Select>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Seleccionar" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="general">Cirugía General</SelectItem>
                                                                <SelectItem value="gynecology">Gineco-Obstetricia</SelectItem>
                                                                <SelectItem value="orthopedics">Ortopedia</SelectItem>
                                                                <SelectItem value="neurosurgery">Neurocirugía</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="type_complexity">Complejidad *</Label>
                                                        <Select>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Seleccionar" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="minor">Menor</SelectItem>
                                                                <SelectItem value="moderate">Moderada</SelectItem>
                                                                <SelectItem value="major">Mayor</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="type_duration">Duración (min) *</Label>
                                                        <Input
                                                            id="type_duration"
                                                            type="number"
                                                            placeholder="120"
                                                            value={selectedOperationType?.estimated_duration_minutes || ""}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="type_cost">Costo Base (Q) *</Label>
                                                        <Input
                                                            id="type_cost"
                                                            type="number"
                                                            step="0.01"
                                                            placeholder="4500.00"
                                                            value={selectedOperationType?.base_cost || ""}
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="type_anesthesia">Requiere Anestesia</Label>
                                                        <div className="flex items-center space-x-2 pt-2">
                                                            <Switch id="type_anesthesia" defaultChecked />
                                                            <Label htmlFor="type_anesthesia">Sí / No</Label>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Label>Requisitos Pre-operatorios</Label>
                                                        <Textarea
                                                            placeholder="Lista de requisitos separados por coma..."
                                                            rows={2}
                                                            defaultValue={selectedOperationType?.pre_operative_requirements?.join(', ') || ""}
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label>Cuidados Post-operatorios</Label>
                                                        <Textarea
                                                            placeholder="Lista de cuidados separados por coma..."
                                                            rows={2}
                                                            defaultValue={selectedOperationType?.post_operative_care?.join(', ') || ""}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => setIsTypeDialogOpen(false)}>
                                                    Cancelar
                                                </Button>
                                                <Button onClick={() => {
                                                    setIsTypeDialogOpen(false)
                                                }}>
                                                    {selectedOperationType ? "Actualizar Tipo" : "Crear Tipo"}
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Código</TableHead>
                                            <TableHead>Nombre</TableHead>
                                            <TableHead>Especialidad</TableHead>
                                            <TableHead>Complejidad</TableHead>
                                            <TableHead className="text-right">Duración</TableHead>
                                            <TableHead className="text-right">Costo Base</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead className="text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {operationTypes.map((type) => {
                                            const SpecialtyIcon = getSpecialtyIcon(type.specialty?.name || "Cirugía General") // Obtener el componente

                                            return (
                                                <TableRow key={type.id} className="hover:bg-muted/50">
                                                    <TableCell className="font-medium">
                                                        <Badge variant="outline" className="font-mono">
                                                            {type.code}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{type.name}</span>
                                                            <span className="text-xs text-muted-foreground line-clamp-1">
                                                                {type.description}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <SpecialtyIcon className="h-4 w-4" />
                                                            <Badge className={getSpecialtyConfig(type.specialty?.name || "Cirugía General").color}>
                                                                {type.specialty?.name}
                                                            </Badge>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={getComplexityConfig(type.complexity).color}>
                                                            {getComplexityConfig(type.complexity).label}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Watch className="h-3 w-3 text-muted-foreground" />
                                                            <span>{formatDuration(type.estimated_duration_minutes || 0)}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="font-medium">
                                                            Q{type.base_cost.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {type.anesthesia_required ? "Con anestesia" : "Sin anestesia"}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={type.is_active ? "default" : "secondary"}>
                                                            {type.is_active ? "Activo" : "Inactivo"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleViewOperationType(type)}
                                                                title="Ver detalles"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => {
                                                                    setSelectedOperationType(type)
                                                                    setIsTypeDialogOpen(true)
                                                                }}
                                                                title="Editar"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab: Análisis */}
                    <TabsContent value="analytics">
                        <Card>
                            <CardHeader>
                                <CardTitle>Análisis de Operaciones</CardTitle>
                                <CardDescription>
                                    Estadísticas y métricas de desempeño quirúrgico
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Distribución por especialidad */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base">Distribución por Especialidad</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {Object.entries(specialtyConfig).map(([specialty, config]) => {
                                                    const count = transformedOperations.filter(op => op.specialty === specialty).length
                                                    const percentage = (count / transformedOperations.length) * 100

                                                    return count > 0 ? (
                                                        <div key={specialty} className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`p-1 rounded ${config.color}`}>
                                                                    {/* CORRECCIÓN: Usar el componente directamente */}
                                                                    <config.icon className="h-3 w-3" />
                                                                </div>
                                                                <span className="text-sm">{config.label}</span>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-32">
                                                                    <Progress value={percentage} className="h-2" />
                                                                </div>
                                                                <span className="text-sm font-medium w-12 text-right">
                                                                    {count} ({percentage.toFixed(1)}%)
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ) : null
                                                })}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Distribución por complejidad */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base">Distribución por Complejidad</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {Object.entries(complexityConfig).map(([complexity, config]) => {
                                                    const count = transformedOperations.filter(op => op.complexity === complexity).length
                                                    const totalCost = transformedOperations
                                                        .filter(op => op.complexity === complexity)
                                                        .reduce((sum, op) => sum + op.base_cost, 0)

                                                    return count > 0 ? (
                                                        <div key={complexity} className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`p-1 rounded ${config.color}`}>
                                                                    {/* CORRECCIÓN: Usar el componente directamente */}
                                                                    <config.icon className="h-3 w-3" />
                                                                </div>
                                                                <span className="text-sm">{config.label}</span>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="font-medium">{count} operaciones</div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    Q{totalCost.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : null
                                                })}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Métricas de desempeño */}
                                <div className="mt-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base">Métricas de Desempeño</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <div className="text-sm text-muted-foreground">Ocupación Quirófano</div>
                                                    <div className="text-2xl font-bold text-primary">
                                                        78%
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        4 de 5 quirófanos en uso
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="text-sm text-muted-foreground">Retraso Promedio</div>
                                                    <div className="text-2xl font-bold text-warning">
                                                        24 min
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Inicio vs programado
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="text-sm text-muted-foreground">Complicaciones</div>
                                                    <div className="text-2xl font-bold text-success">
                                                        2.3%
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Tasa de complicaciones
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Dialog para Detalle de Operación */}
                <Dialog open={isOperationDialogOpen} onOpenChange={setIsOperationDialogOpen}>
                    <DialogContent className="max-w-4xl">
                        {selectedOperation && (
                            <>
                                <DialogHeader>
                                    <DialogTitle>Detalle de Operación</DialogTitle>
                                    <CardDescription className="pt-2">
                                        Operación: <span className="font-medium">{selectedOperation.operation_type_name}</span>
                                    </CardDescription>
                                </DialogHeader>

                                <div className="space-y-6">
                                    {/* Header de la operación */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="font-medium mb-2">Información del Paciente</h4>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Paciente:</span>
                                                        <span className="font-medium">{selectedOperation.patient_name}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Caso:</span>
                                                        <Badge variant="outline" className="font-mono">
                                                            {selectedOperation.case_number}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Edad/Género:</span>
                                                        <span>{selectedOperation.patient_age} años / {selectedOperation.patient_gender}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="font-medium mb-2">Información Quirúrgica</h4>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Especialidad:</span>
                                                        <Badge className={getSpecialtyConfig(selectedOperation.specialty).color}>
                                                            {selectedOperation.specialty}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Complejidad:</span>
                                                        <Badge className={getComplexityConfig(selectedOperation.complexity).color}>
                                                            {getComplexityConfig(selectedOperation.complexity).label}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Quirófano:</span>
                                                        <Badge variant="outline" className="font-mono">
                                                            {selectedOperation.operating_room}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Programación y equipo */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="font-medium mb-2">Programación</h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Fecha Programada:</span>
                                                    <span className="font-medium">{formatDate(selectedOperation.scheduled_date)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Duración Estimada:</span>
                                                    <span>{formatDuration(selectedOperation.estimated_duration_minutes)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Estado:</span>
                                                    <Badge className={getStatusConfig(selectedOperation.status).color}>
                                                        {getStatusConfig(selectedOperation.status).label}
                                                    </Badge>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Costo Base:</span>
                                                    <span className="font-medium">
                                                        Q{selectedOperation.base_cost.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-medium mb-2">Equipo Médico</h4>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <User className="h-4 w-4 text-muted-foreground" />
                                                        <div>
                                                            <div className="font-medium">{selectedOperation.primary_surgeon_name}</div>
                                                            <div className="text-xs text-muted-foreground">Cirujano Principal</div>
                                                        </div>
                                                    </div>
                                                    <Badge variant="outline">Principal</Badge>
                                                </div>

                                                {selectedOperation.anesthesiologist_name && (
                                                    <div className="flex items-center justify-between p-3 border rounded-lg">
                                                        <div className="flex items-center gap-3">
                                                            <Syringe className="h-4 w-4 text-muted-foreground" />
                                                            <div>
                                                                <div className="font-medium">{selectedOperation.anesthesiologist_name}</div>
                                                                <div className="text-xs text-muted-foreground">Anestesiólogo</div>
                                                            </div>
                                                        </div>
                                                        <Badge variant="outline">Anestesia</Badge>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Notas pre-operatorias */}
                                    {selectedOperation.pre_operative_notes && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-base">Notas Pre-operatorias</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm text-muted-foreground">{selectedOperation.pre_operative_notes}</p>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Si hay registro de operación */}
                                    {currentRecord && (
                                        <>
                                            <Separator />

                                            <div>
                                                <h4 className="font-medium mb-2">Registro de Operación</h4>
                                                <Card>
                                                    <CardContent className="p-4">
                                                        <div className="space-y-3">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <div className="text-sm text-muted-foreground">Inicio Real:</div>
                                                                    <div className="font-medium">
                                                                        {formatDate(String(currentRecord.actual_start_time))}
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm text-muted-foreground">Fin Real:</div>
                                                                    <div className="font-medium">
                                                                        {formatDate(String(currentRecord.actual_end_time))}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <div className="text-sm text-muted-foreground">Tipo de Anestesia:</div>
                                                                    <Badge variant="outline">{currentRecord.anesthesia_type}</Badge>
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm text-muted-foreground">Pérdida Sanguínea:</div>
                                                                    <div className="font-medium flex items-center gap-2">
                                                                        <Droplets className="h-4 w-4 text-destructive" />
                                                                        {currentRecord.blood_loss_ml} ml
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <div className="text-sm text-muted-foreground">Procedimiento Realizado:</div>
                                                                <p className="text-sm">{currentRecord.procedure_performed}</p>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsOperationDialogOpen(false)}>
                                        Cerrar
                                    </Button>
                                    {selectedOperation.status === "scheduled" && (
                                        <Button onClick={() => {
                                            setIsOperationDialogOpen(false)
                                            handleRecordOperation(selectedOperation)
                                        }}>
                                            <ClipboardCheck className="mr-2 h-4 w-4" />
                                            Iniciar Operación
                                        </Button>
                                    )}
                                </DialogFooter>
                            </>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Dialog para Registro de Operación */}
                <Dialog open={isRecordDialogOpen} onOpenChange={setIsRecordDialogOpen}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
                        {selectedOperation && (
                            <>
                                <div className="sticky top-0 z-10 bg-gradient-to-r from-primary/5 via-background to-background border-b px-6 py-4">
                                    <DialogHeader className="p-0">
                                        <DialogTitle className="flex items-center gap-2 text-xl">
                                            <div className="p-2 rounded-lg bg-primary/10">
                                                <ClipboardCheck className="h-5 w-5 text-primary" />
                                            </div>
                                            Registro de Operación
                                        </DialogTitle>
                                        <DialogDescription className="mt-1">
                                            Operación: <span className="font-medium">{selectedOperation.operation_type_name}</span>
                                        </DialogDescription>
                                    </DialogHeader>
                                </div>

                                <ScrollArea className="h-[60vh] px-6 py-4">
                                    <div className="space-y-6">
                                        <Alert>
                                            <ClipboardCheck className="h-4 w-4" />
                                            <AlertTitle>Completar Registro Quirúrgico</AlertTitle>
                                            <AlertDescription>
                                                Registra los detalles de la operación realizada.
                                            </AlertDescription>
                                        </Alert>

                                        {/* resto del formulario... */}
                                    </div>
                                </ScrollArea>

                                <DialogFooter className="sticky bottom-0 z-10 bg-background border-t px-6 py-4">
                                    <Button variant="outline" onClick={() => setIsRecordDialogOpen(false)}>
                                        Cancelar
                                    </Button>
                                    <Button onClick={handleSaveRecord}>
                                        <ClipboardCheck className="mr-2 h-4 w-4" />
                                        Guardar Registro
                                    </Button>
                                </DialogFooter>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    )
}
