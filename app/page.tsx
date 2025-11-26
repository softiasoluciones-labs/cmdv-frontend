import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StatsCard } from "@/components/dashboard/stats-card"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { RoomOccupancy } from "@/components/dashboard/room-occupancy"
import { LowStockAlert } from "@/components/dashboard/low-stock-alert"
import { AdmissionsChart } from "@/components/dashboard/charts/admissions-chart"
import { RevenuePieChart } from "@/components/dashboard/charts/revenue-pie-chart"
import { MonthlyRevenueChart } from "@/components/dashboard/charts/monthly-revenue-chart"
import { getDashboardStats, formatCurrency } from "@/lib/mock-data"
import { Users, BedDouble, Scissors, DollarSign, CreditCard, AlertTriangle, Activity } from "lucide-react"

export default function DashboardPage() {
  const stats = getDashboardStats()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Bienvenido al sistema de gestión hospitalaria MediCare Pro</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Pacientes Hoy"
            value={stats.todayPatients}
            icon={Users}
            trend={{ value: 12, label: "vs ayer" }}
          />
          <StatsCard
            title="Casos Activos"
            value={stats.activeCases}
            icon={BedDouble}
            trend={{ value: 5, label: "esta semana" }}
          />
          <StatsCard
            title="Cirugías Programadas"
            value={stats.scheduledOperations}
            icon={Scissors}
            trend={{ value: -8, label: "vs ayer" }}
          />
          <StatsCard
            title="Ingresos Hoy"
            value={formatCurrency(stats.todayRevenue)}
            icon={DollarSign}
            trend={{ value: 18, label: "vs ayer" }}
            variant="success"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Ingresos del Mes" value={formatCurrency(stats.monthRevenue)} icon={Activity} />
          <StatsCard
            title="Cobros Pendientes"
            value={formatCurrency(stats.pendingPayments)}
            icon={CreditCard}
            variant="warning"
          />
          <StatsCard
            title="Alertas de Stock"
            value={stats.lowStockAlerts}
            icon={AlertTriangle}
            variant={stats.lowStockAlerts > 3 ? "danger" : "warning"}
          />
          <StatsCard
            title="Ocupación de Camas"
            value={`${stats.occupancyRate}%`}
            icon={BedDouble}
            trend={{ value: 3, label: "esta semana" }}
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid gap-4 lg:grid-cols-3">
          <AdmissionsChart />
          <RevenuePieChart />
        </div>

        {/* Charts Row 2 */}
        <div className="grid gap-4 lg:grid-cols-3">
          <MonthlyRevenueChart />
          <RoomOccupancy />
        </div>

        {/* Bottom Row */}
        <div className="grid gap-4 lg:grid-cols-3">
          <QuickActions />
          <RecentActivity />
          <LowStockAlert />
        </div>
      </div>
    </DashboardLayout>
  )
}
