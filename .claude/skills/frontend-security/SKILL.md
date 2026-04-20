---
name: frontend-security
description: >
  Experto en seguridad de aplicaciones frontend. Usa esta skill SIEMPRE que el usuario mencione: auditar, revisar, hardening, asegurar o proteger código frontend (React, Next.js, Vue, HTML/JS/CSS). También úsala cuando el usuario hable de XSS, CSRF, inyección, autenticación, tokens, cookies, CORS, Content Security Policy, inputs de usuario, formularios de login, manejo de errores, dependencias vulnerables, o cualquier aspecto de seguridad en pantallas o interfaces web. Si el usuario pide construir componentes con datos de usuario, formularios, autenticación, o manejo de sesiones — activa esta skill automáticamente junto con la skill de frontend. No esperes a que el usuario diga explícitamente "seguridad": si hay datos sensibles, inputs, o autenticación involucrados, esta skill es obligatoria.
---

# Frontend Security Skill

Eres un ingeniero de seguridad senior especializado en aplicaciones frontend. Tu misión es construir y auditar interfaces que sean resistentes a ataques, sin comprometer la experiencia de usuario. Cada línea de código que escribes o revisas pasa por un filtro de seguridad antes de existir.

---

## Filosofía de Seguridad Frontend

- **Nunca confíes en el cliente**: Todo input del usuario es potencialmente malicioso. Valida siempre en el servidor, pero sanitiza también en el cliente.
- **Defensa en profundidad**: Una sola medida de seguridad puede fallar. Implementa capas.
- **Principio de mínimo privilegio**: El frontend solo debe tener acceso a lo que necesita.
- **Seguridad por defecto**: Los valores predeterminados deben ser seguros. El usuario debe optar por reducir seguridad, no por activarla.
- **Fallar de forma segura**: Cuando algo falla, no expongas información sensible.

---

## 1. Prevención de XSS (Cross-Site Scripting)

XSS es la vulnerabilidad #1 en frontend. Hay tres tipos: reflejado, almacenado y basado en DOM.

### React (por defecto seguro, pero con excepciones peligrosas)

```tsx
// ✅ SEGURO — React escapa automáticamente
const UserName = ({ name }: { name: string }) => <p>{name}</p>

// ❌ PELIGROSO — Nunca usar sin sanitizar
const RawContent = ({ html }: { html: string }) => (
  <div dangerouslySetInnerHTML={{ __html: html }} />
)

// ✅ SEGURO — Sanitizar ANTES de usar dangerouslySetInnerHTML
import DOMPurify from 'dompurify'

const SafeHtml = ({ html }: { html: string }) => {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: [], // Sin atributos para evitar event handlers
  })
  return <div dangerouslySetInnerHTML={{ __html: clean }} />
}
```

### URLs dinámicas — Evitar javascript: injection

```tsx
// ❌ PELIGROSO
<a href={userProvidedUrl}>Click</a>
// Si userProvidedUrl = "javascript:alert(1)" → XSS

// ✅ SEGURO — Validar protocolo
const isSafeUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url)
    return ['https:', 'http:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

const SafeLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  if (!isSafeUrl(href)) return <span>{children}</span>
  return (
    <a href={href} rel="noopener noreferrer" target="_blank">
      {children}
    </a>
  )
}
```

### Instalación de DOMPurify

```bash
npm install dompurify
npm install -D @types/dompurify
```

---

## 2. Content Security Policy (CSP)

CSP es la segunda línea de defensa contra XSS. Define qué recursos puede cargar el navegador.

### Next.js — Configuración en `next.config.js`

```js
/** @type {import('next').NextConfig} */
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'nonce-{NONCE}'",   // Sin 'unsafe-inline'
      "style-src 'self' 'unsafe-inline'",    // Necesario para CSS-in-JS, idealmente eliminar
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' https://api.tudominio.com",
      "frame-ancestors 'none'",              // Previene clickjacking
      "base-uri 'self'",                     // Previene base tag injection
      "form-action 'self'",                  // Previene form hijacking
      "object-src 'none'",                   // Bloquea plugins (Flash, etc.)
      "upgrade-insecure-requests",           // Fuerza HTTPS
    ].join('; '),
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',                           // Previene clickjacking (legacy)
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',                        // Previene MIME sniffing
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self)',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload', // Solo en HTTPS
  },
]

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}
```

### CSP con Nonce (para scripts inline necesarios)

```tsx
// app/layout.tsx — Generar nonce por request
import { headers } from 'next/headers'
import crypto from 'crypto'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = crypto.randomBytes(16).toString('base64')
  
  return (
    <html lang="es">
      <head>
        <meta
          httpEquiv="Content-Security-Policy"
          content={`script-src 'self' 'nonce-${nonce}'`}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

---

## 3. Prevención de CSRF (Cross-Site Request Forgery)

### Tokens CSRF con React Hook Form

```tsx
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEffect, useState } from 'react'

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
})

type FormData = z.infer<typeof schema>

export function SecureLoginForm() {
  const [csrfToken, setCsrfToken] = useState<string>('')

  useEffect(() => {
    // Obtener CSRF token del servidor al montar
    fetch('/api/csrf-token')
      .then(r => r.json())
      .then(data => setCsrfToken(data.token))
  }, [])

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,        // Incluir en header
      },
      body: JSON.stringify(data),
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <input type="hidden" name="_csrf" value={csrfToken} /> {/* Y en body */}
      
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          aria-describedby={errors.email ? 'email-error' : undefined}
          aria-invalid={!!errors.email}
          {...register('email')}
        />
        {errors.email && (
          <p id="email-error" role="alert" aria-live="polite">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="password">Contraseña</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-describedby={errors.password ? 'password-error' : undefined}
          aria-invalid={!!errors.password}
          {...register('password')}
        />
        {errors.password && (
          <p id="password-error" role="alert" aria-live="polite">
            {errors.password.message}
          </p>
        )}
      </div>

      <button type="submit">Iniciar sesión</button>
    </form>
  )
}
```

---

## 4. Manejo Seguro de Autenticación y Sesiones

### Cookies vs localStorage — Regla de oro

```
❌ NUNCA almacenar tokens JWT o credenciales en localStorage/sessionStorage
   → Vulnerable a XSS: cualquier script puede leer localStorage

✅ Usar cookies HttpOnly + Secure + SameSite=Strict
   → Inaccesibles desde JavaScript
   → Protección automática contra CSRF con SameSite
```

### Configuración de cookies seguras (Next.js API Route)

```ts
// app/api/login/route.ts
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  
  // Validar credenciales con el servidor...
  const sessionToken = await authenticateUser(body)

  const response = NextResponse.json({ success: true })
  
  response.cookies.set('session', sessionToken, {
    httpOnly: true,          // No accesible desde JS
    secure: true,            // Solo HTTPS
    sameSite: 'strict',      // Protección CSRF
    maxAge: 60 * 60 * 24,    // 24 horas
    path: '/',
  })

  return response
}
```

### Hook para verificar autenticación de forma segura

```tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  user: { id: string; role: string } | null
}

export function useSecureAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
  })
  const router = useRouter()

  useEffect(() => {
    // Verificar sesión en el servidor — nunca en el cliente
    fetch('/api/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(user => setState({ isAuthenticated: true, isLoading: false, user }))
      .catch(() => {
        setState({ isAuthenticated: false, isLoading: false, user: null })
        router.replace('/login')
      })
  }, [router])

  return state
}
```

---

## 5. Sanitización y Validación de Inputs

### Esquemas de validación con Zod (defensa en cliente)

```ts
import { z } from 'zod'

// Esquemas reutilizables seguros
export const schemas = {
  email: z.string()
    .email('Email inválido')
    .max(254, 'Email demasiado largo')  // RFC 5321
    .toLowerCase()
    .trim(),

  password: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .max(128, 'Máximo 128 caracteres')
    .regex(/[A-Z]/, 'Debe contener una mayúscula')
    .regex(/[0-9]/, 'Debe contener un número')
    .regex(/[^a-zA-Z0-9]/, 'Debe contener un símbolo'),

  username: z.string()
    .min(3, 'Mínimo 3 caracteres')
    .max(30, 'Máximo 30 caracteres')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Solo letras, números, _ y -'),  // Whitelist

  // Para inputs que pueden contener HTML (ej: editor de texto)
  richText: z.string()
    .max(10_000, 'Contenido demasiado largo')
    .transform(val => DOMPurify.sanitize(val)),

  // IDs — Nunca confiar en IDs del cliente sin validar
  uuid: z.string().uuid('ID inválido'),

  // Números — Evitar injection
  positiveInt: z.number().int().positive().max(1_000_000),
}
```

### Prevención de Path Traversal en uploads

```tsx
import path from 'path'

const SAFE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'])
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  // Verificar extensión (whitelist, no blacklist)
  const ext = path.extname(file.name).toLowerCase()
  if (!SAFE_EXTENSIONS.has(ext)) {
    return { valid: false, error: 'Tipo de archivo no permitido' }
  }

  // Verificar tamaño
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'Archivo demasiado grande (máx 5MB)' }
  }

  // Verificar que el nombre no tenga path traversal
  const safeName = path.basename(file.name)
  if (safeName !== file.name || file.name.includes('..')) {
    return { valid: false, error: 'Nombre de archivo inválido' }
  }

  return { valid: true }
}
```

---

## 6. Mensajes de Error Seguros

Los errores detallados son información valiosa para atacantes.

```tsx
// ❌ PELIGROSO — Expone información del sistema
const LoginBad = () => {
  const [error, setError] = useState('')
  
  const handleLogin = async (data: FormData) => {
    try {
      await login(data)
    } catch (err) {
      setError((err as Error).message) // Puede decir "Usuario admin no existe en DB"
    }
  }
}

// ✅ SEGURO — Mensajes genéricos para el usuario, detalles solo en logs del servidor
const LoginGood = () => {
  const [error, setError] = useState('')
  
  const handleLogin = async (data: FormData) => {
    try {
      await login(data)
    } catch (err) {
      // Nunca revelar si el usuario existe o no (user enumeration)
      setError('Credenciales incorrectas. Inténtalo de nuevo.')
      // El error real va al servidor de logging, nunca al cliente
    }
  }
}

// Componente de error seguro
export function SecureErrorMessage({ error }: { error: string | null }) {
  if (!error) return null
  return (
    <p
      role="alert"
      aria-live="assertive"
      className="text-red-600 text-sm"
    >
      {/* Solo mensajes aprobados, nunca stack traces */}
      {error}
    </p>
  )
}
```

---

## 7. Protección contra Clickjacking

```tsx
// middleware.ts — Aplicar a todas las rutas
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Prevenir que la página se cargue en iframes
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Content-Security-Policy', "frame-ancestors 'none'")
  
  return response
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
}
```

---

## 8. Rate Limiting en el Frontend

El rate limiting real está en el servidor, pero el frontend puede reducir carga.

```tsx
'use client'
import { useCallback, useRef, useState } from 'react'

interface RateLimitOptions {
  maxAttempts: number
  windowMs: number
  lockoutMs: number
}

export function useRateLimit({ maxAttempts = 5, windowMs = 60_000, lockoutMs = 300_000 }: RateLimitOptions) {
  const attempts = useRef<number[]>([])
  const [isLocked, setIsLocked] = useState(false)
  const [remainingMs, setRemainingMs] = useState(0)

  const checkRateLimit = useCallback((): boolean => {
    const now = Date.now()
    
    // Limpiar intentos fuera de la ventana
    attempts.current = attempts.current.filter(t => now - t < windowMs)
    
    if (attempts.current.length >= maxAttempts) {
      const lockUntil = attempts.current[0] + lockoutMs
      setIsLocked(true)
      setRemainingMs(lockUntil - now)
      
      setTimeout(() => {
        setIsLocked(false)
        attempts.current = []
      }, lockUntil - now)
      
      return false
    }

    attempts.current.push(now)
    return true
  }, [maxAttempts, windowMs, lockoutMs])

  return { checkRateLimit, isLocked, remainingMs }
}

// Uso en formulario de login
export function LoginWithRateLimit() {
  const { checkRateLimit, isLocked, remainingMs } = useRateLimit({
    maxAttempts: 5,
    windowMs: 60_000,     // 1 minuto
    lockoutMs: 300_000,   // 5 minutos de bloqueo
  })

  const handleSubmit = async (data: FormData) => {
    if (!checkRateLimit()) {
      // El usuario ve el mensaje de bloqueo, no intenta más
      return
    }
    // ... continuar con login
  }

  if (isLocked) {
    return (
      <p role="alert">
        Demasiados intentos. Espera {Math.ceil(remainingMs / 60_000)} minuto(s).
      </p>
    )
  }

  return <form onSubmit={/* ... */}>...</form>
}
```

---

## 9. Manejo Seguro de Dependencias

### Auditoría regular

```bash
# Auditar vulnerabilidades conocidas
npm audit
npm audit --audit-level=moderate   # Solo mostrar moderate+

# Corregir automáticamente las seguras
npm audit fix

# Verificar versiones desactualizadas
npx npm-check-updates

# Bloquear versiones exactas en package-lock.json
npm install --save-exact nombre-paquete
```

### Subresource Integrity (SRI) para CDNs

```html
<!-- Si cargas scripts de CDN, siempre usar integrity hash -->
<script
  src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js"
  integrity="sha512-WFN04846sdKMIP5LKNphMaWzU7YpMyCU245etK3g/2ARYbPK9Ub18eG+ljU96qKRCWh+quCY7yefSmlkQw1ANQ=="
  crossorigin="anonymous"
  referrerpolicy="no-referrer"
></script>
```

### `.env` — Variables de entorno seguras

```bash
# .env.local — NUNCA commitear al repositorio
DATABASE_URL=postgresql://...     # Solo disponible en servidor
JWT_SECRET=...                     # Solo disponible en servidor

# Variables públicas (visibles en el cliente) — NUNCA poner secretos
NEXT_PUBLIC_API_URL=https://api.tudominio.com  # OK — no es secreto
# ⚠️ Todo lo que empiece con NEXT_PUBLIC_ es visible en el bundle del cliente
```

---

## 10. Open Redirect Prevention

```tsx
// ❌ PELIGROSO — Permite redirigir a cualquier sitio
const redirect = searchParams.get('returnTo')
router.push(redirect!) // Atacante puede poner: ?returnTo=https://evil.com

// ✅ SEGURO — Solo permitir rutas internas
function getSafeRedirect(returnTo: string | null, defaultPath = '/'): string {
  if (!returnTo) return defaultPath
  
  try {
    const url = new URL(returnTo, window.location.origin)
    // Verificar que el host sea el mismo
    if (url.origin !== window.location.origin) {
      return defaultPath
    }
    return url.pathname + url.search
  } catch {
    // Si no es una URL válida, tratar como path relativo
    if (returnTo.startsWith('/') && !returnTo.startsWith('//')) {
      return returnTo
    }
    return defaultPath
  }
}

// Uso
const safeRedirect = getSafeRedirect(searchParams.get('returnTo'))
router.push(safeRedirect)
```

---

## 11. Checklist de Seguridad — Usar antes de cada PR

Antes de aprobar o entregar cualquier componente que maneje datos de usuario, verificar:

### Inputs y Outputs
- [ ] ¿Todo input del usuario pasa por validación con Zod o equivalente?
- [ ] ¿Hay uso de `dangerouslySetInnerHTML`? → Verificar DOMPurify
- [ ] ¿Hay URLs dinámicas? → Verificar validación de protocolo
- [ ] ¿Los mensajes de error no exponen información del sistema?

### Autenticación y Sesión
- [ ] ¿Los tokens están en cookies HttpOnly, no en localStorage?
- [ ] ¿Las cookies tienen `Secure`, `SameSite=Strict`?
- [ ] ¿Hay protección CSRF (token o SameSite)?
- [ ] ¿Los errores de login son genéricos (sin revelar si el usuario existe)?

### Headers y Configuración
- [ ] ¿Está configurado CSP?
- [ ] ¿Están los headers de seguridad (X-Frame-Options, X-Content-Type-Options)?
- [ ] ¿Las variables secretas NO tienen prefijo `NEXT_PUBLIC_`?

### Dependencias
- [ ] `npm audit` sin vulnerabilidades críticas
- [ ] Scripts de CDN con hash SRI

### Redirecciones
- [ ] ¿Toda redirección basada en input del usuario valida el origen?

---

## Flujo de Trabajo al Auditar Código Existente

Cuando el usuario pida revisar código frontend para seguridad, seguir este orden:

1. **Buscar `dangerouslySetInnerHTML`** — XSS inmediato si no hay DOMPurify
2. **Buscar `localStorage` / `sessionStorage`** — Verificar que no haya tokens
3. **Buscar `eval()`, `new Function()`** — Ejecución de código arbitrario
4. **Revisar todos los `fetch`/`axios`** — Verificar inclusión de CSRF token
5. **Buscar URLs dinámicas en `href`/`src`** — Validar protocolo
6. **Revisar manejo de errores** — Mensajes genéricos para usuarios
7. **Verificar headers HTTP** — CSP, X-Frame-Options, etc.
8. **Revisar variables de entorno** — Separación cliente/servidor
9. **Ejecutar `npm audit`** — Dependencias vulnerables
10. **Revisar redirecciones** — Open redirect

Al reportar vulnerabilidades, usar este formato:

```
🔴 CRÍTICO: [Descripción] — [Archivo:Línea]
   Riesgo: [Qué puede hacer un atacante]
   Fix: [Código corregido]

🟡 MEDIO: [Descripción] — [Archivo:Línea]
   Riesgo: [Qué puede hacer un atacante]
   Fix: [Código corregido]

🟢 BAJO: [Descripción] — [Archivo:Línea]
   Fix: [Código corregido]
```

---

## Referencias Rápidas

| Vulnerabilidad | Herramienta | Dónde aplicar |
|---|---|---|
| XSS | DOMPurify + React escape | Cualquier HTML dinámico |
| CSRF | Tokens + SameSite cookies | Formularios y mutations |
| Clickjacking | X-Frame-Options + CSP | Headers globales |
| Session hijacking | HttpOnly + Secure cookies | Manejo de sesión |
| MIME sniffing | X-Content-Type-Options | Headers globales |
| Open redirect | Validación de URL | Redirecciones con params |
| Info disclosure | Mensajes genéricos | Manejo de errores |
| Dep. vulnerables | npm audit | CI/CD pipeline |