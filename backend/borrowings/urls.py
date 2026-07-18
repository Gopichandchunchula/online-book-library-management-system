from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BorrowViewSet, ReservationViewSet, DashboardViewSet

router = DefaultRouter()
router.register(r'records', BorrowViewSet, basename='borrowing')
router.register(r'reservations', ReservationViewSet, basename='reservation')
router.register(r'dashboard', DashboardViewSet, basename='dashboard')

urlpatterns = [
    path('', include(router.urls)),
]
