"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft, Save, X, Search, AlertTriangle, User, Phone, Mail,
  FileText, CheckCircle, XCircle, Loader2, Shield, RefreshCw,
  CreditCard, MapPin, Calendar, BedDouble, Package as PackageIcon, UserCog,
} from "lucide-react"
import { useCaseFile } from "@/hooks/medical-hooks/use-casefile"
import { usePatients } from "@/hooks/medical-hooks/use-patients"
import { useAdmissionTypes } from "@/hooks/medical-hooks/use-admission-types"
import { useRooms } from "@/hooks/medical-hooks/use-rooms"
import { usePackages } from "@/hooks/medical-hooks/use-packages"
import { useDoctors } from "@/hooks/medical-hooks/use-doctors"
import { CreateCaseFileRequest, ShiftType } from "@/lib/api/types/medical-types/caseFile.type"
import { Patients, PatientsQueryParams } from "@/lib/api/types/medical-types/patient.types"
import { AdmissionTypeListResponse } from "@/lib/api/types/medical-types/admission-type.types"

const EMPTY_FORM: CreateCaseFileRequest = {
  patient_id: "",
  admission_type_id: "",
  chief_complaint: "",
  initial_diagnosis: "",
  shift_type: ShiftType.DAYTIME,
  notes: "",
}

const EMPTY_SEARCH = { search: "", gender: "all", isActive: "all" }

function formatGender(g: string): string {
  if (g === "male") return "Masculino"
  if (g === "female") return "Femenino"
  return g ?? "—"
}

function getAllergiesText(allergies: string | string[] | undefined): string {
  if (!allergies) return ""
  if (Array.isArray(allergies)) return allergies.filter(Boolean).join(", ")
  return allergies
}

export default function NewCaseFilePage() {
  const router = useRouter()
  const { createCaseFile } = useCaseFile()
  const { patients, isLoading: isSearching, fetchPatients } = usePatients()
  const { admissionTypes, isLoading: isLoadingAdmissionTypes, fetchAdmissionTypes } = useAdmissionTypes()
  const { rooms, isLoading: isLoadingRooms } = useRooms()
  const { packages, isLoading: isLoadingPackages, fetchPackages } = usePackages()
  const { doctors, isLoading: isLoadingDoctors } = useDoctors()

  const [form, setForm] = useState<CreateCaseFileRequest>(EMPTY_FORM)

  const [selectedPatient, setSelectedPatient] = useState<Patients | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [searchForm, setSearchForm] = useState(EMPTY_SEARCH)

  const [selectedAdmissionType, setSelectedAdmissionType] = useState<AdmissionTypeListResponse | null>(null)
  const [admissionTypeSearch, setAdmissionTypeSearch] = useState("")
  const [showAdmissionTypeDropdown, setShowAdmissionTypeDropdown] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    const params: PatientsQueryParams = { limit: 15 }
    if (searchForm.search.trim()) params.search = searchForm.search.trim()
    if (searchForm.gender !== "all") params.gender = searchForm.gender
    if (searchForm.isActive !== "all") params.isActive = searchForm.isActive === "true"
    await fetchPatients(params)
    setHasSearched(true)
  }

  const handleSelectPatient = (patient: Patients) => {
    setSelectedPatient(patient)
    setForm(f => ({ ...f, patient_id: patient.id }))
  }

  const handleClearPatient = () => {
    setSelectedPatient(null)
    setForm(f => ({ ...f, patient_id: "" }))
  }

  const handleSelectAdmissionType = (type: AdmissionTypeListResponse) => {
    setSelectedAdmissionType(type)
    setForm(f => ({
      ...f,
      admission_type_id: type.id,
      room_id: type.requires_hospitalization ? f.room_id : undefined,
      package_id: type.requires_package ? f.package_id : undefined,
      doctor_id: type.requires_package ? f.doctor_id : undefined,
    }))
    setShowAdmissionTypeDropdown(false)
    setAdmissionTypeSearch("")
  }

  const handleClearAdmissionType = () => {
    setSelectedAdmissionType(null)
    setForm(f => ({ ...f, admission_type_id: "", room_id: undefined, package_id: undefined, doctor_id: undefined }))
  }

  const handleAdmissionTypeInputChange = async (value: string) => {
    setAdmissionTypeSearch(value)
    setShowAdmissionTypeDropdown(true)
    await fetchAdmissionTypes({ search: value.trim() || undefined, is_active: true })
  }

  const handleSubmit = async () => {
    if (!form.patient_id || !form.admission_type_id || !form.chief_complaint) {
      setError("Complete los campos obligatorios: Paciente, Tipo de Ingreso y Motivo de Consulta")
      return
    }
    if (selectedAdmissionType?.requires_hospitalization && !form.room_id) {
      setError("Este tipo de ingreso requiere asignar una habitación")
      return
    }
    if (selectedAdmissionType?.requires_package && (!form.package_id || !form.doctor_id)) {
      setError("Este tipo de ingreso requiere asignar un paquete y médico")
      return
    }
    setIsSubmitting(true)
    setError(null)
    try {
      await createCaseFile(form)
      router.push("/medical/case-files")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el expediente")
      setIsSubmitting(false)
    }
  }

  const canSubmit = !isSubmitting && !!form.patient_id && !!form.admission_type_id && !!form.chief_complaint
  const allergiesText = getAllergiesText(selectedPatient?.allergies)

  return (
    <DashboardLayout>
      <div className="space-y-6">

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/medical/case-files")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Nuevo Expediente Médico</h1>
            <p className="text-muted-foreground">Busca y selecciona un paciente para crear el expediente</p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-5">

          <div className="space-y-6 lg:col-span-3">

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Selección de Paciente
                  {form.patient_id && (
                    <Badge className="bg-success/10 text-success border-success/20">Seleccionado</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {selectedPatient
                    ? "Paciente vinculado al expediente"
                    : "Busca por nombre, identificación o teléfono y selecciona de los resultados"}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {selectedPatient ? (
                  <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-lg font-semibold leading-tight truncate">
                            {selectedPatient.fullName || `${selectedPatient.firstName} ${selectedPatient.lastName}`}
                          </p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {selectedPatient.fileNumber && (
                              <Badge variant="outline" className="font-mono text-xs">
                                {selectedPatient.fileNumber}
                              </Badge>
                            )}
                            <Badge
                              className={selectedPatient.isActive
                                ? "bg-success/10 text-success border-success/20"
                                : "bg-destructive/10 text-destructive border-destructive/20"}
                            >
                              {selectedPatient.isActive ? "Activo" : "Inactivo"}
                            </Badge>
                            {selectedPatient.bloodType && (
                              <Badge variant="secondary" className="text-xs">
                                {selectedPatient.bloodType}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearPatient}
                        className="shrink-0 text-muted-foreground hover:text-foreground"
                      >
                        <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                        Cambiar
                      </Button>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      {selectedPatient.identificationNumber && (
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <span className="text-muted-foreground">ID:</span>
                          <span className="font-medium">{selectedPatient.identificationNumber}</span>
                        </div>
                      )}
                      {selectedPatient.gender && (
                        <div className="flex items-center gap-2">
                          <Shield className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <span className="text-muted-foreground">Género:</span>
                          <span className="font-medium">{formatGender(selectedPatient.gender)}</span>
                        </div>
                      )}
                      {selectedPatient.age > 0 && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <span className="text-muted-foreground">Edad:</span>
                          <span className="font-medium">{selectedPatient.age} años</span>
                        </div>
                      )}
                      {(selectedPatient.phone || selectedPatient.mobile) && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <span className="font-medium">{selectedPatient.phone || selectedPatient.mobile}</span>
                        </div>
                      )}
                      {selectedPatient.email && (
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <span className="truncate text-muted-foreground">{selectedPatient.email}</span>
                        </div>
                      )}
                      {(selectedPatient.city || selectedPatient.state) && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {[selectedPatient.city, selectedPatient.state].filter(Boolean).join(", ")}
                          </span>
                        </div>
                      )}
                    </div>

                    {allergiesText && (
                      <div className="rounded-md bg-warning/10 border border-warning/20 px-3 py-2 text-xs">
                        <span className="font-semibold text-warning">⚠ Alergias registradas: </span>
                        <span className="text-foreground">{allergiesText}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                      <div className="flex-1 space-y-1.5">
                        <Label htmlFor="patient-search" className="text-xs font-medium">
                          Nombre, identificación o teléfono
                        </Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="patient-search"
                            placeholder="Buscar paciente..."
                            value={searchForm.search}
                            onChange={e => setSearchForm(f => ({ ...f, search: e.target.value }))}
                            onKeyDown={e => { if (e.key === "Enter") handleSearch() }}
                            className="pl-9"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Género</Label>
                        <Select
                          value={searchForm.gender}
                          onValueChange={v => setSearchForm(f => ({ ...f, gender: v }))}
                        >
                          <SelectTrigger className="w-[130px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="male">Masculino</SelectItem>
                            <SelectItem value="female">Femenino</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Estado</Label>
                        <Select
                          value={searchForm.isActive}
                          onValueChange={v => setSearchForm(f => ({ ...f, isActive: v }))}
                        >
                          <SelectTrigger className="w-[130px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="true">Activos</SelectItem>
                            <SelectItem value="false">Inactivos</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        onClick={handleSearch}
                        disabled={isSearching && hasSearched}
                        className="shrink-0"
                      >
                        {isSearching && hasSearched
                          ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          : <Search className="mr-2 h-4 w-4" />}
                        Buscar
                      </Button>
                    </div>

                    {!hasSearched ? (
                      <div className="flex flex-col items-center py-10 text-center text-muted-foreground border border-dashed rounded-lg">
                        <Search className="mb-3 h-10 w-10 opacity-20" />
                        <p className="font-medium">Busca un paciente para comenzar</p>
                        <p className="text-sm mt-1">
                          Usa los filtros de arriba o presiona <kbd className="px-1.5 py-0.5 text-xs rounded border bg-muted">Enter</kbd>
                        </p>
                      </div>
                    ) : isSearching ? (
                      <div className="space-y-2 mt-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <Skeleton key={i} className="h-12 w-full" />
                        ))}
                      </div>
                    ) : patients.length === 0 ? (
                      <div className="flex flex-col items-center py-10 text-center text-muted-foreground border border-dashed rounded-lg mt-2">
                        <User className="mb-3 h-10 w-10 opacity-20" />
                        <p className="font-medium">Sin resultados</p>
                        <p className="text-sm mt-1">No se encontraron pacientes con los filtros aplicados</p>
                      </div>
                    ) : (
                      <div className="rounded-md border overflow-hidden mt-2">
                        <div className="overflow-x-auto">
                          <div className="max-h-72 overflow-y-auto">
                            <Table>
                              <TableHeader className="sticky top-0 bg-background shadow-sm">
                                <TableRow>
                                  <TableHead>Nombre</TableHead>
                                  <TableHead>No. Expediente</TableHead>
                                  <TableHead>Identificación</TableHead>
                                  <TableHead>Teléfono</TableHead>
                                  <TableHead>Género</TableHead>
                                  <TableHead>Estado</TableHead>
                                  <TableHead />
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {patients.map(patient => (
                                  <TableRow key={patient.id} className="hover:bg-muted/40">
                                    <TableCell className="font-medium whitespace-nowrap">
                                      {patient.fullName || `${patient.firstName} ${patient.lastName}`}
                                    </TableCell>
                                    <TableCell>
                                      {patient.fileNumber ? (
                                        <Badge variant="outline" className="font-mono text-xs">
                                          {patient.fileNumber}
                                        </Badge>
                                      ) : (
                                        <span className="text-muted-foreground">—</span>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                      {patient.identificationNumber || "—"}
                                    </TableCell>
                                    <TableCell className="text-sm whitespace-nowrap">
                                      {patient.phone || patient.mobile || "—"}
                                    </TableCell>
                                    <TableCell className="text-sm whitespace-nowrap">
                                      {formatGender(patient.gender)}
                                    </TableCell>
                                    <TableCell>
                                      <Badge
                                        variant="outline"
                                        className={patient.isActive
                                          ? "bg-success/10 text-success border-success/20"
                                          : "text-muted-foreground"}
                                      >
                                        {patient.isActive ? "Activo" : "Inactivo"}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleSelectPatient(patient)}
                                      >
                                        Seleccionar
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                        <div className="border-t px-4 py-2 text-xs text-muted-foreground bg-muted/20">
                          {patients.length} {patients.length === 1 ? "resultado" : "resultados"} — haz clic en Seleccionar para vincular el paciente
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Datos del Expediente
                </CardTitle>
                <CardDescription>
                  Los campos con <span className="text-destructive">*</span> son obligatorios
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">

                <div className="space-y-2">
                  <Label htmlFor="admission-type">
                    Tipo de Ingreso <span className="text-destructive">*</span>
                  </Label>
                  {selectedAdmissionType ? (
                    <div className="rounded-lg border p-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{selectedAdmissionType.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{selectedAdmissionType.code}</p>
                        <div className="flex gap-2 mt-1">
                          {selectedAdmissionType.requires_hospitalization && (
                            <Badge variant="secondary" className="text-xs">
                              <BedDouble className="h-3 w-3 mr-1" />Requiere habitación
                            </Badge>
                          )}
                          {selectedAdmissionType.requires_package && (
                            <Badge variant="secondary" className="text-xs">
                              <PackageIcon className="h-3 w-3 mr-1" />Requiere paquete
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={handleClearAdmissionType}>
                        <RefreshCw className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <div className="relative">
                      <Input
                        id="admission-type"
                        placeholder="Buscar tipo de ingreso..."
                        value={admissionTypeSearch}
                        onChange={e => handleAdmissionTypeInputChange(e.target.value)}
                        onFocus={() => setShowAdmissionTypeDropdown(true)}
                      />
                      {showAdmissionTypeDropdown && admissionTypes.length > 0 && (
                        <div className="absolute z-50 top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-md border bg-background shadow-lg">
                          {isLoadingAdmissionTypes ? (
                            <div className="p-4 text-center text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                              Cargando...
                            </div>
                          ) : (
                            <div className="py-1">
                              {admissionTypes.map(type => (
                                <button
                                  key={type.id}
                                  type="button"
                                  className="w-full px-4 py-2 text-left hover:bg-muted/50 flex items-center justify-between"
                                  onClick={() => handleSelectAdmissionType(type)}
                                >
                                  <div>
                                    <p className="font-medium text-sm">{type.name}</p>
                                    <p className="text-xs text-muted-foreground">{type.code}</p>
                                  </div>
                                  <div className="flex gap-1">
                                    {type.requires_hospitalization && (
                                      <Badge variant="outline" className="text-xs">
                                        <BedDouble className="h-3 w-3" />
                                      </Badge>
                                    )}
                                    {type.requires_package && (
                                      <Badge variant="outline" className="text-xs">
                                        <PackageIcon className="h-3 w-3" />
                                      </Badge>
                                    )}
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {selectedAdmissionType?.requires_hospitalization && (
                  <div className="space-y-2">
                    <Label htmlFor="room-id">
                      Habitación <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={form.room_id ?? "none"}
                      onValueChange={v => setForm(f => ({ ...f, room_id: v === "none" ? undefined : v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar habitación..." />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingRooms ? (
                          <SelectItem value="loading" disabled>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Cargando...
                          </SelectItem>
                        ) : rooms.length === 0 ? (
                          <SelectItem value="empty" disabled>No hay habitaciones disponibles</SelectItem>
                        ) : (
                          rooms.map(room => (
                            <SelectItem key={room.id} value={room.id}>
                              {room.room_number} - {room.room_type}
                              {room.floor ? ` (Piso ${room.floor})` : ""}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Este tipo de ingreso requiere asignar una habitación
                    </p>
                  </div>
                )}

                {selectedAdmissionType?.requires_package && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="package-id">
                        Paquete <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={form.package_id ?? "none"}
                        onValueChange={v => setForm(f => ({ ...f, package_id: v === "none" ? undefined : v }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar paquete..." />
                        </SelectTrigger>
                        <SelectContent>
                          {isLoadingPackages ? (
                            <SelectItem value="loading" disabled>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Cargando...
                            </SelectItem>
                          ) : packages.length === 0 ? (
                            <SelectItem value="empty" disabled>No hay paquetes disponibles</SelectItem>
                          ) : (
                            packages.map(pkg => (
                              <SelectItem key={pkg.id} value={pkg.id}>
                                {pkg.name || pkg.code}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="doctor-id">
                        Médico <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={form.doctor_id ?? "none"}
                        onValueChange={v => setForm(f => ({ ...f, doctor_id: v === "none" ? undefined : v }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar médico..." />
                        </SelectTrigger>
                        <SelectContent>
                          {isLoadingDoctors ? (
                            <SelectItem value="loading" disabled>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Cargando...
                            </SelectItem>
                          ) : doctors.length === 0 ? (
                            <SelectItem value="empty" disabled>No hay médicos disponibles</SelectItem>
                          ) : (
                            doctors.map(doc => (
                              <SelectItem key={doc.id} value={doc.id}>
                                {doc.full_name ?? "Médico"}
                                {doc.specialty_name ? ` - ${doc.specialty_name}` : ""}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="chief-complaint">
                    Motivo de Consulta <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="chief-complaint"
                    placeholder="Describe el motivo de consulta del paciente..."
                    value={form.chief_complaint}
                    onChange={e => setForm(f => ({ ...f, chief_complaint: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="initial-diagnosis">Diagnóstico Inicial</Label>
                  <Input
                    id="initial-diagnosis"
                    placeholder="Diagnóstico presuntivo..."
                    value={form.initial_diagnosis ?? ""}
                    onChange={e => setForm(f => ({ ...f, initial_diagnosis: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Turno</Label>
                  <Select
                    value={form.shift_type ?? ShiftType.DAYTIME}
                    onValueChange={v => setForm(f => ({ ...f, shift_type: v as ShiftType }))}
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

                {selectedAdmissionType?.allows_transfer && (
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <Label className="font-medium">Caso de Transferencia</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        ¿Este caso proviene de otro expediente?
                      </p>
                    </div>
                    <Select
                      value={form.is_transfer ? "yes" : "no"}
                      onValueChange={v => setForm(f => ({ ...f, is_transfer: v === "yes" }))}
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
                )}

                {form.is_transfer && (
                  <div className="space-y-2">
                    <Label htmlFor="transfer-from">Expediente de Origen</Label>
                    <Input
                      id="transfer-from"
                      placeholder="ID del expediente original..."
                      value={form.transfer_from_case_id ?? ""}
                      onChange={e => setForm(f => ({ ...f, transfer_from_case_id: e.target.value }))}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="notes">Notas Adicionales</Label>
                  <Textarea
                    id="notes"
                    placeholder="Observaciones adicionales..."
                    value={form.notes ?? ""}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-base">Resumen del Expediente</CardTitle>
                <CardDescription>Vista previa antes de confirmar</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-muted-foreground shrink-0">Paciente</span>
                    <span className="font-medium text-right">
                      {selectedPatient
                        ? selectedPatient.fullName || `${selectedPatient.firstName} ${selectedPatient.lastName}`
                        : <em className="text-muted-foreground font-normal">Sin seleccionar</em>}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <span className="text-muted-foreground shrink-0">Tipo ingreso</span>
                    <span className="font-medium text-right">
                      {selectedAdmissionType
                        ? selectedAdmissionType.name
                        : <em className="text-muted-foreground font-normal text-sm">No especificado</em>}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <span className="text-muted-foreground shrink-0">Motivo</span>
                    <span className="text-right line-clamp-3">
                      {form.chief_complaint
                        ? form.chief_complaint
                        : <em className="text-muted-foreground font-normal">No especificado</em>}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Diagnóstico</span>
                    <span className="text-right">
                      {form.initial_diagnosis
                        ? form.initial_diagnosis
                        : <span className="text-muted-foreground">—</span>}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Turno</span>
                    <span className="font-medium">
                      {form.shift_type === ShiftType.DAYTIME ? "Diurno" : "Nocturno"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Transferencia</span>
                    <Badge variant={form.is_transfer ? "default" : "outline"} className="text-xs">
                      {form.is_transfer ? "Sí" : "No"}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Campos requeridos
                  </p>
                  {[
                    { label: "Paciente seleccionado", ok: !!form.patient_id },
                    { label: "Tipo de ingreso",        ok: !!form.admission_type_id },
                    { label: "Motivo de consulta",     ok: !!form.chief_complaint },
                    ...(selectedAdmissionType?.requires_hospitalization
                      ? [{ label: "Habitación asignada", ok: !!form.room_id }]
                      : []),
                    ...(selectedAdmissionType?.requires_package
                      ? [{ label: "Paquete + Médico", ok: !!(form.package_id && form.doctor_id) }]
                      : []),
                  ].map(({ label, ok }) => (
                    <div key={label} className="flex items-center gap-2 text-sm">
                      {ok
                        ? <CheckCircle className="h-4 w-4 shrink-0 text-success" />
                        : <XCircle className="h-4 w-4 shrink-0 text-muted-foreground/50" />}
                      <span className={ok ? "text-foreground" : "text-muted-foreground"}>
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>

              <CardFooter className="flex-col gap-2 border-t pt-4">
                <Button
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                >
                  {isSubmitting
                    ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    : <Save className="mr-2 h-4 w-4" />}
                  Crear Expediente
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/medical/case-files")}
                  disabled={isSubmitting}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
