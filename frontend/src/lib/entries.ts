import type { JournalEntryListItem } from '../types';

type Dated = { created_at: string };

export const byCreatedAsc = (a: Dated, b: Dated): number =>
  Date.parse(a.created_at) - Date.parse(b.created_at);

export const byCreatedDesc = (a: Dated, b: Dated): number => byCreatedAsc(b, a);

export const isInMonth = (entry: Dated, date: Date): boolean => {
  const d = new Date(entry.created_at);
  return d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth();
};

/** Entries keyed by day-of-month, oldest first within a day. Several entries on one day all survive. */
export const groupEntriesByDay = (
  entries: JournalEntryListItem[],
): Map<number, JournalEntryListItem[]> => {
  const byDay = new Map<number, JournalEntryListItem[]>();
  for (const entry of [...entries].sort(byCreatedAsc)) {
    const day = new Date(entry.created_at).getDate();
    byDay.set(day, [...(byDay.get(day) ?? []), entry]);
  }
  return byDay;
};

export const formatEntryTime = (iso: string): string =>
  new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

export const formatEntryDate = (iso: string): string =>
  new Date(iso).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

export const formatEntryDateShort = (iso: string): string =>
  new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
