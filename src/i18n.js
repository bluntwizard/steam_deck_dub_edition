/**
 * Enhanced Internationalization (i18n) support for Grimoire
 * Includes RTL language support and improved language management
 */

class I18n {
  constructor() {
    this.translations = {};
    this.currentLocale = 'en';
    this.fallbackLocale = 'en';
    this.initialized = false;
    this.supportedLocales = [
      { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr' },
      { code: 'es', name: 'Spanish', nativeName: 'Español', direction: 'ltr' },
      { code: 'ar', name: 'Arabic', nativeName: 'العربية', direction: 'rtl' },
      { code: 'he', name: 'Hebrew', nativeName: 'עברית', direction: 'rtl' }
    ];
    // Expose supported locales publicly
    this.getSupportedLocales = this.getSupportedLocales.bind(this);
  }

  /**
   * Get all supported locales
   * @returns {Array} Array of supported locale objects
   */
  getSupportedLocales() {
    return this.supportedLocales;
  }

  /**
   * Initialize i18n with the user's preferred locale
   * @returns {Promise<void>}
   */
  async initializeI18n() {
    if (this.initialized) return;
    
    try {
      // Get saved locale from localStorage
      const savedLocale = localStorage.getItem('locale');
      if (savedLocale) {
        this.currentLocale = savedLocale;
      } else {
        // Detect browser locale
        const browserLocale = navigator.language || 'en';
        const primaryLanguage = browserLocale.split('-')[0]; // Use primary language code
        
        // Check if the detected locale is supported
        const isSupported = this.supportedLocales.some(locale => locale.code === primaryLanguage);
        this.currentLocale = isSupported ? primaryLanguage : this.fallbackLocale;
        
        // Save detected locale
        localStorage.setItem('locale', this.currentLocale);
      }

      // Load translations for current locale
      await this.loadTranslations(this.currentLocale);
      
      // Apply locale to document
      this.applyLocaleToDocument(this.currentLocale);
      
      console.info(`I18n initialized with locale: ${this.currentLocale}`);
      
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing i18n:', error);
      // Fallback to English if there's an error
      this.currentLocale = this.fallbackLocale;
      await this.loadTranslations(this.currentLocale);
      this.applyLocaleToDocument(this.currentLocale);
    }
    
    return this.translations;
  }

  /**
   * Load translations for a specific locale
   * @param {string} locale - The locale code to load (e.g., 'en')
   * @returns {Promise<void>}
   */
  async loadTranslations(locale) {
    try {
      // Check if translations are already loaded
      if (this.translations[locale]) {
        return;
      }
      
      // Fetch translations from file
      const response = await fetch(`/src/locales/${locale}.json`);
      
      if (!response.ok) {
        throw new Error(`Failed to load translations for ${locale}`);
      }
      
      const translations = await response.json();
      this.translations[locale] = translations;
      
    } catch (error) {
      console.error(`Error loading translations for ${locale}:`, error);
      
      // Use fallback locale if it's different from the current one
      if (locale !== this.fallbackLocale) {
        console.info(`Falling back to ${this.fallbackLocale} translations`);
        await this.loadTranslations(this.fallbackLocale);
      }
    }
  }

  /**
   * Apply locale settings to document (language, direction, classes)
   * @param {string} locale - The locale code to apply
   * @private
   */
  applyLocaleToDocument(locale) {
    // Set document language
    document.documentElement.setAttribute('lang', locale);
    
    // Get locale information
    const localeInfo = this.supportedLocales.find(l => l.code === locale) || 
                       { code: locale, direction: 'ltr' };
                       
    // Get direction from translations if available, fallback to locale info
    const direction = this.translations[locale]?.direction || localeInfo.direction || 'ltr';
    
    // Set document direction
    document.documentElement.setAttribute('dir', direction);
    
    // Update body classes
    document.body.classList.forEach(className => {
      if (className.startsWith('locale-') || className.startsWith('dir-')) {
        document.body.classList.remove(className);
      }
    });
    
    // Add locale and direction classes
    document.body.classList.add(`locale-${locale}`);
    document.body.classList.add(`dir-${direction}`);
    
    // Add RTL/LTR specific classes to help with CSS targeting
    if (direction === 'rtl') {
      document.body.classList.add('is-rtl');
      document.body.classList.remove('is-ltr');
    } else {
      document.body.classList.add('is-ltr');
      document.body.classList.remove('is-rtl');
    }
  }

  /**
   * Set the active locale and load its translations
   * @param {string} locale - The locale code to set (e.g., 'en')
   * @returns {Promise<boolean>} Success status
   */
  async setLocale(locale) {
    try {
      // Validate locale
      if (!this.supportedLocales.some(l => l.code === locale)) {
        console.warn(`Locale ${locale} is not supported, falling back to ${this.fallbackLocale}`);
        locale = this.fallbackLocale;
      }
      
      // Load translations if not already loaded
      if (!this.translations[locale]) {
        await this.loadTranslations(locale);
      }
      
      // Update current locale
      this.currentLocale = locale;
      
      // Save user preference to localStorage
      localStorage.setItem('locale', locale);
      
      // Apply locale settings to document
      this.applyLocaleToDocument(locale);
      
      // Trigger a UI update event
      document.dispatchEvent(new CustomEvent('locale-changed', { 
        detail: { 
          locale,
          direction: this.getDirection()
        } 
      }));
      
      return true;
    } catch (error) {
      console.error(`Error setting locale to ${locale}:`, error);
      return false;
    }
  }

  /**
   * Get current text direction (rtl or ltr)
   * @returns {string} 'rtl' or 'ltr'
   */
  getDirection() {
    return this.translations[this.currentLocale]?.direction || 'ltr';
  }

  /**
   * Check if current locale is RTL
   * @returns {boolean} True if the current locale is RTL
   */
  isRTL() {
    return this.getDirection() === 'rtl';
  }

  /**
   * Get current locale code
   * @returns {string} The current locale code
   */
  getCurrentLocale() {
    return this.currentLocale;
  }

  /**
   * Get current locale information
   * @returns {Object} Object with locale information
   */
  getCurrentLocaleInfo() {
    return this.supportedLocales.find(l => l.code === this.currentLocale) || 
           { code: this.currentLocale, name: this.currentLocale, direction: this.getDirection() };
  }

  /**
   * Get a translated string by key
   * @param {string} key - The translation key
   * @param {Object} [replacements={}] - Key-value pairs for variable replacements
   * @returns {string} The translated string
   */
  t(key, replacements = {}) {
    // Get translations for current locale
    const translations = this.translations[this.currentLocale] || {};
    
    // Get the translated string
    let translatedString = this._getNestedValue(translations, key);
    
    // If no translation found, try fallback locale
    if (translatedString === key && this.currentLocale !== this.fallbackLocale) {
      const fallbackTranslations = this.translations[this.fallbackLocale] || {};
      translatedString = this._getNestedValue(fallbackTranslations, key);
    }
    
    // If still no translation found, return the key
    if (translatedString === key) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    
    // Replace variables in the string
    return this._replaceVariables(translatedString, replacements);
  }

  /**
   * Get a nested value from an object using dot notation
   * @param {Object} obj - The object to get value from
   * @param {string} path - The path in dot notation (e.g., 'app.title')
   * @returns {string} The value or the path if not found
   * @private
   */
  _getNestedValue(obj, path) {
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
      if (result && typeof result === 'object' && key in result) {
        result = result[key];
      } else {
        return path; // Return original path if not found
      }
    }
    
    return result;
  }

  /**
   * Replace variables in a string with values
   * @param {string} str - The string with variables
   * @param {Object} replacements - Key-value pairs for replacements
   * @returns {string} The string with replaced variables
   * @private
   */
  _replaceVariables(str, replacements) {
    return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return replacements[key] !== undefined ? replacements[key] : match;
    });
  }

  /**
   * Format a date according to the current locale
   * @param {Date|string|number} date - The date to format
   * @param {Object} [options] - Intl.DateTimeFormat options
   * @returns {string} Formatted date string
   */
  formatDate(date, options = {}) {
    const dateObj = date instanceof Date ? date : new Date(date);
    const defaultOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    
    try {
      return new Intl.DateTimeFormat(
        this.currentLocale, 
        { ...defaultOptions, ...options }
      ).format(dateObj);
    } catch (error) {
      console.error('Error formatting date:', error);
      return String(date);
    }
  }

  /**
   * Format a number according to the current locale
   * @param {number} number - The number to format
   * @param {Object} [options] - Intl.NumberFormat options
   * @returns {string} Formatted number string
   */
  formatNumber(number, options = {}) {
    try {
      return new Intl.NumberFormat(
        this.currentLocale, 
        options
      ).format(number);
    } catch (error) {
      console.error('Error formatting number:', error);
      return String(number);
    }
  }
}

// Create singleton instance
const i18n = new I18n();

// Export the instance
export default i18n;
