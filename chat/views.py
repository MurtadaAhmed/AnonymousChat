from django.shortcuts import render, redirect

# Create your views here.

def chatPage(request, *args, **kwargs):
    return render(request, "chat/chatPage.html")




