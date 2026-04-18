# Happy Yatra — Frontend AI Context File
> **Purpose**: Single-file reference for AI agents. Read this first. Do NOT scan the full codebase unless directed.

---

## 1. System Overview

| Item | Value |
|------|-------|
| **Framework** | React 19 + Vite 6 |
| **Language** | JavaScript (JSX) |
| **Styling** | Tailwind CSS v4 (via `@tailwindcss/vite`) |
| **UI Library** | shadcn/ui (Radix UI primitives) |
| **Routing** | React Router DOM v7 |
| **HTTP Client** | Axios (with auto-refresh interceptor) |
| **Animations** | Framer Motion |
| **Toast** | Sonner |
| **Icons** | Lucide React |
| **Theme** | Dark (default) / Light — via `next-themes` |
| **Build** | Vite with Brotli + Gzip compression, Terser minification |
| **Deploy** | Netlify — `https://happyyatra.netlify.app` |
| **Backend URL** | `VITE_Backend_API` env var → `http://localhost:9000/api` (default) |

---

## 2. File Structure (Frontend)

```
frontend/src/
├── main.jsx              # Entry: ReactDOM.createRoot → ThemeProvider → App
├── App.jsx               # Root: BrowserRouter + Routes + auth state (useState)
├── api.jsx               # All API calls + axios config + localStorage token mgmt
├── index.css             # Global styles (Tailwind + custom)
├── App.css               # Minimal app-level CSS
│
├── pages/                # Route-level page components (React.lazy loaded)
│   ├── Landing.jsx       # / — Hero, Features, Trending Destinations
│   ├── Login.jsx         # /login — Email+password form (PublicRoute)
│   ├── Signup.jsx        # /signup — Name+Email+Password form (PublicRoute)
│   ├── Survey.jsx        # /survey — 4-step preference wizard (ProtectedRoute)
│   ├── ThankYou.jsx      # /thank-you — Post-survey confirmation (ProtectedRoute)
│   ├── Recommendations.jsx # /recommendations — Destination grid + map (ProtectedRoute)
│   ├── DestinationDetail.jsx # /destination/:id — Detail view + save (ProtectedRoute)
│   └── Profile.jsx       # /profile — User info + saved destinations (ProtectedRoute)
│
├── components/
│   ├── Navbar.jsx        # Sticky top nav — auth-conditional links, logout, theme toggle
│   ├── DestinationCard.jsx # Reusable card with save toggle, lazy image, click-to-detail
│   ├── MapPlaceholder.jsx  # Google Maps stub (shows placeholder if no API key)
│   ├── theme-provider.jsx  # next-themes ThemeProvider wrapper
│   └── ui/               # 46 shadcn/ui auto-generated components (button, card, dialog…)
│
├── hooks/
│   └── use-toast.js      # Custom toast hook (Radix-based)
│
└── lib/
    └── utils.js          # cn() utility (clsx + tailwind-merge)
```

---

## 3. Routing Map

| Path | Component | Guard | Access |
|------|-----------|-------|--------|
| `/` | `Landing` | None | Public |
| `/login` | `Login` | `PublicRoute` | Redirects → `/` if logged in |
| `/signup` | `Signup` | `PublicRoute` | Redirects → `/` if logged in |
| `/survey` | `Survey` | `ProtectedRoute` | Redirects → `/login` if not logged in |
| `/thank-you` | `ThankYou` | `ProtectedRoute` | Redirects → `/login` if not logged in |
| `/recommendations` | `Recommendations` | `ProtectedRoute` | Redirects → `/login` if not logged in |
| `/destination/:id` | `DestinationDetail` | `ProtectedRoute` | Redirects → `/login` if not logged in |
| `/profile` | `Profile` | `ProtectedRoute` | Redirects → `/login` if not logged in |

> All protected page components are **React.lazy()** loaded for code splitting.

---

## 4. Auth State Management

Authentication is **stateful in App.jsx** — no Redux/Zustand/Context used.

```
App.jsx
├── useState: user, loading
├── useEffect on mount:
│   └── getStoredUser() + getStoredTokens() → if both exist → setUser(storedUser)
├── ProtectedRoute: if !user → <Navigate to="/login" />
└── PublicRoute: if user → <Navigate to="/" />
```

**State flows:**
- Login/Signup → `setUser(data.user)` in page component (prop-drilled from App)
- Logout → `logout()` (clears localStorage) + `setUser(null)` via prop
- Navbar receives `user` and `setUser` as props

---

## 5. API Layer (`src/api.jsx`) — Complete Reference

### Token Management (localStorage)
```
accessToken  → localStorage.setItem('accessToken', ...)
refreshToken → localStorage.setItem('refreshToken', ...)
user         → localStorage.setItem('user', JSON.stringify(...))
```

### Axios Auto-Refresh Interceptor
On any 401 response:
1. Calls `refreshAccessToken()` → `POST /auth/refresh`
2. Retries original request with new token
3. On refresh failure → clears tokens → redirects to `/login`

### API Functions
| Function | Method | Endpoint | Auth |
|----------|--------|----------|------|
| `signup(email, password, name)` | POST | `/auth/signup` | ❌ |
| `login(email, password)` | POST | `/auth/login` | ❌ |
| `logout()` | — | *(local only — clears storage)* | — |
| `refreshAccessToken()` | POST | `/auth/refresh` | ❌ |
| `submitSurvey(preferences)` | POST | `/survey` | ❌ |
| `getSurvey()` | GET | `/survey` | ❌ |
| `getRecommendations()` | POST | `/recommendations` | ✅ |
| `getDestinations(page, limit, trending)` | GET | `/destinations` | ❌ |
| `getDestination(id)` | GET | `/destinations/:id` | ❌ |
| `saveDestination(id)` | POST | `/saved-destinations/:id` | ✅ |
| `unsaveDestination(id)` | DELETE | `/saved-destinations/:id` | ✅ |
| `getSavedDestinations()` | GET | `/saved-destinations` | ✅ |
| `getProfile()` | GET | `/user/profile` | ✅ |
| `getConfig()` | GET | `/config` | ❌ |

---

## 6. Survey Flow (Multi-Step Wizard)

```
Survey.jsx — 4 steps (useState: step = 1..4)
│
Step 1 → interests[]   (multi-select: Beach, Adventure, Culture…)
Step 2 → budget        (single-select: budget|moderate|expensive|luxury)
Step 3 → travel_style  (single: Solo|Couple|Family|Friends|Business)
Step 4 → past_travels[] (multi-select: Asia|Europe|Americas|Africa|Oceania|Middle East)
│
Submit → submitSurvey(formData) → POST /api/survey
       → navigate('/thank-you')
```

**Validation**: Each step has a guard check before advancing:
- Step 1: `interests.length > 0`
- Step 2: `budget !== ''`
- Step 3: `travel_style !== ''`
- Step 4: `past_travels.length > 0`

---

## 7. Key Component Interfaces

### `<Navbar user={user} setUser={setUser} />`
- Authenticated: Survey · Recommendations · Profile · Logout
- Unauthenticated: Login · Get Started (signup)
- Always: Brand logo, Dark/Light theme toggle

### `<DestinationCard destination={dest} showSaveButton={bool} onSaveChange={fn} />`
- `destination` fields used: `id`, `name`, `image_url`, `country`, `description`, `category`, `budget_level`, `trending`
- Checks saved state on mount via `getSavedDestinations()`
- Click → `navigate('/destination/:id')`
- Save toggle → `saveDestination` / `unsaveDestination`

### `<MapPlaceholder destinations={[]} />`
- Fetches `getConfig()` → `/api/config` for Google Maps API key
- If no valid key → renders placeholder UI listing destination names
- If key valid → renders Google Maps embed (not yet fully implemented)

---

## 8. Environment Variables

Create `.env` in `frontend/`:
```env
VITE_Backend_API=http://localhost:9000/api        # or https://happyatra.vercel.app/api
VITE_GOOGLE_MAPS_API_KEY=your_key_here           # optional, for map feature
```

---

## 9. Build & Performance

| Feature | Implementation |
|---------|---------------|
| Code splitting | `React.lazy()` on all page components |
| Compression | Brotli + Gzip via `vite-plugin-compression` |
| Minification | Terser + CSS minify |
| Chunk strategy | `vendor-react` (react/dom/router) + `vendor-ui` (radix/framer/lucide) |
| Image lazy load | `loading="lazy"` + CSS opacity transition on load |
| Path alias | `@` → `./src` (configured in `vite.config.js`) |

---

## 10. Known Issues / Technical Debt

| Issue | Location | Severity |
|-------|----------|----------|
| `getRecommendations()` calls `POST /recommendations` — this route does NOT exist on backend | `api.jsx` | High |
| `saveDestination`, `unsaveDestination`, `getSavedDestinations` call `/saved-destinations/*` — not on backend | `api.jsx` | High |
| `getConfig()` calls `/config` — not on backend | `api.jsx` / `MapPlaceholder.jsx` | Medium |
| `DestinationCard` uses `destination.id` but backend returns `destination._id` | `DestinationCard.jsx` | High |
| `Landing.jsx` reads `data.destinations` but `getDestinations` returns an array directly | `Landing.jsx` | High |
| Survey sends `travel_style` + `past_travels` but backend model expects `travelStyle` + no `past_travels` | `Survey.jsx` / `api.jsx` | High |
| Auth state not persisted across tabs (no BroadcastChannel or storage event listener) | `App.jsx` | Low |
| `logout()` in `api.jsx` only clears localStorage — does NOT call `POST /auth/logout` backend endpoint | `api.jsx` | Medium |
| Google Maps not implemented — only `MapPlaceholder` | `MapPlaceholder.jsx` | Low |
| No 404 / fallback route defined in router | `App.jsx` | Low |
