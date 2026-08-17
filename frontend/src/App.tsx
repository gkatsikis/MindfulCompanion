import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';

import JournalPage from './pages/JournalPage';
import ProfilePage from './pages/ProfilePage';
import Clouds from './components/Clouds';
import { AuthProvider } from './contexts/authContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}


const AppContent: React.FC = () => {
  const navigate = useNavigate();

  const handleProfileClick = (): void => {
    navigate('/profile');
  };

  return (
    <div className="min-h-screen">
      <Clouds variant="page" />
      <Routes>
        <Route
          path='/'
          element={
            <JournalPage 
              onProfileClick={handleProfileClick}
            />
          } 
        />
        <Route 
          path='/profile'
          element={
            <ProfilePage />
          }
        />
      </Routes>
      <footer className="text-center py-4 text-xs text-slate-400">
        Built by{' '}
        <a href="https://gkats.dev" rel="noopener" className="underline hover:text-slate-600">
          Cabro Insight LLC
        </a>
      </footer>
    </div>
  );
};



export default App;