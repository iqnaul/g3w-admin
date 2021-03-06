

from django.apps import AppConfig

class CoreConfig(AppConfig):
    name = 'core'
    verbose_name = 'G3W-Admin main app'

    def ready(self):
        """
        update Django Rest Framework serializer mappings
        """

        # import signal handlers
        import core.receivers

        from django.contrib.gis.db import models
        from rest_framework.serializers import ModelSerializer
        try:
            from editing.api.serializers import G3WGeometryField as GeometryField

            try:
                # drf 3.0
                field_mapping = ModelSerializer._field_mapping.mapping
            except AttributeError:
                # drf 3.1
                field_mapping = ModelSerializer.serializer_field_mapping

            # map GeoDjango fields to drf-gis GeometryField
            field_mapping.update({
                models.GeometryField: GeometryField,
                models.PointField: GeometryField,
                models.LineStringField: GeometryField,
                models.PolygonField: GeometryField,
                models.MultiPointField: GeometryField,
                models.MultiLineStringField: GeometryField,
                models.MultiPolygonField: GeometryField,
                models.GeometryCollectionField: GeometryField
            })
        except Exception:
            pass
