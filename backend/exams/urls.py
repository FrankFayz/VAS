from django.urls import path

from .views import (
    CameraListCreateView,
    DashboardStatsView,
    ExamHallListCreateView,
    ExamSessionDetailView,
    ExamSessionListCreateView,
    LiveSessionsView,
)

urlpatterns = [
    path('halls/', ExamHallListCreateView.as_view(), name='exam-halls'),
    path('sessions/', ExamSessionListCreateView.as_view(), name='exam-sessions'),
    path('sessions/live/', LiveSessionsView.as_view(), name='live-sessions'),
    path('sessions/<int:pk>/', ExamSessionDetailView.as_view(), name='exam-session-detail'),
    path('cameras/', CameraListCreateView.as_view(), name='cameras'),
    path('dashboard-stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
]
