#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys
from pathlib import Path


def use_local_venv():
    """Prefer packages from the project's virtualenv when present."""
    base_dir = Path(__file__).resolve().parent
    py_version = f"python{sys.version_info.major}.{sys.version_info.minor}"
    candidates = [
        base_dir / "venv" / "Lib" / "site-packages",
        base_dir / ".venv" / "Lib" / "site-packages",
        base_dir / "venv" / "lib" / py_version / "site-packages",
        base_dir / ".venv" / "lib" / py_version / "site-packages",
    ]

    for site_packages in candidates:
        if site_packages.exists():
            site_packages_str = str(site_packages)
            if site_packages_str not in sys.path:
                sys.path.insert(0, site_packages_str)
            break


def main():
    use_local_venv()
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'vas_api.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
