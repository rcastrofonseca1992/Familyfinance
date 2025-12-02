import { en } from '../../translations/en';
import { pt } from '../../translations/pt';

type Translations = typeof en;

const languages: Record<string, Translations> = { en, pt };

export const AVAILABLE_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' }
];

/**
 * Get the current language from localStorage or default to Portuguese
 */
export function getLanguage(): string {
  if (typeof window === 'undefined') return 'pt';
  return localStorage.getItem('language') || 'pt'; // Default to Portuguese
}

export function setLanguage(lang: string): void {
  localStorage.setItem("language", lang); // Changed from 'lang' to 'language' for consistency
  document.documentElement.setAttribute("lang", lang);
}

/**
 * Translate a key to the current language
 * @param key - Translation key
 * @param params - Optional parameters to replace in the translation
 * @param lang - Optional language override (defaults to reading from localStorage)
 */
export function t(key: string, params?: Record<string, string>, lang?: string): string {
  const currentLang = lang || getLanguage();
  const translations = languages[currentLang] || languages['pt'];
  
  let value = translations[key as keyof Translations] || key;
  
  // Replace params like {{name}} with actual values
  if (params) {
    Object.keys(params).forEach(paramKey => {
      value = value.replace(`{{${paramKey}}}`, params[paramKey]);
    });
  }
  
  return value;
}