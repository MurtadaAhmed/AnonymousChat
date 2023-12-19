from django.urls import path
from . import views as chat_views
from django.contrib.auth.views import LoginView, LogoutView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("", chat_views.chatPage, name="chat-page"),
    
] + static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])