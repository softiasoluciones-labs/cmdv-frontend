import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { type CaseFile, patients } from "@/lib/mock-data"
import { FileText, User, Calendar, DollarSign, CheckCircle2, Circle } from "lucide-react"

interface CaseFileDetailProps {
  caseFile: CaseFile
}

const stageColors: Record<CaseFile["stage"], string> = {
  emergency: "bg-destructive text-destructive-foreground",
  consultation: "bg-primary text-primary-foreground",
  hospitalized: "bg-chart-1 text-primary-foreground",
  surgery: "bg-warning text-warning-foreground",
  recovery: "bg-success text-success-foreground",
  discharged: "bg-muted text-muted-foreground",
}

const stageLabels: Record<CaseFile["stage"], string> = {
  emergency: "Emergencia",
  consultation: "Consulta",
  hospitalized: "Hospitalizado",
  surgery: "Cirugía",
  recovery: "Recuperación",
  discharged: "Alta",
}

const stages: CaseFile["stage"][] = ["emergency", "consultation", "hospitalized", "surgery", "recovery", "discharged"]

export function CaseFileDetail({ caseFile }: CaseFileDetailProps) {
  const patient = patients.find((p) => p.id === caseFile.patientId)
  const balance = caseFile.totalCost - caseFile.paidAmount
  const paidPercentage = (caseFile.paidAmount / caseFile.totalCost) * 100
  const currentStageIndex = stages.indexOf(caseFile.stage)

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <FileText className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{caseFile.caseNumber}</h2>
                <p className="text-muted-foreground">{patient?.name || "Paciente no encontrado"}</p>
              </div>
            </div>
            <Badge className={stageColors[caseFile.stage]}>{stageLabels[caseFile.stage]}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Progreso del Caso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {stages.map((stage, index) => (
              <div key={stage} className="flex flex-col items-center gap-2">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    index <= currentStageIndex ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index < currentStageIndex ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                </div>
                <span className="text-xs text-center">{stageLabels[stage]}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5" />
              Información del Paciente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nombre:</span>
              <span className="font-medium">{patient?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">DPI:</span>
              <span className="font-medium">{patient?.dpi}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Teléfono:</span>
              <span className="font-medium">{patient?.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Habitación:</span>
              <span className="font-medium">{caseFile.room || "N/A"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5" />
              Estado Financiero
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Costo Total:</span>
              <span className="font-medium">Q{caseFile.totalCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pagado:</span>
              <span className="font-medium text-success">Q{caseFile.paidAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Saldo:</span>
              <span className={`font-bold ${balance > 0 ? "text-destructive" : "text-success"}`}>
                Q{balance.toLocaleString()}
              </span>
            </div>
            <Progress value={paidPercentage} className="h-2" />
            <p className="text-center text-sm text-muted-foreground">{paidPercentage.toFixed(1)}% pagado</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5" />
            Fechas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fecha de Ingreso:</span>
              <span className="font-medium">{new Date(caseFile.admissionDate).toLocaleDateString("es-GT")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fecha de Alta:</span>
              <span className="font-medium">
                {caseFile.dischargeDate ? new Date(caseFile.dischargeDate).toLocaleDateString("es-GT") : "Pendiente"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Diagnóstico</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{caseFile.diagnosis}</p>
        </CardContent>
      </Card>
    </div>
  )
}
