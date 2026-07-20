from django.contrib import admin
from django.urls import path, include
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from . import auth_views
from rest_framework.routers import DefaultRouter

schema_view = get_schema_view(
   openapi.Info(
      title="National Harold Campus Library (LibraManage) API",
      default_version='v1',
      description="Unified back-end server endpoint mapping for active circulation, asset holds, fine ledgers, and system configurations.",
      terms_of_service="https://www.libramanage.com/terms/",
      contact=openapi.Contact(email="support@libramanage.com"),
      license=openapi.License(name="Enterprise BSD License"),
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)

from django.conf import settings
from django.conf.urls.static import static

router = DefaultRouter()
router.register(r'users', auth_views.UserManagementViewSet, basename='user-management')

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Custom JWT Authentication routes
    path('api/auth/login/', auth_views.login_view, name='api_login'),
    path('api/auth/register/', auth_views.register_view, name='api_register'),
    path('api/auth/me/', auth_views.me_view, name='api_me'),
    path('api/auth/me/update/', auth_views.me_update_view, name='api_me_update'),
    
    # Missing endpoints
    path('api/profile/purchases/', auth_views.purchases_profile_view, name='api_profile_purchases'),
    path('api/purchases/all/', auth_views.purchases_all_view, name='api_purchases_all'),
    path('api/notifications/', auth_views.notifications_view, name='api_notifications'),
    
    # User Management ViewSet route
    path('api/', include(router.urls)),
    
    # Internal app routes
    path('api/books/', include('books.urls')),
    path('api/borrowings/', include('borrowings.urls')),
    
    # Swagger API Interactive documentation views
    path('swagger<format>/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

