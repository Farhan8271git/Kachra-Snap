import { createContext, useContext, useEffect, useState } from 'react';
import { loadPrefs, savePrefs } from '../lib/storage';
import { getLanguage } from '../i18n/translations';

const PreferencesContext = createContext(null);

export function PreferencesProvider({ children }) {
  const [prefs, setPrefs] = useState(() => loadPrefs() || {});

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = (theme) => {
      root.classList.toggle('dark', theme === 'dark');
      root.style.colorScheme = theme;
    };

    if (prefs.theme === 'dark' || prefs.theme === 'light') {
      applyTheme(prefs.theme);
    } else {
      const colorScheme = window.matchMedia('(prefers-color-scheme: dark)');
      const applySystemTheme = () => applyTheme(colorScheme.matches ? 'dark' : 'light');
      applySystemTheme();
      colorScheme.addEventListener('change', applySystemTheme);

      const lang = getLanguage(prefs.language || 'en');
      root.setAttribute('dir', lang.dir);
      root.setAttribute('lang', lang.code);

      return () => colorScheme.removeEventListener('change', applySystemTheme);
    }

    const lang = getLanguage(prefs.language || 'en');
    root.setAttribute('dir', lang.dir);
    root.setAttribute('lang', lang.code);
  }, [prefs]);

  const updatePrefs = (next) => {
  const merged = { ...(prefs || {}), ...next };
  setPrefs(merged);
  savePrefs(merged);
};

  return (
    <PreferencesContext.Provider value={{ prefs, updatePrefs }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used within provider');
  return ctx;
}