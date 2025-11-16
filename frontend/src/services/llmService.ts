import { getCSRFToken } from './authService';
import type { HelpType } from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Response from AI generation for anonymous users
 */
export interface AIResponse {
  message: string;
  ai_response: string;
  tokens_used: number;
  estimated_cost: number;
  help_type: HelpType;
}

/**
 * Response from AI generation for authenticated users (includes entry data)
 */
export interface AIResponseWithEntry {
  id: number;
  title: string;
  content: string;
  requested_help_type: HelpType | null;
  created_at: string;
  ai_response: string;
  tokens_used: number;
  estimated_cost: number;
}

/**
 * Error response when AI generation fails but entry was saved
 */
export interface AIErrorResponse {
  id: number;
  title: string;
  content: string;
  requested_help_type: HelpType | null;
  created_at: string;
  ai_error: string;
}

/**
 * Get AI response for anonymous users (no save to database)
 * Only works with acute help types (acute_validation, acute_skills)
 * 
 * @param content - The journal entry content
 * @param helpType - Type of help requested (must be acute_validation or acute_skills)
 * @returns AI response data including tokens and cost
 */
export const getAIResponse = async (
  content: string,
  helpType: HelpType
): Promise<AIResponse> => {
  try {
    const csrfToken = await getCSRFToken();
    
    const response = await fetch(`${BASE_URL}/api/journal-entries/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      credentials: 'include',
      body: JSON.stringify({
        content,
        requested_help_type: helpType,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      
      if (response.status === 403) {
        throw new Error('Anonymous users can only use acute_validation or acute_skills. Please sign in for advanced features.');
      }
      
      const errorMessage = errorData.error || `Failed to generate AI response: ${response.status}`;
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting AI response:', error);
    throw error;
  }
};

/**
 * Get AI response for authenticated users (saves entry + generates AI response)
 * Works with all help types
 * 
 * @param content - The journal entry content
 * @param helpType - Type of help requested (any valid HelpType)
 * @param title - Optional entry title
 * @returns Entry data with AI response, tokens, and cost
 */
export const getAIResponseWithSave = async (
  content: string,
  helpType: HelpType,
  title?: string
): Promise<AIResponseWithEntry | AIErrorResponse> => {
  try {
    const csrfToken = await getCSRFToken();
    
    const response = await fetch(`${BASE_URL}/api/journal-entries/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      credentials: 'include',
      body: JSON.stringify({
        content,
        title,
        requested_help_type: helpType,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.error || `Failed to create entry with AI response: ${response.status}`;
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting AI response with save:', error);
    throw error;
  }
};

/**
 * Check if a help type requires authentication
 * Acute types work for anonymous users, all others require login
 * 
 * @param helpType - The help type to check
 * @returns true if authentication is required
 */
export const requiresAuthentication = (helpType: HelpType): boolean => {
  const acuteTypes: HelpType[] = ['acute_validation', 'acute_skills'];
  return !acuteTypes.includes(helpType);
};

/**
 * Get the number of context entries used for a given help type
 * Useful for showing users what context window they're using
 * 
 * @param helpType - The help type
 * @returns Number of previous entries Claude will see
 */
export const getContextWindowSize = (helpType: HelpType): number => {
  const contextMap: Record<HelpType, number> = {
    'acute_validation': 0,
    'acute_skills': 0,
    'chronic_validation': 7,
    'chronic_education': 7,
    'max_validation': 30,
    'max_assessment': 30,
    'save_only': 0,
  };
  
  return contextMap[helpType] || 0;
};

/**
 * Get a human-readable description of what each help type does
 * Useful for UI tooltips or help text
 * 
 * @param helpType - The help type
 * @returns Description string
 */
export const getHelpTypeDescription = (helpType: HelpType): string => {
  const descriptions: Record<HelpType, string> = {
    'acute_validation': 'Immediate emotional validation for what you\'re feeling right now',
    'acute_skills': 'Quick coping techniques and strategies you can use immediately',
    'chronic_validation': 'Validation based on patterns in your recent entries (last 7 days)',
    'chronic_education': 'Understanding and insights about ongoing patterns in your mental health',
    'max_validation': 'Deep emotional pattern analysis based on your full journal history (30 entries)',
    'max_assessment': 'Comprehensive mental health assessment based on your journal history',
    'save_only': 'Save your entry without requesting AI support',
  };
  
  return descriptions[helpType] || 'Unknown help type';
};