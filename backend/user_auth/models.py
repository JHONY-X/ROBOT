import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.utils.translation import gettext_lazy as _
from .manager import User_Manager
from django.utils import timezone
from datetime import timedelta



class Invitation(models.Model):
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    email_address = models.EmailField(max_length=50)
    is_used = models.BooleanField(default=False)
    created_at = models.DateField(auto_now_add=True)
    expires_date = models.DateField()

    def __str__(self):
        return self.email_address


class User(AbstractBaseUser, PermissionsMixin):
    profile_picture = models.ImageField(null=True, blank=True, upload_to="Profile/")
    first_name = models.CharField(max_length=20, verbose_name=_("First Name"))
    last_name = models.CharField(max_length=20, verbose_name=_("Last Name"))
    email_address = models.EmailField(max_length=50, editable=False, unique=True, verbose_name=_("Email Address"))
    phone_number = models.CharField(max_length=10, unique=True, verbose_name=_("Phone Number"))

    join_date = models.DateField(auto_now_add=True)
    last_login = models.DateTimeField(auto_now=True)

    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    is_active = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)

    USERNAME_FIELD = "email_address"
    REQUIRED_FIELDS = ["first_name", "last_name", "phone_number"]

    objects = User_Manager()

    def __str__(self):
        return self.email_address
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"



class OneTimePasscode(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    attempts = models.PositiveIntegerField(default=0)
    locked_until = models.DateTimeField(null=True, blank=True)

    MAX_ATTEMPTS = 3
    EXPIRY_MINUTES = 5
    LOCK_MINUTES = 15

    def __str__(self):
        return self.user.phone_number

    def is_expired(self):
        return timezone.now() > self.created_at + timedelta(minutes=self.EXPIRY_MINUTES)

    def is_locked(self):
        return self.locked_until and timezone.now() < self.locked_until

    def register_failed_attempt(self):
        self.attempts += 1
        if self.attempts >= self.MAX_ATTEMPTS:
            self.locked_until = timezone.now() + timedelta(minutes=self.LOCK_MINUTES)
        self.save()