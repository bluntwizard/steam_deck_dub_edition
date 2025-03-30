/**
 * Type definitions for the i18n system
 */

/**
 * Represents a supported locale in the application
 */
export interface LocaleInfo {
  /**
   * ISO language code (e.g., 'en', 'es', 'ar')
   */
  code: string;
  
  /**
   * English name of the language
   */
  name: string;
  
  /**
   * Native name of the language (in its own script)
   */
  nativeName: string;
  
  /**
   * Text direction: 'ltr' (left-to-right) or 'rtl' (right-to-left)
   */
  direction: 'ltr' | 'rtl';
}

/**
 * Optional replacements for translation variables
 */
export interface TranslationReplacements {
  [key: string]: string | number;
}

/**
 * Date formatting options
 */
export interface DateFormatOptions {
  /**
   * Date format style
   */
  dateStyle?: 'full' | 'long' | 'medium' | 'short';
  
  /**
   * Time format style
   */
  timeStyle?: 'full' | 'long' | 'medium' | 'short';
  
  /**
   * Whether to use 24-hour time format
   */
  hour12?: boolean;
  
  /**
   * Additional Intl.DateTimeFormat options
   */
  [key: string]: any;
}

/**
 * Number formatting options
 */
export interface NumberFormatOptions {
  /**
   * Style of number formatting
   */
  style?: 'decimal' | 'currency' | 'percent' | 'unit';
  
  /**
   * Currency code when style is 'currency'
   */
  currency?: string;
  
  /**
   * Minimum number of fraction digits
   */
  minimumFractionDigits?: number;
  
  /**
   * Maximum number of fraction digits
   */
  maximumFractionDigits?: number;
  
  /**
   * Additional Intl.NumberFormat options
   */
  [key: string]: any;
}

/**
 * Base translations interface
 */
interface BaseTranslations {
  [key: string]: string | BaseTranslations;
}

/**
 * Represents a translations object where keys are nested strings
 */
export type Translations = {
  [key: string]: string | Translations;
} & {
  direction?: 'ltr' | 'rtl';
};

/**
 * I18n interface describing the internationalization API
 */
export interface I18nInterface {
  /**
   * Get all supported locales
   */
  getSupportedLocales(): LocaleInfo[];
  
  /**
   * Initialize i18n with the user's preferred locale
   */
  initializeI18n(): Promise<Translations>;
  
  /**
   * Load translations for a specific locale
   */
  loadTranslations(locale: string): Promise<void>;
  
  /**
   * Set the active locale and load its translations
   */
  setLocale(locale: string): Promise<boolean>;
  
  /**
   * Get current text direction (rtl or ltr)
   */
  getDirection(): 'ltr' | 'rtl';
  
  /**
   * Check if current locale is RTL
   */
  isRTL(): boolean;
  
  /**
   * Get current locale code
   */
  getCurrentLocale(): string;
  
  /**
   * Get current locale information
   */
  getCurrentLocaleInfo(): LocaleInfo;
  
  /**
   * Get a translated string by key
   */
  t(key: string, replacements?: TranslationReplacements): string;
  
  /**
   * Format a date according to the current locale
   */
  formatDate(date: Date | number | string, options?: DateFormatOptions): string;
  
  /**
   * Format a number according to the current locale
   */
  formatNumber(number: number, options?: NumberFormatOptions): string;
} 