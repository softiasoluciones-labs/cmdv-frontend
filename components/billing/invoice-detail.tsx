import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { type Invoice, patients, caseFiles } from "@/lib/mock-data"
import { Printer, Download, DollarSign } from "lucide-react"

interface InvoiceDetailProps {
  invoice: Invoice
}

const statusConfig: Record<Invoice["status"], { label: string; className: string }> = {
  pending: { label: "Pendiente", className: "bg-secondary text-secondary-foreground" },
  partial: { label: "Pago Parcial", className: "bg-warning/10 text-warning" },
  paid: { label: "Pagada", className: "bg-success/10 text-success" },
  cancelled: { label: "Cancelada", className: "bg-destructive text-destructive-foreground" },
}

export function InvoiceDetail({ invoice }: InvoiceDetailProps) {
  const patient = patients.find((p) => p.id === invoice.patientId)
  const caseFile = caseFiles.find((c) => c.id === invoice.caseFileId)
  const balance = invoice.total - invoice.paidAmount
  const config = statusConfig[invoice.status]

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">{invoice.invoiceNumber}</h2>
          <p className="text-muted-foreground">Fecha: {new Date(invoice.date).toLocaleDateString("es-GT")}</p>
        </div>
        <Badge className={config.className}>{config.label}</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Paciente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{patient?.name}</p>
            <p className="text-sm text-muted-foreground">DPI: {patient?.dpi}</p>
            <p className="text-sm text-muted-foreground">{patient?.phone}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Expediente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{caseFile?.caseNumber}</p>
            <p className="text-sm text-muted-foreground">{caseFile?.diagnosis}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Detalle de Cargos</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="pb-2 font-medium">Descripción</th>
                <th className="pb-2 font-medium text-right">Cantidad</th>
                <th className="pb-2 font-medium text-right">Precio Unit.</th>
                <th className="pb-2 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {invoice.items.map((item, index) => (
                <tr key={index}>
                  <td className="py-2">{item.description}</td>
                  <td className="py-2 text-right">{item.quantity}</td>
                  <td className="py-2 text-right">Q{item.unitPrice.toLocaleString()}</td>
                  <td className="py-2 text-right font-medium">Q{item.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <Separator className="my-4" />

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>Q{invoice.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>IVA (12%):</span>
              <span>Q{invoice.tax.toLocaleString()}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>Q{invoice.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-success">
              <span>Pagado:</span>
              <span>Q{invoice.paidAmount.toLocaleString()}</span>
            </div>
            <div
              className={`flex justify-between font-medium ${balance > 0 ? "text-destructive" : "text-muted-foreground"}`}
            >
              <span>Saldo:</span>
              <span>Q{balance.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" className="gap-2 bg-transparent">
          <Printer className="h-4 w-4" />
          Imprimir
        </Button>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Download className="h-4 w-4" />
          Descargar PDF
        </Button>
        {balance > 0 && (
          <Button className="gap-2">
            <DollarSign className="h-4 w-4" />
            Registrar Pago
          </Button>
        )}
      </div>
    </div>
  )
}
