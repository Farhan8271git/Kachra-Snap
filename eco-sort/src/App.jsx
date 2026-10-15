import { Suspense, lazy, useEffect, useState } from 'react';
import { PreferencesProvider } from './context/PreferencesContext';
import Header from './components/Header';
import Footer from './components/Footer';

// Core application pages are loaded only when required.
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Scan = lazy(() => import('./pages/Scan'));
const History = lazy(() => import('./pages/History'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Guide = lazy(() => import('./pages/Guide'));

// Informational pages are loaded on demand.
const About = lazy(() => import('./pages/About'));
const Accessibility = lazy(() => import('./pages/Accessibility'));
const Contact = lazy(() => import('./pages/Contact'));
const Credits = lazy(() => import('./pages/Credits'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Terms = lazy(() => import('./pages/Terms'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));

// Displays a fallback while a lazy-loaded page is loading.
function PageFallback() {
  return (
    <div
      className="mx-auto max-w-6xl px-4 py-8 text-sm text-[#68736B]"
      role="status"
      aria-live="polite"
    >
      Loading...
    </div>
  );
}

function AppContent() {
  const [page, setPage] = useState('dashboard');
  const [guideCategory, setGuideCategory] = useState(null);

  // Supports navigation with optional guide category information.
  const navigate = (nextPage, options) => {
    if (options?.category) {
      setGuideCategory(options.category);
    }

    setPage(nextPage);
  };

  // Reset the viewport whenever the user changes pages.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  // Resolve the current page without eagerly loading every page component.
  let content = <Dashboard onNavigate={navigate} />;

  switch (page) {
    case 'scan':
      content = <Scan onNavigate={navigate} />;
      break;

    case 'history':
      content = <History />;
      break;

    case 'analytics':
      content = <Analytics />;
      break;

    case 'guide':
      content = <Guide initialCategory={guideCategory} />;
      break;

    case 'about':
      content = <About />;
      break;

    case 'accessibility':
      content = <Accessibility />;
      break;

    case 'contact':
      content = <Contact />;
      break;

    case 'credits':
      content = <Credits />;
      break;

    case 'privacy':
      content = <PrivacyPolicy />;
      break;

    case 'terms':
      content = <Terms />;
      break;

    case 'how-it-works':
      content = <HowItWorks onNavigate={navigate} />;
      break;

    default:
      content = <Dashboard onNavigate={navigate} />;
  }

  return (
    <div className="min-h-full">
      <Header active={page} onNavigate={navigate} />

      <Suspense fallback={<PageFallback />}>
        {content}
      </Suspense>

      <Footer onNavigate={navigate} />
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