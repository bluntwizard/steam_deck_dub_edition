/**
 * TypeScript definition for the i18n module
 */

declare module '../i18n.js' {
  /**
   * Internationalization module for Steam Deck DUB Edition
   */
  interface I18n {
    /**
     * Translate a key to the current language
     * @param key - The translation key
     * @param params - Optional parameters for interpolation
     */
    t(key: string, params?: Record<string, string>): string;
    
    /**
     * Get the current language code
     */
    getCurrentLanguage(): string;
    
    /**
     * Change the current language
     * @param langCode - The language code to change to
     */
    changeLanguage(langCode: string): Promise<void>;
    
    /**
     * Translate page content based on data-i18n attributes
     */
    translatePageContent(): void;
  }

  const i18n: I18n;
  export default i18n;
} 