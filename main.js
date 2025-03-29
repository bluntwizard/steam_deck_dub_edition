const { app, BrowserWindow, ipcMain, session, protocol } = require('electron');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');
const updateHandler = require('./src/main/update-handler');

// Initialize application data store with encryption for sensitive data
const store = new Store({
  encryptionKey: 'sdde-user-preferences',
  name: 'user-preferences'
});

// Cache management
const contentCache = {
  data: new Map(),
  maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  
  set(key, value) {
    this.data.set(key, {
      value,
      timestamp: Date.now()
    });
  },
  
  get(key) {
    const entry = this.data.get(key);
    if (!entry) return null;
    
    // Check if cache entry is expired
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.data.delete(key);
      return null;
    }
    
    return entry.value;
  },
  
  clear() {
    this.data.clear();
  }
};

// Platform-specific startup handling
if (process.platform === 'win32') {
  // Handle Windows squirrel events
  try {
    if (require('electron-squirrel-startup')) {
      app.quit();
    }
  } catch (error) {
    console.log('electron-squirrel-startup not available, skipping Windows installer events');
  }
}

// Keep a global reference of the window object to prevent garbage collection
let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'Steam Deck DUB Edition',
    icon: path.join(__dirname, 'assets/icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Set up Content Security Policy
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          'default-src \'self\'; script-src \'self\' \'unsafe-inline\'; style-src \'self\' \'unsafe-inline\'; img-src \'self\' data:; font-src \'self\' data:;'
        ]
      }
    });
  });

  // Load the index.html file
  mainWindow.loadFile('index.html');

  // Open DevTools in development environment
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
    
    // Show debug info in development
    mainWindow.webContents.on('did-finish-load', () => {
      mainWindow.webContents.send('app-info', {
        appVersion: app.getVersion(),
        electronVersion: process.versions.electron,
        nodeVersion: process.versions.node,
        platform: process.platform,
        arch: process.arch
      });
    });
  }

  // Emitted when the window is closed
  mainWindow.on('closed', function () {
    // Dereference the window object
    mainWindow = null;
  });
}

// Register protocol for custom scheme
app.whenReady().then(() => {
  protocol.registerFileProtocol('sdde', (request, callback) => {
    const url = request.url.substr(7); // strip "sdde://"
    try {
      return callback(path.normalize(`${__dirname}/${url}`));
    } catch (error) {
      console.error('Protocol handler error:', error);
    }
  });
});

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();
  
  // Set up platform-specific behaviors
  if (process.platform === 'darwin') {
    // On macOS, dock icon should be set
    app.dock.setIcon(path.join(__dirname, 'assets/icon.png'));
  }
});

// Quit when all windows are closed
app.on('window-all-closed', function () {
  // On macOS, applications typically stay open until explicitly quit with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On macOS, re-create the window when dock icon is clicked and no windows are open
  if (mainWindow === null) {
    createWindow();
  }
});

// Handle user preferences
ipcMain.handle('get-user-preference', (event, key, defaultValue) => {
  return store.get(key, defaultValue);
});

ipcMain.handle('set-user-preference', (event, key, value) => {
  store.set(key, value);
  return true;
});

// Handle content caching
ipcMain.handle('cache-get', (event, key) => {
  return contentCache.get(key);
});

ipcMain.handle('cache-set', (event, key, value) => {
  contentCache.set(key, value);
  return true;
});

ipcMain.handle('cache-clear', () => {
  contentCache.clear();
  return true;
});

// Handle any IPC communication from renderer to main process
ipcMain.on('app-command', (event, command, ...args) => {
  switch (command) {
    case 'restart-app':
      app.relaunch();
      app.exit(0);
      break;
    
    case 'check-for-updates':
      updateHandler.checkForUpdates()
        .then(updateInfo => {
          event.reply('update-status', updateInfo);
        })
        .catch(error => {
          console.error('Update check failed:', error);
          event.reply('update-status', { status: 'error', message: error.message });
        });
      break;
      
    case 'toggle-fullscreen':
      if (mainWindow) {
        const isFullScreen = mainWindow.isFullScreen();
        mainWindow.setFullScreen(!isFullScreen);
        event.reply('fullscreen-status', !isFullScreen);
      }
      break;
      
    default:
      console.log('Unknown command:', command);
  }
});

// Add IPC handlers for updates
ipcMain.handle('check-for-updates', () => {
  updateHandler.checkForUpdates();
});

ipcMain.handle('get-version', () => {
  return updateHandler.getCurrentVersion();
});
