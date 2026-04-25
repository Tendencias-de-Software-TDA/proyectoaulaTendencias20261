from django.shortcuts import render

from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets
from .models import Resource
from .serializers import ResourceSerializer


from .models import Reservation
from .serializers import ReservationSerializer
from .services import is_resource_available, promote_waitlist, sendFakeEmail, validate_cancel


from rest_framework.decorators import action
from rest_framework.response import Response
from datetime import datetime, time, timedelta

# ERROR HANDLING
from rest_framework.exceptions import ValidationError


class ResourceViewSet(viewsets.ModelViewSet):
    queryset = Resource.objects.all()
    serializer_class = ResourceSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=True, methods=["get"])
    def availability(self, request, pk=None):
        date_str = request.GET.get("date")

        if not date_str:
            return Response({"error": "date is required"}, status=400)

        date = datetime.strptime(date_str, "%Y-%m-%d").date()
        day_name = date.strftime("%A")

        resource = self.get_object()

        days = resource.availableSchedule.get("avialableDays", [])

        day_schedule = next((d for d in days if d["day"] == day_name), None)

        if not day_schedule:
            return Response({"availableSlot": [], "occupiedSlot": []})

        def generate_slots(start_hour, end_hour):
            slots = []
            current = time(int(start_hour), 0)

            while current < time(int(end_hour), 0):
                next_time = (
                    datetime.combine(datetime.today(), current) + timedelta(hours=1)
                ).time()
                slots.append((current, next_time))
                current = next_time

            return slots 

        
        all_slots = generate_slots(day_schedule["startAt"], day_schedule["endsAt"])

        reservations = Reservation.objects.filter(resource=resource, date=date)

        occupied_ranges = [(r.startAt, r.endsAt) for r in reservations]

        free = []
        occupied = []

        for start, end in all_slots:
            is_taken = any(
                not (end <= r_start or start >= r_end)
                for r_start, r_end in occupied_ranges
            )

            slot = f"{start.strftime('%H:%M')}-{end.strftime('%H:%M')}"

            if is_taken:
                occupied.append(slot)
            else:
                free.append(slot)

        return Response({"availableSlot": free, "occupiedSlot": occupied})    



class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        resource = serializer.validated_data["resource"]
        date = serializer.validated_data["date"]
        startAt = serializer.validated_data["startAt"].hour
        endsAt = serializer.validated_data["endsAt"].hour
        waitList = serializer.validated_data["waitList"]

        available, message = is_resource_available(resource, date, startAt, endsAt, waitList)

        if not available:
            raise ValidationError({"detail": message})

        reservation = serializer.save(user=self.request.user)

        if waitList == True:
            sendFakeEmail(reservation, 'wait_list')


    def perform_update(self, serializer):
        instance = self.get_object()
        old_status = instance.status

        new_status = serializer.validated_data.get("status", old_status)

        # if new_status == "cancelled":
        #     validate_cancel(instance)

        updated_instance = serializer.save()

        # PROMOTE WAITLIST + EMAIL
        if updated_instance.status in ["cancelled", "finished"]:
            promote_waitlist(updated_instance)
            sendFakeEmail(updated_instance, 'cancelation')

        # EMAIL CONFIRMATION
        if updated_instance.status == "confirmed":
            sendFakeEmail(updated_instance, 'confirmation')



        
    @action(detail=False, methods=["get"])
    def byUser(self, request):
        user = request.user
        reservations = Reservation.objects.filter(user=user)
        serializer = self.get_serializer(reservations, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=["get"])
    def waitList(self, request):
        reservations = Reservation.objects.filter(waitList=True)
        serializer = self.get_serializer(reservations, many=True)
        return Response(serializer.data)
