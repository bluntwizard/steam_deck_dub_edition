/**
 * @jest-environment jsdom
 */

import VersionManager from '../../components/VersionManager';

describe('VersionManager', () => {
  let versionManager;
  let mockFetch;
  
  // Mock current version
  const currentVersion = '1.2.0';
  
  // Mock version data response
  const mockVersionData = {
    currentVersion: '1.3.0',
    versions: [
      {
        version: '1.3.0',
        date: '2023-08-15',
        changes: [
          'Added new keyboard shortcuts',
          'Improved performance on lower-end devices',
          'Fixed multiple UI bugs'
        ]
      },
      {
        version: '1.2.0',
        date: '2023-07-01',
        changes: [
          'Redesigned layout',
          'Dark mode support',
          'Added gallery component'
        ]
      }
    ]
  };

  beforeEach(() => {
    // Clear any elements from previous tests
    document.body.innerHTML = '';
    
    // Mock localStorage
    const localStorageMock = (() => {
      let store = {};
      return {
        getItem: jest.fn(key => store[key] || null),
        setItem: jest.fn((key, value) => {
          store[key] = value.toString();
        }),
        clear: jest.fn(() => {
          store = {};
        })
      };
    })();
    
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    });
    
    // Mock fetch API
    mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockVersionData)
    });
    global.fetch = mockFetch;
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('Initialization', () => {
    test('should initialize with the provided version', () => {
      versionManager = new VersionManager(currentVersion);
      expect(versionManager.currentVersion).toBe(currentVersion);
    });
    
    test('should use default values for optional options', () => {
      versionManager = new VersionManager(currentVersion);
      expect(versionManager.options.apiUrl).toBe('/api/version.json');
      expect(versionManager.options.autoCheck).toBe(true);
      expect(versionManager.options.checkInterval).toBe(86400000); // 24 hours
    });
    
    test('should override default options with provided options', () => {
      const customOptions = {
        apiUrl: '/custom/version-api.json',
        autoCheck: false,
        checkInterval: 3600000 // 1 hour
      };
      
      versionManager = new VersionManager(currentVersion, customOptions);
      
      expect(versionManager.options.apiUrl).toBe(customOptions.apiUrl);
      expect(versionManager.options.autoCheck).toBe(customOptions.autoCheck);
      expect(versionManager.options.checkInterval).toBe(customOptions.checkInterval);
    });
    
    test('should set up auto checking if enabled', () => {
      jest.useFakeTimers();
      jest.spyOn(global, 'setInterval');
      
      versionManager = new VersionManager(currentVersion, { autoCheck: true, checkInterval: 1000 });
      versionManager.init();
      
      expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 1000);
      
      jest.useRealTimers();
    });
  });
  
  describe('Version checking', () => {
    test('should fetch version data from API', async () => {
      versionManager = new VersionManager(currentVersion);
      await versionManager.checkForUpdates();
      
      expect(mockFetch).toHaveBeenCalledWith(versionManager.options.apiUrl);
      expect(versionManager.versionData).toEqual(mockVersionData);
    });
    
    test('should handle fetch errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      versionManager = new VersionManager(currentVersion);
      await versionManager.checkForUpdates();
      
      expect(versionManager.versionData).toBeNull();
    });
    
    test('should detect when a new version is available', async () => {
      versionManager = new VersionManager(currentVersion);
      await versionManager.checkForUpdates();
      
      expect(versionManager.hasUpdate()).toBe(true);
    });
    
    test('should not detect update when on latest version', async () => {
      versionManager = new VersionManager('1.3.0'); // Same as latest version in mock data
      await versionManager.checkForUpdates();
      
      expect(versionManager.hasUpdate()).toBe(false);
    });
    
    test('should not detect update when API call fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      versionManager = new VersionManager(currentVersion);
      await versionManager.checkForUpdates();
      
      expect(versionManager.hasUpdate()).toBe(false);
    });
  });
  
  describe('UI Components', () => {
    beforeEach(() => {
      versionManager = new VersionManager(currentVersion);
    });
    
    test('should create changelog dialog when showChangelog is called', async () => {
      await versionManager.checkForUpdates();
      versionManager.showChangelog();
      
      const dialog = document.querySelector('.changelogDialog');
      expect(dialog).not.toBeNull();
      
      const title = document.querySelector('.changelogTitle');
      expect(title.textContent).toBe('What\'s New');
      
      const versionEntries = document.querySelectorAll('.versionEntry');
      expect(versionEntries.length).toBe(2); // Two versions in mock data
      
      const firstVersionTitle = versionEntries[0].querySelector('.versionTitle');
      expect(firstVersionTitle.textContent).toContain('1.3.0');
      
      const firstVersionChanges = versionEntries[0].querySelectorAll('.changesList li');
      expect(firstVersionChanges.length).toBe(3); // Three changes in first version
    });
    
    test('should highlight current version in changelog', async () => {
      await versionManager.checkForUpdates();
      versionManager.showChangelog();
      
      const versionEntries = document.querySelectorAll('.versionEntry');
      const currentVersionEntry = Array.from(versionEntries).find(
        entry => entry.querySelector('.versionTitle').textContent.includes(currentVersion)
      );
      
      expect(currentVersionEntry.classList.contains('highlight')).toBe(true);
    });
    
    test('should close changelog when close button is clicked', async () => {
      await versionManager.checkForUpdates();
      versionManager.showChangelog();
      
      const closeButton = document.querySelector('.closeButton');
      closeButton.click();
      
      expect(document.querySelector('.changelogDialog')).toBeNull();
    });
    
    test('should create update notification when showUpdateNotification is called', async () => {
      await versionManager.checkForUpdates();
      versionManager.showUpdateNotification();
      
      const notification = document.querySelector('.updateNotification');
      expect(notification).not.toBeNull();
      
      const title = notification.querySelector('h3');
      expect(title.textContent).toBe('Update Available');
      
      const message = notification.querySelector('p');
      expect(message.textContent).toContain('1.3.0');
    });
    
    test('should make notification visible with animation', async () => {
      await versionManager.checkForUpdates();
      versionManager.showUpdateNotification();
      
      // Access directly because getComputedStyle won't work in JSDOM
      const notification = document.querySelector('.updateNotification');
      expect(notification.classList.contains('visible')).toBe(true);
    });
    
    test('should close notification when dismiss button is clicked', async () => {
      await versionManager.checkForUpdates();
      versionManager.showUpdateNotification();
      
      const dismissButton = document.querySelector('.dismissButton');
      dismissButton.click();
      
      const notification = document.querySelector('.updateNotification');
      expect(notification.classList.contains('visible')).toBe(false);
      
      // After transition would complete
      setTimeout(() => {
        expect(document.querySelector('.updateNotification')).toBeNull();
      }, 300);
    });
    
    test('should show changelog when view updates button is clicked', async () => {
      await versionManager.checkForUpdates();
      versionManager.showUpdateNotification();
      
      const viewButton = document.querySelector('.viewUpdatesButton');
      viewButton.click();
      
      expect(document.querySelector('.updateNotification')).toBeNull();
      expect(document.querySelector('.changelogDialog')).not.toBeNull();
    });
  });
  
  describe('Persistence', () => {
    test('should save dismissed version to localStorage', async () => {
      versionManager = new VersionManager(currentVersion);
      await versionManager.checkForUpdates();
      
      versionManager.dismissUpdate();
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'sdde_dismissed_version',
        mockVersionData.currentVersion
      );
    });
    
    test('should not show notification for previously dismissed version', async () => {
      localStorage.getItem.mockReturnValueOnce('1.3.0'); // Already dismissed
      
      versionManager = new VersionManager(currentVersion);
      await versionManager.checkForUpdates();
      
      expect(versionManager.shouldShowNotification()).toBe(false);
    });
    
    test('should show notification for new version after previous dismissal', async () => {
      localStorage.getItem.mockReturnValueOnce('1.2.5'); // Previously dismissed older version
      
      versionManager = new VersionManager(currentVersion);
      await versionManager.checkForUpdates();
      
      expect(versionManager.shouldShowNotification()).toBe(true);
    });
  });
}); 