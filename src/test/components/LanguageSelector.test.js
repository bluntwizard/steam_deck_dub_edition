/**
 * Test suite for LanguageSelector component
 */

import { I18nManager } from '../../i18n';

// Mock I18nManager
jest.mock('../../i18n', () => {
  return {
    I18nManager: jest.fn().mockImplementation(() => {
      return {
        t: jest.fn(key => key),
        getCurrentLocale: jest.fn(() => 'en'),
        getSupportedLocales: jest.fn(() => ['en', 'es', 'ar', 'he']),
        getLocaleInfo: jest.fn(locale => {
          const localeInfo = {
            en: { name: 'English', direction: 'ltr' },
            es: { name: 'Español', direction: 'ltr' },
            ar: { name: 'العربية', direction: 'rtl' },
            he: { name: 'עברית', direction: 'rtl' }
          };
          return localeInfo[locale] || { name: locale, direction: 'ltr' };
        }),
        setLocale: jest.fn(),
        on: jest.fn(),
        off: jest.fn()
      };
    })
  };
});

describe('LanguageSelector', () => {
  let LanguageSelector;
  let instance;
  let container;
  
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = '';
    container = document.createElement('div');
    document.body.appendChild(container);
    
    // Clear module cache to ensure fresh instances
    jest.resetModules();
    
    // Import component
    LanguageSelector = require('../../components/LanguageSelector').default;
    
    // Create instance
    instance = new LanguageSelector({
      container: container,
      i18n: new I18nManager()
    });
  });
  
  afterEach(() => {
    // Clean up
    if (instance && typeof instance.destroy === 'function') {
      instance.destroy();
    }
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  test('should initialize properly', () => {
    expect(instance).toBeDefined();
    expect(instance.i18n).toBeDefined();
    expect(instance.container).toBe(container);
  });
  
  test('should render language selector dropdown', () => {
    instance.render();
    
    const selectorElement = container.querySelector('.language-selector');
    expect(selectorElement).not.toBeNull();
    
    const selectElement = selectorElement.querySelector('select');
    expect(selectElement).not.toBeNull();
    expect(selectElement.options.length).toBe(4); // en, es, ar, he
  });
  
  test('should set current locale as selected value', () => {
    instance.i18n.getCurrentLocale.mockReturnValue('es');
    instance.render();
    
    const selectElement = container.querySelector('.language-selector select');
    expect(selectElement.value).toBe('es');
  });
  
  test('should change locale when selection changes', () => {
    instance.render();
    
    const selectElement = container.querySelector('.language-selector select');
    selectElement.value = 'ar';
    
    // Simulate change event
    const event = new Event('change');
    selectElement.dispatchEvent(event);
    
    expect(instance.i18n.setLocale).toHaveBeenCalledWith('ar');
  });
  
  test('should update selection when locale changes externally', () => {
    instance.render();
    
    // Capture the event handler
    const localeChangeHandler = instance.i18n.on.mock.calls.find(call => call[0] === 'localeChanged')[1];
    expect(localeChangeHandler).toBeDefined();
    
    // Simulate locale change event
    instance.i18n.getCurrentLocale.mockReturnValue('he');
    localeChangeHandler('he');
    
    const selectElement = container.querySelector('.language-selector select');
    expect(selectElement.value).toBe('he');
  });
  
  test('should clean up event listeners on destroy', () => {
    instance.render();
    instance.destroy();
    
    expect(instance.i18n.off).toHaveBeenCalled();
    expect(instance.container.querySelector('.language-selector')).toBeNull();
  });
}); 