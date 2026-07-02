# Guía de Reparación - Base de Datos

## Error comun
```
Error fetching citas: Could not find a relationship between 'appointments' and 'profiles' in the schema cache
```

## Causa
Las foreign keys entre las tablas `appointments` y `profiles` no existen en la base de datos de Supabase.

## Solucion (5 minutos)

### Paso 1: Abrir Supabase SQL Editor
1. Ir a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Seleccionar tu proyecto
3. Ir a **SQL Editor** en el menu lateral

### Paso 2: Ejecutar script de reparacion
1. Copiar TODO el contenido del archivo `database/fix-foreign-keys.sql`
2. Pegarlo en el SQL Editor de Supabase
3. Hacer clic en **Run** (o presionar Ctrl+Enter)

### Paso 3: Verificar resultado
Despues de ejecutar, deberias ver una tabla con estas CONSTRAINTS:

| constraint_name | column_name | references_table |
|----------------|-------------|------------------|
| appointments_user_id_fkey | user_id | profiles |
| appointments_professional_id_fkey | professional_id | profiles |

### Paso 4: Recargar la aplicacion
1. Volver a tu navegador
2. Recargar la pagina (F5 o Ctrl+R)
3. El error deberia haber desaparecido

---

## Verificacion adicional

Si quieres verificar manualmente que las foreign keys existen, ejecuta este SQL:

```sql
SELECT
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_name = 'appointments'
  AND tc.constraint_type = 'FOREIGN KEY';
```

---

## Si el error persiste

1. **Verificar que las tablas existen:**
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('appointments', 'profiles');
```

2. **Verificar RLS (Row Level Security):**
```sql
-- Si RLS esta habilitado, asegurate de tener las policies correctas
SELECT * FROM pg_policies WHERE tablename = 'appointments';
```

3. **Forzar reload del schema:**
```sql
NOTIFY pgrst, 'reload schema';
```
