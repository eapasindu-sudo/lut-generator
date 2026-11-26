const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('lutApp', {
  saveCube: (name, text) => ipcRenderer.invoke('save-cube', name, text),
  version: () => ipcRenderer.invoke('app-version')
});
