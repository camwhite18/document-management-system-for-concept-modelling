from datetime import timedelta

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import CustomUser, Document, Project
from .permissions import WRITE_PERMISSIONS


class UserAPIViewTest(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username='testuser',
            password='testpassword',
            create_projects=True,
            project_permissions={'1': 'read', '2': 'write'}
        )

    def test_get_user(self):
        # Given
        url = reverse('user')
        self.client.login(username='testuser', password='testpassword')

        # When
        response = self.client.get(url)

        # Then
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], self.user.username)
        self.assertEqual(response.data['create_projects'], self.user.create_projects)
        self.assertEqual(response.data['project_permissions'], self.user.project_permissions)

    def test_get_user_unauthenticated(self):
        # Given
        url = reverse('user')

        # When
        response = self.client.get(url)

        # Then
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def tearDown(self):
        self.user.delete()


class ProjectsAPIViewTest(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username='testuser',
            password='testpassword',
            project_permissions={'1': 'read', '2': 'write'}
        )
        self.project1 = Project.objects.create(
            name='Project 1',
            owner=self.user,
        )
        self.project2 = Project.objects.create(
            name='Project 2',
            owner=self.user,
        )
        self.document1 = Document.objects.create(
            name='Document 1',
            project=self.project1,
            text='Sample text',
            tagged_text='Sample tagged text'
        )

    def test_get_projects(self):
        # Given
        url = reverse('projects')
        self.client.login(username='testuser', password='testpassword')

        # When
        response = self.client.get(url)

        # Then
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.data[0]['id'], self.project1.id)
        self.assertEqual(response.data[0]['documents'][0]['id'], self.document1.id)
        self.assertNotIn('text', response.data[0]['documents'][0])
        self.assertNotIn('tagged_text', response.data[0]['documents'][0])

    def test_get_projects_unauthenticated(self):
        # Given
        url = reverse('projects')

        # When
        response = self.client.get(url)

        # Then
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def tearDown(self):
        self.user.delete()
        self.project1.delete()
        self.project2.delete()
        self.document1.delete()


class ProjectAPIViewTest(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username='testuser',
            password='testpassword',
            project_permissions={'1': 'read', '2': 'write'}
        )
        self.project1 = Project.objects.create(
            name='Project 1',
            owner=self.user,
        )
        self.document1 = Document.objects.create(
            name='Document 1',
            project=self.project1,
            text='Sample text',
            tagged_text='Sample tagged text'
        )

    def test_get_project(self):
        # Given
        url = reverse('project', kwargs={'project_id': self.project1.id})
        self.client.login(username='testuser', password='testpassword')

        # When
        response = self.client.get(url)

        # Then
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.project1.id)
        self.assertEqual(response.data['documents'][0]['id'], self.document1.id)
        self.assertNotIn('text', response.data['documents'][0])
        self.assertNotIn('tagged_text', response.data['documents'][0])

    def test_get_project_unauthenticated(self):
        # Given
        url = reverse('project', kwargs={'project_id': self.project1.id})

        # When
        response = self.client.get(url)

        # Then
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_project_nonexistent(self):
        # Given
        url = reverse('project', kwargs={'project_id': 999})
        self.client.login(username='testuser', password='testpassword')

        # When
        response = self.client.get(url)

        # Then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Project does not exist')

    def test_get_project_no_permission(self):
        # Given
        another_user = get_user_model().objects.create_user(
            username='anotheruser',
            password='anotherpassword',
            project_permissions={}
        )
        url = reverse('project', kwargs={'project_id': self.project1.id})
        self.client.login(username='anotheruser', password='anotherpassword')

        # When
        response = self.client.get(url)

        # Then
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data['error'], 'You do not have permission to access this project')
        another_user.delete()

    def test_post_project(self):
        # Given
        url = reverse('create_project')
        self.client.login(username='testuser', password='testpassword')
        data = {'name': 'New Project', 'permissions': 'read'}

        # When
        response = self.client.post(url, data)

        # Then
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('id', response.data)
        self.assertEqual(response.data['name'], 'New Project')
        self.assertIn('timestamp', response.data)

    def test_post_project_unauthenticated(self):
        # Given
        url = reverse('create_project')
        data = {'name': 'New Project', 'permissions': 'read'}

        # When
        response = self.client.post(url, data)

        # Then
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_post_project_no_permission(self):
        # Given
        no_create_user = get_user_model().objects.create_user(
            username='noprojectcreate',
            password='testpassword',
            create_projects=False
        )
        url = reverse('create_project')
        self.client.login(username='noprojectcreate', password='testpassword')
        data = {'name': 'New Project', 'permissions': 'read'}

        # When
        response = self.client.post(url, data)

        # Then
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data['error'], 'You do not have permission to create projects')
        no_create_user.delete()

    def test_post_project_bad_request(self):
        # Given
        url = reverse('create_project')
        self.client.login(username='testuser', password='testpassword')
        data = {'permissions': 'invalid'}

        # When
        response = self.client.post(url, data)

        # Then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete_project(self):
        # Given
        url = reverse('project', kwargs={'project_id': self.project1.id})
        self.client.login(username='testuser', password='testpassword')

        # When
        response = self.client.delete(url)

        # Then
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Project deleted successfully')

    def test_delete_project_unauthenticated(self):
        # Given
        url = reverse('project', kwargs={'project_id': self.project1.id})

        # When
        response = self.client.delete(url)

        # Then
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_delete_project_nonexistent(self):
        # Given
        url = reverse('project', kwargs={'project_id': 999})
        self.client.login(username='testuser', password='testpassword')

        # When
        response = self.client.delete(url)

        # Then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Project does not exist')

    def test_delete_project_no_permission(self):
        # Given
        another_user = get_user_model().objects.create_user(
            username='anotheruser',
            password='anotherpassword',
            project_permissions={}
        )
        url = reverse('project', kwargs={'project_id': self.project1.id})
        self.client.login(username='anotheruser', password='anotherpassword')

        # When
        response = self.client.delete(url)

        # Then
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data['error'], 'You do not have permission to access this project')
        another_user.delete()

    def tearDown(self):
        self.user.delete()
        self.project1.delete()
        self.document1.delete()


class DocumentApiViewTest(APITestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            username='testuser', password='testpassword'
        )
        self.project = Project.objects.create(
            name='Test Project', owner=self.user
        )
        self.document = Document.objects.create(
            name='Test Document', owner=self.user, project=self.project, text='Test text'
        )
        self.user.project_permissions = {
            str(self.project.id): WRITE_PERMISSIONS
        }
        self.user.save()

    def test_get_document(self):
        # Given
        url = reverse('document', kwargs={'project_id': self.project.id, 'document_id': self.document.id})
        self.client.login(username='testuser', password='testpassword')

        # When
        response = self.client.get(url)

        # Then
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.document.id)
        self.assertEqual(response.data['text'], self.document.text)

    def test_get_document_unauthenticated(self):
        # Given
        url = reverse('document', kwargs={'project_id': self.project.id, 'document_id': self.document.id})

        # When
        response = self.client.get(url)

        # Then
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_document_nonexistent(self):
        # Given
        url = reverse('document', kwargs={'project_id': self.project.id, 'document_id': 999})
        self.client.login(username='testuser', password='testpassword')

        # When
        response = self.client.get(url)

        # Then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Document does not exist')

    def test_get_document_no_permission(self):
        # Given
        user2 = CustomUser.objects.create_user(username='user2', password='password2')
        project2 = Project.objects.create(name='Project 2', owner=user2)
        document2 = Document.objects.create(name='Document 2', owner=user2, project=project2)

        url = reverse('document', kwargs={'project_id': project2.id, 'document_id': document2.id})
        self.client.login(username='testuser', password='testpassword')

        # When
        response = self.client.get(url)

        # Then
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data['error'], 'You do not have permission to access this document')

    def test_post_document(self):
        # Given
        url = reverse('create_document')
        self.client.login(username='testuser', password='testpassword')
        data = {
            'name': 'New Document',
            'project': self.project.id,
            'text': 'This is a sample text.'
        }

        # When
        response = self.client.post(url, data, format='json')

        # Then
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('id', response.data)
        self.assertEqual(response.data['project_id'], self.project.id)
        self.assertEqual(response.data['name'], 'New Document')
        self.assertIn('timestamp', response.data)
        self.assertEqual(Document.objects.count(), 2)

    def test_post_document_unauthenticated(self):
        # Given
        url = reverse('create_document')
        data = {
            'name': 'New Document',
            'project': self.project.id,
            'text': 'This is a sample text.'
        }

        # When
        response = self.client.post(url, data, format='json')

        # Then
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(Document.objects.count(), 1)

    def test_post_document_project_nonexistent(self):
        # Given
        url = reverse('create_document')
        self.client.login(username='testuser', password='testpassword')
        data = {
            'name': 'New Document',
            'project': 999,
            'text': 'This is a sample text.'
        }

        # When
        response = self.client.post(url, data, format='json')

        # Then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Project does not exist')
        self.assertEqual(Document.objects.count(), 1)

    def test_post_document_bad_request(self):
        # Given
        url = reverse('create_document')
        self.client.login(username='testuser', password='testpassword')

        # When
        response = self.client.post(url)

        # Then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Document.objects.count(), 1)

    def test_post_document_no_permission(self):
        # Given
        user2 = CustomUser.objects.create_user(username='user2', password='password2')
        project2 = Project.objects.create(name='Project 2', owner=user2)

        url = reverse('create_document')
        self.client.login(username='testuser', password='testpassword')
        data = {
            'name': 'New Document',
            'project': project2.id,
            'text': 'This is a sample text.'
        }

        # When
        response = self.client.post(url, data, format='json')

        # Then
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data['error'], 'You do not have permission to add documents to this project')
        self.assertEqual(Document.objects.count(), 1)

    def test_delete_document(self):
        # Given
        url = reverse('document', kwargs={'project_id': self.project.id, 'document_id': self.document.id})
        self.client.login(username='testuser', password='testpassword')

        # When
        response = self.client.delete(url)

        # Then
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Document deleted successfully')
        self.assertEqual(Document.objects.count(), 0)

    def test_delete_document_unauthenticated(self):
        # Given
        url = reverse('document', kwargs={'project_id': self.project.id, 'document_id': self.document.id})

        # When
        response = self.client.delete(url)

        # Then
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(Document.objects.count(), 1)

    def test_delete_document_nonexistent(self):
        # Given
        url = reverse('document', kwargs={'project_id': self.project.id, 'document_id': 999})
        self.client.login(username='testuser', password='password')

        # When
        response = self.client.delete(url)

        # Then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Document does not exist')
        self.assertEqual(Document.objects.count(), 1)

    def test_delete_document_no_permission(self):
        # Given
        user2 = CustomUser.objects.create_user(username='user2', password='password2')
        project2 = Project.objects.create(name='Project 2', owner=user2)
        document2 = Document.objects.create(name='Document 2', owner=user2, project=project2)

        url = reverse('document', kwargs={'project_id': project2.id, 'document_id': document2.id})
        self.client.login(username='testuser', password='testpassword')

        # When
        response = self.client.delete(url)

        # Then
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data['error'], 'You do not have permission to access this document')
        self.assertEqual(Document.objects.count(), 2)

    def tearDown(self):
        self.user.delete()
        self.project.delete()
        self.document.delete()


class GetEventsTest(APITestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            username='testuser', password='testpassword'
        )
        self.project1 = Project.objects.create(
            name='Test Project 1', owner=self.user
        )
        self.project2 = Project.objects.create(
            name='Test Project 2', owner=self.user
        )

        self.project2.updated_at = self.project2.created_at + timedelta(hours=1)
        self.project2.save()

        self.document = Document.objects.create(
            name='Test Document', owner=self.user, project=self.project1
        )
        self.user.project_permissions = {
            str(self.project1.id): WRITE_PERMISSIONS,
            str(self.project2.id): WRITE_PERMISSIONS,
        }
        self.user.save()

    def test_get_events(self):
        # Given
        url = reverse('events')
        self.client.login(username='testuser', password='testpassword')

        # When
        response = self.client.get(url)

        # Then
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.data[0]['type'], 'project')
        self.assertEqual(response.data[1]['type'], 'document')

    def test_get_events_unauthenticated(self):
        # Given
        url = reverse('events')

        # When
        response = self.client.get(url)

        # Then
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_events_action(self):
        # Given
        url = reverse('events')
        self.client.login(username='testuser', password='testpassword')

        # When
        response = self.client.get(url)

        # Then
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)

        # Find the project events
        project1_event = None
        project2_event = None
        for event in response.data:
            if event['project_id'] == self.project1.id:
                project1_event = event
            elif event['project_id'] == self.project2.id:
                project2_event = event

        # Assert project1's action is 'created'
        self.assertIsNotNone(project1_event)
        self.assertEqual(project1_event['type'], 'project')
        self.assertEqual(project1_event['action'], 'created')

        # Assert project2's action is 'updated'
        self.assertIsNotNone(project2_event)
        self.assertEqual(project2_event['type'], 'project')
        self.assertEqual(project2_event['action'], 'updated')

    def tearDown(self):
        self.user.delete()
        self.project1.delete()
        self.project2.delete()
        self.document.delete()


class TagTextTest(APITestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            username='testuser', password='testpassword'
        )

    def test_tag_text(self):
        # Given
        url = reverse('tag')
        self.client.login(username='testuser', password='testpassword')
        data = {'text': 'John Doe works at Google.'}

        # When
        response = self.client.post(url, data)

        # Then
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNotNone(response.data.get('tagged_text'))

    def test_tag_text_unauthenticated(self):
        # Given
        url = reverse('tag')
        data = {'text': 'John Doe works at Google.'}

        # When
        response = self.client.post(url, data)

        # Then
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_tag_text_missing(self):
        # Given
        url = reverse('tag')
        self.client.login(username='testuser', password='testpassword')
        data = {}

        # When
        response = self.client.post(url, data)

        # Then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Text is required')

    def test_tag_text_invalid_length(self):
        # Given
        url = reverse('tag')
        self.client.login(username='testuser', password='testpassword')
        data = {'text': 'a' * 5001}

        # When
        response = self.client.post(url, data)

        # Then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Text must be between 1 and 5000 characters')

    def tearDown(self):
        self.user.delete()
