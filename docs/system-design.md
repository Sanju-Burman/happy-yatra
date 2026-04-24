# Happy Yatra — System Design

---

## 1. Architecture Overview

Happy Yatra follows a **Classic 3-Tier Layered Architecture** (Presentation → Application → Data), organized as a monolithic Node.js/Express backend.

```
┌─────────────────────────────────────────────┐
│               CLIENT (React.js)             │
│         https://happyyatra.netlify.app      │
└────────────────────┬────────────────────────┘
                     │ HTTPS / REST JSON
┌────────────────────▼────────────────────────┐
│           APPLICATION LAYER (Express.js)    │
│          https://happyatra.vercel.app       │
│                                             │
│  ┌──────────┐ ┌────────────┐ ┌───────────┐ │
│  │  Routes  │ │Middlewares │ │Controllers│ │
│  └──────────┘ └────────────┘ └─────┬─────┘ │
│                                    │        │
│               ┌────────────────────▼─────┐  │
│               │        Services          │  │
│               └────────────────────┬─────┘  │
└────────────────────────────────────┼────────┘
                                     │ Mongoose ODM
┌────────────────────────────────────▼────────┐
│              DATA LAYER                     │
│           MongoDB Atlas (Cloud)             │
│  Collections: Users, destinations,          │
│               Survey, TokenBlacklist        │
└─────────────────────────────────────────────┘
```

---

## 2. Internal Layer Responsibilities

### Routes (`src/routes/`)
- Map HTTP method + path to controller function.
- Apply per-route middleware chains (e.g., `verifyToken`).
- No business logic.

### Middlewares (`src/middlewares/`)
- **`verifyToken`**: Extracts Bearer token → checks blacklist → verifies JWT signature → attaches `req.user`.
- **`adminChecks`**: Guards admin-only routes by checking `req.user.role === 'admin'`.

### Controllers (`src/controllers/`)
- Parse request input (body, params, query).
- Call service layer or model directly.
- Format and send HTTP response.
- Handle all HTTP errors (status codes).

### Services (`src/services/`)
- Encapsulate complex, reusable business logic.
- Currently: `auth.service.js` handles all auth logic (hashing, token generation, blacklisting).
- Services throw errors; controllers catch and map to HTTP responses.

### Models (`src/models/`)
- Define MongoDB schemas via Mongoose.
- Enforce data validation at the ODM level.
- No business logic in models.

### Config (`src/config/`)
- `db.js`: Single Mongoose connection. Called at startup (`server.js`) and defensively in `app.js`.

---

## 3. Request Lifecycle

```
HTTP Request
    │
    ▼
app.js (Express)
    │
    ├── cors() middleware ──────── CORS + preflight OPTIONS handling
    ├── express.json() ───────────  Body parsing
    │
    ▼
Route Match (/api/auth, /api/user, /api/survey, /api/destinations)
    │
    ▼
[Optional] verifyToken middleware
    │   └── Check Authorization header
    │   └── TokenBlacklist.findOne(token) → reject if blacklisted
    │   └── jwt.verify(token, JWT_ACCESS_KEY) → reject if invalid/expired
    │   └── req.user = decoded JWT payload
    │
    ▼
Controller Function
    │   └── Input validation
    │   └── Call Service or Model
    │   └── Send JSON response (res.status().json())
    │
    ▼
[On Error] Global Error Handler (app.js)
    └── Sets CORS headers
    └── res.status(error.statusCode || 500).json({message})
```

---

## 4. Authentication Architecture

### JWT Token Strategy

```
┌─────────┐                         ┌──────────────┐
│  CLIENT │                         │    SERVER    │
└────┬────┘                         └──────┬───────┘
     │                                     │
     │ POST /login {email, password}       │
     │────────────────────────────────────►│
     │                                     │ bcrypt.compare()
     │                              issue  │ jwt.sign(payload, ACCESS_KEY, 1d)
     │                              tokens │ jwt.sign(payload, REFRESH_KEY, 7d)
     │◄────────────────────────────────────│
     │ {access_token, refresh_token, user} │
     │                                     │
     │ [Store tokens in localStorage/state]│
     │                                     │
     │ GET /api/user/profile               │
     │ Authorization: Bearer <access>      │
     │────────────────────────────────────►│
     │                                     │ verifyToken:
     │                                     │   blacklist check
     │                                     │   jwt.verify()
     │◄────────────────────────────────────│
     │ {user}                              │
     │                                     │
     │ [access_token expires after 1 day]  │
     │                                     │
     │ POST /refresh {refresh_token}       │
     │────────────────────────────────────►│
     │                                     │ verify refresh token
     │                                     │ issue new access token
     │◄────────────────────────────────────│
     │ {access_token, refresh_token}       │
     │                                     │
     │ POST /logout {access, refresh}      │
     │────────────────────────────────────►│
     │                                     │ TokenBlacklist.create([both])
     │◄────────────────────────────────────│
     │ {message: Logout successful}        │
```

### Token Blacklist (TTL-based Cleanup)
- On logout, both tokens are added to `TokenBlacklist` with their `expiresAt` time.
- MongoDB TTL index on `expiresAt` automatically purges expired entries — no manual cleanup job needed.
- Every protected request checks the blacklist **before** JWT verification.

---

## 5. Data Model Relationships

```
┌──────────────────┐           ┌──────────────────────┐
│      Users       │           │       Survey          │
│──────────────────│           │──────────────────────│
│ _id (ObjectId)   │◄────────── user (ObjectId, ref)   │
│ username         │           │ travelStyle           │
│ email (unique)   │           │ budget                │
│ password (hash)  │           │ interests[]           │
│ role (user/admin)│           │ activities[]          │
│ savedDestinations│───┐       │ createdAt             │
│   [ObjectId ref] │   │       └──────────────────────┘
└──────────────────┘   │
                       │
┌──────────────────────────────────────┐
│           destinations               │
│──────────────────────────────────────│
│ _id, name, imageUrl, averageCost     │◄───┘
│ styles[], tags[], activities[]       │  (savedDestinations refs)
│ location, latitude, longitude        │
│ trending (Boolean)                   │
│ description (String)                 │
│ createdAt, updatedAt                 │
└──────────────────────────────────────┘

┌───────────────────────────────────────┐
│           TokenBlacklist              │
│───────────────────────────────────────│
│ token (String)                        │
│ type ('access' | 'refresh')           │
│ expiresAt (Date, TTL index)           │
└───────────────────────────────────────┘
```

> **Note:** `Survey.user` references `Users._id` via Mongoose `ref`, but **no population (JOIN)** is performed in survey controllers — raw ObjectId is stored and returned. `User.savedDestinations` references `destinations._id` and **is populated** when fetching saved destinations via `saved.controller.js`.

---

## 6. CORS Configuration

```javascript
// Dynamic CORS from env
CORS_ORIGIN=https://happyyatra.netlify.app   // production
CORS_ORIGIN=*                                 // development

Rules:
- CORS_ORIGIN=* → credentials: false, allow all origins
- CORS_ORIGIN=<list> → credentials: true, strict origin whitelist
- Allowed Methods: GET, POST, PUT, DELETE, OPTIONS
- Allowed Headers: Content-Type, Authorization
- Global error handler re-sets CORS headers on errors
```

---

## 7. Deployment Architecture

```
┌──────────────────────────────────────────────────────┐
│                     VERCEL (Backend)                 │
│                                                      │
│  vercel.json routes ALL traffic → src/app.js         │
│  Runtime: Node.js Serverless Functions               │
│  Entry: src/app.js (NOT server.js — no listen())     │
│                                                      │
│  ⚠️ server.js is for LOCAL only (starts HTTP server) │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│                   NETLIFY (Frontend)                 │
│  React.js static bundle                              │
│  Hits backend API via Axios at VERCEL base URL       │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│               MONGODB ATLAS (Database)               │
│  Shared cluster / free tier                          │
│  Connected via MONGO_DB env variable (connection str)│
└──────────────────────────────────────────────────────┘
```

---

## 8. Implemented Architecture Improvements

| Area | Status | Implementation Details |
|------|-----------|------------------------|
| **Input Validation** | ✅ Implemented | Using `express-validator` across auth, survey, and saved-destinations routes. |
| **Token Rotation** | ✅ Implemented | Refresh tokens are rotated on each use; old tokens are blacklisted. |
| **Survey Auth** | ✅ Implemented | Both GET and POST `/api/survey` routes now require valid JWTs. |
| **Rate Limiting** | ✅ Implemented | Added `express-rate-limit` to all `/api/auth` routes. |
| **Security Headers**| ✅ Implemented | Integrated `helmet` middleware for HTTP header hardening. |
| **Data Privacy** | ✅ Implemented | User password hashes are explicitly excluded from profile responses. |
| **DB Performance** | ✅ Implemented | Added database index to `user` field in the Survey collection. |
| **Trending Field** | ✅ Implemented | Included `trending` in destination schema and query logic. |
| **Description Field** | ✅ Implemented | Added `description` field to destination schema (was missing, frontend rendered undefined). |
| **Save/Unsave** | ✅ Implemented | `savedDestinations` array on User model with `$addToSet`/`$pull` operations and populated reads. |
| **Recommendation Engine**| ✅ Implemented | Server-side filtering by `travelStyle`, `interests`, and `budget` in `recommendations.controller.js`. |
| **Pagination Metadata**| ✅ Implemented | All destination lists return full pagination objects. |
| **Frontend Logout** | ✅ Fixed | `logout()` now calls `POST /api/auth/logout` to blacklist tokens server-side before clearing locally. |
| **Integration Tests** | ✅ Implemented | 28 tests across auth, saved-destinations, and survey endpoints using Jest + Supertest. |
| **Logging** | ⚠️ Pending | Future update: integrate structured logger (winston/pino). |
