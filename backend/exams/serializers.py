from rest_framework import serializers

from accounts.serializers import UserSerializer
from .models import Camera, ExamHall, ExamSession


class CameraSerializer(serializers.ModelSerializer):
    hall_name = serializers.CharField(source='hall.name', read_only=True)

    class Meta:
        model = Camera
        fields = [
            'id',
            'hall',
            'hall_name',
            'name',
            'identifier',
            'position',
            'ip_address',
            'stream_port',
            'rtsp_url',
            'is_online',
            'created_at',
        ]
        read_only_fields = ['created_at', 'hall_name']
        extra_kwargs = {
            'ip_address': {'allow_null': True, 'required': False},
            'stream_port': {'allow_null': True, 'required': False},
            'rtsp_url': {'required': False, 'allow_blank': True},
            'position': {'required': False, 'allow_blank': True},
        }
    def validate_identifier(self, value):
        value = (value or '').strip().upper().replace(' ', '-')
        if not value:
            raise serializers.ValidationError('Camera ID is required.')
        qs = Camera.objects.filter(identifier__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError('This camera ID is already registered.')
        return value


class ExamHallSerializer(serializers.ModelSerializer):
    cameras = CameraSerializer(many=True, read_only=True)
    camera_count = serializers.SerializerMethodField()

    class Meta:
        model = ExamHall
        fields = [
            'id',
            'name',
            'location',
            'capacity',
            'is_active',
            'cameras',
            'camera_count',
            'created_at',
        ]
        read_only_fields = ['created_at', 'cameras', 'camera_count']

    def get_camera_count(self, obj):
        return obj.cameras.count()


class ExamSessionSerializer(serializers.ModelSerializer):
    hall_name = serializers.CharField(source='hall.name', read_only=True)
    supervisors_detail = UserSerializer(source='supervisors', many=True, read_only=True)
    incident_count = serializers.SerializerMethodField()
    online_cameras = serializers.SerializerMethodField()

    class Meta:
        model = ExamSession
        fields = [
            'id', 'title', 'subject', 'hall', 'hall_name', 'student_count',
            'status', 'start_time', 'end_time', 'supervisors', 'supervisors_detail',
            'incident_count', 'online_cameras', 'created_at',
        ]
        read_only_fields = ['created_at']

    def get_incident_count(self, obj):
        return obj.incidents.count()

    def get_online_cameras(self, obj):
        return obj.hall.cameras.filter(is_online=True).count()


class ExamSessionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamSession
        fields = [
            'title', 'subject', 'hall', 'student_count',
            'status', 'start_time', 'end_time', 'supervisors',
        ]
