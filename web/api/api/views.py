# isort: skip_file

import spacy
from django.core.exceptions import ValidationError
from django.core.validators import MinLengthValidator, MaxLengthValidator
from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.generics import CreateAPIView, DestroyAPIView, RetrieveAPIView
from rest_framework.parsers import JSONParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from spacy import displacy

from .models import CustomUser, Document, Project
from .permissions import (
    CUSTOM_PERMISSIONS,
    NONE_PERMISSIONS,
    READ_PERMISSIONS,
    WRITE_PERMISSIONS,
)
from .serializers import DocumentSerializer, ProjectSerializer, UserSerializer
from .tasks import perform_tagging
from .utils import sanitise_input_text, unescape_text

nlp = spacy.load("/home/api/ner-model")


def index(request):
    return render(request, "index.html")


class UserAPIView(RetrieveAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class ProjectsAPIView(RetrieveAPIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, *args, **kwargs):
        # Get all projects that the user has permission to view
        projects = Project.objects.filter(
            id__in=request.user.project_permissions.keys()
        )
        # Serialize the projects
        project_serializer = ProjectSerializer(projects, many=True)
        # Convert the serialized projects to a list of dictionaries
        projects = [project for project in project_serializer.data]
        # For each project, get all documents for that project
        for project in projects:
            documents = Document.objects.filter(project=project["id"])
            document_serializer = DocumentSerializer(documents, many=True)
            # Drop the text and tagged_text fields from the documents to save bandwidth
            for document in document_serializer.data:
                document.pop("text")
                document.pop("tagged_text")
            project["documents"] = document_serializer.data
        return Response(projects, status=200)


class ProjectAPIView(RetrieveAPIView, CreateAPIView, DestroyAPIView):
    permission_classes = (IsAuthenticated,)

    @staticmethod
    def check_exists_and_permission(request, project_id) -> (object, Response):
        # If project does not exist, return 400
        if not Project.objects.filter(id=project_id).exists():
            return None, Response({"error": "Project does not exist"}, status=400)
        project = Project.objects.get(id=project_id)
        project_serializer = ProjectSerializer(project)
        # Check if user has permission to view project
        if (
                request.user.project_permissions.get(str(project_serializer.data["id"]))
                is None
        ):
            return None, Response(
                {"error": "You do not have permission to access this project"}, status=403
            )
        return project, None

    def get(self, request, *args, **kwargs):
        project_id = kwargs.get("project_id")
        project, error = self.check_exists_and_permission(request, project_id)
        if error:
            return error
        # Get all documents for this project
        project_serializer = ProjectSerializer(project)
        documents = Document.objects.filter(project=project_serializer.data["id"])
        document_serializer = DocumentSerializer(documents, many=True)
        # Drop the text and tagged_text fields from the documents to save bandwidth
        for document in document_serializer.data:
            document.pop("text")
            document.pop("tagged_text")
        project_docs = {"documents": document_serializer.data}
        return Response(
            {**project_serializer.data, **project_docs}, status=200
        )

    def post(self, request, *args, **kwargs):
        project_data = JSONParser().parse(request)
        project_data["owner"] = request.user.id
        try:
            project_data["permissions"] = project_data["permissions"].lower()
        except KeyError:
            project_data["permissions"] = NONE_PERMISSIONS
        # Check if user has permission to create projects
        if not request.user.create_projects:
            return Response(
                {"error": "You do not have permission to create projects"}, status=403
            )
        project_serializer = ProjectSerializer(data=project_data)
        if project_serializer.is_valid():
            project_serializer.save()
            # If permissions is set to "write", for each user in the system add the project to their permissions
            if project_data["permissions"] == WRITE_PERMISSIONS:
                for user in CustomUser.objects.all():
                    user.project_permissions[
                        project_serializer.data["id"]
                    ] = WRITE_PERMISSIONS
                    user.save()
            # If permissions is set to "read", for each user in the system, add the project to their permissions
            elif project_data["permissions"] == READ_PERMISSIONS:
                for user in CustomUser.objects.all():
                    user.project_permissions[
                        project_serializer.data["id"]
                    ] = READ_PERMISSIONS
                    user.save()
            # If permissions is set to "custom", for each user in the system add the project to their permissions
            elif project_data["permissions"] == CUSTOM_PERMISSIONS:
                for user in CustomUser.objects.all():
                    if user.username in project_data["custom_permissions"]:
                        user.project_permissions[
                            project_serializer.data["id"]
                        ] = project_data["custom_permissions"][user.username]
                        user.save()
            # Add project to user's project permissions
            request.user.project_permissions[
                project_serializer.data["id"]
            ] = WRITE_PERMISSIONS
            request.user.save()
            return Response(
                {
                    "id": project_serializer.data["id"],
                    "name": project_serializer.data["name"],
                    "timestamp": project_serializer.data["created_at"],
                },
                status=201,
            )
        return Response(project_serializer.errors, status=400)

    def delete(self, request, *args, **kwargs):
        project_id = kwargs.get("project_id")
        project, error = self.check_exists_and_permission(request, project_id)
        if error:
            return error
        project.delete()
        # Remove project from each user's project_permissions
        for user in CustomUser.objects.all():
            try:
                del user.project_permissions[str(project_id)]
                user.save()
            except KeyError:
                pass
        return Response({"message": "Project deleted successfully"}, status=200)


class DocumentApiView(RetrieveAPIView, CreateAPIView, DestroyAPIView):
    permission_classes = (IsAuthenticated,)

    @staticmethod
    def check_exists_and_permission(
            request, project_id, document_id
    ) -> (object, Response):
        # If document does not exist, return 400
        if not Document.objects.filter(id=document_id).exists():
            return None, Response({"error": "Document does not exist"}, status=400)
        # Check if user has permission to view project
        if request.user.project_permissions.get(str(project_id)) is None:
            return None, Response(
                {"error": "You do not have permission to access this document"}, status=403
            )
        document = Document.objects.get(id=document_id, project=project_id)
        return document, None

    def get(self, request, *args, **kwargs):
        project_id = kwargs.get("project_id")
        document_id = kwargs.get("document_id")
        document, error = self.check_exists_and_permission(
            request, project_id, document_id
        )
        document_serializer = DocumentSerializer(document)
        return Response(document_serializer.data, status=200)

    def post(self, request, *args, **kwargs):
        document_data = JSONParser().parse(request)
        document_data["owner"] = request.user.id
        document_serializer = DocumentSerializer(data=document_data)
        if document_serializer.is_valid():
            # Check if project exists
            if not Project.objects.filter(id=document_data["project"]).exists():
                return Response({"error": "Project does not exist"}, status=400)
            # Check if user has write permissions for the project
            if (
                    request.user.project_permissions.get(document_data["project"])
                    != WRITE_PERMISSIONS
            ):
                return Response(
                    {
                        "error": "You do not have permission to add documents to this project"
                    },
                    status=403,
                )
            document_serializer.save()
            # Use Celery to perform tagging in the background
            perform_tagging.delay(
                document_serializer.data["id"], document_serializer.data["project"]
            )
            # Update project's updated_at field
            project = Project.objects.get(id=document_data["project"])
            project.save()
            return Response(
                {
                    "id": document_serializer.data["id"],
                    "project_id": document_serializer.data["project"],
                    "name": document_serializer.data["name"],
                    "timestamp": document_serializer.data["created_at"],
                },
                status=201,
            )
        return Response(document_serializer.errors, status=400)

    def delete(self, request, *args, **kwargs):
        project_id = kwargs.get("project_id")
        document_id = kwargs.get("document_id")
        document, error = self.check_exists_and_permission(
            request, project_id, document_id
        )
        document.delete()
        return Response({"message": "Document deleted successfully"}, status=200)


# Get all the recent events that have happened for the user from the updated_at field of projects and documents
@api_view(http_method_names=["GET"])
def get_events(request):
    # Check if user is authenticated
    if not bool(request.user and request.user.is_authenticated):
        return Response(status=401)
    # Get all projects that the user has access to
    projects = Project.objects.filter(
        id__in=request.user.project_permissions.keys()
    ).order_by("-updated_at")
    # Get all documents that the user has access to
    documents = Document.objects.filter(
        project__id__in=request.user.project_permissions.keys()
    ).order_by("-updated_at")
    # Combine the projects and documents into a single list of events
    events = []
    for project in projects:
        events.append(
            {
                "type": "project",
                "project_id": project.id,
                "document_id": None,
                "name": project.name,
                "timestamp": project.updated_at,
                "action": "created"
                if project.created_at.strftime("%Y-%m-%d %H:%M:%S.%f")[:-5]
                   == project.updated_at.strftime("%Y-%m-%d %H:%M:%S.%f")[:-5]
                else "updated",
            }
        )
    for document in documents:
        events.append(
            {
                "type": "document",
                "project_id": document.project.id,
                "document_id": document.id,
                "name": document.name,
                "timestamp": document.updated_at,
                "action": "created"
                if document.created_at.strftime("%Y-%m-%d %H:%M:%S")[:-5]
                   == document.updated_at.strftime("%Y-%m-%d %H:%M:%S")[:-5]
                else "updated",
            }
        )
    # Sort the events by timestamp
    events.sort(key=lambda x: x["timestamp"], reverse=True)
    # Take the first 10 events
    events = events[:10]
    return Response(events, status=200)


@api_view(http_method_names=["POST"])
def tag_text(request):
    # Ensure that the user is authenticated
    if not bool(request.user and request.user.is_authenticated):
        return Response(status=401)
    # Ensure that the text is provided
    text = request.data.get("text")
    if text is None:
        return Response({"error": "Text is required"}, status=400)
    # Ensure that the text is between 1 and 5000 characters to prevent DoS attacks
    try:
        MinLengthValidator(1)(text)
        MaxLengthValidator(5000)(text)
    except ValidationError:
        return Response({"error": "Text must be between 1 and 5000 characters"}, status=400)
    # Use displacy to generate the HTML for the tagged text
    html = displacy.render(nlp(sanitise_input_text(text)), style="ent", minify=True)
    return Response({"tagged_text": unescape_text(html)}, status=200)
