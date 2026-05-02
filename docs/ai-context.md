# Happy Yatra — AI Agent Context File
> **Purpose**: Single-file reference for AI agents. Read this first. Do NOT scan the full codebase unless directed.

---

## 1. System Overview

| Item | Value |
|------|-------|
| **Project** | Happy Yatra — Personalized Travel Destination Recommendation Platform |
| **Type** | Full-stack (Node.js + React.js) |
| **Runtime** | Node.js + Express.js |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Auth** | JWT (Access Token 3h + Refresh Token 7d) + Token Blacklist |
| **Deployment** | Backend → Vercel (`happyatra.vercel.app`), Frontend → Netlify (`happyyatra.netlify.app`) |
| **Base API URL** | `https://happyatra.vercel.app/api` |

---

## 2. File Structure (Backend)

```
backend/
├── vercel.json                  # Vercel deployment config (routes all to src/app.js)
├── package.json
└── src/
    ├── server.js                # Entry point — starts HTTP server on PORT (default 9000)
    ├── app.js                   # Express app — CORS, middleware, routes, global error handler
    ├── config/
    │   └── db.js                # mongoose.connect() using process.env.MONGO_DB
    ├── models/
    │   ├── user.model.js        # Collection: 'Users' — username, email, password (select:false), role
    │   ├── destination.model.js # Collection: 'destinations' — name, imageUrl, averageCost, styles[], tags[], activities[], location, lat, lng
    │   ├── surveyData.model.js  # Collection: 'Survey' — user(ref), travelStyle, budget, interests[], activities[]
    │   └── tokenBlocking.model.js # Collection: 'TokenBlacklist' — token, type, expiresAt (TTL index)
    ├── middlewares/
    │   └── Auth.middleware.js   # verifyToken, adminChecks
    ├── services/
    │   └── auth.service.js      # login, signup, refresh, blacklistTokens
    ├── controllers/
    │   ├── auth.controller.js   # login, signup, logout, refresh
    │   ├── user.controller.js   # profileDetails
    │   ├── survey.controller.js # submitSurvey, getSurvey
    │   ├── destinations.controller.js # getDestinations (paginated), getDestinationById
    │   ├── recommendations.controller.js # getRecommendations (personalized based on survey)
    │   ├── saved.controller.js  # save, unsave, getSavedDestinations
    │   └── admin.controller.js  # Admin CRUD & Analytics
    └── routes/
        ├── auth.routes.js       # /api/auth/*
        ├── user.routes.js       # /api/user/*
        ├── survey.routes.js     # /api/survey/*
        ├── destinations.routes.js     # /api/destinations/*
        ├── recommendations.routes.js  # /api/recommendations/*
        ├── saved-destinations.routes.js # /api/saved-destinations/*
        ├── config.routes.js     # /api/config/*
        └── admin.routes.js      # /api/admin/*
```

---

## 3. Key Entities & Schemas

### User (`Users` collection)
```js
{ username: String, email: String(unique), password: String(bcrypt, select:false), role: 'user'|'admin' }
```

### Destination (`destinations` collection)
```js
{ name, imageUrl, averageCost(Number), styles[String], tags[String], activities[String], location, latitude, longitude, trending(Boolean), viewCount(Number), createdAt, updatedAt }
// viewCount is incremented atomically on GET /:id
```

### Survey (`Survey` collection)
```js
{ user: ObjectId(ref:Users), travelStyle, budget(Number), interests[String], activities[String], createdAt }
```

### TokenBlacklist (`TokenBlacklist` collection)
```js
{ token: String, type: 'access'|'refresh', expiresAt: Date }
// TTL index on expiresAt → auto-deletes expired blacklisted tokens
```

---

## 4. API Contract Summary

### Auth — `/api/auth`
| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| POST | `/login` | ❌ | `{email, password}` | `{access_token, refresh_token, user:{email, role}}` |
| POST | `/signup` | ❌ | `{name\|username, email, password}` | `{message, access_token, refresh_token, user}` |
| POST | `/logout` | ❌ | `{accessToken, refreshToken}` | `{message}` |
| POST | `/refresh` | ❌ | `{refresh_token}` | `{access_token, refresh_token}` |
| POST | `/data` | ✅ Bearer | — | `"protected page running"` |

### User — `/api/user`
| Method | Path | Auth | Response |
|--------|------|------|----------|
| GET | `/profile` | ✅ Bearer | `{user: {username, email, role}}` |

### Survey — `/api/survey`
| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| POST | `/` | ✅ Bearer | `{travelStyle, budget, interests[], activities[]}` | `{message}` |
| GET | `/` | ✅ Bearer | — | `Survey[]` filtered by user (unless admin) |

### Destinations — `/api/destinations`
| Method | Path | Auth | Query Params | Response |
|--------|------|------|------|----------|
| GET | `/` | ❌ | `page`, `limit`, `trending=true` | `Destination[]` |
| GET | `/:id` | ❌ | — | `Destination` |

### Recommendations — `/api/recommendations`
| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| POST | `/` | ✅ Bearer | — | `{success, count, data: Destination[]}` |

### Saved Destinations — `/api/saved-destinations`
| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| GET | `/` | ✅ Bearer | — | Saved destinations for user |
| POST | `/:id` | ✅ Bearer | — | Save a destination |
| DELETE | `/:id` | ✅ Bearer | — | Unsave a destination |

### Admin — `/api/admin` (Requires `admin` role)
| Method | Path | Auth | Response |
|--------|------|------|----------|
| GET | `/analytics` | ✅ Admin | Platform statistics & charts |
| GET | `/destinations` | ✅ Admin | Paginated list with trending info |
| POST | `/destinations` | ✅ Admin | Create new destination |
| PUT | `/destinations/:id` | ✅ Admin | Update destination (excludes viewCount) |
| DELETE| `/destinations/:id` | ✅ Admin | Delete destination |
| PATCH | `/destinations/:id/trending` | ✅ Admin | Toggle trending status |
| GET | `/users` | ✅ Admin | Paginated user list |
| GET | `/users/:id/survey` | ✅ Admin | User-specific survey results |

---

## 5. Core Workflows

### Auth Flow (Login)
```
Client → POST /api/auth/login {email, password}
  → authService.login()
    → User.findOne({email}).select('+password') → bcrypt.compare()
    → jwt.sign({sub: user._id.toString(), role: user.role}, JWT_ACCESS_KEY, 3h) + jwt.sign(payload, JWT_REFRESH_KEY, 7d)
  ← {access_token, refresh_token, user:{email, role}}
```

### Auth Flow (Signup)
```
Client → POST /api/auth/signup {name|username, email, password}
  → controller normalizes: username = req.body.username || req.body.name
  → authService.signup()
    → User.findOne({email}) → throw if exists
    → bcrypt.hash(password, 10) → User.save()
    → issue accessToken + refreshToken
  ← 201 {message, access_token, refresh_token, user}
```

### Token Refresh
```
Client → POST /api/auth/refresh {refresh_token}
  → TokenBlacklist.findOne(token) → reject if blacklisted
  → jwt.verify(token, JWT_REFRESH_KEY) → decode
  → jwt.sign({sub: decoded.sub, role: decoded.role}, JWT_ACCESS_KEY, 3h)
  ← {access_token, refresh_token (rotated)}
```

### Logout (Token Blacklisting)
```
Client → POST /api/auth/logout {accessToken, refreshToken}
  → jwt.decode both tokens → extract exp
  → TokenBlacklist.create([{access}, {refresh}])
  ← {message: 'Logout successful'}
  // MongoDB TTL index auto-purges expired entries
```

### Protected Route Request
```
Client → GET /api/user/profile
  Header: Authorization: Bearer <accessToken>
  → verifyToken middleware:
      1. Extract token from "Bearer <token>"
      2. TokenBlacklist.findOne(token) → 401 if blacklisted
      3. jwt.verify(token, JWT_ACCESS_KEY) → 401 if expired/invalid
      4. req.user = {id: decoded.sub, role: decoded.role} → next()
  → profileController: User.findById(req.user.id).select('username email role').lean()
  ← {user}
```

### Destinations Fetch (Paginated)
```
Client → GET /api/destinations?page=1&limit=12&trending=true
  → getDestinations():
      page = req.query.page || 1
      limit = req.query.limit || 12
      baseQuery = trending=true ? {trending:true} : {}
      Destination.find(baseQuery).skip((page-1)*limit).limit(limit)
  ← Destination[]
```

---

## 6. Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | HTTP server port (default: 9000) |
| `MONGO_DB` | MongoDB Atlas connection string |
| `JWT_ACCESS_KEY` | Secret key for access token signing |
| `JWT_REFRESH_KEY` | Secret key for refresh token signing |
| `CORS_ORIGIN` | Comma-separated allowed origins (use `*` for all) |

---

## 7. Important Constraints & Rules

1. **Token Storage**: Tokens are NOT stored server-side except in the blacklist on logout.
2. **Refresh token is rotated** on refresh — new tokens are returned and old are blacklisted.
3. **Survey is authenticated** — `POST /api/survey` and `GET /api/survey` BOTH require JWT. User ObjectId is derived from token `sub`, NOT from request body.
4. **Access token expiry: 3 hours**, Refresh token expiry: **7 days**.
5. **Admin role exists** in User model and `adminChecks` middleware exists. Admin-protected routes are mounted at `/api/admin`.
7. **`trending` field** is defined and fully queried correctly in MongoDB.
8. **CORS**: When `CORS_ORIGIN=*`, `credentials` is set to `false`. When restricted, credentials are allowed.
9. **Vercel** routes all traffic to `src/app.js` (not `server.js`).
10. **Signup accepts both `name` and `username`** fields (frontend sends `name`, model uses `username`).

---

## 8. Tech Stack Quick Reference

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express.js 4.x |
| ODM | Mongoose 8.x |
| Auth | jsonwebtoken 9.x + bcrypt 5.x |
| DB | MongoDB Atlas |
| Config | dotenv |
| Dev | nodemon |
| Deploy | Vercel (backend), Netlify (frontend) |

---

## 9. Known Issues / Technical Debt

| Issue | Location | Severity |
|-------|----------|----------|
| Missing pagination metadata | `destinations.controller.js` | Low |
| No advanced input validation library (like Joi/Zod) | All controllers | Medium |
