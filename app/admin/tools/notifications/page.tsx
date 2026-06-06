"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, addDays, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import {
    Bell,
    BellRing,
    CalendarClock,
    Mail,
    MessageSquare,
    Smartphone,
    AlertTriangle,
    CheckCircle2,
    Clock,
    XCircle,
    Search,
    Filter,
    Plus,
    MoreVertical,
    Edit,
    Trash2,
    Play,
    Pause,
    RefreshCw,
    Eye,
    Send,
    Copy,
    Download,
    Upload,
    Settings,
    User,
    Phone,
    AtSign,
    Hash,
    Calendar as CalendarIcon,
    Repeat,
    Timer,
    Zap,
    Database,
    FileText,
    Shield,
    Heart,
    Pill,
    Stethoscope,
    Building
} from "lucide-react"

export default function NotificationsPage() {
    const [activeTab, setActiveTab] = useState<'templates' | 'scheduled' | 'history' | 'settings'>('templates')
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")

    // Mock data - Plantillas de notificación
    const notificationTemplates = [
        {
            id: "1",
            code: "low_stock_alert",
            name: "Alerta de Stock Bajo",
            type: "email",
            category: "inventory",
            subject: "Alerta: Stock Bajo - {product_name}",
            body: "El producto {product_name} (Código: {product_code}) tiene stock bajo.\n\nStock actual: {current_stock}\nStock mínimo: {minimum_stock}\nBodega: {warehouse_name}\n\nPor favor, generar orden de compra.",
            variables: ["product_name", "product_code", "current_stock", "minimum_stock", "warehouse_name"],
            isActive: true,
            updatedAt: "2024-01-15T10:30:00"
        },
        {
            id: "2",
            code: "appointment_reminder",
            name: "Recordatorio de Cita",
            type: "whatsapp",
            category: "medical",
            subject: null,
            body: "Hola {patient_name}. Le recordamos su cita médica:\n\nFecha: {appointment_date}\nHora: {appointment_time}\nDoctor: {doctor_name}\nUbicación: {location}\n\nPor favor confirmar asistencia.",
            variables: ["patient_name", "appointment_date", "appointment_time", "doctor_name", "location"],
            isActive: true,
            updatedAt: "2024-01-14T15:45:00"
        },
        {
            id: "3",
            code: "payment_reminder",
            name: "Recordatorio de Pago",
            type: "sms",
            category: "billing",
            subject: null,
            body: "Estimado {patient_name}, tiene un saldo pendiente de {amount}. Vence el {due_date}. Para pagos en línea: {payment_link}",
            variables: ["patient_name", "amount", "due_date", "payment_link"],
            isActive: true,
            updatedAt: "2024-01-13T09:20:00"
        },
        {
            id: "4",
            code: "maintenance_reminder",
            name: "Recordatorio de Mantenimiento",
            type: "email",
            category: "system",
            subject: "Mantenimiento Programado - {equipment_name}",
            body: "El equipo {equipment_name} (Serial: {serial_number}) requiere mantenimiento.\n\nTipo: {maintenance_type}\nFecha programada: {scheduled_date}\nResponsable: {responsible_person}\n\nPor favor, programar la intervención.",
            variables: ["equipment_name", "serial_number", "maintenance_type", "scheduled_date", "responsible_person"],
            isActive: true,
            updatedAt: "2024-01-12T14:10:00"
        },
        {
            id: "5",
            code: "monthly_report",
            name: "Reporte Mensual",
            type: "email",
            category: "reports",
            subject: "Reporte Mensual - {month} {year}",
            body: "Adjunto encontrará el reporte mensual de {department}.\n\nResumen:\n- Total consultas: {total_consultations}\n- Ingresos: {total_income}\n- Pacientes nuevos: {new_patients}\n\nPara más detalles, revise el archivo adjunto.",
            variables: ["month", "year", "department", "total_consultations", "total_income", "new_patients"],
            isActive: false,
            updatedAt: "2024-01-11T11:30:00"
        },
        {
            id: "6",
            code: "license_expiration",
            name: "Vencimiento de Licencias",
            type: "system",
            category: "compliance",
            subject: "Alerta: Licencia próxima a vencer",
            body: "La licencia {license_type} para {license_holder} vence el {expiration_date}.\n\nTipo: {license_type}\nTitular: {license_holder}\nNúmero: {license_number}\nVence: {expiration_date}\n\nRenovar con anticipación.",
            variables: ["license_type", "license_holder", "license_number", "expiration_date"],
            isActive: true,
            updatedAt: "2024-01-10T16:25:00"
        }
    ]

    // Mock data - Recordatorios programados
    const scheduledNotifications = [
        {
            id: "s1",
            name: "Revisión de Equipos Médicos",
            description: "Revisión mensual de equipos críticos",
            templateCode: "maintenance_reminder",
            type: "email",
            recipients: ["tecnico@hospital.com", "mantenimiento@hospital.com"],
            schedule: {
                frequency: "monthly",
                dayOfMonth: 15,
                time: "09:00",
                startDate: "2024-01-15",
                endDate: "2024-12-31"
            },
            lastSent: "2024-01-15T09:00:00",
            nextSend: "2024-02-15T09:00:00",
            status: "active",
            createdBy: "Admin Sistema"
        },
        {
            id: "s2",
            name: "Recordatorio Citas Diario",
            description: "Recordatorio automático de citas del día siguiente",
            templateCode: "appointment_reminder",
            type: "whatsapp",
            recipients: ["patients"], // Especial: todos los pacientes con cita
            schedule: {
                frequency: "daily",
                time: "18:00",
                daysInAdvance: 1
            },
            lastSent: "2024-01-14T18:00:00",
            nextSend: "2024-01-15T18:00:00",
            status: "active",
            createdBy: "Dr. González"
        },
        {
            id: "s3",
            name: "Reporte Financiero Semanal",
            description: "Envío de reporte financiero a dirección",
            templateCode: "monthly_report",
            type: "email",
            recipients: ["director@hospital.com", "contabilidad@hospital.com"],
            schedule: {
                frequency: "weekly",
                dayOfWeek: "monday",
                time: "08:00"
            },
            lastSent: "2024-01-15T08:00:00",
            nextSend: "2024-01-22T08:00:00",
            status: "paused",
            createdBy: "Sistema Contable"
        },
        {
            id: "s4",
            name: "Alerta Stock Quincenal",
            description: "Revisión de stock bajo cada 15 días",
            templateCode: "low_stock_alert",
            type: "email",
            recipients: ["compras@hospital.com", "bodega@hospital.com"],
            schedule: {
                frequency: "custom",
                intervalDays: 15,
                time: "10:00",
                startDate: "2024-01-01"
            },
            lastSent: "2024-01-15T10:00:00",
            nextSend: "2024-01-30T10:00:00",
            status: "active",
            createdBy: "Jefe de Bodega"
        },
        {
            id: "s5",
            name: "Pagos Vencidos",
            description: "Recordatorio de facturas vencidas",
            templateCode: "payment_reminder",
            type: "sms",
            recipients: ["patients"], // Especial: pacientes con pagos vencidos
            schedule: {
                frequency: "daily",
                time: "12:00"
            },
            lastSent: "2024-01-15T12:00:00",
            nextSend: "2024-01-16T12:00:00",
            status: "active",
            createdBy: "Administración"
        }
    ]

    // Mock data - Historial de notificaciones
    const notificationHistory = [
        {
            id: "h1",
            type: "email",
            recipient: "tecnico@hospital.com",
            subject: "Mantenimiento Programado - Tomógrafo CT-500",
            status: "sent",
            sentAt: "2024-01-15T09:00:00",
            readAt: "2024-01-15T09:15:00",
            retryCount: 0
        },
        {
            id: "h2",
            type: "whatsapp",
            recipient: "+502 5555-1234",
            subject: "Recordatorio de Cita",
            status: "sent",
            sentAt: "2024-01-14T18:00:00",
            readAt: null,
            retryCount: 0
        },
        {
            id: "h3",
            type: "sms",
            recipient: "+502 5555-5678",
            subject: "Recordatorio de Pago",
            status: "failed",
            sentAt: "2024-01-15T12:00:00",
            readAt: null,
            retryCount: 2,
            errorMessage: "Número inválido"
        },
        {
            id: "h4",
            type: "email",
            recipient: "compras@hospital.com",
            subject: "Alerta: Stock Bajo - Guantes Látex",
            status: "sent",
            sentAt: "2024-01-15T10:00:00",
            readAt: "2024-01-15T10:30:00",
            retryCount: 0
        },
        {
            id: "h5",
            type: "system",
            recipient: "Usuario: Dr. González",
            subject: "Vencimiento de Licencia Médica",
            status: "read",
            sentAt: "2024-01-14T08:00:00",
            readAt: "2024-01-14T08:05:00",
            retryCount: 0
        }
    ]

    // Estado para nuevo recordatorio
    const [newReminder, setNewReminder] = useState({
        name: "",
        description: "",
        templateCode: "",
        type: "email",
        recipients: [] as string[],
        schedule: {
            frequency: "daily",
            time: "09:00",
            startDate: new Date(),
            endDate: null as Date | null,
            dayOfMonth: 1,
            dayOfWeek: "monday",
            intervalDays: 1,
            daysInAdvance: 1
        }
    })

    const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
    const [showPreview, setShowPreview] = useState(false)
    const [recipientInput, setRecipientInput] = useState("")

    // Funciones auxiliares
    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'email': return <Mail className="h-4 w-4" />
            case 'whatsapp': return <MessageSquare className="h-4 w-4" />
            case 'sms': return <Smartphone className="h-4 w-4" />
            case 'system': return <Bell className="h-4 w-4" />
            case 'push': return <BellRing className="h-4 w-4" />
            default: return <Bell className="h-4 w-4" />
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100"><Play className="h-3 w-3 mr-1" /> Activo</Badge>
            case 'paused':
                return <Badge variant="outline" className="border-amber-300 text-amber-700"><Pause className="h-3 w-3 mr-1" /> Pausado</Badge>
            case 'sent':
                return <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-100"><CheckCircle2 className="h-3 w-3 mr-1" /> Enviado</Badge>
            case 'failed':
                return <Badge variant="outline" className="border-red-300 text-red-700"><XCircle className="h-3 w-3 mr-1" /> Falló</Badge>
            case 'read':
                return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100"><Eye className="h-3 w-3 mr-1" /> Leído</Badge>
            case 'pending':
                return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" /> Pendiente</Badge>
            default:
                return <Badge variant="outline">Desconocido</Badge>
        }
    }

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'medical': return <Stethoscope className="h-4 w-4" />
            case 'inventory': return <Database className="h-4 w-4" />
            case 'billing': return <FileText className="h-4 w-4" />
            case 'system': return <Settings className="h-4 w-4" />
            case 'reports': return <FileText className="h-4 w-4" />
            case 'compliance': return <Shield className="h-4 w-4" />
            default: return <Bell className="h-4 w-4" />
        }
    }

    const addRecipient = () => {
        if (recipientInput && !newReminder.recipients.includes(recipientInput)) {
            setNewReminder({
                ...newReminder,
                recipients: [...newReminder.recipients, recipientInput]
            })
            setRecipientInput("")
        }
    }

    const removeRecipient = (recipient: string) => {
        setNewReminder({
            ...newReminder,
            recipients: newReminder.recipients.filter(r => r !== recipient)
        })
    }

    const handleCreateReminder = () => {
        // Aquí iría la lógica para guardar en el backend
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Notificaciones & Recordatorios</h1>
                        <p className="text-muted-foreground">
                            Gestión de notificaciones automáticas y recordatorios programados
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="gap-2">
                            <Download className="h-4 w-4" />
                            Exportar
                        </Button>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Nuevo Recordatorio
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                    <DialogTitle>Crear Nuevo Recordatorio</DialogTitle>
                                    <DialogDescription>
                                        Configure un recordatorio recurrente con notificaciones automáticas
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-6">
                                    {/* Información básica */}
                                    <div className="space-y-4">
                                        <h3 className="font-semibold">Información Básica</h3>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="reminder-name">Nombre del Recordatorio *</Label>
                                                <Input
                                                    id="reminder-name"
                                                    placeholder="Ej: Revisión Mensual de Equipos"
                                                    value={newReminder.name}
                                                    onChange={(e) => setNewReminder({ ...newReminder, name: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="reminder-description">Descripción</Label>
                                                <Input
                                                    id="reminder-description"
                                                    placeholder="Breve descripción del propósito"
                                                    value={newReminder.description}
                                                    onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label>Plantilla de Notificación *</Label>
                                                <Select
                                                    value={newReminder.templateCode}
                                                    onValueChange={(v) => setNewReminder({ ...newReminder, templateCode: v })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccionar plantilla" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {notificationTemplates
                                                            .filter(t => t.isActive)
                                                            .map(template => (
                                                                <SelectItem key={template.id} value={template.code}>
                                                                    <div className="flex items-center gap-2">
                                                                        {getTypeIcon(template.type)}
                                                                        <span>{template.name}</span>
                                                                    </div>
                                                                </SelectItem>
                                                            ))
                                                        }
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Tipo de Notificación *</Label>
                                                <Select
                                                    value={newReminder.type}
                                                    onValueChange={(v) => setNewReminder({ ...newReminder, type: v })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="email">Email</SelectItem>
                                                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                                        <SelectItem value="sms">SMS</SelectItem>
                                                        <SelectItem value="system">Sistema</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Destinatarios */}
                                    <div className="space-y-4">
                                        <h3 className="font-semibold">Destinatarios</h3>
                                        <div className="space-y-2">
                                            <Label>Agregar destinatarios</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder={
                                                        newReminder.type === 'email' ? "ejemplo@hospital.com" :
                                                            newReminder.type === 'whatsapp' || newReminder.type === 'sms' ? "+502 5555-1234" :
                                                                "Usuario o grupo"
                                                    }
                                                    value={recipientInput}
                                                    onChange={(e) => setRecipientInput(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && addRecipient()}
                                                />
                                                <Button type="button" onClick={addRecipient}>Agregar</Button>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {newReminder.type === 'email' && 'Ingrese direcciones de email separadas'}
                                                {newReminder.type === 'whatsapp' && 'Ingrese números de teléfono con código país'}
                                                {newReminder.type === 'sms' && 'Ingrese números de teléfono con código país'}
                                                {newReminder.type === 'system' && 'Ingrese nombres de usuario o grupos'}
                                            </p>
                                        </div>

                                        {newReminder.recipients.length > 0 && (
                                            <div className="rounded-lg border p-3">
                                                <div className="flex flex-wrap gap-2">
                                                    {newReminder.recipients.map((recipient, idx) => (
                                                        <Badge key={idx} variant="secondary" className="gap-1">
                                                            {recipient}
                                                            <button
                                                                onClick={() => removeRecipient(recipient)}
                                                                className="ml-1 hover:text-destructive"
                                                            >
                                                                <XCircle className="h-3 w-3" />
                                                            </button>
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center space-x-2">
                                            <Switch id="special-recipients" />
                                            <Label htmlFor="special-recipients" className="cursor-pointer">
                                                Usar destinatarios dinámicos (ej: todos los pacientes con cita)
                                            </Label>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Programación */}
                                    <div className="space-y-4">
                                        <h3 className="font-semibold">Programación</h3>

                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label>Frecuencia *</Label>
                                                <Select
                                                    value={newReminder.schedule.frequency}
                                                    onValueChange={(v) => setNewReminder({
                                                        ...newReminder,
                                                        schedule: { ...newReminder.schedule, frequency: v }
                                                    })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="daily">Diario</SelectItem>
                                                        <SelectItem value="weekly">Semanal</SelectItem>
                                                        <SelectItem value="monthly">Mensual</SelectItem>
                                                        <SelectItem value="yearly">Anual</SelectItem>
                                                        <SelectItem value="custom">Personalizado</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Hora de Envío *</Label>
                                                <Input
                                                    type="time"
                                                    value={newReminder.schedule.time}
                                                    onChange={(e) => setNewReminder({
                                                        ...newReminder,
                                                        schedule: { ...newReminder.schedule, time: e.target.value }
                                                    })}
                                                />
                                            </div>
                                        </div>

                                        {/* Configuración específica por frecuencia */}
                                        {newReminder.schedule.frequency === 'weekly' && (
                                            <div className="space-y-2">
                                                <Label>Día de la semana</Label>
                                                <Select
                                                    value={newReminder.schedule.dayOfWeek}
                                                    onValueChange={(v) => setNewReminder({
                                                        ...newReminder,
                                                        schedule: { ...newReminder.schedule, dayOfWeek: v }
                                                    })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="monday">Lunes</SelectItem>
                                                        <SelectItem value="tuesday">Martes</SelectItem>
                                                        <SelectItem value="wednesday">Miércoles</SelectItem>
                                                        <SelectItem value="thursday">Jueves</SelectItem>
                                                        <SelectItem value="friday">Viernes</SelectItem>
                                                        <SelectItem value="saturday">Sábado</SelectItem>
                                                        <SelectItem value="sunday">Domingo</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}

                                        {newReminder.schedule.frequency === 'monthly' && (
                                            <div className="space-y-2">
                                                <Label>Día del mes (1-31)</Label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    max="31"
                                                    value={newReminder.schedule.dayOfMonth}
                                                    onChange={(e) => setNewReminder({
                                                        ...newReminder,
                                                        schedule: { ...newReminder.schedule, dayOfMonth: parseInt(e.target.value) }
                                                    })}
                                                />
                                            </div>
                                        )}

                                        {newReminder.schedule.frequency === 'custom' && (
                                            <div className="space-y-2">
                                                <Label>Cada cuántos días</Label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={newReminder.schedule.intervalDays}
                                                    onChange={(e) => setNewReminder({
                                                        ...newReminder,
                                                        schedule: { ...newReminder.schedule, intervalDays: parseInt(e.target.value) }
                                                    })}
                                                />
                                            </div>
                                        )}

                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label>Fecha de inicio</Label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="outline" className="w-full justify-start">
                                                            <CalendarIcon className="h-4 w-4 mr-2" />
                                                            {format(newReminder.schedule.startDate, 'PPP', { locale: es })}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0">
                                                        <Calendar
                                                            mode="single"
                                                            selected={newReminder.schedule.startDate}
                                                            onSelect={(date) => date && setNewReminder({
                                                                ...newReminder,
                                                                schedule: { ...newReminder.schedule, startDate: date }
                                                            })}
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Fecha de fin (opcional)</Label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="outline" className="w-full justify-start">
                                                            <CalendarIcon className="h-4 w-4 mr-2" />
                                                            {newReminder.schedule.endDate ?
                                                                format(newReminder.schedule.endDate, 'PPP', { locale: es }) :
                                                                "Sin fecha de fin"}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0">
                                                        <Calendar
                                                            mode="single"
                                                            selected={newReminder.schedule.endDate || undefined}
                                                            onSelect={(date) => setNewReminder({
                                                                ...newReminder,
                                                                schedule: { ...newReminder.schedule, endDate: date || null }
                                                            })}
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button variant="outline">Cancelar</Button>
                                    <Button onClick={handleCreateReminder}>Crear Recordatorio</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Tabs principales */}
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
                    <TabsList className="w-full justify-start overflow-x-auto">
                        <TabsTrigger value="templates" className="gap-2">
                            <FileText className="h-4 w-4" />
                            Plantillas
                        </TabsTrigger>
                        <TabsTrigger value="scheduled" className="gap-2">
                            <CalendarClock className="h-4 w-4" />
                            Programados
                        </TabsTrigger>
                        <TabsTrigger value="history" className="gap-2">
                            <Clock className="h-4 w-4" />
                            Historial
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="gap-2">
                            <Settings className="h-4 w-4" />
                            Configuración
                        </TabsTrigger>
                    </TabsList>

                    {/* Contenido de Plantillas */}
                    <TabsContent value="templates" className="space-y-6">
                        {/* Barra de búsqueda y filtros */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                                    <div className="flex items-center gap-2 w-full md:w-auto">
                                        <div className="relative flex-1 md:w-64">
                                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                placeholder="Buscar plantillas..."
                                                className="pl-9"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>
                                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                                            <SelectTrigger className="w-40">
                                                <Filter className="h-4 w-4 mr-2" />
                                                <SelectValue placeholder="Filtrar por estado" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todos los estados</SelectItem>
                                                <SelectItem value="active">Activas</SelectItem>
                                                <SelectItem value="inactive">Inactivas</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Button variant="outline" className="gap-2">
                                        <Upload className="h-4 w-4" />
                                        Importar Plantilla
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Grid de plantillas */}
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {notificationTemplates
                                .filter(template =>
                                    (statusFilter === 'all' ||
                                        (statusFilter === 'active' && template.isActive) ||
                                        (statusFilter === 'inactive' && !template.isActive)) &&
                                    (template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        template.code.toLowerCase().includes(searchQuery.toLowerCase()))
                                )
                                .map(template => (
                                    <Card key={template.id} className={template.isActive ? "border-l-4 border-l-green-500" : "border-l-4 border-l-gray-300"}>
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${template.isActive ? 'bg-primary/10' : 'bg-muted'}`}>
                                                        {getTypeIcon(template.type)}
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-lg">{template.name}</CardTitle>
                                                        <CardDescription className="flex items-center gap-2">
                                                            {getCategoryIcon(template.category)}
                                                            <span>{template.code}</span>
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Badge variant={template.isActive ? "default" : "outline"} className="capitalize">
                                                        {template.type}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                                {template.subject || "Sin asunto"}
                                            </p>

                                            <div className="space-y-3">
                                                <div>
                                                    <h4 className="text-sm font-medium mb-2">Variables disponibles:</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {template.variables.map((variable, idx) => (
                                                            <Badge key={idx} variant="outline" className="text-xs font-mono">
                                                                {`{${variable}}`}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="text-xs text-muted-foreground">
                                                    Actualizado: {format(parseISO(template.updatedAt), 'dd/MM/yyyy HH:mm')}
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="flex justify-between">
                                            <div className="flex items-center space-x-2">
                                                <Switch checked={template.isActive} />
                                                <Label>{template.isActive ? 'Activa' : 'Inactiva'}</Label>
                                            </div>

                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => setSelectedTemplate(template)}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardFooter>
                                    </Card>
                                ))
                            }
                        </div>
                    </TabsContent>

                    {/* Contenido de Programados */}
                    <TabsContent value="scheduled" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recordatorios Programados</CardTitle>
                                <CardDescription>Notificaciones automáticas recurrentes configuradas</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nombre</TableHead>
                                            <TableHead>Tipo</TableHead>
                                            <TableHead>Frecuencia</TableHead>
                                            <TableHead>Próximo envío</TableHead>
                                            <TableHead>Destinatarios</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead className="text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {scheduledNotifications.map((reminder) => (
                                            <TableRow key={reminder.id} className="hover:bg-muted/50">
                                                <TableCell>
                                                    <div className="font-medium">{reminder.name}</div>
                                                    <div className="text-sm text-muted-foreground">{reminder.description}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {getTypeIcon(reminder.type)}
                                                        <span className="capitalize">{reminder.type}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Repeat className="h-4 w-4 text-muted-foreground" />
                                                        <span className="capitalize">{reminder.schedule.frequency}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <CalendarClock className="h-4 w-4 text-muted-foreground" />
                                                        <span>{format(parseISO(reminder.nextSend), 'dd/MM/yyyy HH:mm')}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {Array.isArray(reminder.recipients) ? (
                                                        <div className="max-w-xs">
                                                            <span className="text-sm">
                                                                {reminder.recipients.length === 1 ? '1 destinatario' : `${reminder.recipients.length} destinatarios`}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <Badge variant="outline" className="capitalize">
                                                            {reminder.recipients}
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(reminder.status)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm">
                                                            {reminder.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                                        </Button>
                                                        <Button variant="ghost" size="sm">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm">
                                                            <Send className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        {/* Estadísticas de recordatorios */}
                        <div className="grid gap-6 md:grid-cols-4">
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Activos</p>
                                            <p className="text-2xl font-bold">3</p>
                                        </div>
                                        <Play className="h-8 w-8 text-green-500/60" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Pausados</p>
                                            <p className="text-2xl font-bold">1</p>
                                        </div>
                                        <Pause className="h-8 w-8 text-amber-500/60" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Total Programados</p>
                                            <p className="text-2xl font-bold">5</p>
                                        </div>
                                        <CalendarClock className="h-8 w-8 text-blue-500/60" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Próximos 7 días</p>
                                            <p className="text-2xl font-bold">12</p>
                                        </div>
                                        <BellRing className="h-8 w-8 text-purple-500/60" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Contenido de Historial */}
                    <TabsContent value="history" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Historial de Notificaciones</CardTitle>
                                <CardDescription>Registro de todas las notificaciones enviadas</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Fecha/Hora</TableHead>
                                                <TableHead>Tipo</TableHead>
                                                <TableHead>Destinatario</TableHead>
                                                <TableHead>Asunto</TableHead>
                                                <TableHead>Estado</TableHead>
                                                <TableHead>Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {notificationHistory.map((notification) => (
                                                <TableRow key={notification.id} className="hover:bg-muted/50">
                                                    <TableCell>
                                                        <div className="font-medium">{format(parseISO(notification.sentAt), 'dd/MM/yyyy')}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {format(parseISO(notification.sentAt), 'HH:mm:ss')}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            {getTypeIcon(notification.type)}
                                                            <span className="capitalize">{notification.type}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="max-w-[200px] truncate">
                                                            {notification.recipient}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="max-w-[300px] truncate">
                                                            {notification.subject}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {getStatusBadge(notification.status)}
                                                        {notification.errorMessage && (
                                                            <div className="text-xs text-red-500 mt-1">
                                                                {notification.errorMessage}
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex gap-2">
                                                            <Button variant="ghost" size="sm">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="sm">
                                                                <RefreshCw className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Mostrando {notificationHistory.length} notificaciones
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm">
                                        Anterior
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        Siguiente
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    {/* Contenido de Configuración */}
                    <TabsContent value="settings" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Configuración de Notificaciones</CardTitle>
                                <CardDescription>Ajustes globales del sistema de notificaciones</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Configuración de canales */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold">Configuración de Canales</h3>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <Label className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4" />
                                                    Notificaciones por Email
                                                </Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Configurar servidor SMTP para envío de emails
                                                </p>
                                            </div>
                                            <Button variant="outline" size="sm">Configurar</Button>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <Label className="flex items-center gap-2">
                                                    <MessageSquare className="h-4 w-4" />
                                                    WhatsApp Business API
                                                </Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Integración con WhatsApp para mensajes automáticos
                                                </p>
                                            </div>
                                            <Button variant="outline" size="sm">Configurar</Button>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <Label className="flex items-center gap-2">
                                                    <Smartphone className="h-4 w-4" />
                                                    Servicio SMS
                                                </Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Proveedor de mensajes de texto (Twilio, etc.)
                                                </p>
                                            </div>
                                            <Button variant="outline" size="sm">Configurar</Button>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Configuración de horarios */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold">Horarios de Envío</h3>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Hora de inicio permitida</Label>
                                            <Input type="time" defaultValue="08:00" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Hora de fin permitida</Label>
                                            <Input type="time" defaultValue="20:00" />
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Switch id="weekend-notifications" />
                                        <Label htmlFor="weekend-notifications" className="cursor-pointer">
                                            Permitir notificaciones los fines de semana
                                        </Label>
                                    </div>
                                </div>

                                <Separator />

                                {/* Configuración de límites */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold">Límites y Reintentos</h3>

                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label>Máximo de reintentos</Label>
                                            <Input type="number" min="0" max="10" defaultValue="3" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Intervalo entre reintentos (min)</Label>
                                            <Input type="number" min="1" defaultValue="5" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Límite diario por usuario</Label>
                                            <Input type="number" min="1" defaultValue="10" />
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Configuración de prioridades */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold">Prioridades por Canal</h3>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label className="flex items-center gap-2">
                                                <Zap className="h-4 w-4 text-red-500" />
                                                Notificaciones de Alta Prioridad
                                            </Label>
                                            <Select defaultValue="all">
                                                <SelectTrigger className="w-40">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Todos los canales</SelectItem>
                                                    <SelectItem value="whatsapp">WhatsApp + Email</SelectItem>
                                                    <SelectItem value="sms">SMS + Email</SelectItem>
                                                    <SelectItem value="email">Solo Email</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <Label className="flex items-center gap-2">
                                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                                                Notificaciones de Media Prioridad
                                            </Label>
                                            <Select defaultValue="email">
                                                <SelectTrigger className="w-40">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Todos los canales</SelectItem>
                                                    <SelectItem value="whatsapp">WhatsApp + Email</SelectItem>
                                                    <SelectItem value="sms">SMS + Email</SelectItem>
                                                    <SelectItem value="email">Solo Email</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <Label className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-blue-500" />
                                                Notificaciones de Baja Prioridad
                                            </Label>
                                            <Select defaultValue="email">
                                                <SelectTrigger className="w-40">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Todos los canales</SelectItem>
                                                    <SelectItem value="whatsapp">WhatsApp + Email</SelectItem>
                                                    <SelectItem value="sms">SMS + Email</SelectItem>
                                                    <SelectItem value="email">Solo Email</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end">
                                <Button>Guardar Configuración</Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Modal de vista previa de plantilla */}
                {selectedTemplate && (
                    <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Vista Previa: {selectedTemplate.name}</DialogTitle>
                                <DialogDescription>
                                    Código: {selectedTemplate.code} • Tipo: {selectedTemplate.type}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                                {selectedTemplate.subject && (
                                    <div className="space-y-2">
                                        <Label>Asunto:</Label>
                                        <div className="rounded-lg border p-3 bg-muted/50">
                                            {selectedTemplate.subject}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label>Contenido:</Label>
                                    <div className="rounded-lg border p-3 bg-muted/50 whitespace-pre-wrap min-h-[200px]">
                                        {selectedTemplate.body}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Variables utilizadas:</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedTemplate.variables.map((variable: string, idx: number) => (
                                            <Badge key={idx} variant="secondary" className="font-mono">
                                                {`{${variable}}`}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div className="rounded-lg border p-4">
                                    <h4 className="font-medium mb-2">💡 Cómo usar esta plantilla:</h4>
                                    <ul className="text-sm space-y-1">
                                        <li>• Las variables se reemplazarán automáticamente con datos reales</li>
                                        <li>• Use esta plantilla en recordatorios programados</li>
                                        <li>• Puede enviarse por: {selectedTemplate.type}</li>
                                        <li>• Estado actual: {selectedTemplate.isActive ? 'Activa' : 'Inactiva'}</li>
                                    </ul>
                                </div>
                            </div>

                            <DialogFooter className="gap-2">
                                <Button variant="outline" className="gap-2">
                                    <Copy className="h-4 w-4" />
                                    Copiar Plantilla
                                </Button>
                                <Button className="gap-2">
                                    <Edit className="h-4 w-4" />
                                    Editar Plantilla
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </DashboardLayout>
    )
}