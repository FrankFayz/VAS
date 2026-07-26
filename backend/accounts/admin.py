from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import ApprovalLog, User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'role', 'approval_status', 'employee_id', 'is_staff')
    list_filter = ('role', 'approval_status', 'is_staff')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('VAS Profile', {
            'fields': ('role', 'approval_status', 'employee_id', 'department', 'phone', 'rejection_reason', 'approved_by', 'approved_at'),
        }),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('VAS Profile', {'fields': ('role', 'approval_status', 'employee_id', 'department', 'phone')}),
    )


@admin.register(ApprovalLog)
class ApprovalLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'action', 'performed_by', 'created_at')
    list_filter = ('action',)
