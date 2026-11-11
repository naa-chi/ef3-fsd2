import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { translations, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from './translations';

const I18nContext = createContext(null);

function detectLanguage() {
  try {
    const stored = localStorage.getItem('dinobox_lang');
    if (stored && translations[stored]) return stored;
  } catch { /* localStorage unavailable */ }

  const nav = (typeof navigator !== 'undefined' && navigator.language
    ? navigator.language
    : DEFAULT_LANGUAGE).split('-')[0].toLowerCase();

  if (translations[nav]) return nav;
  return DEFAULT_LANGUAGE;
}

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(detectLanguage);

  useEffect(() => {
    try { localStorage.setItem('dinobox_lang', lang); } catch { /* ignore */ }
    document.documentElement.setAttribute('lang', lang);

    const meta = SUPPORTED_LANGUAGES.find(l => l.code === lang);
    document.documentElement.setAttribute('dir', meta?.rtl ? 'rtl' : 'ltr');
  }, [lang]);

  const t = useMemo(() => {
    return (key, fallback) => {
      return (
        translations[lang]?.[key] ??
        translations[DEFAULT_LANGUAGE]?.[key] ??
        fallback ??
        key
      );
    };
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t, languages: SUPPORTED_LANGUAGES }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
};