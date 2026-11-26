const { app, BrowserWindow, ipcMain, dialog, Menu, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');

let win;

// DaVinci Resolve LUT folder (Windows / macOS), used as the default save location
function resolveLutDir() {
  const candidates = process.platform === 'win32'
    ? [path.join(process.env.PROGRAMDATA || 'C:\\ProgramData', 'Blackmagic Design', 'DaVinci Resolve', 'Support', 'LUT')]
    : [path.join(app.getPath('home'), 'Library', 'Application Support', 'Blackmagic Design', 'DaVinci Resolve', 'LUT'),
       '/Library/Application Support/Blackmagic Design/DaVinci Resolve/LUT'];
  return candidates.find(p => { try { return fs.statSync(p).isDirectory(); } catch { return false; } }) || app.getPath('documents');
}

function createWindow() {
  win = new BrowserWindow({
    width: 1440, height: 940, minWidth: 900, minHeight: 640,
    backgroundColor: '#16171a',
    title: 'LUT Generator',
    icon: path.join(__dirname, 'build', 'icon.png'),
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  win.loadFile(path.join(__dirname, 'app', 'index.html'));
  // external links open in the normal browser
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https:\/\//.test(url)) shell.openExternal(url); return { action: 'deny' }; });
}

ipcMain.handle('save-cube', async (_e, name, text) => {
  const safe = String(name || 'LUT.cube').replace(/[\\/:*?"<>|]+/g, '_');
  const { canceled, filePath } = await dialog.showSaveDialog(win, {
    title: 'Save LUT',
    defaultPath: path.join(resolveLutDir(), safe.endsWith('.cube') ? safe : safe + '.cube'),
    filters: [{ name: 'Cube LUT', extensions: ['cube'] }]
  });
  if (canceled || !filePath) return null;
  try {
    await fs.promises.writeFile(filePath, String(text), 'utf8');
  } catch (err) {
    if (err.code === 'EPERM' || err.code === 'EACCES') {
      // Resolve's ProgramData folder can be admin-only: fall back to Documents
      const alt = path.join(app.getPath('documents'), path.basename(filePath));
      await fs.promises.writeFile(alt, String(text), 'utf8');
      dialog.showMessageBox(win, { type: 'info', message: 'Resolve LUT folder ekata liyanna permission na. Documents folder ekata save kala:', detail: alt });
      return alt;
    }
    throw err;
  }
  return filePath;
});
ipcMain.handle('app-version', () => app.getVersion());

function setupMenu() {
  const menu = Menu.buildFromTemplate([
    { label: 'File', submenu: [{ role: 'reload' }, { type: 'separator' }, { role: 'quit' }] },
    { label: 'View', submenu: [{ role: 'zoomIn' }, { role: 'zoomOut' }, { role: 'resetZoom' }, { type: 'separator' }, { role: 'togglefullscreen' }] },
    { label: 'Help', submenu: [
      { label: 'Check for updates', click: () => checkUpdates(true) },
      { label: 'About', click: () => dialog.showMessageBox(win, { message: 'LUT Generator', detail: 'Version ' + app.getVersion() }) }
    ] }
  ]);
  Menu.setApplicationMenu(menu);
}

// ---- auto update from GitHub Releases ----
let manualCheck = false;
function checkUpdates(manual) {
  if (!app.isPackaged) return;
  manualCheck = manual;
  autoUpdater.checkForUpdates().catch(err => { if (manual) dialog.showMessageBox(win, { type: 'warning', message: 'Update check eka fail una', detail: String(err && err.message || err) }); });
}
autoUpdater.autoDownload = true;
autoUpdater.on('update-not-available', () => { if (manualCheck) dialog.showMessageBox(win, { message: 'Oya thiyenne aluthma version eka (' + app.getVersion() + ').' }); });
autoUpdater.on('update-downloaded', info => {
  dialog.showMessageBox(win, {
    type: 'info', buttons: ['Restart karala update karanna', 'Passe'], defaultId: 0,
    message: 'Aluth version ' + info.version + ' download wela thiyenawa.',
    detail: 'Restart kalama update eka install wenawa.'
  }).then(r => { if (r.response === 0) autoUpdater.quitAndInstall(); });
});

if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
  app.whenReady().then(() => {
    setupMenu();
    createWindow();
    setTimeout(() => checkUpdates(false), 4000);
  });
  app.on('window-all-closed', () => app.quit());
}
