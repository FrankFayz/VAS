from django.contrib import admin

from .models import Camera, ExamHall, ExamSession


@admin.register(ExamHall)
class ExamHallAdmin(admin.ModelAdmin):
    list_display = ('name', 'location', 'capacity', 'is_active')


@admin.register(Camera)
class CameraAdmin(admin.ModelAdmin):
    list_display = ('name', 'hall', 'identifier', 'is_online')


@admin.register(ExamSession)
class ExamSessionAdmin(admin.ModelAdmin):
    list_display = ('title', 'hall', 'status', 'start_time', 'end_time')
    list_filter = ('status',)
    filter_horizontal = ('supervisors',)
