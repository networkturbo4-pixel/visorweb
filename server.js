import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import AdmZip from 'adm-zip';
import { execSync } from 'node:child_process';
import db, { initDatabase } from './db.js';
import { seedDemoData } from './seed.js';
import { extractStylesFromFolder } from './styleExtractor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Setup directories
const uploadsBaseDir = path.join(__dirname, 'uploads', 'advances');
const systemUploadsDir = path.join(__dirname, 'uploads', 'system');
const tempDir = path.join(__dirname, 'uploads', 'temp');
fs.mkdirSync(uploadsBaseDir, { recursive: true });
fs.mkdirSync(systemUploadsDir, { recursive: true });
fs.mkdirSync(tempDir, { recursive: true });

// Initialize Database & Seeds
initDatabase();
seedDemoData();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static assets
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.use('/system-assets', express.static(systemUploadsDir));

// Serve uploaded web project files for preview
app.use('/previews/:advanceId', (req, res, next) => {
  const { advanceId } = req.params;
  const advanceDir = path.join(uploadsBaseDir, advanceId);
  if (!fs.existsSync(advanceDir)) {
    return res.status(404).send('Directorio de avance no encontrado');
  }
  express.static(advanceDir)(req, res, next);
});

// Configure Multer for zip files
const storageZip = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tempDir),
  filename: (req, file, cb) => cb(null, `zip_${Date.now()}_${file.originalname}`)
});
const uploadZip = multer({ storage: storageZip });

// Configure Multer for folder/multiple files
const storageFolder = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tempDir),
  filename: (req, file, cb) => cb(null, `file_${Date.now()}_${Math.random().toString(36).substring(7)}_${path.basename(file.originalname)}`)
});
const uploadFolder = multer({ storage: storageFolder });

// Helper to recursively find HTML pages in a directory
function scanHtmlPages(dir, baseDir = dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const item of list) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(scanHtmlPages(fullPath, baseDir));
    } else if (item.toLowerCase().endsWith('.html') || item.toLowerCase().endsWith('.htm')) {
      const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      results.push({
        fileName: item,
        relativePath: relPath,
        size: stat.size
      });
    }
  }
  return results;
}

// ==================== REST APIS ==================== //

// 1. Projects API
app.get('/api/projects', (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT p.*,
        (SELECT COUNT(*) FROM advances a WHERE a.project_id = p.id) as advances_count,
        (SELECT COUNT(*) FROM comments c JOIN advances a ON c.advance_id = a.id WHERE a.project_id = p.id) as total_comments,
        (SELECT COUNT(*) FROM comments c JOIN advances a ON c.advance_id = a.id WHERE a.project_id = p.id AND c.status = 'pending') as pending_comments
      FROM projects p
      ORDER BY p.updated_at DESC
    `);
    const projects = stmt.all();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/projects', (req, res) => {
  try {
    const { name, client, description, custom_domain, previous_url } = req.body;
    if (!name) return res.status(400).json({ error: 'El nombre del proyecto es obligatorio' });

    const stmt = db.prepare('INSERT INTO projects (name, client, description, custom_domain, previous_url) VALUES (?, ?, ?, ?, ?)');
    const result = stmt.run(name, client || '', description || '', custom_domain || null, previous_url || null);
    const projectId = result.lastInsertRowid;

    // Create default brand guide for the project
    const brandStmt = db.prepare(`
      INSERT INTO brand_guides (
        project_id, brand_name, tagline,
        primary_color, secondary_color, accent_color, background_color, text_color,
        colors_json, font_primary, font_secondary, typography_json,
        guidelines_text, dos_and_donts_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const defaultColors = [
      { name: 'Color Primario', hex: '#2563EB', rgb: 'rgb(37, 99, 235)', usage: 'Botones principales, encabezados, links' },
      { name: 'Color Secundario', hex: '#0F172A', rgb: 'rgb(15, 23, 42)', usage: 'Navegación, pie de página, contraste' },
      { name: 'Color Acento', hex: '#10B981', rgb: 'rgb(16, 185, 129)', usage: 'Badges de éxito, acciones destacadas' },
      { name: 'Fondo de Interfaz', hex: '#F8FAFC', rgb: 'rgb(248, 250, 252)', usage: 'Fondo general' },
      { name: 'Texto Principal', hex: '#1E293B', rgb: 'rgb(30, 41, 59)', usage: 'Cuerpo de lectura' }
    ];

    const defaultTypography = {
      primary: 'Inter, system-ui, sans-serif',
      secondary: 'Montserrat, sans-serif',
      scale: [
        { tag: 'H1', size: '2.5rem', weight: '700 Bold', sample: 'Título de Gran Impacto' },
        { tag: 'H2', size: '2rem', weight: '600 SemiBold', sample: 'Sección Secundaria' },
        { tag: 'H3', size: '1.5rem', weight: '600 SemiBold', sample: 'Subtítulo Destacado' },
        { tag: 'Body', size: '1rem', weight: '400 Regular', sample: 'Texto base legible para párrafos explicativos.' }
      ]
    };

    const defaultDosAndDonts = [
      { type: 'do', rule: 'Mantener consistencia con la paleta de colores aprobada.' },
      { type: 'do', rule: 'Garantizar contraste accesible entre texto y fondo (mínimo 4.5:1).' },
      { type: 'dont', rule: 'No distorsionar la proporción ni modificar la tipografía del logotipo.' }
    ];

    brandStmt.run(
      projectId,
      name,
      'Identidad visual oficial de la propuesta',
      '#2563EB',
      '#0F172A',
      '#10B981',
      '#F8FAFC',
      '#1E293B',
      JSON.stringify(defaultColors),
      'Inter, sans-serif',
      'Montserrat, sans-serif',
      JSON.stringify(defaultTypography),
      'Guía básica de estilos aplicable al desarrollo web.',
      JSON.stringify(defaultDosAndDonts)
    );

    res.json({ id: projectId, name, client, description });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/projects/:id', (req, res) => {
  try {
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
    if (!project) return res.status(404).json({ error: 'Proyecto no encontrado' });

    const advances = db.prepare(`
      SELECT a.*,
        (SELECT COUNT(*) FROM pages p WHERE p.advance_id = a.id) as pages_count,
        (SELECT COUNT(*) FROM comments c WHERE c.advance_id = a.id) as comments_count,
        (SELECT COUNT(*) FROM comments c WHERE c.advance_id = a.id AND c.status = 'pending') as pending_comments
      FROM advances a
      WHERE a.project_id = ?
      ORDER BY a.created_at DESC
    `).all(req.params.id);

    const brandGuide = db.prepare('SELECT * FROM brand_guides WHERE project_id = ?').get(req.params.id);

    res.json({ project, advances, brandGuide });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Advances & Uploads API
// Upload via ZIP
app.post('/api/projects/:projectId/advances/upload-zip', uploadZip.single('zipFile'), (req, res) => {
  try {
    const { projectId } = req.params;
    const { versionName, notes } = req.body;
    if (!req.file) return res.status(400).json({ error: 'No se subió ningún archivo ZIP' });

    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
    if (!project) return res.status(404).json({ error: 'Proyecto no encontrado' });

    const folderName = `advance_${Date.now()}`;
    const destinationDir = path.join(uploadsBaseDir, folderName);
    fs.mkdirSync(destinationDir, { recursive: true });

    // Extract zip
    const zip = new AdmZip(req.file.path);
    zip.extractAllTo(destinationDir, true);

    // Clean temp file
    fs.unlinkSync(req.file.path);

    // If zip contains a single root folder that contains the files, elevate them if needed
    const rootItems = fs.readdirSync(destinationDir);
    if (rootItems.length === 1) {
      const singleItemPath = path.join(destinationDir, rootItems[0]);
      if (fs.statSync(singleItemPath).isDirectory()) {
        const subItems = fs.readdirSync(singleItemPath);
        for (const subItem of subItems) {
          fs.renameSync(path.join(singleItemPath, subItem), path.join(destinationDir, subItem));
        }
        fs.rmdirSync(singleItemPath);
      }
    }

    // Insert advance into DB
    const insertAdv = db.prepare(`
      INSERT INTO advances (project_id, version_name, notes, folder_path)
      VALUES (?, ?, ?, ?)
    `);
    const advResult = insertAdv.run(
      projectId,
      versionName || `Avance ${new Date().toLocaleDateString('es-ES')}`,
      notes || '',
      folderName
    );
    const advanceId = advResult.lastInsertRowid;

    // Scan for HTML pages
    const htmlFiles = scanHtmlPages(destinationDir);
    const insertPage = db.prepare(`
      INSERT INTO pages (advance_id, file_name, relative_path, title, file_size)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const file of htmlFiles) {
      const cleanTitle = file.fileName.replace(/\.html?$/i, '').replace(/[-_]/g, ' ');
      const title = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
      insertPage.run(advanceId, file.fileName, file.relativePath, title, file.size);
    }

    // Update project updated_at
    db.prepare('UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(projectId);

    // Auto-extract styles from website CSS and update Brand Guidelines
    let extractedStyles = null;
    try {
      extractedStyles = extractStylesFromFolder(destinationDir);
      db.prepare(`
        UPDATE brand_guides
        SET primary_color = ?,
            secondary_color = ?,
            accent_color = ?,
            background_color = ?,
            text_color = ?,
            colors_json = ?,
            font_primary = ?,
            font_secondary = ?,
            typography_json = ?,
            dos_and_donts_json = ?,
            guidelines_text = ?,
            google_fonts_json = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE project_id = ?
      `).run(
        extractedStyles.primary_color,
        extractedStyles.secondary_color,
        extractedStyles.accent_color,
        extractedStyles.bg_color,
        extractedStyles.text_color,
        extractedStyles.colors_json,
        extractedStyles.font_primary,
        extractedStyles.font_secondary,
        extractedStyles.typography_json,
        extractedStyles.dos_and_donts_json,
        extractedStyles.description,
        JSON.stringify(extractedStyles.googleFontLinks || []),
        projectId
      );
    } catch (e) {
      console.warn('Auto style extraction notice (zip):', e.message);
    }

    res.json({
      success: true,
      advanceId,
      folderName,
      pagesFound: htmlFiles.length,
      pages: htmlFiles,
      extractedStyles
    });
  } catch (err) {
    console.error('Error extracting zip:', err);
    res.status(500).json({ error: err.message });
  }
});

// Upload via Folder (multiple files with relative paths)
app.post('/api/projects/:projectId/advances/upload-folder', uploadFolder.array('files'), (req, res) => {
  try {
    const { projectId } = req.params;
    const { versionName, notes } = req.body;
    const paths = Array.isArray(req.body.paths) ? req.body.paths : [req.body.paths];

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No se recibieron archivos' });
    }

    const folderName = `advance_${Date.now()}`;
    const destinationDir = path.join(uploadsBaseDir, folderName);
    fs.mkdirSync(destinationDir, { recursive: true });

    // Place each uploaded file in its relative path
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      let relPath = (paths && paths[i]) ? paths[i] : file.originalname;

      // Clean leading slashes or root folder prefix if entire folder was dropped
      relPath = relPath.replace(/^(\/|\\)+/, '');
      const parts = relPath.split(/[/\\]/);
      if (parts.length > 1 && parts[0] === parts[0].trim()) {
        // preserve subfolder path
      }

      const targetPath = path.join(destinationDir, relPath);
      fs.mkdirSync(path.dirname(targetPath), { recursive: true });
      fs.copyFileSync(file.path, targetPath);
      fs.unlinkSync(file.path);
    }

    // If all files were inside a single top-level directory, flatten if necessary
    const rootItems = fs.readdirSync(destinationDir);
    const hasHtmlAtRoot = rootItems.some(item => item.toLowerCase().endsWith('.html'));
    if (!hasHtmlAtRoot && rootItems.length === 1) {
      const singleItemPath = path.join(destinationDir, rootItems[0]);
      if (fs.statSync(singleItemPath).isDirectory()) {
        const subItems = fs.readdirSync(singleItemPath);
        for (const subItem of subItems) {
          fs.renameSync(path.join(singleItemPath, subItem), path.join(destinationDir, subItem));
        }
        fs.rmdirSync(singleItemPath);
      }
    }

    // Record advance
    const insertAdv = db.prepare(`
      INSERT INTO advances (project_id, version_name, notes, folder_path)
      VALUES (?, ?, ?, ?)
    `);
    const advResult = insertAdv.run(
      projectId,
      versionName || `Avance ${new Date().toLocaleDateString('es-ES')}`,
      notes || '',
      folderName
    );
    const advanceId = advResult.lastInsertRowid;

    // Scan pages
    const htmlFiles = scanHtmlPages(destinationDir);
    const insertPage = db.prepare(`
      INSERT INTO pages (advance_id, file_name, relative_path, title, file_size)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const file of htmlFiles) {
      const cleanTitle = file.fileName.replace(/\.html?$/i, '').replace(/[-_]/g, ' ');
      const title = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
      insertPage.run(advanceId, file.fileName, file.relativePath, title, file.size);
    }

    db.prepare('UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(projectId);

    // Auto-extract styles from website CSS and update Brand Guidelines
    let extractedStyles = null;
    try {
      extractedStyles = extractStylesFromFolder(destinationDir);
      db.prepare(`
        UPDATE brand_guides
        SET primary_color = ?,
            secondary_color = ?,
            accent_color = ?,
            background_color = ?,
            text_color = ?,
            colors_json = ?,
            font_primary = ?,
            font_secondary = ?,
            typography_json = ?,
            dos_and_donts_json = ?,
            guidelines_text = ?,
            google_fonts_json = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE project_id = ?
      `).run(
        extractedStyles.primary_color,
        extractedStyles.secondary_color,
        extractedStyles.accent_color,
        extractedStyles.bg_color,
        extractedStyles.text_color,
        extractedStyles.colors_json,
        extractedStyles.font_primary,
        extractedStyles.font_secondary,
        extractedStyles.typography_json,
        extractedStyles.dos_and_donts_json,
        extractedStyles.description,
        JSON.stringify(extractedStyles.googleFontLinks || []),
        projectId
      );
    } catch (e) {
      console.warn('Auto style extraction notice (folder):', e.message);
    }

    res.json({
      success: true,
      advanceId,
      folderName,
      pagesFound: htmlFiles.length,
      pages: htmlFiles,
      extractedStyles
    });
  } catch (err) {
    console.error('Error processing folder upload:', err);
    res.status(500).json({ error: err.message });
  }
});

// Advance details & pages
app.get('/api/advances/:advanceId', (req, res) => {
  try {
    const advance = db.prepare(`
      SELECT a.*, p.name as project_name, p.client as project_client
      FROM advances a
      JOIN projects p ON a.project_id = p.id
      WHERE a.id = ?
    `).get(req.params.advanceId);

    if (!advance) return res.status(404).json({ error: 'Avance no encontrado' });

    const pages = db.prepare('SELECT * FROM pages WHERE advance_id = ? ORDER BY id ASC').all(req.params.advanceId);
    res.json({ advance, pages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Comments API
app.get('/api/advances/:advanceId/comments', (req, res) => {
  try {
    const { page } = req.query;
    let query = 'SELECT * FROM comments WHERE advance_id = ?';
    const params = [req.params.advanceId];

    if (page && page !== 'all') {
      query += ' AND (page_file = ? OR page_file = "all")';
      params.push(page);
    }

    query += ' ORDER BY created_at DESC';
    const comments = db.prepare(query).all(...params);
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/advances/:advanceId/comments', (req, res) => {
  try {
    const { advanceId } = req.params;
    const { page_file, viewport_mode, pos_x, pos_y, author, role, category, content, snapshot_image, element_info } = req.body;

    if (!content || !author) {
      return res.status(400).json({ error: 'Autor y comentario son obligatorios' });
    }

    const stmt = db.prepare(`
      INSERT INTO comments (
        advance_id, page_file, viewport_mode, pos_x, pos_y, author, role, category, content, snapshot_image, element_info, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `);

    const result = stmt.run(
      advanceId,
      page_file || 'index.html',
      viewport_mode || 'both',
      pos_x !== undefined && pos_x !== null ? Number(pos_x) : null,
      pos_y !== undefined && pos_y !== null ? Number(pos_y) : null,
      author,
      role || 'Cliente',
      category || 'General',
      content,
      snapshot_image || null,
      element_info || null
    );

    const newComment = db.prepare('SELECT * FROM comments WHERE id = ?').get(result.lastInsertRowid);
    res.json(newComment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/comments/:commentId/status', (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'in_progress', 'resolved'].includes(status)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }
    db.prepare('UPDATE comments SET status = ? WHERE id = ?').run(status, req.params.commentId);
    res.json({ success: true, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/comments/:commentId', (req, res) => {
  try {
    db.prepare('DELETE FROM comments WHERE id = ?').run(req.params.commentId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Brand Guide API
app.get('/api/projects/:projectId/brand-guide', (req, res) => {
  try {
    let guide = db.prepare('SELECT * FROM brand_guides WHERE project_id = ?').get(req.params.projectId);
    if (!guide) {
      // Create empty if not exists
      db.prepare('INSERT INTO brand_guides (project_id, brand_name) VALUES (?, "Marca")').run(req.params.projectId);
      guide = db.prepare('SELECT * FROM brand_guides WHERE project_id = ?').get(req.params.projectId);
    }
    res.json(guide);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/projects/:projectId/brand-guide', (req, res) => {
  try {
    const { projectId } = req.params;
    const {
      brand_name, tagline, primary_color, secondary_color, accent_color,
      background_color, text_color, colors_json, font_primary, font_secondary,
      typography_json, logo_url, guidelines_text, dos_and_donts_json
    } = req.body;

    const stmt = db.prepare(`
      INSERT INTO brand_guides (
        project_id, brand_name, tagline,
        primary_color, secondary_color, accent_color, background_color, text_color,
        colors_json, font_primary, font_secondary, typography_json,
        logo_url, guidelines_text, dos_and_donts_json, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(project_id) DO UPDATE SET
        brand_name = excluded.brand_name,
        tagline = excluded.tagline,
        primary_color = excluded.primary_color,
        secondary_color = excluded.secondary_color,
        accent_color = excluded.accent_color,
        background_color = excluded.background_color,
        text_color = excluded.text_color,
        colors_json = excluded.colors_json,
        font_primary = excluded.font_primary,
        font_secondary = excluded.font_secondary,
        typography_json = excluded.typography_json,
        logo_url = excluded.logo_url,
        guidelines_text = excluded.guidelines_text,
        dos_and_donts_json = excluded.dos_and_donts_json,
        updated_at = CURRENT_TIMESTAMP
    `);

    stmt.run(
      projectId,
      brand_name,
      tagline,
      primary_color,
      secondary_color,
      accent_color,
      background_color,
      text_color,
      typeof colors_json === 'object' ? JSON.stringify(colors_json) : colors_json,
      font_primary,
      font_secondary,
      typeof typography_json === 'object' ? JSON.stringify(typography_json) : typography_json,
      logo_url,
      guidelines_text,
      typeof dos_and_donts_json === 'object' ? JSON.stringify(dos_and_donts_json) : dos_and_donts_json
    );

    const updated = db.prepare('SELECT * FROM brand_guides WHERE project_id = ?').get(projectId);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Auto-extract styles from website files (CSS, HTML, Variables)
app.post('/api/projects/:id/extract-styles', (req, res) => {
  try {
    const projectId = req.params.id;
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
    if (!project) return res.status(404).json({ error: 'Proyecto no encontrado' });

    // Look for advance (either specified in body or latest)
    let advance;
    if (req.body && req.body.advanceId) {
      advance = db.prepare('SELECT * FROM advances WHERE id = ? AND project_id = ?').get(req.body.advanceId, projectId);
    }
    if (!advance) {
      advance = db.prepare('SELECT * FROM advances WHERE project_id = ? ORDER BY created_at DESC LIMIT 1').get(projectId);
    }

    if (!advance) {
      return res.status(400).json({ error: 'El proyecto no tiene ningún avance subido para analizar estilos' });
    }

    const folderPath = path.join(uploadsBaseDir, advance.folder_path);
    const extracted = extractStylesFromFolder(folderPath);

    db.prepare(`
      INSERT INTO brand_guides (
        project_id, brand_name, tagline,
        primary_color, secondary_color, accent_color, background_color, text_color,
        colors_json, font_primary, font_secondary, typography_json,
        guidelines_text, dos_and_donts_json, google_fonts_json, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(project_id) DO UPDATE SET
        brand_name = excluded.brand_name,
        primary_color = excluded.primary_color,
        secondary_color = excluded.secondary_color,
        accent_color = excluded.accent_color,
        background_color = excluded.background_color,
        text_color = excluded.text_color,
        colors_json = excluded.colors_json,
        font_primary = excluded.font_primary,
        font_secondary = excluded.font_secondary,
        typography_json = excluded.typography_json,
        dos_and_donts_json = excluded.dos_and_donts_json,
        guidelines_text = excluded.guidelines_text,
        google_fonts_json = excluded.google_fonts_json,
        updated_at = CURRENT_TIMESTAMP
    `).run(
      projectId,
      project.name,
      'Identidad visual leída automáticamente de los estilos del proyecto',
      extracted.primary_color,
      extracted.secondary_color,
      extracted.accent_color,
      extracted.bg_color,
      extracted.text_color,
      extracted.colors_json,
      extracted.font_primary,
      extracted.font_secondary,
      extracted.typography_json,
      extracted.description,
      extracted.dos_and_donts_json,
      JSON.stringify(extracted.googleFontLinks || [])
    );

    const updatedGuide = db.prepare('SELECT * FROM brand_guides WHERE project_id = ?').get(projectId);

    res.json({
      success: true,
      message: 'Estilos del sitio web leídos y aplicados exitosamente a la Guía de Marca',
      brandGuide: updatedGuide,
      extracted
    });
  } catch (err) {
    console.error('Error extracting styles:', err);
    res.status(500).json({ error: err.message });
  }
});

// 5. System Settings API (Logo, Favicon, Title)
const storageAsset = multer.diskStorage({
  destination: (req, file, cb) => cb(null, systemUploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `sys_${Date.now()}_${Math.random().toString(36).substring(7)}${ext}`);
  }
});
const uploadAsset = multer({ storage: storageAsset });

app.get('/api/system/settings', (req, res) => {
  try {
    const rows = db.prepare('SELECT key, value FROM system_settings').all();
    const settings = {
      app_name: 'WebReview Pro',
      company_name: 'Studio Design & Review',
      logo_url: '',
      favicon_url: ''
    };
    for (const r of rows) {
      settings[r.key] = r.value;
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/system/settings', (req, res) => {
  try {
    const { app_name, company_name, logo_url, favicon_url } = req.body;
    const upsert = db.prepare(`
      INSERT INTO system_settings (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
    `);

    if (app_name !== undefined) upsert.run('app_name', app_name);
    if (company_name !== undefined) upsert.run('company_name', company_name);
    if (logo_url !== undefined) upsert.run('logo_url', logo_url);
    if (favicon_url !== undefined) upsert.run('favicon_url', favicon_url);

    res.json({ success: true, app_name, company_name, logo_url, favicon_url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/system/upload-asset', uploadAsset.single('assetFile'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se envió ningún archivo de imagen' });
    const publicUrl = `/system-assets/${req.file.filename}`;
    res.json({ success: true, url: publicUrl, filename: req.file.filename });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Custom Domain & Previous URL for Projects
app.patch('/api/projects/:id/domain', (req, res) => {
  try {
    const { custom_domain } = req.body;
    db.prepare('UPDATE projects SET custom_domain = ? WHERE id = ?').run(custom_domain || '', req.params.id);
    res.json({ success: true, custom_domain });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/projects/:id/previous-url', (req, res) => {
  try {
    const { previous_url } = req.body;
    db.prepare('UPDATE projects SET previous_url = ? WHERE id = ?').run(previous_url || '', req.params.id);
    res.json({ success: true, previous_url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Proxy endpoint to load external website bypassing X-Frame-Options for safe client preview
app.get('/api/proxy-site', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send('URL required');
  try {
    let cleanUrl = targetUrl.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }
    const parsed = new URL(cleanUrl);
    const response = await fetch(cleanUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      // If it's another content type, redirect or stream
      return res.redirect(cleanUrl);
    }

    let html = await response.text();
    // Inject base href tag so relative links, images and css resolve correctly
    const baseTag = `<base href="${parsed.origin}${parsed.pathname.endsWith('/') ? parsed.pathname : parsed.pathname.substring(0, parsed.pathname.lastIndexOf('/') + 1)}">`;
    if (html.includes('<head>')) {
      html = html.replace('<head>', `<head>${baseTag}`);
    } else {
      html = baseTag + html;
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.removeHeader('X-Frame-Options');
    res.removeHeader('Content-Security-Policy');
    res.send(html);
  } catch (err) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { margin: 0; padding: 2.5rem 1.5rem; background: #0c121e; color: #94a3b8; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 70vh; text-align: center; }
          .card { background: #111827; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2rem; max-width: 480px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
          .icon { width: 48px; height: 48px; border-radius: 50%; background: rgba(245,158,11,0.12); color: #f59e0b; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem; font-size: 1.5rem; }
          h3 { margin: 0 0 0.5rem; color: #f8fafc; font-size: 1.15rem; font-weight: 600; }
          p { margin: 0 0 1.25rem; font-size: 0.85rem; line-height: 1.6; color: #94a3b8; }
          .btn-open { display: inline-flex; align-items: center; gap: 0.5rem; background: #2563eb; color: #ffffff; text-decoration: none; padding: 0.6rem 1.2rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; transition: background 0.2s; }
          .btn-open:hover { background: #1d4ed8; }
          .domain-pill { font-family: monospace; background: rgba(255,255,255,0.06); padding: 0.2rem 0.5rem; border-radius: 4px; color: #60a5fa; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">🌐</div>
          <h3>Simulación de Sitio Web Anterior</h3>
          <p>La URL configurada para este proyecto es: <span class="domain-pill">${targetUrl}</span>.<br>Si el dominio aún no cuenta con DNS activo o requiere navegación externa, puedes abrirlo directamente:</p>
          <a href="${targetUrl}" target="_blank" rel="noopener noreferrer" class="btn-open">
            Visitar Sitio en Pestaña Nueva &rarr;
          </a>
        </div>
      </body>
      </html>
    `);
  }
});

// 7. Authentication & User Management
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    }

    const user = db.prepare('SELECT id, username, name, role, password FROM users WHERE username = ?').get(username);
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users', (req, res) => {
  try {
    const users = db.prepare('SELECT id, username, name, role, created_at FROM users ORDER BY id ASC').all();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', (req, res) => {
  try {
    const { username, password, name, role } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existing) {
      return res.status(400).json({ error: 'El nombre de usuario ya existe' });
    }

    const result = db.prepare(`
      INSERT INTO users (username, password, name, role)
      VALUES (?, ?, ?, ?)
    `).run(username, password, name || username, role || 'client');

    res.json({
      success: true,
      user: {
        id: result.lastInsertRowid,
        username,
        name: name || username,
        role: role || 'client'
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Short Links / Shared Projects API
app.post('/api/projects/:id/shares', (req, res) => {
  try {
    const { title } = req.body;
    const projectId = req.params.id;

    // Generate unique clean code (e.g. p-xyz123)
    const code = Math.random().toString(36).substring(2, 8);

    db.prepare(`
      INSERT INTO project_shares (project_id, code, title)
      VALUES (?, ?, ?)
    `).run(projectId, code, title || 'Enlace Compartido');

    const shareUrl = `${req.protocol}://${req.get('host')}/s/${code}`;

    res.json({
      success: true,
      share: {
        code,
        title: title || 'Enlace Compartido',
        share_url: shareUrl
      },
      code,
      share_url: shareUrl
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/projects/:id/shares', (req, res) => {
  try {
    const shares = db.prepare(`
      SELECT * FROM project_shares WHERE project_id = ? ORDER BY created_at DESC
    `).all(req.params.id);
    res.json(shares);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/shares/:identifier', (req, res) => {
  try {
    db.prepare('DELETE FROM project_shares WHERE id = ? OR code = ?').run(req.params.identifier, req.params.identifier);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get project details by short code
app.get('/api/shares/:code', (req, res) => {
  try {
    const share = db.prepare('SELECT * FROM project_shares WHERE code = ?').get(req.params.code);
    if (!share) return res.status(404).json({ error: 'Enlace compartido no encontrado o expirado' });

    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(share.project_id);
    if (!project) return res.status(404).json({ error: 'Proyecto no encontrado' });

    const advances = db.prepare(`
      SELECT a.*,
        (SELECT COUNT(*) FROM pages p WHERE p.advance_id = a.id) as pages_count
      FROM advances a
      WHERE a.project_id = ?
      ORDER BY a.created_at DESC
    `).all(project.id);

    const brandGuide = db.prepare('SELECT * FROM brand_guides WHERE project_id = ?').get(project.id);

    res.json({
      share,
      project,
      advances,
      brandGuide
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Short URL Route: /s/:code redirects to client view
app.get('/s/:code', (req, res) => {
  const { code } = req.params;
  res.redirect(`/?share=${code}`);
});

// ================= SYSTEM UPDATE FROM GITHUB ================= //
// Get current installed version & repository status
app.get('/api/system/version', (req, res) => {
  try {
    let commitHash = '097c0ed';
    let commitMessage = 'Portal de Previsualización Web & Brand Guidelines';
    let commitDate = new Date().toISOString();
    let branch = 'main';
    let remoteUrl = 'https://github.com/networkturbo4-pixel/visorweb.git';

    try {
      commitHash = execSync('git rev-parse --short HEAD', { cwd: __dirname }).toString().trim();
      commitMessage = execSync('git log -1 --format=%s', { cwd: __dirname }).toString().trim();
      commitDate = execSync('git log -1 --format=%cd --date=iso', { cwd: __dirname }).toString().trim();
      branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: __dirname }).toString().trim();
      remoteUrl = execSync('git config --get remote.origin.url', { cwd: __dirname }).toString().trim() || remoteUrl;
    } catch (gitErr) {
      console.warn('Git info warning:', gitErr.message);
    }

    res.json({
      commitHash,
      commitMessage,
      commitDate,
      branch,
      remoteUrl,
      nodeVersion: process.version,
      uptime: process.uptime()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check if new commits exist on remote GitHub
app.post('/api/system/check-updates', (req, res) => {
  try {
    const logs = [];
    logs.push(`[${new Date().toLocaleTimeString()}] Conectando con GitHub (origin/main)...`);
    
    try {
      execSync('git fetch origin main', { cwd: __dirname, timeout: 25000 });
      logs.push('Conexión exitosa con el repositorio remoto.');
    } catch (fetchErr) {
      logs.push(`Aviso al consultar remoto: ${fetchErr.message}`);
    }

    const currentHash = execSync('git rev-parse --short HEAD', { cwd: __dirname }).toString().trim();
    let behindCount = 0;
    let availableCommits = [];

    try {
      const behindStr = execSync('git rev-list HEAD..origin/main --count', { cwd: __dirname }).toString().trim();
      behindCount = parseInt(behindStr, 10) || 0;

      if (behindCount > 0) {
        const rawList = execSync('git log HEAD..origin/main --format=%h||%s||%cd --date=relative', { cwd: __dirname }).toString().trim();
        availableCommits = rawList.split('\n').filter(Boolean).map(line => {
          const parts = line.split('||');
          return { hash: parts[0], message: parts[1], date: parts[2] };
        });
      }
    } catch (countErr) {
      console.warn('Rev-list check warning:', countErr.message);
    }

    if (behindCount > 0) {
      logs.push(`¡Hay ${behindCount} actualización(es) disponible(s) en GitHub!`);
    } else {
      logs.push('El sistema local está 100% al día con la última versión de GitHub.');
    }

    res.json({
      hasUpdates: behindCount > 0,
      behindCount,
      currentHash,
      availableCommits,
      logs
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al comprobar actualizaciones: ' + err.message });
  }
});

// 1-Click Update System & Database Schema without wiping data
app.post('/api/system/update', (req, res) => {
  const logs = [];
  try {
    const startTime = Date.now();
    logs.push(`[${new Date().toLocaleTimeString()}] Iniciando proceso de actualización integral...`);

    // 1. Git Fetch
    logs.push('Paso 1/3: Descargando últimos commits desde origin/main en GitHub...');
    execSync('git fetch origin main', { cwd: __dirname, timeout: 30000 });
    logs.push('Cambios remotos descargados correctamente.');

    // 2. Git Pull (safe - fast forward)
    logs.push('Paso 2/3: Actualizando archivos del proyecto...');
    let pullResult = '';
    try {
      pullResult = execSync('git pull origin main --no-edit', { cwd: __dirname, timeout: 35000 }).toString().trim();
      logs.push(`Git Pull: ${pullResult}`);
    } catch (pullErr) {
      // In case of local untracked file conflicts, use safe checkout/merge
      logs.push(`Aviso Git Pull: ${pullErr.message}`);
      pullResult = execSync('git merge origin/main', { cwd: __dirname, timeout: 35000 }).toString().trim();
      logs.push(`Git Merge: ${pullResult}`);
    }

    // 3. Database Schema Synchronization
    logs.push('Paso 3/3: Sincronizando esquema de base de datos SQLite...');
    initDatabase();
    logs.push('Migraciones de base de datos ejecutadas con éxito.');
    logs.push('Todas las tablas, índices y columnas nuevas aplicadas.');
    logs.push('Los datos de proyectos, avances, observaciones y usuarios se mantuvieron intactos sin modificaciones.');

    const newHash = execSync('git rev-parse --short HEAD', { cwd: __dirname }).toString().trim();
    const newMsg = execSync('git log -1 --format=%s', { cwd: __dirname }).toString().trim();
    const newDate = execSync('git log -1 --format=%cd --date=iso', { cwd: __dirname }).toString().trim();

    const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
    logs.push(`[${new Date().toLocaleTimeString()}] ¡Actualización completada en ${elapsedSec}s! Nueva versión: ${newHash}`);

    res.json({
      success: true,
      message: 'Sistema y base de datos actualizados exitosamente sin alterar tus datos existentes.',
      currentHash: newHash,
      commitMessage: newMsg,
      commitDate: newDate,
      logs
    });
  } catch (err) {
    console.error('System update error:', err);
    logs.push(`ERROR CRÍTICO: ${err.message}`);
    res.status(500).json({
      success: false,
      error: 'Error durante la actualización: ' + err.message,
      logs
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
