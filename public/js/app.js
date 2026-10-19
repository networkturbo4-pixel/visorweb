/**
 * WebReview Pro - Application Logic
 * Professional UI/UX with pure SVG iconography, System Logo & Favicon management,
 * and SQL-backed persistence.
 */

// SVG Icon Library
const ICONS = {
  check: `<svg class="svg-icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
  x: `<svg class="svg-icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  pin: `<svg class="svg-icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/></svg>`,
  file: `<svg class="svg-icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>`,
  trash: `<svg class="svg-icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`,
  copy: `<svg class="svg-icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`,
  info: `<svg class="svg-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  success: `<svg class="svg-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  error: `<svg class="svg-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  defaultLogo: `<svg class="svg-icon-logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`
};

const DEFAULT_FAVICON = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%232563EB'><polygon points='12 2 2 7 12 12 22 7 12 2'/><polyline points='2 17 12 22 22 17'/><polyline points='2 12 12 17 22 12'/></svg>";

// Application State
const state = {
  projects: [],
  currentProject: null,
  currentAdvance: null,
  pages: [],
  currentPage: 'index.html',
  viewportMode: 'dual',
  isPinMode: false,
  comments: [],
  activeFilter: 'all',
  brandGuide: null,
  desktopZoom: 1.0,
  currentUser: null,
  isShareView: false,
  systemSettings: {
    app_name: 'WebReview Pro',
    company_name: 'Portal de Avances & Brand Guidelines',
    logo_url: '',
    favicon_url: ''
  }
};

// DOM References
const elements = {
  // Navigation & Tabs & Roles
  navTabs: document.querySelectorAll('.nav-tab'),
  tabPanes: document.querySelectorAll('.tab-pane'),
  projectSelect: document.getElementById('projectSelect'),
  btnNewProject: document.getElementById('btnNewProject'),
  btnCreateProjectModal: document.getElementById('btnCreateProjectModal'),
  headerPendingBadge: document.getElementById('headerPendingBadge'),
  clientProjectTitle: document.getElementById('clientProjectTitle'),
  btnShareModalOpen: document.getElementById('btnShareModalOpen'),
  btnUsersModalOpen: document.getElementById('btnUsersModalOpen'),
  authContainer: document.getElementById('authContainer'),

  // System Branding elements
  headerLogoSlot: document.getElementById('headerLogoSlot'),
  headerAppName: document.getElementById('headerAppName'),
  headerCompanyText: document.getElementById('headerCompanyText'),
  docTitle: document.getElementById('docTitle'),
  dynamicFavicon: document.getElementById('dynamicFavicon'),

  // Preview Toolbar
  advanceSelect: document.getElementById('advanceSelect'),
  pageSelect: document.getElementById('pageSelect'),
  pagePillsContainer: document.getElementById('pagePillsContainer'),
  projectDomainInput: document.getElementById('projectDomainInput'),
  btnSaveDomain: document.getElementById('btnSaveDomain'),
  projectPreviousUrlInput: document.getElementById('projectPreviousUrlInput'),
  btnSavePreviousUrl: document.getElementById('btnSavePreviousUrl'),
  btnModeDesktop: document.getElementById('btnModeDesktop'),
  btnModeMobile: document.getElementById('btnModeMobile'),
  btnModeDual: document.getElementById('btnModeDual'),
  btnModeCompare: document.getElementById('btnModeCompare'),
  desktopResSelect: document.getElementById('desktopResSelect'),
  previewWorkstage: document.getElementById('previewWorkstage'),
  btnReloadPreviews: document.getElementById('btnReloadPreviews'),
  btnOpenExternal: document.getElementById('btnOpenExternal'),

  // Viewport Frames & Overlays
  previousDesktopContainer: document.getElementById('previousDesktopContainer'),
  iframePrevious: document.getElementById('iframePrevious'),
  previousUrlDisplay: document.getElementById('previousUrlDisplay'),
  btnOpenPreviousExternal: document.getElementById('btnOpenPreviousExternal'),
  previousEmptyNotice: document.getElementById('previousEmptyNotice'),
  iframeDesktop: document.getElementById('iframeDesktop'),
  iframeMobile: document.getElementById('iframeMobile'),
  desktopPinOverlay: document.getElementById('desktopPinOverlay'),
  mobilePinOverlay: document.getElementById('mobilePinOverlay'),
  desktopUrlDisplay: document.getElementById('desktopUrlDisplay'),
  desktopTagDisplay: document.getElementById('desktopTagDisplay'),
  mobileUrlDisplay: document.getElementById('mobileUrlDisplay'),
  desktopZoomDisplay: document.getElementById('desktopZoomDisplay'),
  phoneClock: document.getElementById('phoneClock'),

  // Login Modal
  loginModal: document.getElementById('loginModal'),
  formLogin: document.getElementById('formLogin'),
  loginUsername: document.getElementById('loginUsername'),
  loginPassword: document.getElementById('loginPassword'),
  loginErrorMsg: document.getElementById('loginErrorMsg'),
  btnCloseLoginModal: document.getElementById('btnCloseLoginModal'),
  btnCancelLogin: document.getElementById('btnCancelLogin'),

  // Share Short Link Modal
  shareModal: document.getElementById('shareModal'),
  btnCloseShareModal: document.getElementById('btnCloseShareModal'),
  formCreateShare: document.getElementById('formCreateShare'),
  shareTitleInput: document.getElementById('shareTitleInput'),
  latestShareBox: document.getElementById('latestShareBox'),
  latestShareUrl: document.getElementById('latestShareUrl'),
  btnCopyLatestShare: document.getElementById('btnCopyLatestShare'),
  projectSharesList: document.getElementById('projectSharesList'),

  // Users Modal
  usersModal: document.getElementById('usersModal'),
  btnCloseUsersModal: document.getElementById('btnCloseUsersModal'),
  formCreateUser: document.getElementById('formCreateUser'),
  newUserUsername: document.getElementById('newUserUsername'),
  newUserPassword: document.getElementById('newUserPassword'),
  newUserName: document.getElementById('newUserName'),
  newUserRole: document.getElementById('newUserRole'),
  usersTableBody: document.getElementById('usersTableBody'),

  // Comments Drawer
  btnToggleDrawer: document.getElementById('btnToggleDrawer'),
  commentsDrawer: document.getElementById('commentsDrawer'),
  btnCloseDrawer: document.getElementById('btnCloseDrawer'),
  commentsList: document.getElementById('commentsList'),
  countAllComments: document.getElementById('countAllComments'),
  countPendingComments: document.getElementById('countPendingComments'),
  countResolvedComments: document.getElementById('countResolvedComments'),
  filterChips: document.querySelectorAll('.filter-chip'),
  chkShowPins: document.getElementById('chkShowPins'),
  formQuickComment: document.getElementById('formQuickComment'),
  quickCategory: document.getElementById('quickCategory'),
  quickContent: document.getElementById('quickContent'),
  btnStartPinDrop: document.getElementById('btnStartPinDrop'),
  btnComposerAddPin: document.getElementById('btnComposerAddPin'),
  pinDropBanner: document.getElementById('pinDropBanner'),
  btnCancelPinDrop: document.getElementById('btnCancelPinDrop'),

  // Pin Modal
  pinCommentModal: document.getElementById('pinCommentModal'),
  formPinComment: document.getElementById('formPinComment'),
  btnClosePinModal: document.getElementById('btnClosePinModal'),
  btnCancelPin: document.getElementById('btnCancelPin'),
  pinCategory: document.getElementById('pinCategory'),
  pinContent: document.getElementById('pinContent'),
  pinPosX: document.getElementById('pinPosX'),
  pinPosY: document.getElementById('pinPosY'),
  pinViewport: document.getElementById('pinViewport'),

  // Brand Guide Tab
  brandTitle: document.getElementById('brandTitle'),
  brandTagline: document.getElementById('brandTagline'),
  brandDescription: document.getElementById('brandDescription'),
  brandExtractionPill: document.getElementById('brandExtractionPill'),
  brandExtractionText: document.getElementById('brandExtractionText'),
  brandColorsGrid: document.getElementById('brandColorsGrid'),
  fontPrimaryName: document.getElementById('fontPrimaryName'),
  fontSecondaryName: document.getElementById('fontSecondaryName'),
  fontPrimarySample: document.getElementById('fontPrimarySample'),
  fontSecondarySample: document.getElementById('fontSecondarySample'),
  typeScaleBody: document.getElementById('typeScaleBody'),
  brandDosList: document.getElementById('brandDosList'),
  brandDontsList: document.getElementById('brandDontsList'),
  btnAutoExtractStyles: document.getElementById('btnAutoExtractStyles'),
  btnEditBrandGuide: document.getElementById('btnEditBrandGuide'),
  editBrandModal: document.getElementById('editBrandModal'),
  formEditBrand: document.getElementById('formEditBrand'),
  btnCloseBrandModal: document.getElementById('btnCloseBrandModal'),
  btnCancelBrandEdit: document.getElementById('btnCancelBrandEdit'),

  // Projects Tab
  projectsGrid: document.getElementById('projectsGrid'),
  newProjectModal: document.getElementById('newProjectModal'),
  formNewProject: document.getElementById('formNewProject'),
  btnCloseProjectModal: document.getElementById('btnCloseProjectModal'),
  btnCancelNewProject: document.getElementById('btnCancelNewProject'),
  newProjectPreviousUrl: document.getElementById('newProjectPreviousUrl'),

  // Upload Tab
  btnMethodFolder: document.getElementById('btnMethodFolder'),
  btnMethodZip: document.getElementById('btnMethodZip'),
  formUploadFolder: document.getElementById('formUploadFolder'),
  formUploadZip: document.getElementById('formUploadZip'),
  folderInput: document.getElementById('folderInput'),
  zipInput: document.getElementById('zipInput'),
  folderDropzone: document.getElementById('folderDropzone'),
  zipDropzone: document.getElementById('zipDropzone'),
  folderSelectedCount: document.getElementById('folderSelectedCount'),
  zipSelectedCount: document.getElementById('zipSelectedCount'),
  btnSubmitFolder: document.getElementById('btnSubmitFolder'),
  btnSubmitZip: document.getElementById('btnSubmitZip'),
  folderVersionName: document.getElementById('folderVersionName'),
  folderVersionNotes: document.getElementById('folderVersionNotes'),
  zipVersionName: document.getElementById('zipVersionName'),
  zipVersionNotes: document.getElementById('zipVersionNotes'),
  uploadProgress: document.getElementById('uploadProgress'),
  progressStatus: document.getElementById('progressStatus'),
  progressDetail: document.getElementById('progressDetail'),

  // System Settings Tab
  formSystemSettings: document.getElementById('formSystemSettings'),
  settingAppName: document.getElementById('settingAppName'),
  settingCompanyText: document.getElementById('settingCompanyText'),
  settingLogoUrl: document.getElementById('settingLogoUrl'),
  settingFaviconUrl: document.getElementById('settingFaviconUrl'),
  fileLogoUpload: document.getElementById('fileLogoUpload'),
  fileFaviconUpload: document.getElementById('fileFaviconUpload'),
  logoPreviewDark: document.getElementById('logoPreviewDark'),
  logoPreviewLight: document.getElementById('logoPreviewLight'),
  faviconPreviewImg: document.getElementById('faviconPreviewImg'),
  tabSimulationTitle: document.getElementById('tabSimulationTitle'),
  btnResetDefaultLogo: document.getElementById('btnResetDefaultLogo'),
  btnResetDefaultFavicon: document.getElementById('btnResetDefaultFavicon'),

  // Toast Container
  toastContainer: document.getElementById('toastContainer'),

  // Snapshot Lightbox Modal
  snapshotLightboxModal: document.getElementById('snapshotLightboxModal'),
  lightboxTitle: document.getElementById('lightboxTitle'),
  lightboxSubtitle: document.getElementById('lightboxSubtitle'),
  lightboxImg: document.getElementById('lightboxImg'),
  btnCloseLightboxModal: document.getElementById('btnCloseLightboxModal'),

  // GitHub Updater Elements
  btnCheckUpdates: document.getElementById('btnCheckUpdates'),
  btnRunSystemUpdate: document.getElementById('btnRunSystemUpdate'),
  syncStatusChip: document.getElementById('syncStatusChip'),
  syncPulseDot: document.getElementById('syncPulseDot'),
  syncStatusText: document.getElementById('syncStatusText'),
  currentCommitHashPill: document.getElementById('currentCommitHashPill'),
  currentCommitMsgText: document.getElementById('currentCommitMsgText'),
  currentCommitDateText: document.getElementById('currentCommitDateText'),
  repoBranchVal: document.getElementById('repoBranchVal'),
  repoUrlSub: document.getElementById('repoUrlSub'),
  serverNodeVersion: document.getElementById('serverNodeVersion'),
  serverUptimeText: document.getElementById('serverUptimeText'),
  pendingCommitsBox: document.getElementById('pendingCommitsBox'),
  pendingCommitsList: document.getElementById('pendingCommitsList'),
  updateConsoleOutput: document.getElementById('updateConsoleOutput'),
  consoleStatusPill: document.getElementById('consoleStatusPill'),
  updateAvailablePill: document.getElementById('updateAvailablePill'),
};

// ================= INITIALIZATION ================= //
document.addEventListener('DOMContentLoaded', async () => {
  setupNavigation();
  setupViewports();
  setupPinMode();
  setupDrawer();
  setupLightboxModal();
  setupUploadForms();
  setupBrandGuideEditor();
  setupProjectModals();
  setupSystemSettings();
  setupAuth();
  setupDomainSetting();
  setupPreviousUrlSetting();
  setupShareModal();
  setupUsersModal();
  updatePhoneClock();
  setInterval(updatePhoneClock, 60000);

  // 1. Load System Settings (Logo & Favicon)
  await loadSystemSettings();

  // 2. Check if loading via short link share code (?share=:code)
  const urlParams = new URLSearchParams(window.location.search);
  const shareCode = urlParams.get('share');
  if (shareCode) {
    await loadSharedProject(shareCode);
    return;
  }

  // 3. Load Projects from SQL Database (normal mode)
  await loadProjects();
});

// Update Phone status bar clock
function updatePhoneClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  if (elements.phoneClock) elements.phoneClock.textContent = `${hours}:${minutes}`;
}

// ================= TOAST NOTIFICATIONS (NO EMOJIS) ================= //
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  let iconSvg = ICONS.info;
  if (type === 'success') iconSvg = ICONS.success;
  if (type === 'error') iconSvg = ICONS.error;

  toast.innerHTML = `${iconSvg} <span>${message}</span>`;
  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ================= SYSTEM SETTINGS (LOGO & FAVICON) ================= //
async function loadSystemSettings() {
  try {
    const res = await fetch('/api/system/settings');
    const settings = await res.json();
    state.systemSettings = settings;

    // Apply to UI
    applySystemSettings(settings);

    // Populate Settings form
    elements.settingAppName.value = settings.app_name || 'WebReview Pro';
    elements.settingCompanyText.value = settings.company_name || 'Portal de Avances & Brand Guidelines';
    elements.settingLogoUrl.value = settings.logo_url || '';
    elements.settingFaviconUrl.value = settings.favicon_url || '';

    updateLogoPreviews(settings.logo_url);
    updateFaviconPreviews(settings.favicon_url, settings.app_name);
  } catch (err) {
    console.error('Error cargando ajustes del sistema:', err);
  }
}

function applySystemSettings(settings) {
  // App Title
  if (settings.app_name) {
    const rawName = String(settings.app_name).trim();
    if (/\bpro$/i.test(rawName)) {
      const baseName = rawName.replace(/\s*pro$/i, '').trim();
      elements.headerAppName.innerHTML = `${escapeHtml(baseName)} <span class="highlight">Pro</span>`;
    } else {
      elements.headerAppName.innerHTML = `${escapeHtml(rawName)} <span class="highlight">Pro</span>`;
    }
    elements.docTitle.textContent = `${rawName} | Portal de Avances & Brand Guidelines`;
    elements.tabSimulationTitle.textContent = `${rawName} | Portal`;
  }
  if (settings.company_name) {
    elements.headerCompanyText.textContent = settings.company_name;
  }

  // Logo in Header
  if (settings.logo_url) {
    elements.headerLogoSlot.innerHTML = `<img src="${settings.logo_url}" alt="Logo" style="width:100%;height:100%;object-fit:contain;">`;
  } else {
    elements.headerLogoSlot.innerHTML = ICONS.defaultLogo;
  }

  // Favicon in Browser <head>
  if (settings.favicon_url) {
    elements.dynamicFavicon.href = settings.favicon_url;
  } else {
    elements.dynamicFavicon.href = DEFAULT_FAVICON;
  }
}

function updateLogoPreviews(url) {
  if (url) {
    elements.logoPreviewDark.innerHTML = `<img src="${url}" alt="Preview Logo">`;
    elements.logoPreviewLight.innerHTML = `<img src="${url}" alt="Preview Logo">`;
  } else {
    elements.logoPreviewDark.innerHTML = `<div class="brand-logo-slot" style="width:48px;height:48px;">${ICONS.defaultLogo}</div>`;
    elements.logoPreviewLight.innerHTML = `<div class="brand-logo-slot" style="width:48px;height:48px;">${ICONS.defaultLogo}</div>`;
  }
}

function updateFaviconPreviews(url, appName) {
  const finalUrl = url || DEFAULT_FAVICON;
  elements.faviconPreviewImg.src = finalUrl;
  elements.tabSimulationTitle.textContent = `${appName || 'WebReview Pro'} | Portal`;
}

function setupSystemSettings() {
  // Real-time URL input changes
  elements.settingLogoUrl.addEventListener('input', () => {
    updateLogoPreviews(elements.settingLogoUrl.value.trim());
  });

  elements.settingFaviconUrl.addEventListener('input', () => {
    updateFaviconPreviews(elements.settingFaviconUrl.value.trim(), elements.settingAppName.value.trim());
  });

  elements.settingAppName.addEventListener('input', () => {
    elements.tabSimulationTitle.textContent = `${elements.settingAppName.value.trim()} | Portal`;
  });

  // Upload Logo File
  elements.fileLogoUpload.addEventListener('change', async () => {
    const file = elements.fileLogoUpload.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('assetFile', file);

    try {
      showToast('Subiendo archivo de logo...', 'info');
      const res = await fetch('/api/system/upload-asset', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.url) {
        elements.settingLogoUrl.value = data.url;
        updateLogoPreviews(data.url);
        showToast('Logo cargado correctamente', 'success');
      }
    } catch (err) {
      showToast('Error al subir logo: ' + err.message, 'error');
    }
  });

  // Upload Favicon File
  elements.fileFaviconUpload.addEventListener('change', async () => {
    const file = elements.fileFaviconUpload.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('assetFile', file);

    try {
      showToast('Subiendo favicon...', 'info');
      const res = await fetch('/api/system/upload-asset', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.url) {
        elements.settingFaviconUrl.value = data.url;
        updateFaviconPreviews(data.url, elements.settingAppName.value.trim());
        showToast('Favicon cargado correctamente', 'success');
      }
    } catch (err) {
      showToast('Error al subir favicon: ' + err.message, 'error');
    }
  });

  // Reset Logo
  elements.btnResetDefaultLogo.addEventListener('click', () => {
    elements.settingLogoUrl.value = '';
    updateLogoPreviews('');
    showToast('Logo restaurado al predeterminado', 'info');
  });

  // Reset Favicon
  elements.btnResetDefaultFavicon.addEventListener('click', () => {
    elements.settingFaviconUrl.value = '';
    updateFaviconPreviews('', elements.settingAppName.value.trim());
    showToast('Favicon restaurado al predeterminado', 'info');
  });

  // Save Settings Form
  elements.formSystemSettings.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      app_name: elements.settingAppName.value.trim(),
      company_name: elements.settingCompanyText.value.trim(),
      logo_url: elements.settingLogoUrl.value.trim(),
      favicon_url: elements.settingFaviconUrl.value.trim()
    };

    try {
      const res = await fetch('/api/system/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Error al guardar');

      state.systemSettings = payload;
      applySystemSettings(payload);
      showToast('Ajustes del sistema guardados en la base de datos SQL', 'success');
    } catch (err) {
      showToast('Error al guardar ajustes: ' + err.message, 'error');
    }
  });

  // ================= GITHUB UPDATER FRONTEND LOGIC ================= //
  const subtabs = document.querySelectorAll('.settings-subtab');
  const subpanes = document.querySelectorAll('.settings-subpane');
  subtabs.forEach(tab => {
    tab.addEventListener('click', () => {
      subtabs.forEach(t => t.classList.remove('active'));
      subpanes.forEach(p => p.classList.add('hidden'));
      tab.classList.add('active');
      const targetPane = document.getElementById(tab.dataset.subtab);
      if (targetPane) targetPane.classList.remove('hidden');

      if (tab.dataset.subtab === 'subtab-updater') {
        loadSystemVersionInfo();
      }
    });
  });

  async function loadSystemVersionInfo() {
    try {
      const res = await fetch('/api/system/version');
      if (!res.ok) return;
      const data = await res.json();
      if (elements.currentCommitHashPill) elements.currentCommitHashPill.textContent = `#${data.commitHash}`;
      if (elements.currentCommitMsgText) elements.currentCommitMsgText.textContent = data.commitMessage;
      if (elements.currentCommitDateText) elements.currentCommitDateText.textContent = data.commitDate;
      if (elements.repoBranchVal) elements.repoBranchVal.textContent = data.branch;
      if (elements.repoUrlSub) elements.repoUrlSub.textContent = data.remoteUrl;
      if (elements.serverNodeVersion) elements.serverNodeVersion.textContent = `Node ${data.nodeVersion}`;
      if (elements.serverUptimeText) {
        const uptimeMins = Math.floor(data.uptime / 60);
        elements.serverUptimeText.textContent = `Activo hace ${uptimeMins}m`;
      }
      if (elements.syncStatusText) elements.syncStatusText.textContent = `✓ Sistema al día con GitHub (#${data.commitHash})`;
    } catch (e) {
      console.warn('Error loading version info:', e);
    }
  }

  // Check for Updates Button
  if (elements.btnCheckUpdates) {
    elements.btnCheckUpdates.addEventListener('click', async () => {
      elements.btnCheckUpdates.disabled = true;
      elements.btnCheckUpdates.innerHTML = `
        <span class="spinner-sm"></span> Comprobando...
      `;
      appendConsoleLog(`[${new Date().toLocaleTimeString()}] Conectando con GitHub (networkturbo4-pixel/visorweb)...`);

      try {
        const res = await fetch('/api/system/check-updates', { method: 'POST' });
        const data = await res.json();

        if (data.logs && data.logs.length) {
          data.logs.forEach(l => appendConsoleLog(l));
        }

        if (data.hasUpdates) {
          showToast(`¡Se encontraron ${data.behindCount} actualización(es) disponible(s) en GitHub!`, 'info');
          if (elements.syncStatusChip) elements.syncStatusChip.classList.add('has-update');
          if (elements.syncPulseDot) elements.syncPulseDot.className = 'pulse-indicator pulse-amber';
          if (elements.syncStatusText) elements.syncStatusText.textContent = `${data.behindCount} actualización(es) disponible(s)`;
          if (elements.updateAvailablePill) elements.updateAvailablePill.classList.remove('hidden');

          // Render commits list
          if (elements.pendingCommitsBox && elements.pendingCommitsList && data.availableCommits) {
            elements.pendingCommitsBox.classList.remove('hidden');
            elements.pendingCommitsList.innerHTML = '';
            data.availableCommits.forEach(c => {
              const row = document.createElement('div');
              row.className = 'commit-row-item';
              row.innerHTML = `
                <span class="commit-row-msg">📦 ${escapeHtml(c.message)}</span>
                <div class="commit-row-meta">
                  <code class="commit-pill">#${escapeHtml(c.hash)}</code>
                  <span>${escapeHtml(c.date)}</span>
                </div>
              `;
              elements.pendingCommitsList.appendChild(row);
            });
          }
        } else {
          showToast('El sistema local está 100% al día con la última versión de GitHub', 'success');
          if (elements.syncStatusChip) elements.syncStatusChip.classList.remove('has-update');
          if (elements.syncPulseDot) elements.syncPulseDot.className = 'pulse-indicator pulse-green';
          if (elements.syncStatusText) elements.syncStatusText.textContent = '✓ Sistema al día con GitHub';
          if (elements.updateAvailablePill) elements.updateAvailablePill.classList.add('hidden');
          if (elements.pendingCommitsBox) elements.pendingCommitsBox.classList.add('hidden');
        }
      } catch (err) {
        showToast('Error al comprobar actualizaciones: ' + err.message, 'error');
        appendConsoleLog(`ERROR: ${err.message}`);
      } finally {
        elements.btnCheckUpdates.disabled = false;
        elements.btnCheckUpdates.innerHTML = `
          <svg class="svg-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
          Comprobar Actualizaciones
        `;
      }
    });
  }

  // Run System Update 1-Click Button
  if (elements.btnRunSystemUpdate) {
    elements.btnRunSystemUpdate.addEventListener('click', async () => {
      const confirmUpdate = confirm('¿Deseas actualizar el sistema ahora desde GitHub?\n\n- Se descargarán los últimos cambios de código.\n- Se sincronizarán las tablas y columnas de la base de datos SQL.\n- Tus proyectos, entregas, pines y comentarios se mantendrán intactos.');
      if (!confirmUpdate) return;

      elements.btnRunSystemUpdate.disabled = true;
      elements.btnCheckUpdates.disabled = true;
      elements.btnRunSystemUpdate.innerHTML = `
        <span class="spinner-sm"></span> Actualizando Sistema...
      `;
      if (elements.consoleStatusPill) {
        elements.consoleStatusPill.className = 'console-status-pill running';
        elements.consoleStatusPill.textContent = 'Actualizando...';
      }

      appendConsoleLog(`\n======================================================`);
      appendConsoleLog(`[${new Date().toLocaleTimeString()}] INICIANDO ACTUALIZACIÓN INTEGRAL EN PRODUCCIÓN`);
      appendConsoleLog(`======================================================`);

      try {
        const res = await fetch('/api/system/update', { method: 'POST' });
        const data = await res.json();

        if (data.logs && data.logs.length) {
          data.logs.forEach(l => appendConsoleLog(l));
        }

        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Error durante la actualización');
        }

        if (elements.consoleStatusPill) {
          elements.consoleStatusPill.className = 'console-status-pill success';
          elements.consoleStatusPill.textContent = 'Actualizado';
        }

        if (elements.syncStatusChip) elements.syncStatusChip.classList.remove('has-update');
        if (elements.syncPulseDot) elements.syncPulseDot.className = 'pulse-indicator pulse-green';
        if (elements.syncStatusText) elements.syncStatusText.textContent = '✓ Sistema al día con GitHub';
        if (elements.updateAvailablePill) elements.updateAvailablePill.classList.add('hidden');
        if (elements.pendingCommitsBox) elements.pendingCommitsBox.classList.add('hidden');

        if (data.currentHash && elements.currentCommitHashPill) {
          elements.currentCommitHashPill.textContent = `#${data.currentHash}`;
        }
        if (data.commitMessage && elements.currentCommitMsgText) {
          elements.currentCommitMsgText.textContent = data.commitMessage;
        }
        if (data.commitDate && elements.currentCommitDateText) {
          elements.currentCommitDateText.textContent = data.commitDate;
        }

        showToast('¡Sistema y base de datos actualizados exitosamente!', 'success');
      } catch (err) {
        showToast('Error en la actualización: ' + err.message, 'error');
        if (elements.consoleStatusPill) {
          elements.consoleStatusPill.className = 'console-status-pill error';
          elements.consoleStatusPill.textContent = 'Error';
        }
        appendConsoleLog(`[ERROR CRÍTICO] ${err.message}`);
      } finally {
        elements.btnRunSystemUpdate.disabled = false;
        elements.btnCheckUpdates.disabled = false;
        elements.btnRunSystemUpdate.innerHTML = `
          <svg class="svg-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Actualizar Sistema y Base de Datos (1 Clic)
        `;
      }
    });
  }

  function appendConsoleLog(line) {
    if (!elements.updateConsoleOutput) return;
    elements.updateConsoleOutput.textContent += `\n${line}`;
    elements.updateConsoleOutput.scrollTop = elements.updateConsoleOutput.scrollHeight;
  }
}

// ================= NAVIGATION & TABS ================= //
function setupNavigation() {
  elements.navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.dataset.tab;
      elements.navTabs.forEach(t => t.classList.remove('active'));
      elements.tabPanes.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add('active');

      if (targetId === 'tab-brand') {
        renderBrandGuide();
      }
    });
  });

  elements.projectSelect.addEventListener('change', async (e) => {
    const projId = e.target.value;
    if (projId) {
      await selectProject(projId);
    }
  });

  elements.advanceSelect.addEventListener('change', async (e) => {
    const advId = e.target.value;
    if (advId) {
      await selectAdvance(advId);
    }
  });

  elements.pageSelect.addEventListener('change', (e) => {
    setPage(e.target.value);
  });
}

// ================= PROJECT LOADING ================= //
async function loadProjects() {
  try {
    const res = await fetch('/api/projects');
    const projects = await res.json();
    state.projects = projects;

    elements.projectSelect.innerHTML = '';
    projects.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.name} ${p.client ? `(${p.client})` : ''}`;
      elements.projectSelect.appendChild(opt);
    });

    if (projects.length > 0) {
      await selectProject(projects[0].id);
    }
  } catch (err) {
    showToast('Error al conectar con la base de datos SQL: ' + err.message, 'error');
  }
}

async function selectProject(projectId) {
  try {
    const res = await fetch(`/api/projects/${projectId}`);
    const data = await res.json();

    state.currentProject = data.project;
    state.brandGuide = data.brandGuide;

    if (elements.projectDomainInput) {
      elements.projectDomainInput.value = data.project.custom_domain || '';
    }
    if (elements.projectPreviousUrlInput) {
      elements.projectPreviousUrlInput.value = data.project.previous_url || '';
    }
    loadPreviousSitePreview();
    if (elements.clientProjectTitle) {
      elements.clientProjectTitle.textContent = data.project.name;
    }

    // Populate Advances
    elements.advanceSelect.innerHTML = '';
    if (data.advances && data.advances.length > 0) {
      data.advances.forEach(adv => {
        const opt = document.createElement('option');
        opt.value = adv.id;
        opt.textContent = `${adv.version_name} (${adv.pages_count} págs)`;
        elements.advanceSelect.appendChild(opt);
      });

      await selectAdvance(data.advances[0].id);
    } else {
      state.currentAdvance = null;
      state.pages = [];
      clearPreview();
      showToast('Este proyecto aún no tiene avances subidos. Ve a "Subir Avance".', 'info');
    }

    renderBrandGuide();
  } catch (err) {
    console.error(err);
    showToast('Error cargando información del proyecto', 'error');
  }
}

// ================= SECTION & URL FORMATTERS (NO .HTML FOR CLIENT) ================= //
function getCleanSectionName(filePath, pageTitle) {
  if (!filePath) return 'Inicio';
  let clean = filePath.replace(/\.[^/.]+$/, ''); // remove .html, .htm
  let base = clean.split('/').pop() || clean;
  if (base.toLowerCase() === 'index') {
    return 'Inicio';
  }
  let friendly = base.replace(/[-_]+/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  if (pageTitle && pageTitle.trim() && pageTitle.toLowerCase() !== base.toLowerCase()) {
    const shortTitle = pageTitle.split(/[-–|]/)[0].trim();
    if (shortTitle && shortTitle.length < 35) {
      return shortTitle;
    }
  }
  return friendly;
}

function formatSectionDisplay(filePath, pageTitle) {
  const projName = state.currentProject ? state.currentProject.name : 'Proyecto';
  const section = getCleanSectionName(filePath, pageTitle);
  return `${projName} - ${section}`;
}

function getCleanUrlPath(filePath) {
  if (!filePath) return '';
  let clean = filePath.replace(/\.[^/.]+$/, '');
  let base = clean.split('/').pop() || clean;
  if (base.toLowerCase() === 'index') {
    const parts = clean.split('/');
    parts.pop();
    return parts.join('/');
  }
  return clean;
}

// ================= RICH TEXT FORMATTING & MARKDOWN RENDERER ================= //
function applyFormatting(textarea, fmt) {
  if (!textarea) return;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const val = textarea.value;
  const selected = val.substring(start, end);

  let replacement = '';
  let cursorOffset = 0;

  switch (fmt) {
    case 'bold':
      replacement = `**${selected || 'texto en negrita'}**`;
      cursorOffset = selected ? replacement.length : 2;
      break;
    case 'italic':
      replacement = `*${selected || 'texto en cursiva'}*`;
      cursorOffset = selected ? replacement.length : 1;
      break;
    case 'underline':
      replacement = `<u>${selected || 'texto subrayado'}</u>`;
      cursorOffset = selected ? replacement.length : 3;
      break;
    case 'code':
      replacement = `\`${selected || 'código'}\``;
      cursorOffset = selected ? replacement.length : 1;
      break;
    case 'list':
      replacement = selected ? selected.split('\n').map(l => `• ${l}`).join('\n') : '• Punto clave';
      cursorOffset = replacement.length;
      break;
    case 'quote':
      replacement = selected ? selected.split('\n').map(l => `> ${l}`).join('\n') : '> Observación o cita';
      cursorOffset = replacement.length;
      break;
    default:
      return;
  }

  textarea.value = val.substring(0, start) + replacement + val.substring(end);
  textarea.focus();
  textarea.setSelectionRange(start + cursorOffset, start + cursorOffset);
}

function renderCommentText(text) {
  if (!text) return '';
  let safe = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  safe = safe.replace(/&lt;u&gt;(.*?)&lt;\/u&gt;/gi, '<u>$1</u>');
  safe = safe.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  safe = safe.replace(/\*([^\*]+?)\*/g, '<em>$1</em>');
  safe = safe.replace(/`([^`]+?)`/g, '<code class="comment-code">$1</code>');
  safe = safe.replace(/^(&gt;|\>)\s?(.*)$/gm, '<blockquote class="comment-quote">$2</blockquote>');
  safe = safe.replace(/^•\s?(.*)$/gm, '<div class="comment-bullet"><span class="bullet-dot">•</span> $1</div>');
  safe = safe.replace(/\n/g, '<br>');

  return safe;
}

async function selectAdvance(advanceId) {
  try {
    const res = await fetch(`/api/advances/${advanceId}`);
    const data = await res.json();

    state.currentAdvance = data.advance;
    state.pages = data.pages || [];

    // Populate page select and pills with clean section names
    elements.pageSelect.innerHTML = '';
    if (elements.pagePillsContainer) elements.pagePillsContainer.innerHTML = '';

    if (state.pages.length > 0) {
      state.pages.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.relative_path;
        opt.textContent = formatSectionDisplay(p.relative_path, p.title);
        elements.pageSelect.appendChild(opt);

        if (elements.pagePillsContainer) {
          const pill = document.createElement('button');
          pill.className = 'page-pill';
          pill.textContent = getCleanSectionName(p.relative_path, p.title);
          pill.dataset.path = p.relative_path;
          pill.addEventListener('click', () => setPage(p.relative_path));
          elements.pagePillsContainer.appendChild(pill);
        }
      });

      const hasIndex = state.pages.find(p => p.file_name.toLowerCase() === 'index.html');
      const defaultPage = hasIndex ? hasIndex.relative_path : state.pages[0].relative_path;
      setPage(defaultPage);
    }

    await loadComments();
  } catch (err) {
    console.error(err);
    showToast('Error cargando avance', 'error');
  }
}

function setPage(relativePath) {
  state.currentPage = relativePath;
  elements.pageSelect.value = relativePath;

  if (elements.pagePillsContainer) {
    document.querySelectorAll('.page-pill').forEach(pill => {
      pill.classList.toggle('active', pill.dataset.path === relativePath);
    });
  }

  if (!state.currentAdvance) return;

  const url = `/previews/${state.currentAdvance.folder_path}/${relativePath}`;
  elements.iframeDesktop.src = url;
  elements.iframeMobile.src = url;

  elements.iframeDesktop.onload = () => setupIframeInteractions(elements.iframeDesktop, 'desktop');
  elements.iframeMobile.onload = () => setupIframeInteractions(elements.iframeMobile, 'mobile');

  updateUrlDisplays();

  renderPins();
  renderCommentsList();
}

function clearPreview() {
  elements.iframeDesktop.src = 'about:blank';
  elements.iframeMobile.src = 'about:blank';
  elements.desktopUrlDisplay.textContent = 'preview://sin-avance';
  elements.mobileUrlDisplay.textContent = 'vacio';
  elements.pageSelect.innerHTML = '<option>Sin páginas</option>';
  if (elements.pagePillsContainer) elements.pagePillsContainer.innerHTML = '';
}

// ================= VIEWPORT TOGGLES & ZOOM ================= //
function setupViewports() {
  elements.btnModeDesktop.addEventListener('click', () => setViewportMode('desktop'));
  elements.btnModeMobile.addEventListener('click', () => setViewportMode('mobile'));
  elements.btnModeDual.addEventListener('click', () => setViewportMode('dual'));
  if (elements.btnModeCompare) {
    elements.btnModeCompare.addEventListener('click', () => setViewportMode('compare'));
  }

  if (elements.btnOpenPreviousExternal) {
    elements.btnOpenPreviousExternal.addEventListener('click', () => {
      if (state.currentProject && state.currentProject.previous_url) {
        let u = state.currentProject.previous_url.trim();
        if (!u.startsWith('http://') && !u.startsWith('https://')) u = 'https://' + u;
        window.open(u, '_blank');
      } else {
        showToast('No hay URL de web anterior configurada', 'info');
      }
    });
  }

  if (elements.desktopResSelect) {
    elements.desktopResSelect.addEventListener('change', () => {
      const val = elements.desktopResSelect.value;
      if (val === '100%') {
        document.documentElement.style.setProperty('--desktop-width', '100%');
      } else {
        document.documentElement.style.setProperty('--desktop-width', `${val}px`);
      }
      elements.desktopUrlDisplay.textContent = `preview://${state.currentPage} (${val}${val === '100%' ? '' : 'px'})`;
    });
  }

  elements.btnReloadPreviews.addEventListener('click', () => {
    if (elements.iframeDesktop.src) elements.iframeDesktop.src = elements.iframeDesktop.src;
    if (elements.iframeMobile.src) elements.iframeMobile.src = elements.iframeMobile.src;
    if (elements.iframePrevious && elements.iframePrevious.src) elements.iframePrevious.src = elements.iframePrevious.src;
    showToast('Visualizaciones recargadas', 'info');
  });

  elements.btnOpenExternal.addEventListener('click', () => {
    if (state.currentAdvance && state.currentPage) {
      const url = `/previews/${state.currentAdvance.folder_path}/${state.currentPage}`;
      window.open(url, '_blank');
    }
  });
}

function setViewportMode(mode) {
  state.viewportMode = mode;
  if (elements.btnModeDesktop) elements.btnModeDesktop.classList.toggle('active', mode === 'desktop');
  if (elements.btnModeMobile) elements.btnModeMobile.classList.toggle('active', mode === 'mobile');
  if (elements.btnModeDual) elements.btnModeDual.classList.toggle('active', mode === 'dual');
  if (elements.btnModeCompare) elements.btnModeCompare.classList.toggle('active', mode === 'compare');

  elements.previewWorkstage.classList.remove('mode-desktop', 'mode-mobile', 'mode-dual', 'mode-compare');
  elements.previewWorkstage.classList.add(`mode-${mode}`);

  if (elements.desktopTagDisplay) {
    if (mode === 'compare') {
      elements.desktopTagDisplay.textContent = 'Nueva Propuesta (Rediseño)';
      elements.desktopTagDisplay.className = 'viewport-tag tag-new';
    } else {
      elements.desktopTagDisplay.textContent = 'PC View (Desktop)';
      elements.desktopTagDisplay.className = 'viewport-tag';
    }
  }

  if (mode === 'compare') {
    loadPreviousSitePreview();
  }
}

function loadPreviousSitePreview() {
  if (!elements.iframePrevious) return;
  const prevUrl = state.currentProject ? (state.currentProject.previous_url || '').trim() : '';

  if (prevUrl) {
    let cleanUrl = prevUrl;
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }
    if (elements.previousUrlDisplay) {
      elements.previousUrlDisplay.textContent = cleanUrl;
    }
    if (elements.previousEmptyNotice) {
      elements.previousEmptyNotice.classList.add('hidden');
    }
    elements.iframePrevious.src = `/api/proxy-site?url=${encodeURIComponent(cleanUrl)}`;
  } else {
    if (elements.previousUrlDisplay) {
      elements.previousUrlDisplay.textContent = 'Sin web anterior';
    }
    elements.iframePrevious.src = 'about:blank';
    if (elements.previousEmptyNotice) {
      elements.previousEmptyNotice.classList.remove('hidden');
    }
  }
}

window.zoomViewport = function(target, factor) {
  if (target === 'desktop') {
    state.desktopZoom = Math.max(0.6, Math.min(1.4, state.desktopZoom * factor));
    const pct = Math.round(state.desktopZoom * 100);
    elements.desktopZoomDisplay.textContent = `${pct}%`;
    elements.iframeDesktop.style.transform = `scale(${state.desktopZoom})`;
    elements.iframeDesktop.style.transformOrigin = 'top left';
    elements.iframeDesktop.style.width = `${100 / state.desktopZoom}%`;
    elements.iframeDesktop.style.height = `${100 / state.desktopZoom}%`;
  }
};

// ================= DOM ELEMENT INSPECTOR & SNAPSHOT HELPERS ================= //
function injectInspectorStyles(doc) {
  if (!doc || doc.getElementById('__dom_inspector_styles')) return;
  const style = doc.createElement('style');
  style.id = '__dom_inspector_styles';
  style.textContent = `
    .__preview_inspector_box {
      position: absolute;
      pointer-events: none;
      border: 2px dashed #f59e0b !important;
      background: rgba(245, 158, 11, 0.18) !important;
      box-shadow: 0 0 16px rgba(245, 158, 11, 0.4), inset 0 0 10px rgba(245, 158, 11, 0.12) !important;
      border-radius: 4px;
      z-index: 2147483647;
      transition: top 0.05s ease, left 0.05s ease, width 0.05s ease, height 0.05s ease;
      box-sizing: border-box;
      display: none;
    }
    .__preview_inspector_tag {
      position: absolute;
      top: -26px;
      left: 0;
      background: #0f172a;
      border: 1px solid #f59e0b;
      color: #fbbf24;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 11px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 4px;
      white-space: nowrap;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.6);
      pointer-events: none;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }
  `;
  if (doc.head) doc.head.appendChild(style);
}

function getOrCreateInspectorBox(doc) {
  let box = doc.getElementById('__dom_inspector_box');
  if (!box) {
    box = doc.createElement('div');
    box.id = '__dom_inspector_box';
    box.className = '__preview_inspector_box';
    box.innerHTML = '<span class="__preview_inspector_tag" id="__dom_inspector_tag">Elemento</span>';
    if (doc.body) doc.body.appendChild(box);
  }
  return box;
}

function hideInspectorBox(doc) {
  if (!doc) return;
  const box = doc.getElementById('__dom_inspector_box');
  if (box) box.style.display = 'none';
}

function showInspectorHighlight(doc, target, win) {
  if (!doc || !target) return;
  const box = getOrCreateInspectorBox(doc);
  const tagSpan = doc.getElementById('__dom_inspector_tag');
  const rect = target.getBoundingClientRect();

  if (rect.width === 0 || rect.height === 0) {
    box.style.display = 'none';
    return;
  }

  box.style.display = 'block';
  box.style.left = `${rect.left + (win.scrollX || 0)}px`;
  box.style.top = `${rect.top + (win.scrollY || 0)}px`;
  box.style.width = `${rect.width}px`;
  box.style.height = `${rect.height}px`;

  const desc = getElementDescriptor(target);
  const size = `${Math.round(rect.width)}×${Math.round(rect.height)}px`;
  if (tagSpan) {
    tagSpan.textContent = `${desc} (${size})`;
  }
}

function getElementDescriptor(element) {
  if (!element || !element.tagName) return 'Elemento Web';
  const tag = element.tagName.toLowerCase();
  let id = element.id ? `#${element.id}` : '';
  let cls = '';
  if (element.className && typeof element.className === 'string') {
    const classes = element.className.trim().split(/\s+/).filter(c => c && !c.startsWith('__preview')).slice(0, 2);
    if (classes.length) cls = '.' + classes.join('.');
  }
  const textSnippet = (element.innerText || element.textContent || '').trim().replace(/\s+/g, ' ').substring(0, 25);
  const textLabel = textSnippet ? ` "${textSnippet}"` : '';
  return `<${tag}${id}${cls}>${textLabel}`;
}

function getEffectiveBackgroundColor(el, doc) {
  let curr = el;
  while (curr && curr !== doc && curr !== doc.documentElement) {
    const style = (doc.defaultView || window).getComputedStyle(curr);
    const bg = style ? style.backgroundColor : '';
    if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
      return bg;
    }
    curr = curr.parentElement;
  }
  try {
    const bodyStyle = (doc.defaultView || window).getComputedStyle(doc.body);
    const bodyBg = bodyStyle ? bodyStyle.backgroundColor : '';
    if (bodyBg && bodyBg !== 'rgba(0, 0, 0, 0)' && bodyBg !== 'transparent') {
      return bodyBg;
    }
  } catch (e) {}
  return '#ffffff';
}

async function captureElementSnapshot(element, clientX, clientY, win) {
  if (typeof html2canvas === 'undefined' || !element) return null;
  try {
    const doc = element.ownerDocument;
    hideInspectorBox(doc);

    let target = element;
    if (target === doc.body || target === doc.documentElement) {
      target = doc.elementFromPoint(clientX, clientY) || element;
    }

    const rect = target.getBoundingClientRect();
    const bgColor = getEffectiveBackgroundColor(target, doc);

    const canvas = await html2canvas(target, {
      logging: false,
      useCORS: true,
      allowTaint: true,
      backgroundColor: bgColor,
      scale: 1.2,
      ignoreElements: (el) => el.id && el.id.startsWith('__dom_inspector')
    });

    if (!canvas || canvas.width === 0 || canvas.height === 0) return null;

    let finalCanvas = canvas;
    if (canvas.width > 460 || canvas.height > 320) {
      const clickXInElement = Math.max(0, (clientX - rect.left) * 1.2);
      const clickYInElement = Math.max(0, (clientY - rect.top) * 1.2);
      const cropW = Math.min(canvas.width, 360);
      const cropH = Math.min(canvas.height, 220);

      let cropX = Math.max(0, clickXInElement - cropW / 2);
      let cropY = Math.max(0, clickYInElement - cropH / 2);
      if (cropX + cropW > canvas.width) cropX = Math.max(0, canvas.width - cropW);
      if (cropY + cropH > canvas.height) cropY = Math.max(0, canvas.height - cropH);

      const cropped = document.createElement('canvas');
      cropped.width = cropW;
      cropped.height = cropH;
      const ctx = cropped.getContext('2d');
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, cropW, cropH);
      ctx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
      finalCanvas = cropped;
    }

    const maxW = 320;
    const thumb = document.createElement('canvas');
    const ratio = Math.min(1, maxW / finalCanvas.width);
    thumb.width = Math.round(finalCanvas.width * ratio);
    thumb.height = Math.round(finalCanvas.height * ratio);
    const thumbCtx = thumb.getContext('2d');
    thumbCtx.fillStyle = bgColor;
    thumbCtx.fillRect(0, 0, thumb.width, thumb.height);
    thumbCtx.drawImage(finalCanvas, 0, 0, thumb.width, thumb.height);

    return thumb.toDataURL('image/jpeg', 0.85);
  } catch (err) {
    console.warn('Snapshot capture error:', err);
    return null;
  }
}

// ================= INTERACTIVE PIN MODE & IN-PLACE BUBBLE COMPOSER ================= //
function setupIframeInteractions(iframe, viewport) {
  try {
    const doc = iframe.contentDocument;
    const win = iframe.contentWindow;
    if (!doc || !win) return;

    // Listen to scroll to update pin positions
    win.addEventListener('scroll', () => {
      syncPinsWithScroll();
    }, { passive: true });

    // Inject Inspector styles inside iframe
    injectInspectorStyles(doc);

    // DOM Element Inspector: track mouse movement to highlight hovered element
    doc.addEventListener('mousemove', (e) => {
      if (!document.body.classList.contains('pin-mode-active')) return;
      const target = e.target;
      if (!target || target === doc.body || target === doc.documentElement || (target.id && target.id.startsWith('__dom_inspector'))) {
        hideInspectorBox(doc);
        return;
      }
      showInspectorHighlight(doc, target, win);
    }, true);

    doc.addEventListener('mouseleave', () => {
      hideInspectorBox(doc);
    });

    // When in PIN mode, clicking directly inside the iframe web page drops a pin and captures cropped snapshot
    doc.addEventListener('click', async (e) => {
      if (!document.body.classList.contains('pin-mode-active')) return;
      e.preventDefault();
      e.stopPropagation();

      const target = e.target;
      hideInspectorBox(doc);

      const overlay = viewport === 'desktop' ? elements.desktopPinOverlay : elements.mobilePinOverlay;
      const rect = overlay.getBoundingClientRect();
      const clientX = e.clientX;
      const clientY = e.clientY;
      const scrollY = win.scrollY || 0;

      const posX = Math.max(2, Math.min(98, (clientX / rect.width) * 100));
      const pageY = scrollY + clientY;

      // Extract element descriptor & capture cropped snapshot
      const elemDesc = getElementDescriptor(target);
      const snapshotImg = await captureElementSnapshot(target, clientX, clientY, win);

      removeActivePinBubble();
      createInPlacePinComposer(overlay, viewport, posX, pageY, clientX, clientY, snapshotImg, elemDesc);
    }, true);

    // Update cursor if pin mode is currently active
    if (document.body.classList.contains('pin-mode-active')) {
      if (doc.body) doc.body.style.cursor = 'crosshair';
    }
  } catch (err) {
    console.warn('Iframe events setup warning:', err);
  }
}

function setupWheelForwarding() {
  const forwardWheel = (e, iframe) => {
    try {
      if (iframe && iframe.contentWindow) {
        e.preventDefault();
        iframe.contentWindow.scrollBy({
          top: e.deltaY,
          left: e.deltaX,
          behavior: 'auto'
        });
        syncPinsWithScroll();
      }
    } catch (err) {}
  };

  elements.desktopPinOverlay.addEventListener('wheel', (e) => forwardWheel(e, elements.iframeDesktop), { passive: false });
  elements.mobilePinOverlay.addEventListener('wheel', (e) => forwardWheel(e, elements.iframeMobile), { passive: false });
}

function activatePinDropMode() {
  if (!state.currentAdvance) {
    showToast('Selecciona un avance primero para colocar pines', 'error');
    return;
  }
  // Ensure switcher is checked & overlays visible
  if (elements.chkShowPins) {
    elements.chkShowPins.checked = true;
  }

  // Active yellow screen border ONLY on preview device screens
  document.body.classList.add('pin-mode-active');

  elements.desktopPinOverlay.classList.add('visible', 'interactive');
  elements.mobilePinOverlay.classList.add('visible', 'interactive');

  // Set crosshair cursor in both iframes
  try {
    if (elements.iframeDesktop.contentDocument && elements.iframeDesktop.contentDocument.body) {
      elements.iframeDesktop.contentDocument.body.style.cursor = 'crosshair';
    }
    if (elements.iframeMobile.contentDocument && elements.iframeMobile.contentDocument.body) {
      elements.iframeMobile.contentDocument.body.style.cursor = 'crosshair';
    }
  } catch (err) {}

  // Ensure iframe interactions are active
  setupIframeInteractions(elements.iframeDesktop, 'desktop');
  setupIframeInteractions(elements.iframeMobile, 'mobile');

  // Close drawer so user can view screen freely
  closeDrawer();

  // Show floating notification banner
  if (elements.pinDropBanner) {
    elements.pinDropBanner.classList.remove('hidden');
  }

  showToast('Inspector DOM activo: Posiciónate sobre cualquier elemento para resaltarlo y haz clic para capturarlo', 'info');
}

function deactivatePinDropMode() {
  document.body.classList.remove('pin-mode-active');

  elements.desktopPinOverlay.classList.remove('interactive');
  elements.mobilePinOverlay.classList.remove('interactive');

  try {
    if (elements.iframeDesktop.contentDocument) {
      if (elements.iframeDesktop.contentDocument.body) elements.iframeDesktop.contentDocument.body.style.cursor = '';
      hideInspectorBox(elements.iframeDesktop.contentDocument);
    }
    if (elements.iframeMobile.contentDocument) {
      if (elements.iframeMobile.contentDocument.body) elements.iframeMobile.contentDocument.body.style.cursor = '';
      hideInspectorBox(elements.iframeMobile.contentDocument);
    }
  } catch (err) {}

  if (elements.pinDropBanner) {
    elements.pinDropBanner.classList.add('hidden');
  }

  removeActivePinBubble();
}

function removeActivePinBubble() {
  const existingComposer = document.getElementById('activePinBubbleComposer');
  if (existingComposer) existingComposer.remove();
  const existingPopover = document.getElementById('activePinPopover');
  if (existingPopover) existingPopover.remove();
}

function setupPinMode() {
  setupWheelForwarding();

  // Also bind iframes immediately if already loaded
  setupIframeInteractions(elements.iframeDesktop, 'desktop');
  setupIframeInteractions(elements.iframeMobile, 'mobile');

  if (elements.chkShowPins) {
    elements.chkShowPins.addEventListener('change', () => {
      const isVisible = elements.chkShowPins.checked;
      elements.desktopPinOverlay.classList.toggle('visible', isVisible);
      elements.mobilePinOverlay.classList.toggle('visible', isVisible);
      if (isVisible) {
        showToast('Marcadores PIN visibles en pantalla', 'info');
      } else {
        deactivatePinDropMode();
      }
    });
  }

  // Pin Drop Interactive Buttons
  if (elements.btnStartPinDrop) {
    elements.btnStartPinDrop.addEventListener('click', (e) => {
      e.stopPropagation();
      activatePinDropMode();
    });
  }
  if (elements.btnComposerAddPin) {
    elements.btnComposerAddPin.addEventListener('click', (e) => {
      e.stopPropagation();
      activatePinDropMode();
    });
  }
  if (elements.btnCancelPinDrop) {
    elements.btnCancelPinDrop.addEventListener('click', (e) => {
      e.stopPropagation();
      deactivatePinDropMode();
    });
  }

  // Formatting Toolbar Buttons
  document.querySelectorAll('.btn-fmt').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.dataset.target;
      const fmt = btn.dataset.fmt;
      const target = document.getElementById(targetId);
      if (target && fmt) {
        applyFormatting(target, fmt);
      }
    });
  });

  // Clicking on overlays drops pins in-place
  elements.desktopPinOverlay.addEventListener('click', (e) => handleOverlayClick(e, 'desktop'));
  elements.mobilePinOverlay.addEventListener('click', (e) => handleOverlayClick(e, 'mobile'));

  // Dismiss bubbles on outside click (avoid dismissing when clicking on overlay or composer)
  document.addEventListener('click', (e) => {
    if (e.target.closest('#activePinBubbleComposer') || 
        e.target.closest('#activePinPopover') || 
        e.target.closest('.pin-marker') ||
        e.target.closest('#btnStartPinDrop') ||
        e.target.closest('#btnComposerAddPin') ||
        e.target.closest('.pin-overlay') ||
        e.target.closest('.drawer-pin-bar')) {
      return;
    }
    removeActivePinBubble();
  });

  if (elements.btnClosePinModal) {
    elements.btnClosePinModal.addEventListener('click', () => elements.pinCommentModal.close());
  }
  if (elements.btnCancelPin) {
    elements.btnCancelPin.addEventListener('click', () => elements.pinCommentModal.close());
  }
}

function handleOverlayClick(e, viewport) {
  e.preventDefault();
  e.stopPropagation();

  if (e.target.closest('.pin-marker') || 
      e.target.closest('.pin-bubble-card') || 
      e.target.closest('.pin-popover-card') || 
      e.target.closest('.btn-bubble-close') ||
      e.target.closest('#activePinBubbleComposer')) {
    return;
  }

  if (!document.body.classList.contains('pin-mode-active') && (!elements.chkShowPins || !elements.chkShowPins.checked)) {
    return;
  }

  const overlay = viewport === 'mobile' ? elements.mobilePinOverlay : elements.desktopPinOverlay;
  const iframe = viewport === 'mobile' ? elements.iframeMobile : elements.iframeDesktop;
  const rect = overlay.getBoundingClientRect();
  const clientX = e.clientX - rect.left;
  const clientY = e.clientY - rect.top;
  const scrollY = (iframe && iframe.contentWindow) ? (iframe.contentWindow.scrollY || 0) : 0;

  const posX = Math.max(2, Math.min(98, (clientX / rect.width) * 100));
  const pageY = scrollY + clientY;

  let snapshotImg = null;
  let elemDesc = null;

  try {
    if (iframe && iframe.contentDocument) {
      const targetElem = iframe.contentDocument.elementFromPoint(clientX, clientY);
      if (targetElem) {
        elemDesc = getElementDescriptor(targetElem);
        captureElementSnapshot(targetElem, clientX, clientY, iframe.contentWindow).then(snap => {
          removeActivePinBubble();
          createInPlacePinComposer(overlay, viewport, posX, pageY, clientX, clientY, snap, elemDesc);
        }).catch(err => {
          console.warn('Snapshot error:', err);
          removeActivePinBubble();
          createInPlacePinComposer(overlay, viewport, posX, pageY, clientX, clientY, null, elemDesc);
        });
        return;
      }
    }
  } catch (err) {
    console.warn('Could not extract element snapshot from overlay click:', err);
  }

  removeActivePinBubble();
  createInPlacePinComposer(overlay, viewport, posX, pageY, clientX, clientY, snapshotImg, elemDesc);
}

function createInPlacePinComposer(overlay, viewport, posX, pageY, clientX, clientY, snapshotImg = null, elementInfo = null) {
  const rect = overlay.getBoundingClientRect();
  const iframe = viewport === 'desktop' ? elements.iframeDesktop : elements.iframeMobile;
  const scrollY = (iframe && iframe.contentWindow) ? (iframe.contentWindow.scrollY || 0) : 0;

  const visibleX = (clientX !== undefined) ? clientX : (posX / 100) * rect.width;
  const visibleY = (clientY !== undefined) ? clientY : (pageY - scrollY);

  const container = document.createElement('div');
  container.className = 'pin-bubble-composer-container';
  container.id = 'activePinBubbleComposer';
  container.dataset.pageY = pageY;
  container.dataset.viewport = viewport;

  // Crucial: Stop click and mousedown propagation inside composer so outside handlers don't close it
  container.addEventListener('click', (ev) => ev.stopPropagation());
  container.addEventListener('mousedown', (ev) => ev.stopPropagation());

  // Safe clamping within the viewport bounds
  const cardWidth = Math.min(295, rect.width - 24);
  let cardLeft = visibleX + 16;
  let cardTop = visibleY + 16;

  if (cardLeft + cardWidth > rect.width - 12) {
    cardLeft = visibleX - cardWidth - 16;
  }
  if (cardLeft < 12) {
    cardLeft = 12;
  }

  if (cardTop + 220 > rect.height - 12) {
    cardTop = visibleY - 230;
  }
  if (cardTop < 12) {
    cardTop = 12;
  }

  const cleanSection = formatSectionDisplay(state.currentPage);
  const viewportLabel = viewport === 'mobile' ? 'Vista Móvil' : 'Vista PC';

  container.innerHTML = `
    <div class="pin-marker-pulse" style="left: ${posX}%; top: ${visibleY}px;">
      <span class="pulse-ring"></span>
      <span class="pin-symbol">📍</span>
    </div>

    <div class="pin-bubble-card" style="left: ${cardLeft}px; top: ${cardTop}px; width: ${cardWidth}px;">
      <div class="pin-bubble-header">
        <div class="bubble-title-group">
          <span class="bubble-badge">Nuevo Pin</span>
          <span class="bubble-section">${cleanSection} • ${viewportLabel}</span>
        </div>
        <button type="button" class="btn-bubble-close" title="Cancelar">✕</button>
      </div>

      <div class="pin-bubble-body">
        <div class="bubble-row-meta">
          <label class="bubble-meta-label">Categoría:</label>
          <select id="bubbleCategory" class="bubble-category-select">
            <option value="Diseño">🎨 Diseño</option>
            <option value="Contenido">📝 Contenido</option>
            <option value="Funcionalidad">⚙️ Funcionalidad</option>
            <option value="Bug">🐛 Bug / Ajuste</option>
            <option value="General" selected>💬 General</option>
          </select>
        </div>

        <textarea id="bubbleText" class="bubble-textarea" placeholder="Escribe aquí tu observación sobre este elemento..." rows="3"></textarea>

        <div class="bubble-footer-actions">
          <span class="bubble-hint">Ctrl+Enter para enviar</span>
          <div class="bubble-btn-group">
            <button type="button" class="btn btn-xs btn-outline btn-bubble-cancel">Cancelar</button>
            <button type="button" class="btn btn-xs btn-primary btn-bubble-send">
              <svg class="svg-icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              Publicar
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  overlay.appendChild(container);

  const textarea = container.querySelector('#bubbleText');
  const btnClose = container.querySelector('.btn-bubble-close');
  const btnCancel = container.querySelector('.btn-bubble-cancel');
  const btnSend = container.querySelector('.btn-bubble-send');
  const catSelect = container.querySelector('#bubbleCategory');

  btnClose.addEventListener('click', (ev) => {
    ev.stopPropagation();
    removeActivePinBubble();
  });

  btnCancel.addEventListener('click', (ev) => {
    ev.stopPropagation();
    removeActivePinBubble();
  });

  textarea.addEventListener('keydown', async (ev) => {
    if ((ev.ctrlKey || ev.metaKey) && ev.key === 'Enter') {
      ev.preventDefault();
      await doSubmitBubble();
    }
  });

  btnSend.addEventListener('click', async (ev) => {
    ev.stopPropagation();
    await doSubmitBubble();
  });

  async function doSubmitBubble() {
    const content = textarea.value.trim();
    if (!content) {
      textarea.focus();
      return;
    }

    const category = catSelect.value;
    btnSend.disabled = true;
    btnSend.textContent = 'Publicando...';

    try {
      const res = await fetch(`/api/advances/${state.currentAdvance.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_file: state.currentPage,
          viewport_mode: viewport,
          pos_x: posX.toFixed(2),
          pos_y: pageY.toFixed(0),
          author: 'Cliente',
          role: 'Cliente',
          category,
          content,
          snapshot_image: snapshotImg || null,
          element_info: elementInfo || null
        })
      });

      if (!res.ok) throw new Error('Error al guardar comentario en la base de datos');

      const newComment = await res.json();
      state.comments.unshift(newComment);

      removeActivePinBubble();
      deactivatePinDropMode();

      renderPins();
      renderCommentsList();
      updateCommentBadges();

      showToast('Observación publicada con PIN y captura guardada', 'success');
      openDrawer();
      highlightCommentCard(newComment.id);
    } catch (err) {
      console.error(err);
      showToast('Error al publicar: ' + err.message, 'error');
      btnSend.disabled = false;
      btnSend.textContent = 'Publicar';
    }
  }

  setTimeout(() => textarea.focus(), 80);
}

function showPinPopover(comment, markerElement, number) {
  removeActivePinBubble();

  const popover = document.createElement('div');
  popover.className = 'pin-popover-card';
  popover.id = 'activePinPopover';

  const dateStr = new Date(comment.created_at).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  });

  const isResolved = comment.status === 'resolved';

  popover.innerHTML = `
    <div class="pin-popover-header">
      <div class="popover-author-info">
        <span class="popover-pin-badge">#${number}</span>
        <div>
          <div class="popover-author-name">${comment.author} <span class="popover-category">${comment.category}</span></div>
          <div class="popover-date">${dateStr}</div>
        </div>
      </div>
      <button type="button" class="btn-bubble-close" title="Cerrar">✕</button>
    </div>

    <div class="pin-popover-body">
      ${comment.snapshot_image ? `
        <div class="popover-snapshot-wrap" title="Clic para ampliar captura">
          <img src="${comment.snapshot_image}" alt="Captura de elemento" class="popover-snapshot-img">
          <div class="popover-snapshot-overlay">
            <span>🔍 Ampliar captura</span>
          </div>
        </div>
      ` : ''}
      <div class="pin-popover-text">${renderCommentText(comment.content)}</div>
    </div>

    <div class="pin-popover-footer">
      <span class="status-pill ${isResolved ? 'status-resolved' : 'status-pending'}">
        ${isResolved ? '✓ Resuelto' : '⏳ Pendiente'}
      </span>
      <div class="popover-action-btns">
        <button type="button" class="btn btn-xs btn-outline btn-popover-status">
          ${isResolved ? 'Reabrir' : 'Resolver'}
        </button>
        <button type="button" class="btn btn-xs btn-primary btn-popover-drawer">
          Ver en Panel
        </button>
      </div>
    </div>
  `;

  markerElement.appendChild(popover);

  if (comment.snapshot_image) {
    const snapWrap = popover.querySelector('.popover-snapshot-wrap');
    if (snapWrap) {
      snapWrap.addEventListener('click', (e) => {
        e.stopPropagation();
        window.openLightboxModal(
          comment.snapshot_image,
          comment.element_info || 'Captura de elemento HTML',
          `Pin #${number} - ${comment.author}`
        );
      });
    }
  }

  popover.querySelector('.btn-bubble-close').addEventListener('click', (e) => {
    e.stopPropagation();
    popover.remove();
  });

  popover.querySelector('.btn-popover-status').addEventListener('click', async (e) => {
    e.stopPropagation();
    await toggleCommentStatus(comment.id, comment.status);
    popover.remove();
  });

  popover.querySelector('.btn-popover-drawer').addEventListener('click', (e) => {
    e.stopPropagation();
    popover.remove();
    openDrawer();
    highlightCommentCard(comment.id);
  });
}

// ================= RENDER PIN MARKERS WITH SCROLL SYNC ================= //
function renderPins() {
  elements.desktopPinOverlay.innerHTML = '';
  elements.mobilePinOverlay.innerHTML = '';

  const pageComments = state.comments.filter(c =>
    (c.page_file === state.currentPage || c.page_file === 'all') &&
    c.pos_x !== null && c.pos_y !== null
  );

  pageComments.forEach((c, index) => {
    const pinNumber = pageComments.length - index;

    if (c.viewport_mode === 'desktop' || c.viewport_mode === 'both') {
      const pin = createPinElement(c, pinNumber, 'desktop');
      elements.desktopPinOverlay.appendChild(pin);
    }

    if (c.viewport_mode === 'mobile' || c.viewport_mode === 'both') {
      const pin = createPinElement(c, pinNumber, 'mobile');
      elements.mobilePinOverlay.appendChild(pin);
    }
  });

  syncPinsWithScroll();
}

function createPinElement(comment, number, viewport) {
  const marker = document.createElement('div');
  marker.className = `pin-marker status-${comment.status}`;
  marker.style.left = `${comment.pos_x}%`;

  const pageY = parseFloat(comment.pos_y);
  marker.dataset.pageY = pageY;
  marker.dataset.commentId = comment.id;

  const iframe = viewport === 'desktop' ? elements.iframeDesktop : elements.iframeMobile;
  const scrollY = (iframe && iframe.contentWindow) ? (iframe.contentWindow.scrollY || 0) : 0;
  
  let visibleY = pageY;
  if (pageY > 100) {
    visibleY = pageY - scrollY;
  } else {
    visibleY = `${pageY}%`;
  }
  marker.style.top = typeof visibleY === 'number' ? `${visibleY}px` : visibleY;

  marker.innerHTML = `
    <span class="pin-number">${number}</span>
    <div class="pin-tooltip">
      <strong>#${number} ${comment.author} (${comment.category}):</strong><br>
      ${comment.content.length > 50 ? comment.content.substring(0, 50) + '...' : comment.content}
    </div>
  `;

  marker.addEventListener('click', (e) => {
    e.stopPropagation();
    showPinPopover(comment, marker, number);
  });

  return marker;
}

function syncPinsWithScroll() {
  ['desktop', 'mobile'].forEach(vp => {
    const iframe = vp === 'desktop' ? elements.iframeDesktop : elements.iframeMobile;
    const overlay = vp === 'desktop' ? elements.desktopPinOverlay : elements.mobilePinOverlay;
    if (!iframe || !iframe.contentWindow || !overlay) return;

    const scrollY = iframe.contentWindow.scrollY || 0;
    const rect = overlay.getBoundingClientRect();

    overlay.querySelectorAll('.pin-marker').forEach(marker => {
      const pageY = parseFloat(marker.dataset.pageY);
      if (isNaN(pageY) || pageY <= 100) return;

      const visibleY = pageY - scrollY;
      if (visibleY < -40 || visibleY > rect.height + 40) {
        marker.style.display = 'none';
      } else {
        marker.style.display = 'flex';
        marker.style.top = `${visibleY}px`;
      }
    });

    const activeComposer = overlay.querySelector('#activePinBubbleComposer');
    if (activeComposer) {
      const compPageY = parseFloat(activeComposer.dataset.pageY);
      if (!isNaN(compPageY)) {
        const compVisibleY = compPageY - scrollY;
        const pulse = activeComposer.querySelector('.pin-marker-pulse');
        if (pulse) pulse.style.top = `${compVisibleY}px`;
      }
    }
  });
}

// ================= COMMENTS DRAWER ================= //
function setupDrawer() {
  elements.btnToggleDrawer.addEventListener('click', toggleDrawer);
  elements.btnCloseDrawer.addEventListener('click', closeDrawer);

  elements.filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      elements.filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.activeFilter = chip.dataset.filter;
      renderCommentsList();
    });
  });

  elements.formQuickComment.addEventListener('submit', async (e) => {
    e.preventDefault();
    const author = 'Cliente';
    const category = elements.quickCategory ? elements.quickCategory.value : 'General';
    const content = elements.quickContent.value.trim();

    if (!content || !state.currentAdvance) return;

    try {
      const res = await fetch(`/api/advances/${state.currentAdvance.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_file: state.currentPage,
          viewport_mode: state.viewportMode === 'mobile' ? 'mobile' : 'desktop',
          pos_x: null,
          pos_y: null,
          author,
          role: 'Cliente',
          category,
          content
        })
      });

      const newComment = await res.json();
      state.comments.unshift(newComment);
      elements.quickContent.value = '';
      renderCommentsList();
      updateCommentBadges();
      showToast('Comentario publicado en la base de datos SQL', 'success');
    } catch (err) {
      showToast('Error al enviar comentario: ' + err.message, 'error');
    }
  });
}

function toggleDrawer() { elements.commentsDrawer.classList.toggle('open'); }
function openDrawer() { elements.commentsDrawer.classList.add('open'); }
function closeDrawer() { elements.commentsDrawer.classList.remove('open'); }

function setupLightboxModal() {
  if (elements.btnCloseLightboxModal && elements.snapshotLightboxModal) {
    elements.btnCloseLightboxModal.addEventListener('click', () => {
      elements.snapshotLightboxModal.close();
    });
  }
  if (elements.snapshotLightboxModal) {
    elements.snapshotLightboxModal.addEventListener('click', (e) => {
      const rect = elements.snapshotLightboxModal.getBoundingClientRect();
      const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height
        && rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
      if (!isInDialog || e.target === elements.snapshotLightboxModal) {
        elements.snapshotLightboxModal.close();
      }
    });
  }
}

window.openLightboxModal = function(imageSrc, subtitle, title) {
  if (!elements.snapshotLightboxModal) return;
  if (elements.lightboxImg) elements.lightboxImg.src = imageSrc;
  if (elements.lightboxTitle && title) elements.lightboxTitle.textContent = title;
  if (elements.lightboxSubtitle) elements.lightboxSubtitle.textContent = subtitle || '';
  elements.snapshotLightboxModal.showModal();
};

async function loadComments() {
  if (!state.currentAdvance) return;
  try {
    const res = await fetch(`/api/advances/${state.currentAdvance.id}/comments`);
    state.comments = await res.json();
    renderPins();
    renderCommentsList();
    updateCommentBadges();
  } catch (err) {
    console.error(err);
  }
}

function updateCommentBadges() {
  const pendingCount = state.comments.filter(c => c.status === 'pending').length;
  const resolvedCount = state.comments.filter(c => c.status === 'resolved').length;

  elements.headerPendingBadge.textContent = pendingCount;
  elements.countAllComments.textContent = state.comments.length;
  elements.countPendingComments.textContent = pendingCount;
  elements.countResolvedComments.textContent = resolvedCount;
}

function renderCommentsList() {
  elements.commentsList.innerHTML = '';

  let filtered = state.comments;
  if (state.activeFilter === 'pending') {
    filtered = filtered.filter(c => c.status === 'pending');
  } else if (state.activeFilter === 'resolved') {
    filtered = filtered.filter(c => c.status === 'resolved');
  }

  if (filtered.length === 0) {
    elements.commentsList.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); padding: 2.5rem 1rem;">
        <div style="color: var(--text-muted); margin-bottom: 0.5rem;">${ICONS.info}</div>
        <p>No hay observaciones en este filtro.</p>
      </div>
    `;
    return;
  }

  filtered.forEach(c => {
    const card = document.createElement('div');
    card.className = `comment-card ${c.status === 'resolved' ? 'resolved' : ''}`;
    card.id = `comment-card-${c.id}`;

    const dateStr = new Date(c.created_at).toLocaleDateString('es-ES', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });

    card.innerHTML = `
      <div class="comment-card-header">
        <div class="comment-author-info">
          <div class="author-avatar">${c.author.charAt(0).toUpperCase()}</div>
          <div>
            <div class="author-name">${c.author}</div>
            <div class="author-role">${c.role} • ${dateStr}</div>
          </div>
        </div>
        <span class="badge-category">${c.category}</span>
      </div>

      <div class="comment-meta">
        <span class="badge-page">${ICONS.file} ${formatSectionDisplay(c.page_file)}</span>
        ${c.pos_x !== null ? `<span style="font-size: 0.72rem; color: #f59e0b; display: flex; align-items: center; gap: 0.25rem; font-weight: 500;">${ICONS.pin} Pin en pantalla</span>` : ''}
      </div>

      <div class="comment-text">${renderCommentText(c.content)}</div>

      ${c.snapshot_image ? `
        <div class="comment-snapshot-wrap" title="Clic para ampliar captura">
          <img src="${c.snapshot_image}" alt="Captura de elemento" class="comment-snapshot-thumb">
          <div class="comment-snapshot-info">
            <span class="comment-snapshot-tag">${c.element_info || 'Elemento HTML'}</span>
            <span class="comment-snapshot-hint">🔍 Clic para ampliar captura</span>
          </div>
        </div>
      ` : ''}

      <div class="comment-actions">
        <button class="comment-status-btn ${c.status === 'resolved' ? 'resolved' : ''}" onclick="toggleCommentStatus(${c.id}, '${c.status}')">
          ${c.status === 'resolved' ? `${ICONS.check} Resuelto (Reabrir)` : 'Marcar Resuelto'}
        </button>

        <div style="display: flex; gap: 0.4rem;">
          ${c.pos_x !== null ? `
            <button class="btn btn-xs btn-outline" onclick="focusCommentPin(${c.id}, '${c.page_file}')">
              Ver Pin
            </button>
          ` : ''}
          <button class="btn btn-xs btn-danger" onclick="deleteComment(${c.id})" title="Eliminar">
            ${ICONS.trash}
          </button>
        </div>
      </div>
    `;

    if (c.snapshot_image) {
      const snapWrap = card.querySelector('.comment-snapshot-wrap');
      if (snapWrap) {
        snapWrap.addEventListener('click', (e) => {
          e.stopPropagation();
          window.openLightboxModal(
            c.snapshot_image,
            c.element_info || 'Captura de elemento HTML',
            `${c.author} - ${formatSectionDisplay(c.page_file)}`
          );
        });
      }
    }

    elements.commentsList.appendChild(card);
  });
}

window.toggleCommentStatus = async function(id, currentStatus) {
  const newStatus = currentStatus === 'resolved' ? 'pending' : 'resolved';
  try {
    await fetch(`/api/comments/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });

    const comment = state.comments.find(c => c.id === id);
    if (comment) comment.status = newStatus;

    renderPins();
    renderCommentsList();
    updateCommentBadges();
    showToast(newStatus === 'resolved' ? 'Observación marcada como resuelta' : 'Observación reabierta', 'info');
  } catch (err) {
    showToast('Error al actualizar estado', 'error');
  }
};

window.deleteComment = async function(id) {
  if (!confirm('¿Eliminar este comentario permanentemente?')) return;
  try {
    await fetch(`/api/comments/${id}`, { method: 'DELETE' });
    state.comments = state.comments.filter(c => c.id !== id);
    renderPins();
    renderCommentsList();
    updateCommentBadges();
    showToast('Comentario eliminado', 'info');
  } catch (err) {
    showToast('Error al eliminar', 'error');
  }
};

window.focusCommentPin = function(commentId, pageFile) {
  if (state.currentPage !== pageFile) {
    setPage(pageFile);
  }
  highlightPin(commentId);
};

function highlightPin(commentId) {
  const pin = document.querySelector(`.pin-marker[data-comment-id="${commentId}"]`);
  if (pin) {
    pin.scrollIntoView({ behavior: 'smooth', block: 'center' });
    pin.style.transform = 'translate(-50%, -130%) rotate(-45deg) scale(1.6)';
    pin.style.boxShadow = '0 0 25px #f59e0b';
    setTimeout(() => {
      pin.style.transform = '';
      pin.style.boxShadow = '';
    }, 1800);
  }
}

function highlightCommentCard(commentId) {
  const card = document.getElementById(`comment-card-${commentId}`);
  if (card) {
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    card.classList.add('highlight');
    setTimeout(() => card.classList.remove('highlight'), 2000);
  }
}

// ================= UPLOAD FORMS ================= //
function setupUploadForms() {
  elements.btnMethodFolder.addEventListener('click', () => {
    elements.btnMethodFolder.classList.add('active');
    elements.btnMethodZip.classList.remove('active');
    elements.formUploadFolder.classList.remove('hidden');
    elements.formUploadZip.classList.add('hidden');
  });

  elements.btnMethodZip.addEventListener('click', () => {
    elements.btnMethodZip.classList.add('active');
    elements.btnMethodFolder.classList.remove('active');
    elements.formUploadZip.classList.remove('hidden');
    elements.formUploadFolder.classList.add('hidden');
  });

  elements.folderInput.addEventListener('change', () => {
    const files = elements.folderInput.files;
    if (files.length > 0) {
      elements.folderSelectedCount.innerHTML = `${ICONS.check} ${files.length} archivos detectados en la carpeta`;
      elements.folderSelectedCount.classList.remove('hidden');
      elements.btnSubmitFolder.disabled = false;

      if (!elements.folderVersionName.value) {
        elements.folderVersionName.value = `Avance Carpeta - ${new Date().toLocaleDateString('es-ES')}`;
      }
    }
  });

  elements.zipInput.addEventListener('change', () => {
    const file = elements.zipInput.files[0];
    if (file) {
      elements.zipSelectedCount.innerHTML = `${ICONS.check} Archivo: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
      elements.zipSelectedCount.classList.remove('hidden');
      elements.btnSubmitZip.disabled = false;

      if (!elements.zipVersionName.value) {
        elements.zipVersionName.value = `Avance ZIP - ${new Date().toLocaleDateString('es-ES')}`;
      }
    }
  });

  elements.formUploadFolder.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!state.currentProject) return;

    const files = elements.folderInput.files;
    if (!files.length) return;

    const formData = new FormData();
    formData.append('versionName', elements.folderVersionName.value.trim());
    formData.append('notes', elements.folderVersionNotes.value.trim());

    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
      formData.append('paths', files[i].webkitRelativePath || files[i].name);
    }

    await executeUpload(`/api/projects/${state.currentProject.id}/advances/upload-folder`, formData);
  });

  elements.formUploadZip.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!state.currentProject) return;

    const file = elements.zipInput.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('versionName', elements.zipVersionName.value.trim());
    formData.append('notes', elements.zipVersionNotes.value.trim());
    formData.append('zipFile', file);

    await executeUpload(`/api/projects/${state.currentProject.id}/advances/upload-zip`, formData);
  });
}

async function executeUpload(url, formData) {
  elements.uploadProgress.classList.remove('hidden');
  elements.progressStatus.textContent = 'Subiendo y procesando archivos...';
  elements.progressDetail.textContent = 'Extrayendo páginas HTML y estructurando recursos de assets...';

  try {
    const res = await fetch(url, { method: 'POST', body: formData });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Error en la subida');

    elements.uploadProgress.classList.add('hidden');
    showToast(`Avance publicado con éxito: ${result.pagesFound} páginas detectadas.`, 'success');

    await selectProject(state.currentProject.id);
    document.querySelector('.nav-tab[data-tab="tab-preview"]').click();

    elements.folderInput.value = '';
    elements.zipInput.value = '';
    elements.btnSubmitFolder.disabled = true;
    elements.btnSubmitZip.disabled = true;
    elements.folderSelectedCount.classList.add('hidden');
    elements.zipSelectedCount.classList.add('hidden');
  } catch (err) {
    elements.uploadProgress.classList.add('hidden');
    showToast('Fallo al subir avance: ' + err.message, 'error');
  }
}

// ================= BRAND GUIDELINES ================= //
function renderBrandGuide() {
  const guide = state.brandGuide;
  if (!guide) return;

  elements.brandTitle.textContent = guide.brand_name || 'Guía de Marca';
  elements.brandTagline.textContent = guide.tagline || 'Identidad visual y directrices aplicadas a la web';

  const rawGuidelinesText = (guide.guidelines_text || '').trim();
  const isAutoExtractedMsg = /extra[ií]dos|hojas de estilo/i.test(rawGuidelinesText);

  if (elements.brandDescription) {
    if (isAutoExtractedMsg) {
      elements.brandDescription.textContent = 'Sistema de diseño unificado, tokens de color y escalas tipográficas sincronizados en tiempo real con el código fuente de la propuesta web.';
    } else {
      elements.brandDescription.textContent = rawGuidelinesText || 'Sistema de diseño unificado, tokens de color y escalas tipográficas aplicados en la propuesta.';
    }
  }

  // Show source extraction badge without duplicating the description
  if (elements.brandExtractionPill) {
    elements.brandExtractionPill.style.display = 'inline-flex';
    if (elements.brandExtractionText) {
      elements.brandExtractionText.textContent = isAutoExtractedMsg
        ? rawGuidelinesText
        : 'Estilos sincronizados desde las hojas de estilo del proyecto (CSS)';
    }
  }

  // Inject Google Fonts dynamically if available
  if (guide.google_fonts_json) {
    try {
      const gFonts = typeof guide.google_fonts_json === 'string' ? JSON.parse(guide.google_fonts_json) : guide.google_fonts_json;
      if (Array.isArray(gFonts)) {
        gFonts.forEach(href => {
          if (!document.querySelector(`link[href="${href}"]`)) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            document.head.appendChild(link);
          }
        });
      }
    } catch (e) {}
  }

  // Colors
  elements.brandColorsGrid.innerHTML = '';
  let colorsList = [];
  try {
    colorsList = typeof guide.colors_json === 'string' ? JSON.parse(guide.colors_json) : (guide.colors_json || []);
  } catch (e) {
    colorsList = [];
  }

  if (colorsList.length === 0) {
    colorsList = [
      { name: 'Color Primario', hex: guide.primary_color || '#133887', role: 'Color corporativo principal' },
      { name: 'Color Secundario', hex: guide.secondary_color || '#0F172A', role: 'Contraste y fondos oscuros' },
      { name: 'Color Acento', hex: guide.accent_color || '#E2062E', role: 'Detalles y llamadas a la acción' },
      { name: 'Fondo', hex: guide.background_color || '#FFFFFF', role: 'Fondo general de secciones' },
      { name: 'Texto Principal', hex: guide.text_color || '#0F172A', role: 'Cuerpo de lectura y contraste' }
    ];
  }

  colorsList.forEach(c => {
    const card = document.createElement('div');
    card.className = 'color-card';
    card.innerHTML = `
      <div class="color-preview-block" style="background-color: ${c.hex};">
        <span class="copy-indicator">${ICONS.copy} Copiar</span>
      </div>
      <div class="color-card-body">
        <div class="color-card-top">
          <div class="color-title-wrap">
            <span class="color-mini-dot" style="background-color: ${c.hex};"></span>
            <span class="color-title">${escapeHtml(c.name)}</span>
          </div>
          <span class="color-hex">${escapeHtml(c.hex)}</span>
        </div>
        <div class="color-usage">${escapeHtml(c.role || c.usage || 'Token cromático activo en la hoja de estilos')}</div>
      </div>
    `;

    card.addEventListener('click', () => {
      navigator.clipboard.writeText(c.hex);
      showToast(`Código ${c.hex} copiado al portapapeles`, 'success');
    });

    elements.brandColorsGrid.appendChild(card);
  });

  // Typography (Clean font family names and apply live)
  const primaryNameClean = (guide.font_primary || 'Inter').split(',')[0].replace(/['"]/g, '').trim();
  const secondaryNameClean = (guide.font_secondary || 'Space Grotesk').split(',')[0].replace(/['"]/g, '').trim();

  elements.fontPrimaryName.textContent = primaryNameClean;
  elements.fontSecondaryName.textContent = secondaryNameClean;

  elements.fontPrimarySample.style.fontFamily = guide.font_primary || 'Inter, sans-serif';
  elements.fontSecondarySample.style.fontFamily = guide.font_secondary || 'Space Grotesk, sans-serif';

  // Type Scale
  let typeScale = [];
  try {
    const parsed = typeof guide.typography_json === 'string' ? JSON.parse(guide.typography_json) : guide.typography_json;
    if (Array.isArray(parsed)) {
      typeScale = parsed;
    } else if (parsed && parsed.scale) {
      typeScale = parsed.scale;
    }
  } catch (e) {
    typeScale = [];
  }

  if (typeScale.length === 0) {
    typeScale = [
      { tag: 'H1', size: '2.5rem (40px)', weight: '800 ExtraBold', sample: 'Ingeniería que puedes auditar. Obras que perduran.' },
      { tag: 'H2', size: '2rem (32px)', weight: '700 Bold', sample: 'Nuestros Servicios y Soluciones Industriales' },
      { tag: 'H3', size: '1.5rem (24px)', weight: '600 SemiBold', sample: 'Especificaciones Técnicas y Materiales Certificados' },
      { tag: 'Body', size: '1rem (16px)', weight: '400 Regular', sample: 'Texto base legible con contraste óptimo para la lectura en cualquier dispositivo.' }
    ];
  }

  elements.typeScaleBody.innerHTML = '';
  typeScale.forEach(item => {
    const tag = item.level || item.tag || 'H1';
    const isHeading = String(tag).toUpperCase().startsWith('H');
    const fontToUse = isHeading ? (guide.font_secondary || guide.font_primary) : guide.font_primary;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span class="type-tag-badge">${escapeHtml(tag)}</span></td>
      <td><code class="type-size-code">${escapeHtml(item.size)}</code></td>
      <td><span class="type-weight-text">${escapeHtml(item.weight)}</span></td>
      <td class="type-sample-cell" style="font-family: ${fontToUse}; font-weight: ${String(item.weight).includes('Bold') ? '700' : '400'};">
        ${escapeHtml(item.sample)}
      </td>
    `;
    elements.typeScaleBody.appendChild(tr);
  });

  // Do's and Don'ts
  elements.brandDosList.innerHTML = '';
  elements.brandDontsList.innerHTML = '';

  let rules = [];
  try {
    rules = typeof guide.dos_and_donts_json === 'string' ? JSON.parse(guide.dos_and_donts_json) : (guide.dos_and_donts_json || []);
  } catch (e) {
    rules = [];
  }

  rules.forEach(r => {
    const li = document.createElement('li');
    li.textContent = r.rule;
    if (r.type === 'do') {
      elements.brandDosList.appendChild(li);
    } else {
      elements.brandDontsList.appendChild(li);
    }
  });
}

function setupBrandGuideEditor() {
  if (elements.btnAutoExtractStyles) {
    elements.btnAutoExtractStyles.addEventListener('click', async () => {
      if (!state.currentProject) {
        showToast('Selecciona un proyecto primero', 'error');
        return;
      }

      elements.btnAutoExtractStyles.disabled = true;
      elements.btnAutoExtractStyles.innerHTML = `
        <svg class="svg-icon-xs spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        Leyendo estilos...
      `;

      try {
        const res = await fetch(`/api/projects/${state.currentProject.id}/extract-styles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ advanceId: state.currentAdvance ? state.currentAdvance.id : undefined })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error leyendo estilos');

        state.brandGuide = data.brandGuide;
        renderBrandGuide();
        showToast('¡Estilos del sitio web leídos con éxito y reflejados en el proyecto!', 'success');
      } catch (err) {
        showToast('Error: ' + err.message, 'error');
      } finally {
        elements.btnAutoExtractStyles.disabled = false;
        elements.btnAutoExtractStyles.innerHTML = `
          <svg class="svg-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><circle cx="5" cy="5" r="1.5"/><circle cx="19" cy="5" r="1.5"/></svg>
          Auto-leer Estilos del Sitio
        `;
      }
    });
  }

  elements.btnEditBrandGuide.addEventListener('click', openBrandEditor);
  elements.btnCloseBrandModal.addEventListener('click', () => elements.editBrandModal.close());
  elements.btnCancelBrandEdit.addEventListener('click', () => elements.editBrandModal.close());

  const pairs = [
    ['editColorPrimary', 'editColorPrimaryHex'],
    ['editColorSecondary', 'editColorSecondaryHex'],
    ['editColorAccent', 'editColorAccentHex'],
    ['editColorBg', 'editColorBgHex'],
    ['editColorText', 'editColorTextHex'],
  ];

  pairs.forEach(([pickerId, hexId]) => {
    const picker = document.getElementById(pickerId);
    const hex = document.getElementById(hexId);
    if (picker && hex) {
      picker.addEventListener('input', () => { hex.value = picker.value.toUpperCase(); });
      hex.addEventListener('input', () => { if (/^#[0-9A-F]{6}$/i.test(hex.value)) picker.value = hex.value; });
    }
  });

  elements.formEditBrand.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!state.currentProject) return;

    const dos = document.getElementById('editDosText').value.split('\n').filter(s => s.trim()).map(rule => ({ type: 'do', rule }));
    const donts = document.getElementById('editDontsText').value.split('\n').filter(s => s.trim()).map(rule => ({ type: 'dont', rule }));

    const payload = {
      brand_name: document.getElementById('editBrandName').value.trim(),
      tagline: document.getElementById('editBrandTagline').value.trim(),
      guidelines_text: document.getElementById('editBrandDesc').value.trim(),
      primary_color: document.getElementById('editColorPrimaryHex').value.trim(),
      secondary_color: document.getElementById('editColorSecondaryHex').value.trim(),
      accent_color: document.getElementById('editColorAccentHex').value.trim(),
      background_color: document.getElementById('editColorBgHex').value.trim(),
      text_color: document.getElementById('editColorTextHex').value.trim(),
      font_primary: document.getElementById('editFontPrimary').value.trim(),
      font_secondary: document.getElementById('editFontSecondary').value.trim(),
      dos_and_donts_json: [...dos, ...donts]
    };

    try {
      const res = await fetch(`/api/projects/${state.currentProject.id}/brand-guide`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const updated = await res.json();
      state.brandGuide = updated;
      elements.editBrandModal.close();
      renderBrandGuide();
      showToast('Brand Guidelines guardados en SQL', 'success');
    } catch (err) {
      showToast('Error al actualizar Brand Guidelines', 'error');
    }
  });
}

function openBrandEditor() {
  const guide = state.brandGuide || {};
  document.getElementById('editBrandName').value = guide.brand_name || '';
  document.getElementById('editBrandTagline').value = guide.tagline || '';
  document.getElementById('editBrandDesc').value = guide.guidelines_text || '';

  const setPair = (pickerId, hexId, val, defaultVal) => {
    const value = val || defaultVal;
    document.getElementById(pickerId).value = value;
    document.getElementById(hexId).value = value;
  };

  setPair('editColorPrimary', 'editColorPrimaryHex', guide.primary_color, '#2563EB');
  setPair('editColorSecondary', 'editColorSecondaryHex', guide.secondary_color, '#0F172A');
  setPair('editColorAccent', 'editColorAccentHex', guide.accent_color, '#F59E0B');
  setPair('editColorBg', 'editColorBgHex', guide.background_color, '#F8FAFC');
  setPair('editColorText', 'editColorTextHex', guide.text_color, '#1E293B');

  document.getElementById('editFontPrimary').value = guide.font_primary || 'Inter, sans-serif';
  document.getElementById('editFontSecondary').value = guide.font_secondary || 'Montserrat, sans-serif';

  let rules = [];
  try {
    rules = typeof guide.dos_and_donts_json === 'string' ? JSON.parse(guide.dos_and_donts_json) : (guide.dos_and_donts_json || []);
  } catch (e) { rules = []; }

  document.getElementById('editDosText').value = rules.filter(r => r.type === 'do').map(r => r.rule).join('\n');
  document.getElementById('editDontsText').value = rules.filter(r => r.type === 'dont').map(r => r.rule).join('\n');

  elements.editBrandModal.showModal();
}

// ================= PROJECTS LIST & MODALS ================= //
function setupProjectModals() {
  const openNew = () => elements.newProjectModal.showModal();
  if (elements.btnNewProject) elements.btnNewProject.addEventListener('click', openNew);
  if (elements.btnCreateProjectModal) elements.btnCreateProjectModal.addEventListener('click', openNew);

  elements.btnCloseProjectModal.addEventListener('click', () => elements.newProjectModal.close());
  elements.btnCancelNewProject.addEventListener('click', () => elements.newProjectModal.close());

  elements.formNewProject.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('newProjectName').value.trim();
    const client = document.getElementById('newProjectClient').value.trim();
    const description = document.getElementById('newProjectDesc').value.trim();

    const previous_url = elements.newProjectPreviousUrl ? elements.newProjectPreviousUrl.value.trim() : '';

    if (!name) return;

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, client, description, previous_url })
      });

      const newProj = await res.json();
      elements.newProjectModal.close();
      elements.formNewProject.reset();

      showToast(`Proyecto "${newProj.name}" creado en SQL`, 'success');
      await loadProjects();
      await selectProject(newProj.id);
    } catch (err) {
      showToast('Error al crear proyecto: ' + err.message, 'error');
    }
  });
}

async function renderProjectsList() {
  try {
    const res = await fetch('/api/projects');
    const projects = await res.json();

    elements.projectsGrid.innerHTML = '';
    projects.forEach(p => {
      const card = document.createElement('div');
      card.className = 'project-card';
      card.innerHTML = `
        <div class="project-card-header">
          <h3>${p.name}</h3>
          <span class="client-badge">${p.client || 'Cliente no asignado'}</span>
        </div>
        <p style="color: var(--text-secondary); font-size: 0.85rem; flex: 1;">
          ${p.description || 'Sin descripción detallada.'}
        </p>
        <div class="project-stats">
          <div class="stat-item">
            <span class="stat-val">${p.advances_count}</span>
            <span class="stat-label">Entregas</span>
          </div>
          <div class="stat-item">
            <span class="stat-val" style="color: #f59e0b;">${p.pending_comments}</span>
            <span class="stat-label">Pendientes</span>
          </div>
          <div class="stat-item">
            <span class="stat-val" style="color: #10b981;">${p.total_comments - p.pending_comments}</span>
            <span class="stat-label">Resueltos</span>
          </div>
        </div>
        <button class="btn btn-primary btn-sm btn-block" onclick="activateProjectFromList(${p.id})">
          Visualizar este Proyecto
        </button>
      `;
      elements.projectsGrid.appendChild(card);
    });
  } catch (err) {
    console.error(err);
  }
}

window.activateProjectFromList = async function(projectId) {
  elements.projectSelect.value = projectId;
  await selectProject(projectId);
  document.querySelector('.nav-tab[data-tab="tab-preview"]').click();
};

// ================= HTML ESCAPE HELPER ================= //
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ================= AUTHENTICATION & ROLES ================= //
function setupAuth() {
  const savedUser = localStorage.getItem('webreview_user');
  if (savedUser) {
    try {
      state.currentUser = JSON.parse(savedUser);
    } catch (e) {
      state.currentUser = null;
    }
  } else {
    // Default to admin for seamless experience if not set and not in share link
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.get('share')) {
      state.currentUser = { id: 1, username: 'admin', name: 'Administrador Principal', role: 'admin' };
      localStorage.setItem('webreview_user', JSON.stringify(state.currentUser));
    }
  }

  renderAuthUI();

  if (elements.btnCloseLoginModal) {
    elements.btnCloseLoginModal.addEventListener('click', () => elements.loginModal.close());
  }
  if (elements.btnCancelLogin) {
    elements.btnCancelLogin.addEventListener('click', () => elements.loginModal.close());
  }

  const btnToggleLoginPassword = document.getElementById('btnToggleLoginPassword');
  const eyeIconOpen = document.getElementById('eyeIconOpen');
  const eyeIconClosed = document.getElementById('eyeIconClosed');
  if (btnToggleLoginPassword && elements.loginPassword) {
    btnToggleLoginPassword.addEventListener('click', () => {
      const isPassword = elements.loginPassword.type === 'password';
      elements.loginPassword.type = isPassword ? 'text' : 'password';
      if (eyeIconOpen && eyeIconClosed) {
        eyeIconOpen.classList.toggle('hidden', isPassword);
        eyeIconClosed.classList.toggle('hidden', !isPassword);
      }
    });
  }

  if (elements.formLogin) {
    elements.formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      elements.loginErrorMsg.classList.add('hidden');
      elements.loginErrorMsg.textContent = '';

      const username = elements.loginUsername.value.trim();
      const password = elements.loginPassword.value;

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Credenciales inválidas');
        }

        state.currentUser = data.user;
        localStorage.setItem('webreview_user', JSON.stringify(data.user));
        elements.loginModal.close();
        elements.formLogin.reset();
        renderAuthUI();
        showToast(`Bienvenido, ${data.user.name || data.user.username} (${data.user.role === 'admin' ? 'Administrador' : 'Cliente'})`, 'success');
      } catch (err) {
        elements.loginErrorMsg.textContent = err.message;
        elements.loginErrorMsg.classList.remove('hidden');
      }
    });
  }
}

function renderAuthUI() {
  if (!elements.authContainer) return;

  const urlParams = new URLSearchParams(window.location.search);
  const isShareMode = urlParams.get('share') || state.isShareView;

  if (isShareMode) {
    document.body.classList.add('client-mode');
  } else if (state.currentUser) {
    if (state.currentUser.role === 'client') {
      document.body.classList.add('client-mode');
    } else {
      document.body.classList.remove('client-mode');
    }
  } else {
    document.body.classList.add('client-mode');
  }

  elements.authContainer.innerHTML = '';

  if (state.currentUser) {
    const isAdm = state.currentUser.role === 'admin';
    const roleTag = isAdm
      ? '<span class="user-role-tag user-role-admin">Admin</span>'
      : '<span class="user-role-tag user-role-client">Cliente</span>';

    const wrap = document.createElement('div');
    wrap.className = 'user-badge';
    wrap.innerHTML = `
      ${roleTag}
      <span class="user-name-text">${escapeHtml(state.currentUser.name || state.currentUser.username)}</span>
      <button class="btn-logout" title="Cerrar Sesión" id="btnLogoutTrigger">
        <svg class="svg-icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
      </button>
    `;
    elements.authContainer.appendChild(wrap);

    wrap.querySelector('#btnLogoutTrigger').addEventListener('click', () => {
      localStorage.removeItem('webreview_user');
      state.currentUser = null;
      renderAuthUI();
      showToast('Sesión cerrada correctamente', 'info');
    });
  } else {
    const btn = document.createElement('button');
    btn.className = 'btn btn-sm btn-outline';
    btn.innerHTML = `
      <svg class="svg-icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
      Ingresar
    `;
    btn.addEventListener('click', () => {
      if (elements.loginModal) elements.loginModal.showModal();
    });
    elements.authContainer.appendChild(btn);
  }
}

// ================= VISUALIZER DOMAIN SETTINGS ================= //
function setupDomainSetting() {
  if (elements.btnSaveDomain && elements.projectDomainInput) {
    elements.btnSaveDomain.addEventListener('click', async () => {
      if (!state.currentProject) {
        showToast('Selecciona un proyecto primero', 'error');
        return;
      }
      const domainVal = elements.projectDomainInput.value.trim();
      try {
        const res = await fetch(`/api/projects/${state.currentProject.id}/domain`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ custom_domain: domainVal })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al guardar dominio');

        state.currentProject.custom_domain = domainVal;
        updateUrlDisplays();
        showToast(`Dominio "${domainVal}" asignado al visualizador en SQL`, 'success');
      } catch (err) {
        showToast('Error: ' + err.message, 'error');
      }
    });
  }
}

// ================= PREVIOUS WEBSITE URL SETTING ================= //
function setupPreviousUrlSetting() {
  if (elements.btnSavePreviousUrl && elements.projectPreviousUrlInput) {
    elements.btnSavePreviousUrl.addEventListener('click', async () => {
      if (!state.currentProject) {
        showToast('Selecciona un proyecto primero', 'error');
        return;
      }
      const prevUrlVal = elements.projectPreviousUrlInput.value.trim();
      try {
        const res = await fetch(`/api/projects/${state.currentProject.id}/previous-url`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ previous_url: prevUrlVal })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al guardar web anterior');

        state.currentProject.previous_url = prevUrlVal;
        loadPreviousSitePreview();
        showToast(`Web anterior guardada para la comparativa en SQL`, 'success');
      } catch (err) {
        showToast('Error: ' + err.message, 'error');
      }
    });
  }
}

function updateUrlDisplays() {
  const domain = (state.currentProject && state.currentProject.custom_domain)
    ? state.currentProject.custom_domain.trim()
    : '';

  const cleanPath = getCleanUrlPath(state.currentPage);
  const pathSuffix = cleanPath ? (cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`) : '';

  if (domain) {
    let clean = domain.replace(/\/+$/, '');
    let withProtocol = /^https?:\/\//i.test(clean) ? clean : 'https://' + clean;
    let hostOnly = withProtocol.replace(/^https?:\/\//i, '');

    if (elements.desktopUrlDisplay) {
      elements.desktopUrlDisplay.textContent = `${withProtocol}${pathSuffix || '/'}`;
    }
    if (elements.mobileUrlDisplay) {
      elements.mobileUrlDisplay.textContent = `${hostOnly}${pathSuffix}`;
    }
  } else {
    const projSlug = state.currentProject ? state.currentProject.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'web';
    if (elements.desktopUrlDisplay) {
      elements.desktopUrlDisplay.textContent = `https://${projSlug}.pe${pathSuffix || '/'}`;
    }
    if (elements.mobileUrlDisplay) {
      elements.mobileUrlDisplay.textContent = `${projSlug}.pe${pathSuffix}`;
    }
  }
}

// ================= SHARE SHORT LINK MODAL ================= //
function setupShareModal() {
  if (elements.btnShareModalOpen) {
    elements.btnShareModalOpen.addEventListener('click', async () => {
      if (!state.currentProject) {
        showToast('Selecciona un proyecto para compartir', 'error');
        return;
      }
      elements.shareModal.showModal();
      elements.latestShareBox.classList.add('hidden');
      await loadProjectShares();
    });
  }

  if (elements.btnCloseShareModal) {
    elements.btnCloseShareModal.addEventListener('click', () => elements.shareModal.close());
  }

  if (elements.formCreateShare) {
    elements.formCreateShare.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = elements.shareTitleInput.value.trim();
      try {
        const res = await fetch(`/api/projects/${state.currentProject.id}/shares`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error creando enlace');

        elements.latestShareUrl.value = data.share.share_url;
        elements.latestShareBox.classList.remove('hidden');
        elements.shareTitleInput.value = '';
        showToast('Enlace corto generado con éxito', 'success');
        await loadProjectShares();
      } catch (err) {
        showToast('Error: ' + err.message, 'error');
      }
    });
  }

  if (elements.btnCopyLatestShare) {
    elements.btnCopyLatestShare.addEventListener('click', () => {
      navigator.clipboard.writeText(elements.latestShareUrl.value);
      showToast('Enlace copiado al portapapeles', 'success');
    });
  }
}

async function loadProjectShares() {
  if (!state.currentProject || !elements.projectSharesList) return;
  try {
    const res = await fetch(`/api/projects/${state.currentProject.id}/shares`);
    const shares = await res.json();

    elements.projectSharesList.innerHTML = '';
    if (!shares || shares.length === 0) {
      elements.projectSharesList.innerHTML = '<div style="color:var(--text-muted);font-size:0.82rem;padding:0.5rem 0;">Aún no hay enlaces compartidos para este proyecto.</div>';
      return;
    }

    shares.forEach(s => {
      const fullUrl = `${window.location.origin}/s/${s.code}`;
      const item = document.createElement('div');
      item.className = 'share-item-card';
      item.innerHTML = `
        <div class="share-item-info">
          <strong>${escapeHtml(s.title || 'Vista de Cliente')}</strong>
          <span class="share-item-link">${fullUrl}</span>
          <span class="share-item-meta">Creado el ${new Date(s.created_at).toLocaleDateString()}</span>
        </div>
        <div class="share-item-actions">
          <button class="btn btn-xs btn-outline" onclick="copyShareLink('${fullUrl}')" title="Copiar enlace">
            ${ICONS.copy} Copiar
          </button>
          <button class="btn btn-xs btn-danger" onclick="deleteShareLink('${s.code}')" title="Eliminar enlace">
            ${ICONS.trash}
          </button>
        </div>
      `;
      elements.projectSharesList.appendChild(item);
    });
  } catch (err) {
    console.error(err);
  }
}

window.copyShareLink = function(url) {
  navigator.clipboard.writeText(url);
  showToast('Enlace copiado al portapapeles', 'success');
};

window.deleteShareLink = async function(code) {
  if (!confirm('¿Deseas revocar y eliminar este enlace corto?')) return;
  try {
    const res = await fetch(`/api/shares/${code}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar');
    showToast('Enlace revocado', 'info');
    await loadProjectShares();
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  }
};

// ================= USERS MANAGEMENT MODAL ================= //
function setupUsersModal() {
  if (elements.btnUsersModalOpen) {
    elements.btnUsersModalOpen.addEventListener('click', async () => {
      elements.usersModal.showModal();
      await loadUsersList();
    });
  }

  if (elements.btnCloseUsersModal) {
    elements.btnCloseUsersModal.addEventListener('click', () => elements.usersModal.close());
  }

  if (elements.formCreateUser) {
    elements.formCreateUser.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = elements.newUserUsername.value.trim();
      const password = elements.newUserPassword.value;
      const name = elements.newUserName.value.trim();
      const role = elements.newUserRole.value;

      try {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password, name, role })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error creando usuario');

        elements.formCreateUser.reset();
        showToast(`Usuario "${username}" creado en SQL con rol "${role}"`, 'success');
        await loadUsersList();
      } catch (err) {
        showToast('Error: ' + err.message, 'error');
      }
    });
  }
}

async function loadUsersList() {
  if (!elements.usersTableBody) return;
  try {
    const res = await fetch('/api/users');
    const users = await res.json();

    elements.usersTableBody.innerHTML = '';
    users.forEach(u => {
      const tr = document.createElement('tr');
      const isAdm = u.role === 'admin';
      const roleTag = isAdm
        ? '<span class="user-role-tag user-role-admin">Admin</span>'
        : '<span class="user-role-tag user-role-client">Cliente</span>';

      const isCurrent = state.currentUser && state.currentUser.id === u.id;

      tr.innerHTML = `
        <td><strong>${escapeHtml(u.username)}</strong> ${isCurrent ? '<small style="color:var(--primary);">(Tú)</small>' : ''}</td>
        <td>${escapeHtml(u.name || '-')}</td>
        <td>${roleTag}</td>
        <td><small class="text-muted">${new Date(u.created_at).toLocaleDateString()}</small></td>
        <td style="text-align: right;">
          ${isCurrent ? '' : `<button class="btn btn-xs btn-danger" onclick="deleteUser(${u.id}, '${escapeHtml(u.username)}')" title="Eliminar usuario">${ICONS.trash}</button>`}
        </td>
      `;
      elements.usersTableBody.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
  }
}

window.deleteUser = async function(id, username) {
  if (!confirm(`¿Estás seguro de eliminar al usuario "${username}"?`)) return;
  try {
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar usuario');
    showToast(`Usuario "${username}" eliminado`, 'info');
    await loadUsersList();
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  }
};

// ================= LOAD SHARED PROJECT ================= //
async function loadSharedProject(code) {
  try {
    const res = await fetch(`/api/shares/${code}`);
    if (!res.ok) {
      showToast('El enlace compartido no es válido o ha expirado', 'error');
      document.body.classList.add('client-mode');
      return;
    }
    const data = await res.json();
    state.isShareView = true;
    document.body.classList.add('client-mode');

    state.currentProject = data.project;
    state.brandGuide = data.brandGuide;
    loadPreviousSitePreview();

    if (elements.clientProjectTitle) {
      elements.clientProjectTitle.textContent = data.project.name;
    }

    if (data.advances && data.advances.length > 0) {
      elements.advanceSelect.innerHTML = '';
      data.advances.forEach(adv => {
        const opt = document.createElement('option');
        opt.value = adv.id;
        opt.textContent = `${adv.version_name}`;
        elements.advanceSelect.appendChild(opt);
      });
      await selectAdvance(data.advances[0].id);
    } else {
      clearPreview();
    }

    renderBrandGuide();
    showToast(`Visualizando proyecto compartido: ${data.project.name}`, 'info');
  } catch (err) {
    showToast('Error al cargar enlace: ' + err.message, 'error');
  }
}
