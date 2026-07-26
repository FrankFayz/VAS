from rest_framework import generics
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
        qs = ExamHall.objects.prefetch_related('cameras').order_by('name')
        user = self.request.user
        include_inactive = self.request.query_params.get('include_inactive') == '1'
        if user.role == user.Role.ADMIN and include_inactive:
            return qs
        return qs.filter(is_active=True)


class ExamHallDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ExamHallSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        return ExamHall.objects.prefetch_related('cameras').all()

    def perform_destroy(self, instance):
        # Soft-delete so history stays intact
        instance.is_active = False
        instance.save(update_fields=['is_active'])


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
        qs = ExamSession.objects.select_related('hall').prefetch_related('supervisors')
        hall_id = self.request.query_params.get('hall')
        if hall_id:
            qs = qs.filter(hall_id=hall_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ExamSessionDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = ExamSessionSerializer
    permission_classes = [IsSupervisorOrAdmin]

    def get_queryset(self):
        return ExamSession.objects.select_related('hall').prefetch_related('supervisors')


class LiveSessionsView(generics.ListAPIView):
    permission_classes = [IsSupervisorOrAdmin]
    serializer_class = ExamSessionSerializer

    def get_queryset(self):
        qs = ExamSession.objects.filter(status=ExamSession.Status.LIVE).select_related('hall')
        hall_id = self.request.query_params.get('hall')
        if hall_id:
            qs = qs.filter(hall_id=hall_id)
        return qs


class CameraListCreateView(generics.ListCreateAPIView):
    serializer_class = CameraSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdmin()]
        return [IsApprovedUser()]

    def get_queryset(self):
        hall_id = self.request.query_params.get('hall')
        qs = Camera.objects.select_related('hall').order_by('name')
        if hall_id:
            qs = qs.filter(hall_id=hall_id)
        return qs


class CameraDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CameraSerializer
    permission_classes = [IsAdmin]
    queryset = Camera.objects.select_related('hall').all()


class DashboardStatsView(APIView):
    permission_classes = [IsSupervisorOrAdmin]

    def get(self, request):
        from incidents.models import Incident

        hall_id = request.query_params.get('hall')
        sessions = ExamSession.objects.filter(status=ExamSession.Status.LIVE)
        incidents = Incident.objects.filter(status=Incident.Status.NEW)
        cameras = Camera.objects.filter(is_online=True)

        if hall_id:
            sessions = sessions.filter(hall_id=hall_id)
            incidents = incidents.filter(session__hall_id=hall_id)
            cameras = cameras.filter(hall_id=hall_id)

        return Response({
            'live_sessions': sessions.count(),
            'new_incidents': incidents.count(),
            'total_students': sum(s.student_count for s in sessions),
            'online_cameras': cameras.count(),
            'hall_id': int(hall_id) if hall_id else None,
        })
