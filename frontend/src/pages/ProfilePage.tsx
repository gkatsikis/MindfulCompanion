import React from 'react';
import { Calendar } from 'lucide-react';

interface ProfilePageProps {
  onBackToJournal: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onBackToJournal }) => {
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-light text-gray-800">
          Your Journal History
        </h1>
        
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToJournal}
            className="px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            ← Back to Journal
          </button>
          <button
            onClick={onLogout}
            className="px-4 py-2 text-gray-600 hover:text-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Calendar View Placeholder */}
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <Calendar size={64} className="mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-medium text-gray-700 mb-2">Calendar View</h3>
        <p className="text-gray-500 mb-4">
          Click on any day with a journal entry to view your past reflections
        </p>
        <div className="text-sm text-gray-400">
          Calendar component needs to hang out right here
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;