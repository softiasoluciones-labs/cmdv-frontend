"use client"

import { useState, useMemo } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Search, Plus, Edit, Eye, Download, Printer, CheckCircle, XCircle, Clock,
  FileText, User, BedDouble, DollarSign, AlertTriangle, Stethoscope,
  ClipboardCheck, RefreshCw, ArrowRightLeft, Calendar, Building, Activity,
  TrendingUp, MoreVertical, FilePlus, Shield, Heart, Loader2, Package,
} from "lucide-react"
import { useCaseFile } from "@/hooks/medical-hooks/use-casefile"
import { usePatients } from "@/hooks/medical-hooks/use-patients"
import {
  CaseFileListResponse,
  CaseValidationResponse,
  ClosabilityResponse,
  TransferabilityResponse,
  CreateCaseFileRequest,
  UpdateCaseFileRequest,
  ShiftType,
  CaseStatus,
  CaseStatusFlow,
  CaseFileQueryParams,
  ValidationStatus,
} from "@/lib/api/types/medical-types/caseFile.type"

// ─── Status / type configs ───────────────────────────────────────────────────

const statusFlowConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  [CaseStatusFlow.C1_CREACION]:             { label: "Creación",        color: "bg-gray-100 text-gray-800",    icon: FileText },
  [CaseStatusFlow.C2_CANCELACION]:          { label: "Cancelado",       color: "bg-red-100 text-red-800",      icon: XCircle },
  [CaseStatusFlow.C3_CERRADO]:              { label: "Cerrado",         color: "bg-teal-100 text-teal-800",    icon: CheckCircle },
  [CaseStatusFlow.CE_CARGOS_EXPEDIENTE]:    { label: "Cargos",          color: "bg-blue-100 text-blue-800",    icon: DollarSign },
  [CaseStatusFlow.CC_CONFIRMACION_CARGOS]:  { label: "Confirmación",    color: "bg-purple-100 text-purple-800",icon: ClipboardCheck },
  [CaseStatusFlow.TR_TRASLADO_PROCEDIMIENTO]:{ label: "Traslado",       color: "bg-orange-100 text-orange-800",icon: ArrowRightLeft },
  [CaseStatusFlow.RA_REAPERTURA]:           { label: "Reapertura",      color: "bg-yellow-100 text-yellow-800",icon: RefreshCw },
  [CaseStatusFlow.EX_EXTORNO]:              { label: "Extorno",         color: "bg-pink-100 text-pink-800",    icon: Activity },
}

const caseStatusConfig: Record<string, { label: string; color: string }> = {
  [CaseStatus.ACTIVE]:            { label: "Activo",          color: "bg-green-100 text-green-800" },
  [CaseStatus.IN_TREATMENT]:      { label: "En Tratamiento",  color: "bg-blue-100 text-blue-800" },
  [CaseStatus.HOSPITALIZED]:      { label: "Hospitalizado",   color: "bg-purple-100 text-purple-800" },
  [CaseStatus.SURGERY_SCHEDULED]: { label: "Cirugía Prog.",   color: "bg-orange-100 text-orange-800" },
  [CaseStatus.RECOVERING]:        { label: "Recuperación",    color: "bg-teal-100 text-teal-800" },
  [CaseStatus.DISCHARGED]:        { label: "Alta",            color: "bg-gray-100 text-gray-800" },
  [CaseStatus.TRANSFERRED]:       { label: "Transferido",     color: "bg-yellow-100 text-yellow-800" },
  [CaseStatus.DECEASED]:          { label: "Fallecido",       color: "bg-red-900/10 text-red-800" },
}

const ACTIVE_STATUSES = new Set<CaseStatus>([
  CaseStatus.ACTIVE, CaseStatus.IN_TREATMENT, CaseStatus.HOSPITALIZED,
  CaseStatus.SURGERY_SCHEDULED, CaseStatus.RECOVERING,
])

const EMPTY_CREATE_FORM: CreateCaseFileRequest = {
  patient_id: "",
  admission_type_id: "",
  chief_complaint: "",
  initial_diagnosis: "",
  shift_type: ShiftType.DAYTIME,
  notes: "",
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CaseFilesPage() {
  const {
    caseFiles, selectedCaseFile, pagination, isLoading, error,
    fetchCaseFiles, fetchCaseFileById,
    createCaseFile, updateCaseFile, updateCaseStatus,
    validateCaseFile, canTransferCase, canCloseCase,
    clearError,
  } = useCaseFile()

  const { patients } = usePatients({ limit: 200 })

  // ── UI state ───────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [admissionTypeFilter, setAdmissionTypeFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("list")

  const [selectedCase, setSelectedCase] = useState<CaseFileListResponse | null>(null)

  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isTransferOpen, setIsTransferOpen] = useState(false)
  const [isCloseOpen, setIsCloseOpen] = useState(false)

  const [validation, setValidation] = useState<CaseValidationResponse | null>(null)
  const [closability, setClosability] = useState<ClosabilityResponse | null>(null)
  const [transferability, setTransferability] = useState<TransferabilityResponse | null>(null)
  const [isDialogLoading, setIsDialogLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ── Forms ──────────────────────────────────────────────────────────────────
  const [createForm, setCreateForm] = useState<CreateCaseFileRequest>(EMPTY_CREATE_FORM)
  const [editForm, setEditForm] = useState<UpdateCaseFileRequest>({})
  const [transferNotes, setTransferNotes] = useState("")
  const [closeNotes, setCloseNotes] = useState("")
  const [finalDiagnosis, setFinalDiagnosis] = useState("")

  // ── Server-side status filter ──────────────────────────────────────────────
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    const params: CaseFileQueryParams = {}
    if (value !== "all") params.case_status = value as CaseStatus
    fetchCaseFiles(params)
  }

  // ── Client-side filtering (search + admission type) ────────────────────────
  const filteredCaseFiles = useMemo(() => {
    const q = search.toLowerCase().trim()
    return caseFiles.filter(c => {
      const matchesSearch =
        !q ||
        c.case_number.toLowerCase().includes(q) ||
        c.patient_name.toLowerCase().includes(q)
      const matchesType =
        admissionTypeFilter === "all" ||
        c.admission_type_name === admissionTypeFilter
      return matchesSearch && matchesType
    })
  }, [caseFiles, search, admissionTypeFilter])

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const active      = caseFiles.filter(c => ACTIVE_STATUSES.has(c.case_status as CaseStatus))
    const hospitalized = caseFiles.filter(c => c.case_status === CaseStatus.HOSPITALIZED)
    const discharged  = caseFiles.filter(c => c.case_status === CaseStatus.DISCHARGED)
    const totalCost   = caseFiles.reduce((s, c) => s + (c.total_cost ?? 0), 0)
    return { active: active.length, hospitalized: hospitalized.length, discharged: discharged.length, totalCost }
  }, [caseFiles])

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleViewCase = async (row: CaseFileListResponse) => {
    setSelectedCase(row)
    setValidation(null)
    setIsDetailOpen(true)
    setIsDialogLoading(true)
    try {
      await fetchCaseFileById(row.id)
      const v = await validateCaseFile(row.id)
      setValidation(v)
    } finally {
      setIsDialogLoading(false)
    }
  }

  const handleEditCase = (row: CaseFileListResponse) => {
    setSelectedCase(row)
    setEditForm({
      initial_diagnosis: selectedCaseFile?.initial_diagnosis ?? "",
      final_diagnosis:   selectedCaseFile?.final_diagnosis   ?? "",
      notes:             selectedCaseFile?.notes              ?? "",
    })
    setIsEditOpen(true)
  }

  const handleTransferCase = async (row: CaseFileListResponse) => {
    setSelectedCase(row)
    setTransferNotes("")
    setIsDialogLoading(true)
    const result = await canTransferCase(row.id)
    setTransferability(result)
    setIsDialogLoading(false)
    setIsTransferOpen(true)
  }

  const handleCloseCase = async (row: CaseFileListResponse) => {
    setSelectedCase(row)
    setCloseNotes("")
    setFinalDiagnosis("")
    setIsDialogLoading(true)
    const result = await canCloseCase(row.id)
    setClosability(result)
    setIsDialogLoading(false)
    setIsCloseOpen(true)
  }

  const handleSubmitCreate = async () => {
    if (!createForm.patient_id || !createForm.admission_type_id || !createForm.chief_complaint) return
    setIsSubmitting(true)
    try {
      await createCaseFile(createForm)
      setIsCreateOpen(false)
      setCreateForm(EMPTY_CREATE_FORM)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitEdit = async () => {
    if (!selectedCase) return
    setIsSubmitting(true)
    try {
      await updateCaseFile(selectedCase.id, editForm)
      setIsEditOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitTransfer = async () => {
    if (!selectedCase) return
    setIsSubmitting(true)
    try {
      await updateCaseStatus(selectedCase.id, {
        status: CaseStatusFlow.TR_TRASLADO_PROCEDIMIENTO,
        notes: transferNotes,
      })
      setIsTransferOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitClose = async () => {
    if (!selectedCase) return
    setIsSubmitting(true)
    try {
      await updateCaseFile(selectedCase.id, {
        final_diagnosis: finalDiagnosis,
        notes: closeNotes,
        case_status: CaseStatus.DISCHARGED,
        current_status_flow: CaseStatusFlow.C3_CERRADO,
        discharge_date: new Date().toISOString(),
      })
      setIsCloseOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getStatusFlowConfig = (flow: string) =>
    statusFlowConfig[flow] ?? { label: flow, color: "bg-gray-100 text-gray-800", icon: FileText }

  const getCaseStatusConfig = (status: string) =>
    caseStatusConfig[status] ?? { label: status, color: "bg-gray-100 text-gray-800" }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("es-GT", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
    })

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ", minimumFractionDigits: 2 }).format(n)

  const isActiveCaseStatus = (status: string) => ACTIVE_STATUSES.has(status as CaseStatus)

  // Unique admission types from loaded data (for filter dropdown)
  const admissionTypeOptions = useMemo(() => {
    const names = new Set(caseFiles.map(c => c.admission_type_name).filter(Boolean))
    return Array.from(names) as string[]
  }, [caseFiles])

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Expedientes Médicos</h1>
            <p className="text-muted-foreground">Gestión de casos y seguimiento de pacientes</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setActiveTab(activeTab === "list" ? "analytics" : "list")}
            >
              {activeTab === "list" ? (
                <><TrendingUp className="mr-2 h-4 w-4" />Análisis</>
              ) : (
                <><FileText className="mr-2 h-4 w-4" />Ver Lista</>
              )}
            </Button>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Expediente
            </Button>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              {error}
              <Button variant="ghost" size="sm" onClick={clearError}>Cerrar</Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Casos Activos",    value: stats.active,       sub: `${stats.hospitalized} hospitalizados`, icon: FileText,      iconColor: "text-primary",     bg: "bg-primary/10" },
            { label: "En Hospitalización",value: stats.hospitalized, sub: "Pacientes ingresados",                  icon: BedDouble,     iconColor: "text-purple-600",  bg: "bg-purple-500/10" },
            { label: "Altas Médicas",    value: stats.discharged,   sub: "Expedientes cerrados",                  icon: CheckCircle,   iconColor: "text-teal-600",    bg: "bg-teal-500/10" },
            { label: "Total Facturado",  value: formatCurrency(stats.totalCost), sub: "Monto acumulado",           icon: DollarSign,    iconColor: "text-success",     bg: "bg-success/10", isText: true },
          ].map(({ label, value, sub, icon: Icon, iconColor, bg, isText }) => (
            <Card key={label}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${bg}`}>
                  <Icon className={`h-6 w-6 ${iconColor}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className={`font-bold ${isText ? "text-xl" : "text-2xl"}`}>{value}</p>
                  <p className="text-xs text-muted-foreground">{sub}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />Lista de Expedientes
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />Análisis
            </TabsTrigger>
          </TabsList>

          {/* ── Tab: Lista ─────────────────────────────────────────────────── */}
          <TabsContent value="list" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por no. de caso o paciente..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                      <SelectTrigger className="w-[170px]">
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los estados</SelectItem>
                        <SelectItem value={CaseStatus.ACTIVE}>Activo</SelectItem>
                        <SelectItem value={CaseStatus.IN_TREATMENT}>En Tratamiento</SelectItem>
                        <SelectItem value={CaseStatus.HOSPITALIZED}>Hospitalizado</SelectItem>
                        <SelectItem value={CaseStatus.SURGERY_SCHEDULED}>Cirugía Programada</SelectItem>
                        <SelectItem value={CaseStatus.RECOVERING}>Recuperación</SelectItem>
                        <SelectItem value={CaseStatus.DISCHARGED}>Alta</SelectItem>
                        <SelectItem value={CaseStatus.TRANSFERRED}>Transferido</SelectItem>
                      </SelectContent>
                    </Select>
                    {admissionTypeOptions.length > 0 && (
                      <Select value={admissionTypeFilter} onValueChange={setAdmissionTypeFilter}>
                        <SelectTrigger className="w-[170px]">
                          <SelectValue placeholder="Tipo Ingreso" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los tipos</SelectItem>
                          {admissionTypeOptions.map(t => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Table */}
            <Card>
              <CardHeader>
                <CardTitle>Expedientes Médicos</CardTitle>
                <CardDescription>
                  {isLoading
                    ? "Cargando expedientes..."
                    : `${filteredCaseFiles.length} ${filteredCaseFiles.length === 1 ? "expediente encontrado" : "expedientes encontrados"}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : filteredCaseFiles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <FileText className="mb-4 h-12 w-12 text-muted-foreground/40" />
                    <p className="font-medium text-muted-foreground">No se encontraron expedientes</p>
                    <p className="text-sm text-muted-foreground">
                      {search || statusFilter !== "all" || admissionTypeFilter !== "all"
                        ? "Intenta ajustar los filtros de búsqueda"
                        : "Crea el primer expediente médico"}
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No. Caso</TableHead>
                        <TableHead>Paciente</TableHead>
                        <TableHead>Tipo Ingreso</TableHead>
                        <TableHead>Fecha Ingreso</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Flujo</TableHead>
                        <TableHead className="text-right">Costo</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCaseFiles.map(row => {
                        const flowCfg = getStatusFlowConfig(row.current_status_flow)
                        const statusCfg = getCaseStatusConfig(row.case_status)
                        const FlowIcon = flowCfg.icon
                        const isActive = isActiveCaseStatus(row.case_status)

                        return (
                          <TableRow key={row.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">
                              <Badge variant="outline" className="font-mono text-xs">
                                {row.case_number}
                              </Badge>
                            </TableCell>

                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                <span className="font-medium">{row.patient_name}</span>
                              </div>
                            </TableCell>

                            <TableCell>
                              <span className="text-sm text-muted-foreground">
                                {row.admission_type_name ?? "—"}
                              </span>
                            </TableCell>

                            <TableCell>
                              <div className="flex items-center gap-1.5 text-sm">
                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                {formatDate(row.admission_date)}
                              </div>
                              {row.shift_type && (
                                <div className="mt-0.5 text-xs text-muted-foreground">
                                  {row.shift_type === ShiftType.DAYTIME ? "Turno diurno" : "Turno nocturno"}
                                </div>
                              )}
                            </TableCell>

                            <TableCell>
                              <Badge className={statusCfg.color}>{statusCfg.label}</Badge>
                            </TableCell>

                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                <FlowIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                <Badge className={`text-xs ${flowCfg.color}`}>{flowCfg.label}</Badge>
                              </div>
                            </TableCell>

                            <TableCell className="text-right">
                              <span className="font-medium">
                                {row.total_cost != null ? formatCurrency(row.total_cost) : "—"}
                              </span>
                            </TableCell>

                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost" size="icon"
                                  onClick={() => handleViewCase(row)}
                                  title="Ver detalle"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>

                                {isActive && (
                                  <>
                                    <Button
                                      variant="ghost" size="icon"
                                      onClick={() => handleEditCase(row)}
                                      title="Editar expediente"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost" size="icon"
                                      onClick={() => handleTransferCase(row)}
                                      title="Transferir caso"
                                      className="text-blue-600 hover:text-blue-700"
                                    >
                                      <ArrowRightLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost" size="icon"
                                      onClick={() => handleCloseCase(row)}
                                      title="Cerrar caso"
                                      className="text-teal-600 hover:text-teal-700"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
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
                                    <DropdownMenuItem onClick={() => handleViewCase(row)}>
                                      <Eye className="mr-2 h-4 w-4" />Ver Detalles
                                    </DropdownMenuItem>
                                    {isActive && (
                                      <>
                                        <DropdownMenuItem onClick={() => handleEditCase(row)}>
                                          <Edit className="mr-2 h-4 w-4" />Editar Expediente
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleTransferCase(row)}>
                                          <ArrowRightLeft className="mr-2 h-4 w-4" />Transferir Caso
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => handleCloseCase(row)}>
                                          <CheckCircle className="mr-2 h-4 w-4" />Cerrar Caso
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                      <Printer className="mr-2 h-4 w-4" />Imprimir
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
                )}
              </CardContent>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <CardFooter className="flex items-center justify-between border-t px-6 py-4">
                  <p className="text-sm text-muted-foreground">
                    Página {pagination.page} de {pagination.totalPages} — {pagination.total} expedientes
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline" size="sm"
                      disabled={pagination.page <= 1}
                      onClick={() => fetchCaseFiles({ page: pagination.page - 1 })}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline" size="sm"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => fetchCaseFiles({ page: pagination.page + 1 })}
                    >
                      Siguiente
                    </Button>
                  </div>
                </CardFooter>
              )}
            </Card>
          </TabsContent>

          {/* ── Tab: Análisis ───────────────────────────────────────────────── */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Análisis de Expedientes</CardTitle>
                <CardDescription>Estadísticas del período cargado</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Por estado */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Distribución por Estado</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {Object.entries(caseStatusConfig).map(([status, cfg]) => {
                        const count = caseFiles.filter(c => c.case_status === status).length
                        if (count === 0) return null
                        const pct = caseFiles.length > 0 ? (count / caseFiles.length) * 100 : 0
                        return (
                          <div key={status} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2 min-w-0">
                              <Badge className={`shrink-0 ${cfg.color}`}>{cfg.label}</Badge>
                            </div>
                            <div className="flex items-center gap-3 flex-1">
                              <Progress value={pct} className="h-2 flex-1" />
                              <span className="text-sm font-medium w-8 text-right">{count}</span>
                            </div>
                          </div>
                        )
                      })}
                    </CardContent>
                  </Card>

                  {/* Por tipo de ingreso */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Por Tipo de Ingreso</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {admissionTypeOptions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Sin datos disponibles</p>
                      ) : admissionTypeOptions.map(type => {
                        const count = caseFiles.filter(c => c.admission_type_name === type).length
                        const pct = caseFiles.length > 0 ? (count / caseFiles.length) * 100 : 0
                        return (
                          <div key={type} className="flex items-center justify-between gap-4">
                            <span className="text-sm min-w-[120px]">{type}</span>
                            <div className="flex items-center gap-3 flex-1">
                              <Progress value={pct} className="h-2 flex-1" />
                              <span className="text-sm font-medium w-8 text-right">{count}</span>
                            </div>
                          </div>
                        )
                      })}
                    </CardContent>
                  </Card>
                </div>

                {/* Métricas financieras */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Métricas Financieras</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Total Facturado</p>
                      <p className="text-2xl font-bold text-primary">{formatCurrency(stats.totalCost)}</p>
                      <p className="text-xs text-muted-foreground">{caseFiles.length} expedientes</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Valor Promedio por Caso</p>
                      <p className="text-2xl font-bold text-success">
                        {caseFiles.length > 0 ? formatCurrency(stats.totalCost / caseFiles.length) : "Q0.00"}
                      </p>
                      <p className="text-xs text-muted-foreground">Promedio general</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Casos Activos</p>
                      <p className="text-2xl font-bold">{stats.active}</p>
                      <p className="text-xs text-muted-foreground">De {caseFiles.length} totales</p>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          Dialog: VER DETALLE
      ═══════════════════════════════════════════════════════════════════════ */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          {selectedCase && (
            <>
              <DialogHeader>
                <DialogTitle>Detalle del Expediente</DialogTitle>
                <CardDescription className="pt-1">
                  <span className="font-mono">{selectedCase.case_number}</span>
                  {" · "}
                  <span className="font-medium">{selectedCase.patient_name}</span>
                </CardDescription>
              </DialogHeader>

              <ScrollArea className="h-[68vh] pr-4">
                {isDialogLoading ? (
                  <div className="space-y-4 py-4">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                  </div>
                ) : selectedCaseFile ? (
                  <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList>
                      <TabsTrigger value="overview">Resumen</TabsTrigger>
                      <TabsTrigger value="rooms">
                        Habitaciones
                        {selectedCaseFile.rooms && selectedCaseFile.rooms.length > 0 && (
                          <Badge variant="secondary" className="ml-1.5 text-xs">{selectedCaseFile.rooms.length}</Badge>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="packages">
                        Paquetes
                        {selectedCaseFile.packages && selectedCaseFile.packages.length > 0 && (
                          <Badge variant="secondary" className="ml-1.5 text-xs">{selectedCaseFile.packages.length}</Badge>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="validation">Validación</TabsTrigger>
                    </TabsList>

                    {/* Resumen */}
                    <TabsContent value="overview" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Paciente */}
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                              <User className="h-4 w-4" />Información del Paciente
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <Label className="text-xs text-muted-foreground">Nombre Completo</Label>
                              <p className="font-medium">
                                {selectedCaseFile.patient
                                  ? `${selectedCaseFile.patient.first_name} ${selectedCaseFile.patient.last_name}`
                                  : selectedCase.patient_name}
                              </p>
                            </div>
                            {selectedCaseFile.patient && (
                              <div>
                                <Label className="text-xs text-muted-foreground">No. de Expediente Paciente</Label>
                                <p className="font-mono text-sm">{selectedCaseFile.patient.file_number}</p>
                              </div>
                            )}
                            <div>
                              <Label className="text-xs text-muted-foreground">Motivo de Consulta</Label>
                              <p className="text-sm">{selectedCaseFile.chief_complaint || "—"}</p>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Caso */}
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                              <Stethoscope className="h-4 w-4" />Información del Caso
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs text-muted-foreground">Estado</Label>
                                <div className="mt-1">
                                  <Badge className={getCaseStatusConfig(selectedCaseFile.case_status).color}>
                                    {getCaseStatusConfig(selectedCaseFile.case_status).label}
                                  </Badge>
                                </div>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Flujo Actual</Label>
                                <div className="mt-1">
                                  <Badge className={getStatusFlowConfig(selectedCaseFile.current_status_flow).color}>
                                    {getStatusFlowConfig(selectedCaseFile.current_status_flow).label}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Tipo de Ingreso</Label>
                              <p className="text-sm font-medium">
                                {selectedCaseFile.admissionType?.name ?? selectedCaseFile.admission_type ?? "—"}
                              </p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs text-muted-foreground">Fecha Ingreso</Label>
                                <p className="text-sm">{formatDate(selectedCaseFile.admission_date)}</p>
                              </div>
                              {selectedCaseFile.discharge_date && (
                                <div>
                                  <Label className="text-xs text-muted-foreground">Fecha Alta</Label>
                                  <p className="text-sm">{formatDate(selectedCaseFile.discharge_date)}</p>
                                </div>
                              )}
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Turno</Label>
                              <p className="text-sm">
                                {selectedCaseFile.shift_type === ShiftType.DAYTIME ? "Turno Diurno" : "Turno Nocturno"}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Diagnósticos */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <ClipboardCheck className="h-4 w-4" />Diagnósticos
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs text-muted-foreground">Diagnóstico Inicial</Label>
                            <p className="text-sm mt-1">{selectedCaseFile.initial_diagnosis || "No registrado"}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Diagnóstico Final</Label>
                            <p className="text-sm mt-1">{selectedCaseFile.final_diagnosis || "No registrado"}</p>
                          </div>
                          {selectedCaseFile.notes && (
                            <div className="md:col-span-2">
                              <Label className="text-xs text-muted-foreground">Notas</Label>
                              <p className="text-sm mt-1 text-muted-foreground">{selectedCaseFile.notes}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Financiero */}
                      {selectedCaseFile.total_cost != null && (
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />Información Financiera
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Costo Total:</span>
                              <span className="text-lg font-bold">{formatCurrency(selectedCaseFile.total_cost)}</span>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>

                    {/* Habitaciones */}
                    <TabsContent value="rooms">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <BedDouble className="h-4 w-4" />Habitaciones Asignadas
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {!selectedCaseFile.rooms || selectedCaseFile.rooms.length === 0 ? (
                            <div className="flex flex-col items-center py-10 text-center text-muted-foreground">
                              <BedDouble className="mb-3 h-10 w-10 opacity-30" />
                              <p className="font-medium">Sin habitación asignada</p>
                            </div>
                          ) : (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Habitación</TableHead>
                                  <TableHead>Tipo</TableHead>
                                  <TableHead>Ingreso</TableHead>
                                  <TableHead>Egreso</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {selectedCaseFile.rooms.map(room => (
                                  <TableRow key={room.id}>
                                    <TableCell className="font-medium">{room.room_number}</TableCell>
                                    <TableCell>{room.room_type}</TableCell>
                                    <TableCell>{formatDate(room.check_in_date)}</TableCell>
                                    <TableCell>{room.check_out_date ? formatDate(room.check_out_date) : <span className="text-muted-foreground">Actual</span>}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Paquetes */}
                    <TabsContent value="packages">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Package className="h-4 w-4" />Paquetes Asignados
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {!selectedCaseFile.packages || selectedCaseFile.packages.length === 0 ? (
                            <div className="flex flex-col items-center py-10 text-center text-muted-foreground">
                              <Package className="mb-3 h-10 w-10 opacity-30" />
                              <p className="font-medium">Sin paquetes asignados</p>
                            </div>
                          ) : (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Paquete</TableHead>
                                  <TableHead>Médico</TableHead>
                                  <TableHead className="text-right">Precio Aplicado</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {selectedCaseFile.packages.map(pkg => (
                                  <TableRow key={pkg.id}>
                                    <TableCell className="font-medium">{pkg.package_name}</TableCell>
                                    <TableCell>{pkg.doctor_name}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(pkg.price_applied)}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Validación */}
                    <TabsContent value="validation">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Shield className="h-4 w-4" />Validación del Expediente
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {!validation ? (
                            <div className="flex items-center justify-center py-8 gap-3 text-muted-foreground">
                              <Loader2 className="h-5 w-5 animate-spin" />
                              Cargando validación...
                            </div>
                          ) : (
                            <>
                              <Alert className={
                                validation.validation_status === ValidationStatus.COMPLIANT
                                  ? "bg-success/10 border-success/30"
                                  : "bg-warning/10 border-warning/30"
                              }>
                                {validation.validation_status === ValidationStatus.COMPLIANT
                                  ? <CheckCircle className="h-4 w-4 text-success" />
                                  : <AlertTriangle className="h-4 w-4 text-warning" />}
                                <AlertTitle>
                                  {validation.validation_status === ValidationStatus.COMPLIANT
                                    ? "Expediente Conforme"
                                    : "Expediente con Observaciones"}
                                </AlertTitle>
                                <AlertDescription>
                                  {validation.validation_status === ValidationStatus.COMPLIANT
                                    ? "Cumple con todos los requisitos del sistema."
                                    : "Hay requisitos pendientes por completar."}
                                </AlertDescription>
                              </Alert>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {[
                                  {
                                    label: "Habitación",
                                    ok: validation.has_room_assigned,
                                    required: validation.requires_hospitalization,
                                    icon: BedDouble,
                                  },
                                  {
                                    label: "Paquete",
                                    ok: validation.has_package_assigned,
                                    required: validation.requires_package,
                                    icon: Package,
                                  },
                                  {
                                    label: "Pago",
                                    ok: validation.has_payment,
                                    required: validation.requires_immediate_payment,
                                    icon: DollarSign,
                                  },
                                  {
                                    label: "Transferencia",
                                    ok: validation.allows_transfer,
                                    required: false,
                                    icon: ArrowRightLeft,
                                  },
                                ].map(({ label, ok, required, icon: Icon }) => (
                                  <div
                                    key={label}
                                    className={`rounded-lg p-4 text-center ${
                                      ok ? "bg-success/10 text-success"
                                        : required ? "bg-warning/10 text-warning"
                                        : "bg-muted/40 text-muted-foreground"
                                    }`}
                                  >
                                    <Icon className="h-5 w-5 mx-auto mb-1.5" />
                                    <p className="text-sm font-medium">{label}</p>
                                    <p className="text-xs">{ok ? "Cumplido" : required ? "Pendiente" : "N/A"}</p>
                                  </div>
                                ))}
                              </div>

                              {validation.validation_messages.length > 0 && (
                                <Alert variant="destructive">
                                  <AlertTriangle className="h-4 w-4" />
                                  <AlertTitle>Mensajes del Sistema</AlertTitle>
                                  <AlertDescription>
                                    <ul className="list-disc pl-4 mt-2 space-y-1">
                                      {validation.validation_messages.map((msg, i) => (
                                        <li key={i} className="text-sm">{msg}</li>
                                      ))}
                                    </ul>
                                  </AlertDescription>
                                </Alert>
                              )}
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="flex items-center justify-center py-12 text-muted-foreground gap-3">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Cargando expediente...
                  </div>
                )}
              </ScrollArea>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>Cerrar</Button>
                {selectedCaseFile && isActiveCaseStatus(selectedCaseFile.case_status) && (
                  <>
                    <Button variant="outline" onClick={() => { setIsDetailOpen(false); handleEditCase(selectedCase) }}>
                      <Edit className="mr-2 h-4 w-4" />Editar
                    </Button>
                    <Button onClick={() => { setIsDetailOpen(false); handleCloseCase(selectedCase) }}>
                      <CheckCircle className="mr-2 h-4 w-4" />Cerrar Expediente
                    </Button>
                  </>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════════
          Dialog: CREAR EXPEDIENTE
      ═══════════════════════════════════════════════════════════════════════ */}
      <Dialog open={isCreateOpen} onOpenChange={open => { if (!isSubmitting) { setIsCreateOpen(open); if (!open) setCreateForm(EMPTY_CREATE_FORM) } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nuevo Expediente Médico</DialogTitle>
            <CardDescription>Complete los datos para crear el expediente</CardDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4 py-2">
              {/* Paciente */}
              <div className="space-y-2">
                <Label htmlFor="create-patient">Paciente <span className="text-destructive">*</span></Label>
                <Select
                  value={createForm.patient_id}
                  onValueChange={v => setCreateForm(f => ({ ...f, patient_id: v }))}
                >
                  <SelectTrigger id="create-patient">
                    <SelectValue placeholder="Seleccionar paciente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.fullName || `${p.firstName} ${p.lastName}`}
                        {p.fileNumber && <span className="text-muted-foreground ml-2 text-xs">({p.fileNumber})</span>}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tipo de ingreso */}
              <div className="space-y-2">
                <Label htmlFor="create-admission-type">Tipo de Ingreso <span className="text-destructive">*</span></Label>
                <Input
                  id="create-admission-type"
                  placeholder="ID del tipo de ingreso"
                  value={createForm.admission_type_id}
                  onChange={e => setCreateForm(f => ({ ...f, admission_type_id: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">Ingresa el ID del tipo de admisión configurado en el sistema</p>
              </div>

              {/* Motivo de consulta */}
              <div className="space-y-2">
                <Label htmlFor="create-complaint">Motivo de Consulta <span className="text-destructive">*</span></Label>
                <Textarea
                  id="create-complaint"
                  placeholder="Describe el motivo de consulta del paciente..."
                  value={createForm.chief_complaint}
                  onChange={e => setCreateForm(f => ({ ...f, chief_complaint: e.target.value }))}
                  rows={3}
                />
              </div>

              {/* Diagnóstico inicial */}
              <div className="space-y-2">
                <Label htmlFor="create-diagnosis">Diagnóstico Inicial</Label>
                <Input
                  id="create-diagnosis"
                  placeholder="Diagnóstico presuntivo..."
                  value={createForm.initial_diagnosis ?? ""}
                  onChange={e => setCreateForm(f => ({ ...f, initial_diagnosis: e.target.value }))}
                />
              </div>

              {/* Turno */}
              <div className="space-y-2">
                <Label>Turno</Label>
                <Select
                  value={createForm.shift_type ?? ShiftType.DAYTIME}
                  onValueChange={v => setCreateForm(f => ({ ...f, shift_type: v as ShiftType }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ShiftType.DAYTIME}>Turno Diurno</SelectItem>
                    <SelectItem value={ShiftType.NIGHTTIME}>Turno Nocturno</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Es transferencia */}
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label className="font-medium">Transferencia</Label>
                  <p className="text-xs text-muted-foreground">¿Este caso es una transferencia de otro expediente?</p>
                </div>
                <Select
                  value={createForm.is_transfer ? "yes" : "no"}
                  onValueChange={v => setCreateForm(f => ({ ...f, is_transfer: v === "yes" }))}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="yes">Sí</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notas */}
              <div className="space-y-2">
                <Label htmlFor="create-notes">Notas Adicionales</Label>
                <Textarea
                  id="create-notes"
                  placeholder="Observaciones adicionales..."
                  value={createForm.notes ?? ""}
                  onChange={e => setCreateForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2}
                />
              </div>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmitCreate}
              disabled={isSubmitting || !createForm.patient_id || !createForm.admission_type_id || !createForm.chief_complaint}
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Crear Expediente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════════
          Dialog: EDITAR EXPEDIENTE
      ═══════════════════════════════════════════════════════════════════════ */}
      <Dialog open={isEditOpen} onOpenChange={open => { if (!isSubmitting) setIsEditOpen(open) }}>
        <DialogContent className="max-w-lg">
          {selectedCase && (
            <>
              <DialogHeader>
                <DialogTitle>Editar Expediente</DialogTitle>
                <CardDescription>
                  <span className="font-mono">{selectedCase.case_number}</span>
                  {" · "}{selectedCase.patient_name}
                </CardDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-initial-diag">Diagnóstico Inicial</Label>
                  <Input
                    id="edit-initial-diag"
                    value={editForm.initial_diagnosis ?? ""}
                    onChange={e => setEditForm(f => ({ ...f, initial_diagnosis: e.target.value }))}
                    placeholder="Diagnóstico inicial..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-final-diag">Diagnóstico Final</Label>
                  <Input
                    id="edit-final-diag"
                    value={editForm.final_diagnosis ?? ""}
                    onChange={e => setEditForm(f => ({ ...f, final_diagnosis: e.target.value }))}
                    placeholder="Diagnóstico final..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-notes">Notas</Label>
                  <Textarea
                    id="edit-notes"
                    value={editForm.notes ?? ""}
                    onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Observaciones del expediente..."
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={isSubmitting}>Cancelar</Button>
                <Button onClick={handleSubmitEdit} disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Edit className="mr-2 h-4 w-4" />}
                  Guardar Cambios
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════════
          Dialog: TRANSFERIR CASO
      ═══════════════════════════════════════════════════════════════════════ */}
      <Dialog open={isTransferOpen} onOpenChange={open => { if (!isSubmitting) setIsTransferOpen(open) }}>
        <DialogContent className="max-w-md">
          {selectedCase && (
            <>
              <DialogHeader>
                <DialogTitle>Transferir Expediente</DialogTitle>
                <CardDescription>
                  <span className="font-mono">{selectedCase.case_number}</span>
                  {" · "}{selectedCase.patient_name}
                </CardDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {isDialogLoading ? (
                  <div className="flex items-center justify-center py-8 gap-3 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />Verificando transferibilidad...
                  </div>
                ) : transferability ? (
                  <>
                    <Alert className={transferability.allowed ? "bg-success/10 border-success/30" : "bg-destructive/10 border-destructive/30"}>
                      {transferability.allowed
                        ? <CheckCircle className="h-4 w-4 text-success" />
                        : <XCircle className="h-4 w-4 text-destructive" />}
                      <AlertTitle>
                        {transferability.allowed ? "Transferencia Permitida" : "Transferencia No Permitida"}
                      </AlertTitle>
                      {transferability.reason && (
                        <AlertDescription>{transferability.reason}</AlertDescription>
                      )}
                    </Alert>

                    {transferability.allowed && (
                      <div className="space-y-2">
                        <Label htmlFor="transfer-notes">Notas de Transferencia</Label>
                        <Textarea
                          id="transfer-notes"
                          placeholder="Motivo y observaciones de la transferencia..."
                          value={transferNotes}
                          onChange={e => setTransferNotes(e.target.value)}
                          rows={3}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>No se pudo verificar</AlertTitle>
                    <AlertDescription>No fue posible verificar la transferibilidad del expediente.</AlertDescription>
                  </Alert>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsTransferOpen(false)} disabled={isSubmitting}>Cancelar</Button>
                {transferability?.allowed && (
                  <Button onClick={handleSubmitTransfer} disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRightLeft className="mr-2 h-4 w-4" />}
                    Confirmar Traslado
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════════
          Dialog: CERRAR CASO
      ═══════════════════════════════════════════════════════════════════════ */}
      <Dialog open={isCloseOpen} onOpenChange={open => { if (!isSubmitting) setIsCloseOpen(open) }}>
        <DialogContent className="max-w-md">
          {selectedCase && (
            <>
              <DialogHeader>
                <DialogTitle>Cerrar Expediente</DialogTitle>
                <CardDescription>
                  <span className="font-mono">{selectedCase.case_number}</span>
                  {" · "}{selectedCase.patient_name}
                </CardDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {isDialogLoading ? (
                  <div className="flex items-center justify-center py-8 gap-3 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />Verificando condiciones de cierre...
                  </div>
                ) : closability ? (
                  <>
                    <Alert className={closability.allowed ? "bg-success/10 border-success/30" : "bg-destructive/10 border-destructive/30"}>
                      {closability.allowed
                        ? <CheckCircle className="h-4 w-4 text-success" />
                        : <XCircle className="h-4 w-4 text-destructive" />}
                      <AlertTitle>
                        {closability.allowed ? "Expediente Cerrable" : "No Se Puede Cerrar"}
                      </AlertTitle>
                      <AlertDescription>
                        {closability.allowed
                          ? "Cumple todos los requisitos para proceder con el alta."
                          : closability.reason ?? "Hay requisitos pendientes antes de cerrar el expediente."}
                      </AlertDescription>
                    </Alert>

                    {closability.allowed && (
                      <>
                        <div className="rounded-lg border p-3 space-y-2 text-sm">
                          <p className="font-medium">Resumen del Caso</p>
                          <div className="flex justify-between text-muted-foreground">
                            <span>Paciente:</span>
                            <span className="font-medium text-foreground">{selectedCase.patient_name}</span>
                          </div>
                          {selectedCase.total_cost != null && (
                            <div className="flex justify-between text-muted-foreground">
                              <span>Total Facturado:</span>
                              <span className="font-medium text-foreground">{formatCurrency(selectedCase.total_cost)}</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="close-final-diag">Diagnóstico Final</Label>
                          <Input
                            id="close-final-diag"
                            placeholder="Diagnóstico al momento del alta..."
                            value={finalDiagnosis}
                            onChange={e => setFinalDiagnosis(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="close-notes">Notas de Cierre</Label>
                          <Textarea
                            id="close-notes"
                            placeholder="Observaciones del alta médica..."
                            value={closeNotes}
                            onChange={e => setCloseNotes(e.target.value)}
                            rows={3}
                          />
                        </div>

                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>Acción Irreversible</AlertTitle>
                          <AlertDescription className="text-sm">
                            El expediente será marcado como cerrado y no podrá reactivarse sin autorización.
                          </AlertDescription>
                        </Alert>
                      </>
                    )}
                  </>
                ) : (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>No se pudo verificar</AlertTitle>
                    <AlertDescription>No fue posible verificar las condiciones de cierre.</AlertDescription>
                  </Alert>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCloseOpen(false)} disabled={isSubmitting}>Cancelar</Button>
                {closability?.allowed && (
                  <Button onClick={handleSubmitClose} disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                    Confirmar Alta
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
