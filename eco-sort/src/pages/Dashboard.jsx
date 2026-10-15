import { loadHistory } from '../lib/storage';
import { toApplicationCategory } from '../constants/categories';
import CategoryBadge from '../components/CategoryBadge';
import Reveal from '../components/Reveal';
import {
  Camera,
  CheckCircle2,
  Cpu,
  Recycle,
  ScanLine,
  Sprout,
} from 'lucide-react';

export default function Dashboard({ onNavigate }) {
  const records = loadHistory();
  const total = records.length;

  const counts = records.reduce((acc, r) => {
    const category = toApplicationCategory(r.category);
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  // Monday-Sunday activity for the current local week
  // eslint-disable-next-line react/purity
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  weekStart.setHours(0, 0, 0, 0);
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
  const recent = records.slice(0, 5);


  return (
    <main className="min-h-screen bg-offwhite text-charcoal">
      <section className="relative overflow-hidden border-b border-[#D9E1DA] bg-[#0D2418] text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:px-8 lg:py-12">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-lime-200">
              SMART WASTE INTELLIGENCE
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              See the Waste. Know the Way.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-emerald-100/80">
              Identify waste categories, learn responsible disposal methods, and make better everyday choices.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => onNavigate('scan')}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-lime-200 px-5 py-3 text-sm font-semibold text-[#0D2418] transition hover:bg-lime-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-100"
              >
                <ScanLine className="h-4 w-4" aria-hidden="true" />
                Scan Your Waste
              </button>
              <button
                type="button"
                onClick={() => onNavigate('guide')}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-white/25 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Explore Disposal Guide
              </button>
            </div>
          </div>

          <div className="grid gap-4 self-center sm:grid-cols-2">
            {[
              [Sprout, 'Organic', 'Food scraps and garden waste'],
              [Recycle, 'Recyclable', 'Clean paper, cardboard, bottles, cans'],
              [Cpu, 'E-Waste', 'Electronics and batteries'],
              [CheckCircle2, 'Unclear Item', 'Confirm with local guidance'],
            ].map(([Icon, title, text]) => {
              const categoryId =
                title === 'Organic'
                  ? 'organic'
                  : title === 'Recyclable'
                    ? 'recyclable'
                    : title === 'E-Waste'
                      ? 'ewaste'
                      : 'unknown';
              return (
                <button
                  key={title}
                  type="button"
                  onClick={() => onNavigate('guide', { category: categoryId })}
                  className="rounded-xl border border-white/15 bg-white/10 p-4 text-left shadow-lg shadow-black/20 backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-100"
                >
                  <Icon className="h-5 w-5 text-lime-200" aria-hidden="true" />
                  <p className="mt-3 text-sm font-medium text-white">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-emerald-100/70">{text}</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>
      <Reveal as="section" className="bg-white/70 dark:bg-slate-900 py-8 md:py-10"delay={0}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#205C43]">
              HOW IT WORKS
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-charcoal md:text-3xl">
              From Waste to the Right Action
            </h2>
            <p className="mt-2 text-sm leading-6 text-secondary">
              Three simple steps to understand your waste and learn how to dispose of it responsibly.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              ['Capture', 'Upload or photograph a waste item in good lighting.', Camera],
              ['Identify', 'Classify the item when a compatible trained model is available.', ScanLine],
              ['Act', 'Follow practical disposal guidance and local sorting rules.', CheckCircle2],
            ].map(([title, text, Icon], index) => (
              <Reveal as="div" key={title} delay={index * 70}>
                <article className={`flex h-full flex-col rounded-xl border border-[#E3E7E0] bg-white p-5 shadow-sm `}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0D2418] text-sm font-semibold text-white">
                      {index + 1}
                    </div>
                    <Icon className="h-5 w-5 text-[#205C43]" aria-hidden="true" />
                  </div>
                  <h2 className="mt-3 text-base font-semibold text-charcoal">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-secondary">{text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" delay={60}>
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#205C43]">
              Categories
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-charcoal md:text-3xl">
              Practical waste categories
            </h2>
            <p className="mt-3 text-sm leading-6 text-secondary">
              Organic waste is prepared for compost, recyclables are separated while clean and dry, and electronics stay out of ordinary bins.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              [Sprout, 'Organic Waste', 'Compost suitable food scraps where accepted.'],
              [Recycle, 'Recyclable Waste', 'Keep accepted recyclable materials clean and dry.'],
              [Cpu, 'E-Waste', 'Use authorized e-waste collection channels.'],
            ].map(([Icon, title, text], index) => (
              <Reveal as="div" key={title} delay={index * 70}>
                <article className={`flex h-full flex-col rounded-xl border border-[#E3E7E0] bg-white p-5 shadow-sm`}>
                  <Icon className="h-5 w-5 text-[#205C43]" aria-hidden="true" />
                  <h3 className="mt-3 text-base font-semibold text-charcoal">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-secondary">{text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal
        as="section"
        className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
        delay={80}
      >
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#205C43]">
              YOUR SCAN RECORD
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-charcoal md:text-3xl">
              Activity from saved scans
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('analytics')}
            className="w-fit rounded-lg border border-[#D9E1DA] bg-white px-4 py-2 text-sm font-semibold text-[#205C43] transition hover:bg-[#F3F7F3]"
          >
            View full analytics
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {[
            ['Total Scans', total],
            ['Recyclable', counts.recyclable || 0],
            ['Organic', counts.organic || 0],
            ['E-Waste', counts.ewaste || 0],
            ['Unknown Results', counts.unknown || 0],
          ].map(([label, value], index) => (
            <Reveal as="div" key={label} delay={index * 40}>
              <StatCard label={label} value={value} />
            </Reveal>
          ))}
        </div>

        {total === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-[#D9E1DA] bg-white p-6 text-center">
            <h3 className="text-lg font-semibold text-charcoal">No scans saved yet</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-secondary">
              Scan a few waste items to build a record of totals, weekly activity, and recent results. Everything comes from your local scan history.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('scan')}
              className="mt-4 rounded-lg bg-[#0D2418] px-4 py-2 text-sm font-semibold text-white"
            >
              Start scanning
            </button>
          </div>
        ) : (
          <div className="mt-6 grid items-stretch gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Reveal as="div" delay={80}>
              <article className={`flex h-full flex-col rounded-xl border border-[#E3E7E0] bg-white p-6 shadow-sm`}>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-base font-semibold text-charcoal">This week</h3>
                  <span className="text-xs text-secondary">{weekCount} scans</span>
                </div>

                <div className="mt-6 flex items-end gap-2 h-32">
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
                        className="w-full rounded-t bg-[#205C43]"
                        style={{
                          height: `${Math.max(4, (day.n / dayMax) * 100)}%`,
                          minHeight: '4px',
                        }}
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-2 flex gap-2">
                  {days.map((day) => (
                    <span key={day.key} className="flex-1 text-center text-[10px] text-secondary">
                      {day.label}
                    </span>
                  ))}
                </div>
              </article>
            </Reveal>

            <Reveal as="div" delay={150}>
              <article className={`flex h-full flex-col rounded-xl border border-[#E3E7E0] bg-white p-6 shadow-sm`}>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-base font-semibold text-charcoal">Recent scans</h3>
                  <button
                    type="button"
                    onClick={() => onNavigate('analytics')}
                    className="text-xs font-semibold text-[#205C43] hover:underline"
                  >
                    View analytics
                  </button>
                </div>

                <ul className="mt-4 divide-y divide-[#E3E7E0]">
                  {recent.map((r) => (
                    <li key={r.id} className="flex items-center gap-3 py-3">
                      {r.thumbnail ? (
                        <img
                          src={r.thumbnail}
                          alt=""
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-[#F3F7F3]" />
                      )}
                      <div className="min-w-0 flex-1">
                        <CategoryBadge category={r.category} />
                        <p className="mt-1 text-xs text-secondary">
                          {Math.round(r.confidence * 100)}% ·{' '}
                          {new Date(r.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          </div>
        )}
      </Reveal>

      <footer className="border-t border-[#D9E1DA] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p className="text-sm font-medium text-[#205C43]">Kachra-Snap</p>
          <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-secondary">
            <button type="button" onClick={() => onNavigate('scan')} className="hover:text-[#205C43]">
              Scanner
            </button>
            <button type="button" onClick={() => onNavigate('guide')} className="hover:text-[#205C43]">
              Disposal Guide
            </button>
            <button type="button" onClick={() => onNavigate('history')} className="hover:text-[#205C43]">
              History
            </button>
            <button type="button" onClick={() => onNavigate('analytics')} className="hover:text-[#205C43]">
              Analytics
            </button>
            <button type="button" onClick={() => onNavigate('dashboard')} className="hover:text-[#205C43]">
              Dashboard
            </button>
          </nav>
        </div>
      </footer>
    </main>
  );
}

function StatCard({ label, value }) {
  return (
    <div
      className={`flex h-full flex-col rounded-xl border border-[#E3E7E0] bg-white p-4 shadow-sm `}
    >
      <p className="text-xs font-medium text-secondary">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-charcoal">{value}</p>
    </div>
  );
}