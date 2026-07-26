from django.conf import settings
from django.db import models


class Incident(models.Model):
    class Type(models.TextChoices):
        COPYING = 'COPYING', 'Possible Copying'
        PEEKING = 'PEEKING', 'Looking Off Desk'
        PHONE_USE = 'PHONE_USE', 'Phone Use'
        UNAUTHORIZED_MATERIAL = 'UNAUTHORIZED_MATERIAL', 'Unauthorized Material'
        TALKING = 'TALKING', 'Talking'
        OTHER = 'OTHER', 'Other'

    class Status(models.TextChoices):
        NEW = 'NEW', 'New'
        WATCHING = 'WATCHING', 'Watching'
        CONFIRMED = 'CONFIRMED', 'Confirmed Malpractice'
        WARNING = 'WARNING', 'Warning Issued'
        DISMISSED = 'DISMISSED', 'False Alarm'
        ESCALATED = 'ESCALATED', 'Escalated'

    class Severity(models.TextChoices):
        LOW = 'LOW', 'Low'
        MEDIUM = 'MEDIUM', 'Medium'
        HIGH = 'HIGH', 'High'
        CRITICAL = 'CRITICAL', 'Critical'

    session = models.ForeignKey('exams.ExamSession', on_delete=models.CASCADE, related_name='incidents')
    camera = models.ForeignKey('exams.Camera', on_delete=models.SET_NULL, null=True, blank=True)
    incident_type = models.CharField(max_length=30, choices=Type.choices, default=Type.COPYING)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NEW)
    severity = models.CharField(max_length=20, choices=Severity.choices, default=Severity.MEDIUM)
    confidence = models.PositiveSmallIntegerField(default=0)
    seat_row = models.PositiveSmallIntegerField()
    seat_number = models.PositiveSmallIntegerField()
    description = models.TextField(blank=True)
    handled_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='handled_incidents',
    )
    supervisor_notes = models.TextField(blank=True)
    detected_at = models.DateTimeField()
    resolved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-detected_at']

    @property
    def seat_label(self):
        return f'Row {self.seat_row}, Seat {self.seat_number}'


class Evidence(models.Model):
    class MediaType(models.TextChoices):
        IMAGE = 'IMAGE', 'Image'
        VIDEO = 'VIDEO', 'Video'

    incident = models.ForeignKey(Incident, on_delete=models.CASCADE, related_name='evidence_items')
    media_type = models.CharField(max_length=10, choices=MediaType.choices)
    cloudinary_url = models.URLField(max_length=500)
    cloudinary_public_id = models.CharField(max_length=255)
    thumbnail_url = models.URLField(max_length=500, blank=True)
    duration_seconds = models.FloatField(null=True, blank=True)
    file_size_bytes = models.PositiveIntegerField(null=True, blank=True)
    caption = models.CharField(max_length=255, blank=True)
    captured_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['captured_at']


class IncidentTimeline(models.Model):
    incident = models.ForeignKey(Incident, on_delete=models.CASCADE, related_name='timeline')
    event = models.CharField(max_length=255)
    timestamp = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']
