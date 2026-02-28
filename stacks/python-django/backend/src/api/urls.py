from django.urls import path
from src.api import views

urlpatterns = [
    path("", views.root),
    path("health", views.health),
    path("api/hello", views.hello),
    path("api/echo", views.echo),
]
