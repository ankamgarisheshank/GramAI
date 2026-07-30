# GramAI - REST API Design & Authentication Architecture

## 1. API Architecture
GramAI employs a strict Clean Architecture and Repository Pattern. 
The request lifecycle flows as follows:
`Client Request -> Middleware -> FastAPI Router -> Service Layer -> Repository Layer -> Database -> Service Layer -> FastAPI Router -> Standard Response Model -> Client`

No business logic is executed inside the routers. Routers purely handle HTTP request validation and response mapping.

## 2. API Versioning Strategy
All APIs are versioned in the URL path: `/api/v1/...`
Future breaking changes will be introduced in `/api/v2/...` leaving legacy endpoints intact.

## 3. Naming Conventions
- URLs: `kebab-case` and pluralized nouns (e.g., `/api/v1/scheme-categories`)
- Python Variables/Methods: `snake_case`
- Classes/Models: `PascalCase`
- Query Parameters: `snake_case` (e.g., `?min_income=50000`)

## 4. Response Format
All endpoints return a standardized unified response wrapper, ensuring frontend clients can predictably parse data and errors.

```json
{
  "success": true,
  "message": "Resource fetched successfully",
  "data": { ... },
  "errors": [],
  "timestamp": "2026-07-03T10:00:00Z"
}
```

## 5. Error Response Format
Global exception handlers intercept all errors (HTTP exceptions, Validation errors, DB integrity errors) and map them to the standard format:

```json
{
  "success": false,
  "message": "Validation Failed",
  "data": null,
  "errors": [
    {
      "field": "email",
      "issue": "value is not a valid email address"
    }
  ],
  "timestamp": "2026-07-03T10:00:00Z"
}
```

## 6. Authentication Flow
- **Type:** JWT (JSON Web Tokens).
- **Mechanism:** Short-lived Access Token (15 mins), long-lived Refresh Token (7 days).
- **Security:** Passwords hashed using `bcrypt`.
- **Flow:** 
  1. Client sends `/auth/login` with credentials.
  2. Server verifies and returns `access_token` and `refresh_token`.
  3. Client attaches `Authorization: Bearer <token>` to protected endpoints.
  4. On expiration, client hits `/auth/refresh` with `refresh_token` to get a new pair.

## 7. RBAC Matrix & Authorization
Centralized Permission decorators enforce Role-Based Access Control.

| Role | Permissions |
|---|---|
| **Citizen** | Read schemes, manage own profile, access voice assistant, save schemes. |
| **Village Admin** | Citizen capabilities + View village-level analytics, manage local citizen verifications. |
| **Mandal Admin** | Village Admin capabilities + View mandal-level reports. |
| **Super Admin** | Full system access, manage all schemes, users, and AI parameters. |

## 8. Middleware Flow
Requests pass through the following middleware stack before hitting the router:
1. **Trusted Hosts:** Validates `Host` header.
2. **CORS:** Handles Cross-Origin requests.
3. **Request ID:** Injects a unique trace ID into every request.
4. **Logging:** Logs method, path, and duration of the request.
5. **Rate Limiting:** Protects against DDoS (Bucket-based).
6. **Authentication:** Extracts and decodes JWT, attaching `current_user` to the request context.

## 9. Endpoint Categories (v1)
- `/auth/`: Login, register, token refresh, password management.
- `/users/`: User management.
- `/profiles/`: Citizen demographics and updates.
- `/schemes/`: Scheme catalog and details.
- `/recommendations/`: AI-generated scheme matching.
- `/agriculture/`: Market prices, weather APIs.
- `/voice/`: Audio stream ingestion and TTS response.
- `/chat/`: Text-based AI conversations.
- `/notifications/`: System alerts.
- `/admin/`: Super-admin workflows.
- `/analytics/`: Dashboard metrics.
- `/health/`: System monitoring `/health`, `/version`, `/status`.
