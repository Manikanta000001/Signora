from rest_framework import serializers
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User


class DeveloperSignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    class Meta:
        model = User
        fields = (
            "username",
            "email",
            "password",
        )

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )

        return user


class DeveloperTokenObtainPairSerializer(TokenObtainPairSerializer):

    username_field = "email"

    def validate(self, attrs):
        email = attrs.get("email", "").strip()

        user = User.objects.filter(
            email__iexact=email,
            is_active=True
        ).first()

        if not user or not user.check_password(attrs["password"]):
            raise AuthenticationFailed("Invalid email or password.")

        refresh = RefreshToken.for_user(user)
        data = {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }
        data["user"] = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "provider": "password",
        }
        return data
