/**
 * i18n (Internationalization) Type Definitions
 */

/**
 * Information about a specific locale/language
 */
export interface LocaleInfo {
  /**
   * Locale code (e.g., 'en-US', 'fr', 'ar')
   */
  code: string;
  
  /**
   * English name of the language (e.g., 'English', 'French', 'Arabic')
   */
  name: string;
  
  /**
   * Native name of the language (e.g., 'English', 'Français', 'العربية')
   */
  nativeName: string;
  
  /**
   * Text direction for this locale ('ltr' or 'rtl')
   */
  direction: 'ltr' | 'rtl';
  
  /**
   * Optional - Whether this locale is the default
   */
  isDefault?: boolean;
}

/**
 * Translation function type
 */
export type TranslationFunction = (key: string, params?: Record<string, string>) => string;

/**
 * i18n Manager Interface
 */
export interface I18nManager {
  /**
   * Get the current locale code
   */
  getCurrentLocale(): string;
  
  /**
   * Get list of supported locales
   */
  getSupportedLocales(): LocaleInfo[];
  
  /**
   * Get text direction for current locale
   */
  getDirection(): 'ltr' | 'rtl';
  
  /**
   * Change the active locale
   * @param localeCode The locale to switch to
   * @returns Promise that resolves to true if successful
   */
  setLocale(localeCode: string): Promise<boolean>;
  
  /**
   * Translate a key
   * @param key Translation key
   * @param params Optional parameters for interpolation
   */
  t: TranslationFunction;
}

/**
 * Configuration for i18n initialization
 */
export interface I18nConfig {
  /**
   * Default locale to use
   */
  defaultLocale: string;
  
  /**
   * Path to locale files
   */
  localesPath: string;
  
  /**
   * List of supported locales
   */
  supportedLocales: LocaleInfo[];
  
  /**
   * Whether to detect browser language
   */
  detectBrowserLanguage?: boolean;
  
  /**
   * Whether to persist language choice
   */
  persistLanguage?: boolean;
  
  /**
   * Storage key for persisted language
   */
  languageStorageKey?: string;
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