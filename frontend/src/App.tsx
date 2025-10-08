import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';

import type { Page } from './types';
import JournalPage from './pages/JournalPage';
import ProfilePage from './pages/ProfilePage';
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

  const handleBackToJournal = (): void => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
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
            <ProfilePage
              onBackToJournal={handleBackToJournal}
            />
          }
        />
      </Routes>
    </div>
  );
};



export default App;