import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://zisushntyziyinvkfmgy.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inppc3VzaG50eXppeWludmtmbWd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MDEzNTMsImV4cCI6MjA5MzQ3NzM1M30.X1MxQ8uJaZv7JD_jqv4QWWmiDgygBlL45ydwSNvEY7s';

const supabase = createClient(supabaseUrl, supabaseKey);

const USERS = [
  { email: 'admin@test.com', password: 'Admin123!', fullName: 'Admin Principal', document: '1000000001', roleId: 1, dependencyId: null },
  { email: 'coord@test.com', password: 'Coord123!', fullName: 'Coord Bienestar', document: '1000000002', roleId: 2, dependencyId: null },
  { email: 'psico@test.com', password: 'Psico123!', fullName: 'Psicólogo SENA', document: '1000000003', roleId: 3, dependencyId: 1 },
  { email: 'enfer@test.com', password: 'Enfer123!', fullName: 'Enfermero SENA', document: '1000000004', roleId: 4, dependencyId: 2 },
  { email: 'social@test.com', password: 'Social123!', fullName: 'Trabajo Social', document: '1000000005', roleId: 5, dependencyId: 3 },
  { email: 'aprendiz@test.com', password: 'Aprendiz123!', fullName: 'Aprendiz SENA', document: '1000000006', roleId: 6, dependencyId: null },
];

async function ensureDependencies() {
  console.log('📦 Verificando dependencias...');
  const deps = [
    { id: 1, name: 'Psicología', color: '#3b82f6' },
    { id: 2, name: 'Enfermería', color: '#22c55e' },
    { id: 3, name: 'Trabajo Social', color: '#f59e0b' },
  ];
  for (const dep of deps) {
    await supabase.from('dependencies').upsert(dep, { onConflict: 'id' });
  }
  console.log('✅ Dependencias listas');
}

async function ensureRoles() {
  console.log('🎭 Verificando roles...');
  const roles = [
    { id: 1, name: 'SUPERADMIN', description: 'Administrador con acceso total' },
    { id: 2, name: 'COORDINACION', description: 'Coordinación de bienestar' },
    { id: 3, name: 'PSICOLOGIA', description: 'Profesional de psicología' },
    { id: 4, name: 'ENFERMERIA', description: 'Profesional de enfermería' },
    { id: 5, name: 'TRABAJO_SOCIAL', description: 'Profesional de trabajo social' },
    { id: 6, name: 'APRENDIZ', description: 'Aprendiz SENA' },
  ];
  for (const role of roles) {
    await supabase.from('roles').upsert(role, { onConflict: 'id' });
  }
  console.log('✅ Roles listos');
}

async function createUser(user) {
  console.log(`\n👤 Creando: ${user.fullName} (${user.email})`);

  // 1. Check if user already exists in profiles
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', user.email)
    .single();

  if (existing) {
    console.log(`  ⏭️  Ya existe, saltando...`);
    return true;
  }

  // 2. Sign up via the auth API (this creates the user + triggers the profile)
  const { data, error } = await supabase.auth.signUp({
    email: user.email,
    password: user.password,
    options: {
      data: {
        full_name: user.fullName,
        document_number: user.document,
      },
    },
  });

  if (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return false;
  }

  if (data?.user) {
    console.log(`  ✅ Creado: ${data.user.id}`);

    // 3. Update role and dependency if the profile was created by trigger
    await supabase
      .from('profiles')
      .update({
        role_id: user.roleId,
        dependency_id: user.dependencyId,
        full_name: user.fullName,
        document_number: user.document,
      })
      .eq('email', user.email);

    console.log(`  📋 Rol asignado: ${user.roleId}`);
    return true;
  }

  return false;
}

async function testLogin(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, roles(name), dependencies(name)')
    .eq('id', data.user.id)
    .single();

  return { success: true, user: data.user, profile };
}

async function main() {
  console.log('🚀 CONFIGURACIÓN DE USUARIOS - SENA Bienestar');
  console.log('='.repeat(60));

  // Ensure schema data exists
  await ensureDependencies();
  await ensureRoles();

  // Create users
  console.log('\n' + '='.repeat(60));
  console.log('📝 CREANDO USUARIOS');
  console.log('='.repeat(60));

  let created = 0;
  for (const user of USERS) {
    const result = await createUser(user);
    if (result) created++;
  }

  console.log(`\n✅ ${created}/${USERS.length} usuarios procesados`);

  // Test logins
  console.log('\n' + '='.repeat(60));
  console.log('🔐 PROBANDO LOGINS');
  console.log('='.repeat(60));

  for (const user of USERS) {
    const result = await testLogin(user.email, user.password);
    if (result.success) {
      console.log(`✅ ${user.email} → ${result.profile?.roles?.name || 'sin rol'}`);
    } else {
      console.log(`❌ ${user.email} → ${result.error}`);
    }
  }

  // Sign out after tests
  await supabase.auth.signOut();

  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN');
  console.log('='.repeat(60));

  const { data: profiles } = await supabase
    .from('profiles')
    .select('full_name, email, role_id, roles(name), dependencies(name)');

  if (profiles) {
    console.log('\nPerfiles en la base de datos:');
    profiles.forEach(p => {
      console.log(`  • ${p.full_name} (${p.email}) → ${p.roles?.name} ${p.dependencies?.name ? `- ${p.dependencies.name}` : ''}`);
    });
  }
}

main().catch(console.error);
