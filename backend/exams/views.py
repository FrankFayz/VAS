from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdmin, IsApprovedUser, IsSupervisorOrAdmin
from .models import Camera, ExamHall, ExamSession
from .serializers import (
    CameraSerializer,
    ExamHallSerializer,
    ExamSessionCreateSerializer,
    ExamSessionSerializer,
)


class ExamHallListCreateView(generics.ListCreateAPIView):
    serializer_class = ExamHallSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdmin()]
        return [IsApprovedUser()]

    def get_queryset(self):
        return ExamHall.objects.prefetch_related('cameras').filter(is_active=True)


class ExamSessionListCreateView(generics.ListCreateAPIView):
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdmin()]
        return [IsSupervisorOrAdmin()]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ExamSessionCreateSerializer
        return ExamSessionSerializer

    def get_queryset(self):
        user = self.request.user
        qs = ExamSession.objects.select_related('hall').prefetch_related('supervisors')
        if user.role == user.Role.ADMIN:
            return qs
        return qs.filter(supervisors=user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ExamSessionDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = ExamSessionSerializer
    permission_classes = [IsSupervisorOrAdmin]

    def get_queryset(self):
        user = self.request.user
        qs = ExamSession.objects.select_related('hall').prefetch_related('supervisors')
        if user.role == user.Role.ADMIN:
            return qs
        return qs.filter(supervisors=user)


class LiveSessionsView(generics.ListAPIView):
    permission_classes = [IsSupervisorOrAdmin]
    serializer_class = ExamSessionSerializer

    def get_queryset(self):
        user = self.request.user
        qs = ExamSession.objects.filter(status=ExamSession.Status.LIVE).select_related('hall')
        if user.role == user.Role.ADMIN:
            return qs
        return qs.filter(supervisors=user)


class CameraListCreateView(generics.ListCreateAPIView):
    serializer_class = CameraSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdmin()]
        return [IsApprovedUser()]

    def get_queryset(self):
        hall_id = self.request.query_params.get('hall')
        qs = Camera.objects.select_related('hall')
        if hall_id:
            qs = qs.filter(hall_id=hall_id)
        return qs


class DashboardStatsView(APIView):
    permission_classes = [IsSupervisorOrAdmin]

    def get(self, request):
        from incidents.models import Incident

        user = request.user
        sessions = ExamSession.objects.filter(status=ExamSession.Status.LIVE)
        incidents = Incident.objects.filter(status=Incident.Status.NEW)

        if user.role != user.Role.ADMIN:
            sessions = sessions.filter(supervisors=user)
            incidents = incidents.filter(session__supervisors=user)

        return Response({
            'live_sessions': sessions.count(),
            'new_incidents': incidents.count(),
            'total_students': sum(s.student_count for s in sessions),
            'online_cameras': Camera.objects.filter(is_online=True).count(),
        })
