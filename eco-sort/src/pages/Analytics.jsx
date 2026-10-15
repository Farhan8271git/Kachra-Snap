import { useState } from 'react';
import { BarChart3, PieChart, Activity } from 'lucide-react';
import { loadHistory } from '../lib/storage';
import { CATEGORY_LABEL, toApplicationCategory } from '../constants/categories';
import CategoryBadge from '../components/CategoryBadge';
import Reveal from '../components/Reveal';
import { usePreferences } from '../context/PreferencesContext';
import { t } from '../i18n/translations';

const CHART_COLORS = [
  '#285943',
  '#457763',
  '#6B9B86',
  '#B7791F',
  '#B54747',
  '#214A37',
  '#8AA896',
  '#A4BEAF',
  '#C9D6C5',
  '#9FB4A7',
];

export default function Analytics() {
  const { prefs } = usePreferences();
  const tr = (key) => t(prefs.language, key);
  const [chartType, setChartType] = useState('bar');
  const records = loadHistory();

  const total = records.length;
  const uncertain = records.filter((r) => r.category === 'unknown').length;
  const avgConf = total ? records.reduce((s, r) => s + r.confidence, 0) / total : 0;

  const counts = records.reduce((acc, r) => {
    const category = toApplicationCategory(r.category);
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const catStats = Object.entries(counts)
    .map(([category, count]) => {
      const categoryRecords = records.filter((r) => toApplicationCategory(r.category) === category);
      const categoryAvg =
        categoryRecords.reduce((s, r) => s + r.confidence, 0) /
        categoryRecords.length;
      return { category, count, percentage: count / total, avg: categoryAvg };
    })
    .sort((a, b) => b.count - a.count);

  const topCategory = catStats[0];
  const uniqueCategories = catStats.length;

  // Rolling seven-day count used by the Last 7 Days metric.
  // eslint-disable-next-line react/purity
  const rollingSevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  // eslint-disable-next-line react/purity
  const recentCount = records.filter(
    (r) => new Date(r.createdAt).getTime() >= rollingSevenDaysAgo
  ).length;

  // eslint-disable-next-line react/purity
  const now = new Date();
  // Monday of the current local calendar week.
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  // Monday-Sunday activity for the current week
  const localKey = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate()
    ).padStart(2, '0')}`;
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    days.push({
      key: localKey(d),
      label: d.toLocaleDateString(undefined, { weekday: 'short' }),
      n: 0,
    });
  }
  const dayIndex = Object.fromEntries(days.map((x, i) => [x.key, i]));
  records.forEach((r) => {
    const created = new Date(r.createdAt);
    if (Number.isNaN(created.getTime())) return;
    const key = localKey(created);
    if (dayIndex[key] !== undefined) days[dayIndex[key]].n += 1;
  });
  const weekCount = days.reduce((sum, day) => sum + day.n, 0);
  const dayMax = Math.max(1, ...days.map((d) => d.n));

  // Confidence bands
  const bands = [
    { label: '0-49%', min: 0, max: 0.5 },
    { label: '50-69%', min: 0.5, max: 0.7 },
    { label: '70-84%', min: 0.7, max: 0.85 },
    { label: '85-100%', min: 0.85, max: 1.01 },
  ].map((band) => ({
    ...band,
    count: records.filter(
      (r) => r.confidence >= band.min && r.confidence < band.max
    ).length,
  }));
  const bandMax = Math.max(1, ...bands.map((b) => b.count));

  // {tr('donut')} gradient
  let gradientStart = 0;
  const gradientParts = [];
  catStats.forEach((stat, index) => {
    const percent = stat.percentage * 100;
    const end = gradientStart + percent;
    gradientParts.push(
      `${CHART_COLORS[index % CHART_COLORS.length]} ${gradientStart}% ${end}%`
    );
    gradientStart = end;
  });
  if (gradientStart < 100) {
    gradientParts.push(`#E3E7E0 ${gradientStart}% 100%`);
  }
  const donutGradient = gradientParts.join(', ');

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <Reveal as="div" className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-charcoal">{tr('analyticsTitle')}</h1>
          <p className="text-sm text-secondary">
            All metrics are derived from your saved scan records.
          </p>
        </div>
      </Reveal>

      {/* Summary metrics */}
      <Reveal as="div" className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6" delay={60}>
        <Stat label={tr('totalScans')} value={total} />
        <Stat label={tr('avgConfidence')} value={Math.round(avgConf * 100) + '%'} />
        <Stat label="Uncertain" value={uncertain} />
        <Stat label={tr('categoriesUsed')} value={uniqueCategories} />
        <Stat label="Last 7 days" value={recentCount} />
        <Stat
          label="Most common"
          value={topCategory ? CATEGORY_LABEL[topCategory.category] : 'None'}
        />
      </Reveal>

      {/* {tr('categoryDistribution')} */}
      <Reveal as="section" className="mt-6 rounded-lg border border-border bg-white p-4" delay={120}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-charcoal">
              {tr('categoryDistribution')}
            </h2>
            <p className="text-xs text-secondary">
              {tr('graphType')}{' '}
              {chartType === 'bar'
                ? `${tr('bar')} chart - compares scan counts by category`
                : `${tr('donut')} chart - shows each category share`
              }
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setChartType('bar')}
              className={
                'inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium ' +
                (chartType === 'bar'
                  ? 'bg-forest text-white'
                  : 'border border-border bg-white text-charcoal hover:bg-offwhite')
              }
            >
              <BarChart3 className="h-4 w-4" aria-hidden="true" />
              {tr('bar')}
            </button>
            <button
              type="button"
              onClick={() => setChartType('donut')}
              className={
                'inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium ' +
                (chartType === 'donut'
                  ? 'bg-forest text-white'
                  : 'border border-border bg-white text-charcoal hover:bg-offwhite')
              }
            >
              <PieChart className="h-4 w-4" aria-hidden="true" />
              {tr('donut')}
            </button>
          </div>
        </div>

        {catStats.length === 0 ? (
          <p className="mt-4 text-sm text-secondary">{tr('noDataYet')}</p>
        ) : chartType === 'bar' ? (
          <div className="mt-4 space-y-3">
            {catStats.map((stat) => (
              <div key={stat.category} className="flex items-center gap-3">
                <div className="w-40 shrink-0">
                  <CategoryBadge category={stat.category} />
                </div>
                <div className="flex-1">
                  <div className="h-2.5 overflow-hidden rounded-full bg-offwhite">
                    <div
                      className="h-full rounded-full bg-forest transition-all"
                      style={{
                        width: `${Math.max(4, stat.percentage * 100)}%`,
                      }}
                    />
                  </div>
                </div>
                <span className="w-20 text-right text-xs text-secondary">
                  {stat.count} · {Math.round(stat.percentage * 100)}%
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 flex flex-col items-center gap-6 md:flex-row">
            <div
              className="relative h-44 w-44 shrink-0 rounded-full"
              style={{ background: donutGradient }}
              role="img"
              aria-label={`${tr('categoryDistribution')} donut chart`}
            >
              <div className="absolute inset-7 flex flex-col items-center justify-center rounded-full bg-white">
                <span className="text-2xl font-semibold text-charcoal">{total}</span>
                <span className="text-xs text-secondary">{tr('scansLabel')}</span>
              </div>
            </div>
            <div className="w-full space-y-2">
              {catStats.map((stat, index) => (
                <div key={stat.category} className="flex items-center gap-3">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{
                      backgroundColor:
                        CHART_COLORS[index % CHART_COLORS.length],
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <CategoryBadge category={stat.category} />
                  </div>
                  <span className="text-xs text-secondary">
                    {stat.count} · {Math.round(stat.percentage * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Reveal>

      {/* {tr('confidenceDistribution')} */}
      <Reveal as="section" className="mt-6 rounded-lg border border-border bg-white p-4" delay={180}>
        <h2 className="text-sm font-semibold text-charcoal">
          {tr('confidenceDistribution')}
        </h2>
        <p className="text-xs text-secondary">
          {tr('graphType')} {tr('bar')} chart - count of predictions by confidence band
        </p>
        <div className="mt-4 grid grid-cols-4 gap-3">
          {bands.map((band) => (
            <div key={band.label} className="flex flex-col items-center gap-2">
              <div className="flex h-28 w-full items-end rounded-md bg-offwhite p-1">
                <div
                  className="w-full rounded bg-forest transition-all"
                  style={{
                    height: `${Math.max(4, (band.count / bandMax) * 100)}%`,
                  }}
                />
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-charcoal">{band.count}</p>
                <p className="text-[10px] text-secondary">{band.label}</p>
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* {tr('recentActivity')} */}
      <Reveal as="section" className="mt-6 rounded-lg border border-border bg-white p-4" delay={240}>
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-forest" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-charcoal">
            {tr('recentActivity')}
          </h2>
        </div>
        <p className="text-xs text-secondary">
          {tr('graphType')} Trend bars - scans recorded each day for the last 7 days
        </p>
        <div className="mt-4 flex items-end gap-2 h-32">
          {days.map((day) => (
            <div
              key={day.key}
              className="relative flex h-full flex-1 items-end justify-center"
            >
              {day.n > 0 && (
                <span className="absolute -top-4 text-[10px] font-medium text-charcoal">
                  {day.n}
                </span>
              )}
              <div
                className="w-full rounded-t bg-forest"
                style={{
                  height: `${Math.max(4, (day.n / dayMax) * 100)}%`,
                  minHeight: '4px',
                }}
              />
            </div>
          ))}
        </div>
        <div className="mt-1 flex gap-2">
          {days.map((day) => (
            <span
              key={day.key}
              className="flex-1 text-center text-[10px] text-secondary"
            >
              {day.label}
            </span>
          ))}
        </div>
        <p className="mt-3 text-xs text-secondary">
          {weekCount} scan{weekCount === 1 ? '' : 's'} recorded this week (Monday-Sunday).
        </p>
      </Reveal>

      {/* Category table */}
      <Reveal as="section" className="mt-6 rounded-lg border border-border bg-white p-4" delay={300}>
        <h2 className="text-sm font-semibold text-charcoal">{tr('categoryBreakdown')}</h2>
        {catStats.length === 0 ? (
          <p className="mt-3 text-sm text-secondary">{tr('noDataYet')}</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-secondary">
                  <th className="py-2 font-medium">{tr('categoryLabel')}</th>
                  <th className="py-2 font-medium">{tr('scansLabel')}</th>
                  <th className="py-2 font-medium">{tr('shareLabel')}</th>
                  <th className="py-2 font-medium">{tr('avgConfidence')}</th>
                </tr>
              </thead>
              <tbody>
                {catStats.map((stat) => (
                  <tr key={stat.category} className="border-b border-border last:border-0">
                    <td className="py-2">
                      <CategoryBadge category={stat.category} />
                    </td>
                    <td className="py-2 text-charcoal">{stat.count}</td>
                    <td className="py-2 text-charcoal">
                      {Math.round(stat.percentage * 100)}%
                    </td>
                    <td className="py-2 text-charcoal">
                      {Math.round(stat.avg * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Reveal>

      {total > 0 && (
        <p className="mt-4 text-xs text-secondary">
          Predictions are recorded locally. Charts reflect saved scan records only
          and do not imply environmental impact savings.
        </p>
      )}
    </main>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <p className="text-xs text-secondary">{label}</p>
      <p className="mt-1 text-xl font-semibold text-charcoal truncate">{value}</p>
    </div>
  );
}