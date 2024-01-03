from django.db import models


class Chat(models.Model):
    username = models.CharField(max_length=100)
    message = models.TextField()
    image = models.ImageField(upload_to='chat_images/', blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    group_name = models.CharField(max_length=100, blank=True, null=True)



