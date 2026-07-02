# Configuración del Proyecto - Gestión de Citas SENA Bienestar

## Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

## Base de Datos en Supabase

### Paso 1: Ejecutar el esquema SQL

1. Ve a tu panel de Supabase → SQL Editor
2. Copia y pega el contenido de `database/schema.sql`
3. Ejecuta el script

Esto creará:
- Tablas: `profiles`, `roles`, `dependencies`, `appointments`, `audit_logs`, `system_config`
- Datos iniciales de roles y dependencias
- Trigger para auto-crear perfiles al registrarse
- Funciones RPC para el dashboard

### Paso 2: Configurar la Service Role Key (Opcional - Solo para crear usuarios desde Admin)

El `AdminRepository.createUser()` usa `supabase.auth.admin.createUser()` que requiere la **service_role key**. 

**Opción A (Recomendada):** Crear usuarios manualmente desde el panel de Supabase

**Opción B:** Agregar al `.env`:
```
VITE_SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
```

Y crear un cliente separado en `src/lib/supabase-admin.js`:
```javascript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
```

Luego importar `supabaseAdmin` en `admin.repository.js` en lugar de `supabase`.

**⚠️ IMPORTANTE:** Nunca expongas la service_role key en el frontend en producción. Usa Edge Functions de Supabase para operaciones administrativas.

### Paso 3: Configurar Redirect URLs en Supabase

En Authentication → URL Configuration:
- Site URL: `http://localhost:5173`
- Redirect URLs: `http://localhost:5173/*`

## Ejecutar el Proyecto

```bash
npm install
npm run dev
```

## Estructura de Usuarios de Prueba

Después de ejecutar el SQL, crea usuarios desde el panel de Supabase con estos roles:

| Email | Rol | Descripción |
|-------|-----|-------------|
| admin@test.com | SUPERADMIN | Administrador principal |
| coord@test.com | COORDINACION | Coordinador de bienestar |
| psico@test.com | PSICOLOGIA | Psicólogo |
| enfer@test.com | ENFERMERIA | Enfermero |
| social@test.com | TRABAJO_SOCIAL | Trabajo social |
| aprendiz@test.com | APRENDIZ | Aprendiz SENA |

**Nota:** El rol se asigna automáticamente al crear el usuario (APRENDIZ por defecto). Para asignar otros roles, edita el `role_id` en la tabla `profiles` directamente en Supabase.

## Funcionalidades Implementadas

### ✅ Completas
- Autenticación (Login, Registro, Recuperación de contraseña)
- Dashboard por roles (Aprendiz, Profesional, Coordinación, Admin)
- CRUD de citas con validaciones
- Gestión de usuarios (Admin)
- Sistema de auditoría
- Configuración del sistema
- Gráficas y KPIs (Recharts)
- Exportación a CSV
- Diseño responsive

### ⚠️ Pendiente de Configurar
- Service Role Key para crear usuarios desde Admin
- Edge Functions para operaciones administrativas (recomendado)
- Notificaciones por email (configurable desde Admin)

### 🔧 Mejoras Sugeridas
- Paginación de citas
- Búsqueda avanzada
- Filtros por fecha en auditoría
- Exportación a Excel/PDF
