from rest_framework import serializers


class SendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    name = serializers.CharField(max_length=150, required=False, allow_blank=True)


class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(
        min_length=6,
        max_length=6,
        trim_whitespace=False,
    )

    def validate_otp(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("OTP must contain exactly 6 digits.")
        return value


class EndUserTokenRefreshSerializer(serializers.Serializer):
    refresh = serializers.CharField()


class TokenIntrospectionSerializer(serializers.Serializer):
    token = serializers.CharField(trim_whitespace=True)


class OAuthExchangeSerializer(serializers.Serializer):
    code = serializers.CharField(trim_whitespace=True)
