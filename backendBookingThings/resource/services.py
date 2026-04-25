from datetime import datetime

from jsonschema import ValidationError
from .models import Reservation
from django.db import transaction
from django.core.mail import send_mail
from datetime import datetime
from django.utils import timezone
from datetime import datetime, timedelta

def is_resource_available(resource, date, startAt, endsAt, waitList):
    day_name = datetime.strptime(str(date), "%Y-%m-%d").strftime("%A")

    schedule = resource.availableSchedule.get("avialableDays", [])

    day_schedule = next(
        (d for d in schedule if d["day"] == day_name),
        None
    )

    if not day_schedule:
        return False, "No disponible ese día"

    day_start = int(day_schedule["startAt"])
    day_end = int(day_schedule["endsAt"])

    if not (day_start <= startAt and endsAt <= day_end):
        return False, "Fuera del horario permitido"

    reservations = Reservation.objects.filter(
        resource=resource,
        date=date,
        status__in=['requested', 'confirmed'],
        waitList=False
    )

    for r in reservations:
        if not (endsAt <= r.startAt.hour or startAt >= r.endsAt.hour):
            if waitList == False:
                return False, "Horario ya reservado"

    return True, "Disponible"



def promote_waitlist(released_reservation):
    with transaction.atomic():

        # SEARCH SAME RESOURCE IN A SAME TIME SLOT
        next_reservation = (
            Reservation.objects
            .select_for_update()
            .filter(
                resource=released_reservation.resource, 
                waitList=True,
                status="requested"
            )
            .filter(
                startAt=released_reservation.startAt,
                endsAt=released_reservation.endsAt
            )
            .order_by("createdAt")
            .first()
        )

        if not next_reservation:
            return None

        next_reservation.waitList = False
        next_reservation.status = "confirmed"
        next_reservation.save()

        sendFakeEmail(next_reservation, "confirmation")

        return next_reservation
    

def sendFakeEmail(reservation, type):

    print(reservation.user.email)

    if not reservation.user.email:
        return "No email provided"
    

    if type == "confirmation":
        send_mail(
            subject="Reserva confirmada",
            message=f"""
                Hola {reservation.user.username},
                Tu reserva para {reservation.resource.name} ha sido confirmada.
                Fecha: {reservation.date}
                Gracias por usar la plataforma.
            """,
            from_email="noreply@bookingthings.com",
            recipient_list=[reservation.user.email],
            fail_silently=False,
        )

    if type == "cancelation":
        send_mail(
            subject="Reserva Cancelada",
            message=f"""
                Hola {reservation.user.username},
                Tu reserva para {reservation.resource.name} ha sido cancelada.
                Fecha: {reservation.date}
            """,
            from_email="noreply@bookingthings.com",
            recipient_list=[reservation.user.email],
            fail_silently=False,
        )

    if type == "wait_list":
        send_mail(
            subject="Reserva en lista de espera",
            message=f"""
                Hola {reservation.user.username},
                Tu reserva para {reservation.resource.name} ha entrado a una lista de espera.
                Recibirás un correo cuando se habilite un espacio para la fecha indicada
                Fecha: {reservation.date}
            """,
            from_email="noreply@bookingthings.com",
            recipient_list=[reservation.user.email],
            fail_silently=False,
        )

# TO DO: PENDING ERROR FOR RETURN SRING WHEN EXPECT AN DUPLA
def validate_cancel(reservation):

    now = timezone.now()
    local = timezone.localtime(now)

    reservation_datetime = timezone.make_aware(
        datetime.combine(reservation.date, reservation.startAt)
    )

    min_time = timedelta(hours=reservation.resource.miniumTimeToCancel)


    limit = reservation_datetime - min_time


    if timezone.now() > limit:
        raise ValidationError({
            "detail": "Tiempo de cancelación no disponible"
        })
   