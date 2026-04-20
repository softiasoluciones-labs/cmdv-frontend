"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
    Eye,
    EyeOff,
    LogIn,
    Lock,
    User,
    Building,
    Heart,
    Shield,
    Smartphone,
    Mail,
    AlertCircle,
    BadgeCheck,
    Loader2,
    Sparkles,
    Fingerprint,
    Clock,
    Award
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/hooks/auth-hooks/use-auth"
import { ApiError } from "@/lib/api"

const loginSchema = z.object({
    email: z
        .string()
        .min(1, "El correo es obligatorio")
        .email("Ingresa un correo válido")
        .max(254, "Correo demasiado largo"),
    password: z
        .string()
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .max(128, "Contraseña demasiado larga"),
})

type LoginFormValues = z.infer<typeof loginSchema>

function scorePassword(value: string): { score: number; label: string; tone: string } {
    if (!value) return { score: 0, label: "", tone: "text-muted-foreground" }
    let score = 0
    if (value.length >= 8) score += 25
    if (value.length >= 12) score += 15
    if (/[A-Z]/.test(value)) score += 15
    if (/[a-z]/.test(value)) score += 10
    if (/[0-9]/.test(value)) score += 15
    if (/[^A-Za-z0-9]/.test(value)) score += 20
    score = Math.min(score, 100)
    if (score < 50) return { score, label: "Débil", tone: "text-amber-400" }
    if (score < 80) return { score, label: "Media", tone: "text-cyan-400" }
    return { score, label: "Fuerte", tone: "text-emerald-400" }
}

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const { login } = useAuth()
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        mode: "onBlur",
        defaultValues: { email: "", password: "" },
    })

    const password = watch("password")
    const strength = scorePassword(password)
    const isLoading = isSubmitting

    const onSubmit = async (values: LoginFormValues) => {
        setError(null)
        try {
            await login(values)
        } catch (err) {
            const errorMessage = err instanceof ApiError
                ? err.message
                : "Error al iniciar sesión. Por favor, intenta de nuevo."
            setError(errorMessage)
        }
    }

    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-purple-50">
            {/* Fondo con efecto glassmorphism de capas - más sutil para fondo claro */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='rgba(0,0,0,0.03)' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E')] opacity-50"></div>
            
            {/* Elementos decorativos flotantes estilo glassmorphism */}
            <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-purple-500/5 blur-3xl"></div>

            {/* Header con efecto glass */}
            <header className="relative z-10">
                <div className="container mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-2xl blur-lg opacity-30"></div>
                                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 backdrop-blur-sm border border-cyan-500/20">
                                    <Heart className="h-6 w-6 text-cyan-600" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">
                                    Medical
                                </h1>
                                <p className="text-xs text-cyan-600">Sistema Hospitalario</p>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white shadow-sm border border-gray-200">
                                <Sparkles className="h-3 w-3 text-cyan-500" />
                                <span className="text-gray-600">Versión 2.5.1</span>
                            </div>
                            <Separator orientation="vertical" className="h-4 bg-gray-300" />
                            <span className="text-gray-600 hover:text-gray-800 transition-colors cursor-pointer">
                                Soporte técnico
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="relative z-10 container mx-auto flex min-h-screen items-center justify-center px-4 pt-20 pb-32">
                <div className="grid w-full max-w-6xl grid-cols-1 gap-10 lg:grid-cols-2">
                    {/* Lado izquierdo: Información y bienvenida - Estilo glass refinado para fondo claro */}
                    <div className="flex flex-col justify-center space-y-8">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 backdrop-blur-sm border border-cyan-500/20 px-4 py-2 text-sm font-medium">
                                <BadgeCheck className="h-4 w-4 text-cyan-600" />
                                <span className="bg-gradient-to-r from-cyan-600 to-emerald-600 bg-clip-text text-transparent">
                                    Sistema Certificado HIPAA
                                </span>
                            </div>
                            <h2 className="text-5xl font-bold tracking-tight lg:text-6xl">
                                <span className="text-gray-800">
                                    Acceso Seguro al
                                </span>
                                <br />
                                <span className="bg-gradient-to-r from-cyan-600 via-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                                    Sistema Médico
                                </span>
                            </h2>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                Gestión integral de pacientes, historiales clínicos y operaciones hospitalarias
                            </p>
                        </div>

                        {/* Tarjetas de características con efecto glass */}
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { icon: User, label: "Personal Médico", desc: "Doctores y enfermeras", color: "cyan" },
                                { icon: Building, label: "Administración", desc: "Gestión y facturación", color: "emerald" },
                                { icon: Shield, label: "Seguridad", desc: "Datos encriptados", color: "purple" },
                                { icon: Smartphone, label: "Acceso Móvil", desc: "Disponible 24/7", color: "orange" }
                            ].map((item, idx) => (
                                <div key={idx} className="group relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <div className="relative flex items-center gap-3 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm p-4 hover:border-cyan-300 hover:shadow-md transition-all duration-300">
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-${item.color}-100 to-${item.color}-50 border border-${item.color}-200`}>
                                            <item.icon className={`h-5 w-5 text-${item.color}-600`} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800 text-sm">{item.label}</h3>
                                            <p className="text-xs text-gray-500">{item.desc}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Estadísticas con efecto vidrio premium */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-emerald-500/5 rounded-3xl blur-xl"></div>
                            <div className="relative rounded-3xl bg-white/80 backdrop-blur-md border border-gray-200 shadow-sm p-8">
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="text-center space-y-2">
                                        <div className="flex items-center justify-center gap-1">
                                            <Clock className="h-5 w-5 text-cyan-600" />
                                            <div className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-emerald-600 bg-clip-text text-transparent">
                                                24/7
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-600">Disponibilidad</div>
                                    </div>
                                    <div className="text-center space-y-2">
                                        <div className="flex items-center justify-center gap-1">
                                            <Award className="h-5 w-5 text-emerald-600" />
                                            <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                                                99.9%
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-600">Uptime</div>
                                    </div>
                                    <div className="text-center space-y-2">
                                        <div className="flex items-center justify-center gap-1">
                                            <Shield className="h-5 w-5 text-purple-600" />
                                            <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                                                AES-256
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-600">Encriptación</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Lado derecho: Formulario de login - ¡CORREGIDO! Fondo oscuro sólido con vidrio */}
                    <div className="flex items-center justify-center">
                        <div className="relative w-full max-w-md">
                            {/* Efecto de brillo detrás de la card */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 via-emerald-500/30 to-cyan-500/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            
                            {/* Card con fondo oscuro sólido + efecto glass sutil */}
                            <Card className="relative border border-white/20 bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl overflow-hidden">
                                {/* Borde superior decorativo */}
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400"></div>
                                
                                <CardHeader className="space-y-2 pt-8">
                                    <div className="flex items-center justify-center mb-6">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full blur-lg opacity-50 animate-pulse"></div>
                                            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 backdrop-blur-sm border border-white/20">
                                                <Heart className="h-10 w-10 text-cyan-400" />
                                            </div>
                                        </div>
                                    </div>
                                    <CardTitle className="text-3xl text-center bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                                        Iniciar Sesión
                                    </CardTitle>
                                    <CardDescription className="text-center text-white/50">
                                        Ingresa tus credenciales para acceder al sistema
                                    </CardDescription>
                                </CardHeader>

                                <CardContent>
                                    {error && (
                                        <Alert variant="destructive" className="mb-6 bg-red-500/10 border-red-500/20 backdrop-blur-sm">
                                            <AlertCircle className="h-4 w-4 text-red-400" />
                                            <AlertDescription className="text-red-300">{error}</AlertDescription>
                                        </Alert>
                                    )}

                                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="flex items-center gap-2 text-white/70 text-sm">
                                                <Mail className="h-4 w-4 text-cyan-400" />
                                                Email
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="usuario@hospital.com"
                                                autoComplete="username"
                                                spellCheck={false}
                                                disabled={isLoading}
                                                aria-invalid={!!errors.email}
                                                className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-cyan-400/50 focus:ring-cyan-400/20 rounded-xl transition-all duration-300"
                                                {...register("email")}
                                            />
                                            {errors.email && (
                                                <p className="text-xs text-amber-400">{errors.email.message}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="password" className="flex items-center gap-2 text-white/70 text-sm">
                                                    <Lock className="h-4 w-4 text-cyan-400" />
                                                    Contraseña
                                                </Label>
                                                <Button
                                                    type="button"
                                                    variant="link"
                                                    size="sm"
                                                    className="text-xs h-auto p-0 text-cyan-400 hover:text-cyan-300"
                                                >
                                                    ¿Olvidaste tu contraseña?
                                                </Button>
                                            </div>
                                            <div className="relative">
                                                <Input
                                                    id="password"
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    autoComplete="current-password"
                                                    disabled={isLoading}
                                                    aria-invalid={!!errors.password}
                                                    className="h-12 pr-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-cyan-400/50 focus:ring-cyan-400/20 rounded-xl transition-all duration-300"
                                                    {...register("password")}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                                    className="absolute right-0 top-0 h-12 w-12 text-white/50 hover:text-white"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                            {errors.password && (
                                                <p className="text-xs text-amber-400">{errors.password.message}</p>
                                            )}
                                        </div>

                                        {password && (
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-white/50">Seguridad de contraseña</span>
                                                    <span className={strength.tone}>{strength.label}</span>
                                                </div>
                                                <Progress value={strength.score} className="h-1.5 bg-white/10" />
                                            </div>
                                        )}

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="remember"
                                                checked={rememberMe}
                                                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                                                className="border-white/30 bg-white/5 data-[state=checked]:bg-cyan-400 data-[state=checked]:border-cyan-400"
                                            />
                                            <Label
                                                htmlFor="remember"
                                                className="text-sm font-normal text-white/60 cursor-pointer"
                                            >
                                                Recordar en este dispositivo
                                            </Label>
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full h-12 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-cyan-500/25 transition-all duration-300"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Autenticando...
                                                </>
                                            ) : (
                                                <>
                                                    <LogIn className="mr-2 h-4 w-4" />
                                                    Iniciar Sesión
                                                </>
                                            )}
                                        </Button>
                                    </form>

                                    {/* Avisos de seguridad */}
                                    <Alert className="mt-6 bg-amber-500/10 border-amber-500/20 backdrop-blur-sm">
                                        <AlertCircle className="h-4 w-4 text-amber-400" />
                                        <AlertDescription className="text-xs text-amber-300/90">
                                            Este sistema contiene información médica confidencial. Su uso está restringido al personal autorizado.
                                        </AlertDescription>
                                    </Alert>
                                </CardContent>

                                <CardFooter className="flex flex-col space-y-5 pb-8">
                                    <div className="text-center text-xs text-white/40">
                                        Al iniciar sesión, aceptas nuestros{" "}
                                        <Button variant="link" className="text-xs h-auto p-0 text-cyan-400 hover:text-cyan-300" asChild>
                                            <a href="#terms">Términos de Servicio</a>
                                        </Button>{" "}
                                        y{" "}
                                        <Button variant="link" className="text-xs h-auto p-0 text-cyan-400 hover:text-cyan-300" asChild>
                                            <a href="#privacy">Política de Privacidad</a>
                                        </Button>
                                    </div>

                                    <Separator className="bg-white/10" />

                                    <div className="flex items-center justify-center gap-4 text-xs text-white/40">
                                        <div className="flex items-center gap-2">
                                            <Fingerprint className="h-3 w-3 text-cyan-400" />
                                            <span>SSL Encriptado</span>
                                        </div>
                                        <div className="w-1 h-1 rounded-full bg-white/20"></div>
                                        <div className="flex items-center gap-2">
                                            <Shield className="h-3 w-3 text-emerald-400" />
                                            <span>2FA Ready</span>
                                        </div>
                                    </div>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer con glass */}
            <footer className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white/80 backdrop-blur-md">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                        <div className="text-sm text-gray-600">
                            © 2024 Hospital Medical System. Todos los derechos reservados.
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                            <Button variant="link" className="text-gray-600 hover:text-gray-800 h-auto p-0" asChild>
                                <a href="#help">Centro de Ayuda</a>
                            </Button>
                            <Button variant="link" className="text-gray-600 hover:text-gray-800 h-auto p-0" asChild>
                                <a href="#support">Soporte Técnico</a>
                            </Button>
                            <Button variant="link" className="text-gray-600 hover:text-gray-800 h-auto p-0" asChild>
                                <a href="#status">Estado del Sistema</a>
                            </Button>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}