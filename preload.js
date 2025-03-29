// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electronAPI', {
    // App control
    sendCommand: (command, ...args) => {
      ipcRenderer.send('app-command', command, ...args);
    },
    onUpdateStatus: (callback) => {
      ipcRenderer.on('update-status', (event, status) => callback(status));
    },
    onFullscreenStatus: (callback) => {
      ipcRenderer.on('fullscreen-status', (event, status) => callback(status));
    },
    onAppInfo: (callback) => {
      ipcRenderer.on('app-info', (event, info) => callback(info));
    },
    
    // User preferences
    getUserPreference: async (key, defaultValue) => {
      return await ipcRenderer.invoke('get-user-preference', key, defaultValue);
    },
    setUserPreference: async (key, value) => {
      return await ipcRenderer.invoke('set-user-preference', key, value);
    },
    
    // Content caching
    getFromCache: async (key) => {
      return await ipcRenderer.invoke('cache-get', key);
    },
    setToCache: async (key, value) => {
      return await ipcRenderer.invoke('cache-set', key, value);
    },
    clearCache: async () => {
      return await ipcRenderer.invoke('cache-clear');
    }
  }
);

// Add version info to window
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type]);
  }
});
