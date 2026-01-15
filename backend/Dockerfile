# Use Python 3.11 slim image (smaller size, faster builds)
FROM python:3.11-slim AS base

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install production WSGI server
RUN pip install --no-cache-dir gunicorn

# Copy project files
COPY . .

# Collect static files (Django admin, DRF browsable API)
RUN python manage.py collectstatic --noinput

# Expose port 8000
EXPOSE 8000

FROM base AS local
# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
# Run entrypoint script
ENTRYPOINT ["/entrypoint.sh"]


FROM base AS production
CMD ["sh", "-c", "python manage.py migrate --noinput && gunicorn --bind 0.0.0.0:8000 --workers 3 mindfulcompanion.wsgi:application"]