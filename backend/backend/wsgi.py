import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

if os.environ.get('VERCEL'):
    from django.db import connection
    from django.db.migrations.executor import MigrationExecutor
    try:
        executor = MigrationExecutor(connection)
        if executor.migration_plan(executor.loader.graph.leaf_nodes()):
            from django.core.management import call_command
            call_command('migrate', '--run-syncdb')
    except Exception:
        pass

application = get_wsgi_application()
app = application