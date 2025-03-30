/**
 * Enhanced Internationalization (i18n) support for Steam Deck DUB Edition
 * Includes RTL language support and improved language management
 */

import {
  LocaleInfo,
  TranslationReplacements,
  DateFormatOptions,
  NumberFormatOptions,
  Translations,
  I18nInterface
} from './types/i18n';

class I18n implements I18nInterface {
  private translations: Record<string, Translations>;
  private currentLocale: string;
  private fallbackLocale: string;
  private initialized: boolean;
  private supportedLocales: LocaleInfo[];

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
    // Bind methods to ensure correct this context
    this.getSupportedLocales = this.getSupportedLocales.bind(this);
  }

  /**
   * Get all supported locales
   * @returns Array of supported locale objects
   */
  getSupportedLocales(): LocaleInfo[] {
    return this.supportedLocales;
  }

  /**
   * Initialize i18n with the user's preferred locale
   * @returns Promise resolving to the loaded translations
   */
  async initializeI18n(): Promise<Translations> {
    if (this.initialized) return this.translations[this.currentLocale];
    
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
    
    return this.translations[this.currentLocale];
  }

  /**
   * Load translations for a specific locale
   * @param locale - The locale code to load (e.g., 'en')
   */
  async loadTranslations(locale: string): Promise<void> {
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
   * @param locale - The locale code to apply
   * @private
   */
  private applyLocaleToDocument(locale: string): void {
    // Set document language
    document.documentElement.setAttribute('lang', locale);
    
    // Get locale information
    const localeInfo = this.supportedLocales.find(l => l.code === locale) || 
                       { code: locale, name: locale, nativeName: locale, direction: 'ltr' as const };
                       
    // Get direction from translations if available, fallback to locale info
    const direction = this.translations[locale]?.direction || localeInfo.direction;
    
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
   * @param locale - The locale code to set (e.g., 'en')
   * @returns Success status
   */
  async setLocale(locale: string): Promise<boolean> {
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
   * @returns 'rtl' or 'ltr'
   */
  getDirection(): 'ltr' | 'rtl' {
    const direction = this.translations[this.currentLocale]?.direction;
    return direction === 'rtl' ? 'rtl' : 'ltr';
  }

  /**
   * Check if current locale is RTL
   * @returns True if the current locale is RTL
   */
  isRTL(): boolean {
    return this.getDirection() === 'rtl';
  }

  /**
   * Get current locale code
   * @returns The current locale code
   */
  getCurrentLocale(): string {
    return this.currentLocale;
  }

  /**
   * Get current locale information
   * @returns Object with locale information
   */
  getCurrentLocaleInfo(): LocaleInfo {
    return this.supportedLocales.find(l => l.code === this.currentLocale) || 
           { code: this.currentLocale, name: this.currentLocale, nativeName: this.currentLocale, direction: this.getDirection() as 'ltr' | 'rtl' };
  }

  /**
   * Get a translated string by key
   * @param key - The translation key
   * @param replacements - Key-value pairs for variable replacements
   * @returns The translated string
   */
  t(key: string, replacements: TranslationReplacements = {}): string {
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
   * @param obj - Object to search in
   * @param path - Path to the value, using dot notation
   * @returns The value found, or the path itself if not found
   * @private
   */
  private _getNestedValue(obj: Translations, path: string): string {
    // Split path by dots
    const keys = path.split('.');
    let current: any = obj;
    
    // Traverse the object
    for (const key of keys) {
      if (current === undefined || current === null || typeof current !== 'object') {
        return path;
      }
      
      current = current[key];
    }
    
    // If resulting value is not a string, return the path
    if (typeof current !== 'string') {
      return path;
    }
    
    return current;
  }

  /**
   * Replace variables in a string with their values
   * @param str - String with variables
   * @param replacements - Object with variable values
   * @returns String with replaced variables
   * @private
   */
  private _replaceVariables(str: string, replacements: TranslationReplacements): string {
    return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return replacements[key] !== undefined ? String(replacements[key]) : match;
    });
  }

  /**
   * Format a date according to the current locale
   * @param date - Date to format
   * @param options - Formatting options
   * @returns Formatted date string
   */
  formatDate(date: Date | number | string, options: DateFormatOptions = {}): string {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : 
                     typeof date === 'number' ? new Date(date) : date;
      
      // Create formatter with current locale
      const formatter = new Intl.DateTimeFormat(this.currentLocale, options);
      
      return formatter.format(dateObj);
    } catch (error) {
      console.error('Error formatting date:', error);
      return String(date);
    }
  }

  /**
   * Format a number according to the current locale
   * @param number - Number to format
   * @param options - Formatting options
   * @returns Formatted number string
   */
  formatNumber(number: number, options: NumberFormatOptions = {}): string {
    try {
      // Create formatter with current locale
      const formatter = new Intl.NumberFormat(this.currentLocale, options);
      
      return formatter.format(number);
    } catch (error) {
      console.error('Error formatting number:', error);
      return String(number);
    }
  }
}

// Create and export the i18n instance
const i18n = new I18n();
export default i18n; 