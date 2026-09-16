// Runs on Node's built-in runner with native TS stripping: `npm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { groupEntriesByDay, isInMonth, byCreatedDesc } from '../src/lib/entries.ts';
import type { JournalEntryListItem } from '../src/types/index.ts';

const entry = (id: number, when: Date): JournalEntryListItem => ({
  id,
  title: '',
  content_preview: `entry ${id}`,
  requested_help_type: null,
  created_at: when.toISOString(),
});

test('several entries on one day all survive grouping, oldest first', () => {
  const morning = entry(1, new Date(2026, 8, 16, 9));
  const evening = entry(2, new Date(2026, 8, 16, 21));
  const other = entry(3, new Date(2026, 8, 3, 12));

  const byDay = groupEntriesByDay([evening, other, morning]);

  assert.equal(byDay.size, 2);
  assert.deepEqual(byDay.get(16)?.map((e) => e.id), [1, 2]);
  assert.deepEqual(byDay.get(3)?.map((e) => e.id), [3]);
});

test('isInMonth matches year and month, not just month', () => {
  const sept2026 = new Date(2026, 8, 1);
  assert.equal(isInMonth(entry(1, new Date(2026, 8, 30, 23)), sept2026), true);
  assert.equal(isInMonth(entry(2, new Date(2025, 8, 15)), sept2026), false);
  assert.equal(isInMonth(entry(3, new Date(2026, 9, 1, 0, 0, 1)), sept2026), false);
});

test('byCreatedDesc puts the newest entry first', () => {
  const sorted = [entry(1, new Date(2026, 0, 1)), entry(2, new Date(2026, 0, 3)), entry(3, new Date(2026, 0, 2))]
    .sort(byCreatedDesc)
    .map((e) => e.id);
  assert.deepEqual(sorted, [2, 3, 1]);
});
