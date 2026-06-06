"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
    Search,
    Plus,
    Phone,
    Mail,
    Building,
    User,
    MoreVertical,
    Edit,
    Trash2,
    Copy,
    MessageSquare,
    Download,
    Upload,
    Contact
} from "lucide-react"

export default function ContactsPage() {
    const [searchQuery, setSearchQuery] = useState("")

    // Mock data - Contactos médicos simplificados
    const contacts = [
        {
            id: "1",
            name: "Dr. Juan González",
            title: "Cirujano General",
            phone: "+502 5555-1234",
            mobile: "+502 5555-5678",
            email: "jgonzalez@hospital.gt",
            department: "Cirugía",
            notes: "Especialista en cirugía laparoscópica"
        },
        {
            id: "2",
            name: "Seguros GYT",
            title: "Compañía de Seguros",
            phone: "+502 5555-9999",
            mobile: null,
            email: "contacto@segurosgyt.com",
            department: "Atención al Cliente",
            notes: "Póliza médica institucional"
        },
        {
            id: "3",
            name: "Mantenimiento XYZ",
            title: "Servicios de Mantenimiento",
            phone: "+502 5555-7777",
            mobile: "+502 5555-8888",
            email: "servicio@mantenimientoxyz.com",
            department: "Servicio Técnico",
            notes: "Mantenimiento de equipos médicos"
        },
        {
            id: "4",
            name: "Dra. Sofía Ramírez",
            title: "Cardióloga",
            phone: "+502 5555-4321",
            mobile: "+502 5555-8765",
            email: "sramirez@hospital.gt",
            department: "Cardiología",
            notes: "Especialista en arritmias"
        },
        {
            id: "5",
            name: "Laboratorio Clínico ABC",
            title: "Laboratorio de Análisis",
            phone: "+502 5555-1111",
            mobile: null,
            email: "muestras@lababc.com",
            department: "Recepción de Muestras",
            notes: "Resultados en 24 horas"
        },
        {
            id: "6",
            name: "Farmacia del Hospital",
            title: "Farmacia Interna",
            phone: "Ext. 200",
            mobile: null,
            email: "farmacia@hospital.gt",
            department: "Farmacia",
            notes: "Horario: 24/7"
        },
        {
            id: "7",
            name: "Ambulancias Rápidas",
            title: "Servicio de Ambulancias",
            phone: "+502 5555-2222",
            mobile: "+502 5555-3333",
            email: "despacho@ambulanciasrapidas.com",
            department: "Despacho",
            notes: "Tiempo de respuesta: 15 minutos"
        },
        {
            id: "8",
            name: "Contabilidad Hospital",
            title: "Departamento de Contabilidad",
            phone: "Ext. 300",
            mobile: null,
            email: "contabilidad@hospital.gt",
            department: "Contabilidad",
            notes: "Facturación, nóminas y proveedores"
        },
        {
            id: "9",
            name: "Proveedor de Insumos Médicos",
            title: "Suministros Hospitalarios",
            phone: "+502 5555-4444",
            mobile: "+502 5555-5555",
            email: "ventas@insumosmedicos.com",
            department: "Ventas",
            notes: "Entrega en 24 horas"
        },
        {
            id: "10",
            name: "Lic. Ana Martínez",
            title: "Trabajadora Social",
            phone: "Ext. 150",
            mobile: "+502 5555-6666",
            email: "trabajosocial@hospital.gt",
            department: "Trabajo Social",
            notes: "Apoyo a pacientes y familias"
        },
        {
            id: "11",
            name: "Ministerio de Salud",
            title: "Entidad Gubernamental",
            phone: "+502 5555-0000",
            mobile: null,
            email: "contacto@minsalud.gob.gt",
            department: "Atención Ciudadana",
            notes: "Reportes epidemiológicos, licencias"
        },
        {
            id: "12",
            name: "Enfermería Central",
            title: "Enfermería de Guardia",
            phone: "Ext. 100",
            mobile: null,
            email: "enfermeria@hospital.gt",
            department: "Enfermería",
            notes: "Coordinación de turnos"
        },
        {
            id: "13",
            name: "Dr. Carlos Mendoza",
            title: "Pediatra",
            phone: "+502 5555-1122",
            mobile: "+502 5555-3344",
            email: "cmendoza@hospital.gt",
            department: "Pediatría",
            notes: "Especialista en neonatología"
        },
        {
            id: "14",
            name: "Servicio de Limpieza",
            title: "Aseo Hospitalario",
            phone: "Ext. 400",
            mobile: null,
            email: "limpieza@hospital.gt",
            department: "Mantenimiento",
            notes: "Limpieza áreas críticas"
        },
        {
            id: "15",
            name: "Banco de Sangre",
            title: "Donación de Sangre",
            phone: "+502 5555-5566",
            mobile: null,
            email: "bancosangre@hospital.gt",
            department: "Hemoterapia",
            notes: "Donaciones y reservas"
        }
    ]

    // Nuevo contacto
    const [newContact, setNewContact] = useState({
        name: "",
        title: "",
        phone: "",
        mobile: "",
        email: "",
        department: "",
        notes: ""
    })

    const [selectedContact, setSelectedContact] = useState<any>(null)

    // Filtrar contactos
    const filteredContacts = contacts.filter(contact => {
        return (
            contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contact.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contact.phone?.includes(searchQuery) ||
            contact.mobile?.includes(searchQuery) ||
            contact.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contact.notes?.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })

    const handleCreateContact = () => {
        // Aquí iría la lógica para guardar en el backend
    }

    const handleCopyPhone = (phone: string) => {
        navigator.clipboard.writeText(phone)
        // Podrías agregar un toast de confirmación aquí
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Agenda de Contactos</h1>
                        <p className="text-muted-foreground">
                            Contactos importantes del hospital y proveedores
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
                                    Nuevo Contacto
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Agregar Nuevo Contacto</DialogTitle>
                                    <DialogDescription>
                                        Complete la información del contacto
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-6">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="contact-name">Nombre *</Label>
                                            <Input
                                                id="contact-name"
                                                placeholder="Ej: Dr. Juan González"
                                                value={newContact.name}
                                                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="contact-title">Título / Cargo</Label>
                                            <Input
                                                id="contact-title"
                                                placeholder="Ej: Cirujano General"
                                                value={newContact.title}
                                                onChange={(e) => setNewContact({ ...newContact, title: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="contact-phone">Teléfono Fijo</Label>
                                            <Input
                                                id="contact-phone"
                                                placeholder="+502 5555-1234 o Ext. 100"
                                                value={newContact.phone}
                                                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="contact-mobile">Teléfono Móvil</Label>
                                            <Input
                                                id="contact-mobile"
                                                placeholder="+502 5555-5678"
                                                value={newContact.mobile}
                                                onChange={(e) => setNewContact({ ...newContact, mobile: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="contact-email">Email</Label>
                                            <Input
                                                id="contact-email"
                                                type="email"
                                                placeholder="contacto@ejemplo.com"
                                                value={newContact.email}
                                                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="contact-department">Departamento / Área</Label>
                                            <Input
                                                id="contact-department"
                                                placeholder="Ej: Cirugía, Mantenimiento"
                                                value={newContact.department}
                                                onChange={(e) => setNewContact({ ...newContact, department: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="contact-notes">Notas</Label>
                                        <Textarea
                                            id="contact-notes"
                                            placeholder="Información adicional, horarios, etc."
                                            value={newContact.notes}
                                            onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                                            rows={3}
                                        />
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button variant="outline">Cancelar</Button>
                                    <Button onClick={handleCreateContact}>Guardar Contacto</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Barra de búsqueda grande */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar contactos por nombre, teléfono, email, departamento o notas..."
                                    className="pl-12 py-6 text-base"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <span className="text-sm text-muted-foreground whitespace-nowrap">
                                    {filteredContacts.length} contactos
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabla de contactos - Vista compacta */}
                <Card>
                    <CardHeader>
                        <CardTitle>Lista de Contactos</CardTitle>
                        <CardDescription>
                            Todos los contactos disponibles en el sistema
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {filteredContacts.length === 0 ? (
                            <div className="text-center py-12">
                                <Contact className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="font-semibold text-lg mb-2">No se encontraron contactos</h3>
                                <p className="text-muted-foreground mb-4">
                                    {searchQuery
                                        ? `No hay resultados para "${searchQuery}"`
                                        : "No hay contactos en el sistema"}
                                </p>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button className="gap-2">
                                            <Plus className="h-4 w-4" />
                                            Agregar Primer Contacto
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl">
                                        <DialogHeader>
                                            <DialogTitle>Agregar Nuevo Contacto</DialogTitle>
                                        </DialogHeader>
                                        {/* Formulario de nuevo contacto - igual al anterior */}
                                    </DialogContent>
                                </Dialog>
                            </div>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[250px]">Nombre / Cargo</TableHead>
                                            <TableHead className="w-[180px]">Teléfonos</TableHead>
                                            <TableHead className="w-[200px]">Email</TableHead>
                                            <TableHead className="w-[150px]">Departamento</TableHead>
                                            <TableHead>Notas</TableHead>
                                            <TableHead className="w-[80px] text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredContacts.map((contact) => (
                                            <TableRow key={contact.id} className="hover:bg-muted/50">
                                                <TableCell>
                                                    <div className="font-medium">{contact.name}</div>
                                                    <div className="text-sm text-muted-foreground">{contact.title}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        {contact.phone && (
                                                            <div className="flex items-center gap-2">
                                                                <Phone className="h-3 w-3 text-muted-foreground" />
                                                                <div className="flex items-center gap-1">
                                                                    <a
                                                                        href={`tel:${contact.phone}`}
                                                                        className="hover:text-primary hover:underline"
                                                                    >
                                                                        {contact.phone}
                                                                    </a>
                                                                    {contact.phone.includes("Ext.") && (
                                                                        <Badge variant="outline" className="text-xs ml-1">Ext</Badge>
                                                                    )}
                                                                </div>
                                                                <button
                                                                    onClick={() => handleCopyPhone(contact.phone)}
                                                                    className="text-muted-foreground hover:text-primary"
                                                                    title="Copiar número"
                                                                >
                                                                    <Copy className="h-3 w-3" />
                                                                </button>
                                                            </div>
                                                        )}
                                                        {contact.mobile && (
                                                            <div className="flex items-center gap-2">
                                                                <Phone className="h-3 w-3 text-muted-foreground" />
                                                                <div className="flex items-center gap-1">
                                                                    <a
                                                                        href={`tel:${contact.mobile}`}
                                                                        className="hover:text-primary hover:underline"
                                                                    >
                                                                        {contact.mobile}
                                                                    </a>
                                                                    <Badge variant="secondary" className="text-xs ml-1">Móvil</Badge>
                                                                </div>
                                                                <button
                                                                    onClick={() => handleCopyPhone(contact.mobile)}
                                                                    className="text-muted-foreground hover:text-primary"
                                                                    title="Copiar número"
                                                                >
                                                                    <Copy className="h-3 w-3" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {contact.email ? (
                                                        <div className="flex items-center gap-2">
                                                            <Mail className="h-3 w-3 text-muted-foreground" />
                                                            <a
                                                                href={`mailto:${contact.email}`}
                                                                className="hover:text-primary hover:underline truncate"
                                                                title={contact.email}
                                                            >
                                                                {contact.email}
                                                            </a>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground text-sm">—</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Building className="h-3 w-3 text-muted-foreground" />
                                                        <span className="truncate" title={contact.department}>
                                                            {contact.department || "—"}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="max-w-[300px]">
                                                        <span className="text-sm line-clamp-2" title={contact.notes}>
                                                            {contact.notes || "—"}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm" title="Llamar">
                                                            <Phone className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" title="Mensaje">
                                                            <MessageSquare className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}