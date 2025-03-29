/**
 * @jest-environment jsdom
 */

import SettingsTabs from '../../components/SettingsTabs';

describe('SettingsTabs', () => {
  beforeEach(() => {
    // Clear document body before each test
    document.body.innerHTML = '';
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('Initialization', () => {
    test('should initialize with default options when autoInit is true', () => {
      const settingsTabs = new SettingsTabs();
      
      expect(settingsTabs.initialized).toBe(true);
      expect(settingsTabs.tabsElement).not.toBeNull();
      expect(document.body.contains(settingsTabs.tabsElement)).toBe(true);
    });
    
    test('should not initialize when autoInit is false', () => {
      const settingsTabs = new SettingsTabs({ autoInit: false });
      
      expect(settingsTabs.initialized).toBe(false);
      expect(settingsTabs.tabsElement).toBeNull();
    });
    
    test('should initialize manually when calling initialize()', () => {
      const settingsTabs = new SettingsTabs({ autoInit: false });
      const element = settingsTabs.initialize();
      
      expect(settingsTabs.initialized).toBe(true);
      expect(settingsTabs.tabsElement).not.toBeNull();
      expect(element).toBe(settingsTabs.tabsElement);
      expect(document.body.contains(settingsTabs.tabsElement)).toBe(true);
    });
    
    test('should create tabs based on the tabs array option', () => {
      const tabs = [
        { id: 'tab1', label: 'Tab 1', content: 'Tab 1 content' },
        { id: 'tab2', label: 'Tab 2', content: 'Tab 2 content' }
      ];
      
      const settingsTabs = new SettingsTabs({ tabs });
      
      expect(settingsTabs.tabButtons.size).toBe(2);
      expect(settingsTabs.tabPanes.size).toBe(2);
      
      const tabButton1 = settingsTabs.tabButtons.get('tab1');
      const tabButton2 = settingsTabs.tabButtons.get('tab2');
      const tabPane1 = settingsTabs.tabPanes.get('tab1');
      const tabPane2 = settingsTabs.tabPanes.get('tab2');
      
      expect(tabButton1).not.toBeUndefined();
      expect(tabButton2).not.toBeUndefined();
      expect(tabPane1).not.toBeUndefined();
      expect(tabPane2).not.toBeUndefined();
      
      expect(tabButton1.textContent).toContain('Tab 1');
      expect(tabButton2.textContent).toContain('Tab 2');
      expect(tabPane1.innerHTML).toContain('Tab 1 content');
      expect(tabPane2.innerHTML).toContain('Tab 2 content');
    });
    
    test('should mark the first tab as active by default', () => {
      const tabs = [
        { id: 'tab1', label: 'Tab 1' },
        { id: 'tab2', label: 'Tab 2' }
      ];
      
      const settingsTabs = new SettingsTabs({ tabs });
      
      expect(settingsTabs.options.activeTab).toBe('tab1');
      expect(settingsTabs.tabButtons.get('tab1').getAttribute('aria-selected')).toBe('true');
      expect(settingsTabs.tabPanes.get('tab1').hidden).toBe(false);
      expect(settingsTabs.tabButtons.get('tab2').getAttribute('aria-selected')).toBe('false');
      expect(settingsTabs.tabPanes.get('tab2').hidden).toBe(true);
    });
    
    test('should use specified activeTab if provided', () => {
      const tabs = [
        { id: 'tab1', label: 'Tab 1' },
        { id: 'tab2', label: 'Tab 2' }
      ];
      
      const settingsTabs = new SettingsTabs({ 
        tabs,
        activeTab: 'tab2'
      });
      
      expect(settingsTabs.options.activeTab).toBe('tab2');
      expect(settingsTabs.tabButtons.get('tab1').getAttribute('aria-selected')).toBe('false');
      expect(settingsTabs.tabPanes.get('tab1').hidden).toBe(true);
      expect(settingsTabs.tabButtons.get('tab2').getAttribute('aria-selected')).toBe('true');
      expect(settingsTabs.tabPanes.get('tab2').hidden).toBe(false);
    });
  });
  
  describe('Tab Switching', () => {
    test('should switch tabs when clicking tab buttons', () => {
      const tabs = [
        { id: 'tab1', label: 'Tab 1' },
        { id: 'tab2', label: 'Tab 2' }
      ];
      
      const mockTabChangeHandler = jest.fn();
      const settingsTabs = new SettingsTabs({ 
        tabs,
        onTabChange: mockTabChangeHandler
      });
      
      // Initially tab1 should be active
      expect(settingsTabs.options.activeTab).toBe('tab1');
      
      // Click on tab2
      settingsTabs.tabButtons.get('tab2').click();
      
      // Now tab2 should be active
      expect(settingsTabs.options.activeTab).toBe('tab2');
      expect(settingsTabs.tabButtons.get('tab1').getAttribute('aria-selected')).toBe('false');
      expect(settingsTabs.tabPanes.get('tab1').hidden).toBe(true);
      expect(settingsTabs.tabButtons.get('tab2').getAttribute('aria-selected')).toBe('true');
      expect(settingsTabs.tabPanes.get('tab2').hidden).toBe(false);
      
      // Tab change handler should have been called
      expect(mockTabChangeHandler).toHaveBeenCalledWith('tab2', 'tab1');
    });
    
    test('should switch tabs programmatically using switchToTab', () => {
      const tabs = [
        { id: 'tab1', label: 'Tab 1' },
        { id: 'tab2', label: 'Tab 2' }
      ];
      
      const settingsTabs = new SettingsTabs({ tabs });
      
      // Initially tab1 should be active
      expect(settingsTabs.options.activeTab).toBe('tab1');
      
      // Switch to tab2 programmatically
      const result = settingsTabs.switchToTab('tab2');
      
      // Method should return true to indicate success
      expect(result).toBe(true);
      
      // Now tab2 should be active
      expect(settingsTabs.options.activeTab).toBe('tab2');
      expect(settingsTabs.tabButtons.get('tab1').getAttribute('aria-selected')).toBe('false');
      expect(settingsTabs.tabPanes.get('tab1').hidden).toBe(true);
      expect(settingsTabs.tabButtons.get('tab2').getAttribute('aria-selected')).toBe('true');
      expect(settingsTabs.tabPanes.get('tab2').hidden).toBe(false);
    });
    
    test('should dispatch tab-change event when switching tabs', () => {
      const tabs = [
        { id: 'tab1', label: 'Tab 1' },
        { id: 'tab2', label: 'Tab 2' }
      ];
      
      const settingsTabs = new SettingsTabs({ tabs });
      
      // Add event listener for tab-change event
      const mockEventListener = jest.fn();
      settingsTabs.tabsElement.addEventListener('tab-change', mockEventListener);
      
      // Switch to tab2
      settingsTabs.switchToTab('tab2');
      
      // Event should have been dispatched
      expect(mockEventListener).toHaveBeenCalled();
      
      // Check event details
      const eventArg = mockEventListener.mock.calls[0][0];
      expect(eventArg.detail.tabs).toBe(settingsTabs);
      expect(eventArg.detail.tabId).toBe('tab2');
      expect(eventArg.detail.previousTabId).toBe('tab1');
    });
    
    test('should not trigger events when switching to the already active tab', () => {
      const tabs = [
        { id: 'tab1', label: 'Tab 1' },
        { id: 'tab2', label: 'Tab 2' }
      ];
      
      const mockTabChangeHandler = jest.fn();
      const settingsTabs = new SettingsTabs({ 
        tabs,
        onTabChange: mockTabChangeHandler
      });
      
      // Add event listener for tab-change event
      const mockEventListener = jest.fn();
      settingsTabs.tabsElement.addEventListener('tab-change', mockEventListener);
      
      // Switch to tab1 (which is already active)
      settingsTabs.switchToTab('tab1');
      
      // Event and callback should not have been called
      expect(mockTabChangeHandler).not.toHaveBeenCalled();
      expect(mockEventListener).not.toHaveBeenCalled();
    });
  });
  
  describe('Tab Management', () => {
    test('should add a new tab using addTab', () => {
      const initialTabs = [
        { id: 'tab1', label: 'Tab 1' }
      ];
      
      const settingsTabs = new SettingsTabs({ tabs: initialTabs });
      
      // Add a new tab
      const newTab = { id: 'tab2', label: 'New Tab', content: 'New tab content' };
      const result = settingsTabs.addTab(newTab);
      
      // Method should return true to indicate success
      expect(result).toBe(true);
      
      // Check that the tab was added
      expect(settingsTabs.tabButtons.size).toBe(2);
      expect(settingsTabs.tabPanes.size).toBe(2);
      expect(settingsTabs.options.tabs.length).toBe(2);
      
      const tabButton = settingsTabs.tabButtons.get('tab2');
      const tabPane = settingsTabs.tabPanes.get('tab2');
      
      expect(tabButton).not.toBeUndefined();
      expect(tabPane).not.toBeUndefined();
      expect(tabButton.textContent).toContain('New Tab');
      expect(tabPane.innerHTML).toContain('New tab content');
      
      // The first tab should still be active
      expect(settingsTabs.options.activeTab).toBe('tab1');
    });
    
    test('should add a new tab and switch to it when switchTo is true', () => {
      const initialTabs = [
        { id: 'tab1', label: 'Tab 1' }
      ];
      
      const settingsTabs = new SettingsTabs({ tabs: initialTabs });
      
      // Add a new tab and switch to it
      const newTab = { id: 'tab2', label: 'New Tab' };
      settingsTabs.addTab(newTab, true);
      
      // The new tab should be active
      expect(settingsTabs.options.activeTab).toBe('tab2');
      expect(settingsTabs.tabButtons.get('tab2').getAttribute('aria-selected')).toBe('true');
      expect(settingsTabs.tabPanes.get('tab2').hidden).toBe(false);
    });
    
    test('should remove a tab using removeTab', () => {
      const tabs = [
        { id: 'tab1', label: 'Tab 1' },
        { id: 'tab2', label: 'Tab 2' },
        { id: 'tab3', label: 'Tab 3' }
      ];
      
      const settingsTabs = new SettingsTabs({ tabs });
      
      // Remove the second tab
      const result = settingsTabs.removeTab('tab2');
      
      // Method should return true to indicate success
      expect(result).toBe(true);
      
      // Check that the tab was removed
      expect(settingsTabs.tabButtons.size).toBe(2);
      expect(settingsTabs.tabPanes.size).toBe(2);
      expect(settingsTabs.options.tabs.length).toBe(2);
      
      expect(settingsTabs.tabButtons.has('tab2')).toBe(false);
      expect(settingsTabs.tabPanes.has('tab2')).toBe(false);
      
      // The first tab should still be active
      expect(settingsTabs.options.activeTab).toBe('tab1');
    });
    
    test('should switch to another tab when removing the active tab', () => {
      const tabs = [
        { id: 'tab1', label: 'Tab 1' },
        { id: 'tab2', label: 'Tab 2' }
      ];
      
      const settingsTabs = new SettingsTabs({ 
        tabs,
        activeTab: 'tab1'
      });
      
      // Remove the active tab
      settingsTabs.removeTab('tab1');
      
      // Should switch to the remaining tab
      expect(settingsTabs.options.activeTab).toBe('tab2');
      expect(settingsTabs.tabButtons.get('tab2').getAttribute('aria-selected')).toBe('true');
      expect(settingsTabs.tabPanes.get('tab2').hidden).toBe(false);
    });
    
    test('should update tab properties using updateTab', () => {
      const tabs = [
        { id: 'tab1', label: 'Tab 1', content: 'Original content' }
      ];
      
      const settingsTabs = new SettingsTabs({ tabs });
      
      // Update the tab
      const result = settingsTabs.updateTab('tab1', {
        label: 'Updated Label',
        content: 'Updated content'
      });
      
      // Method should return true to indicate success
      expect(result).toBe(true);
      
      // Check that the tab was updated
      const tabButton = settingsTabs.tabButtons.get('tab1');
      const tabPane = settingsTabs.tabPanes.get('tab1');
      
      expect(tabButton.textContent).toContain('Updated Label');
      expect(tabPane.innerHTML).toContain('Updated content');
      
      // Original tab object should also be updated
      expect(settingsTabs.options.tabs[0].label).toBe('Updated Label');
    });
  });
  
  describe('Utility Methods', () => {
    test('getActiveTab should return the active tab ID', () => {
      const tabs = [
        { id: 'tab1', label: 'Tab 1' },
        { id: 'tab2', label: 'Tab 2' }
      ];
      
      const settingsTabs = new SettingsTabs({ 
        tabs,
        activeTab: 'tab2'
      });
      
      expect(settingsTabs.getActiveTab()).toBe('tab2');
      
      // Switch to tab1
      settingsTabs.switchToTab('tab1');
      
      // Should now return tab1
      expect(settingsTabs.getActiveTab()).toBe('tab1');
    });
    
    test('getTabs should return a copy of the tabs array', () => {
      const originalTabs = [
        { id: 'tab1', label: 'Tab 1' },
        { id: 'tab2', label: 'Tab 2' }
      ];
      
      const settingsTabs = new SettingsTabs({ tabs: originalTabs });
      
      const returnedTabs = settingsTabs.getTabs();
      
      // Should be a copy, not the original
      expect(returnedTabs).not.toBe(settingsTabs.options.tabs);
      
      // But should have the same content
      expect(returnedTabs).toEqual(originalTabs);
      
      // Modifying the returned array should not affect the original
      returnedTabs.push({ id: 'tab3', label: 'Tab 3' });
      expect(settingsTabs.options.tabs.length).toBe(2);
    });
    
    test('destroy should remove the tabs from the DOM and reset state', () => {
      const tabs = [
        { id: 'tab1', label: 'Tab 1' },
        { id: 'tab2', label: 'Tab 2' }
      ];
      
      const settingsTabs = new SettingsTabs({ tabs });
      const tabsElement = settingsTabs.tabsElement;
      
      expect(document.body.contains(tabsElement)).toBe(true);
      expect(settingsTabs.initialized).toBe(true);
      
      settingsTabs.destroy();
      
      expect(document.body.contains(tabsElement)).toBe(false);
      expect(settingsTabs.initialized).toBe(false);
      expect(settingsTabs.tabsElement).toBeNull();
      expect(settingsTabs.tabButtons.size).toBe(0);
      expect(settingsTabs.tabPanes.size).toBe(0);
    });
  });
}); 