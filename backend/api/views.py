from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from django.contrib.auth import logout as django_logout
from django.views.decorators.http import require_http_methods
from .models import JournalEntry

# DRF imports
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import JournalEntrySerializer, JournalEntryListSerializer


def test_connection(request):
    return JsonResponse({
        'message': 'Hello, it\s working MUTHAAA FUCKAAAA!',
        'status': 'Success'
    })


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

    def perform_create(self, serializer):
        """
        Automatically set the user when creating a new entry.
        The frontend doesn't need to send the user field - we get it from the session.
        """
        serializer.save(user=self.request.user)

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
