from django.core.exceptions import ValidationError
from django.test import TestCase

from apps.usuarios.models import Usuario


class UsuarioModelTests(TestCase):

    def test_str_devuelve_username(self):
        usuario = Usuario.objects.create_user(
            username='vendedor1',
            password='clave-segura-123',
            rol=Usuario.Rol.VENDEDOR,
        )
        self.assertEqual(str(usuario), 'vendedor1')

    def test_superusuario_fuerza_rol_administrador(self):
        admin = Usuario.objects.create_superuser(
            username='admin',
            password='clave-segura-123',
            email='admin@test.com',
            rol=Usuario.Rol.VENDEDOR,
        )
        admin.refresh_from_db()
        self.assertEqual(admin.rol, Usuario.Rol.ADMINISTRADOR)

    def test_rol_es_obligatorio(self):
        usuario = Usuario(username='sinrol', password='clave-segura-123')
        with self.assertRaises(ValidationError):
            usuario.full_clean()
