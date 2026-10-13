import { useEffect, useState } from 'react';
import { PreferencesProvider } from './context/PreferencesContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import Scan from './pages/Scan';
import History from './pages/History';
import Analytics from './pages/Analytics';
import Guide from './pages/Guide';
import About from './pages/About';
import Accessibility from './pages/Accessibility';
import Contact from './pages/Contact';
import Credits from './pages/Credits';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import HowItWorks from './pages/HowItWorks';

function AppContent() {
  const [page, setPage] = useState('dashboard');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  const pages = {
    dashboard: <Dashboard onNavigate={setPage} />,
    scan: <Scan />,
    history: <History />,
    analytics: <Analytics />,
    guide: <Guide />,
    about: <About />,
    accessibility: <Accessibility />,
    contact: <Contact />,
    credits: <Credits />,
    privacy: <PrivacyPolicy />,
    terms: <Terms />,
    'how-it-works': <HowItWorks onNavigate={setPage} />,
  };

  return (
    <div className="min-h-full">
      <Header active={page} onNavigate={setPage} />
      {pages[page] || pages.dashboard}
      <Footer onNavigate={setPage} />
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