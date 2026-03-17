from django.contrib.auth.models import AbstractUser
from django.db import models
from django.contrib.auth.validators import UnicodeUsernameValidator


class CustomUser(AbstractUser):
    username_validator = UnicodeUsernameValidator()

    username = models.CharField(
        max_length=150,
        unique=False,
        validators=[username_validator],
        help_text='Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.',
        error_messages={
            'invalid': 'Enter a valid username. This value may contain only letters, numbers, and @/./+/-/_ characters.',
        },
    )
    email = models.EmailField('email address', unique=True, null=True, blank=True)

    ROLE_CHOICES = [
        ('farmer', 'Farmer'),
        ('dealer', 'Dealer'),
        ('admin', 'Admin'),
        ('inspector', 'Inspector'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='farmer')
    phone = models.CharField(max_length=15, blank=True)
    preferred_language = models.CharField(
        max_length=10,
        choices=[('en', 'English'), ('hi', 'Hindi'), ('mr', 'Marathi'), ('pa', 'Punjabi')],
        default='en',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return f"{self.email or self.username} ({self.role})"
