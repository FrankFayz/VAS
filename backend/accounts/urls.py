from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    AdminStatsView,
    AllUsersView,
    ApprovalLogsView,
    ApproveUserView,
    MeView,
    PendingApprovalsView,
    RejectUserView,
    SupervisorSignupView,
    EmailTokenObtainPairSerializer,
    SuspendUserView,
)

urlpatterns = [
    path('signup/', SupervisorSignupView.as_view(), name='supervisor-signup'),
    path('login/', TokenObtainPairView.as_view(serializer_class=EmailTokenObtainPairSerializer), name='token-obtain'),
    path('refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('me/', MeView.as_view(), name='me'),
    path('admin/stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('admin/pending/', PendingApprovalsView.as_view(), name='pending-approvals'),
    path('admin/users/', AllUsersView.as_view(), name='all-users'),
    path('admin/users/<int:user_id>/approve/', ApproveUserView.as_view(), name='approve-user'),
    path('admin/users/<int:user_id>/reject/', RejectUserView.as_view(), name='reject-user'),
    path('admin/users/<int:user_id>/suspend/', SuspendUserView.as_view(), name='suspend-user'),
    path('admin/approval-logs/', ApprovalLogsView.as_view(), name='approval-logs'),
]
