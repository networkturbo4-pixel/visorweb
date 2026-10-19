import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import db, { initDatabase } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function seedDemoData() {
  initDatabase();

  const countQuery = db.prepare('SELECT COUNT(*) as count FROM projects').get();
  if (countQuery.count > 0) {
    console.log('Database already contains projects. Skipping initial seed.');
    return;
  }

  console.log('Seeding demo project matching user upload screenshot...');

  // 1. Insert Project
  const insertProject = db.prepare(`
    INSERT INTO projects (name, client, description)
    VALUES (?, ?, ?)
  `);
  const projectResult = insertProject.run(
    'Portal Web Industrial - Maquinarias del Norte',
    'Consorcio Minero e Industrial S.A.C.',
    'Rediseño web corporativo con catálogo de maquinaria pesada, cotizaciones y cobertura de servicios a nivel nacional.'
  );
  const projectId = projectResult.lastInsertRowid;

  // 2. Insert Brand Guide
  const insertBrand = db.prepare(`
    INSERT INTO brand_guides (
      project_id, brand_name, tagline,
      primary_color, secondary_color, accent_color, background_color, text_color,
      colors_json, font_primary, font_secondary, typography_json,
      logo_url, guidelines_text, dos_and_donts_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const colors = [
    { name: 'Azul Industrial Primario', hex: '#0284C7', rgb: 'rgb(2, 132, 199)', usage: 'Encabezados, botones primarios, enlaces activos' },
    { name: 'Amarillo Caterpillar / Acento', hex: '#F59E0B', rgb: 'rgb(245, 158, 11)', usage: 'Llamados a la acción, insignias de estado, alertas' },
    { name: 'Gris Carbón / Secundario', hex: '#0F172A', rgb: 'rgb(15, 23, 42)', usage: 'Footer, barras de navegación, contrastes' },
    { name: 'Fondo Claro', hex: '#F8FAFC', rgb: 'rgb(248, 250, 252)', usage: 'Fondo principal de secciones' },
    { name: 'Texto Principal', hex: '#334155', rgb: 'rgb(51, 65, 85)', usage: 'Párrafos legibles de alta fidelidad' }
  ];

  const typography = {
    primary: 'Inter, system-ui, -apple-system, sans-serif',
    secondary: 'Montserrat, sans-serif',
    scale: [
      { tag: 'H1', size: '2.5rem (40px)', weight: '800 ExtraBold', sample: 'Potencia y Precisión en Maquinaria' },
      { tag: 'H2', size: '2rem (32px)', weight: '700 Bold', sample: 'Nuestros Servicios Especializados' },
      { tag: 'H3', size: '1.5rem (24px)', weight: '600 SemiBold', sample: 'Flota de Excavadoras y Grúas' },
      { tag: 'Body', size: '1rem (16px)', weight: '400 Regular', sample: 'Ofrecemos soluciones integrales de alquiler y venta con respaldo técnico 24/7.' }
    ]
  };

  const dosAndDonts = [
    { type: 'do', rule: 'Usar el color Amarillo (#F59E0B) exclusivamente para botones de contacto o solicitar cotización.' },
    { type: 'do', rule: 'Mantener un espacio de seguridad mínimo de 24px alrededor del isotipo y logotipo.' },
    { type: 'do', rule: 'Optimizar todas las imágenes de maquinaria en formato WebP con relación 16:9.' },
    { type: 'dont', rule: 'No deformar la proporción del logotipo ni cambiar su tipografía oficial.' },
    { type: 'dont', rule: 'No colocar texto de contraste bajo sobre imágenes de fondo oscuras sin overlay.' },
    { type: 'dont', rule: 'No usar gradientes chillones fuera de la paleta corporativa aprobada.' }
  ];

  insertBrand.run(
    projectId,
    'Maquinarias del Norte',
    'Líderes en Alquiler y Servicios de Maquinaria Pesada',
    '#0284C7',
    '#0F172A',
    '#F59E0B',
    '#F8FAFC',
    '#334155',
    JSON.stringify(colors),
    'Inter, sans-serif',
    'Montserrat, sans-serif',
    JSON.stringify(typography),
    '/assets/logo.svg',
    'La identidad de Maquinarias del Norte transmite robustez, confianza operativa, seguridad industrial y modernidad tecnológica.',
    JSON.stringify(dosAndDonts)
  );

  // 3. Create Sample Advance with files matching user's screenshot
  const uploadsDir = path.join(__dirname, 'uploads', 'advances', 'advance_1');
  const assetsDir = path.join(uploadsDir, 'assets');
  const cssDir = path.join(assetsDir, 'css');
  const imgDir = path.join(assetsDir, 'images');

  fs.mkdirSync(cssDir, { recursive: true });
  fs.mkdirSync(imgDir, { recursive: true });

  // CSS File
  const cssContent = `
:root {
  --primary: #0284c7;
  --primary-hover: #0369a1;
  --secondary: #0f172a;
  --accent: #f59e0b;
  --accent-hover: #d97706;
  --bg-light: #f8fafc;
  --text-dark: #0f172a;
  --text-muted: #64748b;
  --white: #ffffff;
  --border: #e2e8f0;
  --radius: 12px;
}
* { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', system-ui, sans-serif; }
body { background: var(--bg-light); color: var(--text-dark); line-height: 1.6; }
header { background: var(--secondary); color: var(--white); padding: 1rem 2rem; position: sticky; top: 0; z-index: 100; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
.nav-container { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
.logo { font-weight: 800; font-size: 1.25rem; display: flex; align-items: center; gap: 0.5rem; color: #fff; text-decoration: none; }
.logo span { color: var(--accent); }
nav ul { display: flex; list-style: none; gap: 1.5rem; align-items: center; }
nav a { color: #cbd5e1; text-decoration: none; font-weight: 500; font-size: 0.95rem; transition: color 0.2s; }
nav a:hover, nav a.active { color: var(--accent); font-weight: 600; }
.btn { display: inline-block; padding: 0.65rem 1.25rem; border-radius: 8px; font-weight: 600; text-decoration: none; transition: 0.2s; cursor: pointer; border: none; }
.btn-primary { background: var(--primary); color: #fff; }
.btn-primary:hover { background: var(--primary-hover); }
.btn-accent { background: var(--accent); color: var(--secondary); }
.btn-accent:hover { background: var(--accent-hover); }
.hero { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #fff; padding: 4rem 2rem; text-align: center; }
.hero-content { max-width: 800px; margin: 0 auto; }
.hero h1 { font-size: clamp(2rem, 5vw, 3.2rem); font-weight: 800; margin-bottom: 1rem; line-height: 1.2; }
.hero h1 span { color: var(--accent); }
.hero p { font-size: 1.15rem; color: #94a3b8; margin-bottom: 2rem; }
.container { max-width: 1200px; margin: 3rem auto; padding: 0 1.5rem; }
.section-title { text-align: center; margin-bottom: 2.5rem; }
.section-title h2 { font-size: 2rem; color: var(--secondary); font-weight: 700; }
.section-title p { color: var(--text-muted); }
.grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
.card { background: #fff; border: 1px solid var(--border); border-radius: var(--radius); padding: 1.75rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); transition: transform 0.2s, box-shadow 0.2s; }
.card:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
.card-icon { width: 48px; height: 48px; border-radius: 10px; background: rgba(2, 132, 199, 0.1); color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 1rem; }
.card h3 { font-size: 1.25rem; margin-bottom: 0.5rem; color: var(--secondary); }
.badge { display: inline-block; padding: 0.25rem 0.6rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; background: #e0f2fe; color: var(--primary); }
footer { background: #0b1120; color: #94a3b8; padding: 3rem 1.5rem 1.5rem; margin-top: 4rem; }
.footer-content { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 2rem; }
.footer-col h4 { color: #fff; margin-bottom: 1rem; }
.footer-col ul { list-style: none; }
.footer-col li { margin-bottom: 0.5rem; }
.footer-col a { color: #94a3b8; text-decoration: none; }
.footer-col a:hover { color: var(--accent); }
.copyright { text-align: center; border-top: 1px solid #1e293b; padding-top: 1.5rem; margin-top: 2rem; font-size: 0.85rem; }

@media (max-width: 768px) {
  nav ul { display: none; }
  .mobile-menu-btn { display: block; background: transparent; border: none; color: #fff; font-size: 1.5rem; cursor: pointer; }
  .grid-3 { grid-template-columns: 1fr; }
}
  `;
  fs.writeFileSync(path.join(cssDir, 'style.css'), cssContent);

  // Helper for generating page html
  function generateHtmlPage(title, activeNav, bodyContent) {
    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | Maquinarias del Norte</title>
  <link rel="stylesheet" href="assets/css/style.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body>
  <header>
    <div class="nav-container">
      <a href="index.html" class="logo">🚜 MAQUINARIAS <span>DEL NORTE</span></a>
      <nav>
        <ul>
          <li><a href="index.html" class="${activeNav === 'index' ? 'active' : ''}">Inicio</a></li>
          <li><a href="nosotros.html" class="${activeNav === 'nosotros' ? 'active' : ''}">Nosotros</a></li>
          <li><a href="servicios.html" class="${activeNav === 'servicios' ? 'active' : ''}">Servicios</a></li>
          <li><a href="maquinaria.html" class="${activeNav === 'maquinaria' ? 'active' : ''}">Maquinaria</a></li>
          <li><a href="proyectos.html" class="${activeNav === 'proyectos' ? 'active' : ''}">Proyectos</a></li>
          <li><a href="contacto.html" class="btn btn-accent ${activeNav === 'contacto' ? 'active' : ''}">Contacto</a></li>
        </ul>
      </nav>
    </div>
  </header>

  <main>
    ${bodyContent}
  </main>

  <footer>
    <div class="footer-content">
      <div class="footer-col">
        <h4>Maquinarias del Norte</h4>
        <p>Soluciones de ingeniería, alquiler y mantenimiento de equipo pesado para minería y construcción.</p>
      </div>
      <div class="footer-col">
        <h4>Enlaces Rápidos</h4>
        <ul>
          <li><a href="index.html">Inicio</a></li>
          <li><a href="maquinaria.html">Catálogo de Maquinaria</a></li>
          <li><a href="servicios.html">Servicios y Soporte</a></li>
          <li><a href="contacto.html">Solicitar Cotización</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Contacto 24/7</h4>
        <p>📞 (+51) 987 654 321</p>
        <p>✉️ ventas@maquinariasdelnorte.com</p>
        <p>📍 Parque Industrial Lote 14, Piura - Perú</p>
      </div>
    </div>
    <div class="copyright">
      &copy; 2026 Maquinarias del Norte S.A.C. Todos los derechos reservados.
    </div>
  </footer>
</body>
</html>`;
  }

  // 1. index.html
  const indexHtml = generateHtmlPage('Inicio', 'index', `
    <section class="hero">
      <div class="hero-content">
        <span class="badge" style="background:#fef3c7; color:#b45309; margin-bottom: 1rem;">Flota 2026 Disponible</span>
        <h1>Soluciones en <span>Maquinaria Pesada</span> para Grandes Obras</h1>
        <p>Alquiler, mantenimiento preventivo y venta de excavadoras, retroexcavadoras, cargadores frontales y grúas de alto tonelaje.</p>
        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
          <a href="maquinaria.html" class="btn btn-accent">Ver Catálogo de Equipos</a>
          <a href="contacto.html" class="btn btn-primary" style="background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3);">Cotizar Ahora</a>
        </div>
      </div>
    </section>

    <section class="container">
      <div class="section-title">
        <h2>¿Por qué elegir Maquinarias del Norte?</h2>
        <p>Respaldamos tu operación minera y civil con estándares internacionales.</p>
      </div>
      <div class="grid-3">
        <div class="card">
          <div class="card-icon">⚡</div>
          <h3>Disponibilidad Inmediata</h3>
          <p>Equipos listos para movilización a nivel nacional con certificación técnica al día.</p>
        </div>
        <div class="card">
          <div class="card-icon">🛠️</div>
          <h3>Soporte Técnico en Sitio</h3>
          <p>Mecánicos e ingenieros especializados disponibles 24/7 para garantizar cero paradas.</p>
        </div>
        <div class="card">
          <div class="card-icon">🛡️</div>
          <h3>Telemetría y GPS en Tiempo Real</h3>
          <p>Monitoreo continuo de consumo de combustible, horas de motor y diagnóstico remoto.</p>
        </div>
      </div>
    </section>
  `);
  fs.writeFileSync(path.join(uploadsDir, 'index.html'), indexHtml);

  // 2. maquinaria.html
  const maquinariaHtml = generateHtmlPage('Catálogo de Maquinaria', 'maquinaria', `
    <div class="container">
      <div class="section-title">
        <h2>Catálogo de Flota Pesada</h2>
        <p>Equipos modernos de marcas líderes: Caterpillar, Komatsu, Volvo y Liebherr.</p>
      </div>
      <div class="grid-3">
        <div class="card">
          <div style="height: 160px; background: #e2e8f0; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 3rem; margin-bottom: 1rem;">🚜</div>
          <span class="badge">Excavadoras</span>
          <h3 style="margin-top: 0.5rem;">Caterpillar 336D L</h3>
          <p style="color: var(--text-muted); font-size: 0.9rem;">Peso operativo: 36,000 kg | Cucharón: 2.3 m³ | Potencia: 268 HP</p>
          <a href="contacto.html" class="btn btn-primary" style="margin-top: 1rem; width: 100%; text-align: center;">Solicitar Alquiler</a>
        </div>
        <div class="card">
          <div style="height: 160px; background: #e2e8f0; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 3rem; margin-bottom: 1rem;">🚚</div>
          <span class="badge">Cargadores</span>
          <h3 style="margin-top: 0.5rem;">Komatsu WA470-8</h3>
          <p style="color: var(--text-muted); font-size: 0.9rem;">Capacidad de pala: 4.1 m³ | Potencia neta: 272 HP | Tier 4 Final</p>
          <a href="contacto.html" class="btn btn-primary" style="margin-top: 1rem; width: 100%; text-align: center;">Solicitar Alquiler</a>
        </div>
        <div class="card">
          <div style="height: 160px; background: #e2e8f0; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 3rem; margin-bottom: 1rem;">🏗️</div>
          <span class="badge">Grúas Móviles</span>
          <h3 style="margin-top: 0.5rem;">Liebherr LTM 1100</h3>
          <p style="color: var(--text-muted); font-size: 0.9rem;">Capacidad máx.: 100 Tn | Pluma telescópica: 60 m | Tracción 8x8</p>
          <a href="contacto.html" class="btn btn-primary" style="margin-top: 1rem; width: 100%; text-align: center;">Solicitar Alquiler</a>
        </div>
      </div>
    </div>
  `);
  fs.writeFileSync(path.join(uploadsDir, 'maquinaria.html'), maquinariaHtml);

  // 3. nosotros.html
  const nosotrosHtml = generateHtmlPage('Nosotros', 'nosotros', `
    <div class="container">
      <div class="section-title">
        <h2>Sobre Maquinarias del Norte</h2>
        <p>Más de 18 años impulsando las obras civiles y mineras más exigentes de la región.</p>
      </div>
      <div style="max-width: 800px; margin: 0 auto; background: #fff; padding: 2.5rem; border-radius: 12px; border: 1px solid var(--border);">
        <h3 style="color: var(--primary); margin-bottom: 1rem;">Nuestra Misión</h3>
        <p style="margin-bottom: 1.5rem;">Brindar soluciones seguras y eficientes en maquinaria pesada con la flota más moderna y el servicio técnico más ágil del mercado.</p>
        <h3 style="color: var(--primary); margin-bottom: 1rem;">Nuestra Visión</h3>
        <p style="margin-bottom: 1.5rem;">Ser el socio estratégico preferido en proyectos de infraestructura, minería y energía en todo el país para el 2030.</p>
        <div style="display: flex; gap: 2rem; border-top: 1px solid var(--border); padding-top: 1.5rem;">
          <div><h4 style="font-size: 2rem; color: var(--accent); font-weight: 800;">+250</h4><p>Equipos en Flota</p></div>
          <div><h4 style="font-size: 2rem; color: var(--accent); font-weight: 800;">99.4%</h4><p>Disponibilidad Mecánica</p></div>
          <div><h4 style="font-size: 2rem; color: var(--accent); font-weight: 800;">+450</h4><p>Proyectos Culminados</p></div>
        </div>
      </div>
    </div>
  `);
  fs.writeFileSync(path.join(uploadsDir, 'nosotros.html'), nosotrosHtml);

  // 4. servicios.html
  const serviciosHtml = generateHtmlPage('Servicios', 'servicios', `
    <div class="container">
      <div class="section-title">
        <h2>Nuestros Servicios Integrales</h2>
        <p>Acompañamos cada fase de tu operación con profesionalismo y seguridad.</p>
      </div>
      <div class="grid-3">
        <div class="card">
          <div class="card-icon">🔑</div>
          <h3>Alquiler con y sin Operador</h3>
          <p>Alquiler por horas, meses o años de maquinaria certificada con operadores homologados.</p>
        </div>
        <div class="card">
          <div class="card-icon">🔩</div>
          <h3>Mantenimiento y Reparación</h3>
          <p>Taller móvil equipado para intervenciones mecánicas, hidráulicas y electrónicas.</p>
        </div>
        <div class="card">
          <div class="card-icon">🚛</div>
          <h3>Transporte en Cama Baja</h3>
          <p>Logística pesada para traslado seguro de maquinaria a cualquier punto del país.</p>
        </div>
      </div>
    </div>
  `);
  fs.writeFileSync(path.join(uploadsDir, 'servicios.html'), serviciosHtml);

  // 5. proyectos.html
  const proyectosHtml = generateHtmlPage('Proyectos', 'proyectos', `
    <div class="container">
      <div class="section-title">
        <h2>Proyectos Destacados</h2>
        <p>Obras donde nuestra maquinaria ha sido protagonista.</p>
      </div>
      <div class="grid-3">
        <div class="card">
          <span class="badge" style="background:#dcfce7; color:#166534;">Minería</span>
          <h3 style="margin-top: 0.5rem;">Movimiento de Tierras Tajo Sur</h3>
          <p style="color: var(--text-muted);">Despliegue de 14 excavadoras y 20 volquetes operando a 4,200 msnm con 0 incidentes.</p>
        </div>
        <div class="card">
          <span class="badge" style="background:#e0e7ff; color:#3730a3;">Infraestructura</span>
          <h3 style="margin-top: 0.5rem;">Ampliación Autopista Panamericana</h3>
          <p style="color: var(--text-muted);">Asfaltado y nivelación de 45 km con motoniveladoras y rodillos vibratorios de última generación.</p>
        </div>
        <div class="card">
          <span class="badge" style="background:#fef3c7; color:#b45309;">Energía</span>
          <h3 style="margin-top: 0.5rem;">Montaje Parque Eólico Ventarrón</h3>
          <p style="color: var(--text-muted);">Izaje de aerogeneradores con grúas celosía de 400 toneladas.</p>
        </div>
      </div>
    </div>
  `);
  fs.writeFileSync(path.join(uploadsDir, 'proyectos.html'), proyectosHtml);

  // 6. contacto.html
  const contactoHtml = generateHtmlPage('Contacto', 'contacto', `
    <div class="container">
      <div class="section-title">
        <h2>Solicita una Cotización</h2>
        <p>Nuestro equipo de ingenieros de soporte te responderá en menos de 2 horas.</p>
      </div>
      <div style="max-width: 600px; margin: 0 auto; background: #fff; padding: 2rem; border-radius: 12px; border: 1px solid var(--border);">
        <form onsubmit="event.preventDefault(); alert('¡Cotización recibida con éxito! Te contactaremos pronto.');">
          <div style="margin-bottom: 1rem;">
            <label style="display:block; margin-bottom: 0.5rem; font-weight:600;">Nombre Completo / Empresa</label>
            <input type="text" placeholder="Ej: Minera Andes S.A." required style="width: 100%; padding: 0.75rem; border: 1px solid var(--border); border-radius: 6px;">
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display:block; margin-bottom: 0.5rem; font-weight:600;">Correo Electrónico</label>
            <input type="email" placeholder="correo@empresa.com" required style="width: 100%; padding: 0.75rem; border: 1px solid var(--border); border-radius: 6px;">
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display:block; margin-bottom: 0.5rem; font-weight:600;">Tipo de Equipo requerido</label>
            <select style="width: 100%; padding: 0.75rem; border: 1px solid var(--border); border-radius: 6px;">
              <option>Excavadora sobre orugas</option>
              <option>Cargador Frontal</option>
              <option>Grúa Móvil / Telescópica</option>
              <option>Motoniveladora</option>
              <option>Flota mixta completa</option>
            </select>
          </div>
          <div style="margin-bottom: 1.5rem;">
            <label style="display:block; margin-bottom: 0.5rem; font-weight:600;">Detalles del Proyecto y Ubicación</label>
            <textarea rows="4" placeholder="Duración estimada, lugar de la obra, requerimientos especiales..." style="width: 100%; padding: 0.75rem; border: 1px solid var(--border); border-radius: 6px;"></textarea>
          </div>
          <button type="submit" class="btn btn-accent" style="width: 100%; padding: 1rem; font-size: 1rem;">Enviar Solicitud de Cotización</button>
        </form>
      </div>
    </div>
  `);
  fs.writeFileSync(path.join(uploadsDir, 'contacto.html'), contactoHtml);

  // clean_site_text.txt
  fs.writeFileSync(path.join(uploadsDir, 'clean_site_text.txt'), 'Notas del proyecto Maquinarias del Norte:\n- Arquitectura de navegación aprobada.\n- Versión v1.0 lista para revisión de cliente.');

  // 4. Record advance in DB
  const insertAdvance = db.prepare(`
    INSERT INTO advances (project_id, version_name, notes, folder_path)
    VALUES (?, ?, ?, ?)
  `);
  const advanceResult = insertAdvance.run(
    projectId,
    'Entrega v1.0 - Estructura Completa y Vistas Responsivas',
    'Avance inicial con todas las páginas solicitadas: index, maquinaria, nosotros, servicios, proyectos y contacto.',
    'advance_1'
  );
  const advanceId = advanceResult.lastInsertRowid;

  // 5. Record pages in DB
  const insertPage = db.prepare(`
    INSERT INTO pages (advance_id, file_name, relative_path, title, file_size)
    VALUES (?, ?, ?, ?, ?)
  `);

  const pages = [
    { file: 'index.html', title: 'Inicio / Home', size: indexHtml.length },
    { file: 'maquinaria.html', title: 'Catálogo de Maquinaria', size: maquinariaHtml.length },
    { file: 'nosotros.html', title: 'Nosotros / Empresa', size: nosotrosHtml.length },
    { file: 'servicios.html', title: 'Servicios Integrales', size: serviciosHtml.length },
    { file: 'proyectos.html', title: 'Proyectos Realizados', size: proyectosHtml.length },
    { file: 'contacto.html', title: 'Contacto y Cotizaciones', size: contactoHtml.length }
  ];

  for (const p of pages) {
    insertPage.run(advanceId, p.file, p.file, p.title, p.size);
  }

  // 6. Record sample comments to demonstrate the feedback feature
  const insertComment = db.prepare(`
    INSERT INTO comments (advance_id, page_file, viewport_mode, pos_x, pos_y, author, role, category, content, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertComment.run(
    advanceId,
    'index.html',
    'desktop',
    48.5,
    32.0,
    'Carlos Mendoza',
    'Director de Marketing',
    'Diseño',
    'El botón "Ver Catálogo de Equipos" resalta excelente con el color de marca amarillo Caterpillar.',
    'resolved'
  );

  insertComment.run(
    advanceId,
    'maquinaria.html',
    'mobile',
    50.0,
    45.0,
    'Lucía Paredes',
    'Cliente',
    'Contenido',
    'En la vista móvil las especificaciones de las excavadoras se leen nítidas. Sugiero añadir el precio referencial por hora si es posible.',
    'pending'
  );

  insertComment.run(
    advanceId,
    'contacto.html',
    'both',
    null,
    null,
    'Ing. Roberto Gómez',
    'Gerente de Operaciones',
    'Funcionalidad',
    'El formulario de cotización funciona muy bien. Por favor revisar que el campo de teléfono valide números internacionales.',
    'pending'
  );

  console.log('Seed demo data created successfully! Project ID:', projectId, 'Advance ID:', advanceId);
}
