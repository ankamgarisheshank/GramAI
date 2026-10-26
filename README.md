# GramAI - Enterprise Citizen Service Portal

GramAI is an enterprise-grade AI-powered web platform designed to connect citizens (Farmers, Students, Senior Citizens) with government schemes and services efficiently. It bridges the gap between rural citizens and government initiatives by providing personalized recommendations, voice assistance in local languages, and a comprehensive officer dashboard for seamless administration.

## 🚀 Features

- **Role-Based Portals**: Dedicated dashboards for Farmers, Students, and Senior Citizens tailored to their specific needs.
- **Smart Recommendation Engine**: AI-driven scheme matching based on user demographics (Age, Income, Occupation, District, etc.).
- **Multilingual Voice Assistant**: Natural language voice interaction for users who are not digitally literate, integrating Speech-to-Text and Text-to-Speech APIs.
- **Location & Geocoding Integration**: Automatic location detection with reverse geocoding to find localized health camps, weather, and market prices.
- **Officer Dashboard**: A centralized admin portal for officers to review, approve, or reject applications, complete with analytics and reports.
- **Enterprise Security**: JWT-based authentication, OAuth support, Role-Based Access Control (RBAC), API rate limiting, and robust input validation.
- **High Performance**: Lazy loading, memoization, optimized database queries, caching, and connection pooling.

## 🏗️ Architecture

### Frontend
- **Framework**: React 18 with TypeScript and Vite.
- **State Management**: Zustand for global state, TanStack React Query for server state and caching.
- **Styling**: Tailwind CSS with Radix UI primitives.
- **Routing**: React Router DOM (v6) with protected routes and code splitting.

### Backend
- **Framework**: FastAPI (Python 3) for high-performance, asynchronous endpoints.
- **Database**: PostgreSQL with SQLAlchemy ORM and Alembic for migrations.
- **AI/ML**: LangChain and custom AI pipelines for recommendations and speech processing.
- **Security**: PyJWT, Passlib, SlowAPI (Rate Limiting).

## 🛠️ Deployment Guide

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- PostgreSQL (v14+)

### 1. Database Setup
Ensure PostgreSQL is running.
```bash
createdb gramai_db
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Environment variables (.env)
DATABASE_URL=postgresql://user:password@localhost/gramai_db
SECRET_KEY=your_super_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Apply migrations
alembic upgrade head

# Run server
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Environment variables (.env)
VITE_API_URL=http://localhost:8000/api/v1

# Run development server
npm run dev

# Build for production
npm run build
```

## 📖 API Documentation

Once the backend is running, FastAPI automatically generates interactive API documentation.
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Core API Endpoints
- `POST /api/v1/auth/login`: Authenticate and receive JWT.
- `GET /api/v1/schemes`: Fetch all schemes.
- `GET /api/v1/recommendations`: Get AI recommendations based on the user's profile.
- `POST /api/v1/voice/transcribe`: Upload audio for STT transcription.
- `POST /api/v1/chat`: Interact with the AI conversational engine.
- `PUT /api/v1/profiles/me`: Update user demographic and location profile.

## 🤝 Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License
This project is licensed under the MIT License.
