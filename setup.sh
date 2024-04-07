#!/bin/bash

# Update the system packages
sudo apt update

# Install pip for Python 3
sudo apt install python3-pip

# Check if python3 is available, if not use python
if command -v python3 &>/dev/null; then
    PYTHON=python3
else
    PYTHON=python
fi

# Install the Python dependencies
pip install -r requirements.txt

# Install the required WebSocket support for uvicorn
pip install 'uvicorn[standard]'

# Run Django management commands
$PYTHON manage.py makemigrations
$PYTHON manage.py migrate
echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('admin', 'admin@myproject.com', 'password')" | $PYTHON manage.py shell

# Collect static files
$PYTHON manage.py collectstatic --noinput

# Create a new script to run the server
echo "nohup sudo uvicorn ChatApp.asgi:application --host 0.0.0.0 --port 80 &" > run.sh

# Add execute permissions to the new script
chmod +x run.sh

# Run the Uvicorn server

./run.sh

