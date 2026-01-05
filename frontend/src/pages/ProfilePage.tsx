import React, { useState, useEffect } from 'react';
import Calendar from '../components/Calendar';
import Header from '../components/Header';
import ContentModal from '../components/ContentModal';
import { getJournalEntries, getJournalEntry, deleteJournalEntry } from '../services/journalService';
import type { JournalEntryListItem, JournalEntry } from '../types';

interface ProfilePageProps {}

const ProfilePage: React.FC<ProfilePageProps> = ({}) => {
  const [entries, setEntries] = useState<JournalEntryListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // modal state
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isFetchingEntry, setIsFetchingEntry] = useState<boolean>(false);

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

  const handleMonthChange = (direction: 'prev' | 'next') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleEntryClick = async (entry: JournalEntryListItem) => {
    try {
      setIsFetchingEntry(true);
      const fullEntry = await getJournalEntry(entry.id);
      setSelectedEntry(fullEntry);
      setShowModal(true);
    } catch (err) {
      console.error('Error fetching full entry:', err);
      setError('Failed to load entry details');
    } finally {
      setIsFetchingEntry(false);
    }
  };

  const handleDeleteEntry = async () => {
    if (!selectedEntry) return;

    try {
      await deleteJournalEntry(selectedEntry.id);
      
      // Close modal
      setShowModal(false);
      
      // Refresh entries
      const allEntries = await getJournalEntries();
      const monthEntries = filterEntriesByMonth(allEntries, currentDate);
      setEntries(monthEntries);
      
      setSelectedEntry(null);
    } catch (err) {
      console.error('Error deleting entry:', err);
      setError('Failed to delete entry');
    }
  };

  const getModalContent = () => {
    if (!selectedEntry) return '';
    
    let content = selectedEntry.content;
    
    // Add AI response if it exists
    if (selectedEntry.ai_interaction) {
      content += '\n\n--- AI Response ---\n\n' + selectedEntry.ai_interaction.claude_response;
    }
    
    return content;
  };

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

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-gray-500">Loading entries...</div>
        </div>
      ) : (
        <Calendar
          entries={entries}
          currentDate={currentDate}
          onMonthChange={handleMonthChange}
          onEntryClick={handleEntryClick}
        />
      )}

      {/* Entry Detail Modal */}
      <ContentModal
        show={showModal}
        onClose={() => setShowModal(false)}
        title={selectedEntry?.title || 'Journal Entry'}
        content={getModalContent()}
        showCopyButton={false}
        type="default"
        showDeleteButton={true}
        onDelete={handleDeleteEntry}
      />

      {/* Loading overlay when fetching entry details */}
      {isFetchingEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <div className="text-gray-700">Loading entry...</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;