from django.http import HttpResponsePermanentRedirect


class WwwRedirectMiddleware:
    """301 www.* to the bare domain so sessions/CSRF live on a single origin."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        host = request.get_host()
        if host.startswith('www.'):
            return HttpResponsePermanentRedirect(
                f"{request.scheme}://{host[4:]}{request.get_full_path()}"
            )
        return self.get_response(request)
