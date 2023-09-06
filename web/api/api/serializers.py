from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Document, Project


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ("id", "username", "create_projects", "project_permissions")


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ("id", "name", "owner", "created_at", "updated_at")


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ("id", "name", "owner", "project", "created_at", "updated_at", "text", "tagged_text")
