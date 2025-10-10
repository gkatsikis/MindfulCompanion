export type HelpType = 
  | 'acute_validation' 
  | 'acute_skills' 
  | 'chronic_education' 
  | 'chronic_validation' 
  | 'max_validation' 
  | 'max_assessment'
  | 'save_only';

export interface JournalEntry {
  id: number;
  title: string;
  content: string;
  requested_help_type: HelpType | null;
  is_continuation: boolean;
  references_past_entries: boolean;
  created_at: string;
  context_window_size: number;
  ai_interaction?: AIInteraction | null;
}

export interface AIInteraction {
  id: number;
  claude_response: string;
  context_entries_count: number;
  tokens_used: number | null;
  api_cost: string | null;
  created_at: string;
}

export interface JournalEntryListItem {
  id: number;
  title: string;
  content_preview: string;
  requested_help_type: HelpType | null;
  created_at: string;
}

export interface CreateJournalEntryData {
  title?: string;
  content: string;
  requested_help_type?: HelpType | null;
  is_continuation?: boolean;
  references_past_entries?: boolean;
}

export interface User {
  isLoggedIn: boolean;
}