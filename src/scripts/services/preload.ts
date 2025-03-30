// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
import { contextBridge, ipcRenderer } from 'electron';

/**
 * App information interface
 */
interface AppInfo {
  version: string;
  buildNumber: string;
  platform: string;
  isInternalBuild: boolean;
}

/**
 * Update status interface
 */
interface UpdateStatus {
  status: 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error';
  info?: {
    version: string;
    releaseDate: string;
    releaseNotes: string;
  };
  error?: string;
  progress?: {
    percent: number;
    bytesPerSecond: number;
    total: number;
    transferred: number;
  };
}

/**
 * Electron API exposed to the renderer process
 */
interface ElectronAPI {
  // App control
  sendCommand: (command: string, ...args: any[]) => void;
  onUpdateStatus: (callback: (status: UpdateStatus) => void) => void;
  onFullscreenStatus: (callback: (isFullscreen: boolean) => void) => void;
  onAppInfo: (callback: (info: AppInfo) => void) => void;
  
  // User preferences
  getUserPreference: <T>(key: string, defaultValue: T) => Promise<T>;
  setUserPreference: <T>(key: string, value: T) => Promise<void>;
  
  // Content caching
  getFromCache: <T>(key: string) => Promise<T | null>;
  setToCache: <T>(key: string, value: T) => Promise<void>;
  clearCache: () => Promise<void>;
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electronAPI', {
    // App control
    sendCommand: (command: string, ...args: any[]): void => {
      ipcRenderer.send('app-command', command, ...args);
    },
    onUpdateStatus: (callback: (status: UpdateStatus) => void): void => {
      ipcRenderer.on('update-status', (_event, status: UpdateStatus) => callback(status));
    },
    onFullscreenStatus: (callback: (isFullscreen: boolean) => void): void => {
      ipcRenderer.on('fullscreen-status', (_event, status: boolean) => callback(status));
    },
    onAppInfo: (callback: (info: AppInfo) => void): void => {
      ipcRenderer.on('app-info', (_event, info: AppInfo) => callback(info));
    },
    
    // User preferences
    getUserPreference: async <T>(key: string, defaultValue: T): Promise<T> => {
      return await ipcRenderer.invoke('get-user-preference', key, defaultValue);
    },
    setUserPreference: async <T>(key: string, value: T): Promise<void> => {
      return await ipcRenderer.invoke('set-user-preference', key, value);
    },
    
    // Content caching
    getFromCache: async <T>(key: string): Promise<T | null> => {
      return await ipcRenderer.invoke('cache-get', key);
    },
    setToCache: async <T>(key: string, value: T): Promise<void> => {
      return await ipcRenderer.invoke('cache-set', key, value);
    },
    clearCache: async (): Promise<void> => {
      return await ipcRenderer.invoke('cache-clear');
    }
  } as ElectronAPI
);

// Add version info to window
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector: string, text: string): void => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type] || '');
  }
});

// Add global type declarations so TypeScript knows about the electronAPI
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

// Export type for use in other files
export type { ElectronAPI, AppInfo, UpdateStatus }; 