from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
import uuid 

# Create your models here.
class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email :
            raise ValueError("l'email est obligatoire")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff",True)
        extra_fields.setdefault("is_superuser",True)
        return self.create_user(email, password, **extra_fields) 

class User(AbstractBaseUser, PermissionsMixin):
    PLAN_CHOICES = [
        ("free","Free"),
        ("pro","Pro"),
        ("business","Business"),
    ]
    id                  = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email               = models.EmailField(unique=True)
    name                = models.CharField(max_length=100)
    plan                = models.CharField(max_length=20, choices=PLAN_CHOICES, default="free")
    api_key             = models.UUIDField(default=uuid.uuid4, unique=True, editable=False) 
    is_active           = models.BooleanField(default=True)
    is_staff            = models.BooleanField(default=False)
    created_at          = models.DateTimeField(auto_now_add=True)

    objects             = UserManager()

    USERNAME_FIELD      = "email"
    REQUIRED_FIELDS = ["name"] 

    def __str__(self):
        return f"{self.name} ({self.email})"

