from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed

from .models import ApprovalLog
from .permissions import IsAdmin
from .serializers import (
    ApprovalActionSerializer,
    ApprovalLogSerializer,
    SupervisorSignupSerializer,
    UserSerializer,
)

User = get_user_model()


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Accept login input in the `username` field, but treat it as the user's email.
    (Your frontend still sends `{ username, password }`.) 
    """

    def validate(self, attrs):
        email = (attrs.get('username') or '').strip()
        password = attrs.get('password')

        if not email or password is None:
            raise AuthenticationFailed('Missing credentials.')

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist as exc:
            raise AuthenticationFailed('No active account found with the given credentials.') from exc

        if not user.is_active or not user.check_password(password):
            raise AuthenticationFailed('No active account found with the given credentials.')

        refresh = self.get_token(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }


class SupervisorSignupView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = SupervisorSignupSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                'message': 'Registration successful. Your account is pending admin approval.',
                'user': UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class PendingApprovalsView(generics.ListAPIView):
    permission_classes = [IsAdmin]
    serializer_class = UserSerializer

    def get_queryset(self):
        return User.objects.filter(
            role=User.Role.SUPERVISOR,
            approval_status=User.ApprovalStatus.PENDING,
        ).order_by('-created_at')


class AllUsersView(generics.ListAPIView):
    permission_classes = [IsAdmin]
    serializer_class = UserSerializer

    def get_queryset(self):
        return User.objects.exclude(role=User.Role.ADMIN).order_by('-created_at')


class ApproveUserView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, user_id):
        try:
            user = User.objects.get(id=user_id, role=User.Role.SUPERVISOR)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        user.approval_status = User.ApprovalStatus.APPROVED
        user.rejection_reason = ''
        user.approved_by = request.user
        user.approved_at = timezone.now()
        user.save()

        ApprovalLog.objects.create(
            user=user,
            action=ApprovalLog.Action.APPROVED,
            performed_by=request.user,
        )

        return Response({
            'message': f'{user.full_name} has been approved.',
            'user': UserSerializer(user).data,
        })


class RejectUserView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, user_id):
        serializer = ApprovalActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            user = User.objects.get(id=user_id, role=User.Role.SUPERVISOR)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        reason = serializer.validated_data.get('reason', '')
        user.approval_status = User.ApprovalStatus.REJECTED
        user.rejection_reason = reason
        user.save()

        ApprovalLog.objects.create(
            user=user,
            action=ApprovalLog.Action.REJECTED,
            performed_by=request.user,
            reason=reason,
        )

        return Response({
            'message': f'{user.full_name} has been rejected.',
            'user': UserSerializer(user).data,
        })


class SuspendUserView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, user_id):
        serializer = ApprovalActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        if user.role == User.Role.ADMIN:
            return Response({'detail': 'Cannot suspend admin.'}, status=status.HTTP_400_BAD_REQUEST)

        reason = serializer.validated_data.get('reason', '')
        user.approval_status = User.ApprovalStatus.SUSPENDED
        user.rejection_reason = reason
        user.save()

        ApprovalLog.objects.create(
            user=user,
            action=ApprovalLog.Action.SUSPENDED,
            performed_by=request.user,
            reason=reason,
        )

        return Response({
            'message': f'{user.full_name} has been suspended.',
            'user': UserSerializer(user).data,
        })


class ApprovalLogsView(generics.ListAPIView):
    permission_classes = [IsAdmin]
    serializer_class = ApprovalLogSerializer

    def get_queryset(self):
        return ApprovalLog.objects.select_related('performed_by', 'user').all()[:50]


class AdminStatsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        return Response({
            'pending_approvals': User.objects.filter(
                role=User.Role.SUPERVISOR,
                approval_status=User.ApprovalStatus.PENDING,
            ).count(),
            'approved_supervisors': User.objects.filter(
                role=User.Role.SUPERVISOR,
                approval_status=User.ApprovalStatus.APPROVED,
            ).count(),
            'total_users': User.objects.exclude(role=User.Role.ADMIN).count(),
        })
