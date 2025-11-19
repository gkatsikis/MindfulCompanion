import pytest
from api.models import JournalEntry, AIInteraction, UserPreferences, User
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

@pytest.fixture
def api_client():
    """
    Provides a DRF APIClient for making test requests.
    """
    return APIClient()

@pytest.fixture
def user(db):
    """
    Creates a test user in the database.
    """
    return User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='testpass123',
        first_name='Test',
        last_name='User'
    )

@pytest.fixture
def user_with_preferences(user):
    """
    Creates a user with associated UserPreferences.
    """
    UserPreferences.objects.create(
        user=user,
        user_timezone='America/New_York',
        preferred_name='SadBoi'
    )
    return user


@pytest.fixture
def authenticated_client(api_client, user):
    """
    Provides an APIClient that's already logged in.
    """
    api_client.force_authenticate(user=user)
    return api_client

@pytest.fixture
def journal_entry(user):
    """
    Creates a basic journal entry for testing.
    """
    return JournalEntry.objects.create(
        user=user,
        title='Test Entry',
        content='This is a test journal entry.',
        requested_help_type='acute_validation'
    )

@pytest.fixture
def journal_entry_with_ai(journal_entry):
    """
    Creates a journal entry with an associated AI interaction.
    """
    AIInteraction.objects.create(
        journal_entry=journal_entry,
        claude_response='This is a test AI response.',
        context_entries_count=0,
        tokens_used=500,
        api_cost=0.0025
    )
    return journal_entry

@pytest.fixture
def multiple_journal_entries(user):
    """
    Creates multiple journal entries for context window testing.
    """
    entries = []
    for i in range(10):
        entry = JournalEntry.objects.create(
            user=user,
            title=f'Entry {i+1}',
            content=f'Content for entry {i+1}',
            requested_help_type='chronic_validation'
        )
        entries.append(entry)
    return entries