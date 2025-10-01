from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import ensure_csrf_cookie


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
