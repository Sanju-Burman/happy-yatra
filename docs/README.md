# Happy Yatra — Backend Documentation

> **Stack**: Node.js · Express.js · MongoDB Atlas · JWT Auth  
> **Deployed**: [happyatra.vercel.app](https://happyatra.vercel.app) (Backend) · [happyyatra.netlify.app](https://happyyatra.netlify.app) (Frontend)

---

## 📂 Documentation Index

| File | Purpose | Read When |
|------|---------|-----------|
| [`ai-context.md`](./ai-context.md) | 🤖 AI agent context file — full system in one page | **Start here** for any task |
| [`api-specification.md`](./api-specification.md) | Complete REST API reference (all endpoints, schemas, errors) | Building frontend / debugging API calls |
| [`system-design.md`](./system-design.md) | Architecture, data flow, design decisions | Understanding system structure |
| [`file-structure.md`](./file-structure.md) | Directory tree + module responsibilities | Navigating the codebase |
| [`workflows.md`](./workflows.md) | Business flows, sequence diagrams, processing logic | Understanding how features work end-to-end |
| [`postman-collection.json`](./postman-collection.json) | Importable Postman collection (all endpoints + auto-token scripts) | Manual API testing |
| [`openapi.yaml`](./openapi.yaml) | OpenAPI 3.0 / Swagger specification | Code generation, Swagger UI |

---

## ⚡ Quick Reference

### Base URLs
```
Production:  https://happyatra.vercel.app/api
Local:       http://localhost:9000/api
```

### Authentication
```http
Authorization: Bearer <access_token>
```
Get tokens from `POST /api/auth/login` or `POST /api/auth/signup`.

### Key Endpoints
```
POST   /api/auth/signup          Register + auto-login
POST   /api/auth/login           Login
POST   /api/auth/refresh         Refresh access token
POST   /api/auth/logout          Invalidate both tokens

GET    /api/user/profile         [AUTH] Get user profile

GET    /api/destinations         Paginated destinations (?page&limit&trending=true)
GET    /api/destinations/:id     Single destination

GET    /api/saved-destinations   [AUTH] Get user's saved destinations
POST   /api/saved-destinations/:id  [AUTH] Save a destination
DELETE /api/saved-destinations/:id  [AUTH] Unsave a destination

POST   /api/survey               [AUTH] Submit travel preferences
GET    /api/survey               [AUTH] Get user's survey submissions

POST   /api/recommendations     [AUTH] Get personalized recommendations
```

### Environment Variables (`.env` in `backend/`)
```env
PORT=9000
MONGO_DB=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/<db>
JWT_ACCESS_KEY=<strong_secret>
JWT_REFRESH_KEY=<strong_secret>
CORS_ORIGIN=http://localhost:5173,https://happyyatra.netlify.app
```

---

## ⚠️ Known Issues (Priority Order)

| # | Issue | Location | Status |
|---|-------|----------|--------|
| - | No remaining high-priority technical debt | - | - |

### ✅ Recently Resolved
| # | Issue | Resolution |
|---|-------|------------|
| 1 | Google Map integration incomplete | Implemented `@react-google-maps/api` with markers in `MapPlaceholder.jsx` |
| 2 | `recom.controller.js` contains dead code | Cleaned up unused functions and renamed `recom.routes.js` to `destinations.routes.js` |
| 3 | No structured logging | Implemented `winston` globally in backend via `logger.js` |
| 4 | Navbar not mobile responsive | Added hamburger menu and sliding drawer with `framer-motion` |
| 5 | Save/unsave was a no-op (stub controller) | Implemented with `$addToSet`/`$pull` on `User.savedDestinations` |
| 6 | No input validation on saved-destinations | Added `express-validator` with `isMongoId()` param check |
| 7 | Zero test coverage | Added 28 integration tests (Jest + Supertest) |
| 8 | Frontend logout didn't call backend | `logout()` now calls `POST /api/auth/logout` to blacklist tokens |
| 9 | `description` field missing from destination model | Added to schema with `default: ''` |
| 10| Survey routes unprotected | Fixed — both GET and POST require `verifyToken` |
| 11| Trending field not in schema | Fixed — added `trending: Boolean` |
| 12| No pagination metadata | Fixed — returns `{total, page, totalPages, hasNextPage, hasPrevPage}` |
| 13| Refresh token not rotated | Fixed — old refresh token blacklisted on refresh |

---

## 🛠 Local Setup

```bash
# Clone & install
git clone https://github.com/Sanju-Burman/happy-yatra
cd happy-yatra/backend
npm install

# Configure environment
cp .env.example .env   # then fill in your values

# Start dev server
npm run dev            # nodemon watches src/server.js → port 9000

# Run tests
npm test               # runs 28 integration tests via Jest
```

---

## 📬 Import Postman Collection

1. Open Postman → **Import**
2. Select `docs/postman-collection.json`
3. Set collection variable `base_url` to your target environment
4. Run **Login** — tokens auto-save to `access_token` / `refresh_token` variables
5. All protected routes use `{{access_token}}` automatically

## 🔍 View Swagger UI

Paste `docs/openapi.yaml` into [editor.swagger.io](https://editor.swagger.io) or run:
```bash
npx @redocly/cli preview-docs docs/openapi.yaml
```
