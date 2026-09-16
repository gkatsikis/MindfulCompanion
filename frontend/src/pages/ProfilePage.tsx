import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PenLine } from 'lucide-react';
import Calendar from '../components/Calendar';
import Header from '../components/Header';
import ContentModal from '../components/ContentModal';
import { getJournalEntries, getJournalEntry, deleteJournalEntry } from '../services/journalService';
import { isInMonth, formatEntryDate } from '../lib/entries';
import type { JournalEntryListItem, JournalEntry } from '../types';

const ProfilePage: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntryListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isFetchingEntry, setIsFetchingEntry] = useState(false);

  const loadMonth = async () => {
    const all = await getJournalEntries();
    setEntries(all.filter((entry) => isInMonth(entry, currentDate)));
  };

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    getJournalEntries()
      .then((all) => {
        if (cancelled) return;
        setEntries(all.filter((entry) => isInMonth(entry, currentDate)));
        setError(null);
      })
      .catch((err) => {
        console.error('Error fetching entries:', err);
        if (!cancelled) setError('Your entries could not be loaded just now.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [currentDate]);

  const handleMonthChange = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setDate(1);
      next.setMonth(next.getMonth() + (direction === 'prev' ? -1 : 1));
      return next;
    });
  };

  const handleEntryClick = async (entry: JournalEntryListItem) => {
    try {
      setIsFetchingEntry(true);
      setSelectedEntry(await getJournalEntry(entry.id));
    } catch (err) {
      console.error('Error fetching full entry:', err);
      setError('That entry could not be opened.');
    } finally {
      setIsFetchingEntry(false);
    }
  };

  const handleDeleteEntry = async () => {
    if (!selectedEntry) return;
    try {
      await deleteJournalEntry(selectedEntry.id);
      setSelectedEntry(null);
      await loadMonth();
    } catch (err) {
      console.error('Error deleting entry:', err);
      setError('That entry could not be deleted.');
    }
  };

  const monthLabel = currentDate.toLocaleDateString(undefined, { month: 'long' });

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-12">
        <Header />
      </div>

      <div className="mb-8">
        <h1 className="font-display font-light text-4xl text-ink">
          Your journal, <em className="text-dawn-deep">so far</em>
        </h1>
        <p className="mt-2 text-ink-soft">Each marked day holds an entry. Open one to revisit it.</p>
      </div>

      {error && (
        <div role="alert" className="bg-alert-soft ring-1 ring-alert/20 text-alert px-5 py-4 rounded-2xl mb-6">
          {error}
        </div>
      )}

      {!isLoading && entries.length === 0 && (
        <div className="mb-6 bg-card rounded-3xl shadow-soft ring-1 ring-ink/5 px-6 sm:px-8 py-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-ink-soft">Nothing written in {monthLabel} yet.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-dawn-strong hover:bg-dawn-stronger text-white shadow-soft hover:shadow-lift transition-all"
          >
            <PenLine size={16} strokeWidth={1.75} />
            Write today's entry
          </Link>
        </div>
      )}

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

      <ContentModal
        show={selectedEntry !== null}
        onClose={() => setSelectedEntry(null)}
        title={selectedEntry?.title || (selectedEntry ? formatEntryDate(selectedEntry.created_at) : '')}
        subtitle={selectedEntry?.title ? formatEntryDate(selectedEntry.created_at) : undefined}
        content={selectedEntry?.content ?? ''}
        aiResponse={selectedEntry?.ai_interaction?.claude_response}
        type="journal-entry"
        showDeleteButton
        onDelete={handleDeleteEntry}
      />

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
