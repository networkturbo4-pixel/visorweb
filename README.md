# WebReview Pro - Portal de Avances Web & Brand Guidelines

Sistema corporativo de alto nivel desarrollado en **HTML5, CSS3, JavaScript** y **Base de Datos SQL (SQLite)** para previsualizar entregas web, contrastar vistas de escritorio y móviles en simultáneo, gestionar retroalimentación mediante pines interactivos, visualizar Brand Guidelines y administrar la identidad del sistema (Logo y Favicon).

---

## Características Principales

1. **Visor de Avances Responsivo:**
   - **Vista PC:** Marco de navegador con barra de dirección URL y zoom graduable.
   - **Vista Móvil:** Mockup estilizado de Smartphone con dynamic island, indicadores de red/batería y home bar.
   - **Vista Dual (PC + Móvil):** Ambos dispositivos en paralelo para contrastar la adaptabilidad en tiempo real.
   - Detección automática de páginas (`index.html`, `maquinaria.html`, `nosotros.html`, `servicios.html`, `proyectos.html`, `contacto.html`).

2. **Diseño App Profesional Moderno:**
   - Iconografía 100% vectorial en **SVG** (sin emoticones).
   - Paleta de color Slate & Obsidian con bordes sutiles y efectos de desenfoque *glassmorphism*.
   - Tipografía refinada con jerarquía visual de alto impacto.

3. **Gestión de Marca del Sistema (Logo y Favicon):**
   - **Logo del Sistema:** Carga de archivo de imagen (PNG, SVG, JPG, WebP) o ingreso de URL, con previsualización en fondos claros y oscuros. Actualización inmediata en la cabecera.
   - **Favicon del Sistema:** Carga de favicon (.ico, .png, .svg) con simulador en vivo de pestaña de navegador y actualización dinámica del `<link rel="icon">` en el `<head>`.
   - **Persistencia SQL:** La configuración del sistema se guarda en la tabla `system_settings` de SQLite.

4. **Sistema de Comentarios y Pines en Pantalla:**
   - **Modo Pin Interactivo:** Haz clic en cualquier parte de la vista (logo, botón, texto) para colocar un pin numérico con una observación de diseño, contenido o funcionalidad.
   - Panel lateral deslizable (drawer) con filtros por estado (*Pendientes* / *Resueltos*).
   - Acciones para marcar como resuelto, reabrir, eliminar o localizar el pin en pantalla.

5. **Brand Guidelines (Guía de Marca de la Propuesta):**
   - Paleta cromática oficial con muestras de color, código HEX, RGB y función "Clic para copiar".
   - Tipografías aplicadas (primaria y secundaria) con escala tipográfica (H1, H2, H3, Body).
   - Lineamientos de marca: Buenas prácticas (*Do's*) y restricciones (*Don'ts*).
   - Editor integrado con selector de colores para actualizar la guía en la base de datos SQL.

6. **Carga de Avances (Archivos como en tu imagen):**
   - **Subida de Carpeta Completa:** Selecciona la carpeta que contiene `assets/`, `index.html`, etc. El sistema preserva la jerarquía de directorios.
   - **Subida de archivo .ZIP:** Descompresión automática y mapeo instantáneo de páginas HTML.

---

## Ejecución del Proyecto

1. Abrir la terminal en la carpeta del proyecto:
   ```powershell
   cd C:\Users\CESAR\.gemini\antigravity\scratch\web-preview-portal
   ```

2. Iniciar el servidor:
   ```powershell
   node server.js
   ```

3. Abrir en el navegador:
   ```
   http://localhost:3000
   ```
