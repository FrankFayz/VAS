from django.conf import settings
from django.db import models


class ExamHall(models.Model):
    name = models.CharField(max_length=120)
    location = models.CharField(max_length=200, blank=True)
    capacity = models.PositiveIntegerField(default=50)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Camera(models.Model):
    hall = models.ForeignKey(ExamHall, on_delete=models.CASCADE, related_name='cameras')
    name = models.CharField(max_length=80)
    identifier = models.CharField(max_length=80, unique=True)
    position = models.CharField(max_length=120, blank=True)
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        help_text='LAN IP of the PC or IP camera (e.g. 192.168.1.45).',
    )
    stream_port = models.PositiveIntegerField(default=554, blank=True, null=True)
    rtsp_url = models.CharField(
        max_length=500,
        blank=True,
        help_text='Local RTSP/HTTP stream URL for the edge AI agent (optional).',
    )
    is_online = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f'{self.name} ({self.hall.name})'

    def build_default_rtsp(self):
        if self.rtsp_url:
            return self.rtsp_url
        if self.ip_address:
            port = self.stream_port or 554
            return f'rtsp://{self.ip_address}:{port}/stream1'
        return ''


class ExamSession(models.Model):
    class Status(models.TextChoices):
        SCHEDULED = 'SCHEDULED', 'Scheduled'
        LIVE = 'LIVE', 'Live'
        COMPLETED = 'COMPLETED', 'Completed'

    title = models.CharField(max_length=200)
    subject = models.CharField(max_length=120)
    hall = models.ForeignKey(ExamHall, on_delete=models.CASCADE, related_name='sessions')
    student_count = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SCHEDULED)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    supervisors = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        blank=True,
        related_name='assigned_sessions',
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_sessions',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-start_time']

    def __str__(self):
        return f'{self.title} — {self.hall.name}'
