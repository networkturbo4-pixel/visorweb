# 🚀 Guía de Despliegue en cPanel (Producción)

Esta guía detalla paso a paso cómo subir y poner en marcha **WebReview Pro** en cualquier servidor con **cPanel** (Banahosting, Hostinger, Siteground, Webempresa, cPanel estándar con CloudLinux).

---

## 📋 Requisitos Previos en cPanel
1. Acceso a tu cuenta de **cPanel**.
2. Herramienta **"Setup Node.js App"** (presente en la sección *Software* de cPanel).
3. Versión de Node.js recomendada: **Node.js 22.x** (o 20.x / 24.x).  
   *(Node.js 22 incluye SQLite nativo, por lo que no requiere compiladores C++ ni python en el hosting)*.

---

## 🌟 Método 1: Despliegue Automático con Git (Recomendado)

Este método es el más rápido y permite que el botón de **"Actualizar Sistema (1 Clic)"** funcione directamente desde la web.

### Paso 1: Clonar el repositorio en cPanel
1. En cPanel, ve a la sección **Archivos** ➔ haz clic en **Git™ Version Control**.
2. Haz clic en el botón azul **Create** (Crear repositorio).
3. Completa los campos:
   - **Clone a Repository**: Activa el switch.
   - **Clone URL**: `https://github.com/networkturbo4-pixel/visorweb.git`
   - **Repository Path**: `visorweb` (o la carpeta que prefieras en tu `/home/usuario/`).
   - **Repository Name**: `visorweb`
4. Haz clic en **Create**. En unos segundos, cPanel clonará todo el proyecto.

---

### Paso 2: Configurar la Aplicación en "Setup Node.js App"
1. En cPanel, ve a la sección **Software** ➔ haz clic en **Setup Node.js App**.
2. Haz clic en el botón azul **Create Application**.
3. Configura los siguientes campos:
   - **Node.js version**: Selecciona **22.x** (o 20.x / superior).
   - **Application mode**: `Production`.
   - **Application root**: `visorweb` (el nombre de la carpeta donde se clonó el repositorio en el Paso 1).
   - **Application URL**: Selecciona el dominio o subdominio asignado (ejemplo: `preview.tudominio.com` o `tudominio.com/visor`).
   - **Application startup file**: `app.js` (o `server.js`).
4. Haz clic en **Create** (arriba a la derecha).

---

### Paso 3: Instalar Dependencias (NPM Install)
1. En la misma pantalla de la aplicación recién creada, verás una sección llamada **Detected configuration files**:
   - Verás listado `package.json`.
2. Haz clic en el botón **Run NPM Install**.
3. Espera 10–20 segundos mientras cPanel descarga los módulos ligeros (`express`, `cors`, `multer`, `adm-zip`).
4. Verás una notificación verde: *NPM install completed successfully*.

---

### Paso 4: Iniciar la Aplicación
1. En la parte superior de la aplicación en cPanel, haz clic en **Restart** (o el botón de reproducción/inicio).
2. Abre la URL de tu aplicación en el navegador (ejemplo: `https://preview.tudominio.com`).
3. ¡Listo! El portal estará en vivo y operando en producción con HTTPS.

---

## 📦 Método 2: Subida Manual por ZIP (Alternativo)

Si tu hosting no tiene habilitada la herramienta Git Version Control, puedes subirlo mediante ZIP:

1. Comprime los archivos del proyecto en un archivo `.zip` (**omitiendo la carpeta `node_modules` y `data/*.db`**).
2. En cPanel, entra en **Administrador de Archivos** (File Manager).
3. Crea una carpeta llamada `visorweb` en la raíz de tu hosting (fuera o dentro de `public_html`).
4. Sube el `.zip` y haz clic derecho ➔ **Extract**.
5. Ve a **Setup Node.js App** en cPanel, crea la aplicación apuntando a `visorweb` con startup file `app.js`.
6. Haz clic en **Run NPM Install** y luego en **Restart**.

---

## 🔑 Credenciales de Acceso por Defecto
El sistema incluye usuarios preconfigurados en la base de datos SQL inicial:

| Usuario | Contraseña | Rol | Acceso |
| :--- | :--- | :--- | :--- |
| **`admin`** | `admin123` | **Administrador** | Acceso total: Crear proyectos, subir avances ZIP, Brand Guidelines, configuración y actualización. |
| **`cliente`** | `cliente123` | **Cliente Revisor** | Modo revisión: Navegar vistas, fijar pines de comentarios y ver capturas. |

> *Tip de Seguridad:* Puedes cambiar las contraseñas o crear nuevos usuarios desde el botón superior **Usuarios** de la cabecera.

---

## 🔄 ¿Cómo Actualizar en Producción con 1 Clic?

Una vez en producción, cuando hagas cambios o mejoras en el repositorio de GitHub:
1. Inicia sesión como **Administrador** en tu portal en cPanel.
2. Ve a la pestaña **Ajustes del Sistema (Configuración)** ➔ Subpestaña **Actualización desde GitHub**.
3. Haz clic en **"Comprobar Actualizaciones"**: el portal consultará automáticamente GitHub.
4. Haz clic en **"Actualizar Sistema y Base de Datos (1 Clic)"**:
   - Descarga la nueva versión de GitHub.
   - Sincroniza las tablas y columnas SQLite.
   - **Tus proyectos, entregas de clientes, observaciones, pines y fotos se mantienen 100% seguros e intactos.**

---

## 🛠️ Permisos de Archivos Recomendados en cPanel
Verifica que las siguientes carpetas tengan permisos `755` para que Node.js pueda escribir la base de datos y los archivos subidos:
- `/visorweb/data/` ➔ `755`
- `/visorweb/uploads/` ➔ `755`
- `/visorweb/uploads/advances/` ➔ `755`
- `/visorweb/uploads/system/` ➔ `755`
- `/visorweb/uploads/temp/` ➔ `755`
