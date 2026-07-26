import cloudinary
import cloudinary.uploader
from django.utils import timezone
from rest_framework import serializers

from .models import Evidence, Incident, IncidentTimeline


class EvidenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evidence
        fields = [
            'id', 'media_type', 'cloudinary_url', 'cloudinary_public_id',
            'thumbnail_url', 'duration_seconds', 'caption', 'captured_at',
        ]


class TimelineSerializer(serializers.ModelSerializer):
    class Meta:
        model = IncidentTimeline
        fields = ['id', 'event', 'timestamp']


class IncidentSerializer(serializers.ModelSerializer):
    evidence_items = EvidenceSerializer(many=True, read_only=True)
    timeline = TimelineSerializer(many=True, read_only=True)
    seat_label = serializers.CharField(read_only=True)
    session_title = serializers.CharField(source='session.title', read_only=True)
    hall_name = serializers.CharField(source='session.hall.name', read_only=True)
    camera_name = serializers.CharField(source='camera.name', read_only=True, allow_null=True)
    handled_by_name = serializers.CharField(source='handled_by.full_name', read_only=True, allow_null=True)
    primary_evidence_url = serializers.SerializerMethodField()

    class Meta:
        model = Incident
        fields = [
            'id', 'session', 'session_title', 'hall_name', 'camera', 'camera_name',
            'incident_type', 'status', 'severity', 'confidence',
            'seat_row', 'seat_number', 'seat_label', 'description',
            'handled_by', 'handled_by_name', 'supervisor_notes',
            'detected_at', 'resolved_at', 'evidence_items', 'timeline',
            'primary_evidence_url', 'created_at',
        ]

    def get_primary_evidence_url(self, obj):
        evidence = obj.evidence_items.first()
        if evidence:
            return evidence.thumbnail_url or evidence.cloudinary_url
        return None


class IncidentListSerializer(serializers.ModelSerializer):
    seat_label = serializers.CharField(read_only=True)
    session_title = serializers.CharField(source='session.title', read_only=True)
    hall_name = serializers.CharField(source='session.hall.name', read_only=True)
    camera_name = serializers.CharField(source='camera.name', read_only=True, allow_null=True)
    primary_evidence_url = serializers.SerializerMethodField()

    class Meta:
        model = Incident
        fields = [
            'id', 'session', 'session_title', 'hall_name', 'camera_name',
            'incident_type', 'status', 'severity', 'confidence',
            'seat_row', 'seat_number', 'seat_label',
            'detected_at', 'primary_evidence_url',
        ]

    def get_primary_evidence_url(self, obj):
        evidence = obj.evidence_items.first()
        if evidence:
            return evidence.thumbnail_url or evidence.cloudinary_url
        return None


class IncidentActionSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Incident.Status.choices)
    supervisor_notes = serializers.CharField(required=False, allow_blank=True)


class IncidentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Incident
        fields = [
            'session', 'camera', 'incident_type', 'severity', 'confidence',
            'seat_row', 'seat_number', 'description', 'detected_at',
        ]


class EvidenceUploadSerializer(serializers.Serializer):
    file = serializers.FileField()
    media_type = serializers.ChoiceField(choices=Evidence.MediaType.choices)
    caption = serializers.CharField(required=False, allow_blank=True)
    captured_at = serializers.DateTimeField(required=False)

    def validate_file(self, value):
        max_size = 50 * 1024 * 1024  # 50MB
        if value.size > max_size:
            raise serializers.ValidationError('File too large. Maximum size is 50MB.')
        return value

    def create(self, validated_data):
        incident = self.context['incident']
        file = validated_data['file']
        media_type = validated_data['media_type']
        captured_at = validated_data.get('captured_at') or timezone.now()

        resource_type = 'video' if media_type == Evidence.MediaType.VIDEO else 'image'
        folder = f'vas/evidence/{incident.session_id}/{incident.id}'

        upload_result = cloudinary.uploader.upload(
            file,
            folder=folder,
            resource_type=resource_type,
            overwrite=False,
        )

        thumbnail_url = ''
        if resource_type == 'video':
            thumbnail_url = cloudinary.CloudinaryImage(upload_result['public_id']).build_url(
                resource_type='video',
                format='jpg',
            )
        else:
            thumbnail_url = cloudinary.CloudinaryImage(upload_result['public_id']).build_url(
                width=400,
                height=300,
                crop='fill',
            )

        return Evidence.objects.create(
            incident=incident,
            media_type=media_type,
            cloudinary_url=upload_result['secure_url'],
            cloudinary_public_id=upload_result['public_id'],
            thumbnail_url=thumbnail_url,
            duration_seconds=upload_result.get('duration'),
            file_size_bytes=upload_result.get('bytes'),
            caption=validated_data.get('caption', ''),
            captured_at=captured_at,
        )
