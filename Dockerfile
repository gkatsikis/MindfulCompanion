# Production image for Cloud Run: build the React app, then serve it and the
# Django API from one gunicorn process (single origin, no CORS/cookie issues).
FROM node:20-alpine AS frontend

WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
# Same-origin deploy: API calls use relative paths (overrides frontend/.env)
ENV VITE_API_BASE_URL=""
RUN npm run build


FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

COPY backend/ ./
COPY --from=frontend /app/dist ./frontend_dist

RUN python manage.py collectstatic --noinput

# Cloud Run injects PORT (defaults to 8080)
# ponytail: migrations run at container start; move to a release step if max-instances grows
CMD ["sh", "-c", "python manage.py migrate --noinput && gunicorn --bind 0.0.0.0:${PORT:-8080} --workers 2 --threads 4 mindfulcompanion.wsgi:application"]
