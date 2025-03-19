
from django.apps import AppConfig
from django.db.models.signals import post_migrate

class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'
    
    def ready(self):
        # Import signal handlers
        from django.db import connection
        
        def create_extensions(sender, **kwargs):
            """Create PostgreSQL extensions after migration if needed"""
            with connection.cursor() as cursor:
                try:
                    # This can be useful for full-text search if needed later
                    cursor.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm;")
                except:
                    # Extension might already exist or we may not have permission
                    pass
        
        post_migrate.connect(create_extensions)
