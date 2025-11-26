"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, Bell, Shield, Printer, Database, Save } from "lucide-react"

export default function SettingsPage() {
  const [generalSettings, setGeneralSettings] = useState({
    hospitalName: "Hospital General de Guatemala",
    nit: "12345678-9",
    address: "6a Avenida 3-45, Zona 1, Ciudad de Guatemala",
    phone: "+502 2222-3333",
    email: "info@hospital.gt",
    website: "www.hospital.gt",
  })

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    lowStockAlerts: true,
    paymentReminders: true,
    appointmentReminders: true,
    systemAlerts: true,
  })

  const [billing, setBilling] = useState({
    currency: "GTQ",
    taxRate: 12,
    invoicePrefix: "FACT-",
    receiptPrefix: "REC-",
    autoGenerateInvoice: true,
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Configuración</h1>
          <p className="text-muted-foreground">Configuración general del sistema</p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-none">
            <TabsTrigger value="general" className="gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">General</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notificaciones</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="gap-2">
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Facturación</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Seguridad</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Información del Hospital
                </CardTitle>
                <CardDescription>Datos generales que aparecerán en documentos y reportes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="hospitalName">Nombre del Hospital</Label>
                    <Input
                      id="hospitalName"
                      value={generalSettings.hospitalName}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, hospitalName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nit">NIT</Label>
                    <Input
                      id="nit"
                      value={generalSettings.nit}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, nit: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    value={generalSettings.address}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, address: e.target.value })}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={generalSettings.phone}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={generalSettings.email}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Sitio Web</Label>
                    <Input
                      id="website"
                      value={generalSettings.website}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, website: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <Button className="gap-2">
                    <Save className="h-4 w-4" />
                    Guardar Cambios
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notificaciones
                </CardTitle>
                <CardDescription>Configura las alertas y notificaciones del sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notificaciones por Email</p>
                    <p className="text-sm text-muted-foreground">Recibir alertas importantes por correo electrónico</p>
                  </div>
                  <Switch
                    checked={notifications.emailNotifications}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailNotifications: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Alertas de Stock Bajo</p>
                    <p className="text-sm text-muted-foreground">
                      Notificar cuando el inventario esté por debajo del mínimo
                    </p>
                  </div>
                  <Switch
                    checked={notifications.lowStockAlerts}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, lowStockAlerts: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Recordatorios de Pago</p>
                    <p className="text-sm text-muted-foreground">Alertar sobre facturas pendientes de cobro</p>
                  </div>
                  <Switch
                    checked={notifications.paymentReminders}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, paymentReminders: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Recordatorios de Citas</p>
                    <p className="text-sm text-muted-foreground">Enviar recordatorios de citas a pacientes</p>
                  </div>
                  <Switch
                    checked={notifications.appointmentReminders}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, appointmentReminders: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Alertas del Sistema</p>
                    <p className="text-sm text-muted-foreground">
                      Notificaciones sobre mantenimiento y actualizaciones
                    </p>
                  </div>
                  <Switch
                    checked={notifications.systemAlerts}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, systemAlerts: checked })}
                  />
                </div>
                <div className="flex justify-end pt-4">
                  <Button className="gap-2">
                    <Save className="h-4 w-4" />
                    Guardar Cambios
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Printer className="h-5 w-5" />
                  Configuración de Facturación
                </CardTitle>
                <CardDescription>Parámetros para la generación de facturas y recibos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Moneda</Label>
                    <Select value={billing.currency} onValueChange={(v) => setBilling({ ...billing, currency: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GTQ">Quetzal (Q)</SelectItem>
                        <SelectItem value="USD">Dólar (US$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxRate">Tasa de IVA (%)</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      value={billing.taxRate}
                      onChange={(e) => setBilling({ ...billing, taxRate: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="invoicePrefix">Prefijo de Facturas</Label>
                    <Input
                      id="invoicePrefix"
                      value={billing.invoicePrefix}
                      onChange={(e) => setBilling({ ...billing, invoicePrefix: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="receiptPrefix">Prefijo de Recibos</Label>
                    <Input
                      id="receiptPrefix"
                      value={billing.receiptPrefix}
                      onChange={(e) => setBilling({ ...billing, receiptPrefix: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <p className="font-medium">Generar Facturas Automáticamente</p>
                    <p className="text-sm text-muted-foreground">Crear factura al dar de alta un expediente</p>
                  </div>
                  <Switch
                    checked={billing.autoGenerateInvoice}
                    onCheckedChange={(checked) => setBilling({ ...billing, autoGenerateInvoice: checked })}
                  />
                </div>
                <div className="flex justify-end pt-4">
                  <Button className="gap-2">
                    <Save className="h-4 w-4" />
                    Guardar Cambios
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Seguridad
                </CardTitle>
                <CardDescription>Configuración de seguridad y respaldos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Autenticación de Dos Factores</p>
                    <p className="text-sm text-muted-foreground">Requerir 2FA para todos los usuarios</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Bloqueo por Intentos Fallidos</p>
                    <p className="text-sm text-muted-foreground">Bloquear cuenta después de 5 intentos fallidos</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Registro de Auditoría</p>
                    <p className="text-sm text-muted-foreground">Registrar todas las acciones de usuarios</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Database className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Respaldo de Base de Datos</p>
                      <p className="text-sm text-muted-foreground">Último respaldo: Hoy a las 03:00 AM</p>
                    </div>
                    <Button variant="outline">Respaldar Ahora</Button>
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <Button className="gap-2">
                    <Save className="h-4 w-4" />
                    Guardar Cambios
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
