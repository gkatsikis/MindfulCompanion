import pytest
from django.utils import timezone
from unittest.mock import patch, MagicMock
from api.models import JournalEntry, AIInteraction


# ============================================================================
# ANONYMOUS USER TESTS
# ============================================================================

@pytest.mark.django_db
class TestAnonymousUserJournalCreation:
    """
    Tests for anonymous users creating journal entries.
    
    Anonymous users can ONLY use acute_validation and acute_skills.
    Their entries are NOT saved to the database.
    """
    
    def test_anonymous_acute_validation_success(self, api_client):
        """
        Test that anonymous user can get AI response for acute_validation.
        
        This should return a 200 response with AI response in the data.
        """

        with patch('api.views.llm_service.generate_journal_response') as mock_llm:
            mock_llm.return_value = {
                'response': 'I hear that you are feeling anxious.',
                'tokens_used': 500,
                'estimated_cost': 0.0025
            }
            
            response = api_client.post('/api/journal-entries/', {
                'content': 'I feel anxious today',
                'requested_help_type': 'acute_validation'
            })
        
        assert response.status_code == 200
        assert 'ai_response' in response.data
        assert response.data['ai_response'] == 'I hear that you are feeling anxious.'
        assert response.data['tokens_used'] == 500
        assert response.data['help_type'] == 'acute_validation'

        assert JournalEntry.objects.count() == 0
    
    def test_anonymous_acute_skills_success(self, api_client):
        """
        Test that anonymous user can get AI response for acute_skills.
        """
        with patch('api.views.llm_service.generate_journal_response') as mock_llm:
            mock_llm.return_value = {
                'response': 'Try deep breathing.',
                'tokens_used': 300,
                'estimated_cost': 0.0020
            }
            
            response = api_client.post('/api/journal-entries/', {
                'content': 'I need coping strategies',
                'requested_help_type': 'acute_skills'
            })
        
        assert response.status_code == 200
        assert 'ai_response' in response.data
        assert JournalEntry.objects.count() == 0
    
    def test_anonymous_chronic_validation_forbidden(self, api_client):
        """
        Test that anonymous user CANNOT use chronic help types.
        
        Should return 403 Forbidden status.
        """
        response = api_client.post('/api/journal-entries/', {
            'content': 'I want chronic help',
            'requested_help_type': 'chronic_validation'
        })
        
        assert response.status_code == 403
        assert 'error' in response.data
        assert 'Sign in for advanced features' in response.data['error']
    
    def test_anonymous_max_validation_forbidden(self, api_client):
        """
        Test that anonymous user CANNOT use max help types.
        """
        response = api_client.post('/api/journal-entries/', {
            'content': 'I want max help',
            'requested_help_type': 'max_validation'
        })
        
        assert response.status_code == 403
        assert 'error' in response.data
    
    def test_anonymous_missing_help_type(self, api_client):
        """
        Test that anonymous user must provide help_type.
        """
        response = api_client.post('/api/journal-entries/', {
            'content': 'I need help'
        })
        
        assert response.status_code == 400
        assert 'error' in response.data
        assert 'Help Type is not present' in response.data['error']
    
    def test_anonymous_empty_content(self, api_client):
        """
        Test that content field is required.
        """
        response = api_client.post('/api/journal-entries/', {
            'content': '',
            'requested_help_type': 'acute_validation'
        })
        
        assert response.status_code == 400
        assert 'No content is present' in response.data['error']


# ============================================================================
# AUTHENTICATED USER TESTS - BASIC CRUD
# ============================================================================

@pytest.mark.django_db
class TestAuthenticatedUserJournalCreation:
    """
    Tests for authenticated users creating journal entries.
    
    Authenticated users can use ALL help types and entries are saved.
    """
    
    def test_save_only_no_ai_response(self, authenticated_client, user):
        """
        Test that user can save entry without AI response (save_only).
        
        This should create a JournalEntry but NO AIInteraction.
        """
        response = authenticated_client.post('/api/journal-entries/', {
            'content': 'Today was a good day',
            'title': 'Good Day',
            'requested_help_type': 'save_only'
        })
        
        assert response.status_code == 201
        assert JournalEntry.objects.count() == 1
        assert AIInteraction.objects.count() == 0
        
        entry = JournalEntry.objects.first()
        assert entry.content == 'Today was a good day'
        assert entry.title == 'Good Day'
        assert entry.user == user
        assert entry.requested_help_type is None  # save_only doesn't save help_type
    
    def test_save_without_help_type(self, authenticated_client, user):
        """
        Test that authenticated user can save without specifying help_type.
        """
        response = authenticated_client.post('/api/journal-entries/', {
            'content': 'Just journaling',
            'title': 'My Entry'
        })
        
        assert response.status_code == 201
        assert JournalEntry.objects.count() == 1
        assert AIInteraction.objects.count() == 0
    
    def test_acute_validation_with_save(self, authenticated_client, user):
        """
        Test authenticated user using acute_validation.
        
        Entry should be saved AND AI response generated.
        """
        with patch('api.views.llm_service.generate_journal_response') as mock_llm:
            mock_llm.return_value = {
                'response': 'I understand you are feeling stressed.',
                'tokens_used': 600,
                'estimated_cost': 0.0030
            }
            
            response = authenticated_client.post('/api/journal-entries/', {
                'user': user,
                'title': 'Stress4Lyfe',
                'content': 'I am stressed',
                'requested_help_type': 'acute_validation'
            })
        
        assert response.status_code == 201
        assert 'ai_response' in response.data
        assert response.data['ai_response'] == 'I understand you are feeling stressed.'
        
        # Verify database records
        assert JournalEntry.objects.count() == 1
        assert AIInteraction.objects.count() == 1
        
        entry = JournalEntry.objects.first()
        assert entry.requested_help_type == 'acute_validation'
        
        ai_interaction = AIInteraction.objects.first()
        assert ai_interaction.tokens_used == 600
        assert float(ai_interaction.api_cost) == 0.0030
        assert ai_interaction.context_entries_count == 0  # Acute has no context


# ============================================================================
# ONE-ENTRY-PER-DAY VALIDATION
# ============================================================================

@pytest.mark.django_db
class TestOneEntryPerDayLimit:
    """
    Tests for the one-entry-per-day business rule.
    """
    
    def test_second_entry_same_day_blocked(self, authenticated_client, user):
        """
        Test that user cannot create two entries on the same day.
        """
        # Create first entry
        JournalEntry.objects.create(
            user=user,
            content='First entry',
            title='Entry 1'
        )
        
        # Try to create second entry
        response = authenticated_client.post('/api/journal-entries/', {
            'content': 'Second entry',
            'title': 'Entry 2',
            'requested_help_type': 'save_only'
        })
        
        assert response.status_code == 400
        assert 'already written an entry today' in response.data['error']
        assert JournalEntry.objects.count() == 1  # Still only one entry


# ============================================================================
# CONTEXT WINDOW TESTS
# ============================================================================

@pytest.mark.django_db
class TestContextWindowLogic:
    """
    Tests for context window functionality (chronic and max help types).
    """
    
    def test_chronic_validation_includes_context(self, authenticated_client, user, multiple_journal_entries):
        """
        Test that chronic_validation includes previous 7 entries as context.
        
        The multiple_journal_entries fixture creates 10 entries.
        Chronic should fetch the 7 most recent ones.
        """

        with patch('api.views.llm_service.generate_journal_response') as mock_llm:
            mock_llm.return_value = {
                'response': 'Based on your recent entries...',
                'tokens_used': 1000,
                'estimated_cost': 0.0050
            }
            
            response = authenticated_client.post('/api/journal-entries/', {
                'user': user,
                'title': 'Repeat entry',
                'content': 'New entry needing context',
                'requested_help_type': 'chronic_validation'
            })
        assert response.status_code == 201
        
        mock_llm.assert_called_once()
        call_args = mock_llm.call_args
        
        context_entries = call_args.kwargs['context_entries']
        assert context_entries is not None
        assert len(context_entries) == 7
        
        ai_interaction = AIInteraction.objects.first()
        assert ai_interaction.context_entries_count == 7


# ============================================================================
# ERROR HANDLING TESTS
# ============================================================================

@pytest.mark.django_db
class TestErrorHandling:
    """
    Tests for error handling scenarios.
    """
    
    def test_ai_failure_still_saves_entry(self, authenticated_client, user):
        """
        Test that if AI generation fails, entry is still saved.
        
        This ensures users don't lose their journal content if Claude API fails.
        """
        with patch('api.views.llm_service.generate_journal_response') as mock_llm:
            mock_llm.side_effect = Exception('API timeout')
            
            response = authenticated_client.post('/api/journal-entries/', {
                'user': user,
                'title': 'Listen Here',
                'content': 'Important journal entry',
                'requested_help_type': 'acute_validation'
            })
        
        assert response.status_code == 201
        assert 'ai_error' in response.data
        assert 'Entry saved, but AI response failed' in response.data['ai_error']
        
        # Entry should still be saved
        assert JournalEntry.objects.count() == 1
        assert AIInteraction.objects.count() == 0  # No AI interaction saved


# ============================================================================
# HELPER METHOD TESTS
# ============================================================================

@pytest.mark.django_db
class TestHelperMethods:
    """
    Tests for helper methods in views.
    """
    
    def test_get_context_for_entry_acute(self, user):
        """
        Test that acute help types return no context.
        """
        entry = JournalEntry.objects.create(
            user=user,
            content='Test',
            requested_help_type='acute_validation'
        )
        
        assert entry.get_context_window_size() == 0
        assert list(entry.get_context_entries()) == []
    
    def test_get_context_for_entry_chronic(self, user, multiple_journal_entries):
        """
        Test that chronic help types return 7 previous entries.
        """
        new_entry = JournalEntry.objects.create(
            user=user,
            content='New entry',
            requested_help_type='chronic_validation'
        )
        
        assert new_entry.get_context_window_size() == 7
        context = new_entry.get_context_entries()
        assert context.count() == 7