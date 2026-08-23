from django.utils import timezone
from rest_framework import generics, status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdmin, IsSupervisorOrAdmin
from .models import Evidence, Incident, IncidentTimeline
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

        # Only camera-received incidents (must have stored evidence) — no demo/mimic rows
        qs = qs.filter(evidence_items__isnull=False).distinct()

        status_filter = self.request.query_params.get('status')
        session_id = self.request.query_params.get('session')
        hall_id = self.request.query_params.get('hall')

        if status_filter:
            qs = qs.filter(status=status_filter)
        if session_id:
            qs = qs.filter(session_id=session_id)
        if hall_id:
            qs = qs.filter(session__hall_id=hall_id)

        if user.role == user.Role.ADMIN:
            return qs
        return qs


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
        return qs


class IncidentActionView(APIView):
    permission_classes = [IsSupervisorOrAdmin]

    def post(self, request, pk):
        try:
            incident = Incident.objects.get(pk=pk)
        except Incident.DoesNotExist:
            return Response({'detail': 'Incident not found.'}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        if user.role != user.Role.ADMIN and user.approval_status != user.ApprovalStatus.APPROVED:
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
        else:
            incident.resolved_at = None
        incident.save()

        labels = {
            Incident.Status.CONFIRMED: 'Supervisor confirmed malpractice',
            Incident.Status.WARNING: 'Supervisor issued a warning',
            Incident.Status.WATCHING: 'Supervisor marked for continued watch',
            Incident.Status.DISMISSED: 'Supervisor dismissed as false alarm',
            Incident.Status.ESCALATED: 'Supervisor escalated the incident',
            Incident.Status.NEW: 'Incident reset to new',
        }
        IncidentTimeline.objects.create(
            incident=incident,
            event=labels.get(incident.status, f'Status set to {incident.status}'),
            timestamp=timezone.now(),
        )

        return Response({
            'message': 'Incident updated successfully.',
            'incident': IncidentSerializer(incident).data,
        })


class EvidenceUploadView(APIView):
    """
    Camera / system pipeline only — not for supervisors uploading from a phone/PC gallery.
    Admin PC-camera test and future edge agents post evidence here.
    """
    permission_classes = [IsAdmin]
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

        IncidentTimeline.objects.create(
            incident=incident,
            event='Camera evidence received',
            timestamp=timezone.now(),
        )

        return Response(
            EvidenceSerializer(evidence).data,
            status=status.HTTP_201_CREATED,
        )


class EvidenceDeleteView(APIView):
    """Admin or approved supervisor may delete camera evidence that is not worth keeping."""
    permission_classes = [IsSupervisorOrAdmin]

    def delete(self, request, pk, evidence_id):
        try:
            evidence = Evidence.objects.select_related('incident').get(
                pk=evidence_id,
                incident_id=pk,
            )
        except Evidence.DoesNotExist:
            return Response({'detail': 'Evidence not found.'}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        if user.role != user.Role.ADMIN and user.approval_status != user.ApprovalStatus.APPROVED:
            return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)

        public_id = evidence.cloudinary_public_id
        incident = evidence.incident
        evidence_pk = evidence.pk
        evidence.delete()

        if public_id:
            try:
                import cloudinary.uploader
                cloudinary.uploader.destroy(public_id, invalidate=True)
            except Exception:
                pass

        IncidentTimeline.objects.create(
            incident=incident,
            event=f'Evidence #{evidence_pk} deleted by {user.full_name or user.username}',
            timestamp=timezone.now(),
        )

        return Response({'message': 'Evidence deleted.', 'id': evidence_pk})


class EvidenceLibraryView(APIView):
    """Stored camera evidence for admin review until deleted."""
    permission_classes = [IsAdmin]

    def get(self, request):
        qs = (
            Evidence.objects.select_related(
                'incident',
                'incident__session',
                'incident__session__hall',
                'incident__camera',
            )
            .order_by('-captured_at')
        )
        hall_id = request.query_params.get('hall')
        if hall_id:
            qs = qs.filter(incident__session__hall_id=hall_id)

        results = []
        for ev in qs[:200]:
            results.append({
                'id': ev.id,
                'incident_id': ev.incident_id,
                'media_type': ev.media_type,
                'cloudinary_url': ev.cloudinary_url,
                'thumbnail_url': ev.thumbnail_url or ev.cloudinary_url,
                'caption': ev.caption,
                'captured_at': ev.captured_at,
                'hall_name': ev.incident.session.hall.name,
                'session_title': ev.incident.session.title,
                'camera_name': ev.incident.camera.name if ev.incident.camera else None,
                'seat_label': ev.incident.seat_label,
                'incident_status': ev.incident.status,
            })
        return Response({'count': len(results), 'results': results})


class CameraPcTestView(APIView):
    """
    Admin PC-camera test path.
    Captures a frame from the admin browser (PC webcam), uploads evidence,
    and creates a real incident for that camera's room so supervisors can verify the pipeline.
    """
    permission_classes = [IsAdmin]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        from datetime import timedelta

        import cloudinary.uploader
        from exams.models import Camera, ExamSession

        camera_id = request.data.get('camera')
        upload = request.FILES.get('file')
        if not camera_id:
            return Response({'detail': 'camera is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if not upload:
            return Response({'detail': 'file is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            camera = Camera.objects.select_related('hall').get(pk=camera_id)
        except Camera.DoesNotExist:
            return Response({'detail': 'Camera not found.'}, status=status.HTTP_404_NOT_FOUND)

        now = timezone.now()
        session = (
            ExamSession.objects.filter(
                hall=camera.hall,
                status=ExamSession.Status.LIVE,
            )
            .order_by('-start_time')
            .first()
        )
        if not session:
            session = ExamSession.objects.create(
                title=f'{camera.hall.name} — Live Monitoring',
                subject='Live Monitoring',
                hall=camera.hall,
                student_count=camera.hall.capacity or 0,
                status=ExamSession.Status.LIVE,
                start_time=now - timedelta(minutes=5),
                end_time=now + timedelta(hours=4),
                created_by=request.user,
            )

        try:
            upload_result = cloudinary.uploader.upload(
                upload,
                folder='vas/evidence',
                resource_type='image',
            )
        except Exception as exc:
            return Response(
                {'detail': f'Cloudinary upload failed: {exc}'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        public_id = upload_result.get('public_id', '')
        secure_url = upload_result.get('secure_url', '')
        thumbnail_url = secure_url
        if public_id:
            import cloudinary
            thumbnail_url = cloudinary.CloudinaryImage(public_id).build_url(
                width=480,
                crop='fill',
                quality='auto',
            )

        incident = Incident.objects.create(
            session=session,
            camera=camera,
            incident_type=Incident.Type.OTHER,
            status=Incident.Status.NEW,
            severity=Incident.Severity.MEDIUM,
            confidence=100,
            seat_row=1,
            seat_number=1,
            description=(
                f'PC camera test capture from {camera.name} ({camera.identifier})'
                + (f' @ {camera.ip_address}' if camera.ip_address else '')
            ),
            detected_at=now,
        )
        Evidence.objects.create(
            incident=incident,
            media_type=Evidence.MediaType.IMAGE,
            cloudinary_url=secure_url,
            cloudinary_public_id=public_id,
            thumbnail_url=thumbnail_url,
            file_size_bytes=upload_result.get('bytes'),
            caption='PC camera test frame',
            captured_at=now,
        )
        IncidentTimeline.objects.create(
            incident=incident,
            event='PC camera test capture received',
            timestamp=now,
        )
        IncidentTimeline.objects.create(
            incident=incident,
            event='Evidence uploaded to Cloudinary',
            timestamp=now,
        )

        camera.is_online = True
        camera.save(update_fields=['is_online'])

        return Response(
            {
                'message': 'Test capture sent. Supervisors in this room can now review it.',
                'incident_id': incident.id,
                'session_id': session.id,
                'hall_id': camera.hall_id,
                'hall_name': camera.hall.name,
                'camera_id': camera.id,
                'evidence_url': secure_url,
            },
            status=status.HTTP_201_CREATED,
        )
