"""
LLM Service for MindfulCompanion
Handles AI interactions using LiteLLM for multi-model support
"""

from litellm import completion
from django.conf import settings
from typing import List, Dict, Optional
import logging

logger = logging.getLogger(__name__)


class LLMService:
    """
    Service class for handling AI model interactions.
    Uses LiteLLM to support multiple AI providers (Claude, GPT-4, Gemini, etc.)
    """
    
    def __init__(self):
        self.model = settings.AI_MODEL
        self.api_key = settings.ANTHROPIC_API_KEY
        
    def generate_journal_response(
        self,
        current_entry_content: str,
        help_type: str,
        context_entries: List[Dict] = None,
        user_name: Optional[str] = None
    ) -> Dict:
        """
        Generate an AI response to a journal entry based on the requested help type.
        
        Args:
            current_entry_content: The text content of the current journal entry
            help_type: Type of help requested (acute_validation, chronic_education, etc.)
            context_entries: List of previous journal entries for context (if applicable)
            user_name: User's preferred name for personalization
            
        Returns:
            Dict with 'response', 'tokens_used', and 'estimated_cost'
        """
        
        # Build the system prompt based on help type
        system_prompt = self._build_system_prompt(help_type, user_name)
        
        # Build the user message with context
        user_message = self._build_user_message(current_entry_content, context_entries)
        
        try:
            # Call LiteLLM with the constructed prompts
            response = completion(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                api_key=self.api_key,
                temperature=0.7,  # Balanced creativity vs consistency
                max_tokens=1000   # Reasonable response length
            )
            
            # Extract response details
            ai_response = response.choices[0].message.content
            prompt_tokens = response.usage.prompt_tokens      # Input tokens
            completion_tokens = response.usage.completion_tokens  # Output tokens
            total_tokens = response.usage.total_tokens      
            estimated_cost = self._calculate_cost(prompt_tokens, completion_tokens)
            
            logger.info(f"Generated response for help_type={help_type}, tokens={total_tokens}")
            
            return {
                'response': ai_response,
                'tokens_used': total_tokens,
                'estimated_cost': estimated_cost
            }
            
        except Exception as e:
            logger.error(f"Error generating AI response: {str(e)}")
            raise Exception(f"Failed to generate AI response: {str(e)}")
    
    def _build_system_prompt(self, help_type: str, user_name: Optional[str] = None) -> str:
        """
        Build the system prompt that defines Claude's role and behavior.
        This is like giving Claude its "job description" for this conversation.
        """
        
        # Personalization
        name_part = f" You may address them as {user_name}." if user_name else ""
        
        # Base prompt - Claude's core identity
        base_prompt = f"""You are a compassionate and professional mental health support assistant for MindfulCompanion, a journaling application.{name_part}

Your role is to provide thoughtful, empathetic, and helpful responses to users' journal entries. You are not a replacement for professional therapy, but you offer validation, coping strategies, and educational insights about mental health.

Always:
- Be warm, non-judgmental, and validating
- Use clear, accessible language, minimal jargon except for educational responses
- Acknowledge the user's feelings and experiences
- Respect boundaries (you're a support tool, not a therapist)

Never:
- Provide medical diagnoses
- Prescribe medications or treatments
- Make the user feel judged or dismissed
- Give advice that could be harmful
"""

        # Add help-type-specific instructions
        help_type_prompts = {
            'acute_validation': """
CURRENT TASK: Provide immediate emotional validation for this journal entry.

Focus on:
- Acknowledging their current feelings
- Normalizing their experience by connecting them with their common humanity
- Offering gentle reassurance
- Being present and helping them be mindful of their emotions
- Connecting them with a sense of self-kindness

Keep your response focused on the present moment. You have no access to their history.
""",
            'acute_skills': """
CURRENT TASK: Provide quick, practical coping techniques for this journal entry.

Focus on:
- Specific, actionable coping strategies
- Grounding or calming techniques based on mindfulness, self-compassion, or any other clinically validated technique
- Skills they can use right now
- Clear step-by-step instructions that are easy to understand for someone who may be triggered
- Err on the side of being brief and explaining coping skills first in a small snippet

Keep your response practical and immediately applicable. You have no access to their history.
""",
            'chronic_validation': """
CURRENT TASK: Validate ongoing patterns you see in their recent journal entries.

Focus on:
- Recognizing recurring themes or emotions
- Validating their journey over time
- Acknowledging progress or struggles
- Normalizing patterns in their experience using elements of common humanity

You have access to their last 7 journal entries for context.
""",
            'chronic_education': """
CURRENT TASK: Help them understand patterns in their mental health over time.

Focus on:
- Explaining common mental health concepts that may be applicable to them
- Helping them see connections between entries to foster self-awareness
- Providing psychoeducation about their experiences in order to give them context for what they may be experiencing
- Offering frameworks for understanding their patterns
- Suggesting therapy or a particular therapeutic style that might suit them considering their specific context if necessary

You have access to their last 7 journal entries for context.
""",
            'max_validation': """
CURRENT TASK: Provide deep validation based on comprehensive understanding of their journey.

Focus on:
- Deep pattern recognition across their entries that may not be obvious from a shorter perspective
- Validating their long-term emotional journey
- Acknowledging growth, setbacks, and resilience
- Reflecting on major themes in their experience

You have access to their last 30 journal entries for comprehensive context.
""",
            'max_assessment': """
CURRENT TASK: Provide a thoughtful assessment of their mental health patterns over time.

Focus on:
- Identifying significant patterns and themes that may not be obvious from a shorter perspective
- Noting potential areas of concern or growth
- Offering insights about their mental health journey
- Suggesting areas they might want to explore further (with a professional if needed) and what therapeutic modality may suit them

You have access to their last 30 journal entries for comprehensive context.

IMPORTANT: This is an assessment for self-reflection, not a clinical diagnosis. Encourage professional support if you see concerning patterns.
"""
        }
        
        return base_prompt + help_type_prompts.get(help_type, '')
    
    def _build_user_message(
        self,
        current_entry: str,
        context_entries: List[Dict] = None
    ) -> str:
        """
        Build the user message that includes the current entry and any historical context.
        
        Args:
            current_entry: The current journal entry text
            context_entries: List of dicts with 'created_at', 'title', 'content' keys
        """
        
        message_parts = []
        
        # Add context entries if provided
        if context_entries:
            message_parts.append("=== PREVIOUS JOURNAL ENTRIES (for context) ===\n")
            
            for idx, entry in enumerate(context_entries, 1):
                date = entry['created_at'].strftime('%B %d, %Y')
                title = entry.get('title', 'Untitled')
                content = entry['content']
                
                message_parts.append(f"Entry {idx} - {date}")
                if title:
                    message_parts.append(f"Title: {title}")
                message_parts.append(f"{content}\n")
                message_parts.append("---\n")
        
        # Add current entry
        message_parts.append("=== TODAY'S JOURNAL ENTRY ===\n")
        message_parts.append(current_entry)
        
        return "\n".join(message_parts)
    
    def _calculate_cost(self, prompt_tokens: int, completion_tokens: int) -> float:
        """
        Calculate estimated API cost based on token usage.
        
        Currently set for Anthropic Sonnet 4.5
        """
        
        input_cost_per_million = 3.00   # $3 per million input tokens
        output_cost_per_million = 15.00  # $15 per million output tokens
        
        # Calculates each separately, then sums them
        input_cost = (prompt_tokens / 1_000_000) * input_cost_per_million
        output_cost = (completion_tokens / 1_000_000) * output_cost_per_million
        
        return round(input_cost + output_cost, 6)


# Create a singleton instance to use throughout the app
llm_service = LLMService()