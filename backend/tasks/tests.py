from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from users.models import User
from projects.models import Project, ProjectMembership
from tasks.models import Task, TaskHistory


class TaskHistoryTest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='dev', password='pass', email='dev@test.com'
        )
        self.project = Project.objects.create(
            name='Proyecto',
            description='Proyecto de prueba',
            owner=self.user,
            start_date='2026-01-01T00:00:00-05:00',
            due_date='2026-12-31T00:00:00-05:00'
        )
        ProjectMembership.objects.create(
            project=self.project, user=self.user, role='owner'
        )
        self.task = Task.objects.create(
            title='Tarea test',
            project=self.project,
            assigned_to=self.user,
            status='pending',
            priority='medium'
        )

    def test_historial_se_crea_al_cambiar_status(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.patch(f'/api/tasks/{self.task.id}/', {
            'status': 'in_progress'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        historial = TaskHistory.objects.filter(
            task=self.task, field_changed='status'
        )
        self.assertEqual(historial.count(), 1)
        self.assertEqual(historial.first().old_value, 'pending')
        self.assertEqual(historial.first().new_value, 'in_progress')

    def test_historial_se_crea_al_cambiar_priority(self):
        self.client.force_authenticate(user=self.user)
        self.client.patch(f'/api/tasks/{self.task.id}/', {'priority': 'high'})
        historial = TaskHistory.objects.filter(
            task=self.task, field_changed='priority'
        )
        self.assertEqual(historial.count(), 1)
        self.assertEqual(historial.first().old_value, 'medium')
        self.assertEqual(historial.first().new_value, 'high')

    def test_historial_endpoint_filtra_por_tarea(self):
        self.client.force_authenticate(user=self.user)
        self.client.patch(f'/api/tasks/{self.task.id}/', {
            'status': 'completed'
        })
        response = self.client.get(f'/api/history/?task={self.task.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data['results']), 0)

    def test_no_crear_tarea_en_proyecto_archivado(self):
        self.project.status = 'archived'
        self.project.save()
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/tasks/', {
            'title': 'Tarea bloqueada',
            'project': str(self.project.id),
            'priority': 'low',
            'status': 'pending'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)