from django.core.management.base import BaseCommand

from accounts.utils import ensure_admin_user


class Command(BaseCommand):
    help = 'Ensure default admin user exists'

    def handle(self, *args, **options):
        ensure_admin_user()
        self.stdout.write(self.style.SUCCESS('Admin user ready.'))
