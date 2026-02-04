# MindfulCompanion

An AI-powered journaling application designed to provide mental health support and emotional validation. Users can write journal entries and receive personalized AI-generated responses based on their mental health needs.

## Features

- **AI-Powered Responses** - Get personalized support from Claude based on your journal entries
- **Multiple Support Types** - Choose from immediate validation, coping techniques, pattern analysis, or comprehensive assessment
- **Context-Aware AI** - The system intelligently shares relevant past entries with Claude based on your chosen help type
- **Journal History** - View and manage your entries with a calendar interface
- **Anonymous Support** - Access immediate help without creating an account
- **Google OAuth** - Quick sign-in with Google

### Support Types

| Type | Context | Description |
|------|---------|-------------|
| Just Listen | None | Immediate emotional validation |
| Quick Help | None | Coping techniques for right now |
| Ongoing Support | Last 7 entries | Validation for recurring issues |
| Learn Patterns | Last 7 entries | Understand your mental health trends |
| Save Only | N/A | Save without AI response |

## Safety and Guardrails

MindfulCompanion takes user safety seriously. All AI interactions are guided by carefully crafted system prompts developed in collaboration with a licensed clinical social worker. These guardrails ensure that:

- **Therapeutic Best Practices** - AI responses follow evidence-based approaches for emotional support and validation
- **Appropriate Boundaries** - The AI is instructed to recognize its limitations and encourage professional help when appropriate
- **No Direct Advice** - The system focuses on validation, coping techniques, and pattern recognition rather than diagnosing or prescribing treatment

**Disclaimer:** MindfulCompanion is for educational purposes only and is not a substitute for professional mental health care. This tool is not designed for crisis intervention. If you are in crisis, please contact a mental health professional or crisis hotline immediately.

## Tech Stack

**Frontend**
- React 19 + TypeScript
- Vite
- Tailwind CSS
- React Router

**Backend**
- Django 4.2 + Django REST Framework
- PostgreSQL
- django-allauth (authentication)

**AI**
- Anthropic Claude (via LiteLLM)

**Deployment**
- Docker & Docker Compose
- Nginx (frontend)
- Gunicorn (backend)

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Anthropic API key

### Environment Variables

Create a `.env` file in the project root:

```env
# Django
SECRET_KEY=your-django-secret-key
DEBUG=False

# Database
POSTGRES_DB=mindfulcompanion
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-db-password

# AI
ANTHROPIC_API_KEY=your-anthropic-api-key
AI_MODEL=anthropic/claude-sonnet-4-5-20250929

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Running with Docker

```bash
docker-compose up --build
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

### Local Development

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```
MindfulCompanion/
├── backend/
│   ├── api/                 # Django app (models, views, serializers)
│   │   ├── models.py        # User, JournalEntry, AIInteraction
│   │   ├── views.py         # API endpoints
│   │   ├── llm_service.py   # Claude integration
│   │   └── serializers.py   # API serialization
│   ├── mindfulcompanion/    # Django project settings
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/           # JournalPage, ProfilePage
│   │   ├── components/      # AuthForm, Calendar, Header, Modal
│   │   ├── services/        # API client functions
│   │   └── contexts/        # Auth state management
│   ├── Dockerfile
│   └── nginx.conf
└── docker-compose.yml
```

## API Endpoints

### Journal Entries
- `POST /api/journal-entries/` - Create entry (with optional AI response)
- `GET /api/journal-entries/` - List user's entries
- `GET /api/journal-entries/{id}/` - Get single entry
- `DELETE /api/journal-entries/{id}/` - Delete entry

### Authentication
- `POST /accounts/signup/` - Register
- `POST /accounts/login/` - Login
- `GET /accounts/google/login/` - Google OAuth
- `POST /api/logout/` - Logout
- `GET /api/user/` - Current user info

## License

MIT
