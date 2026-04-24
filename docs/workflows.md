# Happy Yatra — Workflows & Processing Logic

---

## 1. Authentication Workflows

### 1.1 Signup Flow

```
Client (React)                 Express Server                  MongoDB Atlas
─────────────                  ──────────────                  ─────────────
POST /api/auth/signup
  {name, email, password}
         │
         ▼
  auth.routes.js
  router.post('/signup', signup)
         │
         ▼
  auth.controller.js :: signup()
  ├─ Normalize username = body.username || body.name
  ├─ Validate: username required → 400 if missing
  │
  └─► auth.service.js :: signup(username, email, password)
         │
         ├─► User.findOne({email})  ──────────────────────────► MongoDB
         │       ◄ null (new user) ◄───────────────────────────
         │   OR throw "User already exists" → 500
         │
         ├─ bcrypt.genSalt(10) → bcrypt.hash(password, salt)
         │
         ├─► User.save({username, email, hashedPassword})  ───► MongoDB (INSERT)
         │       ◄ newUser ◄────────────────────────────────────
         │
         ├─ jwt.sign({sub: user._id.toString(), role: user.role}, JWT_ACCESS_KEY, '3h')
         ├─ jwt.sign({sub: user._id.toString(), role: user.role}, JWT_REFRESH_KEY, '7d')
         │
         ◄─── {newUser, payload, accessToken, refreshToken}
         │
  res.status(201).json({
    message: "User registered successfully",
    access_token, refresh_token, user
  })
```

---

### 1.2 Login Flow

```
Client                         Server                          MongoDB
──────                         ──────                          ───────
POST /api/auth/login
  {email, password}
         │
         ▼
  auth.controller.js :: login()
         │
         └─► auth.service.js :: login(email, password)
                │
                ├─► User.findOne({email})  ──────────────────► MongoDB
                │       ◄ user ◄──────────────────────────────
                │   OR throw "Invalid email or password" → 401
                │
                ├─ bcrypt.compare(password, user.password)
                │   OR throw "Invalid email or password" → 401
                │
                ├─ Build payload: {sub: user._id.toString(), role: user.role}
                ├─ jwt.sign(payload, JWT_ACCESS_KEY, '3h')
                ├─ jwt.sign(payload, JWT_REFRESH_KEY, '7d')
                │
                ◄── {payload, accessToken, refreshToken}
                │
  res.status(200).json({
    access_token, refresh_token, user: payload
  })
```

---

### 1.3 Token Refresh Flow

```
Client                         Server                          MongoDB
──────                         ──────                          ───────
POST /api/auth/refresh
  {refresh_token}
         │
         ▼
  auth.controller.js :: refresh()
         │
         └─► auth.service.js :: refresh(refreshToken)
                │
                ├─ Guard: throw if !refreshToken → 401
                │
                ├─► TokenBlacklist.findOne({token})  ────────► MongoDB
                │       ◄ null (not blacklisted) ◄────────────
                │   OR throw "Invalid token" → 401
                │
                ├─ jwt.verify(token, JWT_REFRESH_KEY)
                │   ├── err: throw "Invalid refresh token" → 401
                │   └── decoded: {sub, role}
                │
                ├─ jwt.sign({sub: decoded.sub, role: decoded.role}, JWT_ACCESS_KEY, '3h')
                │
                ◄── {accessToken}
                │
  res.status(200).json({
    access_token: new token,
    refresh_token: new refresh_token (rotated)
  })
```

---

### 1.4 Logout & Token Blacklisting Flow

```
Client                         Server                          MongoDB
──────                         ──────                          ───────
POST /api/auth/logout
  {accessToken, refreshToken}
         │
         ▼
  auth.controller.js :: logout()
         │
         └─► auth.service.js :: blacklistTokens(access, refresh)
                │
                ├─ jwt.decode(accessToken) → {exp: timestamp} (Safe check)
                ├─ jwt.decode(refreshToken) → {exp: timestamp} (Safe check)
                │
                ├─► TokenBlacklist.insertMany([
                │       {token: accessToken, type: 'access', expiresAt: new Date(exp*1000)},
                │       {token: refreshToken, type: 'refresh', expiresAt: new Date(exp*1000)}
                │   ])  ──────────────────────────────────────► MongoDB (INSERT x2)
                │       ◄──────────────────── OK ◄─────────────
                │
  res.status(200).json({message: "Logout successful"})

  [MongoDB TTL Index]
  MongoDB automatically deletes documents where expiresAt <= now
  → No manual cleanup job needed
```

---

### 1.5 Protected Route Request Flow (verifyToken Middleware)

```
Client                         Server                          MongoDB
──────                         ──────                          ───────
ANY Protected Request
  Authorization: Bearer <token>
         │
         ▼
  Auth.middleware.js :: verifyToken()
  │
  ├─ Extract token from "Authorization" header
  │   "Bearer <token>" → token
  │   OR raw header value if no "Bearer " prefix
  │
  ├─ Guard: !token → 401 "Access denied, token require"
  │
  ├─► TokenBlacklist.findOne({token})  ─────────────────────► MongoDB
  │       ◄ null (not blacklisted) ◄───────────────────────────
  │   OR → 401 "blacklisted token"
  │
  ├─ jwt.verify(token, JWT_ACCESS_KEY, callback)
  │   ├── TokenExpiredError → 401 "Token expired"
  │   ├── Other error → 401 "Invalid token in verifying"
  │   └── Success: req.user = {id: decoded.sub, role: decoded.role}
  │
  └─► next()  →  Controller
```

---

## 2. Destination Workflows

### 2.1 Paginated Destination Fetch

```
Client                         Server                          MongoDB
──────                         ──────                          ───────
GET /api/destinations
  ?page=2&limit=12&trending=true
         │
         ▼
  destinations.controller.js :: getDestinations()
  │
  ├─ page = parseInt(query.page) || 1       → 2
  ├─ limit = parseInt(query.limit) || 12    → 12
  ├─ skip = (page - 1) * limit             → 12
  │
  ├─ Build baseQuery:
  │   query.trending === 'true' ? {trending: true} : {}
  │
  ├─► Destination.find({trending:true}).skip(12).limit(12) ─► MongoDB
  │       ◄ Destination[] ◄───────────────────────────────────
  │
  res.status(200).json({ data: destinations, pagination: { ... } })
  ✅ Full pagination metadata (total count, totalPages, etc.) returned
```

### 2.2 Single Destination Fetch

```
GET /api/destinations/:id
         │
  destinations.controller.js :: getDestinationById()
  │
  ├─ mongoose.Types.ObjectId.isValid(req.params.id)
  │   FALSE → 400 "Invalid destination id format"
  │
  ├─► Destination.findById(id) ─────────────────────────────► MongoDB
  │       ◄ destination | null ◄───────────────────────────────
  │   null → 404 "Destination not found"
  │
  res.status(200).json(destination)
```

---

## 3. Survey Workflow

```
Client                         Server                          MongoDB
──────                         ──────                          ───────
POST /api/survey
  Authorization: Bearer <token>
  {travelStyle, budget, interests[], activities[]}
         │
         ▼
  survey.controller.js :: submitSurvey()
  │
  ├─ Extract userId from req.user.id
  │
  ├─ new Survey({...req.body, user: userId}) → survey.save() ────────► MongoDB (UPSERT)
  │       ◄ saved doc ◄──────────────────────────────────────────────
  │
  res.status(201).json({message: "Survey submitted successfully"})

✅ Authentication required. User ObjectId is derived from the JWT payload server-side.
✅ Validation ensured via verifyToken and existence of token-attached user.
```

---

## 4. User Profile Workflow

```
Client                         Server                          MongoDB
──────                         ──────                          ───────
GET /api/user/profile
  Authorization: Bearer <token>
         │
         ▼
   [verifyToken middleware]
   → req.user = {id, role}
          │
          ▼
   user.controller.js :: profileDetails()
   │
   ├─► User.findById(req.user.id).select('username email role').lean() ─► MongoDB
   │       ◄ user | null ◄───────────────────────────────────────────────
   │   null → 404 "User not found"
   │
   res.status(200).json({user})
   ✅ User document is filtered via strict allow-list and password is hard-excluded in schema.
   ✅ Optimization: .lean() used for read-only performance.
```

---

## 5. Background Processing & TTL Jobs

### MongoDB TTL Index (Token Auto-Expiry)
- **Collection**: `TokenBlacklist`
- **Index**: `{expiresAt: 1}` with `expireAfterSeconds: 0`
- **Behavior**: MongoDB's background TTL monitor runs every ~60 seconds and automatically deletes documents where `expiresAt` has passed.
- **Effect**: Blacklisted tokens are automatically cleaned up — no cron job or manual process needed.

```javascript
tokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

---

## 6. Module Interaction Map

```
             ┌────────────────────────────────────┐
             │         HTTP Request               │
             └──────────────┬─────────────────────┘
                            │
                  ┌─────────▼──────────┐
                  │   Route Module      │ (auth/user/survey/recom routes)
                  └─────────┬──────────┘
                            │ applies middleware chain
                  ┌─────────▼──────────┐
                  │  Auth Middleware    │ verifyToken → adminChecks
                  │ (optional per route)│
                  └─────────┬──────────┘
                            │
                  ┌─────────▼──────────┐
                  │    Controller       │ Parses req, formats res
                  └─────────┬──────────┘
                            │ calls
               ┌────────────┴──────────────┐
               │                           │
    ┌──────────▼──────────┐   ┌────────────▼────────────┐
    │   Service Layer      │   │    Model (direct call)  │
    │  (auth.service.js)   │   │  (User, Destination,    │
    │  Business logic      │   │   Survey model)         │
    └──────────┬───────────┘   └────────────┬────────────┘
               │                            │
               └──────────┬─────────────────┘
                          │ Mongoose ODM
                ┌─────────▼──────────┐
                │    MongoDB Atlas    │
                └────────────────────┘
```

---

## 7. Data Flow: Recommendation Engine (Current vs Intended)

### Current State (Functional)
- Destinations are stored in MongoDB with `styles[]`, `tags[]`, `activities[]`, `averageCost` fields.
- Client fetches all and filters client-side, OR uses `trending=true` to filter server-side.
- `recom.controller.js` is fully **commented out** — its filter logic does NOT run.

### Original Intent (Commented-Out Logic)
```javascript
// POST /api/destinations — Body: {travelStyle, budget, interests[], activities[]}
const matches = destinations.filter(dest => {
    const matchesStyle = dest.styles.includes(travelStyle);
    const matchesBudget = dest.averageCost <= budget;
    const matchesInterest = dest.tags.some(tag => interests.includes(tag));
    const matchesActivity = dest.activities.some(act => activities.includes(act));
    return matchesStyle && matchesBudget && (matchesInterest || matchesActivity);
});
```

### Recommendation Activation Plan
To re-enable server-side filtering:
1. Uncomment logic in `recom.controller.js`
2. Update to query MongoDB instead of static data array
3. Add route `POST /api/destinations/recommend` in `recom.routes.js`
4. Connect to `Survey` data by user for personalized recommendations

---

## 5. Save/Unsave Destination Workflow

### 5.1 Save a Destination

```
Client                         Server                          MongoDB
──────                         ──────                          ───────
POST /api/saved-destinations/:id
  Authorization: Bearer <token>
         │
         ▼
  [verifyToken middleware]
  → req.user = {id, role}
         │
         ▼
  [express-validator: param('id').isMongoId()]
  → Reject 400 if malformed ObjectId
         │
         ▼
  saved.controller.js :: saveDestination()
  │
  ├─► Destination.findById(id).lean()  ────────────────────► MongoDB
  │       ◄ destination | null ◄──────────────────────────────
  │   null → 404 "Destination not found"
  │
  ├─► User.findByIdAndUpdate(
  │       req.user.id,
  │       { $addToSet: { savedDestinations: id } },  ──────► MongoDB (UPDATE)
  │       { new: true }
  │   )
  │       ◄ user ◄────────────────────────────────────────────
  │   null → 404 "User not found"
  │
  res.status(200).json({message: "Destination saved successfully"})

  ✅ $addToSet prevents duplicates — saving same destination twice is a no-op
```

### 5.2 Unsave a Destination

```
Client                         Server                          MongoDB
──────                         ──────                          ───────
DELETE /api/saved-destinations/:id
  Authorization: Bearer <token>
         │
         ▼
  [verifyToken + isMongoId() validation]
         │
         ▼
  saved.controller.js :: unsaveDestination()
  │
  ├─► User.findByIdAndUpdate(
  │       req.user.id,
  │       { $pull: { savedDestinations: id } },  ──────────► MongoDB (UPDATE)
  │       { new: true }
  │   )
  │       ◄ user ◄────────────────────────────────────────────
  │   null → 404 "User not found"
  │
  res.status(200).json({message: "Destination removed from saved"})
```

### 5.3 Get Saved Destinations

```
Client                         Server                          MongoDB
──────                         ──────                          ───────
GET /api/saved-destinations
  Authorization: Bearer <token>
         │
         ▼
  [verifyToken middleware]
         │
         ▼
  saved.controller.js :: getSavedDestinations()
  │
  ├─► User.findById(req.user.id)
  │       .populate('savedDestinations')
  │       .lean()  ──────────────────────────────────────────► MongoDB (FIND + POPULATE)
  │       ◄ user with populated destinations ◄────────────────
  │   null → 404 "User not found"
  │
  res.status(200).json({
    count: savedDestinations.length,
    data: savedDestinations   // Full destination objects
  })

  ✅ Uses Mongoose .populate() to JOIN savedDestinations ObjectId refs
     with full destination documents
```

---

## 6. Frontend Logout Workflow (Updated)

```
Client (React)                 Express Server                  MongoDB
─────────────                  ──────────────                  ─────────────
User clicks "Logout"
         │
         ▼
  Navbar :: handleLogout() [async]
         │
         ▼
  api.jsx :: logout() [async]
  │
  ├─ getStoredTokens() → {accessToken, refreshToken}
  │
  ├─► POST /api/auth/logout  ──────────────────────────────────►
  │     Body: {accessToken, refreshToken}
  │                                │
  │                                ▼
  │                    auth.service.js :: blacklistTokens()
  │                    ├─ jwt.decode(accessToken) → exp
  │                    ├─ jwt.decode(refreshToken) → exp
  │                    ├─► TokenBlacklist.insertMany([...])  ──► MongoDB (INSERT x2)
  │                    │       ◄──── OK ◄──────────────────────
  │   ◄────────────────── {message: "Logout successful"} ◄──────
  │
  ├─ clearTokens()    // Remove from localStorage
  ├─ setAuthToken(null) // Remove from Axios defaults
  │
  setUser(null)       // Clear React state
  navigate('/')       // Redirect to landing
  toast.success('Logged out successfully')

  ✅ Tokens are blacklisted server-side BEFORE clearing locally
  ✅ If server call fails, cleanup still proceeds (try/catch/finally)
```
