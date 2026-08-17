import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { JournalEntryListItem } from '../types';

interface CalendarProps {
  entries: JournalEntryListItem[];
  currentDate: Date;
  onMonthChange: (direction: 'prev' | 'next') => void;
  onEntryClick: (entry: JournalEntryListItem) => void;
}

const Calendar: React.FC<CalendarProps> = ({
  entries,
  currentDate,
  onMonthChange,
  onEntryClick,
}) => {
  // Get the first day of the month and total days in month
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday

  // Month names for display
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Day names
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Create a map of entries by day for quick lookup
  const entriesByDay = new Map<number, JournalEntryListItem>();
  entries.forEach(entry => {
    const entryDate = new Date(entry.created_at);
    const day = entryDate.getDate();
    entriesByDay.set(day, entry);
  });

  // Generate calendar grid
  const calendarDays: (number | null)[] = [];
  
  // Add empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === month;

  return (
    <div className="bg-card rounded-3xl shadow-soft ring-1 ring-ink/5 p-6 sm:p-8">
      {/* Calendar Header with Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => onMonthChange('prev')}
          className="p-2.5 rounded-full text-ink-soft hover:text-ink hover:bg-mist transition-all cursor-pointer"
          aria-label="Previous month"
        >
          <ChevronLeft size={22} strokeWidth={1.75} />
        </button>

        <h2 className="font-display text-2xl font-light text-ink">
          {monthNames[month]} <span className="text-ink-soft">{year}</span>
        </h2>

        <button
          onClick={() => onMonthChange('next')}
          className="p-2.5 rounded-full text-ink-soft hover:text-ink hover:bg-mist transition-all cursor-pointer"
          aria-label="Next month"
        >
          <ChevronRight size={22} strokeWidth={1.75} />
        </button>
      </div>

      {/* Day Names Header */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map(day => (
          <div
            key={day}
            className="text-center text-xs uppercase tracking-widest text-ink-soft py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, index) => {
          if (day === null) {
            // Empty cell before month starts
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const entry = entriesByDay.get(day);
          const hasEntry = !!entry;
          const isToday = isCurrentMonth && day === today.getDate();

          return (
            <div
              key={day}
              className={`
                aspect-square rounded-2xl p-2 transition-all
                ${hasEntry
                  ? 'bg-sky-soft ring-1 ring-sky/20 hover:ring-sky/40 cursor-pointer hover:shadow-soft hover:-translate-y-0.5'
                  : 'bg-ink/[0.025]'
                }
                ${isToday ? 'ring-1 ring-dawn/50' : ''}
              `}
              onClick={() => entry && onEntryClick(entry)}
            >
              {/* Day Number */}
              <div className="flex items-center gap-1 mb-1">
                <span className={`text-sm ${hasEntry ? 'font-medium text-sky-deep' : isToday ? 'font-medium text-dawn-deep' : 'text-ink-soft/70'}`}>
                  {day}
                </span>
                {hasEntry && <span className="w-1.5 h-1.5 rounded-full bg-dawn" />}
              </div>

              {/* Entry Preview */}
              {hasEntry && entry && (
                <div className="text-xs text-ink-soft line-clamp-3 overflow-hidden leading-snug">
                  {entry.content_preview}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;