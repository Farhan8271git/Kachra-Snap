import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { DISPOSAL_GUIDE } from '../constants/disposalGuide';
import { usePreferences } from '../context/PreferencesContext';
import { t } from '../i18n/translations';
import Reveal from '../components/Reveal';

const ORDER = ['recyclable', 'organic', 'ewaste', 'unknown'];

export default function Guide({ initialCategory }) {
  const { prefs } = usePreferences();
  const tr = (key) => t(prefs.language, key);
  const categoryLabel = (id) => {
    const key = 'category_' + id;
    const value = t(prefs.language, key);
    return value === key ? id : value;
  };
  const [open, setOpen] = useState(initialCategory || null);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <Reveal as="div">
        <h1 className="text-2xl font-semibold text-charcoal">{tr('guideTitle')}</h1>
        <p className="text-sm text-secondary">
          {tr('guideSubtitle')}
        </p>
      </Reveal>

      <Reveal as="div" className="mt-6 space-y-2" delay={60}>
        {ORDER.map((id) => {
          const g = DISPOSAL_GUIDE[id];
          const isOpen = open === id;
          return (
            <div key={id} className="rounded-lg border border-border bg-white">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : id)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <span className="font-medium text-charcoal">
                  {categoryLabel(id)}
                </span>
                <ChevronDown
                  className={
                    'h-4 w-4 text-secondary transition-transform ' +
                    (isOpen ? 'rotate-180' : '')
                  }
                  aria-hidden="true"
                />
              </button>
              {isOpen && (
                <div className="border-t border-border px-4 py-3 space-y-3">
                  <Block title="Examples" items={g.examples} />
                  <Block title="Preparation" items={g.preparation} />
                  <Block title="Disposal" items={g.disposal} />
                  <Block title="Contamination" items={g.contamination} />
                  <Block title="Safety" items={g.safety} />
                  <p className="text-xs text-warning">{g.local}</p>
                </div>
              )}
            </div>
          );
        })}
      </Reveal>
    </main>
  );
}

function Block({ title, items }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <p className="text-xs font-semibold text-charcoal">{title}</p>
      <ul className="mt-1 list-disc pl-5 text-sm text-secondary space-y-0.5">
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </div>
  );
}