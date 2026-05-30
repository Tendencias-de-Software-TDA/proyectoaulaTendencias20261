from django.db import models as django_models
from django.test import TestCase

import apps.autenticacion.models as autenticacion_models


class AutenticacionModelTests(TestCase):
    """La app autenticacion no define tablas; solo vistas de login."""

    def test_no_hay_modelos_django_en_el_modulo(self):
        modelos = [
            obj
            for obj in vars(autenticacion_models).values()
            if isinstance(obj, type)
            and issubclass(obj, django_models.Model)
            and obj is not django_models.Model
        ]
        self.assertEqual(modelos, [])
