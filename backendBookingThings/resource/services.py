from datetime import datetime
from .models import Reservation

def is_resource_available(resource, date, startAt, endsAt):
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
        status__in=['requested', 'confirmed']
    )   

    for r in reservations:
        if not (endsAt <= r.startAt.hour or startAt >= r.endsAt.hour):
            return False, "Horario ya reservado"

    return True, "Disponible"