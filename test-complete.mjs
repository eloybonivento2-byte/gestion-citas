import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';

const BASE_URL = 'http://localhost:5173';
const SUPABASE_URL = 'https://zisushntyziyinvkfmgy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inppc3VzaG50eXppeWludmtmbWd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MDEzNTMsImV4cCI6MjA5MzQ3NzM1M30.X1MxQ8uJaZv7JD_jqv4QWWmiDgygBlL45ydwSNvEY7s';

const USERS = [
  { email: 'admin@test.com', password: 'Admin123!', fullName: 'Admin Principal', document: '1000000001', roleLabel: 'SUPERADMIN' },
  { email: 'coord@test.com', password: 'Coord123!', fullName: 'Coord Bienestar', document: '1000000002', roleLabel: 'COORDINACION' },
  { email: 'psico@test.com', password: 'Psico123!', fullName: 'Psicólogo SENA', document: '1000000003', roleLabel: 'PSICOLOGIA' },
  { email: 'enfer@test.com', password: 'Enfer123!', fullName: 'Enfermero SENA', document: '1000000004', roleLabel: 'ENFERMERIA' },
  { email: 'social@test.com', password: 'Social123!', fullName: 'Trabajo Social', document: '1000000005', roleLabel: 'TRABAJO_SOCIAL' },
  { email: 'aprendiz@test.com', password: 'Aprendiz123!', fullName: 'Aprendiz SENA', document: '1000000006', roleLabel: 'APRENDIZ' },
];

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function screenshot(page, name) {
  await page.screenshot({ path: `test-results/${name}.png`, fullPage: true });
  console.log(`📸 ${name}.png`);
}

// Check if users exist in profiles table
async function checkUsersExist() {
  const { data, error } = await supabase.from('profiles').select('email');
  if (error) return [];
  return data.map(p => p.email);
}

// Try to login a user
async function tryLogin(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return null;
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, roles(name), dependencies(name)')
    .eq('id', data.user.id)
    .single();
  
  await supabase.auth.signOut();
  return profile;
}

async function registerAndLogin(page, user) {
  console.log(`\n👤 Registrando: ${user.fullName}`);
  
  await page.goto(`${BASE_URL}/register`);
  await page.waitForLoadState('networkidle');
  await sleep(1500);

  await page.fill('input[name="full_name"]', user.fullName);
  await page.fill('input[name="document_number"]', user.document);
  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="password"]', user.password);
  await page.fill('input[name="confirmPassword"]', user.password);
  
  await screenshot(page, `register-${user.roleLabel}`);
  await page.click('button[type="submit"]');
  await sleep(3000);
  
  // Check if registration succeeded (redirected to login)
  const url = page.url();
  if (url.includes('/login')) {
    console.log(`  ✅ Registro OK, haciendo login...`);
  } else {
    console.log(`  ⚠️  Registro posiblemente falló, URL: ${url}`);
  }

  // Try to login
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  await sleep(1000);
  
  await page.fill('#login-email', user.email);
  await page.fill('#login-password', user.password);
  await page.click('button[type="submit"]');
  await sleep(3000);
  
  const loginUrl = page.url();
  const loggedIn = !loginUrl.includes('/login');
  console.log(`  ${loggedIn ? '✅' : '❌'} Login: ${loginUrl}`);
  return loggedIn;
}

async function loginDirectly(page, user) {
  console.log(`\n🔐 Login directo: ${user.email}`);
  
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  await sleep(1500);

  await page.fill('#login-email', user.email);
  await page.fill('#login-password', user.password);
  
  await screenshot(page, `login-${user.roleLabel}`);
  await page.click('button[type="submit"]');
  await sleep(4000);
  
  const url = page.url();
  const loggedIn = !url.includes('/login');
  console.log(`  ${loggedIn ? '✅' : '❌'} URL: ${url}`);
  return loggedIn;
}

async function navigateAllPages(page, user) {
  const role = user.roleLabel;
  console.log(`\n🗺️  Navegando como ${role}...`);

  // Dashboard based on role
  const routes = {
    APRENDIZ: '/dashboard',
    PSICOLOGIA: '/professional',
    ENFERMERIA: '/professional',
    TRABAJO_SOCIAL: '/professional',
    COORDINACION: '/coordination',
    SUPERADMIN: '/admin',
  };

  const dashboardRoute = routes[role] || '/dashboard';
  
  // Navigate to dashboard
  await page.goto(`${BASE_URL}${dashboardRoute}`);
  await page.waitForLoadState('networkidle');
  await sleep(2000);
  await screenshot(page, `${role.toLowerCase()}-dashboard`);
  console.log(`  ✅ Dashboard: ${dashboardRoute}`);

  // Navigate to profile
  await page.goto(`${BASE_URL}/profile`);
  await page.waitForLoadState('networkidle');
  await sleep(1500);
  await screenshot(page, `${role.toLowerCase()}-profile`);
  console.log(`  ✅ Perfil`);

  // Admin-specific pages
  if (role === 'SUPERADMIN') {
    // Users tab
    const usersBtn = page.locator('button:has-text("Usuarios")');
    if (await usersBtn.isVisible()) {
      await usersBtn.click();
      await sleep(1000);
      await screenshot(page, 'admin-users');
      console.log(`  ✅ Tab Usuarios`);
    }
    
    // Audit tab
    const auditBtn = page.locator('button:has-text("Auditoría")');
    if (await auditBtn.isVisible()) {
      await auditBtn.click();
      await sleep(1000);
      await screenshot(page, 'admin-audit');
      console.log(`  ✅ Tab Auditoría`);
    }
    
    // Config tab
    const configBtn = page.locator('button:has-text("Configuración")');
    if (await configBtn.isVisible()) {
      await configBtn.click();
      await sleep(1000);
      await screenshot(page, 'admin-config');
      console.log(`  ✅ Tab Configuración`);
    }
  }

  // Professional-specific: test filters
  if (['PSICOLOGIA', 'ENFERMERIA', 'TRABAJO_SOCIAL'].includes(role)) {
    const filters = ['Pendientes', 'Confirmadas', 'Historial', 'Canceladas'];
    for (const f of filters) {
      const btn = page.locator(`button:has-text("${f}")`);
      if (await btn.isVisible()) {
        await btn.click();
        await sleep(500);
      }
    }
    await screenshot(page, `${role.toLowerCase()}-filters`);
    console.log(`  ✅ Filtros probados`);
  }

  // Logout
  const logoutBtn = page.locator('.btn-logout');
  if (await logoutBtn.isVisible()) {
    await logoutBtn.click();
    await sleep(2000);
    console.log(`  ✅ Logout`);
  }
}

async function main() {
  console.log('🚀 TEST COMPLETO - SENA Bienestar');
  console.log('='.repeat(60));

  const fs = await import('fs');
  if (!fs.existsSync('test-results')) fs.mkdirSync('test-results');

  // First check if users exist
  console.log('\n📊 Verificando usuarios existentes...');
  const existingEmails = await checkUsersExist();
  console.log(`  Perfiles encontrados: ${existingEmails.length}`);
  
  // Check which users can login
  console.log('\n🔐 Verificando logins...');
  const canLogin = {};
  for (const user of USERS) {
    const profile = await tryLogin(user.email, user.password);
    canLogin[user.email] = !!profile;
    if (profile) {
      console.log(`  ✅ ${user.email} → ${profile.roles?.name}`);
    } else {
      console.log(`  ❌ ${user.email} → No puede login`);
    }
  }

  const browser = await chromium.launch({ 
    headless: false,
    executablePath: 'C:\\Users\\FORMACION\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe',
    args: ['--start-maximized']
  });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  try {
    // Phase 1: Public pages
    console.log('\n' + '='.repeat(60));
    console.log('📌 FASE 1: PÁGINAS PÚBLICAS');
    console.log('='.repeat(60));

    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    await sleep(1000);
    await screenshot(page, '01-home-page');
    console.log('✅ HomePage');

    await page.goto(`${BASE_URL}/unauthorized`);
    await page.waitForLoadState('networkidle');
    await sleep(1000);
    await screenshot(page, '02-unauthorized');
    console.log('✅ Unauthorized');

    await page.goto(`${BASE_URL}/pagina-inexistente`);
    await page.waitForLoadState('networkidle');
    await sleep(1000);
    await screenshot(page, '03-not-found');
    console.log('✅ NotFound');

    await page.goto(`${BASE_URL}/forgot-password`);
    await page.waitForLoadState('networkidle');
    await sleep(1000);
    await screenshot(page, '04-forgot-password');
    console.log('✅ ForgotPassword');

    await page.goto(`${BASE_URL}/reset-password`);
    await page.waitForLoadState('networkidle');
    await sleep(1000);
    await screenshot(page, '05-reset-password');
    console.log('✅ ResetPassword');

    // Phase 2: Register users (if needed)
    console.log('\n' + '='.repeat(60));
    console.log('📌 FASE 2: CREACIÓN DE USUARIOS');
    console.log('='.repeat(60));

    const usersToCreate = USERS.filter(u => !canLogin[u.email]);
    
    if (usersToCreate.length > 0) {
      console.log(`\n⚠️  ${usersToCreate.length} usuarios necesitan ser creados/confirmados`);
      console.log('  Ejecuta database/create-users.sql en Supabase SQL Editor');
      console.log('  Luego re-ejecuta este script\n');
      
      // Try to register each user
      for (const user of usersToCreate) {
        await registerAndLogin(page, user);
      }
    } else {
      console.log('✅ Todos los usuarios pueden hacer login');
    }

    // Phase 3: Login and navigate each role
    console.log('\n' + '='.repeat(60));
    console.log('📌 FASE 3: NAVEGACIÓN POR ROLES');
    console.log('='.repeat(60));

    for (const user of USERS) {
      const loggedIn = await loginDirectly(page, user);
      if (loggedIn) {
        await navigateAllPages(page, user);
      } else {
        console.log(`\n⏭️  Saltando ${user.email} (no puede login)`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ TEST COMPLETADO');
    console.log('📸 Screenshots en: test-results/');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error.message);
    await screenshot(page, 'error');
  } finally {
    await browser.close();
  }
}

main();
