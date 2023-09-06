"""web URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
# isort: skip_file
from django.contrib import admin
from django.urls import include, path, re_path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

import api.views as views

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include("django_prometheus.urls")),
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/user/", views.UserAPIView.as_view(), name="user"),
    path("api/events/", views.get_events, name="events"),
    path(
        "api/projects/",
        views.ProjectsAPIView.as_view(http_method_names=["get"]),
        name="projects",
    ),
    path(
        "api/project/<int:project_id>/",
        views.ProjectAPIView.as_view(http_method_names=["get", "delete"]),
        name="project",
    ),
    path(
        "api/project/<int:project_id>/document/<int:document_id>/",
        views.DocumentApiView.as_view(http_method_names=["get", "delete"]),
        name="document",
    ),
    path(
        "api/create/document/",
        views.DocumentApiView.as_view(http_method_names=["post"]),
        name="create_document",
    ),
    path(
        "api/create/project/",
        views.ProjectAPIView.as_view(http_method_names=["post"]),
        name="create_project",
    ),
    path("api/tag/", views.tag_text, name="tag"),
    re_path("^.*$", views.index, name="index"),
]
