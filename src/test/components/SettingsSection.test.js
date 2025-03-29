/**
 * @jest-environment jsdom
 */

import SettingsSection from '../../components/SettingsSection';

describe('SettingsSection', () => {
  beforeEach(() => {
    // Clear document body before each test
    document.body.innerHTML = '';
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('Initialization', () => {
    test('should initialize with default options when autoInit is true', () => {
      const settingsSection = new SettingsSection();
      
      expect(settingsSection.initialized).toBe(true);
      expect(settingsSection.sectionElement).not.toBeNull();
      expect(document.body.contains(settingsSection.sectionElement)).toBe(true);
    });
    
    test('should not initialize when autoInit is false', () => {
      const settingsSection = new SettingsSection({ autoInit: false });
      
      expect(settingsSection.initialized).toBe(false);
      expect(settingsSection.sectionElement).toBeNull();
    });
    
    test('should initialize manually when calling initialize()', () => {
      const settingsSection = new SettingsSection({ autoInit: false });
      const element = settingsSection.initialize();
      
      expect(settingsSection.initialized).toBe(true);
      expect(settingsSection.sectionElement).not.toBeNull();
      expect(element).toBe(settingsSection.sectionElement);
      expect(document.body.contains(settingsSection.sectionElement)).toBe(true);
    });
    
    test('should not initialize twice', () => {
      const settingsSection = new SettingsSection();
      const original = settingsSection.sectionElement;
      const result = settingsSection.initialize();
      
      expect(result).toBe(original);
    });
  });
  
  describe('Configuration', () => {
    test('should use default options when not provided', () => {
      const settingsSection = new SettingsSection();
      
      expect(settingsSection.options.title).toBe('Settings');
      expect(settingsSection.options.icon).toBe('⚙️');
      expect(settingsSection.options.container).toBe(document.body);
      expect(settingsSection.options.settings).toEqual([]);
      expect(settingsSection.options.autoInit).toBe(true);
      expect(typeof settingsSection.options.onSettingChange).toBe('function');
    });
    
    test('should override default options when provided', () => {
      const customContainer = document.createElement('div');
      const mockCallback = jest.fn();
      const mockSettings = [{ id: 'test', type: 'toggle' }];
      
      const settingsSection = new SettingsSection({
        id: 'custom-id',
        title: 'Custom Title',
        icon: '🔧',
        container: customContainer,
        onSettingChange: mockCallback,
        settings: mockSettings,
        autoInit: false
      });
      
      expect(settingsSection.options.id).toBe('custom-id');
      expect(settingsSection.options.title).toBe('Custom Title');
      expect(settingsSection.options.icon).toBe('🔧');
      expect(settingsSection.options.container).toBe(customContainer);
      expect(settingsSection.options.onSettingChange).toBe(mockCallback);
      expect(settingsSection.options.settings).toBe(mockSettings);
      expect(settingsSection.options.autoInit).toBe(false);
    });
  });
  
  describe('DOM Structure', () => {
    test('should create a section with correct attributes and classes', () => {
      const settingsSection = new SettingsSection({ id: 'test-section' });
      
      expect(settingsSection.sectionElement.id).toBe('test-section');
      expect(settingsSection.sectionElement.tagName).toBe('SECTION');
      expect(settingsSection.sectionElement.getAttribute('aria-labelledby')).toBe('test-section-title');
    });
    
    test('should create a header with title and icon', () => {
      const settingsSection = new SettingsSection({
        id: 'test-section',
        title: 'Test Title',
        icon: '🔧'
      });
      
      const header = settingsSection.sectionElement.querySelector('div');
      const icon = header.querySelector('span');
      const title = header.querySelector('h3');
      
      expect(header).not.toBeNull();
      expect(icon).not.toBeNull();
      expect(icon.innerHTML).toBe('🔧');
      expect(title).not.toBeNull();
      expect(title.id).toBe('test-section-title');
      expect(title.textContent).toBe('Test Title');
    });
    
    test('should create settings based on configuration', () => {
      const settings = [
        { id: 'setting1', type: 'toggle', label: 'Toggle Setting' },
        { id: 'setting2', type: 'select', label: 'Select Setting', options: [
          { value: 'option1', label: 'Option 1' },
          { value: 'option2', label: 'Option 2' }
        ]}
      ];
      
      const settingsSection = new SettingsSection({ settings });
      
      const settingElements = settingsSection.sectionElement.querySelectorAll('[data-setting-id]');
      expect(settingElements.length).toBe(2);
      
      const toggleSetting = settingsSection.sectionElement.querySelector('[data-setting-id="setting1"]');
      expect(toggleSetting).not.toBeNull();
      expect(toggleSetting.querySelector('label').textContent).toBe('Toggle Setting');
      expect(toggleSetting.querySelector('input[type="checkbox"]')).not.toBeNull();
      
      const selectSetting = settingsSection.sectionElement.querySelector('[data-setting-id="setting2"]');
      expect(selectSetting).not.toBeNull();
      expect(selectSetting.querySelector('label').textContent).toBe('Select Setting');
      expect(selectSetting.querySelector('select')).not.toBeNull();
      
      const options = selectSetting.querySelectorAll('option');
      expect(options.length).toBe(2);
      expect(options[0].value).toBe('option1');
      expect(options[0].textContent).toBe('Option 1');
      expect(options[1].value).toBe('option2');
      expect(options[1].textContent).toBe('Option 2');
    });
  });
  
  describe('Setting Controls', () => {
    test('should create toggle switch', () => {
      const settings = [
        { id: 'toggle1', type: 'toggle', label: 'Toggle Setting', value: true },
        { id: 'toggle2', type: 'toggle', label: 'Disabled Toggle', value: false, disabled: true }
      ];
      
      const settingsSection = new SettingsSection({ settings });
      
      const toggle1 = settingsSection.sectionElement.querySelector('#setting-toggle1');
      expect(toggle1).not.toBeNull();
      expect(toggle1.type).toBe('checkbox');
      expect(toggle1.checked).toBe(true);
      expect(toggle1.disabled).toBe(false);
      
      const toggle2 = settingsSection.sectionElement.querySelector('#setting-toggle2');
      expect(toggle2).not.toBeNull();
      expect(toggle2.disabled).toBe(true);
    });
    
    test('should create select dropdown', () => {
      const settings = [
        { 
          id: 'select1', 
          type: 'select', 
          label: 'Select Setting', 
          value: 'option2',
          options: [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
            { value: 'option3', label: 'Option 3' }
          ]
        }
      ];
      
      const settingsSection = new SettingsSection({ settings });
      
      const select = settingsSection.sectionElement.querySelector('#setting-select1');
      expect(select).not.toBeNull();
      expect(select.tagName).toBe('SELECT');
      expect(select.value).toBe('option2');
      expect(select.options.length).toBe(3);
    });
    
    test('should create radio button group', () => {
      const settings = [
        { 
          id: 'radio1', 
          type: 'radio', 
          label: 'Radio Setting', 
          value: 'option2',
          options: [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
            { value: 'option3', label: 'Option 3' }
          ]
        }
      ];
      
      const settingsSection = new SettingsSection({ settings });
      
      const fieldset = settingsSection.sectionElement.querySelector('fieldset');
      expect(fieldset).not.toBeNull();
      
      const radioButtons = settingsSection.sectionElement.querySelectorAll('input[type="radio"]');
      expect(radioButtons.length).toBe(3);
      
      // Check that the correct option is selected
      const selectedRadio = settingsSection.sectionElement.querySelector('input[value="option2"]');
      expect(selectedRadio.checked).toBe(true);
    });
    
    test('should create text input', () => {
      const settings = [
        { 
          id: 'text1', 
          type: 'text', 
          label: 'Text Setting', 
          value: 'Hello World',
          placeholder: 'Enter text'
        }
      ];
      
      const settingsSection = new SettingsSection({ settings });
      
      const input = settingsSection.sectionElement.querySelector('#setting-text1');
      expect(input).not.toBeNull();
      expect(input.type).toBe('text');
      expect(input.value).toBe('Hello World');
      expect(input.placeholder).toBe('Enter text');
    });
    
    test('should create slider', () => {
      const settings = [
        { 
          id: 'slider1', 
          type: 'slider', 
          label: 'Slider Setting', 
          value: 50,
          min: 0,
          max: 100,
          step: 5
        }
      ];
      
      const settingsSection = new SettingsSection({ settings });
      
      const slider = settingsSection.sectionElement.querySelector('#setting-slider1');
      expect(slider).not.toBeNull();
      expect(slider.type).toBe('range');
      expect(slider.value).toBe('50');
      expect(slider.min).toBe('0');
      expect(slider.max).toBe('100');
      expect(slider.step).toBe('5');
      
      const valueDisplay = settingsSection.sectionElement.querySelector('.sliderValue');
      expect(valueDisplay.textContent).toBe('50');
    });
    
    test('should create button', () => {
      const mockHandler = jest.fn();
      const settings = [
        { 
          id: 'button1', 
          type: 'button', 
          label: 'Click Me', 
          variant: 'primary',
          onClick: mockHandler
        }
      ];
      
      const settingsSection = new SettingsSection({ settings });
      
      const button = settingsSection.sectionElement.querySelector('#setting-button1');
      expect(button).not.toBeNull();
      expect(button.tagName).toBe('BUTTON');
      expect(button.textContent).toBe('Click Me');
      
      // Test click handler
      button.click();
      expect(mockHandler).toHaveBeenCalled();
    });
  });
  
  describe('Event Handling', () => {
    test('should call onSettingChange when setting is changed', () => {
      const mockHandler = jest.fn();
      const settings = [
        { id: 'toggle1', type: 'toggle', label: 'Toggle Setting' }
      ];
      
      const settingsSection = new SettingsSection({ 
        settings,
        onSettingChange: mockHandler
      });
      
      const toggle = settingsSection.sectionElement.querySelector('#setting-toggle1');
      toggle.checked = true;
      toggle.dispatchEvent(new Event('change'));
      
      expect(mockHandler).toHaveBeenCalledWith('toggle1', true, expect.any(Event));
    });
    
    test('should dispatch custom event when setting is changed', () => {
      const settings = [
        { id: 'toggle1', type: 'toggle', label: 'Toggle Setting' }
      ];
      
      const settingsSection = new SettingsSection({ settings });
      
      // Set up event listener
      const mockDocumentListener = jest.fn();
      document.addEventListener('setting-change', mockDocumentListener);
      
      const mockSectionListener = jest.fn();
      settingsSection.sectionElement.addEventListener('setting-change', mockSectionListener);
      
      // Trigger change
      const toggle = settingsSection.sectionElement.querySelector('#setting-toggle1');
      toggle.checked = true;
      toggle.dispatchEvent(new Event('change'));
      
      // Check that both listeners were called
      expect(mockDocumentListener).toHaveBeenCalled();
      expect(mockSectionListener).toHaveBeenCalled();
      
      // Check event details
      const eventDetail = mockSectionListener.mock.calls[0][0].detail;
      expect(eventDetail.settingId).toBe('toggle1');
      expect(eventDetail.value).toBe(true);
      expect(eventDetail.section).toBe(settingsSection);
    });
  });
  
  describe('Public Methods', () => {
    test('updateSetting should update setting value', () => {
      const settings = [
        { id: 'toggle1', type: 'toggle', label: 'Toggle' },
        { id: 'select1', type: 'select', label: 'Select', options: [
          { value: 'option1', label: 'Option 1' },
          { value: 'option2', label: 'Option 2' }
        ]},
        { id: 'slider1', type: 'slider', label: 'Slider', min: 0, max: 100 }
      ];
      
      const settingsSection = new SettingsSection({ settings });
      
      // Update toggle
      settingsSection.updateSetting('toggle1', true);
      expect(settingsSection.sectionElement.querySelector('#setting-toggle1').checked).toBe(true);
      
      // Update select
      settingsSection.updateSetting('select1', 'option2');
      expect(settingsSection.sectionElement.querySelector('#setting-select1').value).toBe('option2');
      
      // Update slider
      settingsSection.updateSetting('slider1', 75);
      expect(settingsSection.sectionElement.querySelector('#setting-slider1').value).toBe('75');
      expect(settingsSection.sectionElement.querySelector('.sliderValue').textContent).toBe('75');
    });
    
    test('setSettingDisabled should update setting disabled state', () => {
      const settings = [
        { id: 'toggle1', type: 'toggle', label: 'Toggle' },
        { id: 'radio1', type: 'radio', label: 'Radio', options: [
          { value: 'option1', label: 'Option 1' },
          { value: 'option2', label: 'Option 2' }
        ]}
      ];
      
      const settingsSection = new SettingsSection({ settings });
      
      // Disable toggle
      settingsSection.setSettingDisabled('toggle1', true);
      expect(settingsSection.sectionElement.querySelector('#setting-toggle1').disabled).toBe(true);
      
      // Disable radio group
      settingsSection.setSettingDisabled('radio1', true);
      const radioInputs = settingsSection.sectionElement.querySelectorAll('input[name="setting-radio1"]');
      radioInputs.forEach(input => {
        expect(input.disabled).toBe(true);
      });
    });
    
    test('addSetting should add a new setting to the section', () => {
      const settingsSection = new SettingsSection();
      
      settingsSection.addSetting({
        id: 'newToggle',
        type: 'toggle',
        label: 'New Toggle'
      });
      
      expect(settingsSection.options.settings.length).toBe(1);
      const toggleElement = settingsSection.sectionElement.querySelector('[data-setting-id="newToggle"]');
      expect(toggleElement).not.toBeNull();
    });
    
    test('removeSetting should remove a setting from the section', () => {
      const settings = [
        { id: 'toggle1', type: 'toggle', label: 'Toggle 1' },
        { id: 'toggle2', type: 'toggle', label: 'Toggle 2' }
      ];
      
      const settingsSection = new SettingsSection({ settings });
      
      // Initially both settings should exist
      expect(settingsSection.options.settings.length).toBe(2);
      expect(settingsSection.sectionElement.querySelector('[data-setting-id="toggle1"]')).not.toBeNull();
      expect(settingsSection.sectionElement.querySelector('[data-setting-id="toggle2"]')).not.toBeNull();
      
      // Remove first setting
      settingsSection.removeSetting('toggle1');
      
      // Now there should be only one setting
      expect(settingsSection.options.settings.length).toBe(1);
      expect(settingsSection.sectionElement.querySelector('[data-setting-id="toggle1"]')).toBeNull();
      expect(settingsSection.sectionElement.querySelector('[data-setting-id="toggle2"]')).not.toBeNull();
    });
    
    test('getValues should return current setting values', () => {
      const settings = [
        { id: 'toggle1', type: 'toggle', value: true },
        { id: 'select1', type: 'select', value: 'option2', options: [
          { value: 'option1', label: 'Option 1' },
          { value: 'option2', label: 'Option 2' }
        ]},
        { id: 'slider1', type: 'slider', value: 50 }
      ];
      
      const settingsSection = new SettingsSection({ settings });
      
      const values = settingsSection.getValues();
      
      expect(values).toEqual({
        toggle1: true,
        select1: 'option2',
        slider1: 50
      });
    });
    
    test('setValues should update multiple settings at once', () => {
      const settings = [
        { id: 'toggle1', type: 'toggle' },
        { id: 'select1', type: 'select', options: [
          { value: 'option1', label: 'Option 1' },
          { value: 'option2', label: 'Option 2' }
        ]},
        { id: 'slider1', type: 'slider', min: 0, max: 100 }
      ];
      
      const settingsSection = new SettingsSection({ settings });
      
      settingsSection.setValues({
        toggle1: true,
        select1: 'option2',
        slider1: 75
      });
      
      expect(settingsSection.sectionElement.querySelector('#setting-toggle1').checked).toBe(true);
      expect(settingsSection.sectionElement.querySelector('#setting-select1').value).toBe('option2');
      expect(settingsSection.sectionElement.querySelector('#setting-slider1').value).toBe('75');
    });
    
    test('resetToDefaults should reset settings to default values', () => {
      const settings = [
        { id: 'toggle1', type: 'toggle', value: true, defaultValue: false },
        { id: 'select1', type: 'select', value: 'option2', defaultValue: 'option1', options: [
          { value: 'option1', label: 'Option 1' },
          { value: 'option2', label: 'Option 2' }
        ]}
      ];
      
      const settingsSection = new SettingsSection({ settings });
      
      // Initially values should match the configured values
      expect(settingsSection.sectionElement.querySelector('#setting-toggle1').checked).toBe(true);
      expect(settingsSection.sectionElement.querySelector('#setting-select1').value).toBe('option2');
      
      // Reset to defaults
      settingsSection.resetToDefaults();
      
      // Now values should match default values
      expect(settingsSection.sectionElement.querySelector('#setting-toggle1').checked).toBe(false);
      expect(settingsSection.sectionElement.querySelector('#setting-select1').value).toBe('option1');
    });
    
    test('destroy should remove section from DOM and reset state', () => {
      const settingsSection = new SettingsSection();
      const sectionElement = settingsSection.sectionElement;
      
      expect(document.body.contains(sectionElement)).toBe(true);
      expect(settingsSection.initialized).toBe(true);
      
      settingsSection.destroy();
      
      expect(document.body.contains(sectionElement)).toBe(false);
      expect(settingsSection.initialized).toBe(false);
      expect(settingsSection.sectionElement).toBeNull();
      expect(settingsSection.settingElements.size).toBe(0);
    });
  });
}); 