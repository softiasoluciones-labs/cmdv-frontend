import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { type Patients } from "@/lib/api/types/medical-types/patient.types"
import { formatDate } from "@/lib/utils"
import { User, Phone, MapPin, Heart, Shield, FileText } from "lucide-react"

interface PatientDetailProps {
  patient: Patients
}

export function PatientDetail({ patient }: PatientDetailProps) {
  return (
    <div className="space-y-6">
      {/* Basic Info Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">
                {patient.fullName || `${patient.firstName} ${patient.lastName}`}
              </CardTitle>
              <p className="text-muted-foreground">{patient.fileNumber}</p>
            </div>
            <div className="ml-auto">
              {patient.isActive ? (
                <Badge className="bg-success text-success-foreground">Activo</Badge>
              ) : (
                <Badge variant="secondary">Inactivo</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">DPI</p>
              <p className="font-medium">{patient.identificationNumber || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Edad</p>
              <p className="font-medium">{patient.age} años</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sexo</p>
              <p className="font-medium">
                {(patient.gender === "male" || patient.gender === "M") ? "Masculino" : "Femenino"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tipo de Sangre</p>
              <Badge variant="outline" className="font-mono text-lg">
                {patient.bloodType || "—"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Información de Contacto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{patient.phone || "—"}</span>
            </div>
            {patient.mobile && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{patient.mobile} <span className="text-xs text-muted-foreground">(móvil)</span></span>
              </div>
            )}
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <span>
                {[patient.address, patient.city, patient.state].filter(Boolean).join(", ") || "—"}
              </span>
            </div>
            {patient.emergencyContactName && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Contacto de Emergencia</p>
                  <p className="font-medium">
                    {patient.emergencyContactName}
                    {patient.emergencyContactRelationship && (
                      <span className="text-sm font-normal text-muted-foreground ml-1">
                        ({patient.emergencyContactRelationship})
                      </span>
                    )}
                  </p>
                  <p className="text-sm">{patient.emergencyContactPhone || "—"}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Medical Notes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Información Médica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Fecha de Nacimiento</p>
              <p className="font-medium">{formatDate(patient.dateOfBirth)}</p>
            </div>
            {patient.allergies && (Array.isArray(patient.allergies) ? patient.allergies.length > 0 : true) && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Alergias</p>
                <p className="text-sm">{Array.isArray(patient.allergies) ? patient.allergies.join(", ") : patient.allergies}</p>
              </div>
            )}
            {patient.chronicConditions && (Array.isArray(patient.chronicConditions) ? patient.chronicConditions.length > 0 : true) && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Condiciones Crónicas</p>
                <p className="text-sm">{Array.isArray(patient.chronicConditions) ? patient.chronicConditions.join(", ") : patient.chronicConditions}</p>
              </div>
            )}
            {patient.currentMedications && (Array.isArray(patient.currentMedications) ? patient.currentMedications.length > 0 : true) && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Medicamentos Actuales</p>
                <p className="text-sm">{Array.isArray(patient.currentMedications) ? patient.currentMedications.join(", ") : patient.currentMedications}</p>
              </div>
            )}
            {patient.notes ? (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Notas</span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{patient.notes}</p>
              </div>
            ) : (
              !patient.allergies && !patient.chronicConditions && !patient.currentMedications && (
                <p className="text-sm text-muted-foreground">Sin notas médicas registradas</p>
              )
            )}
          </CardContent>
        </Card>
      </div>

      {/* Insurance Info */}
      {patient.insuranceCompany && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Información de Seguro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Proveedor</p>
                <p className="font-medium">{patient.insuranceCompany}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Número de Póliza</p>
                <p className="font-medium">{patient.insurancePolicyNumber || "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
