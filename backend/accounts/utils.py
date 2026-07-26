from django.conf import settings
from django.contrib.auth import get_user_model
from django.db.utils import OperationalError, ProgrammingError


def ensure_admin_user():
    User = get_user_model()
    email = settings.ADMIN_EMAIL
    password = settings.ADMIN_PASSWORD

    try:
        if User.objects.filter(role=User.Role.ADMIN).exists():
            return
        username = email.split('@')[0]
        User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
            first_name='System',
            last_name='Admin',
            role=User.Role.ADMIN,
            approval_status=User.ApprovalStatus.APPROVED,
        )
    except (OperationalError, ProgrammingError):
        pass
