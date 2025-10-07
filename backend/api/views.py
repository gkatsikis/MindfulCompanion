from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from django.contrib.auth import logout as django_logout
from django.views.decorators.http import require_http_methods


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
