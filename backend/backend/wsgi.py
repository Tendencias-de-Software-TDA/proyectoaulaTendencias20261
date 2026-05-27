import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

application = get_wsgi_application()

from django.core.management import call_command
try:
    call_command('migrate', '--run-syncdb', verbosity=0)
    from django.contrib.auth import get_user_model
    User = get_user_model()
    if not User.objects.filter(email='admin@admin.com').exists():
        User.objects.create_superuser(
            email='admin@admin.com',
            password='admin.',
            username='admin',
            role='admin'
        )
except Exception:
    pass

app = application