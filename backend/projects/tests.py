from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from users.models import User
from projects.models import Project, ProjectMembership


class ProjectRolesTest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.owner = User.objects.create_user(
            username='owner', password='pass', email='owner@test.com'
        )
        self.editor = User.objects.create_user(
            username='editor', password='pass', email='editor@test.com'
        )
        self.observer = User.objects.create_user(
            username='observer', password='pass', email='observer@test.com'
        )
        self.outsider = User.objects.create_user(
            username='outsider', password='pass', email='outsider@test.com'
        )
        self.project = Project.objects.create(
            name='Proyecto Test',
            description='Proyecto de prueba',
            owner=self.owner,
            start_date='2026-01-01T00:00:00-05:00',
            due_date='2026-12-31T00:00:00-05:00'
        )
        ProjectMembership.objects.create(
            project=self.project, user=self.owner, role='owner'
        )
        ProjectMembership.objects.create(
            project=self.project, user=self.editor, role='editor'
        )
        ProjectMembership.objects.create(
            project=self.project, user=self.observer, role='observer'
        )

    def test_owner_puede_archivar(self):
        self.client.force_authenticate(user=self.owner)
        response = self.client.post(f'/api/projects/{self.project.id}/archive/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_editor_no_puede_archivar(self):
        self.client.force_authenticate(user=self.editor)
        response = self.client.post(f'/api/projects/{self.project.id}/archive/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_outsider_no_puede_ver_proyecto(self):
        self.client.force_authenticate(user=self.outsider)
        response = self.client.get(f'/api/projects/{self.project.id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)