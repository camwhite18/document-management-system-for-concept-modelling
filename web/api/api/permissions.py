from rest_framework import permissions

NONE_PERMISSIONS = "none"
READ_PERMISSIONS = "read"
WRITE_PERMISSIONS = "write"
CUSTOM_PERMISSIONS = "custom"


class IsReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.method in permissions.SAFE_METHODS
