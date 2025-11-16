from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter

router = DefaultRouter()

router.register(r'journal-entries', views.JournalEntryViewSet, basename='journal-entry')
# GET    /api/journal-entries/           -> list all entries
# POST   /api/journal-entries/           -> create new entry
# GET    /api/journal-entries/{id}/      -> get single entry
# PUT    /api/journal-entries/{id}/      -> full update
# PATCH  /api/journal-entries/{id}/      -> partial update
# DELETE /api/journal-entries/{id}/      -> delete entry
# GET    /api/journal-entries/{id}/context_entries/ -> custom action

urlpatterns = [
    path('csrf/', views.csrf_token_view, name='csrf_token'),
    path('user/', views.user_info_view, name='user_info'),
    path('logout/', views.logout_view, name='api_logout'),

    path('', include(router.urls)),
]
