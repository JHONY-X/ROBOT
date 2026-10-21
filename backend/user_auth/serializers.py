from rest_framework import serializers
from .models import User, Invitation
from django.utils.translation import gettext_lazy as _
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from django.contrib.auth.models import Group
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken, TokenError
from django.utils.encoding import force_str, smart_bytes
from django.contrib.sites.shortcuts import get_current_site
from django.urls import reverse
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from .utils import send_user_mail
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.db import transaction
from datetime import date




class Invitation_Serializer(serializers.Serializer):
    token = serializers.UUIDField(read_only=True)
    is_used = serializers.BooleanField(default=False, read_only=True)
    email_address = serializers.EmailField(max_length=50)
    created_at = serializers.DateField(read_only=True)
    expires_date = serializers.DateField()

    class Meta:
        model = Invitation
        fields = ["token", "is_used", "email_address", "created_at", "expires_date"]


#===============================
class User_Register_Serializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    first_name = serializers.CharField(max_length=20)
    last_name = serializers.CharField(max_length=20)
    email_address = serializers.EmailField(max_length=50)
    phone_number = serializers.CharField(max_length=10)
    password = serializers.CharField(min_length=8, max_length=100, write_only=True)
    password2 = serializers.CharField(min_length=8, max_length=100, write_only=True)
    invitation_link = serializers.CharField(write_only=True, min_length=4, required=False, allow_blank=False)

    def validate(self, attrs):

        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password2": "The two passwords do not match."})

        if User.objects.filter(email_address=attrs["email_address"]).exists():
            raise serializers.ValidationError({"email_address": "This email address already exists."})

        if User.objects.filter(phone_number=attrs["phone_number"]).exists():
            raise serializers.ValidationError({"phone_number": "This phone number already exists."})

        invitation_token = attrs.get("invitation_link")

        if invitation_token:

            try:
                invitation = Invitation.objects.get(token=invitation_token)

            except Invitation.DoesNotExist:
                raise serializers.ValidationError({"invitation_link": "Invalid invitation link."})

            if invitation.is_used:
                raise serializers.ValidationError({"invitation_link": ("This invitation link has already been used.")})

            if invitation.expires_date < date.today():
                raise serializers.ValidationError({"invitation_link": "This invitation link has expired."})

        return attrs

    @transaction.atomic
    def create(self, validated_data):

        password = validated_data.pop("password")
        validated_data.pop("password2")
        invitation_token = validated_data.pop("invitation_link", None)

        invitation = None

        if invitation_token:

            try:
                invitation = Invitation.objects.select_for_update().get(
                    token=invitation_token
                )

            except Invitation.DoesNotExist:
                raise serializers.ValidationError({
                    "invitation_link": "Invalid invitation link."
                })

            if invitation.is_used:
                raise serializers.ValidationError({
                    "invitation_link": (
                        "This invitation link has already been used."
                    )
                })

            if invitation.expires_date < date.today():
                raise serializers.ValidationError({
                    "invitation_link": "This invitation link has expired."
                })

        user = User.objects.create_user(
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
            email_address=validated_data["email_address"],
            phone_number=validated_data["phone_number"],
            password=password,
        )

        group_name = ("Professionals" if invitation else "Employer")
        group, _ = Group.objects.get_or_create(name=group_name)

        user.groups.add(group)

        if invitation:
            invitation.is_used = True
            invitation.save(update_fields=["is_used"])

        return user
#===============================
 
class Verify_User_Email_Serializer(serializers.Serializer):
    code = serializers.CharField(max_length=6)
    phone = serializers.CharField(max_length=50)

    class Meta:
        fileds = ["code", "phone"]


class User_Login_Serializer(TokenObtainPairSerializer):

    default_error_messages = {
        "no_active_account": (
            "Invalid email or password, or your account is inactive."
        ),
    }

    def validate(self, attrs):
        try:
            data = super().validate(attrs)

        except AuthenticationFailed:
            raise AuthenticationFailed(
                "Invalid email or password, or your account is inactive."
            )

        if not self.user.is_active:
            raise AuthenticationFailed(
                "Your account is inactive. Please contact support."
            )

        return data

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token["last_login"] = (
            user.last_login.isoformat()
            if user.last_login else None
        )
        token["join_date"] = (
            user.join_date.isoformat()
            if user.join_date else None
        )
        token["first_name"] = user.first_name
        token["last_name"] = user.last_name
        token["phone_number"] = user.phone_number
        token["email_address"] = user.email_address

        group = user.groups.first()
        token["role"] = group.name if group else ""

        return token


class Reset_Password_Request_Serializer(serializers.Serializer):
    email_address = serializers.EmailField(max_length=50)

    class Meta:
        fields = ["email_address"]

    def validate(self, attrs):
        phone = attrs.get("email_address")

        if User.objects.filter(phone_number=phone).exists():
            user = User.objects.get(phone_number=phone)
            uidb64 = urlsafe_base64_encode(smart_bytes(user.id))
            token = PasswordResetTokenGenerator().make_token(user)
            # request = self.context.get("request")
            # site_domain = get_current_site(request).domain
            # link = reverse("reset-password-confirm", kwargs={"uidb64":uidb64, "token":token})
            abs_link = f"http://localhost:5173/reset-password/{uidb64}/{token}"
            email_body = f"Hi, {user.first_name} use this link to rest your password \n {abs_link}"

            data = {
                "subject": "Reset Password Link",
                "email_body": email_body,
                "to_email": user.email_address,
                "abs_link": abs_link,
                "username": user.first_name
            }

            send_user_mail(data)

        return attrs
    
class Set_New_Password_Serializer(serializers.Serializer):
    password_1 = serializers.CharField(min_length=8, write_only=True)
    password_2 = serializers.CharField(min_length=8, write_only=True)
    uidb64 = serializers.CharField(write_only=True)
    token = serializers.CharField(write_only=True)

    class Meta:
        fields = ["password_1", "password_1", "uidb64", "token"]

    def validate(self, attrs):
        try:
            password_1 = attrs.get("password_1")
            password_2 = attrs.get("password_2")
            uidb64 = attrs.get("uidb64")
            token = attrs.get("token")

            user_id = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(id=user_id)
            if not PasswordResetTokenGenerator().check_token(user, token):
                raise AuthenticationFailed("Invalid Token", 401)

            if password_1 != password_2:
                raise AuthenticationFailed("The two Password are not Match!")
            
            user.set_password(password_2)
            user.save()
            return user
        
        except Exception as e:
            raise AuthenticationFailed("Invalid Token!")
        
class User_Logut_Serializer(serializers.Serializer):
    refresh_token = serializers.CharField()

    class Meta:
        fields = ["refresh_token"]

    default_error_messages = {
        "bad_token": "Token is invalid or expired."
    }

    def validate(self, attrs):
        self.refresh_token = attrs.get("refresh_token")
        return attrs

    def save(self, **kwargs):
        try:
            token = RefreshToken(self.refresh_token)
            token.blacklist()
        except TokenError:
            self.fail("bad_token")
        
class Update_User_Profile_Serilizer(serializers.Serializer):
    first_name = serializers.CharField(max_length=20)
    last_name = serializers.CharField(max_length=20)
    phone_number = serializers.CharField(max_length=10)
    email_address = serializers.CharField(read_only=True)

    profile_picture = serializers.ImageField(required=False)

    class Meta:
        fields = ["first_name", "email_address", "last_name", "phone_number", "profile_picture"]

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class Update_User_Password_Serilizer(serializers.Serializer):
    current_password = serializers.CharField()
    password_1 = serializers.CharField()
    password_2 = serializers.CharField()

    def validate(self, attrs):
        user = self.context["user"]

        if not user.check_password(attrs["current_password"]):
            raise serializers.ValidationError("Current password is incorrect")

        if attrs["password_1"] != attrs["password_2"]:
            raise serializers.ValidationError("Passwords do not match")

        return attrs

    def save(self):
        user = self.context["user"]
        user.set_password(self.validated_data["password_1"])
        user.save()
        return user