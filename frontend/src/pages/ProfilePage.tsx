import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import Header from '../components/Header';
import { getJournalEntries } from '../services/journalService';
import type { JournalEntryListItem } from '../types';

interface ProfilePageProps {
  onBackToJournal: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onBackToJournal }) => {
  const [entries, setEntries] = useState<JournalEntryListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const filterEntriesByMonth = (entries: JournalEntryListItem[], date: Date) => {
  return entries.filter(entry => {
    const entryDate = new Date(entry.created_at);
    return entryDate.getMonth() === date.getMonth() && 
           entryDate.getFullYear() === date.getFullYear();
    });
  };

  useEffect(() => {
    const fetchEntries = async () => {
    try {
      setIsLoading(true);
      const allEntries = await getJournalEntries();
      const monthEntries = filterEntriesByMonth(allEntries, currentDate);
      setEntries(monthEntries);
      setError(null);
    } catch (err) {
      console.error('Error fetching entries:', err);
      setError('Failed to load journal entries');
    } finally {
      setIsLoading(false);
    }
    };

    fetchEntries();
}, [currentDate]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-light text-gray-800">
          Your Journal History
        </h1>
        
        <div className="flex items-center">
          <Header 
            onProfileClick={() => {}}
            onLoginClick={() => {}}
          />
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