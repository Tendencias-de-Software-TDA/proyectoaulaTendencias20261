from django.test import TestCase
from rest_framework.test import APITestCase, APIClient
from django.urls import reverse

from .models import Resource, Reservation
from users.models import User


class ReservationTests(APITestCase):

    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(
            username="test",
            email="test@test.com",
            role="user",
            password="123456"
        )

        self.client.force_authenticate(user=self.user)

        self.resource = Resource.objects.create(
            name="Sala 1",
            capacity=10,
            miniumTimeToCancel=1,
            availableSchedule={
                "availableDays": []
            }
        )

    def test_create_reservation(self):
        response = self.client.post("/api/v1/reservations/", {
            "resource": self.resource.id,
            "date": "2026-04-25",
            "startAt": "10:00",
            "endsAt": "11:00",
            "reason": "Meeting",
            "waitList": False
        })

        self.assertEqual(response.status_code, 201)