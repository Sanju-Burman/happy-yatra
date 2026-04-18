# Happy Yatra — Project File Structure

---

## Full Directory Tree

```
happy-yatra/                          # Monorepo root
├── README.md                         # Project overview, setup, feature list
├── package.json                      # Root package.json (likely placeholder)
├── package-lock.json
├── .gitignore
│
├── docs/                             # 📚 All documentation (this folder)
│   ├── ai-context.md                 # AI agent optimized context file
│   ├── api-specification.md          # Full API reference
│   ├── system-design.md              # Architecture & design decisions
│   ├── file-structure.md             # This file
│   ├── workflows.md                  # Business workflows & processing logic
│   ├── postman-collection.json       # Importable Postman collection
│   └── openapi.yaml                  # OpenAPI 3.0 specification
│
├── backend/                          # Node.js + Express backend
│   ├── package.json                  # Backend dependencies
│   ├── package-lock.json
│   ├── .gitignore
│   ├── vercel.json                   # Vercel serverless deployment config
│   └── src/                          # All source code
│       ├── server.js                 # LOCAL ONLY — HTTP server entry (listen())
│       ├── app.js                    # Express app factory — CORS, routes, global error handler
│       ├── config/
│       │   └── db.js                 # MongoDB connection via mongoose
│       ├── models/                   # Mongoose schema definitions
│       │   ├── user.model.js         # Users collection
│       │   ├── destination.model.js  # destinations collection
│       │   ├── surveyData.model.js   # Survey collection
│       │   └── tokenBlocking.model.js # TokenBlacklist collection (TTL)
│       ├── middlewares/
│       │   └── Auth.middleware.js    # verifyToken, adminChecks
│       ├── services/
│       │   └── auth.service.js       # login, signup, refresh, blacklistTokens
│       ├── controllers/
│       │   ├── auth.controller.js    # Handles /api/auth/* HTTP layer
│       │   ├── user.controller.js    # Handles /api/user/* HTTP layer
│       │   ├── survey.controller.js  # Handles /api/survey/* HTTP layer
│       │   ├── destinations.controller.js # Handles /api/destinations/* HTTP layer
│       │   └── recom.controller.js   # ⚠️ DEAD CODE — fully commented out
│       └── routes/
│           ├── auth.routes.js        # Maps /api/auth → auth.controller
│           ├── user.routes.js        # Maps /api/user → user.controller
│           ├── survey.routes.js      # Maps /api/survey → survey.controller
│           └── recom.routes.js       # Maps /api/destinations → destinations.controller
│
└── frontend/                         # React.js frontend
    ├── package.json
    └── src/
        ├── App.jsx                   # Root component + routing
        ├── components/               # Reusable UI components
        ├── pages/                    # Route-level page components
        └── services/                 # Axios API call wrappers
```

---

## Backend Module Responsibilities

### `src/server.js`
- **Role**: Local development entry point only.
- **Responsibility**: Calls `connectDB()` and `app.listen(PORT)`.
- **⚠️ Not used in production** — Vercel uses `src/app.js` directly.

### `src/app.js`
- **Role**: Express application factory. Used by both local server and Vercel.
- **Responsibility**:
  - Configures CORS with dynamic origin whitelist from `CORS_ORIGIN` env.
  - Registers `express.json()` body parser.
  - Mounts route modules at `/api/*`.
  - Provides global error handler middleware.
  - Calls `connectDB()` on module load (defensive).

### `src/config/db.js`
- **Role**: Database connection singleton.
- **Responsibility**: Establishes a single Mongoose connection to MongoDB Atlas using `MONGO_DB` env.

### `src/models/`

| File | Collection | Purpose |
|------|-----------|---------|
| `user.model.js` | `Users` | Auth identity, roles |
| `destination.model.js` | `destinations` | Travel destination catalog |
| `surveyData.model.js` | `Survey` | User travel preferences |
| `tokenBlocking.model.js` | `TokenBlacklist` | Invalidated JWT tokens (TTL auto-purge) |

### `src/middlewares/Auth.middleware.js`
- **`verifyToken`**: Full JWT validation pipeline — extract → blacklist check → verify → attach `req.user`.
- **`adminChecks`**: Role guard. Checks `req.user.role === 'admin'`. Used after `verifyToken`.

### `src/services/auth.service.js`
- **Role**: Core auth business logic layer.
- **`login(email, password)`**: Finds user → compares password → issues tokens.
- **`signup(username, email, password)`**: Checks uniqueness → hashes password → creates user → issues tokens.
- **`refresh(refreshToken)`**: Validates non-blacklisted refresh token → issues new access token.
- **`blacklistTokens(accessToken, refreshToken)`**: Decodes both tokens → stores in `TokenBlacklist` with expiry.

### `src/controllers/`

| File | Handler Functions | Route Module |
|------|------------------|--------------|
| `auth.controller.js` | `login`, `signup`, `logout`, `refresh` | `auth.routes.js` |
| `user.controller.js` | `profileDetails` | `user.routes.js` |
| `survey.controller.js` | `submitSurvey`, `getSurvey` | `survey.routes.js` |
| `destinations.controller.js` | `getDestinations`, `getDestinationById` | `recom.routes.js` |
| `recom.controller.js` | *(all commented out)* | *(not active)* |

### `src/routes/`

| File | Mount Point | Middleware | Handlers |
|------|-------------|-----------|---------|
| `auth.routes.js` | `/api/auth` | `verifyToken` on `/data` only | login, signup, logout, refresh |
| `user.routes.js` | `/api/user` | `verifyToken` on `/profile` | profileDetails |
| `survey.routes.js` | `/api/survey` | `verifyToken` | submitSurvey, getSurvey |
| `recom.routes.js` | `/api/destinations` | None | getDestinations, getDestinationById |

### `vercel.json`
- **Role**: Vercel deployment configuration.
- **Behavior**: Routes all HTTP traffic (`/.*`) to `src/app.js` as a serverless Node.js function.

---

## Environment Variables Reference

Create a `.env` file in the `backend/` directory:

```env
# Server
PORT=9000

# Database
MONGO_DB=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority

# JWT Secrets (use strong random strings in production)
JWT_ACCESS_KEY=your_access_token_secret_here
JWT_REFRESH_KEY=your_refresh_token_secret_here

# CORS (comma-separated origins or * for all)
CORS_ORIGIN=http://localhost:5173,https://happyyatra.netlify.app
```

---

## Naming Conventions

| Convention | Usage |
|-----------|-------|
| `*.model.js` | Mongoose schema + model |
| `*.controller.js` | Express request handlers |
| `*.routes.js` | Express Router definitions |
| `*.service.js` | Business logic isolated from HTTP |
| `*.middleware.js` | Express middleware functions |
| `PascalCase` | Model names (e.g., `TokenBlacklist`) |
| `camelCase` | Function and variable names |
| `snake_case` | API response fields (`access_token`, `refresh_token`) |
