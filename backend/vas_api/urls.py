from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/exams/', include('exams.urls')),
    path('api/incidents/', include('incidents.urls')),
]
