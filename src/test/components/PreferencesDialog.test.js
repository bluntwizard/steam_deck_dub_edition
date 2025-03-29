/**
 * @jest-environment jsdom
 */

import PreferencesDialog from '../../components/PreferencesDialog/PreferencesDialog';

describe('PreferencesDialog Component', () => {
  let container;
  let preferencesDialog;
  let mockSaveCallback;
  let mockResetCallback;
  
  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = '<div id="app"></div>';
    container = document.getElementById('app');
    
    // Mock callbacks
    mockSaveCallback = jest.fn();
    mockResetCallback = jest.fn();
  });
  
  afterEach(() => {
    // Clean up
    document.body.innerHTML = '';
    if (preferencesDialog && preferencesDialog.destroy) {
      preferencesDialog.destroy();
    }
    preferencesDialog = null;
    jest.resetAllMocks();
  });
  
  describe('Initialization', () => {
    test('should initialize with default options when autoInit is true', () => {
      preferencesDialog = new PreferencesDialog({
        container,
        autoInit: true
      });
      
      expect(container.querySelector('.preferencesDialog')).toBeTruthy();
    });
    
    test('should not initialize when autoInit is false', () => {
      preferencesDialog = new PreferencesDialog({
        container,
        autoInit: false
      });
      
      expect(container.querySelector('.preferencesDialog')).toBeFalsy();
      
      // Manual initialization
      preferencesDialog.initialize();
      expect(container.querySelector('.preferencesDialog')).toBeTruthy();
    });
  });
  
  describe('Dialog Structure', () => {
    beforeEach(() => {
      preferencesDialog = new PreferencesDialog({
        container,
        title: 'Test Preferences',
        description: 'Test Description',
        autoInit: true
      });
    });
    
    test('should create dialog with correct title and description', () => {
      const title = container.querySelector('.dialogTitle');
      const description = container.querySelector('.dialogDescription');
      
      expect(title.textContent).toBe('Test Preferences');
      expect(description.textContent).toBe('Test Description');
    });
    
    test('should have a close button', () => {
      const closeButton = container.querySelector('.closeButton');
      expect(closeButton).toBeTruthy();
    });
    
    test('should have action buttons (save and reset)', () => {
      const actionButtons = container.querySelector('.actionButtons');
      const saveButton = actionButtons.querySelector('.primaryButton');
      const resetButton = actionButtons.querySelector('.secondaryButton');
      
      expect(saveButton).toBeTruthy();
      expect(resetButton).toBeTruthy();
    });
  });
  
  describe('Tab Management', () => {
    beforeEach(() => {
      preferencesDialog = new PreferencesDialog({
        container,
        tabs: [
          { id: 'tab1', label: 'Tab 1', active: true },
          { id: 'tab2', label: 'Tab 2' }
        ],
        autoInit: true
      });
    });
    
    test('should create tabs based on configuration', () => {
      const tabsContainer = container.querySelector('.tabsContainer');
      expect(tabsContainer.querySelectorAll('.tabButton').length).toBe(2);
    });
    
    test('should set the first tab as active by default', () => {
      const activeTab = container.querySelector('.tabButton.active');
      expect(activeTab.getAttribute('data-tab-id')).toBe('tab1');
    });
    
    test('should switch tabs when tab button is clicked', () => {
      const tab2Button = container.querySelector('[data-tab-id="tab2"]');
      
      // Simulate click on tab 2
      tab2Button.click();
      
      // Check if tab 2 is now active
      expect(tab2Button.classList.contains('active')).toBe(true);
      const activeTabContent = container.querySelector('.tabContent.active');
      expect(activeTabContent.getAttribute('data-tab-id')).toBe('tab2');
    });
  });
  
  describe('Preferences Controls', () => {
    const testPreferences = {
      appearance: {
        theme: {
          type: 'select',
          label: 'Theme',
          value: 'dark',
          options: [
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
            { value: 'system', label: 'System' }
          ]
        },
        fontSize: {
          type: 'slider',
          label: 'Font Size',
          value: 16,
          min: 12,
          max: 24,
          step: 1
        }
      },
      accessibility: {
        reduceMotion: {
          type: 'toggle',
          label: 'Reduce Motion',
          value: false
        }
      }
    };
    
    beforeEach(() => {
      preferencesDialog = new PreferencesDialog({
        container,
        preferences: testPreferences,
        onSave: mockSaveCallback,
        onReset: mockResetCallback,
        autoInit: true
      });
    });
    
    test('should create preference controls based on the configuration', () => {
      // Check if there's a select for theme
      const themeSelect = container.querySelector('select[name="appearance.theme"]');
      expect(themeSelect).toBeTruthy();
      expect(themeSelect.value).toBe('dark');
      expect(themeSelect.querySelectorAll('option').length).toBe(3);
      
      // Check if there's a slider for font size
      const fontSizeSlider = container.querySelector('input[type="range"][name="appearance.fontSize"]');
      expect(fontSizeSlider).toBeTruthy();
      expect(fontSizeSlider.value).toBe('16');
      expect(fontSizeSlider.min).toBe('12');
      expect(fontSizeSlider.max).toBe('24');
      
      // Check if there's a toggle for reduce motion
      const reduceMotionToggle = container.querySelector('input[type="checkbox"][name="accessibility.reduceMotion"]');
      expect(reduceMotionToggle).toBeTruthy();
      expect(reduceMotionToggle.checked).toBe(false);
    });
    
    test('should update preferences when controls are changed', () => {
      // Change theme select
      const themeSelect = container.querySelector('select[name="appearance.theme"]');
      themeSelect.value = 'light';
      themeSelect.dispatchEvent(new Event('change'));
      
      // Change font size slider
      const fontSizeSlider = container.querySelector('input[type="range"][name="appearance.fontSize"]');
      fontSizeSlider.value = '20';
      fontSizeSlider.dispatchEvent(new Event('input'));
      
      // Change reduce motion toggle
      const reduceMotionToggle = container.querySelector('input[type="checkbox"][name="accessibility.reduceMotion"]');
      reduceMotionToggle.checked = true;
      reduceMotionToggle.dispatchEvent(new Event('change'));
      
      // Get the current preferences from the dialog
      const currentPrefs = preferencesDialog.getCurrentPreferences();
      
      // Check if values are updated
      expect(currentPrefs.appearance.theme).toBe('light');
      expect(currentPrefs.appearance.fontSize).toBe(20);
      expect(currentPrefs.accessibility.reduceMotion).toBe(true);
    });
  });
  
  describe('Save and Reset Functionality', () => {
    const testPreferences = {
      theme: {
        type: 'select',
        label: 'Theme',
        value: 'dark',
        options: [
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' }
        ]
      }
    };
    
    beforeEach(() => {
      preferencesDialog = new PreferencesDialog({
        container,
        preferences: testPreferences,
        onSave: mockSaveCallback,
        onReset: mockResetCallback,
        autoInit: true
      });
    });
    
    test('should call onSave callback with updated preferences when save button is clicked', () => {
      // Change theme
      const themeSelect = container.querySelector('select[name="theme"]');
      themeSelect.value = 'light';
      themeSelect.dispatchEvent(new Event('change'));
      
      // Click save button
      const saveButton = container.querySelector('.primaryButton');
      saveButton.click();
      
      expect(mockSaveCallback).toHaveBeenCalledTimes(1);
      expect(mockSaveCallback).toHaveBeenCalledWith({ theme: 'light' });
    });
    
    test('should call onReset callback and reset preferences to initial values when reset button is clicked', () => {
      // Change theme
      const themeSelect = container.querySelector('select[name="theme"]');
      themeSelect.value = 'light';
      themeSelect.dispatchEvent(new Event('change'));
      
      // Click reset button
      const resetButton = container.querySelector('.secondaryButton');
      resetButton.click();
      
      // A confirmation dialog should appear
      const confirmDialog = container.querySelector('.confirmDialog');
      expect(confirmDialog).toBeTruthy();
      
      // Click confirm button
      const confirmButton = confirmDialog.querySelector('.dangerButton');
      confirmButton.click();
      
      expect(mockResetCallback).toHaveBeenCalledTimes(1);
      
      // Check if preferences are reset to initial values
      const themeSelectAfterReset = container.querySelector('select[name="theme"]');
      expect(themeSelectAfterReset.value).toBe('dark');
    });
  });
  
  describe('Dialog Visibility', () => {
    beforeEach(() => {
      preferencesDialog = new PreferencesDialog({
        container,
        autoInit: true
      });
    });
    
    test('should be hidden by default', () => {
      const dialog = container.querySelector('.preferencesDialog');
      expect(dialog.classList.contains('open')).toBe(false);
    });
    
    test('should show dialog when open method is called', () => {
      preferencesDialog.open();
      
      const dialog = container.querySelector('.preferencesDialog');
      expect(dialog.classList.contains('open')).toBe(true);
    });
    
    test('should hide dialog when close method is called', () => {
      // First open the dialog
      preferencesDialog.open();
      
      // Then close it
      preferencesDialog.close();
      
      const dialog = container.querySelector('.preferencesDialog');
      expect(dialog.classList.contains('open')).toBe(false);
    });
    
    test('should close dialog when clicking outside the dialog content', () => {
      // First open the dialog
      preferencesDialog.open();
      
      // Click on the backdrop (the dialog element itself, not its content)
      const dialog = container.querySelector('.preferencesDialog');
      dialog.click();
      
      expect(dialog.classList.contains('open')).toBe(false);
    });
    
    test('should not close dialog when clicking inside the dialog content', () => {
      // First open the dialog
      preferencesDialog.open();
      
      // Click on the dialog content
      const dialogContent = container.querySelector('.preferencesDialogContent');
      dialogContent.click();
      
      const dialog = container.querySelector('.preferencesDialog');
      expect(dialog.classList.contains('open')).toBe(true);
    });
  });
  
  describe('Notification System', () => {
    beforeEach(() => {
      preferencesDialog = new PreferencesDialog({
        container,
        autoInit: true
      });
    });
    
    test('should show a notification when showNotification method is called', () => {
      preferencesDialog.showNotification('Test notification');
      
      const notification = container.querySelector('.notification');
      expect(notification).toBeTruthy();
      expect(notification.textContent).toContain('Test notification');
    });
    
    test('should show an error notification when showNotification is called with error type', () => {
      preferencesDialog.showNotification('Error message', 'error');
      
      const notification = container.querySelector('.notification.errorNotification');
      expect(notification).toBeTruthy();
      expect(notification.textContent).toContain('Error message');
    });
    
    test('should remove notification after the specified duration', () => {
      jest.useFakeTimers();
      
      preferencesDialog.showNotification('Test notification', 'success', 1000);
      
      // Check if notification exists
      expect(container.querySelector('.notification')).toBeTruthy();
      
      // Fast-forward time
      jest.advanceTimersByTime(1500);
      
      // Check if notification is removed
      expect(container.querySelector('.notification')).toBeFalsy();
      
      jest.useRealTimers();
    });
  });
  
  describe('Keyboard Navigation and Accessibility', () => {
    beforeEach(() => {
      preferencesDialog = new PreferencesDialog({
        container,
        autoInit: true
      });
      preferencesDialog.open();
    });
    
    test('should close dialog when Escape key is pressed', () => {
      // Simulate Escape key press
      const escEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(escEvent);
      
      const dialog = container.querySelector('.preferencesDialog');
      expect(dialog.classList.contains('open')).toBe(false);
    });
    
    test('should trap focus within the dialog when Tab key is pressed', () => {
      // This test is more complex and might require a more sophisticated approach
      // to check focus trapping, but here's a basic version:
      
      const dialog = container.querySelector('.preferencesDialog');
      const focusableElements = dialog.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      
      expect(focusableElements.length).toBeGreaterThan(0);
      
      // Check that the first element is focused by default
      expect(document.activeElement).toBe(focusableElements[0]);
    });
  });
  
  describe('API Methods', () => {
    const testPreferences = {
      theme: {
        type: 'select',
        label: 'Theme',
        value: 'dark',
        options: [
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' }
        ]
      },
      notifications: {
        enabled: {
          type: 'toggle',
          label: 'Enable Notifications',
          value: true
        }
      }
    };
    
    beforeEach(() => {
      preferencesDialog = new PreferencesDialog({
        container,
        preferences: testPreferences,
        autoInit: true
      });
    });
    
    test('getCurrentPreferences should return the current preferences state', () => {
      const currentPrefs = preferencesDialog.getCurrentPreferences();
      
      expect(currentPrefs).toEqual({
        theme: 'dark',
        notifications: {
          enabled: true
        }
      });
    });
    
    test('setPreference should update a single preference', () => {
      preferencesDialog.setPreference('theme', 'light');
      
      const themeSelect = container.querySelector('select[name="theme"]');
      expect(themeSelect.value).toBe('light');
      
      const currentPrefs = preferencesDialog.getCurrentPreferences();
      expect(currentPrefs.theme).toBe('light');
    });
    
    test('setPreferences should update multiple preferences at once', () => {
      preferencesDialog.setPreferences({
        theme: 'light',
        notifications: {
          enabled: false
        }
      });
      
      const themeSelect = container.querySelector('select[name="theme"]');
      expect(themeSelect.value).toBe('light');
      
      const notificationsToggle = container.querySelector('input[name="notifications.enabled"]');
      expect(notificationsToggle.checked).toBe(false);
      
      const currentPrefs = preferencesDialog.getCurrentPreferences();
      expect(currentPrefs.theme).toBe('light');
      expect(currentPrefs.notifications.enabled).toBe(false);
    });
    
    test('addPreference should add a new preference control', () => {
      preferencesDialog.addPreference('fontSize', {
        type: 'slider',
        label: 'Font Size',
        value: 16,
        min: 12,
        max: 24
      });
      
      const fontSizeSlider = container.querySelector('input[type="range"][name="fontSize"]');
      expect(fontSizeSlider).toBeTruthy();
      expect(fontSizeSlider.value).toBe('16');
      
      const currentPrefs = preferencesDialog.getCurrentPreferences();
      expect(currentPrefs.fontSize).toBe(16);
    });
    
    test('removePreference should remove a preference control', () => {
      preferencesDialog.removePreference('notifications.enabled');
      
      const notificationsToggle = container.querySelector('input[name="notifications.enabled"]');
      expect(notificationsToggle).toBeFalsy();
      
      const currentPrefs = preferencesDialog.getCurrentPreferences();
      expect(currentPrefs.notifications).toBeUndefined();
    });
    
    test('destroy should remove the dialog and clean up event listeners', () => {
      preferencesDialog.destroy();
      
      const dialog = container.querySelector('.preferencesDialog');
      expect(dialog).toBeFalsy();
      
      // The dialog reference should be nullified
      expect(preferencesDialog.dialogElement).toBeNull();
    });
  });
}); 