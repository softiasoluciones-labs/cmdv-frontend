"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { rooms, getRoomTypeLabel } from "@/lib/mock-data"

export function RoomOccupancy() {
  const roomTypes = ["standard", "semi_private", "private", "icu", "operating", "emergency"] as const

  const occupancyByType = roomTypes.map((type) => {
    const typeRooms = rooms.filter((r) => r.type === type)
    const occupied = typeRooms.filter((r) => r.status === "occupied").length
    const total = typeRooms.length
    const percentage = total > 0 ? Math.round((occupied / total) * 100) : 0

    return {
      type,
      label: getRoomTypeLabel(type),
      occupied,
      total,
      percentage,
    }
  })

  const totalRooms = rooms.length
  const occupiedRooms = rooms.filter((r) => r.status === "occupied").length
  const overallPercentage = Math.round((occupiedRooms / totalRooms) * 100)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">Ocupación de Habitaciones</CardTitle>
          <span className="text-2xl font-bold text-primary">{overallPercentage}%</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {occupancyByType.map((item) => (
          <div key={item.type} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-medium text-foreground">
                {item.occupied}/{item.total}
              </span>
            </div>
            <Progress value={item.percentage} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
