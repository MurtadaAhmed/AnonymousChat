from django.shortcuts import render, redirect
from django.contrib.auth import login
from .forms import SignUpForm


def chatPage(request, *args, **kwargs):
    return render(request, "chat/chatPage.html")

def signup(request, *args, **kwargs):
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            # This saves the user to the database
            user = form.save()
            # This logs the user in
            login(request, user)
            return redirect('chat-page')
    else:
        form = SignUpForm()
    return render(request, 'chat/signup.html', {'form': form})
