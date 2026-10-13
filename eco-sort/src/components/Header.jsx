import { useState } from 'react';
import { LayoutDashboard, Camera, History, BarChart3, BookOpen, Cpu, Leaf, ChevronDown, Globe, Moon, Sun } from 'lucide-react';
import { usePreferences } from '../context/PreferencesContext';
import { t, LANGUAGES } from '../i18n/translations';

const NAV = [
  { id: 'dashboard', labelKey: 'navDashboard', icon: LayoutDashboard },
  { id: 'scan', labelKey: 'navScan', icon: Camera },
  { id: 'history', labelKey: 'navHistory', icon: History },
  { id: 'analytics', labelKey: 'navAnalytics', icon: BarChart3 },
  { id: 'guide', labelKey: 'navGuide', icon: BookOpen },
  { id: 'how-it-works', labelKey: 'navHowItWorks', icon: Cpu },
];

export default function Header({ active, onNavigate }) {
  const { prefs, updatePrefs } = usePreferences();
  const [langOpen, setLangOpen] = useState(false);
  const tr = (key) => t(prefs.language, key);
  const isDark = prefs.theme
    ? prefs.theme === 'dark'
    : window.matchMedia('(prefers-color-scheme: dark)').matches;

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-white/95 backdrop-blur dark:bg-slate-900/95">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2 font-bold text-forest"
        >
          <Leaf className="h-5 w-5 text-forest" aria-hidden="true" />
          <span>{tr('brand')}</span>
        </button>
        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => onNavigate(n.id)}
              aria-current={active === n.id ? 'page' : undefined}
              className={
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm ' +
                (active === n.id
                  ? 'bg-sage text-forest font-medium'
                  : 'text-charcoal hover:bg-offwhite dark:hover:bg-slate-800')
              }
            >
              <n.icon className={"h-4 w-4 " + (active === n.id ? "text-forest" : "text-charcoal")} aria-hidden="true" />
              {tr(n.labelKey)}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-white px-3 py-2 text-sm text-charcoal hover:bg-offwhite dark:bg-slate-800 dark:hover:bg-slate-700"
              aria-label={tr('language')}
              aria-expanded={langOpen}
            >
              <Globe className="h-4 w-4 text-secondary" aria-hidden="true" />
              <span className="hidden sm:inline">
                {LANGUAGES.find((l) => l.code === prefs.language)?.label ||
                  'English'}
              </span>
              <ChevronDown className="h-4 w-4 text-secondary" aria-hidden="true" />
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-md border border-border bg-white py-1 shadow-sm">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      updatePrefs({ language: lang.code });
                      setLangOpen(false);
                    }}
                    className={
                      'block w-full px-3 py-2 text-left text-sm ' +
                      (prefs.language === lang.code
                        ? 'bg-sage text-forest font-medium'
                        : 'text-charcoal hover:bg-offwhite dark:hover:bg-slate-700')
                    }
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => updatePrefs({ theme: isDark ? 'light' : 'dark' })}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-white text-charcoal transition-colors hover:bg-offwhite dark:bg-slate-800 dark:hover:bg-slate-700"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? (
              <Sun className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            onClick={() => onNavigate('scan')}
            className="inline-flex items-center gap-2 rounded-md bg-forest px-2 py-2 text-sm font-medium text-white hover:bg-deep sm:px-3 md:hidden"
          >
            <Camera className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{tr('navScan')}</span>
          </button>
        </div>
      </div>
      <nav aria-label="Primary mobile" className="border-t border-border lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-start gap-2 overflow-x-auto px-2 py-2">
          {NAV.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => onNavigate(n.id)}
              aria-current={active === n.id ? 'page' : undefined}
              className={
                'flex shrink-0 flex-col items-center gap-1 whitespace-nowrap rounded-md px-2 py-1 text-xs ' +
                (active === n.id ? 'text-forest' : 'text-charcoal')
              }
            >
              <n.icon className="h-4 w-4" aria-hidden="true" />
              {tr(n.labelKey)}
            </button>
          ))}
        </div>
      </nav>
    </header>
  );
}