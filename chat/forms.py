from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User


# This is a form for the user to sign up
class SignUpForm(UserCreationForm):
    class Meta:
        model = User
        fields = ('username', 'email', 'password1', 'password2')
