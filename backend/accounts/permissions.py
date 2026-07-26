from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == request.user.Role.ADMIN
        )


class IsApprovedUser(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.can_access_dashboard


class IsSupervisorOrAdmin(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == request.user.Role.ADMIN:
            return True
        return (
            request.user.role in (request.user.Role.SUPERVISOR, request.user.Role.CHIEF_SUPERVISOR)
            and request.user.approval_status == request.user.ApprovalStatus.APPROVED
        )


class ReadOnlyAuditor(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == request.user.Role.AUDITOR:
            return request.method in SAFE_METHODS
        return True
