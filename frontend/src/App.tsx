import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import JournalPage from './pages/JournalPage';
import ProfilePage from './pages/ProfilePage';
import Clouds from './components/Clouds';
import { AuthProvider } from './contexts/authContext';

const footerLink = 'underline decoration-ink/30 hover:decoration-ink hover:text-ink transition-colors';

const App: React.FC = () => (
  <AuthProvider>
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Clouds variant="page" />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<JournalPage />} />
            <Route path="/journal" element={<ProfilePage />} />
            {/* Old bookmark; the page is the journal, not a profile */}
            <Route path="/profile" element={<Navigate to="/journal" replace />} />
          </Routes>
        </main>

        {/* Always present, never loud: the safety line lives here so it is reachable before writing */}
        <footer className="max-w-4xl mx-auto w-full px-6 pt-6 pb-10 text-center text-sm text-ink-soft space-y-2">
          <p>
            Mindful Companion is a space for reflection, not a substitute for professional care.
          </p>
          <p>
            If you are in crisis or thinking about harming yourself, call or text{' '}
            <a href="tel:988" className={footerLink}>988</a> (US) or{' '}
            <a href="https://findahelpline.com" rel="noopener" className={footerLink}>
              find a helpline
            </a>{' '}
            where you are.
          </p>
          <p className="text-xs pt-2">
            Built by{' '}
            <a href="https://gkats.dev" rel="noopener" className={footerLink}>
              Cabro Insight LLC
            </a>
          </p>
        </footer>
      </div>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
