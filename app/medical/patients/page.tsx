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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  FolderOpen,
  Users,
  UserCheck,
  Calendar,
  Activity,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Filter,
  Save,
  X,
  Loader2,
  User,
  Heart,
  Droplet,
  Phone,
  Mail,
  MapPin,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { PatientForm } from "@/components/medical/patient-form";
import { PatientDetail } from "@/components/medical/patient-detail";
import { usePatients } from "@/hooks/medical-hooks/use-patients";
import { type Patients } from "@/lib/api/types/medical-types/patient.types";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "recharts";

type SortField = 'fileNumber' | 'fullName' | 'age' | 'dateOfBirth' | 'isActive';
type SortOrder = 'asc' | 'desc';

export default function PatientsPage() {
  const [selectedPatient, setSelectedPatient] = useState<Patients | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [bloodTypeFilter, setBloodTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>('fileNumber');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [savedFilters, setSavedFilters] = useState<any[]>([]);
  const [filterName, setFilterName] = useState("");
  const [showSaveFilterDialog, setShowSaveFilterDialog] = useState(false);

  const { patients, isLoading, error, createPatient, updatePatient } =
    usePatients({ limit: 1000 });

  // Cargar filtros guardados
  useEffect(() => {
    const saved = localStorage.getItem("savedPatientFilters");
    if (saved) {
      try {
        setSavedFilters(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading saved filters:", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("savedPatientFilters", JSON.stringify(savedFilters));
  }, [savedFilters]);

  // Filtrar y ordenar pacientes
  const filteredPatients = useMemo(() => {
    let filtered = patients.filter((p) => {
      const matchesSearch =
        !search.trim() ||
        p.fileNumber?.toLowerCase().includes(search.toLowerCase()) ||
        p.firstName?.toLowerCase().includes(search.toLowerCase()) ||
        p.lastName?.toLowerCase().includes(search.toLowerCase()) ||
        p.identificationNumber?.toLowerCase().includes(search.toLowerCase());

      const matchesGender =
        genderFilter === "all" ||
        (genderFilter === "male" && (p.gender === "male" || p.gender === "M")) ||
        (genderFilter === "female" && (p.gender === "female" || p.gender === "F"));

      const matchesBloodType =
        bloodTypeFilter === "all" || p.bloodType === bloodTypeFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && p.isActive) ||
        (statusFilter === "inactive" && !p.isActive);

      return matchesSearch && matchesGender && matchesBloodType && matchesStatus;
    });

    // Ordenar
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'fullName') {
        aValue = `${a.firstName} ${a.lastName}`;
        bValue = `${b.firstName} ${b.lastName}`;
      }
      if (sortField === 'dateOfBirth') {
        aValue = new Date(a.dateOfBirth).getTime();
        bValue = new Date(b.dateOfBirth).getTime();
      }

      if (typeof aValue === 'string') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }, [patients, search, genderFilter, bloodTypeFilter, statusFilter, sortField, sortOrder]);

  // Paginación
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Estadísticas
  const stats = useMemo(() => {
    const total = patients.length;
    const active = patients.filter((p) => p.isActive).length;
    const male = patients.filter((p) => p.gender === "male" || p.gender === "M").length;
    const female = total - male;
    const avgAge = total
      ? Math.round(patients.reduce((a, b) => a + (b.age || 0), 0) / total)
      : 0;
    const activeRate = total ? (active / total) * 100 : 0;

    // Tipos de sangre
    const bloodTypes: Record<string, number> = {};
    patients.forEach(p => {
      if (p.bloodType) {
        bloodTypes[p.bloodType] = (bloodTypes[p.bloodType] || 0) + 1;
      }
    });

    return {
      total,
      active,
      male,
      female,
      avgAge,
      activeRate,
      bloodTypes,
    };
  }, [patients]);

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
    setGenderFilter("all");
    setBloodTypeFilter("all");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  const handleSaveFilter = () => {
    if (filterName.trim()) {
      const newFilter = {
        id: Date.now(),
        name: filterName,
        search,
        genderFilter,
        bloodTypeFilter,
        statusFilter,
        createdAt: new Date().toISOString(),
      };
      setSavedFilters([...savedFilters, newFilter]);
      setFilterName("");
      setShowSaveFilterDialog(false);
    }
  };

  const handleLoadFilter = (filter: any) => {
    setSearch(filter.search);
    setGenderFilter(filter.genderFilter);
    setBloodTypeFilter(filter.bloodTypeFilter);
    setStatusFilter(filter.statusFilter);
    setCurrentPage(1);
  };

  const handleDeleteFilter = (filterId: number) => {
    setSavedFilters(savedFilters.filter(f => f.id !== filterId));
  };

  const handleFormSubmit = async (data: Omit<Patients, "id" | "fullName" | "age">) => {
    if (selectedPatient?.id) {
      await updatePatient(selectedPatient.id, {
        ...data,
        id: selectedPatient.id,
        fullName: selectedPatient.fullName,
        age: selectedPatient.age,
      });
    } else {
      await createPatient(data as Patients);
    }
    setIsFormOpen(false);
    setSelectedPatient(null);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedPatient(null);
  };

  const getGenderIcon = (gender: string) => {
    if (gender === "male" || gender === "M") {
      return <User className="h-3 w-3 text-blue-600" />;
    }
    return <User className="h-3 w-3 text-pink-600" />;
  };

  const getBloodTypeBadge = (bloodType: string) => {
    const colors: Record<string, string> = {
      "A+": "bg-red-100 text-red-700",
      "A-": "bg-red-50 text-red-600",
      "B+": "bg-blue-100 text-blue-700",
      "B-": "bg-blue-50 text-blue-600",
      "O+": "bg-green-100 text-green-700",
      "O-": "bg-green-50 text-green-600",
      "AB+": "bg-purple-100 text-purple-700",
      "AB-": "bg-purple-50 text-purple-600",
    };
    return (
      <Badge className={`${colors[bloodType] || "bg-gray-100"} font-mono text-xs`}>
        <Droplet className="h-3 w-3 mr-1" />
        {bloodType}
      </Badge>
    );
  };

  if (isLoading && !patients.length) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="h-32 w-full bg-muted animate-pulse rounded-lg" />
          <div className="h-64 w-full bg-muted animate-pulse rounded-lg" />
        </div>
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
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Pacientes
                </h1>
                <p className="text-muted-foreground">
                  Gestión integral de pacientes del hospital
                </p>
              </div>
            </div>
          </div>
          <Button
            onClick={() => {
              setSelectedPatient(null);
              setIsFormOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Nuevo Paciente
          </Button>
        </div>

        {/* Stats Cards con gradientes */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-none shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Pacientes</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground mt-1">Registrados en el sistema</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-none shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Activos</p>
                  <p className="text-3xl font-bold text-emerald-600">{stats.active}</p>
                  <div className="mt-1 w-24">
                    <Progress value={stats.activeRate} className="h-1.5" />
                  </div>
                </div>
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-none shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Género</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.male} / {stats.female}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Masculino / Femenino</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-none shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Edad Promedio</p>
                  <p className="text-3xl font-bold text-amber-600">{stats.avgAge}</p>
                  <p className="text-xs text-muted-foreground mt-1">Años</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros Avanzados */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por expediente, nombre o DPI..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-9"
                  />
                </div>

                <Select value={genderFilter} onValueChange={(v) => { setGenderFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[130px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Género" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="male">Masculino</SelectItem>
                    <SelectItem value="female">Femenino</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={bloodTypeFilter} onValueChange={(v) => { setBloodTypeFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[140px]">
                    <Droplet className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Tipo Sangre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[130px]">
                    <UserCheck className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Activos</SelectItem>
                    <SelectItem value="inactive">Inactivos</SelectItem>
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
                            {genderFilter !== "all" && <div>⚥ Género: {genderFilter === "male" ? "Masculino" : "Femenino"}</div>}
                            {bloodTypeFilter !== "all" && <div>🩸 Tipo sangre: {bloodTypeFilter}</div>}
                            {statusFilter !== "all" && <div>📊 Estado: {statusFilter === "active" ? "Activos" : "Inactivos"}</div>}
                          </div>
                        </div>
                        <div>
                          <Label>Nombre del filtro</Label>
                          <Input
                            value={filterName}
                            onChange={(e) => setFilterName(e.target.value)}
                            placeholder="Ej: Pacientes activos tipo O+"
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

        {/* Tabla de Pacientes */}
        <Card>
          <CardHeader>
            <CardTitle>Listado de Pacientes</CardTitle>
            <CardDescription>
              {filteredPatients.length} {filteredPatients.length === 1 ? "paciente encontrado" : "pacientes encontrados"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="cursor-pointer hover:bg-muted w-[120px]" onClick={() => handleSort('fileNumber')}>
                      <div className="flex items-center gap-1">
                        No. Expediente
                        {sortField === 'fileNumber' && (sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                        {sortField !== 'fileNumber' && <ArrowUpDown className="h-3 w-3 opacity-50" />}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted" onClick={() => handleSort('fullName')}>
                      <div className="flex items-center gap-1">
                        Nombre Completo
                        {sortField === 'fullName' && (sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                        {sortField !== 'fullName' && <ArrowUpDown className="h-3 w-3 opacity-50" />}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted w-[80px]" onClick={() => handleSort('age')}>
                      <div className="flex items-center gap-1">
                        Edad
                        {sortField === 'age' && (sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                        {sortField !== 'age' && <ArrowUpDown className="h-3 w-3 opacity-50" />}
                      </div>
                    </TableHead>
                    <TableHead className="w-[100px]">Sexo</TableHead>
                    <TableHead className="w-[100px]">Tipo Sangre</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted w-[120px]" onClick={() => handleSort('dateOfBirth')}>
                      <div className="flex items-center gap-1">
                        Fecha Nac.
                        {sortField === 'dateOfBirth' && (sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                        {sortField !== 'dateOfBirth' && <ArrowUpDown className="h-3 w-3 opacity-50" />}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted w-[100px]" onClick={() => handleSort('isActive')}>
                      <div className="flex items-center gap-1">
                        Estado
                        {sortField === 'isActive' && (sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                        {sortField !== 'isActive' && <ArrowUpDown className="h-3 w-3 opacity-50" />}
                      </div>
                    </TableHead>
                    <TableHead className="text-right w-[100px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPatients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                        {isLoading ? "Cargando pacientes..." : "No se encontraron pacientes"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedPatients.map((patient) => (
                      <TableRow key={patient.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-mono text-sm font-medium text-primary">
                          {patient.fileNumber}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {patient.fullName || `${patient.firstName} ${patient.lastName}`}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              DPI: {patient.identificationNumber}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-medium">{patient.age} años</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getGenderIcon(patient.gender)}
                            <span>
                              {patient.gender === "male" || patient.gender === "M" ? "Masculino" : "Femenino"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{getBloodTypeBadge(patient.bloodType || "N/A")}</TableCell>
                        <TableCell>
                          {patient.phone ? (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">{patient.phone}</span>
                            </div>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(patient.dateOfBirth)}
                        </TableCell>
                        <TableCell>
                          {patient.isActive ? (
                            <Badge className="bg-green-100 text-green-800 gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Activo
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground gap-1">
                              <XCircle className="h-3 w-3" />
                              Inactivo
                            </Badge>
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
                                    className="h-8 w-8"
                                    onClick={() => {
                                      setSelectedPatient(patient);
                                      setIsDetailOpen(true);
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Ver detalles</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => {
                                      setSelectedPatient(patient);
                                      setIsFormOpen(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Editar paciente</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                  setSelectedPatient(patient);
                                  setIsDetailOpen(true);
                                }}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Ver Detalle
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedPatient(patient);
                                  setIsFormOpen(true);
                                }}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <FolderOpen className="mr-2 h-4 w-4" />
                                  Historial Clínico
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Paginación */}
            {filteredPatients.length > 0 && (
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredPatients.length)} de {filteredPatients.length}
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
          </CardContent>
        </Card>
      </div>

      {/* Patient Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={(open) => { if (!open) handleFormClose(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="sticky top-0 z-10 bg-background border-b px-6 py-4">
            <DialogTitle>
              {selectedPatient ? "Editar Paciente" : "Registrar Nuevo Paciente"}
            </DialogTitle>
            <DialogDescription>
              Complete la información del paciente
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-6 pt-4">
            <PatientForm
              initialData={selectedPatient ?? undefined}
              onClose={handleFormClose}
              onSubmit={handleFormSubmit}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Patient Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="sticky top-0 z-10 bg-background border-b px-6 py-4">
            <DialogTitle>Detalle del Paciente</DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6 pt-4">
            {selectedPatient && <PatientDetail patient={selectedPatient} />}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}