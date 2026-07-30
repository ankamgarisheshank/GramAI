# GramAI - Government Benefits Recommendation Platform

GramAI is an AI-powered platform for Telangana, providing citizens (Farmers, Students, Senior Citizens) with personalized government scheme recommendations through an intuitive interface and voice assistant.

## Features
- **Role-Based Access Control:** Distinct experiences for Citizens and Admins (Village, Mandal, Super Admin).
- **Voice Assistant:** Native voice support (Telugu and English) using Whisper and Piper.
- **AI Recommendation Engine:** RAG-powered scheme matching using Llama 3.2, LangChain, and ChromaDB.

## Tech Stack
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS.
- **Backend:** FastAPI, Python, SQLAlchemy, PostgreSQL.
- **AI/ML:** Llama 3.2 (via Ollama), Whisper, Piper, Sentence Transformers, ChromaDB.
- **Infrastructure:** Docker, Docker Compose.

## Project Structure
- `/frontend`: React application
- `/backend`: FastAPI application and AI modules
- `/datasets`: Data schemas, mock data, embedding generators
- `/docs`: Architecture, API, and Database documentation
- `/scripts`: Setup and utility scripts
- `/infrastructure`: Deployment configurations

## Getting Started
See the [ROADMAP.md](./ROADMAP.md) for current progress and execution phases.
