/**
 * GEOCONCRET S.A. — SENIOR UI/UX INTERACTION & MOTION ENGINE (v2.5)
 * Includes:
 * 1. Full-Width Motion Mega-Menu with Live Spotlight Preview Morphing
 * 2. Theme Engine (Light / Dark)
 * 3. Interactive Editorial Casework Switcher with 6s Auto-Play & Linear Progress Bar
 * 4. Dynamic Count-Up Number Animation on Scroll (easeOutQuart)
 * 5. Quick Technical Spec Sheet Preview & PDF Downloader Modal (ASTM / GRI-GM13)
 * 6. Material Roll Calculator, Project Filter, URL-aware Modal & FAQ Accordion
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initStickyHeader();
  initMotionMegaMenu();
  initCaseworkSwitcher();
  initCountUpStats();
  initSpecSheetModal();
  initMobileMenu();
  initEstimator();
  initFaqAccordion();
  initProjectFilters();
  initProjectModal();
  initContactForm();
  initInstagramCarousel();
  initHeroSlider();
  initScrollReveal();
});

/* ==========================================================================
   1. THEME ENGINE (Light / Dark)
   ========================================================================== */
function initThemeToggle() {
  const toggleBtn = document.getElementById('themeToggleBtn');
  const savedTheme = localStorage.getItem('geoconcret_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  if (!toggleBtn) return;

  toggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('geoconcret_theme', newTheme);
    updateThemeIcon(newTheme);
  });
}

function updateThemeIcon(theme) {
  const iconWrap = document.getElementById('themeIcon');
  if (!iconWrap) return;
  if (theme === 'dark') {
    iconWrap.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>
    `;
  } else {
    iconWrap.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>
    `;
  }
}

/* ==========================================================================
   2. STICKY HEADER ELEVATION & READING PROGRESS BAR (Screenshot 4 Detail)
   ========================================================================== */
function initStickyHeader() {
  const header = document.querySelector('.main-header');
  if (!header) return;

  // Inject ultra-fine reading progress bar at the bottom of the sticky header
  let progressBar = header.querySelector('.header-scroll-progress');
  if (!progressBar) {
    progressBar = document.createElement('div');
    progressBar.className = 'header-scroll-progress';
    header.appendChild(progressBar);
  }

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    if (scrollTop > 16) {
      header.classList.add('header-scrolled');
    } else {
      header.classList.remove('header-scrolled');
    }

    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight > 0) {
      const pct = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
      progressBar.style.width = `${pct}%`;
    }
  }, { passive: true });
}

/* ==========================================================================
   3. ARCHITECTURAL MOTION MEGA-MENU (Screenshot 2 Style + Live Preview)
   ========================================================================== */
function initMotionMegaMenu() {
  const header = document.querySelector('.main-header');
  const shell = document.getElementById('megaDrawerShell');
  const backdrop = document.getElementById('megaBackdrop');
  const triggerItems = document.querySelectorAll('.nav-item[data-mega-target]');
  const panels = document.querySelectorAll('.mega-panel');

  if (!header || !shell || !triggerItems.length) return;

  let closeTimer = null;

  function openMegaPanel(targetId, activeItem) {
    clearTimeout(closeTimer);

    triggerItems.forEach(item => item.classList.remove('mega-open'));
    if (activeItem) activeItem.classList.add('mega-open');

    panels.forEach(panel => {
      if (panel.id === targetId) {
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
      }
    });

    shell.classList.add('active');
    if (backdrop) backdrop.classList.add('active');
  }

  function scheduleClose() {
    closeTimer = setTimeout(() => {
      shell.classList.remove('active');
      if (backdrop) backdrop.classList.remove('active');
      triggerItems.forEach(item => item.classList.remove('mega-open'));
    }, 140);
  }

  triggerItems.forEach(item => {
    const targetId = item.getAttribute('data-mega-target');

    item.addEventListener('mouseenter', () => {
      openMegaPanel(targetId, item);
    });

    item.addEventListener('mouseleave', () => {
      scheduleClose();
    });
  });

  const plainItems = document.querySelectorAll('.nav-item:not([data-mega-target])');
  plainItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      scheduleClose();
    });
  });

  shell.addEventListener('mouseenter', () => {
    clearTimeout(closeTimer);
  });

  shell.addEventListener('mouseleave', () => {
    scheduleClose();
  });

  if (backdrop) {
    backdrop.addEventListener('click', () => {
      scheduleClose();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') scheduleClose();
  });

  // Live Spotlight Preview Morphing inside each Mega Panel
  panels.forEach(panel => {
    const links = panel.querySelectorAll('.mega-ledger-link[data-preview-title]');
    const spotCard = panel.querySelector('.mega-spotlight-card');
    if (!links.length || !spotCard) return;

    const spotImg = spotCard.querySelector('.mega-spotlight-img');
    const spotTag = spotCard.querySelector('.mega-spotlight-tag');
    const spotTitle = spotCard.querySelector('.mega-spotlight-title');
    const spotNum = spotCard.querySelector('.mega-spotlight-number');
    const spotUnit = spotCard.querySelector('.mega-spotlight-unit');

    links.forEach(link => {
      link.addEventListener('mouseenter', () => {
        const title = link.getAttribute('data-preview-title');
        const img = link.getAttribute('data-preview-img');
        const tag = link.getAttribute('data-preview-tag');
        const num = link.getAttribute('data-preview-num');
        const unit = link.getAttribute('data-preview-unit');
        const href = link.getAttribute('href');

        if (spotTitle && spotTitle.textContent !== title) {
          if (spotImg && img) {
            spotImg.style.opacity = '0.4';
            setTimeout(() => {
              spotImg.src = img;
              spotImg.style.opacity = '1';
            }, 90);
          }
          if (spotTag && tag) spotTag.textContent = tag;
          if (spotTitle && title) spotTitle.textContent = title;
          if (spotNum && num) spotNum.textContent = num;
          if (spotUnit && unit) spotUnit.textContent = unit;
          if (href) spotCard.setAttribute('href', href);
        }
      });
    });
  });
}

/* ==========================================================================
   4. CASEWORK SHOWCASE SWITCHER + 6s AUTO-PLAY WITH PROGRESS BAR
   ========================================================================== */
const caseworkData = [
  {
    id: "01",
    tag: "AEROPUERTO GUAYAQUIL / 2024",
    sector: "INFRAESTRUCTURA AEROPORTUARIA",
    indexText: "01 / 05",
    title: "Revestimiento y juntas constructivas en Aeropuerto J.J. de Olmedo",
    desc: "Revestimiento integral de fachada con panel de aluminio compuesto, instalación de juntas constructivas y pasamanos de acero inoxidable de alta resistencia, y juntas de contracción en plataformas de hormigón para tránsito aéreo continuo.",
    metricValue: "−32%",
    metricLabel: "costos de mantenimiento no programado en plataforma",
    image: "assets/images/obra-terreno.jpg",
    link: "proyectos.html?id=aeropuerto-guayaquil"
  },
  {
    id: "02",
    tag: "PUERTO SANTA ANA / 2023",
    sector: "EDIFICACIÓN DE GRAN ALTURA",
    indexText: "02 / 05",
    title: "Sistemas de juntas sísmicas en Torre Corporativa The Point",
    desc: "El rascacielos helicoidal más representativo del país. Geoconcret suministró e instaló los sistemas de juntas sísmicas y arquitectónicas en sus 36 niveles estructurales, garantizando absorción de derivas sin daño en acabados.",
    metricValue: "±50mm",
    metricLabel: "capacidad de desplazamiento sísmico multidireccional",
    image: "assets/images/juntas-arquitectonicas.png",
    link: "proyectos.html?id=the-point"
  },
  {
    id: "03",
    tag: "QUITO-TABABELA / 2024",
    sector: "TERMINALES & PISTAS AÉREAS",
    indexText: "03 / 05",
    title: "Estanqueidad y juntas de dilatación en Aeropuerto Mariscal Sucre",
    desc: "Sistemas avanzados de juntas arquitectónicas interiores de alto tráfico peatonal, juntas para cubiertas con membrana impermeable interna y juntas vehiculares de acero en accesos y puentes de abordaje.",
    metricValue: "+18K m²",
    metricLabel: "de áreas críticas intervenidas con sellado y juntas",
    image: "assets/images/juntas-dilatacion.png",
    link: "proyectos.html?id=aeropuerto-quito"
  },
  {
    id: "04",
    tag: "MANABÍ / 2024",
    sector: "MINERÍA & MEDIO AMBIENTE",
    indexText: "04 / 05",
    title: "Impermeabilización HDPE en Tanque de Relaves Minero",
    desc: "Revestimiento primario y secundario de cuencas de contención con Geomembrana HDPE de 2.0 mm y Geotextil No Tejido Geoprotex de 300 g/m² contra punzonamiento severo, auditado al 100% con canal de aire.",
    metricValue: "0.0%",
    metricLabel: "filtración al subsuelo verificada bajo norma ASTM D5820",
    image: "assets/images/relave-minero.webp",
    link: "proyectos.html?id=relave-minero"
  },
  {
    id: "05",
    tag: "RED TRONCAL / 2023",
    sector: "VÍAS Y PAVIMENTOS RÍGIDOS",
    indexText: "05 / 05",
    title: "Refuerzo geotécnico y juntas en Troncal Sto. Domingo - Quinindé",
    desc: "Estabilización de subrasante con Geomallas Biaxiales PET Geofortex y corte diamantado con sellado elastomérico de juntas de contracción en 64 km de pavimento rígido de alto tonelaje.",
    metricValue: "90%",
    metricLabel: "de las troncales viales principales del Ecuador intervenidas",
    image: "assets/images/instalacion-campo.jpg",
    link: "proyectos.html?id=troncal-vial"
  }
];

function initCaseworkSwitcher() {
  const navItems = document.querySelectorAll('.casework-nav-item');
  const imgEl = document.getElementById('cwImage');
  const tagEl = document.getElementById('cwTag');
  const sectorEl = document.getElementById('cwSector');
  const indexEl = document.getElementById('cwIndex');
  const titleEl = document.getElementById('cwTitle');
  const descEl = document.getElementById('cwDesc');
  const metricValEl = document.getElementById('cwMetricValue');
  const metricLblEl = document.getElementById('cwMetricLabel');
  const linkEl = document.getElementById('cwLink');
  const gridContainer = document.querySelector('.casework-editorial-grid');
  const autoBar = document.getElementById('cwAutoplayBar');
  const autoText = document.getElementById('cwAutoplayText');

  if (!navItems.length || !imgEl) return;

  const AUTO_DURATION = 6000; // 6 seconds per project
  let currentIndex = 0;
  let elapsed = 0;
  let lastTime = performance.now();
  let isPaused = false;

  // Inject progress bar inside each nav item if not present
  navItems.forEach(item => {
    if (!item.querySelector('.casework-item-progress')) {
      const prog = document.createElement('span');
      prog.className = 'casework-item-progress';
      item.appendChild(prog);
    }
  });

  function activateCase(index) {
    currentIndex = index;
    elapsed = 0;

    navItems.forEach((item, idx) => {
      const prog = item.querySelector('.casework-item-progress');
      if (idx === index) {
        item.classList.add('active');
        if (prog) prog.style.width = '0%';
      } else {
        item.classList.remove('active');
        if (prog) prog.style.width = '0%';
      }
    });

    const data = caseworkData[index];
    if (!data) return;

    imgEl.style.opacity = '0';
    titleEl.style.opacity = '0';

    setTimeout(() => {
      imgEl.src = data.image;
      imgEl.alt = data.title;
      tagEl.textContent = data.tag;
      sectorEl.textContent = data.sector;
      indexEl.textContent = data.indexText;
      titleEl.textContent = data.title;
      descEl.textContent = data.desc;
      metricValEl.textContent = data.metricValue;
      metricLblEl.textContent = data.metricLabel;
      if (linkEl) linkEl.href = data.link;

      imgEl.style.opacity = '1';
      titleEl.style.opacity = '1';
    }, 170);
  }

  navItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      activateCase(index);
    });
  });

  if (gridContainer) {
    gridContainer.addEventListener('mouseenter', () => {
      isPaused = true;
      if (autoBar) autoBar.classList.add('paused');
      if (autoText) autoText.textContent = 'PAUSADO (CURSOR ENCIMA)';
    });
    gridContainer.addEventListener('mouseleave', () => {
      isPaused = false;
      lastTime = performance.now();
      if (autoBar) autoBar.classList.remove('paused');
      if (autoText) autoText.textContent = 'AUTO-AVANCE · 06s';
    });
  }

  function tick(now) {
    const dt = now - lastTime;
    lastTime = now;

    if (!isPaused) {
      elapsed += dt;
      const pct = Math.min(100, (elapsed / AUTO_DURATION) * 100);
      const activeProg = navItems[currentIndex]?.querySelector('.casework-item-progress');
      if (activeProg) {
        activeProg.style.width = `${pct}%`;
      }

      if (elapsed >= AUTO_DURATION) {
        const nextIndex = (currentIndex + 1) % caseworkData.length;
        activateCase(nextIndex);
      }
    }

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

/* ==========================================================================
   5. DYNAMIC COUNT-UP NUMBERS ON SCROLL (easeOutQuart)
   ========================================================================== */
function initCountUpStats() {
  const statEls = document.querySelectorAll('[data-count-to]');
  if (!statEls.length) return;

  function animateValue(el) {
    const target = parseFloat(el.getAttribute('data-count-to')) || 0;
    const prefix = el.getAttribute('data-count-prefix') || '';
    const suffix = el.getAttribute('data-count-suffix') || '';
    const decimals = parseInt(el.getAttribute('data-count-decimals') || '0', 10);
    const duration = 1800;
    const startTime = performance.now();

    function step(now) {
      const progress = Math.min(1, (now - startTime) / duration);
      // easeOutQuart
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = target * eased;

      el.textContent = `${prefix}${current.toFixed(decimals)}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = `${prefix}${target.toFixed(decimals)}${suffix}`;
      }
    }

    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateValue(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });

    statEls.forEach(el => observer.observe(el));
  } else {
    statEls.forEach(el => animateValue(el));
  }
}

/* ==========================================================================
   6. TECHNICAL SPEC SHEET PREVIEW & PDF DOWNLOADER MODAL (ASTM / GRI)
   ========================================================================== */
const specSheetCatalog = {
  "hdpe": {
    code: "FICHA TÉCNICA · IMPERGEO-HDPE-GM13",
    title: "Geomembrana HDPE 1.50 mm Lisa / Texturada (Impergeo®)",
    norm: "Estándar GRI-GM13 & ASTM",
    description: "Membrana polimérica impermeable fabricada con resina virgen de polietileno de alta densidad (97.5% PE, 2.5% negro de humo y estabilizadores UV). Diseñada para contención minera, reservorios hídricos, camaroneras y rellenos sanitarios.",
    rows: [
      { prop: "Espesor Nominal Promedio", norm: "ASTM D5199", unit: "mm", val: "1.50 (±5%)" },
      { prop: "Densidad de Resina y Compuesto", norm: "ASTM D1505", unit: "g/cm³", val: "≥ 0.940" },
      { prop: "Resistencia a la Fluencia (Yield)", norm: "ASTM D6693", unit: "kN/m", val: "22.0" },
      { prop: "Resistencia a la Rotura (Break)", norm: "ASTM D6693", unit: "kN/m", val: "40.0" },
      { prop: "Elongación en la Rotura", norm: "ASTM D6693", unit: "%", val: "700%" },
      { prop: "Resistencia al Rasgado (Tear)", norm: "ASTM D1004", unit: "N", val: "187 N" },
      { prop: "Resistencia al Punzonamiento", norm: "ASTM D4833", unit: "N", val: "480 N" },
      { prop: "Contenido de Negro de Humo", norm: "ASTM D4218", unit: "%", val: "2.0% – 3.0%" },
      { prop: "Dimensiones de Rollo Estándar", norm: "Fábrica", unit: "m", val: "7.00 m × 140 m (980 m²)" }
    ]
  },
  "geotextil": {
    code: "FICHA TÉCNICA · GEOPROTEX-NT300",
    title: "Geotextil No Tejido Agujeteado 300 g/m² (Geoprotex®)",
    norm: "Estándar AASHTO M288 & ASTM",
    description: "Manta geosintética permeable de filamentos de polipropileno 100% virgen unidos mecánicamente por proceso de punzonado por agujas. Óptimo para amortiguamiento de geomembranas, filtración en subdrenes y separación vial.",
    rows: [
      { prop: "Masa por Unidad de Área (Gramaje)", norm: "ASTM D5261", unit: "g/m²", val: "300 g/m²" },
      { prop: "Resistencia a la Tracción Grab", norm: "ASTM D4632", unit: "N", val: "1,020 N" },
      { prop: "Elongación Grab", norm: "ASTM D4632", unit: "%", val: "> 50%" },
      { prop: "Resistencia al Punzonamiento CBR", norm: "ASTM D6241", unit: "N", val: "2,750 N" },
      { prop: "Resistencia al Rasgado Trapezoidal", norm: "ASTM D4533", unit: "N", val: "420 N" },
      { prop: "Permitividad Hidráulica", norm: "ASTM D4491", unit: "s⁻¹", val: "1.30 s⁻¹" },
      { prop: "Tamaño de Abertura Aparente (AOS)", norm: "ASTM D4751", unit: "mm", val: "0.15 mm (Tamiz #100)" },
      { prop: "Resistencia UV (500 horas)", norm: "ASTM D4355", unit: "%", val: "≥ 70% retenido" },
      { prop: "Dimensiones de Rollo", norm: "Fábrica", unit: "m", val: "4.00 m × 150 m (600 m²)" }
    ]
  },
  "geomalla": {
    code: "FICHA TÉCNICA · GEOFORTEX-BX40",
    title: "Geomalla Biaxial / Triaxial de Alto Módulo (Geofortex®)",
    norm: "Estándar GRI-GG1 / ASTM D6637",
    description: "Estructura polimérica extruida o tejida recubierta en PVC para confinamiento mecánico de agregados granulares en subbases de carreteras, plataformas logísticas y muros de suelo reforzado.",
    rows: [
      { prop: "Resistencia a la Tracción Última (MD/CMD)", norm: "ASTM D6637", unit: "kN/m", val: "40.0 / 40.0 kN/m" },
      { prop: "Resistencia al 2% de Deformación", norm: "ASTM D6637", unit: "kN/m", val: "14.0 / 14.0 kN/m" },
      { prop: "Resistencia al 5% de Deformación", norm: "ASTM D6637", unit: "kN/m", val: "28.0 / 28.0 kN/m" },
      { prop: "Eficiencia de Junta (Junction)", norm: "GRI-GG2", unit: "%", val: "≥ 93%" },
      { prop: "Tamaño de Abertura de Malla", norm: "Calibrado", unit: "mm", val: "38 mm × 38 mm" },
      { prop: "Rigidez Radial / Torsional", norm: "GRI-GG9", unit: "kg-cm/deg", val: "≥ 6.5" },
      { prop: "Reducción Estimada de Base Granular", norm: "Diseño AASHTO", unit: "%", val: "25% – 35%" },
      { prop: "Dimensiones de Rollo", norm: "Fábrica", unit: "m", val: "3.95 m × 100 m (395 m²)" }
    ]
  },
  "juntas-sismicas": {
    code: "FICHA TÉCNICA · GEOJUNTAS-ARQ-S50",
    title: "Sistema de Junta Arquitectónica y Sísmica (Geojuntas®)",
    norm: "Cumplimiento NEC-SE-DS & ASTM E1399",
    description: "Perfil estructural compuesto por rieles laterales de aluminio extrusionado 6063-T6 o acero inoxidable AISI 304/316 y fuelle elastomérico central o placa deslizante autocentrante para absorción sísmica en edificios.",
    rows: [
      { prop: "Aleación Metálica de Rieles", norm: "ASTM B221 / A240", unit: "Grado", val: "Aluminio 6063-T6 / Inox 304" },
      { prop: "Ancho de Junta Nominal", norm: "Diseño", unit: "mm", val: "50 mm a 250 mm" },
      { prop: "Capacidad de Movimiento Horizontal", norm: "ASTM E1399", unit: "%", val: "± 50% (±25 mm a ±125 mm)" },
      { prop: "Capacidad de Desplazamiento Lateral (Cizalla)", norm: "ASTM E1399", unit: "%", val: "100% multidireccional" },
      { prop: "Dureza del Sello Elastomérico EPDM", norm: "ASTM D2240", unit: "Shore A", val: "65 ± 5 Shore A" },
      { prop: "Capacidad de Carga Peatonal / Vehicular", norm: "Ensayo de Carga", unit: "kN", val: "Tráfico intenso / Autos / Camillas" },
      { prop: "Barrera Cortafuego Opcional", norm: "UL 2079 / ASTM E1966", unit: "Horas", val: "120 minutos" }
    ]
  },
  "juntas-dilatacion": {
    code: "FICHA TÉCNICA · GEOJUNTAS-DIL-BR100",
    title: "Junta de Dilatación Estructural para Puentes y Plataformas",
    norm: "Estándar AASHTO LRFD & ASTM D5973",
    description: "Sistema de junta de dilatación de alto impacto con membrana de estanqueidad continua y anclaje epóxico-mecánico para tableros de puentes, rampas aeroportuarias y estacionamientos multinivel.",
    rows: [
      { prop: "Rango de Dilatación Total", norm: "AASHTO", unit: "mm", val: "Hasta 100 mm (±50 mm)" },
      { prop: "Resistencia a la Tracción del Perfil EPDM", norm: "ASTM D412", unit: "MPa", val: "≥ 12.5 MPa" },
      { prop: "Elongación a la Rotura del Sello", norm: "ASTM D412", unit: "%", val: "≥ 380%" },
      { prop: "Estanqueidad al Agua", norm: "Ensayo Hidrostático", unit: "%", val: "100% Hermético" },
      { prop: "Resistencia al Envejecimiento por Ozono", norm: "ASTM D1149", unit: "Estado", val: "Sin grietas (70h @ 40°C)" },
      { prop: "Resistencia a la Compresión del Mortero Epóxico", norm: "ASTM C579", unit: "MPa", val: "≥ 75 MPa (24 horas)" }
    ]
  },
  "pavimentos": {
    code: "FICHA TÉCNICA · GEOCONCRET-PAV-PU",
    title: "Corte Diamantado y Sello Elastomérico en Pavimentos Rígidos",
    norm: "Norma MTOP / ASTM C920",
    description: "Sistema integral de inducción de juntas de contracción y expansión en losas de hormigón hidráulico mediante disco diamantado, colocación de Backer Rod de polietileno reticulado y sellador de poliuretano.",
    rows: [
      { prop: "Normativa del Sellador de Poliuretano", norm: "ASTM C920", unit: "Clase", val: "Tipo S, Grado NS/P, Clase 25/50" },
      { prop: "Capacidad de Movimiento de la Junta", norm: "ASTM C719", unit: "%", val: "± 35% a ± 50%" },
      { prop: "Alargamiento a la Rotura", norm: "ASTM D412", unit: "%", val: "> 600%" },
      { prop: "Dureza Shore A (Curado 28 días)", norm: "ASTM C661", unit: "Shore A", val: "25 – 35 Shore A" },
      { prop: "Cordón de Respaldo (Backer Rod)", norm: "ASTM C1330", unit: "Tipo", val: "Polietileno celda cerrada no absorbente" },
      { prop: "Factor de Forma Recomendado (Ancho:Prof.)", norm: "ACI 302 / MTOP", unit: "Relación", val: "2 : 1 (en juntas de calzada)" }
    ]
  }
};

function initSpecSheetModal() {
  // Dynamically create Spec Sheet Modal in DOM if not present
  let specOverlay = document.getElementById('specSheetModal');
  if (!specOverlay) {
    specOverlay = document.createElement('div');
    specOverlay.id = 'specSheetModal';
    specOverlay.className = 'modal-overlay';
    specOverlay.innerHTML = `
      <div class="modal-dialog" style="max-width: 820px;">
        <div class="modal-header">
          <span style="font-family: var(--font-mono); font-size: 0.76rem; font-weight: 600; color: var(--brand-navy); letter-spacing: 0.08em;">
            VISOR DE ESPECIFICACIÓN TÉCNICA · LABORATORIO & OBRA
          </span>
          <button id="specModalCloseBtn" class="modal-close-btn" aria-label="Cerrar">&times;</button>
        </div>
        <div id="specModalBody" class="modal-body"></div>
      </div>
    `;
    document.body.appendChild(specOverlay);
  }

  const closeBtn = document.getElementById('specModalCloseBtn');
  const bodyEl = document.getElementById('specModalBody');
  const triggers = document.querySelectorAll('[data-spec-id]');

  function closeSpecModal() {
    specOverlay.classList.remove('active');
  }

  if (closeBtn) closeBtn.addEventListener('click', closeSpecModal);
  specOverlay.addEventListener('click', (e) => {
    if (e.target === specOverlay) closeSpecModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && specOverlay.classList.contains('active')) closeSpecModal();
  });

  function openSpecModal(specKey) {
    const spec = specSheetCatalog[specKey];
    if (!spec || !bodyEl) return;

    bodyEl.innerHTML = `
      <div class="spec-sheet-banner">
        <div>
          <div class="spec-sheet-code">${spec.code}</div>
          <div class="spec-sheet-title">${spec.title}</div>
        </div>
        <span class="spec-sheet-stamp">${spec.norm}</span>
      </div>

      <p style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 18px;">
        ${spec.description}
      </p>

      <div class="spec-table-wrap">
        <table class="spec-modal-table">
          <thead>
            <tr>
              <th>Propiedad Técnica</th>
              <th>Norma de Ensayo</th>
              <th>Unidad</th>
              <th>Valor Certificado</th>
            </tr>
          </thead>
          <tbody>
            ${spec.rows.map(r => `
              <tr>
                <td style="font-weight: 500; color: var(--text-main);">${r.prop}</td>
                <td><span class="spec-norm-badge">${r.norm}</span></td>
                <td style="font-family: var(--font-mono); font-size: 0.78rem;">${r.unit}</td>
                <td style="font-weight: 600; color: var(--text-main);">${r.val}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
        <button id="btnPrintSpecPdf" class="btn-pill btn-pill-outline-dark" type="button">
          <span>Descargar / Imprimir Ficha (.PDF)</span>
          <span class="btn-arrow-circle">↓</span>
        </button>
        <a href="contacto.html" class="btn-pill btn-pill-brand">
          <span>Solicitar Cotización de este Material</span>
          <span class="btn-arrow-circle">→</span>
        </a>
      </div>
    `;

    const printBtn = document.getElementById('btnPrintSpecPdf');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        downloadSpecSheetDocument(spec);
      });
    }

    specOverlay.classList.add('active');
  }

  triggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const key = btn.getAttribute('data-spec-id');
      openSpecModal(key);
    });
  });
}

function downloadSpecSheetDocument(spec) {
  const printWin = window.open('', '_blank', 'width=860,height=720');
  if (!printWin) {
    window.print();
    return;
  }
  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>${spec.code} - Geoconcret S.A.</title>
      <style>
        body { font-family: Arial, Helvetica, sans-serif; color: #0f172a; padding: 40px; line-height: 1.5; }
        .head { border-bottom: 3px solid #133887; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
        .brand { font-size: 24px; font-weight: 800; color: #133887; letter-spacing: -0.02em; }
        .code { font-family: monospace; font-size: 12px; color: #e2062e; font-weight: bold; }
        h1 { font-size: 20px; margin: 0 0 10px; color: #0f172a; }
        p { font-size: 13px; color: #475569; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 13px; }
        th { background: #133887; color: #ffffff; text-align: left; padding: 10px 12px; font-size: 11px; text-transform: uppercase; }
        td { padding: 10px 12px; border-bottom: 1px solid #cbd5e1; }
        .foot { border-top: 1px solid #cbd5e1; padding-top: 14px; font-size: 11px; color: #64748b; display: flex; justify-content: space-between; }
      </style>
    </head>
    <body>
      <div class="head">
        <div>
          <div class="brand">GEOCONCRET S.A.</div>
          <div style="font-size:12px; color:#64748b;">Ingeniería en Geosintéticos, Juntas Arquitectónicas y Concreto · Desde 1999</div>
        </div>
        <div class="code">${spec.code}<br>${spec.norm}</div>
      </div>
      <h1>${spec.title}</h1>
      <p>${spec.description}</p>
      <table>
        <thead>
          <tr>
            <th>Propiedad Técnica</th>
            <th>Norma ASTM / GRI</th>
            <th>Unidad</th>
            <th>Valor Certificado</th>
          </tr>
        </thead>
        <tbody>
          ${spec.rows.map(r => `
            <tr>
              <td><strong>${r.prop}</strong></td>
              <td>${r.norm}</td>
              <td>${r.unit}</td>
              <td><strong>${r.val}</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="foot">
        <div>Quito: Edif. Cumbayá Garden Of. 306 · Guayaquil: Vía a la Costa · ventas@geoconcretsa.com</div>
        <div>Tel: +593 98 485 7802 / (02) 450-2222</div>
      </div>
      <script>
        window.onload = function() { window.print(); };
      <\/script>
    </body>
    </html>
  `;
  printWin.document.open();
  printWin.document.write(html);
  printWin.document.close();
}

/* ==========================================================================
   7. MOBILE NAVIGATION DRAWER
   ========================================================================== */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobileMenuToggle');
  const drawer = document.getElementById('mobileDrawer');
  const closeBtn = document.getElementById('closeMobileDrawer');

  if (!toggleBtn || !drawer) return;

  function openDrawer() {
    drawer.classList.add('active');
    toggleBtn.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('active');
    toggleBtn.classList.remove('is-active');
    document.body.style.overflow = '';
  }

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (drawer.classList.contains('active')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeDrawer();
    });
  }

  // Close when clicking outside drawer panel (on overlay backdrop)
  drawer.addEventListener('click', (e) => {
    if (e.target === drawer) {
      closeDrawer();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('active')) {
      closeDrawer();
    }
  });

  // Accordion Expand / Collapse inside Mobile Drawer
  const accordions = drawer.querySelectorAll('.mobile-nav-accordion');
  accordions.forEach((acc) => {
    const toggle = acc.querySelector('.mobile-accordion-toggle');

    if (toggle) {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const isOpen = acc.classList.contains('expanded');

        // Close other accordions for a crisp, organized accordion behavior
        accordions.forEach(other => {
          if (other !== acc) other.classList.remove('expanded');
        });

        if (isOpen) {
          acc.classList.remove('expanded');
        } else {
          acc.classList.add('expanded');
        }
      });
    }
  });

  // Auto-close drawer when clicking on any leaf navigation link
  const navLinks = drawer.querySelectorAll('.mobile-sublink, .mobile-nav-item:not(.mobile-nav-accordion) .mobile-nav-link, .mobile-cta-btn');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeDrawer();
    });
  });
}

/* ==========================================================================
   8. ESTIMATOR / CALCULATOR
   ========================================================================== */
function initEstimator() {
  const areaInput = document.getElementById('calcArea');
  const materialSelect = document.getElementById('calcMaterial');
  const resultMetric = document.getElementById('calcOutputRolls');
  const resultDetail = document.getElementById('calcOutputDetail');

  if (!areaInput || !materialSelect || !resultMetric) return;

  function calculate() {
    const area = parseFloat(areaInput.value) || 0;
    const material = materialSelect.value;

    let rollArea = 700;
    let overlap = 1.12;

    if (material === 'pvc') {
      rollArea = 300;
      overlap = 1.15;
    } else if (material === 'geotextil') {
      rollArea = 600;
      overlap = 1.10;
    } else if (material === 'geomalla') {
      rollArea = 400;
      overlap = 1.08;
    }

    if (area <= 0) {
      resultMetric.textContent = '0 Rollos';
      resultDetail.textContent = 'Ingresa los m² de tu proyecto para calcular la provisión estimada.';
      return;
    }

    const totalNeeded = area * overlap;
    const rolls = Math.ceil(totalNeeded / rollArea);

    resultMetric.textContent = `${rolls} ${rolls === 1 ? 'Rollo' : 'Rollos'}`;
    resultDetail.textContent = `Provisión técnica estimada: ~${Math.round(totalNeeded).toLocaleString()} m² (incluye factor de traslape térmico y anclaje perimetral en trinchera).`;
  }

  areaInput.addEventListener('input', calculate);
  materialSelect.addEventListener('change', calculate);
  calculate();
}

/* ==========================================================================
   9. FAQ ACCORDION
   ========================================================================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems[0].classList.add('active');

  faqItems.forEach(item => {
    const header = item.querySelector('.faq-question');
    if (!header) return;

    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');
      faqItems.forEach(i => i.classList.remove('active'));
      if (!isOpen) {
        item.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   10. PROJECT FILTERS (proyectos.html)
   ========================================================================== */
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card[data-category]');

  if (!filterBtns.length || !projectCards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   11. PROJECT MODAL POPUP (With URL ?id= auto-open support)
   ========================================================================== */
const projectDetails = {
  "aeropuerto-guayaquil": {
    title: "Aeropuerto Internacional José Joaquín de Olmedo",
    location: "Guayaquil, Ecuador",
    year: "2023 - 2024",
    client: "TAGSA / Concesionaria Aeroportuaria",
    scope: "Revestimiento de fachada con panel de aluminio compuesto (Alucobond), juntas constructivas de acero inoxidable de alta resistencia, pasamanos de acero inoxidable, juntas de contracción en plataformas de hormigón y cubiertas metálicas.",
    specifications: [
      "Material: Acero inoxidable AISI 304/316 & Alucobond",
      "Tipo de junta: Constructiva y contracción de alto impacto",
      "Ubicación: Zona de plataformas de desembarque y puentes de abordaje",
      "Garantía: Conforme a especificaciones de la DGAC y normas ASTM"
    ]
  },
  "the-point": {
    title: "Torre Corporativa The Point",
    location: "Puerto Santa Ana, Guayaquil",
    year: "2022 - 2023",
    client: "Pronobis / Consorcio Constructor",
    scope: "Suministro e instalación de sistemas de juntas arquitectónicas y sísmicas para pisos, paredes y cielorrasos en los 36 pisos del icónico rascacielos helicoidal.",
    specifications: [
      "Material: Perfiles de aluminio extrusionado con fuelles elastoméricos",
      "Capacidad sísmica: Movimiento multidireccional hasta ±50 mm",
      "Acabado: Enrasado con porcelanato y mármol de tráfico pesado",
      "Normativa: Cumplimiento NEC-SE-DS (Norma Ecuatoriana de la Construcción)"
    ]
  },
  "aeropuerto-quito": {
    title: "Aeropuerto Internacional Mariscal Sucre (Tababela)",
    location: "Quito, Ecuador",
    year: "2023 - 2024",
    client: "Quiport S.A.",
    scope: "Juntas de dilatación para cubiertas y áreas peatonales en terminal de pasajeros, además de juntas vehiculares de acero para rampas de servicio de aeronaves.",
    specifications: [
      "Tipo: Juntas de dilatación con membrana de estanqueidad impermeable",
      "Exposición: Intemperie de altura andina (2,400 msnm)",
      "Resistencia térmica: Resistencia a ciclado térmico extremo día/noche",
      "Tráfico: Vehicular pesado y peatonales de uso continuo"
    ]
  },
  "relave-minero": {
    title: "Impermeabilización de Tanque de Relaves Minero",
    location: "Manabí / Portoviejo",
    year: "2024",
    client: "Operación Minera & Ambiental",
    scope: "Instalación de sistema de revestimiento primario y secundario con Geomembrana HDPE Lisa de 2.0 mm, Geotextil Geoprotex 300g/m² y pruebas no destructivas de termofusión en doble costura con canal de aire a presión.",
    specifications: [
      "Área instalada: 45,000 m²",
      "Geosintéticos: Geomembrana HDPE 2.00 mm (GRI-GM13)",
      "Protección: Geotextil No Tejido Geoprotex 300 g/m²",
      "Control de Calidad: 100% de costuras ensayadas con aguja de aire y caja de vacío"
    ]
  },
  "troncal-vial": {
    title: "Troncal Santo Domingo - Quinindé",
    location: "Pichincha / Santo Domingo / Esmeraldas",
    year: "2022 - 2024",
    client: "MTOP / Contratistas Viales",
    scope: "Estabilización de subrasante y terraplenes mediante geomallas biaxiales PET Geofortex, más sellado elastomérico de juntas de contracción en losas de hormigón rígido.",
    specifications: [
      "Extensión: 64 kilómetros intervenidos",
      "Geomalla: Geofortex PET 40/40 kN/m",
      "Juntas de calzada: Corte y colocación de cordón de respaldo y sello de poliuretano",
      "Resultado: Reducción de fisuración refleja y prolongación de vida útil a 25 años"
    ]
  },
  "quicentro-shopping": {
    title: "Centro Comercial Quicentro Shopping",
    location: "Quito, Ecuador",
    year: "2023",
    client: "DK Management Services",
    scope: "Instalación de juntas arquitectónicas de bronce y acero inoxidable para pasos peatonales entre edificios, cubiertas acristaladas y parqueaderos subterráneos.",
    specifications: [
      "Material: Bronce arquitectónico y perfiles de acero inoxidable pulido",
      "Ubicación: Plazas de circulación principal y accesos comerciales",
      "Resistencia: Alto flujo peatonal (>50,000 personas/semana)"
    ]
  }
};

function initProjectModal() {
  const overlay = document.getElementById('projectModal');
  const closeBtn = document.getElementById('modalCloseBtn');
  const modalContent = document.getElementById('modalContentArea');
  const triggerBtns = document.querySelectorAll('.btn-view-project');

  if (!overlay) return;

  function renderAndOpenModal(projId) {
    const data = projectDetails[projId];
    if (!data || !modalContent) return;

    modalContent.innerHTML = `
      <div style="margin-bottom: 18px;">
        <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--brand-red); font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;">
          ${data.location} • ${data.year}
        </span>
        <h3 style="font-size: 1.6rem; margin-top: 6px; margin-bottom: 8px;">${data.title}</h3>
        <p style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 16px;">
          <strong>Cliente / Concesión:</strong> ${data.client}
        </p>
      </div>

      <div style="margin-bottom: 22px;">
        <h4 style="font-size: 0.95rem; margin-bottom: 8px; color: var(--brand-navy);">Alcance de Ingeniería Ejecutado:</h4>
        <p style="font-size: 0.925rem; color: var(--text-muted); line-height: 1.65;">${data.scope}</p>
      </div>

      <div style="background-color: var(--bg-alt); padding: 20px; border-radius: var(--radius-sm); border: 1px solid var(--border-hairline); margin-bottom: 24px;">
        <h4 style="font-size: 0.9rem; margin-bottom: 12px; color: var(--text-main);">Parámetros Técnicos & Normativa:</h4>
        <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px;">
          ${data.specifications.map(s => `
            <li style="font-size: 0.84rem; color: var(--text-secondary); display: flex; gap: 10px;">
              <span style="color: var(--brand-red); font-weight: bold;">✔</span>
              <span>${s}</span>
            </li>
          `).join('')}
        </ul>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 12px;">
        <a href="contacto.html" class="btn-pill btn-pill-brand">
          <span>Cotizar Solución Similar</span>
          <span class="btn-arrow-circle">→</span>
        </a>
      </div>
    `;

    overlay.classList.add('active');
  }

  function closeModal() {
    overlay.classList.remove('active');
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) closeModal();
  });

  triggerBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const projId = btn.getAttribute('data-project-id');
      renderAndOpenModal(projId);
    });
  });

  const params = new URLSearchParams(window.location.search);
  const urlProjId = params.get('id');
  if (urlProjId && projectDetails[urlProjId]) {
    setTimeout(() => renderAndOpenModal(urlProjId), 300);
  }
}

/* ==========================================================================
   12. CONTACT FORM VALIDATION
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const statusMsg = document.getElementById('formStatusMsg');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.querySelector('[name="nombre"]').value.trim();
    const email = form.querySelector('[name="email"]').value.trim();
    const phone = form.querySelector('[name="telefono"]').value.trim();

    if (!name || !email || !phone) {
      if (statusMsg) {
        statusMsg.style.display = 'block';
        statusMsg.style.background = 'var(--brand-red-tint)';
        statusMsg.style.color = 'var(--brand-red)';
        statusMsg.textContent = 'Por favor complete todos los campos obligatorios (*).';
      }
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Procesando requerimiento técnico...</span><span class="btn-arrow-circle">⋯</span>`;
    }

    setTimeout(() => {
      form.reset();
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>Solicitud Enviada con Éxito</span><span class="btn-arrow-circle">✔</span>`;
      }
      if (statusMsg) {
        statusMsg.style.display = 'block';
        statusMsg.style.background = 'var(--brand-navy-tint)';
        statusMsg.style.color = 'var(--brand-navy)';
        statusMsg.innerHTML = `
          <strong>¡Requerimiento registrado en Ingeniería!</strong><br>
          Un especialista de Geoconcret S.A. se pondrá en contacto en menos de 24 horas laborables.
        `;
      }
    }, 1000);
  });
}

/* ==========================================================================
   13. SCROLL REVEAL OBSERVER
   ========================================================================== */
function initScrollReveal() {
  const elements = document.querySelectorAll('.pillar-card, .project-card, .service-card-item, .standard-badge-item, .timeline-item');
  if (!('IntersectionObserver' in window) || !elements.length) return;

  elements.forEach(el => el.classList.add('reveal-up'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
}

/* ==========================================================================
   14. INSTAGRAM FULL-WIDTH CAROUSEL INTERACTIVITY
   ========================================================================== */
function initInstagramCarousel() {
  const outer = document.querySelector('.insta-carousel-outer');
  const track = document.querySelector('.insta-marquee-track');
  if (!outer || !track) return;

  let isDown = false;
  let startX = 0;

  outer.addEventListener('pointerdown', (e) => {
    isDown = true;
    startX = e.pageX;
    track.style.animationPlayState = 'paused';
  });

  window.addEventListener('pointerup', () => {
    if (isDown) {
      isDown = false;
      track.style.animationPlayState = '';
    }
  });

  window.addEventListener('pointercancel', () => {
    if (isDown) {
      isDown = false;
      track.style.animationPlayState = '';
    }
  });
}

/* ==========================================================================
   15. HERO BACKGROUND IMAGE SLIDER & FRIENDLY DOTS
   ========================================================================== */
function initHeroSlider() {
  const slider = document.getElementById('heroBgSlider');
  const dotsContainer = document.getElementById('heroSliderDots');
  if (!slider || !dotsContainer) return;

  const slides = slider.querySelectorAll('.hero-bg-slide');
  const dots = dotsContainer.querySelectorAll('.hero-dot');
  const prevBtn = document.getElementById('heroPrevBtn');
  const nextBtn = document.getElementById('heroNextBtn');
  const captionTag = document.getElementById('heroCaptionTag');
  const captionName = document.getElementById('heroCaptionName');

  if (!slides.length) return;

  const captions = [
    { tag: 'PROYECTO 01 / 03', name: 'Explanaciones y reservorios agrícolas' },
    { tag: 'PROYECTO 02 / 03', name: 'Termofusión técnica en campo' },
    { tag: 'PROYECTO 03 / 03', name: 'Depósitos de relave minero y taludes' }
  ];

  let currentIndex = 0;
  let autoTimer = null;
  const slideDuration = 6000; // 6s per slide

  function goToSlide(index) {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    currentIndex = index;

    slides.forEach((slide, i) => {
      if (i === currentIndex) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    dots.forEach((dot, i) => {
      const isActive = i === currentIndex;
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    if (captionTag && captionName && captions[currentIndex]) {
      captionTag.textContent = captions[currentIndex].tag;
      captionName.textContent = captions[currentIndex].name;
    }
  }

  function startTimer() {
    stopTimer();
    autoTimer = setInterval(() => {
      goToSlide(currentIndex + 1);
    }, slideDuration);
  }

  function stopTimer() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  dots.forEach((dot) => {
    dot.addEventListener('click', (e) => {
      e.preventDefault();
      const targetIdx = parseInt(dot.getAttribute('data-slide'), 10);
      if (!isNaN(targetIdx)) {
        goToSlide(targetIdx);
        startTimer();
      }
    });
  });

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      goToSlide(currentIndex - 1);
      startTimer();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      goToSlide(currentIndex + 1);
      startTimer();
    });
  }

  // Pause on hover over controls
  const controlsWrap = document.querySelector('.hero-slider-controls-wrap');
  if (controlsWrap) {
    controlsWrap.addEventListener('mouseenter', stopTimer);
    controlsWrap.addEventListener('mouseleave', startTimer);
    controlsWrap.addEventListener('focusin', stopTimer);
    controlsWrap.addEventListener('focusout', startTimer);
  }

  startTimer();
}

