from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.contrib.auth.models import BaseUserManager
from django.utils.translation import gettext_lazy as _



class User_Manager(BaseUserManager):
    
    def email_Validation(self, email):

        try:
            validate_email(email)

        except ValidationError:
            raise ValueError(_("Please Insert Valid Email Address"))
        
    def create_user(self, first_name, last_name, email_address, phone_number, password, **extra_fields):

        if email_address:
            email_address = self.normalize_email(email_address)
            self.email_Validation(email_address)

        else:
            raise ValueError(_("Email Address is Required!"))
        
        if not first_name:
            raise ValueError(_("First Name is Required!"))
        
        if not last_name:
            raise ValueError(_("Last Name is Required!"))
        
        user = self.model(
            first_name=first_name,
            last_name=last_name,
            email_address=email_address,
            phone_number=phone_number,
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)

        return user
    
    def create_superuser(self, first_name, last_name, email_address, phone_number, password, **extra_fields):
        extra_fields.setdefault("is_verified", True)
        extra_fields.setdefault("is_active", True)
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is False:
            raise ValueError(_("is Staff is must be True for admin user"))

        if extra_fields.get("is_superuser") is False:
            raise ValueError(_("is Super User is must be True for admin user"))
        
        user = self.create_user(first_name, last_name, email_address, phone_number, password, **extra_fields)
        user.save(using=self._db)

        return user