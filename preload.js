const { contextBridge, shell } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openExternal: (url) => shell.openExternal(url),
  openPath: (path) => shell.openPath(path)
});
