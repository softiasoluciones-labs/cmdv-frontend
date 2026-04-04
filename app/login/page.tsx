"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
    Loader2
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/hooks/use-auth"
import { ApiError } from "@/lib/api"

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    })

    const { login } = useAuth()
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            await login({
                email: formData.email,
                password: formData.password,
            })
            // Redirect is handled by the auth context
        } catch (err) {
            const errorMessage = err instanceof ApiError
                ? err.message
                : "Error al iniciar sesión. Por favor, intenta de nuevo."
            setError(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Header con logo */}
            <header className="absolute top-0 left-0 right-0 z-10">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                <Heart className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Medical</h1>
                                <p className="text-xs text-muted-foreground">Sistema Hospitalario</p>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center gap-4 text-sm">
                            <span className="text-muted-foreground">Versión 2.5.1</span>
                            <Separator orientation="vertical" className="h-4" />
                            <span className="text-muted-foreground">Soporte técnico</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto flex min-h-screen items-center justify-center px-4 pt-20">
                <div className="grid w-full max-w-6xl grid-cols-1 gap-8 lg:grid-cols-2">
                    {/* Lado izquierdo: Información y bienvenida */}
                    <div className="flex flex-col justify-center space-y-8">
                        <div className="space-y-4">
                            <div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                                <BadgeCheck className="mr-2 h-4 w-4" />
                                Sistema Certificado HIPAA
                            </div>
                            <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white lg:text-5xl">
                                Acceso Seguro al <span className="text-primary">Sistema Médico</span>
                            </h2>
                            <p className="text-lg text-muted-foreground">
                                Gestión integral de pacientes, historiales clínicos y operaciones hospitalarias
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                                        <User className="h-6 w-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Personal Médico</h3>
                                        <p className="text-sm text-muted-foreground">Doctores y enfermeras</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                                        <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Administración</h3>
                                        <p className="text-sm text-muted-foreground">Gestión y facturación</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                                        <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Seguridad</h3>
                                        <p className="text-sm text-muted-foreground">Datos encriptados</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                                        <Smartphone className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Acceso Móvil</h3>
                                        <p className="text-sm text-muted-foreground">Disponible 24/7</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Estadísticas del sistema */}
                        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                            <CardContent className="p-6">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-primary">24/7</div>
                                        <div className="text-sm text-muted-foreground">Disponibilidad</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-primary">99.9%</div>
                                        <div className="text-sm text-muted-foreground">Uptime</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-primary">AES-256</div>
                                        <div className="text-sm text-muted-foreground">Encriptación</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Lado derecho: Formulario de login */}
                    <div className="flex items-center justify-center">
                        <Card className="w-full max-w-md border-2 shadow-xl">
                            <CardHeader className="space-y-1">
                                <div className="flex items-center justify-center mb-4">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                        <Heart className="h-8 w-8 text-primary" />
                                    </div>
                                </div>
                                <CardTitle className="text-2xl text-center">Iniciar Sesión</CardTitle>
                                <CardDescription className="text-center">
                                    Ingresa tus credenciales para acceder al sistema
                                </CardDescription>
                            </CardHeader>

                            <CardContent>
                                {error && (
                                    <Alert variant="destructive" className="mb-6">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                <form onSubmit={handleLogin} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="flex items-center gap-2">
                                            <Mail className="h-4 w-4" />
                                            Email
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="usuario@hospital.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                            disabled={isLoading}
                                            className="h-11"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="password" className="flex items-center gap-2">
                                                <Lock className="h-4 w-4" />
                                                Contraseña
                                            </Label>
                                            <Button
                                                type="button"
                                                variant="link"
                                                size="sm"
                                                className="text-xs h-auto p-0"
                                            >
                                                ¿Olvidaste tu contraseña?
                                            </Button>
                                        </div>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                required
                                                disabled={isLoading}
                                                className="h-11 pr-10"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute right-0 top-0 h-11 w-11"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Indicador de fortaleza de contraseña */}
                                    {formData.password && (
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-muted-foreground">Seguridad de contraseña</span>
                                                <span className={formData.password.length >= 8 ? "text-green-600" : "text-yellow-600"}>
                                                    {formData.password.length >= 8 ? "Fuerte" : "Media"}
                                                </span>
                                            </div>
                                            <Progress
                                                value={Math.min(formData.password.length * 10, 100)}
                                                className="h-1"
                                            />
                                        </div>
                                    )}

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="remember"
                                            checked={rememberMe}
                                            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                                        />
                                        <Label
                                            htmlFor="remember"
                                            className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Recordar en este dispositivo
                                        </Label>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full h-11"
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
                                <Alert className="mt-6 bg-amber-50 border-amber-200">
                                    <AlertCircle className="h-4 w-4 text-amber-600" />
                                    <AlertDescription className="text-xs">
                                        Este sistema contiene información médica confidencial. Su uso está restringido al personal autorizado.
                                    </AlertDescription>
                                </Alert>
                            </CardContent>

                            <CardFooter className="flex flex-col space-y-4">
                                <div className="text-center text-xs text-muted-foreground">
                                    Al iniciar sesión, aceptas nuestros{" "}
                                    <Button variant="link" className="text-xs h-auto p-0" asChild>
                                        <a href="#terms">Términos de Servicio</a>
                                    </Button>{" "}
                                    y{" "}
                                    <Button variant="link" className="text-xs h-auto p-0" asChild>
                                        <a href="#privacy">Política de Privacidad</a>
                                    </Button>
                                </div>

                                <Separator />

                                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Shield className="h-3 w-3" />
                                        <span>SSL Encriptado</span>
                                    </div>
                                </div>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="absolute bottom-0 left-0 right-0 border-t py-4">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                        <div className="text-sm text-muted-foreground">
                            © 2024 Hospital Medical System. Todos los derechos reservados.
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                            <Button variant="link" className="text-muted-foreground h-auto p-0" asChild>
                                <a href="#help">Centro de Ayuda</a>
                            </Button>
                            <Button variant="link" className="text-muted-foreground h-auto p-0" asChild>
                                <a href="#support">Soporte Técnico</a>
                            </Button>
                            <Button variant="link" className="text-muted-foreground h-auto p-0" asChild>
                                <a href="#status">Estado del Sistema</a>
                            </Button>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}