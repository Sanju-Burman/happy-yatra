# Happy Yatra — Frontend File Structure

---

## Full Directory Tree

```
frontend/
├── .gitignore
├── index.html                    # Vite HTML entry point — mounts <div id="root">
├── vite.config.js                # Vite config: React, Tailwind, Brotli/Gzip, path alias @
├── tailwind.config.cjs           # Tailwind theme config (custom colors, fonts, animations)
├── components.json               # shadcn/ui CLI config
├── jsconfig.json                 # JS path aliases for editor
├── eslint.config.js              # ESLint rules (react-hooks, react-refresh)
├── craco.config.js               # Legacy CRACO config (unused — project uses Vite)
├── package.json                  # Dependencies and scripts
├── build_log.txt                 # Vite build output log (artifact)
│
├── public/                       # Static assets (served as-is)
│
├── dist/                         # Production build output (gitignored)
│
└── src/
    ├── main.jsx                  # ReactDOM.createRoot → ThemeProvider → App
    ├── App.jsx                   # Root component: routing, auth state, route guards
    ├── api.jsx                   # All API functions + axios global config + token helpers
    ├── index.css                 # Global Tailwind + custom CSS (lazy-image, fonts)
    ├── App.css                   # Minimal component-level overrides
    │
    ├── pages/                    # Route-level pages (all lazy-loaded via React.lazy)
    │   ├── Landing.jsx           # Home page — hero, features, trending destinations
    │   ├── Login.jsx             # Login form
    │   ├── Signup.jsx            # Registration form
    │   ├── Survey.jsx            # 4-step preference wizard
    │   ├── ThankYou.jsx          # Post-survey confirmation + navigation
    │   ├── Recommendations.jsx   # Destination recommendations grid + map
    │   ├── DestinationDetail.jsx # Individual destination view + save toggle
    │   └── Profile.jsx           # User profile + saved destinations
    │
    ├── components/               # Shared UI components
    │   ├── Navbar.jsx            # Global navigation bar (sticky)
    │   ├── DestinationCard.jsx   # Destination card with image, save button, click nav
    │   ├── MapPlaceholder.jsx    # Google Maps stub / placeholder
    │   ├── theme-provider.jsx    # next-themes ThemeProvider wrapper
    │   └── ui/                   # shadcn/ui components (auto-generated, do not hand-edit)
    │       ├── button.jsx
    │       ├── card.jsx
    │       ├── dialog.jsx
    │       ├── input.jsx
    │       ├── toast.jsx / toaster.jsx / sonner.jsx
    │       ├── skeleton.jsx
    │       ├── badge.jsx
    │       └── ... (46 total)
    │
    ├── hooks/
    │   └── use-toast.js          # Custom useToast hook (Radix toast state management)
    │
    └── lib/
        └── utils.js              # cn(classes) — tailwind-merge + clsx helper
```

---

## Module Responsibilities

### `src/main.jsx`
- **Role**: Application bootstrap.
- **Responsibility**: Creates React root, wraps app in `ThemeProvider` (dark mode by default), renders `App`.

### `src/App.jsx`
- **Role**: Root component — owns auth state and routing.
- **Responsibility**:
  - Holds `user` and `loading` state via `useState`.
  - On mount (`useEffect`): reads `localStorage` for stored user + token to restore session.
  - Defines `ProtectedRoute` and `PublicRoute` guard HOCs.
  - Renders `BrowserRouter`, `Navbar`, all `Routes`, and the `Toaster`.
  - Passes `user` + `setUser` as props to `Navbar`, `Login`, `Signup`.

### `src/api.jsx`
- **Role**: Single source of truth for all backend communication.
- **Responsibility**:
  - Defines the `API` base URL from `VITE_Backend_API` env var.
  - Manages localStorage: `storeTokens`, `clearTokens`, `getStoredTokens`, `storeUser`, `getStoredUser`.
  - Sets `axios.defaults.headers.common['Authorization']` globally via `setAuthToken`.
  - Registers an Axios **response interceptor** for automatic token refresh on 401.
  - Exports one async function per API operation.

### `src/pages/Landing.jsx`
- **Role**: Public home page.
- **Responsibility**:
  - Fetches trending destinations on mount via `getDestinations(1, 6, true)`.
  - Renders: Hero (full-screen image + CTA), Features grid (3 cards), Trending Destinations grid.
  - CTA adapts based on `user` prop: logged in → `/survey`, else → `/signup` + `/login`.

### `src/pages/Login.jsx`
- **Role**: Authentication form for returning users.
- **Responsibility**:
  - Local state: `email`, `password`, `showPassword`, `loading`.
  - On submit: calls `login(email, password)` → `setUser(data.user)` → `navigate('/')`.
  - Shows toast on success/error.

### `src/pages/Signup.jsx`
- **Role**: Registration form.
- **Responsibility**:
  - Local state: `name`, `email`, `password`, `showPassword`, `loading`.
  - On submit: calls `signup(email, password, name)` → `setUser(data.user)` → `navigate('/survey')`.
  - Min password length: 6 (HTML5 `minLength` attribute).

### `src/pages/Survey.jsx`
- **Role**: Travel preference collection wizard.
- **Responsibility**:
  - 4-step linear form with animated transitions (Framer Motion `AnimatePresence`).
  - Local state: `step` (1–4), `formData` `{interests[], budget, travel_style, past_travels[]}`.
  - Per-step validation before advancing.
  - On submit: calls `submitSurvey(formData)` → clears form → `navigate('/thank-you')`.
  - Progress bar shows `(step/4)*100%`.

### `src/pages/ThankYou.jsx`
- **Role**: Post-survey success screen.
- **Responsibility**: Animated confirmation with two CTAs — `/recommendations` or `/` (home).

### `src/pages/Recommendations.jsx`
- **Role**: Display personalized destination suggestions.
- **Responsibility**:
  - Fetches via `getRecommendations()` → `POST /recommendations` ⚠️ (endpoint missing from backend).
  - Shows: loading spinner, error state with "Take Survey" CTA, or destination grid + map.
  - Uses `DestinationCard` (with `showSaveButton=true`) and `MapPlaceholder`.

### `src/pages/DestinationDetail.jsx`
- **Role**: Full detail view for one destination.
- **Responsibility**:
  - Reads `:id` from URL params.
  - Parallel fetch: `getDestination(id)` + `getSavedDestinations()` → check if saved.
  - Save toggle: calls `saveDestination`/`unsaveDestination` → updates `isSaved` state.
  - Layout: full-screen hero image + back button + save button overlay, then content + sidebar.

### `src/pages/Profile.jsx`
- **Role**: User profile and saved destinations.
- **Responsibility**:
  - Parallel fetch: `getProfile()` + `getSavedDestinations()`.
  - Shows user info, travel preferences from API, saved destinations grid.
  - `refreshSavedDestinations()` passed to cards via `onSaveChange` prop.

### `src/components/Navbar.jsx`
- **Role**: Global navigation bar.
- **Responsibility**:
  - Sticky, `backdrop-blur`, `z-50`.
  - Authenticated links: Survey, Recommendations, Profile, Logout.
  - Unauthenticated links: Login, Get Started.
  - Theme toggle (dark ↔ light) via `useTheme()`.
  - `logout()` → `setUser(null)` → `navigate('/')`.

### `src/components/DestinationCard.jsx`
- **Role**: Reusable destination display card.
- **Props**: `destination`, `showSaveButton`, `onSaveChange`.
- **Responsibility**:
  - On mount: checks saved status via `getSavedDestinations()` (if `showSaveButton`).
  - Click anywhere → `navigate('/destination/:id')`.
  - Save button click → prevents event bubble → toggles save state.
  - Lazy image with CSS fade-in on load.
  - Shows "Trending" badge if `destination.trending` is true.

### `src/components/MapPlaceholder.jsx`
- **Role**: Google Maps integration stub.
- **Responsibility**:
  - Fetches `getConfig()` → `/api/config` to retrieve `google_maps_api_key`.
  - If no valid API key → shows placeholder with destination name list.
  - If key exists → renders map container (not yet fully wired).

### `src/components/theme-provider.jsx`
- **Role**: Wraps the app with `next-themes` `ThemeProvider`.
- **Provides**: `useTheme()` hook returning `theme` + `setTheme`.
- **Default theme**: `"dark"`, persisted in `localStorage` under key `"vite-ui-theme"`.

### `src/components/ui/`
- **Role**: shadcn/ui component library.
- **Rule**: Do NOT hand-edit these. Regenerate using `npx shadcn-ui@latest add <component>`.
- **46 components** including: button, card, dialog, input, select, toast, skeleton, badge, tabs, tooltip, etc.

### `src/hooks/use-toast.js`
- **Role**: Custom hook for imperative toast management.
- **Exports**: `useToast()` → `{ toast, toasts, dismiss }`.

### `src/lib/utils.js`
- **Role**: Tailwind class merging utility.
- **Exports**: `cn(...classes)` — combines `clsx` + `tailwind-merge`.
- **Usage**: `className={cn("base-classes", conditionalClass && "extra")}`.

---

## Naming Conventions

| Convention | Usage |
|-----------|-------|
| `PascalCase.jsx` | Page and component files |
| `camelCase.js` | Utility/hook files |
| `kebab-case` | CSS class names (Tailwind) |
| `VITE_*` | Environment variables |
| `data-testid="..."` | All major elements have test IDs for E2E testing |
| `@/` | Path alias for `src/` (configured in `vite.config.js`) |

---

## Environment Setup

```bash
# Install dependencies
cd frontend
npm install

# Development
npm run dev         # Starts Vite dev server (default: http://localhost:5173)

# Production build
npm run build       # Output goes to dist/ with Brotli + Gzip compression

# Preview production build
npm run preview

# Lint
npm run lint
```

`.env` file (create in `frontend/`):
```env
VITE_Backend_API=http://localhost:9000/api
```
