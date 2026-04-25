from django.db import models
from users.models import User



class resourceType(models.TextChoices):
        SALA = "sala", "SALA"
        EQUIPO = "equipo", "EQUIPO"
        ESPACIO = "espacio", "ESPACIO"

class status(models.TextChoices):
        SALA = "activo", "ACTIVO"
        EQUIPO = "inactivo", "INACTIVO"
        ESPACIO = "mantenimiento", "MANTENIMIENTO"

    

class Resource(models.Model):
    name = models.CharField(max_length=50)
    resourceType = models.CharField(
        choices=resourceType.choices,
        null= True,
        max_length=20
    )
    description = models.CharField(max_length=200)
    capacity = models.IntegerField()
    status = models.CharField(
        choices=status.choices,
        null= True,
        max_length=20
    )
    availableSchedule = models.JSONField()
    miniumTimeToCancel = models.IntegerField(default=1)
    
    




class Reservation(models.Model):

    STATUS_CHOICES = [
        ('requested', 'Solicitada'),
        ('confirmed', 'Confirmada'),
        ('cancelled', 'Cancelada'),
        ('finished', 'Finalizada'),
    ]

    resource = models.ForeignKey('Resource', on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField()
    startAt = models.TimeField()
    endsAt = models.TimeField()
    reason = models.CharField(max_length=200)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='requested')
    createdAt = models.DateTimeField(auto_now_add=True)
    waitList = models.BooleanField(default=False)
   
    
    def __str__(self):
        return f"{self.resource}"