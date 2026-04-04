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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Textarea } from "@/components/ui/textarea"
import {
  Building2,
  Bell,
  Shield,
  Printer,
  Database,
  Save,
  FileText,
  Stethoscope,
  Package,
  Settings,
  Lock,
  Eye,
  EyeOff,
  Info,
  AlertTriangle,
  CheckSquare,
  Square,
  Calendar,
  Clock,
  Globe,
  DollarSign,
  MessageSquare,
  Zap,
  Plus,
  Edit,
  Trash2
} from "lucide-react"

export default function SystemParametersPage() {
  const [hospitalInfo, setHospitalInfo] = useState({
    name: "Hospital General de Guatemala",
    nit: "12345678-9",
    address: "6a Avenida 3-45, Zona 1, Ciudad de Guatemala",
    phone: "+502 2222-3333",
    email: "info@hospital.gt",
    website: "www.hospital.gt",
    timezone: "America/Guatemala",
    currency: "GTQ",
    language: "es",
    logo: ""
  })

  // Estado para parámetros globales organizados por categoría
  const [globalParameters, setGlobalParameters] = useState({
    billing: [
      { id: 1, name: "IVA Predeterminado", value: "12", type: "number", unit: "%", description: "Tasa de IVA aplicable por defecto", editable: true },
      { id: 2, name: "Serie de Factura", value: "A", type: "text", description: "Serie asignada para facturación", editable: true },
      { id: 3, name: "Número de Factura Inicial", value: "1", type: "number", description: "Número inicial para nuevas facturas", editable: true },
      { id: 4, name: "Días de Crédito", value: "30", type: "number", unit: "días", description: "Plazo de crédito predeterminado", editable: true },
      { id: 5, name: "Retención de IVA", value: false, type: "checkbox", description: "Aplicar retención de IVA automáticamente", editable: true }
    ],
    medical: [
      { id: 6, name: "Tiempo de Consulta", value: "30", type: "number", unit: "min", description: "Duración predeterminada de consultas", editable: true },
      { id: 7, name: "Historial Médico", value: true, type: "checkbox", description: "Mantener historial médico completo", editable: true },
      { id: 8, name: "Consentimiento Digital", value: false, type: "checkbox", description: "Requiere consentimiento digital de pacientes", editable: true },
      { id: 9, name: "Alertas de Medicación", value: true, type: "checkbox", description: "Alertas por interacciones medicamentosas", editable: true },
      { id: 10, name: "Citas Múltiples", value: false, type: "checkbox", description: "Permitir múltiples citas simultáneas", editable: false }
    ],
    inventory: [
      { id: 11, name: "Stock Mínimo Alerta", value: "10", type: "number", description: "Cantidad mínima para alertas de inventario", editable: true, unit: "unidades" },
      { id: 12, name: "Stock Máximo", value: "1000", type: "number", description: "Capacidad máxima de almacenamiento", editable: true, unit: "unidades" },
      { id: 13, name: "Unidad de Medida", value: "unidades", type: "text", description: "Unidad predeterminada para inventario", editable: true, unit: "unidades" },
      { id: 14, name: "Control de Lotes", value: true, type: "checkbox", description: "Habilitar control por lotes y fechas de vencimiento", editable: true, unit: "unidades" }
    ],
    notifications: [
      { id: 15, name: "Email de Sistema", value: "sistema@hospital.gt", type: "email", description: "Email para notificaciones automáticas", editable: true },
      { id: 16, name: "Notificar Stock Bajo", value: true, type: "checkbox", description: "Enviar alertas cuando el stock sea bajo", editable: true },
      { id: 17, name: "Recordatorio Citas", value: "24", type: "number", unit: "horas", description: "Tiempo anticipado para recordatorios", editable: true },
      { id: 18, name: "Notificar Compras", value: true, type: "checkbox", description: "Notificar al departamento de compras", editable: true },
      { id: 19, name: "Alertas Críticas", value: true, type: "checkbox", description: "Notificaciones push para alertas críticas", editable: false }
    ],
    system: [
      { id: 20, name: "Tiempo de Sesión", value: "30", type: "number", unit: "min", description: "Tiempo de inactividad antes de cerrar sesión", editable: true },
      { id: 21, name: "Backup Automático", value: true, type: "checkbox", description: "Realizar backup automático diario", editable: true },
      { id: 22, name: "Mantenimiento Programado", value: "02:00", type: "time", description: "Hora para tareas de mantenimiento", editable: true },
      { id: 23, name: "Límite de Usuarios", value: "50", type: "number", description: "Número máximo de usuarios concurrentes", editable: false },
      { id: 24, name: "Registro de Auditoría", value: true, type: "checkbox", description: "Guardar logs de todas las acciones", editable: true },
      { id: 25, name: "Modo Demo", value: false, type: "checkbox", description: "Habilitar modo demostración", editable: true }
    ]
  })

  // Estado para seguridad
  const [securitySettings, setSecuritySettings] = useState({
    passwordPolicy: {
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      minLength: 8,
      expireDays: 90,
      historySize: 5
    },
    session: {
      timeout: 30,
      maxLoginAttempts: 5,
      lockoutTime: 15
    },
    authentication: {
      twoFactorEnabled: false,
      tokenExpiration: 24,
      ipWhitelist: []
    }
  })

  // Estado para plantillas de notificaciones
  const [notificationTemplates, setNotificationTemplates] = useState([
    { id: 1, name: "Recordatorio de Cita", type: "Email", status: "active", content: "Estimado {paciente}, le recordamos su cita para el {fecha} a las {hora}." },
    { id: 2, name: "Factura Pendiente", type: "SMS", status: "active", content: "Tiene una factura pendiente de {monto}. Vence el {fecha_vencimiento}." },
    { id: 3, name: "Alerta de Stock", type: "Email", status: "inactive", content: "El producto {producto} está por debajo del nivel mínimo ({stock_actual})." }
  ])

  // Estado para funcionalidades del sistema
  const [systemFeatures, setSystemFeatures] = useState({
    medical: [
      { id: 1, name: "Historial Clínico Electrónico", description: "Gestión completa de expedientes médicos", enabled: true, requiresLicense: false },
      { id: 2, name: "Agenda Médica", description: "Programación y gestión de citas", enabled: true, requiresLicense: false },
      { id: 3, name: "Receta Electrónica", description: "Prescripción digital de medicamentos", enabled: false, requiresLicense: true }
    ],
    billing: [
      { id: 4, name: "Facturación Electrónica", description: "Emisión de facturas digitales", enabled: true, requiresLicense: false },
      { id: 5, name: "Reportes Financieros", description: "Análisis y reportes de ingresos", enabled: true, requiresLicense: false },
      { id: 6, name: "Cobros en Línea", description: "Integración con pasarelas de pago", enabled: false, requiresLicense: true }
    ],
    inventory: [
      { id: 7, name: "Control de Inventario", description: "Gestión de existencias y almacén", enabled: true, requiresLicense: false },
      { id: 8, name: "Pedidos Automáticos", description: "Reabastecimiento automático", enabled: false, requiresLicense: false },
      { id: 9, name: "Caducidad de Productos", description: "Control de fechas de vencimiento", enabled: true, requiresLicense: false }
    ],
    notifications: [
      { id: 10, name: "Notificaciones Push", description: "Alertas en tiempo real", enabled: true, requiresLicense: false },
      { id: 11, name: "Recordatorios SMS", description: "Mensajes de texto automáticos", enabled: false, requiresLicense: true },
      { id: 12, name: "Correos Masivos", description: "Envío de campañas por email", enabled: false, requiresLicense: true }
    ]
  })

  const [showSensitiveValues, setShowSensitiveValues] = useState(false)

  const handleParameterChange = (category: keyof typeof globalParameters, id: number, value: any) => {
    setGlobalParameters(prev => ({
      ...prev,
      [category]: prev[category].map(param =>
        param.id === id ? { ...param, value } : param
      )
    }))
  }

  const saveCategory = (category: keyof typeof globalParameters) => {
    console.log(`Guardando cambios de ${category}:`, globalParameters[category])
    // Aquí iría la lógica para guardar en el backend
  }

  const toggleFeature = (module: keyof typeof systemFeatures, id: number) => {
    setSystemFeatures(prev => ({
      ...prev,
      [module]: prev[module].map(feature =>
        feature.id === id ? { ...feature, enabled: !feature.enabled } : feature
      )
    }))
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Parámetros del Sistema</h1>
          <p className="text-muted-foreground">Configuración global y parámetros configurables del sistema</p>
        </div>

        <Tabs defaultValue="global" className="space-y-6">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="hospital" className="gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Hospital</span>
            </TabsTrigger>
            <TabsTrigger value="global" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Globales</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Seguridad</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Plantillas</span>
            </TabsTrigger>
            <TabsTrigger value="features" className="gap-2">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Funcionalidades</span>
            </TabsTrigger>
          </TabsList>

          {/* Pestaña: Información del Hospital */}
          <TabsContent value="hospital">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Información del Hospital
                </CardTitle>
                <CardDescription>Datos generales que aparecerán en documentos y reportes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="hospitalName">Nombre del Hospital *</Label>
                      <Input
                        id="hospitalName"
                        value={hospitalInfo.name}
                        onChange={(e) => setHospitalInfo({ ...hospitalInfo, name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nit">NIT *</Label>
                      <Input
                        id="nit"
                        value={hospitalInfo.nit}
                        onChange={(e) => setHospitalInfo({ ...hospitalInfo, nit: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Dirección *</Label>
                      <Input
                        id="address"
                        value={hospitalInfo.address}
                        onChange={(e) => setHospitalInfo({ ...hospitalInfo, address: e.target.value })}
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono *</Label>
                        <Input
                          id="phone"
                          value={hospitalInfo.phone}
                          onChange={(e) => setHospitalInfo({ ...hospitalInfo, phone: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={hospitalInfo.email}
                          onChange={(e) => setHospitalInfo({ ...hospitalInfo, email: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label>Logo del Hospital</Label>
                      <div className="flex items-center gap-4">
                        <div className="flex h-32 w-32 items-center justify-center rounded-lg border border-dashed bg-muted/50">
                          {hospitalInfo.logo ? (
                            <img src={hospitalInfo.logo} alt="Logo" className="h-full w-full object-contain p-2" />
                          ) : (
                            <Building2 className="h-12 w-12 text-muted-foreground" />
                          )}
                        </div>
                        <div className="space-y-2">
                          <Button variant="outline" size="sm">
                            Subir Logo
                          </Button>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG o SVG. Máx. 2MB
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timezone">Zona Horaria</Label>
                      <Select value={hospitalInfo.timezone} onValueChange={(v) => setHospitalInfo({ ...hospitalInfo, timezone: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/Guatemala">Guatemala (GMT-6)</SelectItem>
                          <SelectItem value="America/Mexico_City">México Central (GMT-6)</SelectItem>
                          <SelectItem value="America/New_York">Este de EE.UU. (GMT-5)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="currency">Moneda</Label>
                        <Select value={hospitalInfo.currency} onValueChange={(v) => setHospitalInfo({ ...hospitalInfo, currency: v })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="GTQ">Quetzal (GTQ)</SelectItem>
                            <SelectItem value="USD">Dólar (USD)</SelectItem>
                            <SelectItem value="MXN">Peso Mexicano (MXN)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="language">Idioma</Label>
                        <Select value={hospitalInfo.language} onValueChange={(v) => setHospitalInfo({ ...hospitalInfo, language: v })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="es">Español</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="pt">Português</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
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

          {/* Pestaña: Parámetros Globales */}
          <TabsContent value="global">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Parámetros Globales
                </CardTitle>
                <CardDescription>Configuración general organizada por categorías</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="space-y-4">
                  {/* Facturación */}
                  <AccordionItem value="billing" className="border rounded-lg">
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <div className="text-left">
                          <span className="font-semibold">Facturación</span>
                          <p className="text-sm text-muted-foreground">5 parámetros configurados</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pt-4 space-y-4">
                      {globalParameters.billing.map((param) => (
                        <div key={param.id} className="grid gap-4 md:grid-cols-3 items-start">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Label className="font-medium">{param.name}</Label>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Info className="h-4 w-4 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs">{param.description}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <p className="text-sm text-muted-foreground">{param.description}</p>
                          </div>
                          <div className="md:col-span-2">
                            {param.type === 'checkbox' ? (
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={param.value as boolean}
                                  onCheckedChange={(v) => handleParameterChange('billing', param.id, v)}
                                  disabled={!param.editable}
                                />
                                <span className="text-sm">{param.value ? 'Habilitado' : 'Deshabilitado'}</span>
                              </div>
                            ) : param.type === 'number' ? (
                              <div className="flex gap-2">
                                <Input
                                  type="number"
                                  value={param.value as string}
                                  onChange={(e) => handleParameterChange('billing', param.id, e.target.value)}
                                  disabled={!param.editable}
                                  className={!param.editable ? "bg-muted" : ""}
                                />
                                {param.unit && <span className="flex items-center text-sm text-muted-foreground">{param.unit}</span>}
                              </div>
                            ) : (
                              <Input
                                type={param.type}
                                value={param.value as string}
                                onChange={(e) => handleParameterChange('billing', param.id, e.target.value)}
                                disabled={!param.editable}
                                className={!param.editable ? "bg-muted" : ""}
                              />
                            )}
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-end pt-4">
                        <Button onClick={() => saveCategory('billing')} className="gap-2">
                          <Save className="h-4 w-4" />
                          Guardar Cambios en Facturación
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Médico */}
                  <AccordionItem value="medical" className="border rounded-lg">
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <div className="flex items-center gap-3">
                        <Stethoscope className="h-5 w-5 text-green-500" />
                        <div className="text-left">
                          <span className="font-semibold">Médico</span>
                          <p className="text-sm text-muted-foreground">5 parámetros configurados</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pt-4 space-y-4">
                      {globalParameters.medical.map((param) => (
                        <div key={param.id} className="grid gap-4 md:grid-cols-3 items-start">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Label className="font-medium">{param.name}</Label>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Info className="h-4 w-4 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs">{param.description}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <p className="text-sm text-muted-foreground">{param.description}</p>
                          </div>
                          <div className="md:col-span-2">
                            {/* Renderizar input según tipo */}
                            {param.type === 'checkbox' ? (
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={param.value as boolean}
                                  onCheckedChange={(v) => handleParameterChange('medical', param.id, v)}
                                  disabled={!param.editable}
                                />
                                <span className="text-sm">{param.value ? 'Habilitado' : 'Deshabilitado'}</span>
                              </div>
                            ) : param.type === 'number' ? (
                              <div className="flex gap-2">
                                <Input
                                  type="number"
                                  value={param.value as string}
                                  onChange={(e) => handleParameterChange('medical', param.id, e.target.value)}
                                  disabled={!param.editable}
                                  className={!param.editable ? "bg-muted" : ""}
                                />
                                {param.unit && <span className="flex items-center text-sm text-muted-foreground">{param.unit}</span>}
                              </div>
                            ) : (
                              <Input
                                type={param.type}
                                value={param.value as string}
                                onChange={(e) => handleParameterChange('medical', param.id, e.target.value)}
                                disabled={!param.editable}
                                className={!param.editable ? "bg-muted" : ""}
                              />
                            )}
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-end pt-4">
                        <Button onClick={() => saveCategory('medical')} className="gap-2">
                          <Save className="h-4 w-4" />
                          Guardar Cambios en Médico
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Inventario */}
                  <AccordionItem value="inventory" className="border rounded-lg">
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-orange-500" />
                        <div className="text-left">
                          <span className="font-semibold">Inventario</span>
                          <p className="text-sm text-muted-foreground">4 parámetros configurados</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pt-4 space-y-4">
                      {globalParameters.inventory.map((param) => (
                        <div key={param.id} className="grid gap-4 md:grid-cols-3 items-start">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Label className="font-medium">{param.name}</Label>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Info className="h-4 w-4 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs">{param.description}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <p className="text-sm text-muted-foreground">{param.description}</p>
                          </div>
                          <div className="md:col-span-2">
                            {/* Renderizar input según tipo */}
                            {param.type === 'checkbox' ? (
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={param.value as boolean}
                                  onCheckedChange={(v) => handleParameterChange('inventory', param.id, v)}
                                  disabled={!param.editable}
                                />
                                <span className="text-sm">{param.value ? 'Habilitado' : 'Deshabilitado'}</span>
                              </div>
                            ) : param.type === 'number' ? (
                              <div className="flex gap-2">
                                <Input
                                  type="number"
                                  value={param.value as string}
                                  onChange={(e) => handleParameterChange('inventory', param.id, e.target.value)}
                                  disabled={!param.editable}
                                  className={!param.editable ? "bg-muted" : ""}
                                />
                                {param.unit && <span className="flex items-center text-sm text-muted-foreground">{param.value}</span>}
                              </div>
                            ) : (
                              <Input
                                type={param.type}
                                value={param.value as string}
                                onChange={(e) => handleParameterChange('inventory', param.id, e.target.value)}
                                disabled={!param.editable}
                                className={!param.editable ? "bg-muted" : ""}
                              />
                            )}
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-end pt-4">
                        <Button onClick={() => saveCategory('inventory')} className="gap-2">
                          <Save className="h-4 w-4" />
                          Guardar Cambios en Inventario
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Notificaciones */}
                  <AccordionItem value="notifications" className="border rounded-lg">
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <div className="flex items-center gap-3">
                        <Bell className="h-5 w-5 text-purple-500" />
                        <div className="text-left">
                          <span className="font-semibold">Notificaciones</span>
                          <p className="text-sm text-muted-foreground">5 parámetros configurados</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pt-4 space-y-4">
                      {globalParameters.notifications.map((param) => (
                        <div key={param.id} className="grid gap-4 md:grid-cols-3 items-start">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Label className="font-medium">{param.name}</Label>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Info className="h-4 w-4 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs">{param.description}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <p className="text-sm text-muted-foreground">{param.description}</p>
                          </div>
                          <div className="md:col-span-2">
                            {/* Renderizar input según tipo */}
                            {param.type === 'checkbox' ? (
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={param.value as boolean}
                                  onCheckedChange={(v) => handleParameterChange('notifications', param.id, v)}
                                  disabled={!param.editable}
                                />
                                <span className="text-sm">{param.value ? 'Habilitado' : 'Deshabilitado'}</span>
                              </div>
                            ) : param.type === 'number' ? (
                              <div className="flex gap-2">
                                <Input
                                  type="number"
                                  value={param.value as string}
                                  onChange={(e) => handleParameterChange('notifications', param.id, e.target.value)}
                                  disabled={!param.editable}
                                  className={!param.editable ? "bg-muted" : ""}
                                />
                                {param.unit && <span className="flex items-center text-sm text-muted-foreground">{param.unit}</span>}
                              </div>
                            ) : param.type === 'time' ? (
                              <Input
                                type="time"
                                value={param.value as string}
                                onChange={(e) => handleParameterChange('notifications', param.id, e.target.value)}
                                disabled={!param.editable}
                                className={!param.editable ? "bg-muted" : ""}
                              />
                            ) : (
                              <Input
                                type={param.type}
                                value={param.value as string}
                                onChange={(e) => handleParameterChange('notifications', param.id, e.target.value)}
                                disabled={!param.editable}
                                className={!param.editable ? "bg-muted" : ""}
                              />
                            )}
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-end pt-4">
                        <Button onClick={() => saveCategory('notifications')} className="gap-2">
                          <Save className="h-4 w-4" />
                          Guardar Cambios en Notificaciones
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Sistema */}
                  <AccordionItem value="system" className="border rounded-lg">
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <div className="flex items-center gap-3">
                        <Settings className="h-5 w-5 text-gray-500" />
                        <div className="text-left">
                          <span className="font-semibold">Sistema</span>
                          <p className="text-sm text-muted-foreground">6 parámetros configurados</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pt-4 space-y-4">
                      {globalParameters.system.map((param) => (
                        <div key={param.id} className="grid gap-4 md:grid-cols-3 items-start">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Label className="font-medium">{param.name}</Label>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Info className="h-4 w-4 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs">{param.description}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <p className="text-sm text-muted-foreground">{param.description}</p>
                          </div>
                          <div className="md:col-span-2">
                            {/* Renderizar input según tipo */}
                            {param.type === 'checkbox' ? (
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={param.value as boolean}
                                  onCheckedChange={(v) => handleParameterChange('system', param.id, v)}
                                  disabled={!param.editable}
                                />
                                <span className="text-sm">{param.value ? 'Habilitado' : 'Deshabilitado'}</span>
                              </div>
                            ) : param.type === 'number' ? (
                              <div className="flex gap-2">
                                <Input
                                  type="number"
                                  value={param.value as string}
                                  onChange={(e) => handleParameterChange('system', param.id, e.target.value)}
                                  disabled={!param.editable}
                                  className={!param.editable ? "bg-muted" : ""}
                                />
                                {param.unit && <span className="flex items-center text-sm text-muted-foreground">{param.unit}</span>}
                              </div>
                            ) : param.type === 'time' ? (
                              <Input
                                type="time"
                                value={param.value as string}
                                onChange={(e) => handleParameterChange('system', param.id, e.target.value)}
                                disabled={!param.editable}
                                className={!param.editable ? "bg-muted" : ""}
                              />
                            ) : (
                              <Input
                                type={param.type}
                                value={param.value as string}
                                onChange={(e) => handleParameterChange('system', param.id, e.target.value)}
                                disabled={!param.editable}
                                className={!param.editable ? "bg-muted" : ""}
                              />
                            )}
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-end pt-4">
                        <Button onClick={() => saveCategory('system')} className="gap-2">
                          <Save className="h-4 w-4" />
                          Guardar Cambios en Sistema
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pestaña: Seguridad */}
          <TabsContent value="security">
            <div className="space-y-6">
              {/* Advertencia */}
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="font-medium text-amber-800">
                      Algunos cambios requieren reinicio del sistema
                    </p>
                    <p className="text-sm text-amber-700">
                      Los cambios en políticas de contraseña y tiempo de sesión requieren que los usuarios inicien sesión nuevamente.
                    </p>
                  </div>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Políticas de Contraseña
                  </CardTitle>
                  <CardDescription>Configura los requisitos para las contraseñas de usuario</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={securitySettings.passwordPolicy.requireUppercase}
                        onCheckedChange={(v) => setSecuritySettings({
                          ...securitySettings,
                          passwordPolicy: { ...securitySettings.passwordPolicy, requireUppercase: v }
                        })}
                      />
                      <Label>Mayúsculas (A-Z)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={securitySettings.passwordPolicy.requireLowercase}
                        onCheckedChange={(v) => setSecuritySettings({
                          ...securitySettings,
                          passwordPolicy: { ...securitySettings.passwordPolicy, requireLowercase: v }
                        })}
                      />
                      <Label>Minúsculas (a-z)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={securitySettings.passwordPolicy.requireNumbers}
                        onCheckedChange={(v) => setSecuritySettings({
                          ...securitySettings,
                          passwordPolicy: { ...securitySettings.passwordPolicy, requireNumbers: v }
                        })}
                      />
                      <Label>Números (0-9)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={securitySettings.passwordPolicy.requireSpecialChars}
                        onCheckedChange={(v) => setSecuritySettings({
                          ...securitySettings,
                          passwordPolicy: { ...securitySettings.passwordPolicy, requireSpecialChars: v }
                        })}
                      />
                      <Label>Caracteres especiales</Label>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="minLength">Longitud Mínima</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="minLength"
                          type="number"
                          value={securitySettings.passwordPolicy.minLength}
                          onChange={(e) => setSecuritySettings({
                            ...securitySettings,
                            passwordPolicy: { ...securitySettings.passwordPolicy, minLength: parseInt(e.target.value) }
                          })}
                        />
                        <span className="text-sm text-muted-foreground">caracteres</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expireDays">Días de Expiración</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="expireDays"
                          type="number"
                          value={securitySettings.passwordPolicy.expireDays}
                          onChange={(e) => setSecuritySettings({
                            ...securitySettings,
                            passwordPolicy: { ...securitySettings.passwordPolicy, expireDays: parseInt(e.target.value) }
                          })}
                        />
                        <span className="text-sm text-muted-foreground">días</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="historySize">Historial de Contraseñas</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="historySize"
                          type="number"
                          value={securitySettings.passwordPolicy.historySize}
                          onChange={(e) => setSecuritySettings({
                            ...securitySettings,
                            passwordPolicy: { ...securitySettings.passwordPolicy, historySize: parseInt(e.target.value) }
                          })}
                        />
                        <span className="text-sm text-muted-foreground">anteriores</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Configuración de Sesiones</CardTitle>
                  <CardDescription>Tiempos y límites para las sesiones de usuario</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout">Timeout de Sesión</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="sessionTimeout"
                          type="number"
                          value={securitySettings.session.timeout}
                          onChange={(e) => setSecuritySettings({
                            ...securitySettings,
                            session: { ...securitySettings.session, timeout: parseInt(e.target.value) }
                          })}
                        />
                        <span className="text-sm text-muted-foreground">minutos</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxLoginAttempts">Intentos Máx. de Login</Label>
                      <Input
                        id="maxLoginAttempts"
                        type="number"
                        value={securitySettings.session.maxLoginAttempts}
                        onChange={(e) => setSecuritySettings({
                          ...securitySettings,
                          session: { ...securitySettings.session, maxLoginAttempts: parseInt(e.target.value) }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lockoutTime">Tiempo de Bloqueo</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="lockoutTime"
                          type="number"
                          value={securitySettings.session.lockoutTime}
                          onChange={(e) => setSecuritySettings({
                            ...securitySettings,
                            session: { ...securitySettings.session, lockoutTime: parseInt(e.target.value) }
                          })}
                        />
                        <span className="text-sm text-muted-foreground">minutos</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Autenticación Avanzada</CardTitle>
                  <CardDescription>Configuración de seguridad adicional</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Autenticación de Dos Factores (2FA)</p>
                      <p className="text-sm text-muted-foreground">Requerir verificación adicional para todos los usuarios</p>
                    </div>
                    <Switch
                      checked={securitySettings.authentication.twoFactorEnabled}
                      onCheckedChange={(v) => setSecuritySettings({
                        ...securitySettings,
                        authentication: { ...securitySettings.authentication, twoFactorEnabled: v }
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tokenExpiration">Expiración de Tokens JWT</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="tokenExpiration"
                        type="number"
                        value={securitySettings.authentication.tokenExpiration}
                        onChange={(e) => setSecuritySettings({
                          ...securitySettings,
                          authentication: { ...securitySettings.authentication, tokenExpiration: parseInt(e.target.value) }
                        })}
                      />
                      <span className="text-sm text-muted-foreground">horas</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>IP Whitelist</Label>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Plus className="h-3 w-3" />
                        Agregar IP
                      </Button>
                    </div>
                    <div className="rounded-lg border p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">IPs Permitidas</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowSensitiveValues(!showSensitiveValues)}
                          className="gap-1"
                        >
                          {showSensitiveValues ? (
                            <>
                              <EyeOff className="h-3 w-3" />
                              Ocultar
                            </>
                          ) : (
                            <>
                              <Eye className="h-3 w-3" />
                              Mostrar
                            </>
                          )}
                        </Button>
                      </div>
                      {securitySettings.authentication.ipWhitelist.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No hay IPs en la lista blanca
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {securitySettings.authentication.ipWhitelist.map((ip, index) => (
                            <div key={index} className="flex items-center justify-between rounded border px-3 py-2">
                              <code className="text-sm">
                                {showSensitiveValues ? ip : '•'.repeat(4)}
                              </code>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Solo las IPs en esta lista podrán acceder al sistema
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button className="gap-2">
                  <Save className="h-4 w-4" />
                  Guardar Configuración de Seguridad
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Pestaña: Plantillas de Notificaciones */}
          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Plantillas de Notificaciones
                    </CardTitle>
                    <CardDescription>Configure las plantillas para notificaciones automáticas</CardDescription>
                  </div>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nueva Plantilla
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border">
                  <div className="grid grid-cols-12 border-b bg-muted/50 p-4 text-sm font-medium">
                    <div className="col-span-4">Nombre</div>
                    <div className="col-span-3">Tipo</div>
                    <div className="col-span-2">Estado</div>
                    <div className="col-span-3 text-right">Acciones</div>
                  </div>
                  {notificationTemplates.map((template) => (
                    <div key={template.id} className="grid grid-cols-12 items-center border-b p-4 hover:bg-muted/50">
                      <div className="col-span-4 font-medium">{template.name}</div>
                      <div className="col-span-3">
                        <Badge variant="outline">{template.type}</Badge>
                      </div>
                      <div className="col-span-2">
                        <Badge variant={template.status === 'active' ? 'default' : 'secondary'}>
                          {template.status === 'active' ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>
                      <div className="col-span-3 flex justify-end gap-2">
                        <Button variant="outline" size="sm" className="gap-1">
                          <Eye className="h-3 w-3" />
                          Vista Previa
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Edit className="h-3 w-3" />
                          Editar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Variables disponibles */}
                <div className="mt-6 rounded-lg border p-4">
                  <h4 className="mb-3 font-medium">Variables Disponibles</h4>
                  <div className="flex flex-wrap gap-2">
                    {['{paciente}', '{fecha}', '{hora}', '{monto}', '{producto}', '{stock_actual}', '{fecha_vencimiento}'].map((variable) => (
                      <Badge key={variable} variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                        {variable}
                      </Badge>
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Use estas variables en sus plantillas. Se reemplazarán automáticamente con los valores reales.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pestaña: Funcionalidades del Sistema */}
          <TabsContent value="features">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Funcionalidades del Sistema
                </CardTitle>
                <CardDescription>Habilite o deshabilite módulos y funcionalidades específicas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Módulo Médico */}
                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-semibold">Módulo Médico</h3>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {systemFeatures.medical.map((feature) => (
                      <Card key={feature.id} className={feature.enabled ? "border-green-200" : ""}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{feature.name}</h4>
                                {feature.requiresLicense && (
                                  <Badge variant="outline" className="text-xs">
                                    Requiere Licencia
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{feature.description}</p>
                            </div>
                            <Switch
                              checked={feature.enabled}
                              onCheckedChange={() => toggleFeature('medical', feature.id)}
                              className={feature.enabled ? "data-[state=checked]:bg-green-600" : ""}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Módulo de Facturación */}
                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">Módulo de Facturación</h3>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {systemFeatures.billing.map((feature) => (
                      <Card key={feature.id} className={feature.enabled ? "border-blue-200" : ""}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{feature.name}</h4>
                                {feature.requiresLicense && (
                                  <Badge variant="outline" className="text-xs">
                                    Requiere Licencia
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{feature.description}</p>
                            </div>
                            <Switch
                              checked={feature.enabled}
                              onCheckedChange={() => toggleFeature('billing', feature.id)}
                              className={feature.enabled ? "data-[state=checked]:bg-blue-600" : ""}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Módulo de Inventario */}
                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <Package className="h-5 w-5 text-orange-600" />
                    <h3 className="text-lg font-semibold">Módulo de Inventario</h3>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {systemFeatures.inventory.map((feature) => (
                      <Card key={feature.id} className={feature.enabled ? "border-orange-200" : ""}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{feature.name}</h4>
                                {feature.requiresLicense && (
                                  <Badge variant="outline" className="text-xs">
                                    Requiere Licencia
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{feature.description}</p>
                            </div>
                            <Switch
                              checked={feature.enabled}
                              onCheckedChange={() => toggleFeature('inventory', feature.id)}
                              className={feature.enabled ? "data-[state=checked]:bg-orange-600" : ""}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Módulo de Notificaciones */}
                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <Bell className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-semibold">Módulo de Notificaciones</h3>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {systemFeatures.notifications.map((feature) => (
                      <Card key={feature.id} className={feature.enabled ? "border-purple-200" : ""}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{feature.name}</h4>
                                {feature.requiresLicense && (
                                  <Badge variant="outline" className="text-xs">
                                    Requiere Licencia
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{feature.description}</p>
                            </div>
                            <Switch
                              checked={feature.enabled}
                              onCheckedChange={() => toggleFeature('notifications', feature.id)}
                              className={feature.enabled ? "data-[state=checked]:bg-purple-600" : ""}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button className="gap-2">
                    <Save className="h-4 w-4" />
                    Guardar Configuración de Funcionalidades
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