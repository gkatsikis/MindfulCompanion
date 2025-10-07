import React, { useState } from 'react';
import type { Page } from './types';
import JournalPage from './pages/JournalPage';
import ProfilePage from './pages/ProfilePage';
import { AuthProvider } from './contexts/authContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}


const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('journal');

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
          onProfileClick={handleProfileClick}
        />
      ) : (
        <ProfilePage
          onBackToJournal={handleBackToJournal}
        />
      )}
    </div>
  );
};



export default App;