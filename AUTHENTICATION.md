# Sistema de Autenticación - Documentación

## 📋 Resumen

Se ha implementado un sistema de autenticación completo y seguro para el proyecto frontend, integrando la API de login y gestionando tokens mediante cookies seguras.

---

## 🏗️ Arquitectura Implementada

### 1. **Estructura de Carpetas**

```
frontend/
├── lib/
│   ├── api/
│   │   ├── config.ts              # Configuración API con token dinámico
│   │   ├── client.ts              # Cliente HTTP con token desde cookies
│   │   ├── services/
│   │   │   ├── auth.service.ts    # Servicio de autenticación
│   │   │   └── user.service.ts    # Servicio de usuarios
│   │   └── types/
│   │       ├── auth.types.ts      # Tipos de autenticación
│   │       └── user.types.ts      # Tipos de usuarios
│   ├── context/
│   │   └── auth-context.tsx       # Context global de autenticación
│   └── utils/
│       └── cookies.ts             # Utilidades para cookies seguras
├── hooks/
│   ├── use-auth.ts                # Hook de autenticación
│   └── use-users.ts               # Hook de gestión de usuarios
├── app/
│   ├── layout.tsx                 # Layout con AuthProvider
│   └── login/
│       └── page.tsx               # Página de login integrada
├── components/
│   └── layout/
│       └── sidebar.tsx            # Sidebar con info de usuario y logout
└── middleware.ts                  # Protección de rutas
```

---

## 🔐 Características de Seguridad

### **Gestión de Tokens en Cookies**

1. **Access Token**
   - Almacenado en cookie `access_token`
   - Duración: 24 horas
   - Atributos: `secure`, `sameSite=strict`
   - Se envía automáticamente en cada request API

2. **Refresh Token**
   - Almacenado en cookie `refresh_token`
   - Duración: 30 días
   - Atributos: `secure`, `sameSite=strict`
   - Listo para implementar refresh automático

3. **User Data**
   - Almacenado en cookie `user_data` (solo info no sensible)
   - Permite mantener sesión después de refresh

### **Configuración de Cookies Seguras**

```typescript
// lib/utils/cookies.ts
setCookie(name, value, {
  maxAge: 60 * 60 * 24,           // 24 horas
  secure: NODE_ENV === "production", // Solo HTTPS en producción
  sameSite: "strict",              // Protección CSRF
  path: "/"
});
```

---

## 🔄 Flujo de Autenticación

### **1. Login**
```
Usuario → Formulario Login → authService.login()
                                    ↓
                            API: POST /api/v1/auth/login
                                    ↓
                            Respuesta con tokens
                                    ↓
                        Guardar en cookies seguras
                                    ↓
                            Actualizar AuthContext
                                    ↓
                        Redirect a Dashboard (/)
```

### **2. Request API Autenticado**
```
Componente → userService.getUsers()
                    ↓
            api.get() (client.ts)
                    ↓
        Leer token desde cookie
                    ↓
        Authorization: Bearer {token}
                    ↓
            API Response
```

### **3. Logout**
```
Usuario → Click "Cerrar Sesión"
                ↓
        Eliminar todas las cookies
                ↓
        Limpiar AuthContext
                ↓
        Redirect a /login
```

---

## 🛡️ Protección de Rutas (Middleware)

### **Comportamiento**

- **Usuarios NO autenticados**: Redirigidos a `/login`
- **Usuarios autenticados en `/login`**: Redirigidos a `/`
- **Rutas públicas**: Solo `/login`
- **Validación**: Se verifica cookie `access_token`

### **Código**
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;
  const { pathname } = request.nextUrl;

  if (!accessToken && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (accessToken && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}
```

---

## 📦 Componentes Principales

### **1. AuthContext**
```typescript
// lib/context/auth-context.tsx
export function AuthProvider({ children }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  
  // Auto-inicialización desde cookies
  useEffect(() => {
    const token = getCookie("access_token");
    const userData = getCookie("user_data");
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, ... }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### **2. Login Page**
```typescript
// app/login/page.tsx
export default function LoginPage() {
  const { login } = useAuth();
  
  const handleLogin = async (e) => {
    try {
      await login({ email, password });
      // Redirect automático por AuthContext
    } catch (err) {
      setError(err.message);
    }
  };
}
```

### **3. Sidebar con Usuario**
```typescript
// components/layout/sidebar.tsx
function UserInfo() {
  const { user, logout } = useAuth();

  return (
    <div>
      <Avatar>{user.name}</Avatar>
      <Button onClick={logout}>Cerrar Sesión</Button>
    </div>
  );
}
```

---

## 🚀 Uso de la API

### **Login**
```typescript
import { useAuth } from "@/hooks/use-auth";

function LoginComponent() {
  const { login, isLoading, error } = useAuth();

  await login({
    email: "usuario@hospital.com",
    password: "admin123"
  });
}
```

### **Acceder a Usuario Actual**
```typescript
import { useAuth } from "@/hooks/use-auth";

function ProfileComponent() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <div>No autenticado</div>;

  return <div>Hola, {user.name}</div>;
}
```

### **Logout**
```typescript
import { useAuth } from "@/hooks/use-auth";

function LogoutButton() {
  const { logout } = useAuth();

  return <button onClick={logout}>Cerrar Sesión</button>;
}
```

---

## 🔄 Integración con API Existente

### **Antes (Token Hardcodeado)**
```typescript
// lib/api/config.ts
const TEMP_TOKEN = "eyJhbGci...";

export const API_CONFIG = {
  baseUrl: "http://localhost:3000/api/v1",
  token: TEMP_TOKEN,
};
```

### **Después (Token Dinámico)**
```typescript
// lib/api/config.ts
import { getCookie } from "@/lib/utils/cookies";

export function getAccessToken(): string | null {
  return getCookie("access_token");
}

export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  getToken: getAccessToken, // Función dinámica
};
```

### **Cliente API Actualizado**
```typescript
// lib/api/client.ts
const token = API_CONFIG.getToken();
const headers = {
  "Content-Type": "application/json",
  ...(token && { Authorization: `Bearer ${token}` }),
};
```

---

## 🧪 Variables de Entorno

```env
# .env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NODE_ENV=development
```

---

## ✅ Checklist de Implementación

- ✅ Servicio de autenticación (`auth.service.ts`)
- ✅ Tipos de autenticación (`auth.types.ts`)
- ✅ Context global de auth (`auth-context.tsx`)
- ✅ Hook personalizado (`use-auth.ts`)
- ✅ Utilidades de cookies seguras (`cookies.ts`)
- ✅ Página de login integrada con API
- ✅ Middleware de protección de rutas
- ✅ AuthProvider en layout principal
- ✅ Token dinámico en cliente API
- ✅ Componente de usuario en sidebar
- ✅ Botón de logout funcional
- ✅ Manejo de errores en login
- ✅ Estados de loading

---

## 🔮 Próximos Pasos (Opcional)

### **1. Refresh Token Automático**
```typescript
// Interceptar 401 y refrescar token automáticamente
if (response.status === 401) {
  const refreshToken = getCookie("refresh_token");
  const newTokens = await authService.refreshToken({ refreshToken });
  // Reintentar request original
}
```

### **2. Remember Me**
```typescript
// Extender duración de cookies si "recordar" está activado
const maxAge = rememberMe 
  ? 60 * 60 * 24 * 30  // 30 días
  : 60 * 60 * 24;      // 1 día
```

### **3. Two-Factor Authentication**
- Implementar endpoint `/auth/verify-2fa`
- Agregar paso adicional después de login
- Validar código TOTP

### **4. Session Activity Log**
- Registrar IPs y dispositivos
- Mostrar sesiones activas
- Permitir cerrar sesiones remotas

---

## 📚 API Endpoints Utilizados

### **POST /api/v1/auth/login**
```bash
curl --location 'http://localhost:3000/api/v1/auth/login' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "usuario@hospital.com",
    "password": "admin123"
}'
```

**Respuesta Exitosa:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci...",
    "user": {
      "id": "uuid",
      "email": "usuario@hospital.com",
      "name": "Usuario Test",
      "role": "doctor"
    }
  }
}
```

**Respuesta Error:**
```json
{
  "success": false,
  "message": "Invalid credentials."
}
```

---

## 🎯 Resumen Final

✅ **Login funcional** con integración a API real
✅ **Tokens seguros** almacenados en cookies con configuración apropiada
✅ **Rutas protegidas** por middleware
✅ **Token dinámico** en todas las peticiones API
✅ **UI actualizada** con info de usuario y logout
✅ **Estructura limpia** siguiendo patrón establecido
✅ **Context global** para acceso fácil al estado de auth
✅ **Manejo de errores** robusto

El sistema está completamente funcional y listo para usar. 🚀
