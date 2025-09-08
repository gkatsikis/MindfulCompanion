import React, { useState } from 'react';
import type { Page } from './types';
import JournalPage from './pages/JournalPage';
import ProfilePage from './pages/ProfilePage';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<Page>('journal');

  const handleLogin = (): void => {
    setIsLoggedIn(true);
  };

  const handleLogout = (): void => {
    setIsLoggedIn(false);
    setCurrentPage('journal');
  };

  const handleProfileClick = (): void => {
    setCurrentPage('profile');
  };

  const handleBackToJournal = (): void => {
    setCurrentPage('journal');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {currentPage === 'journal' ? (
        <JournalPage
          isLoggedIn={isLoggedIn}
          onLogin={handleLogin}
          onLogout={handleLogout}
          onProfileClick={handleProfileClick}
        />
      ) : (
        <ProfilePage
          onBackToJournal={handleBackToJournal}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
};

export default App;