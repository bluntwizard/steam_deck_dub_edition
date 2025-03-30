import React, { useState, useEffect } from 'react';
import i18n from '../i18n';
import '../assets/css/language-selector.css';

/**
 * LanguageSelector component allows users to switch between available languages
 * Supports RTL languages and displays native language names
 */
const LanguageSelector = ({ variant = 'dropdown' }) => {
  const [currentLocale, setCurrentLocale] = useState(i18n.getCurrentLocale());
  const [isOpen, setIsOpen] = useState(false);
  const locales = i18n.getSupportedLocales();
  
  // Update state when locale changes externally
  useEffect(() => {
    const handleLocaleChange = (event) => {
      setCurrentLocale(event.detail.locale);
    };
    
    document.addEventListener('locale-changed', handleLocaleChange);
    
    return () => {
      document.removeEventListener('locale-changed', handleLocaleChange);
    };
  }, []);
  
  // Handle language selection
  const handleSelectLanguage = async (localeCode) => {
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
  const getCurrentLocaleInfo = () => {
    return locales.find(locale => locale.code === currentLocale) || locales[0];
  };
  
  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  
  // Format locale for display
  const formatLocaleDisplay = (locale) => {
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