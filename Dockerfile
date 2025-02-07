# docker build -t anonymous-chat -f Dockerfile .
# docker run --name anonymous-chat -p 80:80 anonymous-chat
# uvicorn ChatApp.asgi:application --host 0.0.0.0 --port 80
# daphne -b 0.0.0.0 -p 8000 ChatApp.asgi:application
# example with environment variable: docker run --name anonymous-chat -p 80:80 -e CSRF_TRUSTED_ORIGINS=https://anonymouschat-m4mm.onrender.com
FROM python:3.9-slim

# Set environment variables to prevent Python from buffering stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# environment variable for CSRF_TRUSTED_ORIGINS.
ENV CSRF_TRUSTED_ORIGINS=""

# Install system dependencies
RUN apt-get update && apt-get install -y sudo git dos2unix && apt-get clean

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements file and install Python dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy the rest of the application code into the container
COPY . /app/

# Expose the port your Django app runs on
EXPOSE 80

# Run migrations, create superuser (if needed), collect static files, and start the server
CMD python manage.py makemigrations && \
    python manage.py migrate && \
    python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); exit(0) if User.objects.filter(username='admin').exists() else exit(1)" || \
    (python manage.py createsuperuser --noinput --username admin --email admin@myproject.com && \
     python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); user = User.objects.get(username='admin'); user.set_password('password'); user.save()") && \
    python manage.py collectstatic --noinput && \
    exec daphne -b 0.0.0.0 -p 80 ChatApp.asgi:application
