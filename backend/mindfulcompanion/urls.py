from django.conf import settings
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('allauth.urls')),
    # URLs out of the box:
    # /accounts/signup/
    # /accounts/login/
    # /accounts/logout/
    # /accounts/password/reset/
    # /accounts/google/login/
    # /accounts/profile/
    path('api/', include('api.urls')),
]

# Same-origin deploy: serve the built React app for any non-API route.
# frontend_dist only exists in the production image, so dev is unaffected.
if settings.FRONTEND_DIST.exists():
    urlpatterns += [
        re_path(r'^(?!api/|admin/|accounts/|static/).*$',
                TemplateView.as_view(template_name='index.html')),
    ]
