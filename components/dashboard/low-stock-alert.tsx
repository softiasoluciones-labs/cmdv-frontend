"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { products } from "@/lib/mock-data"
import { AlertTriangle } from "lucide-react"

export function LowStockAlert() {
  const lowStockProducts = products
    .filter((p) => p.currentStock <= p.minStock)
    .sort((a, b) => a.currentStock / a.minStock - b.currentStock / b.minStock)
    .slice(0, 5)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <CardTitle className="text-lg font-semibold text-foreground">Alertas de Stock</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {lowStockProducts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay alertas de stock</p>
        ) : (
          lowStockProducts.map((product) => {
            const percentage = Math.round((product.currentStock / product.minStock) * 100)
            const isCritical = percentage < 50

            return (
              <div key={product.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{product.name}</span>
                    {isCritical && (
                      <Badge variant="destructive" className="text-xs">
                        Crítico
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.currentStock} / {product.minStock}
                  </span>
                </div>
                <Progress
                  value={Math.min(percentage, 100)}
                  className={`h-2 ${isCritical ? "[&>div]:bg-destructive" : "[&>div]:bg-warning"}`}
                />
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
