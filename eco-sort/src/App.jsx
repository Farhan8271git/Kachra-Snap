import { Suspense, lazy, useState } from 'react';
import { PreferencesProvider } from './context/PreferencesContext';
import Header from './components/Header';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Scan = lazy(() => import('./pages/Scan'));
const History = lazy(() => import('./pages/History'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Guide = lazy(() => import('./pages/Guide'));

function PageFallback() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-[#68736B]">
      Loading...
    </div>
  );
}

function AppContent() {
  const [guideCategory, setGuideCategory] = useState(null);
  const [page, setPage] = useState('dashboard');
  const navigate = (nextPage, options) => {
    if (options?.category) setGuideCategory(options.category);
    setPage(nextPage);
  };

  let content = <Dashboard onNavigate={navigate} />;
  if (page === 'scan') content = <Scan onNavigate={navigate} />;
  if (page === 'history') content = <History />;
  if (page === 'analytics') content = <Analytics />;
  if (page === 'guide') content = <Guide initialCategory={guideCategory} />;

  return (
    <div className="min-h-full">
      <Header active={page} onNavigate={navigate} />
      <Suspense fallback={<PageFallback />}>{content}</Suspense>
    </div>
  );
}

export default function App() {
  return (
    <PreferencesProvider>
      <AppContent />
    </PreferencesProvider>
  );
}
