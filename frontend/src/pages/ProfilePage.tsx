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
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-12">
        <Header
          onProfileClick={() => {}}
          onLoginClick={() => {}}
        />
      </div>

      <div className="mb-8">
        <h1 className="font-display font-light text-4xl text-ink">
          Your journal, <em className="text-dawn-deep">so far</em>
        </h1>
        <p className="mt-2 text-ink-soft">
          Each marked day holds an entry. Tap one to revisit it.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-800 px-5 py-4 rounded-2xl mb-6">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-card rounded-3xl shadow-soft ring-1 ring-ink/5 p-10 text-center">
          <span className="breathe text-ink-soft">Gathering your entries…</span>
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
        <div className="fade-in fixed inset-0 bg-dusk/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card rounded-2xl shadow-lift px-8 py-5">
            <span className="breathe text-ink-soft">Opening entry…</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;