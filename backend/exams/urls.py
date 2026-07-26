from django.urls import path

from .views import (
    CameraDetailView,
    CameraListCreateView,
    DashboardStatsView,
    ExamHallDetailView,
    ExamHallListCreateView,
    ExamSessionDetailView,
    ExamSessionListCreateView,
    LiveSessionsView,
)

urlpatterns = [
    path('halls/', ExamHallListCreateView.as_view(), name='exam-halls'),
    path('halls/<int:pk>/', ExamHallDetailView.as_view(), name='exam-hall-detail'),
    path('sessions/', ExamSessionListCreateView.as_view(), name='exam-sessions'),
    path('sessions/live/', LiveSessionsView.as_view(), name='live-sessions'),
    path('sessions/<int:pk>/', ExamSessionDetailView.as_view(), name='exam-session-detail'),
    path('cameras/', CameraListCreateView.as_view(), name='cameras'),
    path('cameras/<int:pk>/', CameraDetailView.as_view(), name='camera-detail'),
    path('dashboard-stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
]
