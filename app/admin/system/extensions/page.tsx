"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
    Brain,
    MessageSquare,
    Phone,
    Globe,
    Bot,
    Zap,
    Shield,
    BarChart3,
    Video,
    Stethoscope,
    Pill,
    Calendar,
    Wallet,
    Cloud,
    Cpu,
    Wifi,
    CheckCircle2,
    AlertCircle,
    ExternalLink,
    Settings,
    CreditCard,
    Users,
    FileText,
    Smartphone,
    Mail
} from "lucide-react"

export default function ExtensionsPage() {
    const [extensions, setExtensions] = useState({
        ai: [
            {
                id: "ai-1",
                name: "Asistente de IA para Diagnóstico",
                description: "Sugerencias de diagnóstico basadas en síntomas usando IA médica",
                icon: Brain,
                category: "Inteligencia Artificial",
                status: "inactive",
                license: "premium",
                price: "$199/mes",
                requiresSetup: true,
                features: ["Análisis de síntomas", "Historial de diagnósticos", "Integración con expedientes"],
                docsUrl: "https://docs.example.com/ai-diagnostico"
            },
            {
                id: "ai-2",
                name: "Chatbot Médico 24/7",
                description: "Asistente virtual para preguntas frecuentes y triaje inicial",
                icon: Bot,
                category: "Inteligencia Artificial",
                status: "active",
                license: "premium",
                price: "$149/mes",
                requiresSetup: false,
                features: ["Respuestas automáticas", "Triaje básico", "Multilenguaje"],
                docsUrl: "https://docs.example.com/chatbot-medico"
            },
            {
                id: "ai-3",
                name: "Transcripción Médica por IA",
                description: "Convierte audio de consultas a texto estructurado automáticamente",
                icon: MessageSquare,
                category: "Inteligencia Artificial",
                status: "inactive",
                license: "enterprise",
                price: "$299/mes",
                requiresSetup: true,
                features: ["Transcripción en tiempo real", "Estructuración de notas", "Soporte múltiples idiomas"],
                docsUrl: "https://docs.example.com/transcripcion-ia"
            }
        ],
        automation: [
            {
                id: "auto-1",
                name: "n8n Workflows Médicos",
                description: "Automatización de flujos de trabajo con n8n (llamadas, recordatorios, etc.)",
                icon: Zap,
                category: "Automatización",
                status: "inactive",
                license: "premium",
                price: "$99/mes",
                requiresSetup: true,
                features: ["Flujos pre-configurados", "Integración con APIs", "Editor visual"],
                docsUrl: "https://docs.example.com/n8n-medico",
                connected: false
            },
            {
                id: "auto-2",
                name: "Operador de IA para Llamadas",
                description: "Atiende y agenda citas por teléfono automáticamente",
                icon: Phone,
                category: "Automatización",
                status: "inactive",
                license: "enterprise",
                price: "$399/mes",
                requiresSetup: true,
                features: ["Reconocimiento de voz", "Agendamiento automático", "Integración telefónica"],
                docsUrl: "https://docs.example.com/operador-ia"
            },
            {
                id: "auto-3",
                name: "Automatización de Recetas",
                description: "Generación y envío automático de recetas médicas",
                icon: Pill,
                category: "Automatización",
                status: "active",
                license: "premium",
                price: "$79/mes",
                requiresSetup: false,
                features: ["Plantillas inteligentes", "Envío a farmacias", "Control de inventario"],
                docsUrl: "https://docs.example.com/automatizacion-recetas"
            }
        ],
        marketing: [
            {
                id: "mkt-1",
                name: "Landing Page Médica",
                description: "Página de captación de pacientes con formularios inteligentes",
                icon: Globe,
                category: "Marketing",
                status: "inactive",
                license: "basic",
                price: "$49/mes",
                requiresSetup: true,
                features: ["Plantillas médicas", "SEO optimizado", "Integración de citas"],
                docsUrl: "https://docs.example.com/landing-medica"
            },
            {
                id: "mkt-2",
                name: "Recordatorios Multicanales",
                description: "Envía recordatorios por SMS, WhatsApp y Email",
                icon: Smartphone,
                category: "Marketing",
                status: "active",
                license: "premium",
                price: "$89/mes",
                requiresSetup: false,
                features: ["Programación automática", "Plantillas personalizables", "Analytics"],
                docsUrl: "https://docs.example.com/recordatorios"
            },
            {
                id: "mkt-3",
                name: "Email Marketing Médico",
                description: "Campañas de email automatizadas para pacientes",
                icon: Mail,
                category: "Marketing",
                status: "inactive",
                license: "premium",
                price: "$69/mes",
                requiresSetup: true,
                features: ["Segmentación de pacientes", "Plantillas médicas", "Analytics avanzado"],
                docsUrl: "https://docs.example.com/email-marketing"
            }
        ],
        integrations: [
            {
                id: "int-1",
                name: "Telemedicina HD",
                description: "Consultas virtuales con video HD y herramientas colaborativas",
                icon: Video,
                category: "Integraciones",
                status: "active",
                license: "premium",
                price: "$129/mes",
                requiresSetup: false,
                features: ["Video HD", "Pantalla compartida", "Grabación de sesiones"],
                docsUrl: "https://docs.example.com/telemedicina"
            },
            {
                id: "int-2",
                name: "Pagos en Línea",
                description: "Procesamiento de pagos con múltiples métodos",
                icon: CreditCard,
                category: "Integraciones",
                status: "inactive",
                license: "enterprise",
                price: "$199/mes + comisión",
                requiresSetup: true,
                features: ["Múltiples pasarelas", "Facturación electrónica", "Reportes financieros"],
                docsUrl: "https://docs.example.com/pagos-online"
            },
            {
                id: "int-3",
                name: "Historial Clínico Interoperable",
                description: "Intercambio seguro de historiales entre instituciones",
                icon: FileText,
                category: "Integraciones",
                status: "inactive",
                license: "enterprise",
                price: "$249/mes",
                requiresSetup: true,
                features: ["Estándares HL7/FHIR", "Encriptación end-to-end", "API abierta"],
                docsUrl: "https://docs.example.com/historial-interoperable"
            }
        ]
    })

    const [selectedExtension, setSelectedExtension] = useState<any>(null)
    const [setupProgress, setSetupProgress] = useState<Record<string, number>>({})

    const toggleExtension = (category: keyof typeof extensions, id: string) => {
        setExtensions(prev => ({
            ...prev,
            [category]: prev[category].map(ext =>
                ext.id === id ? { ...ext, status: ext.status === 'active' ? 'inactive' : 'active' } : ext
            )
        }))

        // Si se activa y requiere setup, mostrar modal
        const extension = extensions[category].find(ext => ext.id === id)
        if (extension?.status === 'inactive' && extension.requiresSetup) {
            setSelectedExtension(extension)
        }
    }

    const startSetup = (extensionId: string) => {
        // Simular progreso de setup
        setSetupProgress(prev => ({ ...prev, [extensionId]: 10 }))

        const interval = setInterval(() => {
            setSetupProgress(prev => {
                const newProgress = (prev[extensionId] || 0) + 30
                if (newProgress >= 100) {
                    clearInterval(interval)
                    return { ...prev, [extensionId]: 100 }
                }
                return { ...prev, [extensionId]: newProgress }
            })
        }, 1000)
    }

    const ExtensionCard = ({ extension, category }: { extension: any, category: string }) => {
        const Icon = extension.icon
        const isActive = extension.status === 'active'
        const isPremium = extension.license === 'premium' || extension.license === 'enterprise'
        const progress = setupProgress[extension.id] || 0

        return (
            <Card className={`hover:shadow-lg transition-all ${isActive ? 'border-primary/20' : ''}`}>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isActive ? 'bg-primary/10' : 'bg-muted'}`}>
                                <Icon className={`h-6 w-6 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                            </div>
                            <div>
                                <CardTitle className="text-lg">{extension.name}</CardTitle>
                                <CardDescription>{extension.category}</CardDescription>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <Badge variant={isPremium ? "default" : "outline"} className="capitalize">
                                {extension.license}
                            </Badge>
                            <span className="text-sm font-semibold">{extension.price}</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{extension.description}</p>

                    <div className="space-y-2 mb-4">
                        <h4 className="text-sm font-medium">Características:</h4>
                        <div className="flex flex-wrap gap-2">
                            {extension.features.slice(0, 3).map((feature: string, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                    {feature}
                                </Badge>
                            ))}
                            {extension.features.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                    +{extension.features.length - 3} más
                                </Badge>
                            )}
                        </div>
                    </div>

                    {progress > 0 && progress < 100 && (
                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                                <span>Configurando...</span>
                                <span>{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-between">
                    <div className="flex items-center gap-2">
                        <Switch
                            checked={isActive}
                            onCheckedChange={() => toggleExtension(category as keyof typeof extensions, extension.id)}
                            disabled={progress > 0 && progress < 100}
                        />
                        <span className="text-sm">{isActive ? 'Activado' : 'Inactivo'}</span>
                    </div>

                    <div className="flex gap-2">
                        {extension.requiresSetup && !isActive && (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="gap-1">
                                        <Settings className="h-3 w-3" />
                                        Configurar
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Configurar {extension.name}</DialogTitle>
                                        <DialogDescription>
                                            Esta extensión requiere configuración adicional. Se aplicará un cargo adicional a su factura.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="rounded-lg border p-4">
                                            <h4 className="font-medium mb-2">Requisitos:</h4>
                                            <ul className="space-y-2 text-sm">
                                                <li className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                    Cuenta de administrador
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                    Acceso a API del sistema
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <AlertCircle className="h-4 w-4 text-amber-500" />
                                                    Aprobación de facturación ({extension.price})
                                                </li>
                                            </ul>
                                        </div>

                                        <div className="text-sm text-muted-foreground">
                                            <p className="font-medium mb-1">⚠️ Importante:</p>
                                            <p>Al activar esta extensión, se agregará un cargo recurrente a su factura mensual. El equipo de soporte contactará para la implementación.</p>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline">Cancelar</Button>
                                        <Button onClick={() => {
                                            startSetup(extension.id)
                                            toggleExtension(category as keyof typeof extensions, extension.id)
                                        }}>
                                            Activar y Configurar
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}

                        <Button variant="ghost" size="sm" className="gap-1" asChild>
                            <a href={extension.docsUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3" />
                                Docs
                            </a>
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        )
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Extensiones & Servicios</h1>
                    <p className="text-muted-foreground">Amplíe las funcionalidades de su sistema con módulos adicionales</p>
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Extensiones Activas</p>
                                    <p className="text-2xl font-bold">4</p>
                                </div>
                                <Zap className="h-8 w-8 text-primary/60" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Costo Mensual</p>
                                    <p className="text-2xl font-bold">$446</p>
                                </div>
                                <CreditCard className="h-8 w-8 text-primary/60" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">En Configuración</p>
                                    <p className="text-2xl font-bold">1</p>
                                </div>
                                <Settings className="h-8 w-8 text-primary/60" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Disponibles</p>
                                    <p className="text-2xl font-bold">12</p>
                                </div>
                                <Cloud className="h-8 w-8 text-primary/60" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Info Banner */}
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                        <div className="flex-1">
                            <p className="font-medium">⚠️ Importante sobre las extensiones</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Las extensiones marcadas como "Requiere Configuración" necesitan intervención del equipo técnico.
                                Se contactará al administrador para coordinar la implementación. Los costos adicionales se reflejarán en su próxima factura.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tabs de categorías */}
                <Tabs defaultValue="ai" className="space-y-6">
                    <TabsList className="w-full justify-start overflow-x-auto">
                        <TabsTrigger value="ai" className="gap-2">
                            <Brain className="h-4 w-4" />
                            Inteligencia Artificial
                        </TabsTrigger>
                        <TabsTrigger value="automation" className="gap-2">
                            <Zap className="h-4 w-4" />
                            Automatización
                        </TabsTrigger>
                        <TabsTrigger value="marketing" className="gap-2">
                            <Globe className="h-4 w-4" />
                            Marketing
                        </TabsTrigger>
                        <TabsTrigger value="integrations" className="gap-2">
                            <Cpu className="h-4 w-4" />
                            Integraciones
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="ai">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {extensions.ai.map(extension => (
                                <ExtensionCard key={extension.id} extension={extension} category="ai" />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="automation">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {extensions.automation.map(extension => (
                                <ExtensionCard key={extension.id} extension={extension} category="automation" />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="marketing">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {extensions.marketing.map(extension => (
                                <ExtensionCard key={extension.id} extension={extension} category="marketing" />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="integrations">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {extensions.integrations.map(extension => (
                                <ExtensionCard key={extension.id} extension={extension} category="integrations" />
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Sección de Licencias */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Planes de Licencia
                        </CardTitle>
                        <CardDescription>Actualice su plan para acceder a más funcionalidades</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-3">
                            <Card className="border-2">
                                <CardHeader>
                                    <CardTitle>Básico</CardTitle>
                                    <CardDescription>Funcionalidades esenciales</CardDescription>
                                    <div className="text-3xl font-bold">$0<span className="text-sm text-muted-foreground font-normal">/mes</span></div>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                            <span>ERP Médico Base</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                            <span>Facturación Básica</span>
                                        </li>
                                        <li className="flex items-center gap-2 text-muted-foreground">
                                            <CheckCircle2 className="h-4 w-4" />
                                            <span>Extensiones Limitadas</span>
                                        </li>
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    <Button className="w-full" variant="outline" disabled>
                                        Actual
                                    </Button>
                                </CardFooter>
                            </Card>

                            <Card className="border-2 border-primary">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle>Premium</CardTitle>
                                            <CardDescription>Para clínicas en crecimiento</CardDescription>
                                        </div>
                                        <Badge variant="default">Recomendado</Badge>
                                    </div>
                                    <div className="text-3xl font-bold">$199<span className="text-sm text-muted-foreground font-normal">/mes</span></div>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                            <span>Todas las funcionalidades Base</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                            <span>+15 Extensiones Premium</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                            <span>Soporte Prioritario</span>
                                        </li>
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    <Button className="w-full">
                                        Actualizar a Premium
                                    </Button>
                                </CardFooter>
                            </Card>

                            <Card className="border-2">
                                <CardHeader>
                                    <CardTitle>Enterprise</CardTitle>
                                    <CardDescription>Para hospitales grandes</CardDescription>
                                    <div className="text-3xl font-bold">$499<span className="text-sm text-muted-foreground font-normal">/mes</span></div>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                            <span>Todas las Extensiones</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                            <span>Personalización Total</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                            <span>Soporte 24/7 Dedicado</span>
                                        </li>
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    <Button className="w-full" variant="outline">
                                        Contactar Ventas
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </CardContent>
                </Card>

                {/* Solicitar nueva extensión */}
                <Card>
                    <CardHeader>
                        <CardTitle>¿Necesita algo específico?</CardTitle>
                        <CardDescription>Podemos desarrollar extensiones personalizadas para su hospital</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-lg border p-4">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                    <Users className="h-6 w-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium">Desarrollo Personalizado</p>
                                    <p className="text-sm text-muted-foreground">
                                        ¿Necesita una extensión que no está en nuestro catálogo? Nuestro equipo puede desarrollarla para usted.
                                    </p>
                                </div>
                                <Button>Contactar Desarrollo</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}