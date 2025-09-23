from django.http import JsonResponse


def test_connection(request):
    return JsonResponse({
        'message': 'Hello, it\s working MUTHAAA FUCKAAAA!',
        'status': 'Success'
    })
