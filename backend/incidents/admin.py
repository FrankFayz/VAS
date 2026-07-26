from django.contrib import admin

from .models import Evidence, Incident, IncidentTimeline


class EvidenceInline(admin.TabularInline):
    model = Evidence
    extra = 0


class TimelineInline(admin.TabularInline):
    model = IncidentTimeline
    extra = 0


@admin.register(Incident)
class IncidentAdmin(admin.ModelAdmin):
    list_display = ('id', 'session', 'incident_type', 'status', 'seat_row', 'seat_number', 'confidence', 'detected_at')
    list_filter = ('status', 'incident_type', 'severity')
    inlines = [EvidenceInline, TimelineInline]


@admin.register(Evidence)
class EvidenceAdmin(admin.ModelAdmin):
    list_display = ('id', 'incident', 'media_type', 'cloudinary_url', 'captured_at')
