from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        SUPERVISOR = 'SUPERVISOR', 'Supervisor'
        CHIEF_SUPERVISOR = 'CHIEF_SUPERVISOR', 'Chief Supervisor'
        AUDITOR = 'AUDITOR', 'Auditor'

    class ApprovalStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'
        SUSPENDED = 'SUSPENDED', 'Suspended'

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.SUPERVISOR)
    approval_status = models.CharField(
        max_length=20,
        choices=ApprovalStatus.choices,
        default=ApprovalStatus.PENDING,
    )
    employee_id = models.CharField(max_length=50, blank=True)
    department = models.CharField(max_length=120, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    rejection_reason = models.TextField(blank=True)
    approved_by = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_users',
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def is_admin(self):
        return self.role == self.Role.ADMIN

    @property
    def can_access_dashboard(self):
        if self.role == self.Role.ADMIN:
            return True
        if self.role == self.Role.AUDITOR:
            return self.approval_status == self.ApprovalStatus.APPROVED
        return self.approval_status == self.ApprovalStatus.APPROVED

    @property
    def full_name(self):
        return f'{self.first_name} {self.last_name}'.strip() or self.username


class ApprovalLog(models.Model):
    class Action(models.TextChoices):
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'
        SUSPENDED = 'SUSPENDED', 'Suspended'
        REACTIVATED = 'REACTIVATED', 'Reactivated'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='approval_logs')
    action = models.CharField(max_length=20, choices=Action.choices)
    performed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='performed_approvals')
    reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
