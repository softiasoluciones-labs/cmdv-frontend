"use client"

import { useState, useMemo } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
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
  FileText,
  User,
  Users,
  BedDouble,
  DollarSign,
  AlertTriangle,
  Stethoscope,
  ClipboardCheck,
  RefreshCw,
  ArrowRightLeft,
  Lock,
  Unlock,
  Calendar,
  Building,
  Activity,
  TrendingUp,
  MoreVertical,
  Copy,
  FilePlus,
  Shield,
  Heart,
  Pill
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"

// Datos de ejemplo para expedientes
const mockCaseFiles = [
  {
    id: "47885af2-8b92-4981-a5a3-227e1b32dcff",
    case_number: "E-20251207-0001",
    patient_name: "Ana Sofía Ramírez Soto",
    admission_type_name: "Emergencia",
    admission_date: "2025-12-08T00:14:18.409Z",
    case_status: "active",
    current_status_flow: "C1_CREACION",
    shift_type: "daytime",
    total_cost: 0,
    paid_amount: 0,
    balance: 0,
    primary_doctor: "Dr. Roberto Martínez",
    assigned_room: "-",
    patient_age: 34,
    patient_gender: "Femenino",
    diagnosis: "Apéndice agudo",
    priority: "high"
  },
  {
    id: "57885af2-8b92-4981-a5a3-227e1b32dcfg",
    case_number: "C-20251206-0045",
    patient_name: "Carlos Enrique García López",
    admission_type_name: "Consulta Externa",
    admission_date: "2025-12-06T10:30:00.000Z",
    case_status: "active",
    current_status_flow: "C2_EVALUACION",
    shift_type: "daytime",
    total_cost: 1250.75,
    paid_amount: 500.00,
    balance: 750.75,
    primary_doctor: "Dra. María José Rodríguez",
    assigned_room: "HAB-201",
    patient_age: 45,
    patient_gender: "Masculino",
    diagnosis: "Hipertensión arterial",
    priority: "medium"
  },
  {
    id: "67885af2-8b92-4981-a5a3-227e1b32dcfh",
    case_number: "H-20251205-0032",
    patient_name: "Luisa Fernanda Torres Méndez",
    admission_type_name: "Hospitalización",
    admission_date: "2025-12-05T14:45:00.000Z",
    case_status: "active",
    current_status_flow: "C3_HOSPITALIZACION",
    shift_type: "night",
    total_cost: 5675.30,
    paid_amount: 3000.00,
    balance: 2675.30,
    primary_doctor: "Dr. Alejandro Sánchez",
    assigned_room: "HAB-305",
    patient_age: 28,
    patient_gender: "Femenino",
    diagnosis: "Embarazo de riesgo",
    priority: "high"
  },
  {
    id: "77885af2-8b92-4981-a5a3-227e1b32dcfi",
    case_number: "Q-20251204-0021",
    patient_name: "Jorge Alberto Díaz Ruiz",
    admission_type_name: "Cirugía Programada",
    admission_date: "2025-12-04T08:15:00.000Z",
    case_status: "active",
    current_status_flow: "C4_QUIROFANO",
    shift_type: "daytime",
    total_cost: 15250.00,
    paid_amount: 10000.00,
    balance: 5250.00,
    primary_doctor: "Dr. Mario Fuentes",
    assigned_room: "HAB-412",
    patient_age: 52,
    patient_gender: "Masculino",
    diagnosis: "Colecistectomía laparoscópica",
    priority: "medium"
  },
  {
    id: "87885af2-8b92-4981-a5a3-227e1b32dcfj",
    case_number: "R-20251203-0015",
    patient_name: "Patricia Elizabeth Castro Vásquez",
    admission_type_name: "Recuperación",
    admission_date: "2025-12-03T16:20:00.000Z",
    case_status: "active",
    current_status_flow: "C5_RECUPERACION",
    shift_type: "daytime",
    total_cost: 8750.40,
    paid_amount: 8750.40,
    balance: 0.00,
    primary_doctor: "Dra. Ana Lucía Jiménez",
    assigned_room: "HAB-208",
    patient_age: 38,
    patient_gender: "Femenino",
    diagnosis: "Post-operatorio histerectomía",
    priority: "low"
  },
  {
    id: "97885af2-8b92-4981-a5a3-227e1b32dcfk",
    case_number: "A-20251201-0089",
    patient_name: "Miguel Ángel Hernández Ortiz",
    admission_type_name: "Alta Médica",
    admission_date: "2025-12-01T11:10:00.000Z",
    case_status: "closed",
    current_status_flow: "C6_ALTA",
    shift_type: "daytime",
    total_cost: 3250.60,
    paid_amount: 3250.60,
    balance: 0.00,
    primary_doctor: "Dr. Carlos Enrique García",
    assigned_room: "-",
    patient_age: 41,
    patient_gender: "Masculino",
    diagnosis: "Fractura de radio",
    priority: "low"
  }
]

// Datos de ejemplo para validación de expediente
const mockValidation = {
  case_id: "47885af2-8b92-4981-a5a3-227e1b32dcff",
  case_number: "E-20251207-0001",
  admission_type_code: "H",
  admission_type_name: "Emergencia",
  requires_hospitalization: false,
  has_room_assigned: false,
  requires_package: false,
  has_package_assigned: false,
  allows_transfer: true,
  is_transfer: false,
  requires_immediate_payment: false,
  has_payment: false,
  validation_status: "COMPLIANT",
  validation_messages: []
}

// Datos de ejemplo para cerrar expediente
const mockClosability = {
  allowed: true
}

// Datos de ejemplo para historial
const mockStatusHistory = [
  {
    id: "1",
    from_status: "CREACION",
    to_status: "EVALUACION",
    transition_date: "2025-12-08T00:30:00.000Z",
    reason: "Evaluación inicial completada",
    performed_by: "Dra. María Rodríguez"
  },
  {
    id: "2",
    from_status: "EVALUACION",
    to_status: "TRATAMIENTO",
    transition_date: "2025-12-08T01:15:00.000Z",
    reason: "Diagnóstico confirmado",
    performed_by: "Dr. Roberto Martínez"
  }
]

// Datos de ejemplo para doctores asignados
const mockCaseDoctors = [
  {
    id: "1",
    doctor_id: "doc-001",
    doctor_name: "Dr. Roberto Martínez",
    role: "Médico Principal",
    assigned_at: "2025-12-08T00:20:00.000Z",
    notes: "Especialista en emergencias"
  },
  {
    id: "2",
    doctor_id: "doc-002",
    doctor_name: "Dra. Ana Lucía Jiménez",
    role: "Anestesiólogo",
    assigned_at: "2025-12-08T00:45:00.000Z",
    notes: "Disponible para cirugía"
  }
]

// Datos de ejemplo para servicios
const mockCaseServices = [
  {
    id: "1",
    service_name: "Consulta de Emergencia",
    quantity: 1,
    unit_price: "250.00",
    total_price: "250.00",
    applied_at: "2025-12-08T00:30:00.000Z"
  },
  {
    id: "2",
    service_name: "Laboratorio Básico",
    quantity: 1,
    unit_price: "150.00",
    total_price: "150.00",
    applied_at: "2025-12-08T01:00:00.000Z"
  }
]

// Configuración de estados
const statusFlowConfig = {
  C1_CREACION: { label: "Creación", color: "bg-gray-100 text-gray-800", icon: FileText },
  C2_EVALUACION: { label: "Evaluación", color: "bg-blue-100 text-blue-800", icon: Stethoscope },
  C3_HOSPITALIZACION: { label: "Hospitalización", color: "bg-purple-100 text-purple-800", icon: BedDouble },
  C4_QUIROFANO: { label: "Quirófano", color: "bg-red-100 text-red-800", icon: Activity },
  C5_RECUPERACION: { label: "Recuperación", color: "bg-green-100 text-green-800", icon: Heart },
  C6_ALTA: { label: "Alta", color: "bg-teal-100 text-teal-800", icon: CheckCircle }
}

const admissionTypeConfig = {
  Emergencia: { label: "Emergencia", color: "bg-destructive/10 text-destructive", icon: AlertTriangle },
  "Consulta Externa": { label: "Consulta", color: "bg-primary/10 text-primary", icon: User },
  Hospitalización: { label: "Hospitalización", color: "bg-purple-500/10 text-purple-600", icon: Building },
  "Cirugía Programada": { label: "Cirugía", color: "bg-warning/10 text-warning", icon: Activity },
  Recuperación: { label: "Recuperación", color: "bg-success/10 text-success", icon: Heart },
  "Alta Médica": { label: "Alta", color: "bg-teal-500/10 text-teal-600", icon: CheckCircle }
}

export default function CaseFilesPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [admissionTypeFilter, setAdmissionTypeFilter] = useState("all")
  const [selectedCase, setSelectedCase] = useState<any>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false)
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("list")

  const [transferForm, setTransferForm] = useState({
    to_department: "",
    transfer_reason: "",
    notes: ""
  })

  // Filtrar expedientes
  const filteredCaseFiles = useMemo(() => {
    return mockCaseFiles.filter(caseFile => {
      const matchesSearch =
        caseFile.case_number.toLowerCase().includes(search.toLowerCase()) ||
        caseFile.patient_name.toLowerCase().includes(search.toLowerCase()) ||
        caseFile.primary_doctor.toLowerCase().includes(search.toLowerCase())

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && caseFile.case_status === "active") ||
        (statusFilter === "closed" && caseFile.case_status === "closed")

      const matchesAdmissionType =
        admissionTypeFilter === "all" ||
        caseFile.admission_type_name === admissionTypeFilter

      return matchesSearch && matchesStatus && matchesAdmissionType
    })
  }, [search, statusFilter, admissionTypeFilter])

  // Estadísticas
  const stats = useMemo(() => {
    const activeCases = mockCaseFiles.filter(c => c.case_status === "active")
    const emergencyCases = activeCases.filter(c => c.admission_type_name === "Emergencia")
    const totalCost = activeCases.reduce((sum, c) => sum + c.total_cost, 0)
    const totalPaid = activeCases.reduce((sum, c) => sum + c.paid_amount, 0)
    const totalBalance = activeCases.reduce((sum, c) => sum + c.balance, 0)

    return {
      totalActiveCases: activeCases.length,
      emergencyCases: emergencyCases.length,
      hospitalizedCases: activeCases.filter(c => c.admission_type_name === "Hospitalización").length,
      surgeryCases: activeCases.filter(c => c.admission_type_name === "Cirugía Programada").length,
      totalCost,
      totalPaid,
      totalBalance,
      collectionRate: totalCost > 0 ? (totalPaid / totalCost) * 100 : 0
    }
  }, [])

  // Handlers
  const handleViewCase = (caseFile: any) => {
    setSelectedCase(caseFile)
    setIsDetailDialogOpen(true)
  }

  const handleTransferCase = (caseFile: any) => {
    setSelectedCase(caseFile)
    setIsTransferDialogOpen(true)
  }

  const handleCloseCase = (caseFile: any) => {
    setSelectedCase(caseFile)
    setIsCloseDialogOpen(true)
  }

  const handleSubmitTransfer = () => {
    console.log("Transferir expediente:", transferForm)
    setIsTransferDialogOpen(false)
    setSelectedCase(null)
    setTransferForm({
      to_department: "",
      transfer_reason: "",
      notes: ""
    })
  }

  const handleSubmitClose = () => {
    console.log("Cerrar expediente:", selectedCase)
    setIsCloseDialogOpen(false)
    setSelectedCase(null)
  }

  // Obtener configuración del estado
  const getStatusFlowConfig = (statusFlow: string) => {
    return statusFlowConfig[statusFlow as keyof typeof statusFlowConfig] || statusFlowConfig.C1_CREACION
  }

  const getAdmissionTypeConfig = (type: string) => {
    return admissionTypeConfig[type as keyof typeof admissionTypeConfig] || admissionTypeConfig.Emergencia
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

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
      minimumFractionDigits: 2
    }).format(amount)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Expedientes Médicos</h1>
            <p className="text-muted-foreground">
              Gestión de casos y seguimiento de pacientes
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setActiveTab(activeTab === "list" ? "analytics" : "list")}
            >
              {activeTab === "list" ? (
                <>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Análisis
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Ver Lista
                </>
              )}
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Expediente
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Expediente</DialogTitle>
                </DialogHeader>
                {/* Formulario para nuevo expediente - simplificado por ahora */}
                <div className="py-8 text-center text-muted-foreground">
                  Formulario para nuevo expediente médico
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Casos Activos</p>
                <p className="text-2xl font-bold">{stats.totalActiveCases}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.hospitalizedCases} hospitalizados
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En Emergencia</p>
                <p className="text-2xl font-bold">{stats.emergencyCases}</p>
                <p className="text-xs text-muted-foreground">
                  Urgencias activas
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
                <p className="text-sm text-muted-foreground">Total Facturado</p>
                <p className="text-2xl font-bold">Q{stats.totalCost.toLocaleString('es-GT', { minimumFractionDigits: 2 })}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.collectionRate.toFixed(1)}% cobrado
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
                <DollarSign className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Saldo Pendiente</p>
                <p className="text-2xl font-bold">Q{stats.totalBalance.toLocaleString('es-GT', { minimumFractionDigits: 2 })}</p>
                <p className="text-xs text-muted-foreground">
                  Por cobrar
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Lista de Expedientes
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Análisis
            </TabsTrigger>
          </TabsList>

          {/* Tab: Lista de Expedientes */}
          <TabsContent value="list" className="space-y-4">
            {/* Filtros */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por número de caso, paciente o doctor..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="active">Activos</SelectItem>
                        <SelectItem value="closed">Cerrados</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={admissionTypeFilter} onValueChange={setAdmissionTypeFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Tipo Ingreso" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="Emergencia">Emergencia</SelectItem>
                        <SelectItem value="Consulta Externa">Consulta</SelectItem>
                        <SelectItem value="Hospitalización">Hospitalización</SelectItem>
                        <SelectItem value="Cirugía Programada">Cirugía</SelectItem>
                        <SelectItem value="Recuperación">Recuperación</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabla de Expedientes */}
            <Card>
              <CardHeader>
                <CardTitle>Expedientes Médicos</CardTitle>
                <CardDescription>
                  {filteredCaseFiles.length} {filteredCaseFiles.length === 1 ? 'expediente encontrado' : 'expedientes encontrados'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No. Caso</TableHead>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Fecha Ingreso</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead className="text-right">Costo</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCaseFiles.map((caseFile) => {
                      const StatusIcon = getStatusFlowConfig(caseFile.current_status_flow).icon
                      const AdmissionIcon = getAdmissionTypeConfig(caseFile.admission_type_name).icon
                      const isEmergency = caseFile.admission_type_name === "Emergencia"

                      return (
                        <TableRow key={caseFile.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            <Badge variant="outline" className="font-mono">
                              {caseFile.case_number}
                            </Badge>
                            {isEmergency && (
                              <div className="mt-1">
                                <Badge variant="outline" className="gap-1 text-xs bg-destructive/10 text-destructive">
                                  <AlertTriangle className="h-3 w-3" />
                                  Emergencia
                                </Badge>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{caseFile.patient_name}</span>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{caseFile.patient_age} años</span>
                                <Separator orientation="vertical" className="h-3" />
                                <span>{caseFile.patient_gender}</span>
                                <Separator orientation="vertical" className="h-3" />
                                <span>{caseFile.diagnosis}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <AdmissionIcon className="h-4 w-4" />
                              <Badge className={getAdmissionTypeConfig(caseFile.admission_type_name).color}>
                                {caseFile.admission_type_name}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">
                                {formatDate(caseFile.admission_date)}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {caseFile.shift_type === "daytime" ? "Turno diurno" : "Turno nocturno"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <StatusIcon className="h-4 w-4" />
                              <Badge className={getStatusFlowConfig(caseFile.current_status_flow).color}>
                                {getStatusFlowConfig(caseFile.current_status_flow).label}
                              </Badge>
                            </div>
                            {caseFile.case_status === "closed" && (
                              <Badge variant="outline" className="mt-1 text-xs">
                                Cerrado
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">{caseFile.primary_doctor}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Habitación: {caseFile.assigned_room}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-col items-end">
                              <span className="font-medium">
                                {formatCurrency(caseFile.total_cost)}
                              </span>
                              {caseFile.balance > 0 ? (
                                <Badge variant="outline" className="gap-1 mt-1 text-xs bg-warning/10 text-warning">
                                  <DollarSign className="h-3 w-3" />
                                  {formatCurrency(caseFile.balance)} pendiente
                                </Badge>
                              ) : caseFile.paid_amount > 0 ? (
                                <Badge variant="outline" className="gap-1 mt-1 text-xs bg-success/10 text-success">
                                  <CheckCircle className="h-3 w-3" />
                                  Pagado
                                </Badge>
                              ) : null}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewCase(caseFile)}
                                title="Ver detalle"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>

                              {caseFile.case_status === "active" && (
                                <>
                                  {mockValidation.allows_transfer && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleTransferCase(caseFile)}
                                      title="Transferir caso"
                                      className="text-blue-600 hover:text-blue-700"
                                    >
                                      <ArrowRightLeft className="h-4 w-4" />
                                    </Button>
                                  )}

                                  {mockClosability.allowed && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleCloseCase(caseFile)}
                                      title="Cerrar caso"
                                      className="text-success hover:text-success"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                  )}
                                </>
                              )}

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => handleViewCase(caseFile)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Ver Detalles
                                  </DropdownMenuItem>

                                  {caseFile.case_status === "active" && (
                                    <>
                                      <DropdownMenuItem onClick={() => handleTransferCase(caseFile)}>
                                        <ArrowRightLeft className="mr-2 h-4 w-4" />
                                        Transferir Caso
                                      </DropdownMenuItem>

                                      {caseFile.assigned_room === "-" && (
                                        <DropdownMenuItem>
                                          <BedDouble className="mr-2 h-4 w-4" />
                                          Asignar Habitación
                                        </DropdownMenuItem>
                                      )}

                                      <DropdownMenuItem>
                                        <Users className="mr-2 h-4 w-4" />
                                        Asignar Doctor
                                      </DropdownMenuItem>

                                      <DropdownMenuItem>
                                        <FilePlus className="mr-2 h-4 w-4" />
                                        Agregar Servicio
                                      </DropdownMenuItem>

                                      <DropdownMenuSeparator />

                                      <DropdownMenuItem onClick={() => handleCloseCase(caseFile)}>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Cerrar Caso
                                      </DropdownMenuItem>
                                    </>
                                  )}

                                  <DropdownMenuSeparator />

                                  <DropdownMenuItem>
                                    <Printer className="mr-2 h-4 w-4" />
                                    Imprimir Expediente
                                  </DropdownMenuItem>

                                  <DropdownMenuItem>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Duplicar
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
                  <span className="font-medium">Tasa de cobro:</span> {stats.collectionRate.toFixed(1)}%
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Exportar
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Printer className="h-4 w-4" />
                    Imprimir Lista
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Tab: Análisis */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Análisis de Expedientes</CardTitle>
                <CardDescription>
                  Estadísticas y métricas de desempeño
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Distribución por tipo */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Distribución por Tipo de Ingreso</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(admissionTypeConfig).map(([type, config]) => {
                          const count = mockCaseFiles.filter(c =>
                            c.admission_type_name === type && c.case_status === "active"
                          ).length
                          const totalActive = mockCaseFiles.filter(c => c.case_status === "active").length
                          const percentage = totalActive > 0 ? (count / totalActive) * 100 : 0
                          const Icon = config.icon

                          return count > 0 ? (
                            <div key={type} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={`p-1 rounded ${config.color}`}>
                                  <Icon className="h-3 w-3" />
                                </div>
                                <span className="text-sm">{type}</span>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="w-32">
                                  <Progress value={percentage} className="h-2" />
                                </div>
                                <span className="text-sm font-medium w-12 text-right">
                                  {count}
                                </span>
                              </div>
                            </div>
                          ) : null
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Distribución por estado */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Distribución por Estado</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(statusFlowConfig).map(([status, config]) => {
                          const count = mockCaseFiles.filter(c =>
                            c.current_status_flow === status && c.case_status === "active"
                          ).length
                          const Icon = config.icon

                          return count > 0 ? (
                            <div key={status} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={`p-1 rounded ${config.color}`}>
                                  <Icon className="h-3 w-3" />
                                </div>
                                <span className="text-sm">{config.label}</span>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">{count} casos</div>
                                <div className="text-xs text-muted-foreground">
                                  {status.replace('C', '').replace('_', '. ')}
                                </div>
                              </div>
                            </div>
                          ) : null
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Métricas financieras */}
                <div className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Métricas Financieras</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground">Valor Promedio por Caso</div>
                          <div className="text-2xl font-bold text-primary">
                            {stats.totalActiveCases > 0
                              ? formatCurrency(stats.totalCost / stats.totalActiveCases)
                              : formatCurrency(0)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {stats.totalActiveCases} casos activos
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground">Tiempo Promedio de Estancia</div>
                          <div className="text-2xl font-bold text-success">
                            3.2 días
                          </div>
                          <div className="text-xs text-muted-foreground">
                            En casos hospitalizados
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground">Cartera Vencida</div>
                          <div className="text-2xl font-bold text-destructive">
                            {formatCurrency(stats.totalBalance * 0.3)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            30% del saldo pendiente
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

        {/* Dialog para Detalle del Expediente */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh]">
            {selectedCase && (
              <>
                <DialogHeader>
                  <DialogTitle>Detalle del Expediente</DialogTitle>
                  <CardDescription className="pt-2">
                    Caso: <span className="font-mono">{selectedCase.case_number}</span> •
                    Paciente: <span className="font-medium">{selectedCase.patient_name}</span>
                  </CardDescription>
                </DialogHeader>

                <ScrollArea className="h-[70vh] pr-4">
                  <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList>
                      <TabsTrigger value="overview">Resumen</TabsTrigger>
                      <TabsTrigger value="doctors">Médicos</TabsTrigger>
                      <TabsTrigger value="services">Servicios</TabsTrigger>
                      <TabsTrigger value="history">Historial</TabsTrigger>
                      <TabsTrigger value="validation">Validación</TabsTrigger>
                    </TabsList>

                    {/* Tab: Resumen */}
                    <TabsContent value="overview" className="space-y-6">
                      <div className="grid grid-cols-3 gap-6">
                        {/* Información del paciente */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Información del Paciente</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <Label className="text-xs text-muted-foreground">Nombre Completo</Label>
                              <div className="font-medium">{selectedCase.patient_name}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-xs text-muted-foreground">Edad</Label>
                                <div className="font-medium">{selectedCase.patient_age} años</div>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Género</Label>
                                <div className="font-medium">{selectedCase.patient_gender}</div>
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Diagnóstico Principal</Label>
                              <div className="font-medium">{selectedCase.diagnosis}</div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Información del caso */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Información del Caso</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <Label className="text-xs text-muted-foreground">Tipo de Ingreso</Label>
                              <div className="flex items-center gap-2">
                                <Badge className={getAdmissionTypeConfig(selectedCase.admission_type_name).color}>
                                  {selectedCase.admission_type_name}
                                </Badge>
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Fecha de Ingreso</Label>
                              <div className="font-medium">{formatDate(selectedCase.admission_date)}</div>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Estado Actual</Label>
                              <div className="flex items-center gap-2">
                                <Badge className={getStatusFlowConfig(selectedCase.current_status_flow).color}>
                                  {getStatusFlowConfig(selectedCase.current_status_flow).label}
                                </Badge>
                                <Badge variant={selectedCase.case_status === "active" ? "default" : "secondary"}>
                                  {selectedCase.case_status === "active" ? "Activo" : "Cerrado"}
                                </Badge>
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Turno</Label>
                              <div className="font-medium">
                                {selectedCase.shift_type === "daytime" ? "Turno Diurno" : "Turno Nocturno"}
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Información financiera */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Información Financiera</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-xs text-muted-foreground">Costo Total</Label>
                                <div className="font-medium">{formatCurrency(selectedCase.total_cost)}</div>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Pagado</Label>
                                <div className="font-medium text-success">{formatCurrency(selectedCase.paid_amount)}</div>
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Saldo Pendiente</Label>
                              <div className={`font-medium ${selectedCase.balance > 0 ? "text-destructive" : "text-success"}`}>
                                {formatCurrency(selectedCase.balance)}
                              </div>
                            </div>
                            <div className="pt-2">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Progreso de Pago</span>
                                <span>{selectedCase.total_cost > 0
                                  ? ((selectedCase.paid_amount / selectedCase.total_cost) * 100).toFixed(1)
                                  : 0}%
                                </span>
                              </div>
                              <Progress
                                value={selectedCase.total_cost > 0
                                  ? (selectedCase.paid_amount / selectedCase.total_cost) * 100
                                  : 0}
                                className="h-2"
                              />
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Validación del caso */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Validación del Expediente</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className={`p-4 rounded-lg text-center ${mockValidation.requires_hospitalization && mockValidation.has_room_assigned
                                ? "bg-success/10 text-success"
                                : mockValidation.requires_hospitalization
                                  ? "bg-warning/10 text-warning"
                                  : "bg-muted/10 text-muted-foreground"
                              }`}>
                              <BedDouble className="h-6 w-6 mx-auto mb-2" />
                              <div className="font-medium">Habitación</div>
                              <div className="text-sm">
                                {mockValidation.has_room_assigned ? "Asignada" : "No asignada"}
                              </div>
                            </div>

                            <div className={`p-4 rounded-lg text-center ${mockValidation.requires_package && mockValidation.has_package_assigned
                                ? "bg-success/10 text-success"
                                : mockValidation.requires_package
                                  ? "bg-warning/10 text-warning"
                                  : "bg-muted/10 text-muted-foreground"
                              }`}>
                              <ClipboardCheck className="h-6 w-6 mx-auto mb-2" />
                              <div className="font-medium">Paquete</div>
                              <div className="text-sm">
                                {mockValidation.has_package_assigned ? "Asignado" : "No requerido"}
                              </div>
                            </div>

                            <div className={`p-4 rounded-lg text-center ${mockValidation.requires_immediate_payment && mockValidation.has_payment
                                ? "bg-success/10 text-success"
                                : mockValidation.requires_immediate_payment
                                  ? "bg-warning/10 text-warning"
                                  : "bg-muted/10 text-muted-foreground"
                              }`}>
                              <DollarSign className="h-6 w-6 mx-auto mb-2" />
                              <div className="font-medium">Pago</div>
                              <div className="text-sm">
                                {mockValidation.has_payment ? "Realizado" : "No requerido"}
                              </div>
                            </div>

                            <div className={`p-4 rounded-lg text-center ${mockValidation.validation_status === "COMPLIANT"
                                ? "bg-success/10 text-success"
                                : "bg-warning/10 text-warning"
                              }`}>
                              <Shield className="h-6 w-6 mx-auto mb-2" />
                              <div className="font-medium">Validación</div>
                              <div className="text-sm">
                                {mockValidation.validation_status === "COMPLIANT" ? "Cumplido" : "Pendiente"}
                              </div>
                            </div>
                          </div>

                          {mockValidation.validation_messages.length > 0 && (
                            <Alert className="mt-4">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertTitle>Mensajes de Validación</AlertTitle>
                              <AlertDescription>
                                <ul className="list-disc pl-4 mt-2">
                                  {mockValidation.validation_messages.map((msg, idx) => (
                                    <li key={idx} className="text-sm">{msg}</li>
                                  ))}
                                </ul>
                              </AlertDescription>
                            </Alert>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Tab: Médicos */}
                    <TabsContent value="doctors">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Médicos Asignados</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Médico</TableHead>
                                <TableHead>Rol</TableHead>
                                <TableHead>Asignado el</TableHead>
                                <TableHead>Notas</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {mockCaseDoctors.map((doctor) => (
                                <TableRow key={doctor.id}>
                                  <TableCell>
                                    <div className="font-medium">{doctor.doctor_name}</div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline">{doctor.role}</Badge>
                                  </TableCell>
                                  <TableCell>
                                    {formatDate(doctor.assigned_at)}
                                  </TableCell>
                                  <TableCell className="text-sm text-muted-foreground">
                                    {doctor.notes}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Tab: Servicios */}
                    <TabsContent value="services">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Servicios Aplicados</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Servicio</TableHead>
                                <TableHead className="text-right">Cantidad</TableHead>
                                <TableHead className="text-right">Precio Unitario</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead>Aplicado el</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {mockCaseServices.map((service) => (
                                <TableRow key={service.id}>
                                  <TableCell>
                                    <div className="font-medium">{service.service_name}</div>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {service.quantity}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {formatCurrency(parseFloat(service.unit_price))}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="font-medium">
                                      {formatCurrency(parseFloat(service.total_price))}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {formatDate(service.applied_at)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>

                          <Separator className="my-4" />

                          <div className="flex justify-end">
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground">Total Servicios:</div>
                              <div className="text-2xl font-bold text-primary">
                                {formatCurrency(mockCaseServices.reduce((sum, s) => sum + parseFloat(s.total_price), 0))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Tab: Historial */}
                    <TabsContent value="history">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Historial de Estados</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {mockStatusHistory.map((history) => (
                              <div key={history.id} className="flex items-start gap-4 p-4 border rounded-lg">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline">{history.from_status}</Badge>
                                    <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                                    <Badge>{history.to_status}</Badge>
                                  </div>
                                  <div className="text-sm text-muted-foreground mb-2">
                                    {formatDate(history.transition_date)}
                                  </div>
                                  <div className="text-sm">
                                    <span className="font-medium">Razón:</span> {history.reason}
                                  </div>
                                  <div className="text-sm text-muted-foreground mt-1">
                                    Realizado por: {history.performed_by}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Tab: Validación */}
                    <TabsContent value="validation">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Validación Completa del Expediente</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-6">
                            <Alert className={mockValidation.validation_status === "COMPLIANT" ? "bg-success/10" : "bg-warning/10"}>
                              {mockValidation.validation_status === "COMPLIANT" ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <AlertTriangle className="h-4 w-4" />
                              )}
                              <AlertTitle>
                                Estado de Validación: {mockValidation.validation_status}
                              </AlertTitle>
                              <AlertDescription>
                                El expediente {mockValidation.validation_status === "COMPLIANT"
                                  ? "cumple con todos los requisitos"
                                  : "tiene requisitos pendientes"}
                              </AlertDescription>
                            </Alert>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <h4 className="font-medium">Requisitos del Sistema</h4>
                                <div className="space-y-3">
                                  {[
                                    {
                                      label: "Requiere Hospitalización",
                                      value: mockValidation.requires_hospitalization,
                                      required: mockValidation.requires_hospitalization
                                    },
                                    {
                                      label: "Habitación Asignada",
                                      value: mockValidation.has_room_assigned,
                                      required: mockValidation.requires_hospitalization
                                    },
                                    {
                                      label: "Requiere Paquete",
                                      value: mockValidation.requires_package,
                                      required: mockValidation.requires_package
                                    },
                                    {
                                      label: "Paquete Asignado",
                                      value: mockValidation.has_package_assigned,
                                      required: mockValidation.requires_package
                                    }
                                  ].map((req, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                                      <div>
                                        <div className="font-medium">{req.label}</div>
                                        {req.required && (
                                          <div className="text-xs text-muted-foreground">Requerido</div>
                                        )}
                                      </div>
                                      <div className={req.value ? "text-success" : req.required ? "text-destructive" : "text-muted-foreground"}>
                                        {req.value ? (
                                          <CheckCircle className="h-5 w-5" />
                                        ) : req.required ? (
                                          <XCircle className="h-5 w-5" />
                                        ) : (
                                          <Clock className="h-5 w-5" />
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-4">
                                <h4 className="font-medium">Permisos y Estados</h4>
                                <div className="space-y-3">
                                  {[
                                    {
                                      label: "Permite Transferencia",
                                      value: mockValidation.allows_transfer,
                                      icon: ArrowRightLeft
                                    },
                                    {
                                      label: "Es Transferencia",
                                      value: mockValidation.is_transfer,
                                      icon: RefreshCw
                                    },
                                    {
                                      label: "Requiere Pago Inmediato",
                                      value: mockValidation.requires_immediate_payment,
                                      icon: DollarSign
                                    },
                                    {
                                      label: "Tiene Pago Realizado",
                                      value: mockValidation.has_payment,
                                      icon: CheckCircle
                                    }
                                  ].map((perm, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                                      <div className="flex items-center gap-3">
                                        <perm.icon className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                          <div className="font-medium">{perm.label}</div>
                                        </div>
                                      </div>
                                      <div className={perm.value ? "text-success" : "text-muted-foreground"}>
                                        {perm.value ? (
                                          <CheckCircle className="h-5 w-5" />
                                        ) : (
                                          <Clock className="h-5 w-5" />
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </ScrollArea>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                    Cerrar
                  </Button>
                  {selectedCase.case_status === "active" && mockClosability.allowed && (
                    <Button onClick={() => {
                      setIsDetailDialogOpen(false)
                      handleCloseCase(selectedCase)
                    }}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Cerrar Expediente
                    </Button>
                  )}
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog para Transferir Expediente */}
        <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
          <DialogContent className="max-w-md">
            {selectedCase && (
              <>
                <DialogHeader>
                  <DialogTitle>Transferir Expediente</DialogTitle>
                  <CardDescription className="pt-2">
                    Caso: <span className="font-mono">{selectedCase.case_number}</span>
                  </CardDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  <Alert>
                    <ArrowRightLeft className="h-4 w-4" />
                    <AlertTitle>Transferencia de Caso</AlertTitle>
                    <AlertDescription>
                      Transferir este expediente a otro departamento o médico.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="to_department">Departamento Destino</Label>
                      <Select
                        value={transferForm.to_department}
                        onValueChange={(value) => setTransferForm({ ...transferForm, to_department: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar departamento" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="emergency">Emergencias</SelectItem>
                          <SelectItem value="surgery">Cirugía</SelectItem>
                          <SelectItem value="internal_medicine">Medicina Interna</SelectItem>
                          <SelectItem value="pediatrics">Pediatría</SelectItem>
                          <SelectItem value="gynecology">Ginecología</SelectItem>
                          <SelectItem value="intensive_care">Cuidados Intensivos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="transfer_reason">Razón de Transferencia</Label>
                      <Select
                        value={transferForm.transfer_reason}
                        onValueChange={(value) => setTransferForm({ ...transferForm, transfer_reason: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar razón" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="specialty_care">Cuidado especializado requerido</SelectItem>
                          <SelectItem value="bed_availability">Disponibilidad de camas</SelectItem>
                          <SelectItem value="doctor_referral">Referencia médica</SelectItem>
                          <SelectItem value="patient_request">Solicitud del paciente</SelectItem>
                          <SelectItem value="equipment_need">Necesidad de equipo especial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notas Adicionales</Label>
                      <Textarea
                        id="notes"
                        placeholder="Agregar notas sobre la transferencia..."
                        value={transferForm.notes}
                        onChange={(e) => setTransferForm({ ...transferForm, notes: e.target.value })}
                        rows={3}
                      />
                    </div>

                    <Card>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground">Paciente a transferir:</div>
                          <div className="font-medium">{selectedCase.patient_name}</div>
                          <div className="text-xs text-muted-foreground">
                            Diagnóstico: {selectedCase.diagnosis}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsTransferDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSubmitTransfer}>
                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                    Confirmar Transferencia
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog para Cerrar Expediente */}
        <Dialog open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen}>
          <DialogContent className="max-w-md">
            {selectedCase && (
              <>
                <DialogHeader>
                  <DialogTitle>Cerrar Expediente</DialogTitle>
                  <CardDescription className="pt-2">
                    Caso: <span className="font-mono">{selectedCase.case_number}</span>
                  </CardDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  <Alert variant={mockClosability.allowed ? "default" : "destructive"}>
                    {mockClosability.allowed ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    <AlertTitle>
                      {mockClosability.allowed ? "Expediente Cerrable" : "Expediente No Cerrable"}
                    </AlertTitle>
                    <AlertDescription>
                      {mockClosability.allowed
                        ? "Este expediente cumple con todos los requisitos para ser cerrado."
                        : "Este expediente tiene requisitos pendientes que deben completarse antes de cerrar."}
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground mb-2">Resumen del Caso</div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Paciente:</span>
                          <span className="font-medium">{selectedCase.patient_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Diagnóstico:</span>
                          <span className="font-medium">{selectedCase.diagnosis}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Facturado:</span>
                          <span className="font-medium">{formatCurrency(selectedCase.total_cost)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Saldo Pendiente:</span>
                          <span className={`font-medium ${selectedCase.balance > 0 ? "text-destructive" : "text-success"}`}>
                            {formatCurrency(selectedCase.balance)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {mockClosability.allowed && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="close_notes">Notas de Cierre</Label>
                          <Textarea
                            id="close_notes"
                            placeholder="Agregar observaciones sobre el cierre del expediente..."
                            rows={3}
                          />
                          <p className="text-xs text-muted-foreground">
                            Ej: "Paciente dado de alta con recuperación completa. Se programó cita de seguimiento."
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="final_diagnosis">Diagnóstico Final</Label>
                          <Input
                            id="final_diagnosis"
                            placeholder="Diagnóstico al momento del alta"
                            defaultValue={selectedCase.diagnosis}
                          />
                        </div>

                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>Atención</AlertTitle>
                          <AlertDescription className="text-sm">
                            Esta acción no se puede deshacer. El expediente será archivado y marcado como cerrado.
                          </AlertDescription>
                        </Alert>
                      </>
                    )}
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCloseDialogOpen(false)}>
                    Cancelar
                  </Button>
                  {mockClosability.allowed && (
                    <Button onClick={handleSubmitClose}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Confirmar Cierre
                    </Button>
                  )}
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}