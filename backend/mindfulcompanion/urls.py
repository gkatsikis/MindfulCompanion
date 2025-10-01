from django.contrib import admin
from django.urls import path, include

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
