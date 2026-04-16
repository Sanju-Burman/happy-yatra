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

POST   /api/survey               Submit travel preferences
GET    /api/survey               Get all surveys (⚠️ unprotected)
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

| # | Issue | Location | Fix |
|---|-------|----------|-----|
| 1 | `GET /api/survey` exposes all user data anonymously | `survey.routes.js` | Add `verifyToken + adminChecks` |
| 2 | Survey submission has no auth guard | `survey.routes.js` | Add `verifyToken` |
| 3 | `trending` field queried but not in schema | `destination.model.js` | Add `trending: { type: Boolean, default: false }` |
| 4 | Refresh token not rotated on refresh | `auth.service.js` | Issue + blacklist old refresh token |
| 5 | No pagination metadata in destinations | `destinations.controller.js` | Return `{data, total, page, totalPages}` |
| 6 | `recom.controller.js` is dead code | `controllers/` | Remove or implement |
| 7 | No input validation library | All controllers | Add `joi` or `express-validator` |
| 8 | No rate limiting | `app.js` | Add `express-rate-limit` |

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
