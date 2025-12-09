from django.contrib import admin
from django.http import HttpResponse
from django.urls import include, path


def root(request):
    return HttpResponse("Backend is running. Visit /admin/ or /api/ for available endpoints.")


urlpatterns = [
    path("", root, name="root"),
    path("admin/", admin.site.urls),
    path("api/", include("pos.urls")),
]

