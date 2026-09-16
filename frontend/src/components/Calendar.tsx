import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { JournalEntryListItem } from '../types';
import {
  groupEntriesByDay,
  byCreatedDesc,
  formatEntryTime,
  formatEntryDateShort,
} from '../lib/entries';

interface CalendarProps {
  entries: JournalEntryListItem[];
  currentDate: Date;
  onMonthChange: (direction: 'prev' | 'next') => void;
  onEntryClick: (entry: JournalEntryListItem) => void;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const navButton =
  'p-2.5 rounded-full text-ink-soft hover:text-ink hover:bg-mist transition-all cursor-pointer';

const Calendar: React.FC<CalendarProps> = ({ entries, currentDate, onMonthChange, onEntryClick }) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = new Date(year, month, 1).getDay();

  const byDay = groupEntriesByDay(entries);
  const recent = [...entries].sort(byCreatedDesc);

  const today = new Date();
  const isToday = (day: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  const cells: (number | null)[] = [
    ...Array<null>(leadingBlanks).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="bg-card rounded-3xl shadow-soft ring-1 ring-ink/5 p-5 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => onMonthChange('prev')} className={navButton} aria-label="Previous month">
          <ChevronLeft size={22} strokeWidth={1.75} />
        </button>
        <h2 className="font-display text-2xl font-light text-ink">
          {currentDate.toLocaleDateString(undefined, { month: 'long' })}{' '}
          <span className="text-ink-soft">{year}</span>
        </h2>
        <button onClick={() => onMonthChange('next')} className={navButton} aria-label="Next month">
          <ChevronRight size={22} strokeWidth={1.75} />
        </button>
      </div>

      {/* Phones: a list reads better than 45px squares */}
      <ul className="sm:hidden divide-y divide-ink/5">
        {recent.map((entry) => (
          <li key={entry.id}>
            <button
              onClick={() => onEntryClick(entry)}
              className="w-full text-left py-4 flex items-baseline gap-4 cursor-pointer rounded-xl"
            >
              <span className="shrink-0 w-16 text-sm text-ink-soft">
                {formatEntryDateShort(entry.created_at)}
              </span>
              <span className="min-w-0">
                {entry.title && <span className="block font-medium text-ink truncate">{entry.title}</span>}
                <span className="block text-sm text-ink-soft line-clamp-2 leading-snug">
                  {entry.content_preview}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {/* Wider screens: the month grid */}
      <div className="hidden sm:block">
        <div className="grid grid-cols-7 gap-2 mb-2">
          {DAY_NAMES.map((name) => (
            <div key={name} className="text-center text-xs uppercase tracking-widest text-ink-soft py-2">
              {name}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {cells.map((day, index) => {
            if (day === null) return <div key={`blank-${index}`} />;

            const dayEntries = byDay.get(day) ?? [];
            const ring = isToday(day)
              ? 'ring-1 ring-dawn/60'
              : dayEntries.length
                ? 'ring-1 ring-sky/20'
                : '';
            const surface = dayEntries.length ? 'bg-sky-soft' : 'bg-ink/[0.025]';

            return (
              <div key={day} className={`min-h-28 rounded-2xl p-2 ${surface} ${ring}`}>
                <div
                  className={`text-sm mb-1 ${
                    dayEntries.length
                      ? 'font-medium text-sky-deep'
                      : isToday(day)
                        ? 'font-medium text-dawn-strong'
                        : 'text-ink-soft'
                  }`}
                >
                  {day}
                </div>
                <div className="space-y-1">
                  {dayEntries.map((entry) => (
                    <button
                      key={entry.id}
                      onClick={() => onEntryClick(entry)}
                      className="w-full text-left rounded-lg px-1.5 py-1 hover:bg-card/80 transition-colors cursor-pointer"
                    >
                      {dayEntries.length > 1 && (
                        <span className="block text-[11px] text-sky-deep">
                          {formatEntryTime(entry.created_at)}
                        </span>
                      )}
                      <span className="block text-xs text-ink-soft leading-snug line-clamp-2">
                        {entry.title || entry.content_preview}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
