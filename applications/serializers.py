from rest_framework import serializers
from .models import APIKey, Application

class CreateAPIKeySerializer(serializers.Serializer):

    name = serializers.CharField(
        max_length=100
    )


class ApplicationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Application
        fields = (
            "id",
            "name",
            "website_url",
            "environment",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
        )


class APIKeySerializer(serializers.ModelSerializer):
    class Meta:
        model = APIKey
        fields = (
            "id",
            "name",
            "key_prefix",
            "last_used_at",
            "revoked",
            "created_at",
        )
        read_only_fields = fields
