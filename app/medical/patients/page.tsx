"use client";

import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DataTable } from "@/components/ui/data-table";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
} from "lucide-react";
import { PatientForm } from "@/components/medical/patient-form";
import { PatientDetail } from "@/components/medical/patient-detail";
import { usePatients } from "@/hooks/medical-hooks/use-patients";
import { type Patients } from "@/lib/api/types/medical-types/patient.types";
import { formatDate } from "@/lib/utils";

export default function PatientsPage() {
  const [selectedPatient, setSelectedPatient] = useState<Patients | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { patients, isLoading, error, createPatient, updatePatient } =
    usePatients({ limit: 100 });

  // Filtrar pacientes por búsqueda
  const filteredPatients = useMemo(() => {
    if (!search.trim()) return patients;
    const term = search.toLowerCase();
    return patients.filter(
      (p) =>
        p.fileNumber?.toLowerCase().includes(term) ||
        p.firstName?.toLowerCase().includes(term) ||
        p.lastName?.toLowerCase().includes(term) ||
        p.identificationNumber?.toLowerCase().includes(term),
    );
  }, [patients, search]);

  // Estadísticas simples
  const stats = useMemo(() => {
    const total = patients.length;
    const active = patients.filter((p) => p.isActive).length;
    const male = patients.filter(
      (p) => p.gender === "male" || p.gender === "M",
    ).length;
    const female = total - male;
    return {
      total,
      active,
      male,
      female,
      activeRate: total ? ((active / total) * 100).toFixed(1) : 0,
    };
  }, [patients]);

  const handleFormSubmit = async (
    data: Omit<Patients, "id" | "fullName" | "age">,
  ) => {
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

  const columns = [
    {
      key: "fileNumber",
      header: "No. Expediente",
      render: (patient: Patients) => (
        <span className="font-medium text-primary">{patient.fileNumber}</span>
      ),
    },
    {
      key: "fullName",
      header: "Nombre Completo",
      render: (patient: Patients) => (
        <div>
          <p className="font-medium">
            {patient.fullName || `${patient.firstName} ${patient.lastName}`}
          </p>
          <p className="text-sm text-muted-foreground">
            {patient.identificationNumber}
          </p>
        </div>
      ),
    },
    {
      key: "age",
      header: "Edad",
      render: (patient: Patients) => `${patient.age} años`,
    },
    {
      key: "gender",
      header: "Sexo",
      render: (patient: Patients) =>
        patient.gender === "male" || patient.gender === "M"
          ? "Masculino"
          : "Femenino",
    },
    {
      key: "bloodType",
      header: "Tipo Sangre",
      render: (patient: Patients) => (
        <Badge variant="outline" className="font-mono">
          {patient.bloodType}
        </Badge>
      ),
    },
    {
      key: "phone",
      header: "Teléfono",
    },
    {
      key: "dateOfBirth",
      header: "Fecha Nacimiento",
      render: (patient: Patients) => formatDate(patient.dateOfBirth),
    },
    {
      key: "isActive",
      header: "Estado",
      render: (patient: Patients) =>
        patient.isActive ? (
          <Badge className="bg-success text-success-foreground">Activo</Badge>
        ) : (
          <Badge variant="secondary">Inactivo</Badge>
        ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header con icono y diseño consistente */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Pacientes</h1>
              <p className="text-muted-foreground">
                Gestión de pacientes del hospital
              </p>
            </div>
          </div>
          <Button
            onClick={() => {
              setSelectedPatient(null);
              setIsFormOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Paciente
          </Button>
        </div>

        {/* Tarjetas de estadísticas */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-primary flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    Total Pacientes
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Registrados en el sistema
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <UserCheck className="h-8 w-8 text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-500">Activos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.active}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {stats.activeRate}% del total
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <Activity className="h-8 w-8 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-500">Género</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.male} / {stats.female}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Masculino / Femenino
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-purple-600 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    Edad promedio
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {patients.length
                      ? Math.round(
                          patients.reduce((a, b) => a + (b.age || 0), 0) /
                            patients.length,
                        )
                      : 0}
                  </p>
                  <p className="text-[11px] text-gray-500">Años</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Data Table con diseño mejorado */}
        <Card className="border border-gray-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle>Listado de Pacientes</CardTitle>
            <CardDescription>
              {filteredPatients.length}{" "}
              {filteredPatients.length === 1
                ? "paciente encontrado"
                : "pacientes encontrados"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={filteredPatients}
              columns={columns}
              emptyMessage={
                isLoading
                  ? "Cargando pacientes..."
                  : "No hay pacientes registrados"
              }
              actions={(patient) => (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedPatient(patient);
                        setIsDetailOpen(true);
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Detalle
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedPatient(patient);
                        setIsFormOpen(true);
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <FolderOpen className="mr-2 h-4 w-4" />
                      Nuevo Expediente
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            />
          </CardContent>
        </Card>

        {/* Patient Form Dialog */}
        <Dialog
          open={isFormOpen}
          onOpenChange={(open) => {
            if (!open) handleFormClose();
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
            <DialogHeader className="px-6 pt-6">
              <DialogTitle>
                {selectedPatient
                  ? "Editar Paciente"
                  : "Registrar Nuevo Paciente"}
              </DialogTitle>
              <DialogDescription>
                Complete la información del paciente
              </DialogDescription>
            </DialogHeader>
            <div className="px-6 pb-6">
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
            <DialogHeader className="px-6 pt-6">
              <DialogTitle>Detalle del Paciente</DialogTitle>
            </DialogHeader>
            <div className="px-6 pb-6">
              {selectedPatient && <PatientDetail patient={selectedPatient} />}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
