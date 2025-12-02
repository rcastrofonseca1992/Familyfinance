import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getLanguage, setLanguage as setLangStorage, t as translateFn } from '../utils/i18n';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState(getLanguage());

  useEffect(() => {
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  const setLanguage = (lang: string) => {
    setLangStorage(lang);
    setLanguageState(lang);
  };

  // Provide a reactive translation function that uses current language from context
  // Use useCallback to ensure it updates when language changes
  const t = useCallback((key: string, params?: Record<string, string>) => {
    return translateFn(key, params, language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};