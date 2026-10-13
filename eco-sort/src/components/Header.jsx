import { useState } from 'react';
import { LayoutDashboard, Camera, History, BarChart3, BookOpen, Leaf, ChevronDown, Globe, Moon, Sun } from 'lucide-react';
import { usePreferences } from '../context/PreferencesContext';
import { t, LANGUAGES } from '../i18n/translations';

const NAV = [
  { id: 'dashboard', labelKey: 'navDashboard', icon: LayoutDashboard },
  { id: 'scan', labelKey: 'navScan', icon: Camera },
  { id: 'history', labelKey: 'navHistory', icon: History },
  { id: 'analytics', labelKey: 'navAnalytics', icon: BarChart3 },
  { id: 'guide', labelKey: 'navGuide', icon: BookOpen },
];

export default function Header({ active, onNavigate }) {
  const { prefs, updatePrefs } = usePreferences();
  const [langOpen, setLangOpen] = useState(false);
  const tr = (key) => t(prefs.language, key);

  return (
    <header className="sticky top-0 z-20 border-b border-[#D9E1DA] bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2 font-bold text-[#205C43]"
        >
          <Leaf className="h-5 w-5 text-[#205C43]" aria-hidden="true" />
          <span>{tr('brand')}</span>
        </button>
        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => onNavigate(n.id)}
              aria-current={active === n.id ? 'page' : undefined}
              className={
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm ' +
                (active === n.id
                  ? 'bg-[#DCEBDD] text-[#205C43] font-medium'
                  : 'text-[#37443B] hover:bg-[#F3F7F3]')
              }
            >
              <n.icon className={"h-4 w-4 " + (active === n.id ? "text-[#205C43]" : "text-[#37443B]")} aria-hidden="true" />
              {tr(n.labelKey)}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => updatePrefs({ theme: prefs.theme === 'dark' ? 'light' : 'dark' })}
            className="inline-flex items-center justify-center rounded-md border border-[#D9E1DA] bg-white p-2 text-[#26352D] hover:bg-[#F3F7F3]"
            aria-label={prefs.theme === 'dark' ? tr('themeLight') : tr('themeDark')}
          >
            {prefs.theme === 'dark' ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-md border border-[#D9E1DA] bg-white px-3 py-2 text-sm text-[#26352D] hover:bg-[#F3F7F3]"
              aria-label={tr('language')}
              aria-expanded={langOpen}
            >
              <Globe className="h-4 w-4 text-[#26352D]" aria-hidden="true" />
              <span className="hidden sm:inline">
                {LANGUAGES.find((l) => l.code === prefs.language)?.label ||
                  'English'}
              </span>
              <ChevronDown className="h-4 w-4 text-[#26352D]" aria-hidden="true" />
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
                        ? 'bg-[#DCEBDD] text-[#205C43] font-medium'
                        : 'text-[#37443B] hover:bg-[#F3F7F3]')
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
            onClick={() => onNavigate('scan')}
            className="inline-flex items-center gap-2 rounded-md bg-forest px-3 py-2 text-sm font-medium text-white hover:bg-deep md:hidden"
          >
            <Camera className="h-4 w-4" aria-hidden="true" />
            {tr('navScan')}
          </button>
        </div>
      </div>
      <nav aria-label="Primary mobile" className="border-t border-border md:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-around px-2 py-2">
          {NAV.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => onNavigate(n.id)}
              aria-current={active === n.id ? 'page' : undefined}
              className={
                'flex flex-col items-center gap-1 rounded-md px-2 py-1 text-xs ' +
                (active === n.id ? 'text-[#205C43]' : 'text-[#37443B]')
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