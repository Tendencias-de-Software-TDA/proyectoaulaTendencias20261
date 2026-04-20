from django.contrib.auth.models import AbstractUser
from django.db import models


class Usuario(AbstractUser):

    class Rol(models.TextChoices):
        ADMINISTRADOR = 'administrador', 'Administrador'
        VENDEDOR = 'vendedor', 'Vendedor'
        CONTADOR = 'contador', 'Contador'

    rol = models.CharField(
        max_length=20,
        choices=Rol.choices,
        blank=False,
        null=False
    )

    def save(self, *args, **kwargs):
        if self.is_superuser and self.rol != 'administrador':
            self.rol = 'administrador'
        super().save(*args, **kwargs)

    def __str__(self):
        return self.username