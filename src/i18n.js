/**
 * Internationalization (i18n) support for Steam Deck DUB Edition
 */

class I18n {
  constructor() {
    this.translations = {};
    this.currentLocale = 'en';
    this.fallbackLocale = 'en';
    this.initialized = false;
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
        this.currentLocale = browserLocale.split('-')[0]; // Use primary language code
        // Save detected locale
        localStorage.setItem('locale', this.currentLocale);
      }

      // Load translations for current locale
      await this.loadTranslations(this.currentLocale);
      
      // Add locale class to body for CSS styling
      document.documentElement.setAttribute('lang', this.currentLocale);
      document.body.classList.add(`locale-${this.currentLocale}`);
      
      console.info(`I18n initialized with locale: ${this.currentLocale}`);
      
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing i18n:', error);
      // Fallback to English if there's an error
      this.currentLocale = 'en';
      await this.loadTranslations(this.currentLocale);
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
      // Fetch translations from file
      const response = await fetch(`/locales/${locale}.json`);
      
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
   * Set the active locale and load its translations
   * @param {string} locale - The locale code to set (e.g., 'en')
   * @returns {Promise<boolean>} Success status
   */
  async setLocale(locale) {
    try {
      // Load translations if not already loaded
      if (!this.translations[locale]) {
        await this.loadTranslations(locale);
      }
      
      // Update current locale
      this.currentLocale = locale;
      
      // Save user preference to localStorage
      localStorage.setItem('locale', locale);
      
      // Update lang attribute and body class
      document.documentElement.setAttribute('lang', locale);
      
      document.body.classList.forEach(className => {
        if (className.startsWith('locale-')) {
          document.body.classList.remove(className);
        }
      });
      document.body.classList.add(`locale-${locale}`);
      
      // Trigger a UI update event
      document.dispatchEvent(new CustomEvent('locale-changed', { 
        detail: { locale } 
      }));
      
      return true;
    } catch (error) {
      console.error(`Error setting locale to ${locale}:`, error);
      return false;
    }
  }

  /**
   * Get current locale code
   * @returns {string} The current locale code
   */
  getCurrentLocale() {
    return this.currentLocale;
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
}

// Create singleton instance
const i18n = new I18n();

// Export the instance
export default i18n;
