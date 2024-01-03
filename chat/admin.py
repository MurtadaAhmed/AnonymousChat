from django.contrib import admin
from .models import Chat


class ChatAdmin(admin.ModelAdmin):
    list_display = ['username', 'message', 'image', 'timestamp', 'ip_address', 'group_name']
    search_fields = ['username', 'message', 'ip_address', 'group_name', 'timestamp',]


admin.site.register(Chat, ChatAdmin)
