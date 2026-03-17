from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role', 'phone', 'preferred_language']

    def validate_email(self, value):
        normalized = (value or '').strip().lower()
        if not normalized:
            raise serializers.ValidationError('Email is required.')
        if User.objects.filter(email__iexact=normalized).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return normalized

    def validate_role(self, value):
        # Public registration must not create elevated accounts.
        if value in {'admin', 'inspector'}:
            return 'farmer'
        return value

    def create(self, validated_data):
        role = validated_data.get('role', 'farmer')
        if role not in {'farmer', 'dealer'}:
            role = 'farmer'
            
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=role,
            phone=validated_data.get('phone', ''),
            preferred_language=validated_data.get('preferred_language', 'en'),
        )
        
        if role == 'dealer':
            from core.models import Dealer
            import uuid
            Dealer.objects.create(
                user=user,
                name=user.username,
                shop_name=user.username + " Shop",
                license_number="PENDING_" + str(uuid.uuid4())[:8],
                phone=user.phone or "N/A",
                address="Address pending",
                is_approved=True,
                license_status="active"
            )
            
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'phone', 'preferred_language', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserProfileSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=201)


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
