#!/bin/bash

# Update the system packages
sudo apt update

# Install pip for Python 3
sudo apt install python3-pip

# Install the Python dependencies
pip install -r requirements.txt

# Run Django management commands
python3 manage.py makemigrations
python3 manage.py migrate
echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('admin', 'admin@myproject.com', 'password')" | python3 manage.py shell

# Collect static files
python3 manage.py collectstatic --noinput

# Run the Uvicorn server
sudo uvicorn ChatApp.asgi:application --host 0.0.0.0 --port 80
