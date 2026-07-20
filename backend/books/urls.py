from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookViewSet, SuggestionViewSet, preview_status_view

router = DefaultRouter()
router.register(r'catalog', BookViewSet, basename='book')
router.register(r'suggestions', SuggestionViewSet, basename='suggestion')

urlpatterns = [
    path('previews/status/', preview_status_view, name='preview_status'),
    path('', include(router.urls)),
]

