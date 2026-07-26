from django.utils import timezone
from rest_framework import generics, status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdmin, IsSupervisorOrAdmin
from .models import Incident
from .serializers import (
    EvidenceSerializer,
    EvidenceUploadSerializer,
    IncidentActionSerializer,
    IncidentCreateSerializer,
    IncidentListSerializer,
    IncidentSerializer,
)


class IncidentListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsSupervisorOrAdmin]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return IncidentCreateSerializer
        return IncidentListSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Incident.objects.select_related(
            'session', 'session__hall', 'camera'
        ).prefetch_related('evidence_items')

        status_filter = self.request.query_params.get('status')
        session_id = self.request.query_params.get('session')

        if status_filter:
            qs = qs.filter(status=status_filter)
        if session_id:
            qs = qs.filter(session_id=session_id)

        if user.role == user.Role.ADMIN:
            return qs
        return qs.filter(session__supervisors=user)


class IncidentDetailView(generics.RetrieveAPIView):
    permission_classes = [IsSupervisorOrAdmin]
    serializer_class = IncidentSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Incident.objects.select_related(
            'session', 'session__hall', 'camera', 'handled_by'
        ).prefetch_related('evidence_items', 'timeline')
        if user.role == user.Role.ADMIN:
            return qs
        return qs.filter(session__supervisors=user)


class IncidentActionView(APIView):
    permission_classes = [IsSupervisorOrAdmin]

    def post(self, request, pk):
        try:
            incident = Incident.objects.get(pk=pk)
        except Incident.DoesNotExist:
            return Response({'detail': 'Incident not found.'}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        if user.role != user.Role.ADMIN and not incident.session.supervisors.filter(id=user.id).exists():
            return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = IncidentActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        incident.status = serializer.validated_data['status']
        incident.supervisor_notes = serializer.validated_data.get('supervisor_notes', incident.supervisor_notes)
        incident.handled_by = user
        if incident.status in (
            Incident.Status.CONFIRMED,
            Incident.Status.WARNING,
            Incident.Status.DISMISSED,
        ):
            incident.resolved_at = timezone.now()
        incident.save()

        return Response({
            'message': 'Incident updated successfully.',
            'incident': IncidentSerializer(incident).data,
        })


class EvidenceUploadView(APIView):
    permission_classes = [IsSupervisorOrAdmin]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, pk):
        try:
            incident = Incident.objects.get(pk=pk)
        except Incident.DoesNotExist:
            return Response({'detail': 'Incident not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = EvidenceUploadSerializer(
            data=request.data,
            context={'incident': incident, 'request': request},
        )
        serializer.is_valid(raise_exception=True)
        evidence = serializer.save()

        return Response(
            EvidenceSerializer(evidence).data,
            status=status.HTTP_201_CREATED,
        )


class SeedDemoDataView(APIView):
    """Creates sample halls, sessions, and incidents for demo purposes."""
    permission_classes = [IsAdmin]

    def post(self, request):
        from datetime import timedelta

        from django.contrib.auth import get_user_model
        from exams.models import Camera, ExamHall, ExamSession

        from .models import Evidence, IncidentTimeline

        User = get_user_model()

        hall, _ = ExamHall.objects.get_or_create(
            name='Hall B',
            defaults={'location': 'Main Building, Floor 2', 'capacity': 60},
        )

        cam1, _ = Camera.objects.get_or_create(
            identifier='CAM-HB-01',
            defaults={'hall': hall, 'name': 'Camera 01 — Front', 'position': 'Front center', 'is_online': True},
        )
        cam2, _ = Camera.objects.get_or_create(
            identifier='CAM-HB-02',
            defaults={'hall': hall, 'name': 'Camera 02 — Rear Left', 'position': 'Rear left', 'is_online': True},
        )

        now = timezone.now()
        session, _ = ExamSession.objects.get_or_create(
            title='Mathematics Final Examination',
            hall=hall,
            defaults={
                'subject': 'Mathematics',
                'student_count': 48,
                'status': ExamSession.Status.LIVE,
                'start_time': now - timedelta(hours=1),
                'end_time': now + timedelta(hours=2),
                'created_by': request.user,
            },
        )

        supervisors = User.objects.filter(
            role=User.Role.SUPERVISOR,
            approval_status=User.ApprovalStatus.APPROVED,
        )
        if supervisors.exists():
            session.supervisors.set(supervisors)

        demo_incidents = [
            {
                'incident_type': Incident.Type.COPYING,
                'severity': Incident.Severity.HIGH,
                'confidence': 87,
                'seat_row': 3,
                'seat_number': 12,
                'description': 'Student repeatedly glancing at neighbor\'s paper.',
                'camera': cam1,
            },
            {
                'incident_type': Incident.Type.PEEKING,
                'severity': Incident.Severity.MEDIUM,
                'confidence': 62,
                'seat_row': 5,
                'seat_number': 7,
                'description': 'Sustained off-desk gaze detected.',
                'camera': cam2,
            },
            {
                'incident_type': Incident.Type.PHONE_USE,
                'severity': Incident.Severity.CRITICAL,
                'confidence': 94,
                'seat_row': 2,
                'seat_number': 18,
                'description': 'Mobile device visible under desk.',
                'camera': cam1,
            },
        ]

        created = 0
        for data in demo_incidents:
            incident, was_created = Incident.objects.get_or_create(
                session=session,
                seat_row=data['seat_row'],
                seat_number=data['seat_number'],
                defaults={
                    **data,
                    'detected_at': now - timedelta(minutes=created * 3 + 2),
                },
            )
            if was_created:
                IncidentTimeline.objects.create(
                    incident=incident,
                    event='AI detection triggered',
                    timestamp=incident.detected_at,
                )
                IncidentTimeline.objects.create(
                    incident=incident,
                    event='Evidence frame captured',
                    timestamp=incident.detected_at + timedelta(seconds=5),
                )
                created += 1

        return Response({
            'message': f'Demo data ready. {created} new incidents created.',
            'hall_id': hall.id,
            'session_id': session.id,
        })
