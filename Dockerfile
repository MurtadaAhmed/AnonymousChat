# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set environment variables to prevent Python from buffering stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies including sudo, git, and dos2unix
RUN apt-get update \
    && apt-get install -y sudo git dos2unix \
    && apt-get clean

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements file and install Python dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip \
    && pip install -r requirements.txt

# Copy the rest of the application code into the container
COPY . /app/

# Copy the entrypoint script
COPY entrypoint.sh /app/

# Make the entrypoint script executable
RUN chmod +x /app/entrypoint.sh

# Expose the port your Django app runs on
EXPOSE 80

# Run the entrypoint script
ENTRYPOINT ["/app/entrypoint.sh"]
