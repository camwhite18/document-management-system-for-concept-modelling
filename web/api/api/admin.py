from django import forms
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django_admin_hstore_widget.forms import HStoreFormField

from .models import CustomUser, Document, Project


class CustomUserAdminForm(forms.ModelForm):
    project_permissions = HStoreFormField()

    class Meta:
        model = CustomUser
        exclude = ()


class ProjectAdminForm(forms.ModelForm):
    class Meta:
        model = Project
        exclude = ()


class DocumentAdminForm(forms.ModelForm):
    class Meta:
        model = Document
        exclude = ()


class CustomUserAdmin(UserAdmin):
    form = CustomUserAdminForm
    list_display = (
        "username",
        "email",
        "first_name",
        "last_name",
        "is_staff",
        "create_projects",
        "project_permissions",
    )

    fieldsets = (
        (None, {"fields": ("username", "password")}),
        ("Personal info", {"fields": ("first_name", "last_name", "email")}),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                    "create_projects",
                    "project_permissions",
                )
            },
        ),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )

    add_fieldsets = (
        (None, {"fields": ("username", "password1", "password2")}),
        ("Personal info", {"fields": ("first_name", "last_name", "email")}),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                    "create_projects",
                    "project_permissions",
                )
            },
        ),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )


class ProjectAdmin(admin.ModelAdmin):
    form = ProjectAdminForm
    list_display = ("name", "owner", "created_at", "updated_at")
    readonly_fields = ("created_at", "updated_at")
    search_fields = ("name", "owner__username")
    list_filter = ("owner", "created_at", "updated_at")
    ordering = ("-created_at",)


class DocumentAdmin(admin.ModelAdmin):
    form = DocumentAdminForm
    list_display = ("name", "owner", "project", "created_at", "updated_at")
    readonly_fields = ("created_at", "updated_at")
    search_fields = ("name", "owner__username", "project__name")
    list_filter = ("owner", "project", "created_at", "updated_at")
    ordering = ("-created_at",)


admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Project, ProjectAdmin)
admin.site.register(Document, DocumentAdmin)
