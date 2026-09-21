from django.urls import path

from .views import (
    APIKeyDetailView,
    ApplicationDetailView,
    ApplicationListCreateView,
    ApplicationUsersView,
    ApplicationActivityView,
    CreateAPIKeyView,
    DashboardSummaryView,
)


urlpatterns = [
    path("", ApplicationListCreateView.as_view(), name="application-list-create"),
    path("dashboard/", DashboardSummaryView.as_view(), name="dashboard-summary"),
    path("<uuid:application_id>/", ApplicationDetailView.as_view(), name="application-detail"),
    path("<uuid:application_id>/users/", ApplicationUsersView.as_view(), name="application-users"),
    path("<uuid:application_id>/activity/", ApplicationActivityView.as_view(), name="application-activity"),
    path(
        "<uuid:application_id>/api-keys/",
        CreateAPIKeyView.as_view(),
        name="create-api-key"
    ),
    path(
        "<uuid:application_id>/api-keys/<uuid:key_id>/",
        APIKeyDetailView.as_view(),
        name="api-key-detail",
    ),
]
