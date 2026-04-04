"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, addDays, startOfWeek, endOfWeek, isSameDay, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import {
    Calendar,
    CalendarDays,
    Clock,
    Users,
    Stethoscope,
    Video,
    Bell,
    Search,
    Filter,
    Plus,
    MoreVertical,
    MapPin,
    User,
    FileText,
    AlertCircle,
    CheckCircle2,
    XCircle,
    ChevronLeft,
    ChevronRight,
    Grid,
    Share2,
    Printer,
    MessageSquare,
    Phone,
    Bed,
    Heart,
    Brain,
    Eye,
    Slice
} from "lucide-react"

export default function MedicalCalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [view, setView] = useState<'day' | 'week' | 'month'>('week')
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())
    const [searchQuery, setSearchQuery] = useState("")
    const [filterType, setFilterType] = useState<string>("all")

    // Mock data - Eventos médicos
    const medicalEvents = [
        {
            id: 1,
            title: "Cirugía de Apéndice - Dr. González",
            patient: "Carlos Rodríguez",
            type: "surgery",
            doctor: "Dr. Juan González",
            specialty: "Cirugía General",
            startTime: "2024-01-15T08:00:00",
            endTime: "2024-01-15T10:00:00",
            location: "Quirófano 3",
            status: "confirmed",
            priority: "high",
            participants: ["Dra. María López", "Enf. Roberto Sánchez"],
            notes: "Paciente con apendicitis aguda. Preparar antibióticos preoperatorios.",
            color: "bg-red-100 border-red-300"
        },
        {
            id: 2,
            title: "Consulta de Cardiología",
            patient: "Ana Martínez",
            type: "consultation",
            doctor: "Dra. Sofía Ramírez",
            specialty: "Cardiología",
            startTime: "2024-01-15T10:30:00",
            endTime: "2024-01-15T11:15:00",
            location: "Consulta 205",
            status: "confirmed",
            priority: "medium",
            participants: ["Tec. ECG Luis"],
            notes: "Control post-operatorio. Revisar resultados de eco.",
            color: "bg-blue-100 border-blue-300"
        },
        {
            id: 3,
            title: "Reunión de Staff Médico",
            type: "meeting",
            doctor: "Dr. Director",
            specialty: "Administración",
            startTime: "2024-01-15T14:00:00",
            endTime: "2024-01-15T16:00:00",
            location: "Sala de Conferencias",
            status: "confirmed",
            priority: "medium",
            participants: ["Todo el staff médico", "Enfermería jefe"],
            notes: "Revisión de casos complejos y protocolos COVID.",
            color: "bg-purple-100 border-purple-300"
        },
        {
            id: 4,
            title: "Telemedicina - Neurología",
            patient: "Roberto Sánchez",
            type: "telemedicine",
            doctor: "Dr. Andrés Fernández",
            specialty: "Neurología",
            startTime: "2024-01-15T16:30:00",
            endTime: "2024-01-15T17:15:00",
            location: "Plataforma Virtual",
            status: "pending",
            priority: "low",
            participants: ["Paciente", "Familiar"],
            notes: "Seguimiento migraña crónica. Enlace: meet.hospital.com/neuro",
            color: "bg-green-100 border-green-300"
        },
        {
            id: 5,
            title: "Parto Programado",
            patient: "Laura Gómez",
            type: "delivery",
            doctor: "Dra. Elena Vargas",
            specialty: "Ginecología y Obstetricia",
            startTime: "2024-01-16T09:00:00",
            endTime: "2024-01-16T12:00:00",
            location: "Sala de Partos 2",
            status: "confirmed",
            priority: "high",
            participants: ["Anestesiólogo", "Pediatra", "Enfermeras"],
            notes: "Cesárea programada. Grupo sanguíneo O+. Preparar banco de sangre.",
            color: "bg-pink-100 border-pink-300"
        },
        {
            id: 6,
            title: "Tomografía Craneal",
            patient: "Miguel Ángel",
            type: "exam",
            doctor: "Dr. Radiología",
            specialty: "Radiología",
            startTime: "2024-01-16T11:00:00",
            endTime: "2024-01-16T11:45:00",
            location: "Tomógrafo Sala 1",
            status: "confirmed",
            priority: "medium",
            participants: ["Tec. Radiólogo", "Enf. Ayudante"],
            notes: "Con contraste. Verificar alergias.",
            color: "bg-yellow-100 border-yellow-300"
        },
        {
            id: 7,
            title: "Capacitación RCP Avanzado",
            type: "training",
            doctor: "Instructor Certificado",
            specialty: "Emergencias",
            startTime: "2024-01-16T15:00:00",
            endTime: "2024-01-16T18:00:00",
            location: "Aula de Simulación",
            status: "confirmed",
            priority: "low",
            participants: ["Personal nuevo", "Residentes"],
            notes: "Traer ropa cómoda. Certificación al finalizar.",
            color: "bg-indigo-100 border-indigo-300"
        },
        {
            id: 8,
            title: "Guardia Nocturna",
            type: "shift",
            doctor: "Dr. Guardia",
            specialty: "Urgencias",
            startTime: "2024-01-16T20:00:00",
            endTime: "2024-01-17T08:00:00",
            location: "Urgencias",
            status: "confirmed",
            priority: "high",
            participants: ["Equipo guardia"],
            notes: "Turno noche completo. Relevo a las 8:00 AM.",
            color: "bg-gray-100 border-gray-300"
        }
    ]

    // Actividades del día actual (mock)
    const todayActivities = [
        { time: "07:00", activity: "Ronda matutina - Planta 3", type: "round", staff: "Dr. Principal" },
        { time: "08:30", activity: "Administración medicamentos", type: "medication", staff: "Enf. Jefe" },
        { time: "10:00", activity: "Limpieza y desinfección áreas críticas", type: "cleaning", staff: "Mantenimiento" },
        { time: "12:00", activity: "Visita familiar - Habitación 302", type: "visit", staff: "Trabajo Social" },
        { time: "14:30", activity: "Terapia física - Rehabilitación", type: "therapy", staff: "Fisioterapeuta" },
        { time: "16:00", activity: "Cambio de turno enfermería", type: "shift", staff: "Enfermería" },
        { time: "18:00", activity: "Ronda vespertina", type: "round", staff: "Dr. Guardia" }
    ]

    // Personal disponible (mock)
    const availableStaff = [
        { id: 1, name: "Dr. Juan González", role: "Cirujano", status: "available", avatar: "JG" },
        { id: 2, name: "Dra. Sofía Ramírez", role: "Cardióloga", status: "busy", avatar: "SR" },
        { id: 3, name: "Dra. Elena Vargas", role: "Ginecóloga", status: "available", avatar: "EV" },
        { id: 4, name: "Enf. Roberto Sánchez", role: "Enfermero Jefe", status: "away", avatar: "RS" },
        { id: 5, name: "Dr. Andrés Fernández", role: "Neurólogo", status: "available", avatar: "AF" },
        { id: 6, name: "Tec. Luis Martínez", role: "Radiólogo", status: "offline", avatar: "LM" }
    ]

    // Obtener eventos del día seleccionado
    const getEventsForDate = (date: Date) => {
        return medicalEvents.filter(event =>
            isSameDay(parseISO(event.startTime), date)
        )
    }

    // Obtener eventos de la semana actual
    const getWeekEvents = () => {
        const start = startOfWeek(currentDate, { weekStartsOn: 1 })
        const end = endOfWeek(currentDate, { weekStartsOn: 1 })

        return medicalEvents.filter(event => {
            const eventDate = parseISO(event.startTime)
            return eventDate >= start && eventDate <= end
        })
    }

    // Filtrar eventos según búsqueda y filtros
    const filteredEvents = medicalEvents.filter(event => {
        const matchesSearch =
            event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.patient?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.doctor.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesFilter = filterType === "all" || event.type === filterType

        return matchesSearch && matchesFilter
    })

    // Navegación
    const goToPrevious = () => {
        if (view === 'day') {
            setCurrentDate(addDays(currentDate, -1))
        } else if (view === 'week') {
            setCurrentDate(addDays(currentDate, -7))
        } else {
            setCurrentDate(addDays(currentDate, -30))
        }
    }

    const goToNext = () => {
        if (view === 'day') {
            setCurrentDate(addDays(currentDate, 1))
        } else if (view === 'week') {
            setCurrentDate(addDays(currentDate, 7))
        } else {
            setCurrentDate(addDays(currentDate, 30))
        }
    }

    const goToToday = () => {
        setCurrentDate(new Date())
        setSelectedDate(new Date())
    }

    // Obtener icono según tipo de evento
    const getEventIcon = (type: string) => {
        switch (type) {
            case 'surgery': return <Slice className="h-4 w-4" />
            case 'consultation': return <Stethoscope className="h-4 w-4" />
            case 'telemedicine': return <Video className="h-4 w-4" />
            case 'meeting': return <Users className="h-4 w-4" />
            case 'delivery': return <Heart className="h-4 w-4" />
            case 'exam': return <Eye className="h-4 w-4" />
            case 'training': return <Brain className="h-4 w-4" />
            case 'shift': return <Clock className="h-4 w-4" />
            default: return <Calendar className="h-4 w-4" />
        }
    }

    // Obtener color según prioridad
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-800 border-red-300'
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
            case 'low': return 'bg-green-100 text-green-800 border-green-300'
            default: return 'bg-gray-100 text-gray-800 border-gray-300'
        }
    }

    // Obtener badge según estado
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'confirmed':
                return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle2 className="h-3 w-3 mr-1" /> Confirmado</Badge>
            case 'pending':
                return <Badge variant="outline" className="border-amber-300 text-amber-700"><AlertCircle className="h-3 w-3 mr-1" /> Pendiente</Badge>
            case 'cancelled':
                return <Badge variant="outline" className="border-red-300 text-red-700"><XCircle className="h-3 w-3 mr-1" /> Cancelado</Badge>
            default:
                return <Badge variant="outline">Programado</Badge>
        }
    }

    // Vista semanal - Generar días de la semana
    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const day = addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), i)
        return {
            date: day,
            dayName: format(day, 'EEE', { locale: es }),
            dayNumber: format(day, 'd'),
            isToday: isSameDay(day, new Date())
        }
    })

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Calendario Médico</h1>
                        <p className="text-muted-foreground">
                            {format(currentDate, "EEEE dd 'de' MMMM 'de' yyyy", { locale: es })}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                            <Printer className="h-4 w-4" />
                            Imprimir
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Share2 className="h-4 w-4" />
                            Compartir
                        </Button>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Nuevo Evento
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Agendar Nuevo Evento Médico</DialogTitle>
                                    <DialogDescription>
                                        Complete los detalles del evento o actividad médica
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Tipo de Evento</Label>
                                            <Select>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar tipo" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="consultation">Consulta</SelectItem>
                                                    <SelectItem value="surgery">Cirugía</SelectItem>
                                                    <SelectItem value="exam">Examen</SelectItem>
                                                    <SelectItem value="telemedicine">Telemedicina</SelectItem>
                                                    <SelectItem value="meeting">Reunión</SelectItem>
                                                    <SelectItem value="training">Capacitación</SelectItem>
                                                    <SelectItem value="delivery">Parto</SelectItem>
                                                    <SelectItem value="shift">Guardia</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Prioridad</Label>
                                            <Select>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar prioridad" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="high">Alta (Urgente)</SelectItem>
                                                    <SelectItem value="medium">Media (Importante)</SelectItem>
                                                    <SelectItem value="low">Baja (Rutina)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Título del Evento</Label>
                                        <Input placeholder="Ej: Cirugía de Apéndice - Dr. González" />
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Paciente (opcional)</Label>
                                            <Input placeholder="Nombre del paciente" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Médico Responsable</Label>
                                            <Input placeholder="Nombre del médico" />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Fecha</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="w-full justify-start">
                                                        <Calendar className="h-4 w-4 mr-2" />
                                                        {format(new Date(), 'PPP', { locale: es })}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <CalendarComponent mode="single" />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-2">
                                                <Label>Hora Inicio</Label>
                                                <Input type="time" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Hora Fin</Label>
                                                <Input type="time" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Ubicación</Label>
                                        <Input placeholder="Ej: Quirófano 3, Consulta 205, Sala Virtual" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Notas y Observaciones</Label>
                                        <Textarea placeholder="Detalles importantes, preparativos especiales, alergias, etc." />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button variant="outline">Cancelar</Button>
                                    <Button>Guardar Evento</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Barra de herramientas */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                            {/* Controles de navegación */}
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" onClick={goToPrevious}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" onClick={goToToday}>
                                    Hoy
                                </Button>
                                <Button variant="outline" size="icon" onClick={goToNext}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                <span className="font-semibold mx-2">
                                    {view === 'month' ? format(currentDate, 'MMMM yyyy', { locale: es }) :
                                        view === 'week' ? `Semana ${format(currentDate, 'w', { locale: es })}` :
                                            format(currentDate, 'PPP', { locale: es })}
                                </span>
                            </div>

                            {/* Selector de vista */}
                            <div className="flex items-center gap-2">
                                <Tabs value={view} onValueChange={(v) => setView(v as any)} className="w-auto">
                                    <TabsList>
                                        <TabsTrigger value="day" className="gap-2">
                                            <Calendar className="h-4 w-4" />
                                            <span className="hidden sm:inline">Día</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="week" className="gap-2">
                                            <CalendarDays className="h-4 w-4" />
                                            <span className="hidden sm:inline">Semana</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="month" className="gap-2">
                                            <Grid className="h-4 w-4" />
                                            <span className="hidden sm:inline">Mes</span>
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>

                            {/* Búsqueda y filtros */}
                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <div className="relative flex-1 md:w-64">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar eventos, pacientes..."
                                        className="pl-9"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <Select value={filterType} onValueChange={setFilterType}>
                                    <SelectTrigger className="w-40">
                                        <Filter className="h-4 w-4 mr-2" />
                                        <SelectValue placeholder="Filtrar por tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos los tipos</SelectItem>
                                        <SelectItem value="consultation">Consultas</SelectItem>
                                        <SelectItem value="surgery">Cirugías</SelectItem>
                                        <SelectItem value="exam">Exámenes</SelectItem>
                                        <SelectItem value="telemedicine">Telemedicina</SelectItem>
                                        <SelectItem value="meeting">Reuniones</SelectItem>
                                        <SelectItem value="training">Capacitaciones</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Contenido principal */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Calendario principal */}
                    <div className="lg:col-span-2 space-y-6">
                        {view === 'week' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Vista Semanal</CardTitle>
                                    <CardDescription>Eventos programados para esta semana</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {/* Encabezado de días de la semana */}
                                    <div className="grid grid-cols-7 gap-1 mb-2">
                                        {weekDays.map((day) => (
                                            <div
                                                key={day.date.toString()}
                                                className={`text-center p-2 rounded-lg ${day.isToday ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                                            >
                                                <div className="font-semibold">{day.dayName}</div>
                                                <div className="text-2xl font-bold">{day.dayNumber}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Contenedor de eventos por hora */}
                                    <div className="relative min-h-[600px]">
                                        {/* Líneas de tiempo */}
                                        {Array.from({ length: 12 }, (_, i) => i + 8).map((hour) => (
                                            <div key={hour} className="absolute left-0 right-0 border-t" style={{ top: `${(hour - 8) * 60}px` }}>
                                                <div className="absolute -top-3 left-0 w-12 text-sm text-muted-foreground">
                                                    {hour}:00
                                                </div>
                                            </div>
                                        ))}

                                        {/* Eventos posicionados */}
                                        {getWeekEvents().map((event) => {
                                            const startDate = parseISO(event.startTime)
                                            const endDate = parseISO(event.endTime)
                                            const dayIndex = startDate.getDay() === 0 ? 6 : startDate.getDay() - 1
                                            const startHour = startDate.getHours() + (startDate.getMinutes() / 60)
                                            const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)

                                            return (
                                                <div
                                                    key={event.id}
                                                    className={`absolute rounded-lg border p-2 overflow-hidden ${event.color} cursor-pointer hover:shadow-md transition-shadow`}
                                                    style={{
                                                        left: `${(dayIndex * 100 / 7) + 0.5}%`,
                                                        width: `${100 / 7 - 1}%`,
                                                        top: `${(startHour - 8) * 60}px`,
                                                        height: `${duration * 60}px`
                                                    }}
                                                    onClick={() => setSelectedDate(startDate)}
                                                >
                                                    <div className="flex items-start gap-1">
                                                        {getEventIcon(event.type)}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold text-sm truncate">{event.title}</p>
                                                            <p className="text-xs text-muted-foreground truncate">
                                                                <Clock className="inline h-3 w-3 mr-1" />
                                                                {format(startDate, 'HH:mm')} - {format(endDate, 'HH:mm')}
                                                            </p>
                                                            {event.patient && (
                                                                <p className="text-xs truncate">
                                                                    <User className="inline h-3 w-3 mr-1" />
                                                                    {event.patient}
                                                                </p>
                                                            )}
                                                            <p className="text-xs truncate">
                                                                <MapPin className="inline h-3 w-3 mr-1" />
                                                                {event.location}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Badge className={`absolute top-1 right-1 ${getPriorityColor(event.priority)}`}>
                                                        {event.priority === 'high' ? 'Alta' : event.priority === 'medium' ? 'Media' : 'Baja'}
                                                    </Badge>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {view === 'day' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        Vista Diaria - {format(selectedDate, "EEEE dd 'de' MMMM", { locale: es })}
                                    </CardTitle>
                                    <CardDescription>Eventos programados para hoy</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {getEventsForDate(selectedDate).map((event) => (
                                            <Card key={event.id} className={`${event.color} hover:shadow-md transition-shadow`}>
                                                <CardContent className="p-4">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-start gap-3 flex-1">
                                                            <div className="p-2 rounded-lg bg-white">
                                                                {getEventIcon(event.type)}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <h4 className="font-semibold">{event.title}</h4>
                                                                    {getStatusBadge(event.status)}
                                                                </div>
                                                                <div className="grid gap-1 text-sm">
                                                                    <div className="flex items-center gap-2">
                                                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                                                        <span>
                                                                            {format(parseISO(event.startTime), 'HH:mm')} - {format(parseISO(event.endTime), 'HH:mm')}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                                                        <span>{event.location}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Stethoscope className="h-4 w-4 text-muted-foreground" />
                                                                        <span>{event.doctor} - {event.specialty}</span>
                                                                    </div>
                                                                    {event.patient && (
                                                                        <div className="flex items-center gap-2">
                                                                            <User className="h-4 w-4 text-muted-foreground" />
                                                                            <span>Paciente: {event.patient}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {event.notes && (
                                                                    <p className="mt-2 text-sm text-muted-foreground">
                                                                        <FileText className="inline h-4 w-4 mr-1" />
                                                                        {event.notes}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </div>

                                                    {event.participants && event.participants.length > 0 && (
                                                        <div className="mt-3 pt-3 border-t">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Users className="h-4 w-4 text-muted-foreground" />
                                                                <span className="text-sm font-medium">Participantes:</span>
                                                            </div>
                                                            <div className="flex flex-wrap gap-2">
                                                                {event.participants.map((participant, idx) => (
                                                                    <Badge key={idx} variant="outline" className="text-xs">
                                                                        {participant}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {view === 'month' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        Vista Mensual - {format(currentDate, 'MMMM yyyy', { locale: es })}
                                    </CardTitle>
                                    <CardDescription>Eventos programados para el mes</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <CalendarComponent
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={(date) => date && setSelectedDate(date)}
                                        className="rounded-md border"
                                        locale={es}
                                        modifiers={{
                                            hasEvents: (date) => getEventsForDate(date).length > 0
                                        }}
                                        modifiersClassNames={{
                                            hasEvents: "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-primary"
                                        }}
                                    />

                                    <div className="mt-6">
                                        <h4 className="font-semibold mb-3">Eventos del {format(selectedDate, 'dd/MM/yyyy')}</h4>
                                        <ScrollArea className="h-64">
                                            <div className="space-y-3">
                                                {getEventsForDate(selectedDate).map((event) => (
                                                    <div key={event.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50">
                                                        <div className={`p-2 rounded-full ${event.color.replace('100', '200')}`}>
                                                            {getEventIcon(event.type)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-sm truncate">{event.title}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {format(parseISO(event.startTime), 'HH:mm')} • {event.location}
                                                            </p>
                                                        </div>
                                                        {getStatusBadge(event.status)}
                                                    </div>
                                                ))}
                                                {getEventsForDate(selectedDate).length === 0 && (
                                                    <p className="text-center text-muted-foreground py-8">
                                                        No hay eventos programados para esta fecha
                                                    </p>
                                                )}
                                            </div>
                                        </ScrollArea>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Actividades del día */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Bell className="h-5 w-5" />
                                    Actividades del Día
                                </CardTitle>
                                <CardDescription>Actividades generales y rutinas hospitalarias</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {todayActivities.map((activity, index) => (
                                        <div key={index} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                                            <div className="flex-shrink-0 w-16 text-center">
                                                <div className="font-bold text-primary">{activity.time}</div>
                                                <Badge variant="outline" className="text-xs mt-1 capitalize">
                                                    {activity.type === 'round' && 'Ronda'}
                                                    {activity.type === 'medication' && 'Medicación'}
                                                    {activity.type === 'cleaning' && 'Limpieza'}
                                                    {activity.type === 'visit' && 'Visita'}
                                                    {activity.type === 'therapy' && 'Terapia'}
                                                    {activity.type === 'shift' && 'Turno'}
                                                </Badge>
                                            </div>
                                            <Separator orientation="vertical" className="h-12" />
                                            <div className="flex-1">
                                                <p className="font-medium">{activity.activity}</p>
                                                <p className="text-sm text-muted-foreground">Responsable: {activity.staff}</p>
                                            </div>
                                            <Button variant="ghost" size="sm">Unirse</Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Calendario mini */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Calendario</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CalendarComponent
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={(date) => date && setSelectedDate(date)}
                                    className="rounded-md border"
                                    locale={es}
                                />

                                <div className="mt-4 space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <span>Cirugías</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                        <span>Consultas</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                        <span>Telemedicina</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                        <span>Reuniones</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Personal disponible */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Personal Disponible
                                </CardTitle>
                                <CardDescription>Staff médico en servicio</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {availableStaff.map((staff) => (
                                        <div key={staff.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarFallback className={`
                            ${staff.status === 'available' ? 'bg-green-100 text-green-800' :
                                                            staff.status === 'busy' ? 'bg-red-100 text-red-800' :
                                                                staff.status === 'away' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-gray-100 text-gray-800'}
                          `}>
                                                        {staff.avatar}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-sm">{staff.name}</p>
                                                    <p className="text-xs text-muted-foreground">{staff.role}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${staff.status === 'available' ? 'bg-green-500' :
                                                    staff.status === 'busy' ? 'bg-red-500' :
                                                        staff.status === 'away' ? 'bg-yellow-500' :
                                                            'bg-gray-500'
                                                    }`} />
                                                <span className="text-xs capitalize">
                                                    {staff.status === 'available' ? 'Disponible' :
                                                        staff.status === 'busy' ? 'Ocupado' :
                                                            staff.status === 'away' ? 'Ausente' : 'Offline'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button variant="outline" size="sm" className="w-full gap-2">
                                    <MessageSquare className="h-4 w-4" />
                                    Chat Grupal
                                </Button>
                            </CardFooter>
                        </Card>

                        {/* Estadísticas rápidas */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Estadísticas del Día</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 rounded-lg bg-red-100">
                                            <Slice className="h-4 w-4 text-red-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold">3</p>
                                            <p className="text-xs text-muted-foreground">Cirugías</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 rounded-lg bg-blue-100">
                                            <Stethoscope className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold">12</p>
                                            <p className="text-xs text-muted-foreground">Consultas</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 rounded-lg bg-green-100">
                                            <Video className="h-4 w-4 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold">5</p>
                                            <p className="text-xs text-muted-foreground">Teleconsultas</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 rounded-lg bg-purple-100">
                                            <Bed className="h-4 w-4 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold">2</p>
                                            <p className="text-xs text-muted-foreground">Altas</p>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Ocupación camas:</span>
                                        <span className="font-semibold">85%</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-primary w-4/5"></div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Acciones rápidas */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Acciones Rápidas</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button variant="outline" size="sm" className="h-auto py-3 flex-col gap-2">
                                        <Phone className="h-5 w-5" />
                                        <span>Llamar Guardia</span>
                                    </Button>
                                    <Button variant="outline" size="sm" className="h-auto py-3 flex-col gap-2">
                                        <Video className="h-5 w-5" />
                                        <span>Iniciar Videollamada</span>
                                    </Button>
                                    <Button variant="outline" size="sm" className="h-auto py-3 flex-col gap-2">
                                        <Bell className="h-5 w-5" />
                                        <span>Recordatorios</span>
                                    </Button>
                                    <Button variant="outline" size="sm" className="h-auto py-3 flex-col gap-2">
                                        <FileText className="h-5 w-5" />
                                        <span>Reportes</span>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}