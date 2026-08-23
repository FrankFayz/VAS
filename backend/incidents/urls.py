from django.urls import path

from .views import (
    CameraPcTestView,
    EvidenceDeleteView,
    EvidenceLibraryView,
    EvidenceUploadView,
    IncidentActionView,
    IncidentDetailView,
    IncidentListCreateView,
)

urlpatterns = [
    path('', IncidentListCreateView.as_view(), name='incidents'),
    path('evidence/', EvidenceLibraryView.as_view(), name='evidence-library'),
    path('camera-pc-test/', CameraPcTestView.as_view(), name='camera-pc-test'),
    path('<int:pk>/', IncidentDetailView.as_view(), name='incident-detail'),
    path('<int:pk>/action/', IncidentActionView.as_view(), name='incident-action'),
    path('<int:pk>/evidence/', EvidenceUploadView.as_view(), name='evidence-upload'),
    path(
        '<int:pk>/evidence/<int:evidence_id>/',
        EvidenceDeleteView.as_view(),
        name='evidence-delete',
    ),
]
