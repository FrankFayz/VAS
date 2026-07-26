import re

from rest_framework import serializers

from .models import ApprovalLog, User


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    can_access_dashboard = serializers.BooleanField(read_only=True)
    is_admin = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'approval_status', 'employee_id', 'department', 'phone',
            'rejection_reason', 'can_access_dashboard', 'is_admin',
            'approved_at', 'created_at',
        ]
        read_only_fields = [
            'id', 'role', 'approval_status', 'rejection_reason',
            'can_access_dashboard', 'is_admin', 'approved_at', 'created_at',
        ]


class SupervisorSignupSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(write_only=True, min_length=2)
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'full_name', 'email', 'password', 'password_confirm',
            'employee_id', 'department', 'phone',
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')

        full_name = validated_data.pop('full_name', '').strip()
        email = validated_data.get('email', '').strip()
        employee_id = (validated_data.get('employee_id') or '').strip()

        # Split full name into first/last for the existing User model.
        parts = full_name.split()
        first_name = parts[0] if parts else ''
        last_name = ' '.join(parts[1:]) if len(parts) > 1 else ''

        # Django's AbstractUser requires `username`, but we won't ask users to input it.
        base = (email.split('@')[0] if email else 'user')
        base = re.sub(r'[^a-zA-Z0-9_]', '', base).lower() or 'user'
        if employee_id:
            base = f'{base}_{employee_id}'

        username = base
        i = 1
        while User.objects.filter(username=username).exists():
            i += 1
            username = f'{base}{i}'

        # Prevent duplicate keyword arguments (we pass email explicitly below).
        validated_data.pop('email', None)

        user = User(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
            **validated_data,
            role=User.Role.SUPERVISOR,
            approval_status=User.ApprovalStatus.PENDING,
        )
        user.set_password(password)
        user.save()
        return user


class ApprovalActionSerializer(serializers.Serializer):
    reason = serializers.CharField(required=False, allow_blank=True)


class ApprovalLogSerializer(serializers.ModelSerializer):
    performed_by_name = serializers.CharField(source='performed_by.full_name', read_only=True)

    class Meta:
        model = ApprovalLog
        fields = ['id', 'action', 'reason', 'performed_by_name', 'created_at']
