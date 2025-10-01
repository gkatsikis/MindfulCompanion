from django.urls import path
from . import views

urlpatterns = [
    path('test/', views.test_connection, name='test_connection'),
    path('csrf/', views.csrf_token_view, name='csrf_token'),
    path('user/', views.user_info_view, name='user_info'),
]
