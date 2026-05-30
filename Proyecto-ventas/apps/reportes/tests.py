from django.db import models as django_models
from django.test import TestCase

import apps.reportes.models as reportes_models


class ReportesModelTests(TestCase):
    """La app reportes expone servicios y vistas; no persiste datos propios."""

    def test_no_hay_modelos_django_en_el_modulo(self):
        modelos = [
            obj
            for obj in vars(reportes_models).values()
            if isinstance(obj, type)
            and issubclass(obj, django_models.Model)
            and obj is not django_models.Model
        ]
        self.assertEqual(modelos, [])
