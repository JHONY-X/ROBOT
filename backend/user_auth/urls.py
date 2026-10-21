from django.urls import path
from .views import (
    User_Signup_Views,
    User_Login_Views,
    Verify_User_Email_Views,
    Reset_Password_Request,
    Reset_Password_Comfirm,
    Set_New_Password,
    User_Logout,
    Update_User_Profile,
    Update_User_Password,
    Invitation_Create_Views,
    Invitations
    # Get_Profile,
    )
from rest_framework_simplejwt.views import TokenRefreshView



urlpatterns = [
    path("invitations/", Invitations.as_view(), name="invitations"),
    path("user-invit/", Invitation_Create_Views.as_view(), name="invitation-create"),
    path("register/", User_Signup_Views.as_view(), name="signup-user"),
    path("verify-email/", Verify_User_Email_Views.as_view(), name="verify-email"),
    path("login/", User_Login_Views.as_view(), name="user-login"),
    path("logout/", User_Logout.as_view()),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("forget-password/", Reset_Password_Request.as_view()),
    path("reset-password-confirm/<uidb64>/<token>/", Reset_Password_Comfirm.as_view(), name="reset-password-confirm"),
    path("reset-password/", Set_New_Password.as_view()),
    path("change-profile/", Update_User_Profile.as_view()),
    path("change-password/", Update_User_Password.as_view()),
    # path("profile/", Get_Profile.as_view()),
]