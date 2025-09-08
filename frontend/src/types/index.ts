export type HelpType = 'acute_validation' | 'acute_skills' | 'chronic_validation' | 'chronic_education' | 'save_only';
export type Page = 'journal' | 'profile';

export interface JournalEntry {
  title: string;
  content: string;
  helpType?: HelpType;
}

export interface User {
  isLoggedIn: boolean;
}