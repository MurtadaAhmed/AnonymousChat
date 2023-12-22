from django.urls import path
from . import views as chat_views
from django.contrib.auth import views as auth_views


urlpatterns = [
    path("", chat_views.chatPage, name="chat-page"),
    path("signup/", chat_views.signup, name="signup"),
    path("login/", auth_views.LoginView.as_view(template_name="chat/login.html"), name="login"),
    path("logout/", auth_views.LogoutView.as_view(), name="logout"),
    
]