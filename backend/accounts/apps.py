from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'

    def ready(self):
        from django.db.models.signals import post_migrate
        from django.dispatch import receiver
        from .utils import ensure_admin_user

        @receiver(post_migrate)
        def create_default_admin(sender, **kwargs):
            if sender.name == 'accounts':
                ensure_admin_user()
