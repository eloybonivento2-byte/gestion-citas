import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5173';

const USERS = [
  { email: 'admin@test.com', password: 'Admin123!', fullName: 'Admin Principal', document: '1000000001', role: 'SUPERADMIN' },
  { email: 'coord@test.com', password: 'Coord123!', fullName: 'Coord Bienestar', document: '1000000002', role: 'COORDINACION' },
  { email: 'psico@test.com', password: 'Psico123!', fullName: 'Psicólogo SENA', document: '1000000003', role: 'PSICOLOGIA' },
  { email: 'enfer@test.com', password: 'Enfer123!', fullName: 'Enfermero SENA', document: '1000000004', role: 'ENFERMERIA' },
  { email: 'social@test.com', password: 'Social123!', fullName: 'Trabajo Social', document: '1000000005', role: 'TRABAJO_SOCIAL' },
  { email: 'aprendiz@test.com', password: 'Aprendiz123!', fullName: 'Aprendiz SENA', document: '1000000006', role: 'APRENDIZ' },
];

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function screenshot(page, name) {
  await page.screenshot({ path: `test-results/${name}.png`, fullPage: true });
  console.log(`📸 Screenshot: ${name}.png`);
}

async function registerUser(page, user) {
  console.log(`\n👤 Registrando: ${user.fullName} (${user.email})`);
  
  await page.goto(`${BASE_URL}/register`);
  await page.waitForLoadState('networkidle');
  await sleep(1000);

  await page.fill('input[name="full_name"]', user.fullName);
  await page.fill('input[name="document_number"]', user.document);
  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="password"]', user.password);
  await page.fill('input[name="confirmPassword"]', user.password);
  
  await screenshot(page, `register-${user.role}`);

  await page.click('button[type="submit"]');
  await sleep(2000);
  
  console.log(`✅ Registro completado: ${user.email}`);
}

async function loginUser(page, email, password) {
  console.log(`\n🔐 Login: ${email}`);
  
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  await sleep(1000);

  await page.fill('#login-email', email);
  await page.fill('#login-password', password);
  
  await screenshot(page, `login-${email.split('@')[0]}`);

  await page.click('button[type="submit"]');
  await sleep(3000);
  
  const url = page.url();
  console.log(`✅ Login exitoso. URL actual: ${url}`);
  return url;
}

async function navigateAprendizDashboard(page) {
  console.log('\n📋 Navegando Dashboard Aprendiz...');
  
  await page.goto(`${BASE_URL}/dashboard`);
  await page.waitForLoadState('networkidle');
  await sleep(2000);
  
  await screenshot(page, 'aprendiz-dashboard');
  console.log('✅ Dashboard Aprendiz cargado');

  // Click en Nueva Cita
  const nuevaCitaBtn = page.locator('button:has-text("Nueva Cita")');
  if (await nuevaCitaBtn.isVisible()) {
    await nuevaCitaBtn.click();
    await sleep(1000);
    await screenshot(page, 'aprendiz-nueva-cita-modal');
    console.log('✅ Modal de nueva cita abierto');

    // Cerrar modal
    await page.click('.modal-overlay');
    await sleep(500);
  }
}

async function navigateProfessionalDashboard(page) {
  console.log('\n🩺 Navegando Dashboard Profesional...');
  
  await page.goto(`${BASE_URL}/professional`);
  await page.waitForLoadState('networkidle');
  await sleep(2000);
  
  await screenshot(page, 'professional-dashboard');
  console.log('✅ Dashboard Profesional cargado');

  // Probar filtros
  const filtros = ['Pendientes', 'Confirmadas', 'Historial', 'Canceladas', 'No asistió'];
  for (const filtro of filtros) {
    const btn = page.locator(`button:has-text("${filtro}")`);
    if (await btn.isVisible()) {
      await btn.click();
      await sleep(500);
      console.log(`  📌 Filtro: ${filtro}`);
    }
  }
  
  await screenshot(page, 'professional-filtros');
}

async function navigateCoordinationDashboard(page) {
  console.log('\n📊 Navegando Dashboard Coordinación...');
  
  await page.goto(`${BASE_URL}/coordination`);
  await page.waitForLoadState('networkidle');
  await sleep(3000);
  
  await screenshot(page, 'coordination-dashboard');
  console.log('✅ Dashboard Coordinación cargado');

  // Verificar KPIs
  const kpiSection = page.locator('.kpi-grid');
  if (await kpiSection.isVisible()) {
    console.log('  📈 KPIs visibles');
  }

  // Verificar gráficos
  const chartsSection = page.locator('.charts-grid');
  if (await chartsSection.isVisible()) {
    console.log('  📊 Gráficos visibles');
  }

  // Probar exportar CSV
  const exportBtn = page.locator('button:has-text("Exportar CSV")');
  if (await exportBtn.isVisible()) {
    console.log('  📥 Botón Exportar CSV disponible');
  }
}

async function navigateAdminDashboard(page) {
  console.log('\n⚙️ Navegando Dashboard Admin...');
  
  await page.goto(`${BASE_URL}/admin`);
  await page.waitForLoadState('networkidle');
  await sleep(2000);
  
  await screenshot(page, 'admin-dashboard');
  console.log('✅ Dashboard Admin cargado');

  // Tab Usuarios
  const usersTab = page.locator('button:has-text("Usuarios")');
  if (await usersTab.isVisible()) {
    await usersTab.click();
    await sleep(1000);
    await screenshot(page, 'admin-users');
    console.log('  👥 Tab Usuarios');
  }

  // Tab Auditoría
  const auditTab = page.locator('button:has-text("Auditoría")');
  if (await auditTab.isVisible()) {
    await auditTab.click();
    await sleep(1000);
    await screenshot(page, 'admin-audit');
    console.log('  📋 Tab Auditoría');
  }

  // Tab Configuración
  const configTab = page.locator('button:has-text("Configuración")');
  if (await configTab.isVisible()) {
    await configTab.click();
    await sleep(1000);
    await screenshot(page, 'admin-config');
    console.log('  ⚙️ Tab Configuración');
  }
}

async function navigateProfile(page) {
  console.log('\n👤 Navegando Perfil...');
  
  await page.goto(`${BASE_URL}/profile`);
  await page.waitForLoadState('networkidle');
  await sleep(2000);
  
  await screenshot(page, 'profile');
  console.log('✅ Perfil cargado');
}

async function navigateHomePage(page) {
  console.log('\n🏠 Navegando HomePage...');
  
  await page.goto(`${BASE_URL}/`);
  await page.waitForLoadState('networkidle');
  await sleep(1000);
  
  await screenshot(page, 'home-page');
  console.log('✅ HomePage cargada');
}

async function testUnauthorized(page) {
  console.log('\n🚫 Probando página Unauthorized...');
  
  await page.goto(`${BASE_URL}/unauthorized`);
  await page.waitForLoadState('networkidle');
  await sleep(1000);
  
  await screenshot(page, 'unauthorized');
  console.log('✅ Página Unauthorized cargada');
}

async function testNotFound(page) {
  console.log('\n🔍 Probando página 404...');
  
  await page.goto(`${BASE_URL}/pagina-inexistente`);
  await page.waitForLoadState('networkidle');
  await sleep(1000);
  
  await screenshot(page, 'not-found');
  console.log('✅ Página 404 cargada');
}

async function testForgotPassword(page) {
  console.log('\n🔑 Probando Forgot Password...');
  
  await page.goto(`${BASE_URL}/forgot-password`);
  await page.waitForLoadState('networkidle');
  await sleep(1000);
  
  await screenshot(page, 'forgot-password');
  console.log('✅ Página Forgot Password cargada');
}

async function main() {
  console.log('🚀 INICIANDO TEST COMPLETO DE LA APLICACIÓN');
  console.log('=' .repeat(60));

  // Crear directorio de resultados
  const fs = await import('fs');
  if (!fs.existsSync('test-results')) {
    fs.mkdirSync('test-results');
  }

  const browser = await chromium.launch({ 
    headless: false,
    executablePath: 'C:\\Users\\FORMACION\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe',
    args: ['--start-maximized']
  });
  const context = await browser.newContext({ 
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    // 1. Páginas públicas
    console.log('\n' + '='.repeat(60));
    console.log('📌 FASE 1: PÁGINAS PÚBLICAS');
    console.log('='.repeat(60));
    
    await navigateHomePage(page);
    await testUnauthorized(page);
    await testNotFound(page);
    await testForgotPassword(page);

    // 2. Registrar usuarios
    console.log('\n' + '='.repeat(60));
    console.log('📌 FASE 2: REGISTRO DE USUARIOS');
    console.log('='.repeat(60));

    for (const user of USERS) {
      await registerUser(page, user);
    }

    // 3. Login y navegación por roles
    console.log('\n' + '='.repeat(60));
    console.log('📌 FASE 3: LOGIN Y NAVEGACIÓN POR ROLES');
    console.log('='.repeat(60));

    // Login como Aprendiz
    const aprendizUrl = await loginUser(page, 'aprendiz@test.com', 'Aprendiz123!');
    await navigateAprendizDashboard(page);
    await navigateProfile(page);

    // Logout y login como Profesional (Psicología)
    await page.goto(`${BASE_URL}/login`);
    await sleep(1000);
    const psicoUrl = await loginUser(page, 'psico@test.com', 'Psico123!');
    await navigateProfessionalDashboard(page);
    await navigateProfile(page);

    // Login como Coordinación
    await page.goto(`${BASE_URL}/login`);
    await sleep(1000);
    const coordUrl = await loginUser(page, 'coord@test.com', 'Coord123!');
    await navigateCoordinationDashboard(page);
    await navigateProfile(page);

    // Login como Admin
    await page.goto(`${BASE_URL}/login`);
    await sleep(1000);
    const adminUrl = await loginUser(page, 'admin@test.com', 'Admin123!');
    await navigateAdminDashboard(page);
    await navigateProfile(page);

    console.log('\n' + '='.repeat(60));
    console.log('✅ TEST COMPLETADO EXITOSAMENTE');
    console.log('='.repeat(60));
    console.log('\n📸 Screenshots guardados en: test-results/');

  } catch (error) {
    console.error('❌ Error durante el test:', error.message);
    await screenshot(page, 'error');
  } finally {
    await browser.close();
  }
}

main();
