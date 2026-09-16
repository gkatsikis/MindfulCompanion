import pytest


class TestWwwRedirect:
    """www must 301 to the bare domain in a single hop.

    The middleware calls get_host(), which raises DisallowedHost before the
    redirect can run -- so the www host must stay in production ALLOWED_HOSTS.
    """

    @pytest.fixture(autouse=True)
    def allow_www_host(self, settings):
        settings.ALLOWED_HOSTS = ['localhost', 'www.localhost']

    def test_www_redirects_to_apex(self, client):
        response = client.get('/', HTTP_HOST='www.localhost')
        assert response.status_code == 301
        assert response['Location'] == 'http://localhost/'

    def test_www_redirect_preserves_path_and_query(self, client):
        response = client.get('/profile?a=1', HTTP_HOST='www.localhost')
        assert response['Location'] == 'http://localhost/profile?a=1'

    def test_apex_is_not_redirected(self, client):
        response = client.get('/', HTTP_HOST='localhost')
        assert response.status_code != 301


@pytest.mark.django_db
class TestRobotsTag:
    """Only the homepage and the crawl files may be indexed."""

    def test_homepage_is_indexable(self, client):
        response = client.get('/', HTTP_HOST='localhost')
        assert 'X-Robots-Tag' not in response

    def test_crawl_files_are_indexable(self, client):
        for path in ('/robots.txt', '/sitemap.xml'):
            response = client.get(path, HTTP_HOST='localhost')
            assert 'X-Robots-Tag' not in response, path

    def test_spa_route_is_noindex(self, client):
        response = client.get('/profile', HTTP_HOST='localhost')
        assert response['X-Robots-Tag'] == 'noindex, follow'

    def test_api_route_is_noindex(self, client):
        response = client.get('/api/', HTTP_HOST='localhost')
        assert response['X-Robots-Tag'] == 'noindex, follow'
