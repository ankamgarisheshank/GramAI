# GramAI Architecture

## High-Level System Architecture

```mermaid
graph TD
    %% Frontend Layer
    subgraph Frontend [Frontend (React 19, Vite, Tailwind)]
        A1[Public Portal]
        A2[Citizen Portal]
        A3[Admin Portal]
        VA[Voice Assistant Interface]
    end

    %% API Layer
    subgraph Backend [Backend API (FastAPI)]
        B1[Auth & RBAC Service]
        B2[Scheme Management Service]
        B3[Voice AI Service]
        B4[Recommendation Service]
    end

    %% Data Layer
    subgraph DataStore [Database & Vector Store]
        DB[(PostgreSQL)]
        VS[(ChromaDB)]
    end

    %% AI Layer
    subgraph AI [AI Models]
        LLM[Llama 3.2 - via Ollama]
        STT[Whisper - Speech-to-Text]
        TTS[Piper - Text-to-Speech]
        EMB[Sentence Transformers - Embeddings]
    end

    %% Interactions
    A1 & A2 & A3 -->|REST/JSON via Axios| Backend
    VA -->|Audio Stream| B3
    B3 -->|WAV Audio| STT
    STT -->|Text Transcript| B4
    B4 -->|Generate Embedding| EMB
    EMB -->|Vector Query| VS
    VS -->|Similar Schemes/Context| B4
    B4 -->|Augmented Prompt| LLM
    LLM -->|Text Response| TTS
    TTS -->|Audio Response Stream| VA

    Backend -->|SQLAlchemy CRUD| DB
```

## User Roles & Personas

### 1. Citizen Roles
- **Farmer:** Focuses on agriculture schemes, crop loans, market prices, and weather data.
- **Student:** Focuses on scholarships, education loans, and skill development programs.
- **Senior Citizen:** Focuses on pensions, healthcare schemes, and senior benefits.

### 2. Admin Roles (RBAC)
- **Village Admin:** Manages citizen approvals and scheme applications at the village level.
- **Mandal Admin:** Oversees multiple villages, generates mandal-level reports.
- **Super Admin:** System-wide access, manages schemes, analytics, roles, and AI model configurations.
