-- PRIMERO: Eliminar usuario anterior si existe
DO $$
DECLARE
  uid UUID;
BEGIN
  SELECT id INTO uid FROM auth.users WHERE email = 'aprendiz@test.com';
  IF uid IS NOT NULL THEN
    DELETE FROM profiles WHERE id = uid;
    DELETE FROM auth.users WHERE id = uid;
  END IF;
END $$;

-- CREAR USUARIO NUEVO
DO $$
DECLARE
  new_id UUID := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_user_meta_data, created_at, updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_id,
    'authenticated',
    'authenticated',
    'aprendiz@test.com',
    crypt('123456', gen_salt('bf')),
    now(),
    '{"full_name":"Aprendiz de Prueba","document_number":"1234567890"}'::jsonb,
    now(),
    now()
  );

  -- Crear perfil
  INSERT INTO profiles (id, full_name, document_number, role_id, is_active)
  SELECT new_id, 'Aprendiz de Prueba', '1234567890', r.id, true
  FROM roles r
  WHERE r.name = 'APRENDIZ';
END $$;
