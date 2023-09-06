from django.contrib.auth.models import AbstractUser
from django.contrib.postgres.fields import HStoreField
from django.db import models
from django_prometheus.models import ExportModelOperationsMixin


class CustomUser(ExportModelOperationsMixin('user'), AbstractUser):
    create_projects = models.BooleanField(default=False)
    project_permissions = HStoreField(blank=True, null=True)


class Project(ExportModelOperationsMixin('project'), models.Model):
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    owner = models.ForeignKey(CustomUser, on_delete=models.CASCADE)


class Document(ExportModelOperationsMixin('document'), models.Model):
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    owner = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    text = models.TextField()
    tagged_text = models.TextField(blank=True, null=True)
