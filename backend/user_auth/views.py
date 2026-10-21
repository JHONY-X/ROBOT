from django.utils import timezone
from rest_framework import status
from .models import User, OneTimePasscode, Invitation
from rest_framework.response import Response
from rest_framework.generics import GenericAPIView, CreateAPIView
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import (
    User_Register_Serializer,
    Verify_User_Email_Serializer,
    User_Login_Serializer,
    Reset_Password_Request_Serializer,
    Set_New_Password_Serializer,
    User_Logut_Serializer,
    Update_User_Profile_Serilizer,
    Update_User_Password_Serilizer,
    Invitation_Serializer,
    )
from .utils import send_verification_email
from .throttles import Login_Throttle
from django.utils.encoding import smart_str, DjangoUnicodeDecodeError
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from rest_framework.permissions import (
    AllowAny,
    IsAdminUser,
    IsAuthenticated,
    DjangoModelPermissions,
)





class Invitation_Create_Views(CreateAPIView):
    serializer_class = Invitation_Serializer
    # permission_classes = [IsAdminUser]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        expires_date = serializer.validated_data["expires_date"]

        if expires_date <= timezone.localdate():
            return Response(
                {"expires_date": "The expiration date must be in the future."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        Invitation.objects.create(
            email_address=serializer.validated_data["email_address"],
            expires_date=expires_date,
        )

        return Response(
            "Invitation Link was Created",
            status=status.HTTP_201_CREATED,
        )

class Invitations(GenericAPIView):
    serializer_class=Invitation_Serializer
    # permission_classes=[IsAdminUser]
    queryset=Invitation.objects.all()

    def get(self, request):
        invitations = self.get_queryset()
        serializer = self.serializer_class(invitations, many=True)
        return Response(
            {
                "data": serializer.data
            },status=status.HTTP_200_OK
        )


class User_Signup_Views(GenericAPIView):
    serializer_class = User_Register_Serializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()

            data = serializer.data
            email = data["email_address"]
            # send_verification_email(email)

            return Response(
                {
                    "msg": "User is successfully Reristered",
                    "data": data
                },status=status.HTTP_201_CREATED
            )
        return Response(
            {
                "msg": "User Reristered Field"
            },status=status.HTTP_400_BAD_REQUEST
        )
  
class Verify_User_Email_Views(GenericAPIView):
    serializer_class = Verify_User_Email_Serializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        phone = serializer.validated_data["phone"]
        code = serializer.validated_data["code"]

        try:
            user_otp = OneTimePasscode.objects.select_related("user").get(
                user__phone_number=phone
            )
        except OneTimePasscode.DoesNotExist:
            return Response(
                {"msg": "Invalid OTP"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if user_otp.is_locked():
            return Response(
                {"msg": "Too many attempts. Try again later."},
                status=status.HTTP_403_FORBIDDEN
            )

        if user_otp.is_expired():
            user_otp.delete()
            return Response(
                {"msg": "OTP has expired. Please request a new one."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if user_otp.code != code:
            user_otp.register_failed_attempt()
            return Response(
                {"msg": "Invalid OTP"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = user_otp.user

        if user.is_active:
            user_otp.delete()
            return Response(
                {"msg": "Email is already verified"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.is_active = True
        user.save(update_fields=["is_active"])
        user_otp.delete()

        return Response(
            {"msg": "Email verified successfully"},
            status=status.HTTP_200_OK
        )

class User_Login_Views(TokenObtainPairView):
    permission_classes = [AllowAny]
    throttle_classes = [Login_Throttle]
    serializer_class = User_Login_Serializer


class User_Logout(GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = User_Logut_Serializer

    def post(self, request):
        serialized = self.serializer_class(data=request.data)
        serialized.is_valid(raise_exception=True)
        serialized.save()
        return Response(
            {"msg": "Logout successful"},
            status=status.HTTP_205_RESET_CONTENT
        )

class Reset_Password_Request(GenericAPIView):
    serializer_class = Reset_Password_Request_Serializer
    
    def post(self, request):
        serializer = self.serializer_class(data=request.data, context={"request":request})
        serializer.is_valid(raise_exception=True)
        return Response("Please Check email", status=status.HTTP_200_OK)
    
class Reset_Password_Comfirm(GenericAPIView):

    def get(self, request, uidb64, token):
        try:
            user_id = smart_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(id=user_id)

            if not PasswordResetTokenGenerator().check_token(user, token):
                return Response("invalid Token", status=status.HTTP_401_UNAUTHORIZED)
            
            return Response({
                "success":True,
                "msg":"token is valid",
                "uidb64":uidb64,
                "token":token,
            },status=status.HTTP_200_OK)

        except DjangoUnicodeDecodeError:
            return Response("Invalid token", status=status.HTTP_401_UNAUTHORIZED)
        
class Set_New_Password(GenericAPIView):
    serializer_class = Set_New_Password_Serializer

    def put(self, request):

        serialized = self.serializer_class(data=request.data)
        serialized.is_valid(raise_exception=True)
        return Response({
            "msg":"passwors rest successfull"
        },status=status.HTTP_200_OK)

class Update_User_Profile(GenericAPIView):
    serializer_class = Update_User_Profile_Serilizer
    # permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user

        serializer = self.serializer_class(
            user,
            data=request.data,
            partial=True
        )

        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {
                "msg": "Profile updated successfully",
                "data": serializer.data
            },
            status=status.HTTP_200_OK
        )
    
class Update_User_Password(GenericAPIView):
    # permission_classes = [IsAuthenticated]
    
    def patch(self, request):
        serializer = Update_User_Password_Serilizer(
            data=request.data,
            context={"user": request.user}
        )

        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {
                "msg": "Password changed successfully"
            },
            status=status.HTTP_200_OK
        )

class Get_Profile(GenericAPIView):
    queryset = User.objects.all()
    serializer_class = Update_User_Profile_Serilizer
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = self.serializer_class(user, context={"request": request})
        return Response(serializer.data)