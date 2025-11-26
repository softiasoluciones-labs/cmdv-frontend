import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UserPlus, Scissors, FileText, AlertTriangle } from "lucide-react"

const activities = [
  {
    id: 1,
    type: "admission",
    title: "Nueva Admisión",
    description: "Pedro Gómez Sánchez ingresado a UCI-03",
    time: "Hace 30 min",
    icon: UserPlus,
    variant: "default" as const,
  },
  {
    id: 2,
    type: "surgery",
    title: "Cirugía en Progreso",
    description: "Colecistectomía - Ana María López",
    time: "Hace 1 hora",
    icon: Scissors,
    variant: "success" as const,
  },
  {
    id: 3,
    type: "invoice",
    title: "Nueva Factura",
    description: "FAC-2024-0005 - Q15,680.00",
    time: "Hace 2 horas",
    icon: FileText,
    variant: "default" as const,
  },
  {
    id: 4,
    type: "alert",
    title: "Alerta de Stock",
    description: "Metformina 850mg bajo nivel mínimo",
    time: "Hace 3 horas",
    icon: AlertTriangle,
    variant: "destructive" as const,
  },
  {
    id: 5,
    type: "admission",
    title: "Alta Médica",
    description: "Carlos Martínez dado de alta",
    time: "Hace 4 horas",
    icon: UserPlus,
    variant: "success" as const,
  },
]

export function RecentActivity() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-foreground">Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[320px] px-6">
          <div className="space-y-4 pb-4">
            {activities.map((activity) => {
              const Icon = activity.icon
              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50"
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      activity.variant === "destructive"
                        ? "bg-destructive/10 text-destructive"
                        : activity.variant === "success"
                          ? "bg-success/10 text-success"
                          : "bg-primary/10 text-primary"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">{activity.title}</p>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
