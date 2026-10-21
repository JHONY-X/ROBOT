import random
import string
from django.conf import settings
from django.core.mail import EmailMessage, send_mail
from .models import OneTimePasscode, User



def get_sender_email():
    """Get the sender address from the configured MAILERS settings."""
    return settings.MAILERS["default"]["OPTIONS"]["username"]


def send_user_mail(data):
    """Send a password-reset email in plain text and HTML."""
    subject = data["subject"]
    recipient = data["to_email"]
    reset_url = data["abs_link"]
    username = data.get("username") or "User"

    plain_message = f"""
Hi {username},

Please click the link below to reset your password:
{reset_url}

If you didn't request a password reset, ignore this email.

Thanks,
CPU College Exam Project
"""

    html_message = f"""
<html>
<body style="font-family: Arial, sans-serif; background-color: #f7f9fc; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff;
                padding: 30px; border-radius: 10px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <h2 style="color: #4a90e2;">Hello {username},</h2>
        <p style="font-size: 16px; color: #333;">
            We received a request to reset your password.
            Click the button below to proceed:
        </p>
        <a href="{reset_url}"
           style="display: inline-block; margin: 20px 0; padding: 15px 25px;
                  background-color: #4a90e2; color: #ffffff;
                  text-decoration: none; border-radius: 5px; font-weight: bold;">
           Reset Password
        </a>
        <p style="font-size: 14px; color: #555;">
            If you didn't request a password reset, you can safely ignore this email.
        </p>
        <hr style="border:none; border-top:1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #999;">
            &copy; 2026 CPU College Exam Project. All rights reserved.
        </p>
    </div>
</body>
</html>
"""

    send_mail(
        subject=subject,
        message=plain_message,
        from_email=f"N3T H4NT3R <{get_sender_email()}>",
        recipient_list=[recipient],
        fail_silently=False,
        html_message=html_message,
    )


def generate_otp():
    """Generate a six-digit OTP, including possible leading zeros."""
    return "".join(random.choices(string.digits, k=6))


def generate_password(length=12):
    """
    Generate a random password.

    This function is available for workflows that genuinely need
    a generated password. It is not used for email verification.
    """
    if length < 3:
        raise ValueError("Password length must be at least 3.")

    characters = string.ascii_letters + string.digits + string.punctuation

    password = [
        random.choice(string.ascii_letters),
        random.choice(string.digits),
        random.choice(string.punctuation),
    ]

    password.extend(
        random.choice(characters)
        for _ in range(length - 3)
    )

    random.SystemRandom().shuffle(password)

    return "".join(password)


def send_verification_email(email_address):
    """
    Generate an OTP and send an email verification message.

    IMPORTANT:
    This function must not change the user's password.
    """
    try:
        user = User.objects.get(email_address=email_address)
    except User.DoesNotExist:
        return False

    # Generate and save the OTP.
    otp = generate_otp()

    OneTimePasscode.objects.create(
        user=user,
        code=otp,
    )

    # Update this URL to your actual frontend URL when deploying.
    verify_url = "http://localhost:5173/email-verify"

    body = f"""
<html>
<head>
<style>
    body {{
        font-family: Arial, sans-serif;
        background: #f0f4f8;
        margin: 0;
        padding: 0;
    }}

    .email-container {{
        max-width: 600px;
        margin: 40px auto;
        background: #ffffff;
        border-radius: 12px;
        text-align: center;
        padding: 30px 20px;
    }}

    .header {{
        background: #4CAF50;
        padding: 25px 0;
        color: white;
        font-size: 28px;
        font-weight: bold;
    }}

    .otp-box {{
        display: inline-block;
        font-size: 32px;
        font-weight: bold;
        padding: 15px 30px;
        margin: 20px 0;
        border-radius: 10px;
        background: #4CAF50;
        color: #ffffff;
        letter-spacing: 5px;
    }}

    .otp-note {{
        font-size: 14px;
        color: #888888;
    }}

    p {{
        font-size: 16px;
        color: #555555;
        line-height: 1.6;
    }}

    .button {{
        display: inline-block;
        margin: 25px 0;
        padding: 15px 35px;
        background: #4CAF50;
        color: white;
        text-decoration: none;
        border-radius: 10px;
        font-weight: bold;
    }}

    .footer {{
        font-size: 14px;
        color: #999999;
        margin-top: 25px;
    }}
</style>
</head>
<body>
    <div class="email-container">
        <div class="header">Email Verification</div>

        <p>Hi <strong>{user.first_name}</strong>,</p>
        <p>Your One-Time Passcode (OTP) is:</p>

        <div class="otp-box">{otp}</div>

        <p class="otp-note">OTP is valid for 5 minutes only.</p>

        <p>Click the button below to open the email verification page:</p>
        <a href="{verify_url}" class="button">Verify Email</a>

        <div class="footer">
            <p>If you didn't request this email, please ignore it.</p>
        </div>
    </div>
</body>
</html>
"""

    email_msg = EmailMessage(
        subject="Email Verification",
        body=body,
        from_email=f"N3T H4NT3R <{get_sender_email()}>",
        to=[email_address],
    )

    email_msg.content_subtype = "html"
    email_msg.send(fail_silently=False)

    return True