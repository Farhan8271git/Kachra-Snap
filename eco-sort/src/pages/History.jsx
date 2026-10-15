import { useState } from 'react';
import { Trash2, Filter } from 'lucide-react';
import {
  loadHistory,
  removeRecord,
  clearHistory,
} from '../lib/storage';
import { CATEGORY_LABEL, DISPOSAL_STREAM, toApplicationCategory } from '../constants/categories';
import CategoryBadge from '../components/CategoryBadge';
import Reveal from '../components/Reveal';
import { usePreferences } from '../context/PreferencesContext';
import { t } from '../i18n/translations';

export default function History() {
  const { prefs } = usePreferences();
  const tr = (key) => t(prefs.language, key);
  const [records, setRecords] = useState(() => loadHistory());
  const [filter, setFilter] = useState('all');
  const [confirmClear, setConfirmClear] = useState(false);

  const filtered =
    filter === 'all'
      ? records
      : records.filter((r) => r.category === filter);

  const refresh = () => setRecords(loadHistory());

  const remove = (id) => {
    removeRecord(id);
    refresh();
  };

  const clear = () => {
    clearHistory();
    setConfirmClear(false);
    refresh();
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <Reveal as="div" className="flex flex-wrap items-end justify-between gap-3" delay={0}>
        <div>
          <h1 className="text-2xl font-semibold text-charcoal">{tr('historyTitle')}</h1>
          <p className="text-sm text-secondary">
            {tr('historySubtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Filter className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-md border border-border bg-white py-2 pl-8 pr-3 text-sm text-charcoal"
              aria-label="{tr('filterByCategory')}"
            >
              <option value="all">{tr('allCategories')}</option>
              {Object.entries(CATEGORY_LABEL).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => setConfirmClear(true)}
            disabled={records.length === 0}
            className="rounded-md border border-border bg-white px-3 py-2 text-sm text-charcoal hover:bg-offwhite disabled:opacity-50"
          >
            {tr('clearAll')}
          </button>
        </div>
      </Reveal>

      {filtered.length === 0 ? (
        <Reveal as="div" className="mt-6 rounded-lg border border-border bg-white p-6 text-center" delay={60}>
          <p className="text-charcoal font-medium">{tr('noRecords')}</p>
          <p className="mt-1 text-sm text-secondary">
            {tr('scannedItemsHere')}
          </p>
        </Reveal>
      ) : (
        <Reveal as="ul" className="mt-6 divide-y divide-border rounded-lg border border-border bg-white" delay={60}>
          {filtered.map((r) => (
            <li
              key={r.id}
              className="flex items-center gap-3 px-3 py-3 sm:px-4"
            >
              {r.thumbnail ? (
                <img
                  src={r.thumbnail}
                  alt=""
                  className="h-12 w-12 rounded object-cover"
                />
              ) : (
                <div className="h-12 w-12 rounded bg-offwhite" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <CategoryBadge category={r.category} />
                  <span className="text-xs text-secondary">
                    {DISPOSAL_STREAM[toApplicationCategory(r.category)]?.label}
                  </span>
                  <span className="text-xs text-secondary">
                    {Math.round(r.confidence * 100)}%
                  </span>
                </div>
                <p className="mt-1 truncate text-xs text-secondary">
                  {r.modelLabel} · {new Date(r.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => remove(r.id)}
                className="rounded-md p-2 text-secondary hover:bg-offwhite hover:text-error"
                aria-label="Remove record"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </Reveal>
      )}

      {confirmClear && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-charcoal/60 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-4">
            <h3 className="font-semibold text-charcoal">{tr('clearAll')} history?</h3>
            <p className="mt-1 text-sm text-secondary">
              This cannot be undone.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={clear}
                className="flex-1 rounded-md bg-error px-4 py-2 text-sm font-medium text-white hover:opacity-90"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="rounded-md border border-border bg-white px-4 py-2 text-sm text-charcoal hover:bg-offwhite"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}