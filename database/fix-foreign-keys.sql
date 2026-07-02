-- =============================================
-- REPARACIÓN: Foreign Keys entre appointments y profiles
-- Ejecutar en Supabase SQL Editor si aparece el error:
-- "Could not find a relationship between 'appointments' and 'profiles'"
-- =============================================

-- 1. ELIMINAR CONSTRAINTS EXISTENTES (si las hay, para evitar conflictos)
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_user_id_fkey;
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_professional_id_fkey;

-- 2. CREAR FOREIGN KEY: user_id → profiles(id)
ALTER TABLE appointments
ADD CONSTRAINT appointments_user_id_fkey
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- 3. CREAR FOREIGN KEY: professional_id → profiles(id)
ALTER TABLE appointments
ADD CONSTRAINT appointments_professional_id_fkey
FOREIGN KEY (professional_id) REFERENCES profiles(id);

-- 4. VERIFICAR QUE LAS CONSTRAINTS SE CREARON
SELECT
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS references_table,
  ccu.column_name AS references_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_name = 'appointments'
  AND tc.constraint_type = 'FOREIGN KEY';

-- 5. HABILITAR RLS EN DEPENDENCIES (si no está habilitado)
ALTER TABLE dependencies ENABLE ROW LEVEL SECURITY;

-- 6. CREAR POLÍTICA PARA QUE USUARIOS AUTENTICADOS PUEDAN LEER DEPENDENCIES
DROP POLICY IF EXISTS "Authenticated users can view dependencies" ON dependencies;
CREATE POLICY "Authenticated users can view dependencies" ON dependencies
  FOR SELECT USING (auth.role() = 'authenticated');

-- 7. VERIFICAR POLÍTICAS DE RLS EN DEPENDENCIES
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'dependencies';

-- 8. REFRESCAR SCHEMA CACHE (importante para Supabase)
NOTIFY pgrst, 'reload schema';
