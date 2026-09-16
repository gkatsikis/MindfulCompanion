from django.http import HttpResponsePermanentRedirect

# The SPA catch-all serves index.html (and its homepage canonical tag) for every
# non-API path, so only "/" may be indexed. Everything else gets X-Robots-Tag.
# The crawl files must stay untagged -- Google ignores a noindex sitemap.
INDEXABLE_PATHS = {'/', '/robots.txt', '/sitemap.xml', '/favicon.ico'}


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


class RobotsTagMiddleware:
    """Keep SPA routes and API responses out of the index."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if request.path not in INDEXABLE_PATHS and 'X-Robots-Tag' not in response:
            response['X-Robots-Tag'] = 'noindex, follow'
        return response
