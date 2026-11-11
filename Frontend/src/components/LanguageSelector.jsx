import { useI18n } from '../i18n/I18nContext';

export function LanguageSelector() {
  const { lang, setLang, languages, t } = useI18n();

  return (
    <select
      value={lang}
      onChange={(e) => setLang(e.target.value)}
      aria-label={t('language.label')}
      title={t('language.label')}
      style={{
        height: 28,
        padding: '0 8px',
        borderRadius: 999,
        border: '1px solid var(--input-border, #a4b8cc)',
        background: 'var(--input-bg, #fff)',
        color: 'var(--text-main, #1e2a38)',
        fontFamily: 'Tahoma, Verdana, Arial, sans-serif',
        fontSize: 11,
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,.5), 0 1px 2px rgba(0,0,0,.15)',
        flexShrink: 0,
        maxWidth: 140,
      }}
    >
      {languages.map((l) => (
        <option key={l.code} value={l.code}>
          {l.flag} {l.nativeName}
        </option>
      ))}
    </select>
  );
}