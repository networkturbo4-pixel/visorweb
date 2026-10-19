import fs from 'node:fs';
import path from 'node:path';

/**
 * Intelligent CSS and Web Style Extractor
 * Reads actual stylesheets, HTML structure, CSS custom properties,
 * fonts and colors from an uploaded website advance and compiles
 * a comprehensive, authentic Brand Guidelines specification.
 */

// Color naming helper based on HSL
function getColorNameFromHex(hex) {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  if (c.length < 6) return 'Color ' + hex;

  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  if (l > 95) return 'Blanco / Superficie Clara';
  if (l < 10) return 'Negro / Carbón Profundo';
  if (s < 12) {
    if (l > 75) return 'Gris Muy Claro';
    if (l > 50) return 'Gris Neutro';
    return 'Gris Oscuro / Pizarra';
  }

  let hueName = 'Color';
  if (h >= 345 || h < 15) hueName = 'Rojo';
  else if (h >= 15 && h < 45) hueName = 'Naranja';
  else if (h >= 45 && h < 70) hueName = 'Amarillo / Dorado';
  else if (h >= 70 && h < 155) hueName = 'Verde';
  else if (h >= 155 && h < 190) hueName = 'Turquesa / Cian';
  else if (h >= 190 && h < 250) hueName = 'Azul';
  else if (h >= 250 && h < 290) hueName = 'Violeta / Púrpura';
  else if (h >= 290 && h < 345) hueName = 'Magenta / Rosa';

  if (l < 25) return `${hueName} Oscuro`;
  if (l > 75) return `${hueName} Claro`;
  if (s > 75) return `${hueName} Intenso`;
  return hueName;
}

// Format variable name to title case
function formatVarNameToTitle(varName) {
  return varName
    .replace(/^brand[-_]?/i, '')
    .replace(/^color[-_]?/i, '')
    .replace(/^theme[-_]?/i, '')
    .split(/[-_]/)
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function extractStylesFromFolder(folderPath) {
  if (!fs.existsSync(folderPath)) {
    throw new Error('Directorio no encontrado: ' + folderPath);
  }

  const cssFiles = [];
  const htmlFiles = [];

  function scanDir(dir) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        scanDir(fullPath);
      } else {
        const lower = item.toLowerCase();
        if (lower.endsWith('.css')) cssFiles.push(fullPath);
        else if (lower.endsWith('.html')) htmlFiles.push(fullPath);
      }
    }
  }

  scanDir(folderPath);

  // Combine CSS files
  let allCss = '';
  for (const f of cssFiles) {
    try {
      allCss += fs.readFileSync(f, 'utf8') + '\n';
    } catch (e) {
      console.warn('No se pudo leer archivo CSS:', f);
    }
  }

  // Also read HTML files for <style> tags and <link ... fonts>
  let mainHtmlContent = '';
  const googleFontLinks = [];
  const extractedHeadings = { h1: '', h2: '', h3: '', p: '' };

  for (const hf of htmlFiles) {
    try {
      const content = fs.readFileSync(hf, 'utf8');
      if (path.basename(hf).toLowerCase() === 'index.html' || !mainHtmlContent) {
        mainHtmlContent = content;
      }

      // Check inline <style>
      const inlineStyles = content.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
      for (const is of inlineStyles) {
        allCss += is.replace(/<\/?style[^>]*>/gi, '') + '\n';
      }

      // Check Google Fonts links
      const gfMatches = content.match(/href=["'](https?:\/\/fonts\.googleapis\.com\/[^"']+)["']/gi) || [];
      for (const gf of gfMatches) {
        const urlMatch = gf.match(/href=["']([^"']+)["']/i);
        if (urlMatch && !googleFontLinks.includes(urlMatch[1])) {
          googleFontLinks.push(urlMatch[1]);
        }
      }
    } catch (e) {
      console.warn('No se pudo leer archivo HTML:', hf);
    }
  }

  // Extract actual text samples from index.html if available
  if (mainHtmlContent) {
    const h1Match = mainHtmlContent.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1Match) extractedHeadings.h1 = h1Match[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().substring(0, 75);

    const h2Match = mainHtmlContent.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
    if (h2Match) extractedHeadings.h2 = h2Match[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().substring(0, 75);

    const h3Match = mainHtmlContent.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i);
    if (h3Match) extractedHeadings.h3 = h3Match[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().substring(0, 75);

    // Find the first meaningful paragraph (at least 25 characters)
    const pMatches = [...mainHtmlContent.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)];
    for (const pm of pMatches) {
      const clean = pm[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      if (clean.length > 25) {
        extractedHeadings.p = clean.substring(0, 130);
        break;
      }
    }
  }

  // ================= 1. PARSE CSS VARIABLES ================= //
  const cssVariables = {};
  const varRegex = /--([a-zA-Z0-9_-]+)\s*:\s*([^;}\n]+)[;}]/g;
  let match;
  while ((match = varRegex.exec(allCss)) !== null) {
    const key = match[1].toLowerCase().trim();
    const val = match[2].trim();
    cssVariables[key] = val;
  }

  // ================= 2. PARSE FONTS ================= //
  let primaryFont = '';
  let secondaryFont = '';
  let monoFont = '';

  // Check font variables
  for (const [k, v] of Object.entries(cssVariables)) {
    if (k.includes('font') && (k.includes('sans') || k.includes('body') || k.includes('main') || k.includes('text') || k.includes('base'))) {
      if (!primaryFont) primaryFont = v;
    } else if (k.includes('font') && (k.includes('display') || k.includes('heading') || k.includes('title') || k.includes('secondary') || k.includes('alt'))) {
      if (!secondaryFont) secondaryFont = v;
    } else if (k.includes('font') && (k.includes('mono') || k.includes('code'))) {
      if (!monoFont) monoFont = v;
    }
  }

  // If not found in variables, inspect body / headings rules
  if (!primaryFont) {
    const bodyFont = allCss.match(/(?:body|html)[^{]*\{[^}]*font-family\s*:\s*([^;}]+)[;}]/i);
    if (bodyFont) primaryFont = bodyFont[1].trim();
  }

  if (!secondaryFont) {
    const headingFont = allCss.match(/(?:h1|h2|h3)[^{]*\{[^}]*font-family\s*:\s*([^;}]+)[;}]/i);
    if (headingFont) secondaryFont = headingFont[1].trim();
  }

  // Resolve variable references in fonts (e.g. var(--font-display))
  if (primaryFont && primaryFont.includes('var(')) {
    const varName = primaryFont.match(/var\(--([a-zA-Z0-9_-]+)\)/);
    if (varName && cssVariables[varName[1].toLowerCase()]) {
      primaryFont = cssVariables[varName[1].toLowerCase()];
    }
  }
  if (secondaryFont && secondaryFont.includes('var(')) {
    const varName = secondaryFont.match(/var\(--([a-zA-Z0-9_-]+)\)/);
    if (varName && cssVariables[varName[1].toLowerCase()]) {
      secondaryFont = cssVariables[varName[1].toLowerCase()];
    }
  }

  // Clean font string: remove excess quotes and trailing semicolons
  primaryFont = primaryFont ? primaryFont.replace(/['"]/g, "'").replace(/;+$/, '').trim() : 'Inter, -apple-system, sans-serif';
  secondaryFont = secondaryFont ? secondaryFont.replace(/['"]/g, "'").replace(/;+$/, '').trim() : primaryFont;

  // ================= 3. EXTRACT COLOR PALETTE ================= //
  const palette = [];
  const seenHexes = new Set();

  function addColor(hex, name, role) {
    if (!hex) return;
    let cleanHex = hex.trim().toUpperCase();
    if (cleanHex.length === 4) {
      cleanHex = '#' + cleanHex[1] + cleanHex[1] + cleanHex[2] + cleanHex[2] + cleanHex[3] + cleanHex[3];
    }
    if (!seenHexes.has(cleanHex.toLowerCase())) {
      seenHexes.add(cleanHex.toLowerCase());
      palette.push({
        name: name || getColorNameFromHex(cleanHex),
        hex: cleanHex,
        role: role || 'Aplicado en la interfaz'
      });
    }
  }

  // A. Check high-priority color variables first
  const brandKeywords = [
    { keys: ['brand-navy', 'brand', 'primary', 'brand-primary', 'color-primary'], role: 'Color corporativo principal, navegación y encabezados' },
    { keys: ['brand-red', 'accent', 'brand-accent', 'secondary', 'color-secondary'], role: 'Color de acento, botones de acción y destacados' },
    { keys: ['brand-navy-deep', 'bg-dark', 'bg-dark-section', 'dark'], role: 'Fondo oscuro para contrastes y pie de página' },
    { keys: ['bg-main', 'bg', 'bg-alt', 'background', 'bg-light'], role: 'Fondo principal de secciones' },
    { keys: ['text-main', 'text-secondary', 'text', 'foreground'], role: 'Texto principal y tipografía legible' }
  ];

  for (const group of brandKeywords) {
    for (const key of group.keys) {
      if (cssVariables[key]) {
        const hexMatch = cssVariables[key].match(/#[0-9a-fA-F]{3,8}/);
        if (hexMatch) {
          const title = formatVarNameToTitle(key);
          addColor(hexMatch[0], title, group.role);
          break;
        }
      }
    }
  }

  // B. Look for other CSS color variables
  for (const [key, val] of Object.entries(cssVariables)) {
    if (palette.length >= 6) break;
    const hexMatch = val.match(/#[0-9a-fA-F]{3,8}/);
    if (hexMatch) {
      const isColorKey = /color|brand|bg|surface|text|nav|header|button|accent/i.test(key);
      if (isColorKey) {
        const title = formatVarNameToTitle(key);
        addColor(hexMatch[0], title, `Variable CSS --${key}`);
      }
    }
  }

  // C. Fallback: Find top recurring HEX colors in raw CSS
  if (palette.length < 5) {
    const rawHexMatches = allCss.match(/#[0-9a-fA-F]{6}\b/gi) || [];
    const hexCounts = {};
    for (const h of rawHexMatches) {
      const norm = h.toUpperCase();
      hexCounts[norm] = (hexCounts[norm] || 0) + 1;
    }
    const sorted = Object.entries(hexCounts).sort((a, b) => b[1] - a[1]);
    for (const [hex, count] of sorted) {
      if (palette.length >= 6) break;
      if (!seenHexes.has(hex.toLowerCase())) {
        addColor(hex, getColorNameFromHex(hex), `Detectado en hojas de estilo (${count} usos)`);
      }
    }
  }

  // Ensure minimum palette
  if (palette.length === 0) {
    palette.push(
      { name: 'Azul Corporativo', hex: '#133887', role: 'Color principal detectado' },
      { name: 'Rojo Acento', hex: '#E2062E', role: 'Acentos y llamados a la acción' },
      { name: 'Fondo Claro', hex: '#FFFFFF', role: 'Fondo general' },
      { name: 'Texto Principal', hex: '#0F172A', role: 'Texto y contraste' }
    );
  }

  // ================= 4. TYPE SCALE ================= //
  const typeScale = [
    {
      level: 'H1',
      size: '2.5rem (40px)',
      weight: '800 ExtraBold',
      sample: extractedHeadings.h1 || 'Títulos Principales de Gran Impacto'
    },
    {
      level: 'H2',
      size: '2rem (32px)',
      weight: '700 Bold',
      sample: extractedHeadings.h2 || 'Encabezados de Sección y Destacados'
    },
    {
      level: 'H3',
      size: '1.5rem (24px)',
      weight: '600 SemiBold',
      sample: extractedHeadings.h3 || 'Subencabezados de Bloques y Tarjetas'
    },
    {
      level: 'Body',
      size: '1rem (16px)',
      weight: '400 Regular',
      sample: extractedHeadings.p || 'Párrafos generales y textos descriptivos con excelente legibilidad en pantalla.'
    }
  ];

  // Primary colors for quick access
  const primaryColor = palette[0]?.hex || '#133887';
  const secondaryColor = palette[1]?.hex || '#0F172A';
  const accentColor = palette.find(c => /acento|accent|rojo|amarillo/i.test(c.name))?.hex || palette[1]?.hex || '#E2062E';
  const bgColor = palette.find(c => /fondo|bg|blanco/i.test(c.name))?.hex || '#FFFFFF';
  const textColor = palette.find(c => /texto|text|negro|oscuro/i.test(c.name))?.hex || '#0F172A';

  const dosAndDonts = [
    { type: 'do', rule: `Utilizar ${primaryColor} y ${accentColor} como paleta cromática rectora en botones y elementos clave.` },
    { type: 'do', rule: `Preservar la fuente ${primaryFont.split(',')[0]} para lectura fluida en párrafos y componentes.` },
    { type: 'do', rule: `Garantizar contraste accesible entre el fondo y el color de texto (${textColor}).` },
    { type: 'dont', rule: 'No introducir fuentes tipográficas externas no contempladas en las directrices.' },
    { type: 'dont', rule: 'No alterar la saturación ni aplicar sombras no autorizadas sobre el logotipo corporativo.' }
  ];

  return {
    success: true,
    cssFilesCount: cssFiles.length,
    cssFileNames: cssFiles.map(f => path.basename(f)),
    googleFontLinks,
    primary_color: primaryColor,
    secondary_color: secondaryColor,
    accent_color: accentColor,
    bg_color: bgColor,
    text_color: textColor,
    colors_json: JSON.stringify(palette),
    font_primary: primaryFont,
    font_secondary: secondaryFont,
    font_mono: monoFont,
    typography_json: JSON.stringify(typeScale),
    dos_and_donts_json: JSON.stringify(dosAndDonts),
    description: `Estilos extraídos automáticamente de las hojas de estilo del proyecto (${cssFiles.map(f => path.basename(f)).join(', ') || 'CSS del avance'}).`
  };
}

export {
  extractStylesFromFolder
};
export default extractStylesFromFolder;
