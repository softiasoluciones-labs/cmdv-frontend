import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { type Prescription, patients, doctors } from "@/lib/mock-data"
import { Printer, CheckCircle, User, Stethoscope, Pill } from "lucide-react"

interface PrescriptionDetailProps {
  prescription: Prescription
}

const statusConfig: Record<Prescription["status"], { label: string; className: string }> = {
  pending: { label: "Pendiente", className: "bg-secondary text-secondary-foreground" },
  dispensed: { label: "Despachada", className: "bg-success/10 text-success" },
  partial: { label: "Parcial", className: "bg-warning/10 text-warning" },
  cancelled: { label: "Cancelada", className: "bg-destructive text-destructive-foreground" },
}

export function PrescriptionDetail({ prescription }: PrescriptionDetailProps) {
  const patient = patients.find((p) => p.id === prescription.patientId)
  const doctor = doctors.find((d) => d.id === prescription.doctorId)
  const config = statusConfig[prescription.status]

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">{prescription.prescriptionNumber}</h2>
          <p className="text-muted-foreground">Fecha: {new Date(prescription.date).toLocaleDateString("es-GT")}</p>
        </div>
        <Badge className={config.className}>{config.label}</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <User className="h-4 w-4" />
              Paciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{patient?.name}</p>
            <p className="text-sm text-muted-foreground">DPI: {patient?.dpi}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Stethoscope className="h-4 w-4" />
              Médico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{doctor?.name}</p>
            <p className="text-sm text-muted-foreground">{doctor?.specialty}</p>
            <p className="text-sm text-muted-foreground">Colegiado: {doctor?.license}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Pill className="h-5 w-5" />
            Medicamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {prescription.medications.map((med, index) => (
              <div key={index} className="rounded-lg border p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{med.name}</p>
                    <p className="text-sm text-muted-foreground">{med.dosage}</p>
                  </div>
                  <Badge variant="outline">Cantidad: {med.quantity}</Badge>
                </div>
                <p className="mt-2 text-sm">{med.instructions}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {prescription.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{prescription.notes}</p>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="outline" className="gap-2 bg-transparent">
          <Printer className="h-4 w-4" />
          Imprimir
        </Button>
        {prescription.status === "pending" && (
          <Button className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Despachar
          </Button>
        )}
      </div>
    </div>
  )
}
