import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { formatDate, type Patient } from "@/lib/mock-data"
import { User, Phone, Mail, MapPin, Heart, AlertTriangle, Pill, Shield } from "lucide-react"

interface PatientDetailProps {
  patient: Patient
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
                {patient.firstName} {patient.lastName}
              </CardTitle>
              <p className="text-muted-foreground">{patient.fileNumber}</p>
            </div>
            <div className="ml-auto">
              {patient.hasActiveCase ? (
                <Badge className="bg-success text-success-foreground">Caso Activo</Badge>
              ) : (
                <Badge variant="secondary">Sin Caso Activo</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">DPI</p>
              <p className="font-medium">{patient.dpi}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Edad</p>
              <p className="font-medium">{patient.age} años</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sexo</p>
              <p className="font-medium">{patient.gender === "M" ? "Masculino" : "Femenino"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tipo de Sangre</p>
              <Badge variant="outline" className="font-mono text-lg">
                {patient.bloodType}
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
              <span>{patient.phone}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{patient.email}</span>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <span>{patient.address}</span>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground mb-1">Contacto de Emergencia</p>
              <p className="font-medium">{patient.emergencyContact}</p>
              <p className="text-sm">{patient.emergencyPhone}</p>
            </div>
          </CardContent>
        </Card>

        {/* Medical Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Información Médica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium">Alergias</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {patient.allergies.length > 0 ? (
                  patient.allergies.map((allergy, index) => (
                    <Badge key={index} variant="destructive">
                      {allergy}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">Sin alergias registradas</span>
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Heart className="h-4 w-4 text-warning" />
                <span className="text-sm font-medium">Condiciones Crónicas</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {patient.chronicConditions.length > 0 ? (
                  patient.chronicConditions.map((condition, index) => (
                    <Badge key={index} variant="secondary">
                      {condition}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">Sin condiciones crónicas</span>
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Pill className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Medicamentos Actuales</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {patient.currentMedications.length > 0 ? (
                  patient.currentMedications.map((med, index) => (
                    <Badge key={index} variant="outline">
                      {med}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">Sin medicamentos</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insurance Info */}
      {patient.insuranceProvider && (
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
                <p className="font-medium">{patient.insuranceProvider}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Número de Póliza</p>
                <p className="font-medium">{patient.insuranceNumber}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Visit History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Historial de Visitas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Última visita: <span className="font-medium text-foreground">{formatDate(patient.lastVisit)}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
