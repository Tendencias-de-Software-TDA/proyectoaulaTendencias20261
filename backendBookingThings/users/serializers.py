from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'role', 'email']

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)
    

class CustomTokenSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token['username'] = user.username
        token['role'] = user.role

        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        data['role'] = self.user.role
        data['email'] = self.user.email

        return data