-- =============================================
-- CREACIÓN DE USUARIOS DE PRUEBA
-- Ejecutar en Supabase SQL Editor
-- =============================================
-- NOTA: Estos usuarios se crean directamente en auth.users
-- con confirmación automática (no necesitan verificar email)

-- Primero确保 que las dependencias existan
INSERT INTO dependencies (id, name, color) VALUES
  (1, 'Psicología', '#3b82f6'),
  (2, 'Enfermería', '#22c55e'),
  (3, 'Trabajo Social', '#f59e0b')
ON CONFLICT (id) DO NOTHING;

-- Asegurar que los roles existan
INSERT INTO roles (id, name, description) VALUES
  (1, 'SUPERADMIN', 'Administrador con acceso total'),
  (2, 'COORDINACION', 'Coordinación de bienestar'),
  (3, 'PSICOLOGIA', 'Profesional de psicología'),
  (4, 'ENFERMERIA', 'Profesional de enfermería'),
  (5, 'TRABAJO_SOCIAL', 'Profesional de trabajo social'),
  (6, 'APRENDIZ', 'Aprendiz SENA')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- CREAR USUARIOS EN auth.users
-- =============================================
-- Cada usuario tiene:
--   email: test@test.com
--   password: (la que especifiques abajo)
--   role_id: el rol correspondiente
--   confirmed_at: auto-confirmado

-- USUARIO 1: APRENDIZ
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, 
  email_confirmed_at, created_at, updated_at, 
  raw_user_meta_data, raw_app_meta_data
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'aprendiz@test.com',
  crypt('Aprendiz123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"full_name": "Aprendiz SENA", "document_number": "1000000006"}'::jsonb,
  '{"provider": "email", "providers": ["email"]}'::jsonb
)
ON CONFLICT (email) DO NOTHING;

-- USUARIO 2: COORDINACIÓN
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, 
  email_confirmed_at, created_at, updated_at, 
  raw_user_meta_data, raw_app_meta_data
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'coord@test.com',
  crypt('Coord123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"full_name": "Coord Bienestar", "document_number": "1000000002"}'::jsonb,
  '{"provider": "email", "providers": ["email"]}'::jsonb
)
ON CONFLICT (email) DO NOTHING;

-- USUARIO 3: PSICOLOGÍA
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, 
  email_confirmed_at, created_at, updated_at, 
  raw_user_meta_data, raw_app_meta_data
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'psico@test.com',
  crypt('Psico123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"full_name": "Psicólogo SENA", "document_number": "1000000003"}'::jsonb,
  '{"provider": "email", "providers": ["email"]}'::jsonb
)
ON CONFLICT (email) DO NOTHING;

-- USUARIO 4: ENFERMERÍA
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, 
  email_confirmed_at, created_at, updated_at, 
  raw_user_meta_data, raw_app_meta_data
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'enfer@test.com',
  crypt('Enfer123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"full_name": "Enfermero SENA", "document_number": "1000000004"}'::jsonb,
  '{"provider": "email", "providers": ["email"]}'::jsonb
)
ON CONFLICT (email) DO NOTHING;

-- USUARIO 5: TRABAJO SOCIAL
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, 
  email_confirmed_at, created_at, updated_at, 
  raw_user_meta_data, raw_app_meta_data
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'social@test.com',
  crypt('Social123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"full_name": "Trabajo Social", "document_number": "1000000005"}'::jsonb,
  '{"provider": "email", "providers": ["email"]}'::jsonb
)
ON CONFLICT (email) DO NOTHING;

-- USUARIO 6: SUPERADMIN
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, 
  email_confirmed_at, created_at, updated_at, 
  raw_user_meta_data, raw_app_meta_data
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@test.com',
  crypt('Admin123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"full_name": "Admin Principal", "document_number": "1000000001"}'::jsonb,
  '{"provider": "email", "providers": ["email"]}'::jsonb
)
ON CONFLICT (email) DO NOTHING;

-- =============================================
-- CREAR PERFILES EN profiles
-- =============================================
-- El trigger debería crearlos automáticamente, pero por si acaso:

DO $$
DECLARE
  v_user RECORD;
BEGIN
  -- Para cada usuario en auth.users que no tenga perfil
  FOR v_user IN 
    SELECT u.id, u.raw_user_meta_data, u.email
    FROM auth.users u
    LEFT JOIN profiles p ON p.id = u.id
    WHERE p.id IS NULL
  LOOP
    INSERT INTO profiles (id, full_name, document_number, email, role_id, is_active)
    VALUES (
      v_user.id,
      COALESCE(v_user.raw_user_meta_data->>'full_name', 'Sin nombre'),
      COALESCE(v_user.raw_user_meta_data->>'document_number', ''),
      v_user.email,
      CASE v_user.email
        WHEN 'admin@test.com' THEN 1
        WHEN 'coord@test.com' THEN 2
        WHEN 'psico@test.com' THEN 3
        WHEN 'enfer@test.com' THEN 4
        WHEN 'social@test.com' THEN 5
        ELSE 6
      END,
      true
    );
  END LOOP;
END $$;

-- =============================================
-- ASIGNAR DEPENDENCIAS A PROFESIONALES
-- =============================================
UPDATE profiles SET dependency_id = 1 WHERE email = 'psico@test.com';   -- Psicología
UPDATE profiles SET dependency_id = 2 WHERE email = 'enfer@test.com';   -- Enfermería
UPDATE profiles SET dependency_id = 3 WHERE email = 'social@test.com';  -- Trabajo Social

-- =============================================
-- VERIFICAR
-- =============================================
SELECT 
  p.full_name,
  p.email,
  r.name as rol,
  d.name as dependencia,
  p.is_active
FROM profiles p
LEFT JOIN roles r ON r.id = p.role_id
LEFT JOIN dependencies d ON d.id = p.dependency_id
ORDER BY r.id;
