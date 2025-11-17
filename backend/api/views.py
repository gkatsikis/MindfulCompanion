from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from django.contrib.auth import logout as django_logout
from django.views.decorators.http import require_http_methods
from django.utils import timezone
from .models import JournalEntry, AIInteraction
from .llm_service import llm_service

# DRF imports
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import ValidationError
from .serializers import JournalEntrySerializer, JournalEntryListSerializer

import logging

logger = logging.getLogger(__name__)



@ensure_csrf_cookie
def csrf_token_view(request):
    """
    Provides CSRF token for frontend requests
    """

    return JsonResponse({
        'csrfToken': get_token(request)
    })


def user_info_view(request):
    """
    Returns current user information
    """

    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Not authenticated'}, status=401)

    user = request.user
    return JsonResponse({
        'user': {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'date_joined': user.date_joined.isoformat()
        }
    })


@require_http_methods(["POST"])
def logout_view(request):
    """
    API endpoint to logout user and clear session.
    Designed for SPA usage (returns JSON, not HTML redirect).
    """
    if request.user.is_authenticated:
        django_logout(request)

    response = JsonResponse({'message': 'Logged out successfully'})

    response.delete_cookie('sessionid')
    response.delete_cookie('csrftoken')

    return response


class JournalEntryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for journal entry CRUD operations.

    A ViewSet automatically provides these actions:
    - list (GET /api/journal-entries/) - Get all entries for logged-in user
    - create (POST /api/journal-entries/) - Create new entry
    - retrieve (GET /api/journal-entries/{id}/) - Get single entry
    - update (PUT /api/journal-entries/{id}/) - Full update of entry
    - partial_update (PATCH /api/journal-entries/{id}/) - Partial update
    - destroy (DELETE /api/journal-entries/{id}/) - Delete entry
    """
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
    # Allow anyone to CREATE entries (for anonymous acute help)
    # But require login for list, retrieve, delete, etc.
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        """
        Use different serializers for list vs detail views.
        List view gets lighter serializer for better performance.
        """
        if self.action == 'list':
            return JournalEntryListSerializer
        return JournalEntrySerializer

    def get_queryset(self):
        """
        Filter entries to only show the logged-in user's entries.
        This is a security measure - users can only see their own entries.
        """
        return JournalEntry.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        """
        Create a new journal entry with optional AI response.
        Delegates to helper methods for cleaner code organization.
        """
        content = request.data.get('content', '').strip()
        title = request.data.get('title', '').strip()
        help_type = request.data.get('requested_help_type')

        if not content:
            return Response(
                {'error': 'No content is present'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not request.user.is_authenticated:
            return self._handle_anonymous_entry(content, help_type)
        else:
            return self._handle_authenticated_entry(request.user, content, title, help_type)
        
    def _handle_anonymous_entry(self, content, help_type):
        """
        Handle journal entry creation for anonymous users.
        Generates AI response without saving to database.
        """

        if not help_type:
            return Response(
                {'error': 'Help Type is not present (e.g. acute_validation or acute_skills)'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if help_type not in ['acute_validation', 'acute_skills']:
            return Response(
                {'error': 'Anonymous users can only use acute_validation or acute_skills help types. Sign in for advanced features.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            logger.info(f"Generating AI response for anonymous user with help_type={help_type}")
            
            ai_result = llm_service.generate_journal_response(
                current_entry_content=content,
                help_type=help_type,
                context_entries=None,
                user_name=None
            )

            return Response({
                'message': 'AI response generated (not saved)',
                'ai_response': ai_result['response'],
                'tokens_used': ai_result['tokens_used'],
                'estimated_cost': ai_result['estimated_cost'],
                'help_type': help_type
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error generating AI response for anonymous user: {str(e)}")
            return Response(
                {'error': f'Failed to generate AI response: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _handle_authenticated_entry(self, user, content, title, help_type):
        """
        Handle journal entry creation for authenticated users.
        Saves entry to database and optionally generates AI response.
        """
        # Check one-entry-per-day limit
        validation_error = self._validate_one_entry_per_day(user)
        if validation_error:
            return validation_error
        
        # Create the journal entry
        journal_entry = JournalEntry.objects.create(
            user=user,
            content=content,
            title=title if title else None,
            requested_help_type=help_type if help_type != 'save_only' else None
        )
        
        # If user chose "save_only", return entry without AI response
        if help_type == 'save_only' or not help_type:
            serializer = self.get_serializer(journal_entry)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        # Generate AI response
        return self._generate_and_save_ai_response(journal_entry, help_type, user)


    def _validate_one_entry_per_day(self, user):
        """
        Check if user has already created an entry today.
        Returns error Response if validation fails, None if passes.
        """
        today = timezone.now().date()
        existing_entry = JournalEntry.objects.filter(
            user=user,
            created_at__date=today
        ).exists()
        
        if existing_entry:
            return Response(
                {'error': "You've already written an entry today. Visit your profile to view or delete it."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return None


    def _generate_and_save_ai_response(self, journal_entry, help_type, user):
        """
        Generate AI response using Claude and save to database.
        Returns Response with entry data and AI response.
        """
        try:
            logger.info(f"Generating AI response for user={user.id}, entry={journal_entry.id}, help_type={help_type}")
            
            # Get context entries based on help type
            context_entries = self._get_context_for_entry(journal_entry)
            
            # Get user's preferred name if available
            user_name = self._get_user_preferred_name(user)
            
            # Call LLM service
            ai_result = llm_service.generate_journal_response(
                current_entry_content=journal_entry.content,
                help_type=help_type,
                context_entries=context_entries,
                user_name=user_name
            )
            
            # Save AI interaction to database
            AIInteraction.objects.create(
                journal_entry=journal_entry,
                claude_response=ai_result['response'],
                context_entries_count=len(context_entries) if context_entries else 0,
                tokens_used=ai_result['tokens_used'],
                api_cost=ai_result['estimated_cost']
            )
            
            logger.info(f"AI interaction saved: tokens={ai_result['tokens_used']}, cost=${ai_result['estimated_cost']:.6f}")
            
            # Return the entry with AI response
            serializer = self.get_serializer(journal_entry)
            response_data = serializer.data
            response_data['ai_response'] = ai_result['response']
            response_data['tokens_used'] = ai_result['tokens_used']
            response_data['estimated_cost'] = ai_result['estimated_cost']
            
            return Response(response_data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error generating AI response: {str(e)}", exc_info=True)
            
            # Entry was saved, but AI failed - return entry without AI response
            serializer = self.get_serializer(journal_entry)
            response_data = serializer.data
            response_data['ai_error'] = f'Entry saved, but AI response failed: {str(e)}'
            
            return Response(response_data, status=status.HTTP_201_CREATED)


    def _get_context_for_entry(self, journal_entry):
        """
        Get previous journal entries for AI context based on help type.
        Returns list of dicts or None if no context needed.
        """
        context_window_size = journal_entry.get_context_window_size()
        
        if context_window_size == 0:
            return None
        
        context_queryset = journal_entry.get_context_entries()
        return [
            {
                'created_at': entry.created_at,
                'title': entry.title,
                'content': entry.content
            }
            for entry in context_queryset
        ]


    def _get_user_preferred_name(self, user):
        """
        Get user's preferred name from preferences if available.
        Returns preferred name or None.
        """
        if hasattr(user, 'preferences') and user.preferences.preferred_name:
            return user.preferences.preferred_name
        return None

    @action(detail=True, methods=['get'])
    def context_entries(self, request, pk=None):
        """
        Custom endpoint to get the context entries for a specific journal entry.

        URL: GET /api/journal-entries/{id}/context_entries/

        This returns the previous entries that would be included when
        sending this entry to Claude for AI response.
        """
        entry = self.get_object()
        context_entries = entry.get_context_entries()

        serializer = JournalEntryListSerializer(context_entries, many=True)

        return Response({
            'context_window_size': entry.get_context_window_size(),
            'actual_entries_count': context_entries.count(),
            'entries': serializer.data
        })
