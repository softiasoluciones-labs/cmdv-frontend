import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserPlus, Calendar, FileText, ShoppingCart } from "lucide-react"
import Link from "next/link"

const actions = [
  {
    title: "Nuevo Paciente",
    description: "Registrar paciente",
    icon: UserPlus,
    href: "/medical/patients/new",
    variant: "default" as const,
  },
  {
    title: "Programar Cirugía",
    description: "Agendar operación",
    icon: Calendar,
    href: "/medical/scheduler/new",
    variant: "outline" as const,
  },
  {
    title: "Nueva Factura",
    description: "Crear factura",
    icon: FileText,
    href: "/billing/invoices/new",
    variant: "outline" as const,
  },
  {
    title: "Orden de Compra",
    description: "Nueva orden",
    icon: ShoppingCart,
    href: "/inventory/purchase-orders/new",
    variant: "outline" as const,
  },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-foreground">Acciones Rápidas</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <Button key={action.title} variant={action.variant} className="h-auto flex-col gap-2 py-4" asChild>
              <Link href={action.href}>
                <Icon className="h-5 w-5" />
                <div className="text-center">
                  <p className="text-sm font-medium">{action.title}</p>
                  <p className="text-xs opacity-70">{action.description}</p>
                </div>
              </Link>
            </Button>
          )
        })}
      </CardContent>
    </Card>
  )
}
