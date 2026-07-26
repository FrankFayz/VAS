from django.urls import path

from .views import (
    EvidenceUploadView,
    IncidentActionView,
    IncidentDetailView,
    IncidentListCreateView,
    SeedDemoDataView,
)

urlpatterns = [
    path('', IncidentListCreateView.as_view(), name='incidents'),
    path('<int:pk>/', IncidentDetailView.as_view(), name='incident-detail'),
    path('<int:pk>/action/', IncidentActionView.as_view(), name='incident-action'),
    path('<int:pk>/evidence/', EvidenceUploadView.as_view(), name='evidence-upload'),
    path('seed-demo/', SeedDemoDataView.as_view(), name='seed-demo'),
]
