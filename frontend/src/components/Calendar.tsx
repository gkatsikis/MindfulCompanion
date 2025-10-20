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

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Calendar Header with Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => onMonthChange('prev')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft size={24} className="text-gray-600" />
        </button>

        <h2 className="text-2xl font-light text-gray-800">
          {monthNames[month]} {year}
        </h2>

        <button
          onClick={() => onMonthChange('next')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Next month"
        >
          <ChevronRight size={24} className="text-gray-600" />
        </button>
      </div>

      {/* Day Names Header */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map(day => (
          <div
            key={day}
            className="text-center text-sm font-medium text-gray-500 py-2"
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

          return (
            <div
              key={day}
              className={`
                aspect-square border rounded-lg p-2 transition-all
                ${hasEntry 
                  ? 'border-blue-200 bg-blue-50 hover:bg-blue-100 cursor-pointer hover:shadow-md' 
                  : 'border-gray-200 bg-gray-50'
                }
              `}
              onClick={() => entry && onEntryClick(entry)}
            >
              {/* Day Number */}
              <div className={`
                text-sm font-medium mb-1
                ${hasEntry ? 'text-blue-700' : 'text-gray-400'}
              `}>
                {day}
              </div>

              {/* Entry Preview */}
              {hasEntry && entry && (
                <div className="text-xs text-gray-600 line-clamp-3 overflow-hidden">
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