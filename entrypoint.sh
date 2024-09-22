#!/bin/bash

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create a superuser if it doesn't exist
if ! python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); exit(0) if User.objects.filter(username='admin').exists() else exit(1)"; then
  python manage.py createsuperuser --noinput --username admin --email admin@myproject.com
  python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); user = User.objects.get(username='admin'); user.set_password('password'); user.save()"
fi

# Collect static files
python manage.py collectstatic --noinput

# Start Uvicorn server
exec uvicorn ChatApp.asgi:application --host 0.0.0.0 --port 80
