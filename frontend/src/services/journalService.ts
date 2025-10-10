import { getCSRFToken } from './authService';
import type {
  JournalEntry,
  JournalEntryListItem, 
  CreateJournalEntryData 
} from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create a new journal entry
export const createJournalEntry = async (
  data: CreateJournalEntryData
): Promise<JournalEntry> => {
  try {
    const csrfToken = await getCSRFToken();
    
    const response = await fetch(`${BASE_URL}/api/journal-entries/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `Failed to create entry: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating journal entry:', error);
    throw error;
  }
};

// Get all journal entries for the logged-in user
export const getJournalEntries = async (): Promise<JournalEntryListItem[]> => {
  try {
    const response = await fetch(`${BASE_URL}/api/journal-entries/`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch entries: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    throw error;
  }
};

// Get a single journal entry by ID with full details
export const getJournalEntry = async (id: number): Promise<JournalEntry> => {
  try {
    const response = await fetch(`${BASE_URL}/api/journal-entries/${id}/`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch entry: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching journal entry:', error);
    throw error;
  }
};

// Delete a journal entry
export const deleteJournalEntry = async (id: number): Promise<void> => {
  try {
    const csrfToken = await getCSRFToken();
    
    const response = await fetch(`${BASE_URL}/api/journal-entries/${id}/`, {
      method: 'DELETE',
      headers: {
        'X-CSRFToken': csrfToken,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete entry: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    throw error;
  }
};

// Get context entries for a specific journal entry
export const getContextEntries = async (id: number): Promise<{
  context_window_size: number;
  actual_entries_count: number;
  entries: JournalEntryListItem[];
}> => {
  try {
    const response = await fetch(`${BASE_URL}/api/journal-entries/${id}/context_entries/`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch context entries: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching context entries:', error);
    throw error;
  }
};