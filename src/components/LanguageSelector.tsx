import React, { useState, useEffect } from 'react';
import i18n from '../i18n';
import '../assets/css/language-selector.css';
import { LocaleInfo } from '../types/i18n';

/**
 * Props for the LanguageSelector component
 */
interface LanguageSelectorProps {
  /**
   * Variant of the language selector UI
   */
  variant?: 'dropdown' | 'buttons' | 'select';
}

/**
 * LanguageSelector component allows users to switch between available languages
 * Supports RTL languages and displays native language names
 */
const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  variant = 'dropdown' 
}) => {
  const [currentLocale, setCurrentLocale] = useState<string>(i18n.getCurrentLocale());
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const locales: LocaleInfo[] = i18n.getSupportedLocales();
  
  // Update state when locale changes externally
  useEffect(() => {
    const handleLocaleChange = (event: CustomEvent<{ locale: string; direction: 'ltr' | 'rtl' }>) => {
      setCurrentLocale(event.detail.locale);
    };
    
    document.addEventListener('locale-changed', handleLocaleChange as EventListener);
    
    return () => {
      document.removeEventListener('locale-changed', handleLocaleChange as EventListener);
    };
  }, []);
  
  // Handle language selection
  const handleSelectLanguage = async (localeCode: string): Promise<void> => {
    if (localeCode === currentLocale) {
      setIsOpen(false);
      return;
    }
    
    const success = await i18n.setLocale(localeCode);
    
    if (success) {
      setCurrentLocale(localeCode);
      // Set document direction attribute based on the selected locale's direction
      const direction = i18n.getDirection();
      document.documentElement.setAttribute('dir', direction);
    }
    
    setIsOpen(false);
  };
  
  // Get current locale information
  const getCurrentLocaleInfo = (): LocaleInfo => {
    return locales.find(locale => locale.code === currentLocale) || locales[0];
  };
  
  // Toggle dropdown
  const toggleDropdown = (): void => {
    setIsOpen(!isOpen);
  };
  
  // Format locale for display
  const formatLocaleDisplay = (locale: LocaleInfo): React.ReactNode => {
    return (
      <div className="locale-option">
        <span className="locale-native-name">{locale.nativeName}</span>
        {locale.code !== locale.name && (
          <span className="locale-english-name">({locale.name})</span>
        )}
        <span className={`locale-direction ${locale.direction}`}>
          {locale.direction === 'rtl' ? 'RTL' : 'LTR'}
        </span>
      </div>
    );
  };
  
  // Render as buttons
  if (variant === 'buttons') {
    return (
      <div className="language-selector buttons-variant">
        {locales.map(locale => (
          <button
            key={locale.code}
            className={`language-button ${locale.code === currentLocale ? 'active' : ''}`}
            onClick={() => handleSelectLanguage(locale.code)}
            title={`${locale.name} (${locale.direction.toUpperCase()})`}
          >
            <span className="locale-code">{locale.code.toUpperCase()}</span>
          </button>
        ))}
      </div>
    );
  }
  
  // Render as select element for small screens
  if (variant === 'select') {
    return (
      <div className="language-selector select-variant">
        <select 
          value={currentLocale}
          onChange={(e) => handleSelectLanguage(e.target.value)}
          aria-label={i18n.t('settings.language')}
        >
          {locales.map(locale => (
            <option key={locale.code} value={locale.code}>
              {locale.nativeName} ({locale.name})
            </option>
          ))}
        </select>
      </div>
    );
  }
  
  // Default: render as dropdown
  return (
    <div className={`language-selector dropdown-variant ${isOpen ? 'open' : ''}`}>
      <button 
        className="language-dropdown-toggle"
        onClick={toggleDropdown}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="current-language">
          {formatLocaleDisplay(getCurrentLocaleInfo())}
        </span>
        <span className="dropdown-arrow"></span>
      </button>
      
      {isOpen && (
        <ul className="language-dropdown-menu">
          {locales.map(locale => (
            <li key={locale.code}>
              <button
                className={`language-option ${locale.code === currentLocale ? 'active' : ''}`}
                onClick={() => handleSelectLanguage(locale.code)}
              >
                {formatLocaleDisplay(locale)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LanguageSelector; 