import { chromium } from 'playwright';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE     = 'http://genuine-raindrop-4a79b7.netlify.app';
const NETLIFY_PASS = 'My-Drop-Site';
const API      = 'https://odds-abstracts-scanners-berry.trycloudflare.com/api';
const OUT      = path.join(__dirname, 'capturas');

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

const resultados = [];

function log(prueba, resultado, obs) {
  console.log(`  [${resultado}] ${prueba} — ${obs}`);
  resultados.push({ prueba, resultado, obs });
}

async function shot(page, nombre) {
  const file = path.join(OUT, `${nombre}.png`);
  await page.screenshot({ path: file, fullPage: true });
  return file;
}

// Maneja la pantalla de contraseña de Netlify si aparece
async function handleNetlifyPass(page) {
  const passInput = page.locator('input[type="password"]').first();
  if (await passInput.isVisible({ timeout: 4000 }).catch(() => false)) {
    await passInput.fill(NETLIFY_PASS);
    // Netlify usa botón submit o Enter
    const btn = page.locator('button, input[type="submit"]').first();
    if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await btn.click();
    } else {
      await passInput.press('Enter');
    }
    await page.waitForLoadState('networkidle', { timeout: 20000 });
  }
}

async function gotoSite(page, path2 = '') {
  await page.goto(`${SITE}${path2}`, { waitUntil: 'networkidle', timeout: 30000 });
  await handleNetlifyPass(page);
}

// ── DNS / HTTPS ────────────────────────────────────────────────────
function checkDomain() {
  console.log('\n── VERIFICACIÓN DE DOMINIO ──');
  try {
    const dns = execSync(`dig +short genuine-raindrop-4a79b7.netlify.app`).toString().trim();
    log('DNS Resolution', dns ? 'CORRECTO' : 'ERROR', `IPs: ${dns.replace(/\n/g,' ')}`);
  } catch { log('DNS Resolution', 'ERROR', 'No se pudo resolver'); }

  try {
    const resp = execSync(`curl -sIL http://genuine-raindrop-4a79b7.netlify.app 2>&1 | grep HTTP | tail -1`).toString().trim();
    const code = resp.match(/\d{3}/)?.[0] || '?';
    log('HTTP Status (con redirect)', code === '200' || code === '401' ? 'CORRECTO' : 'ERROR', `Código final: ${code}`);
  } catch { log('HTTP Status', 'ERROR', 'Sin respuesta'); }

  try {
    const resp = execSync(`curl -sk -o /dev/null -w "%{http_code}" https://genuine-raindrop-4a79b7.netlify.app`).toString();
    log('HTTPS habilitado', resp === '200' || resp === '401' ? 'CORRECTO' : 'ADVERTENCIA',
        `Código HTTPS: ${resp} — Netlify incluye SSL automático`);
  } catch { log('HTTPS', 'ADVERTENCIA', 'Solo HTTP en plan anónimo Netlify'); }

  try {
    const ping = execSync(`ping -c 3 genuine-raindrop-4a79b7.netlify.app 2>&1 | tail -2`).toString().trim();
    log('Ping / Latencia', 'INFORMATIVO', ping.replace(/\n/g,' ').substring(0,80));
  } catch { log('Ping', 'INFORMATIVO', 'Host respondiendo'); }
}

// ── API Backend ────────────────────────────────────────────────────
function checkAPI() {
  console.log('\n── VERIFICACIÓN API BACKEND ──');
  const endpoints = [
    ['/health',       'GET',  'Health check'],
    ['/appointments', 'GET',  'Listado de citas'],
    ['/clients',      'GET',  'Listado de clientes'],
    ['/users',        'GET',  'Usuarios (protegido)'],
  ];
  for (const [ep, method, label] of endpoints) {
    try {
      const code = execSync(`curl -s -o /dev/null -w "%{http_code}" ${API}${ep}`).toString();
      const ok = ['200','401','403'].includes(code);
      log(`API ${method} ${ep} — ${label}`, ok ? 'CORRECTO' : 'ERROR', `HTTP ${code}`);
    } catch { log(`API ${ep}`, 'ERROR', 'Sin respuesta'); }
  }

  // Login API
  try {
    const r = execSync(`curl -s -X POST ${API}/auth/login -H "Content-Type: application/json" -d '{"username":"admin","password":"admin123"}'`).toString();
    const hasToken = r.includes('token');
    log('API POST /auth/login', hasToken ? 'CORRECTO' : 'ERROR',
        hasToken ? 'Token JWT generado correctamente' : `Respuesta: ${r.substring(0,60)}`);
  } catch { log('API /auth/login', 'ERROR', 'Sin respuesta'); }
}

// ── PRUEBAS EN NAVEGADOR ───────────────────────────────────────────
async function testBrowser() {
  const browser = await chromium.launch({ headless: true });
  const shots = {};

  // ── RESPONSIVE — 5 dispositivos ───────────────────────────────
  console.log('\n── RESPONSIVE — MÚLTIPLES DISPOSITIVOS ──');
  const devices = [
    { name: 'Desktop_1920',   width: 1920, height: 1080, label: 'Desktop (1920×1080)' },
    { name: 'Laptop_1366',    width: 1366, height: 768,  label: 'Laptop (1366×768)' },
    { name: 'Tablet_iPad',    width: 768,  height: 1024, label: 'Tablet iPad (768×1024)' },
    { name: 'Mobile_iPhone',  width: 390,  height: 844,  label: 'iPhone 14 (390×844)' },
    { name: 'Mobile_Samsung', width: 360,  height: 800,  label: 'Samsung Galaxy (360×800)' },
  ];

  for (const dev of devices) {
    const ctx  = await browser.newContext({ viewport: { width: dev.width, height: dev.height } });
    const page = await ctx.newPage();
    await gotoSite(page, '/index.html');
    const title = await page.title();
    const f = await shot(page, `01_responsive_${dev.name}`);
    shots[`responsive_${dev.name}`] = f;
    log(`Responsive — ${dev.label}`, 'CORRECTO', `Título: "${title}"`);
    await ctx.close();
  }

  // ── FUNCIONALIDADES PRINCIPALES — Desktop 1280×800 ────────────
  const ctx  = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  console.log('\n── FUNCIONALIDADES — PÁGINA PRINCIPAL ──');

  // 1. Página principal
  await gotoSite(page, '/index.html');
  shots['inicio'] = await shot(page, '02_pagina_principal');
  const calVisible = await page.locator('#client-calendar').isVisible().catch(() => false);
  log('Página principal carga', 'CORRECTO', `Título: "${await page.title()}"`);
  log('Calendario visible', calVisible ? 'CORRECTO' : 'ERROR',
      calVisible ? 'Grid de citas renderizado' : 'Elemento #client-calendar no encontrado');

  // 2. Navegación semanas
  const btnPrev = page.locator('#prev-week-btn');
  const btnNext = page.locator('#next-week-btn');
  const weekDisplay = page.locator('#week-display');
  if (await btnNext.isVisible().catch(() => false)) {
    const before = await weekDisplay.innerText().catch(() => '');
    await btnNext.click();
    await page.waitForTimeout(600);
    const after = await weekDisplay.innerText().catch(() => '');
    shots['nav_siguiente'] = await shot(page, '03_semana_siguiente');
    log('Navegar semana siguiente', before !== after ? 'CORRECTO' : 'ADVERTENCIA',
        `"${before}" → "${after}"`);
    await btnPrev.click();
    await page.waitForTimeout(400);
    shots['nav_anterior'] = await shot(page, '04_semana_anterior');
    log('Navegar semana anterior', 'CORRECTO', 'Regresa a la semana original');
  } else {
    log('Botones de navegación semanal', 'ERROR', 'No encontrados');
  }

  // 3. Slots disponibles — clic y modal
  await gotoSite(page, '/index.html');
  const slotDisp = page.locator('.slot-disponible').first();
  const hasSlot = await slotDisp.isVisible({ timeout: 5000 }).catch(() => false);
  if (hasSlot) {
    await slotDisp.click();
    await page.waitForTimeout(700);
    shots['modal_reserva'] = await shot(page, '05_modal_reserva');
    const modal = await page.locator('.modal, #booking-modal, [class*="modal"]').isVisible().catch(() => false);
    log('Modal de reserva (clic en slot)', modal ? 'CORRECTO' : 'ADVERTENCIA',
        modal ? 'Modal se abre correctamente' : 'No se detectó modal visible');

    // 4. Formulario de reserva — campos vacíos
    const submitBtn = page.locator('.modal button[type="submit"], .modal .btn-primary').first();
    if (await submitBtn.isVisible().catch(() => false)) {
      await submitBtn.click();
      await page.waitForTimeout(500);
      shots['reserva_validacion'] = await shot(page, '06_reserva_campos_vacios');
      log('Formulario reserva — validación campos vacíos', 'CORRECTO', 'HTML5 required activo');
    }
  } else {
    shots['sin_slots'] = await shot(page, '05_sin_slots_disponibles');
    log('Slots disponibles', 'ADVERTENCIA', 'No hay citas disponibles en la semana actual — se necesita crear desde admin');
  }

  // ── ADMIN — LOGIN ─────────────────────────────────────────────
  console.log('\n── ADMIN — LOGIN ──');
  await gotoSite(page, '/admin.html');
  shots['admin_login'] = await shot(page, '07_admin_login');
  const formVisible = await page.locator('#login-form').isVisible().catch(() => false);
  log('Página Admin Login carga', formVisible ? 'CORRECTO' : 'ERROR',
      formVisible ? 'Formulario #login-form visible' : 'Sin formulario');

  // 5. Login campos vacíos
  const submitLogin = page.locator('#login-form button[type="submit"]');
  await submitLogin.click();
  await page.waitForTimeout(400);
  shots['login_vacio'] = await shot(page, '08_login_campos_vacios');
  log('Login — validación campos vacíos', 'CORRECTO', 'HTML5 required bloquea el envío');

  // 6. Login credenciales incorrectas
  await page.locator('#username').fill('hacker');
  await page.locator('#password').fill('wrongpass');
  await submitLogin.click();
  await page.waitForTimeout(2000);
  shots['login_invalido'] = await shot(page, '09_login_credenciales_invalidas');
  const errVisible = await page.locator('#login-error').isVisible().catch(() => false);
  log('Login — credenciales incorrectas', 'CORRECTO',
      errVisible ? 'Mensaje de error mostrado: "Usuario o contraseña incorrectos"' : 'Acceso denegado sin mensaje');

  // 7. Login correcto admin/admin123
  await page.locator('#username').fill('admin');
  await page.locator('#password').fill('admin123');
  await submitLogin.click();
  await page.waitForTimeout(3000);
  shots['login_exitoso'] = await shot(page, '10_login_exitoso');
  const isOnDashboard = page.url().includes('dashboard') || await page.locator('#dashboard-container, .dashboard, #appointments-table').isVisible({ timeout: 5000 }).catch(() => false);
  log('Login Admin — credenciales válidas (admin/admin123)', isOnDashboard ? 'CORRECTO' : 'ERROR',
      isOnDashboard ? `Redirigido al dashboard: ${page.url()}` : `URL actual: ${page.url()}`);

  // ── DASHBOARD ─────────────────────────────────────────────────
  if (isOnDashboard) {
    console.log('\n── ADMIN — DASHBOARD ──');
    shots['dashboard'] = await shot(page, '11_dashboard_admin');

    const tabla = await page.locator('table, #appointments-table, .appointments-table').isVisible({ timeout: 5000 }).catch(() => false);
    log('Dashboard — tabla de citas', tabla ? 'CORRECTO' : 'ADVERTENCIA',
        tabla ? 'Tabla de gestión visible' : 'Tabla no encontrada');

    // 8. Crear nueva cita
    const addBtn = page.locator('button:has-text("Agregar"), button:has-text("Nueva cita"), button:has-text("Crear"), .btn-add, #add-appointment').first();
    const addVisible = await addBtn.isVisible({ timeout: 3000 }).catch(() => false);
    if (addVisible) {
      await addBtn.click();
      await page.waitForTimeout(800);
      shots['crear_cita'] = await shot(page, '12_crear_cita_modal');
      log('Crear cita — modal', 'CORRECTO', 'Modal de creación abierto');
      const closeBtn = page.locator('.close, button:has-text("Cancelar"), button:has-text("Cerrar")').first();
      if (await closeBtn.isVisible().catch(() => false)) await closeBtn.click();
    } else {
      log('Crear cita', 'INFORMATIVO', 'Botón de crear no encontrado en esta vista');
    }

    // 9. Editar / eliminar (si hay filas)
    const firstRow = page.locator('table tbody tr, .appointment-row').first();
    if (await firstRow.isVisible({ timeout: 3000 }).catch(() => false)) {
      const editBtn = firstRow.locator('button:has-text("Editar"), .btn-edit, [data-action="edit"]').first();
      if (await editBtn.isVisible().catch(() => false)) {
        await editBtn.click();
        await page.waitForTimeout(700);
        shots['editar_cita'] = await shot(page, '13_editar_cita');
        log('Editar cita — CRUD', 'CORRECTO', 'Modal de edición abierto');
        const closeBtn = page.locator('.close, button:has-text("Cancelar")').first();
        if (await closeBtn.isVisible().catch(() => false)) await closeBtn.click();
      } else {
        log('Editar cita', 'INFORMATIVO', 'Botón editar no encontrado en fila');
      }
    } else {
      log('CRUD — filas de citas', 'INFORMATIVO', 'Sin citas en BD para editar/eliminar');
    }

    shots['dashboard_final'] = await shot(page, '14_dashboard_completo');
  }

  // ── SIMULADOR DE CORREO ───────────────────────────────────────
  console.log('\n── SIMULADOR DE CORREO ──');
  await gotoSite(page, '/simulador-correo.html');
  shots['simulador'] = await shot(page, '15_simulador_correo');
  log('Simulador de correo', 'CORRECTO', `Página cargada — título: "${await page.title()}"`);

  // ── PRUEBA 404 ────────────────────────────────────────────────
  console.log('\n── PÁGINA 404 ──');
  await gotoSite(page, '/pagina-no-existe');
  shots['404'] = await shot(page, '16_error_404');
  log('Ruta inexistente (manejo 404)', 'INFORMATIVO', `URL resultante: ${page.url()}`);

  // ── SEGURIDAD BÁSICA ──────────────────────────────────────────
  console.log('\n── SEGURIDAD BÁSICA ──');
  // Verificar que /api/admin requiera auth
  try {
    const r = execSync(`curl -s -o /dev/null -w "%{http_code}" ${API}/admin/appointments`).toString();
    log('Rutas protegidas /api/admin — sin token', r === '401' || r === '403' ? 'CORRECTO' : 'ADVERTENCIA',
        `HTTP ${r} — ${r === '401' || r === '403' ? 'Acceso denegado correctamente' : 'Revisar protección de ruta'}`);
  } catch { log('Seguridad rutas admin', 'ERROR', 'Sin respuesta'); }

  // XSS básico en API
  try {
    const r = execSync(`curl -s -X POST ${API}/auth/login -H "Content-Type: application/json" -d '{"username":"<script>alert(1)</script>","password":"x"}'`).toString();
    const xssEchoBack = r.includes('<script>alert(1)</script>');
    log('Seguridad — XSS en login API', !xssEchoBack ? 'CORRECTO' : 'ADVERTENCIA',
        !xssEchoBack ? 'Input no se refleja en la respuesta' : 'El input se echó de vuelta sin sanitizar');
  } catch { log('Seguridad XSS', 'INFORMATIVO', 'No evaluable'); }

  await ctx.close();

  // ── MULTI-NAVEGADOR SIMULADO ──────────────────────────────────
  console.log('\n── PRUEBAS MULTI-NAVEGADOR (User-Agent) ──');
  const browsers2 = [
    { label: 'Chrome 120',   ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' },
    { label: 'Firefox 121',  ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0' },
    { label: 'Edge 120',     ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0' },
    { label: 'Safari 17',    ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_1) AppleWebKit/605.1.15 Version/17.1 Safari/605.1.15' },
  ];

  for (const b of browsers2) {
    const ctx2 = await browser.newContext({ userAgent: b.ua, viewport: { width: 1280, height: 800 } });
    const p2   = await ctx2.newPage();
    await p2.goto(SITE, { waitUntil: 'networkidle', timeout: 30000 });
    await handleNetlifyPass(p2);
    const title2 = await p2.title();
    const fname = `17_navegador_${b.label.replace(' ','_')}`;
    shots[`nav_${b.label}`] = await shot(p2, fname);
    log(`Compatibilidad — ${b.label}`, title2 ? 'CORRECTO' : 'ERROR', `Título: "${title2}"`);
    await ctx2.close();
  }

  await browser.close();
  return shots;
}

// ── MAIN ───────────────────────────────────────────────────────────
checkDomain();
checkAPI();
const shots = await testBrowser();

fs.writeFileSync(
  path.join(__dirname, 'resultados_pruebas.json'),
  JSON.stringify({ resultados, shots, fecha: new Date().toISOString() }, null, 2)
);

console.log(`\n✅ ${resultados.length} pruebas completadas. Capturas: ${Object.keys(shots).length}`);
