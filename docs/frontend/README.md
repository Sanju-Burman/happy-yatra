# Happy Yatra — Frontend Documentation

> **Stack**: React 19 · Vite 6 · Tailwind CSS v4 · shadcn/ui · React Router v7 · Axios  
> **Deployed**: [happyyatra.netlify.app](https://happyyatra.netlify.app)

---

## 📂 Documentation Index

| File | Purpose | Read When |
|------|---------|-----------|
| [`ai-context-frontend.md`](./ai-context-frontend.md) | 🤖 AI agent context — full frontend in one page | **Start here** for any task |
| [`file-structure-frontend.md`](./file-structure-frontend.md) | Directory tree + module responsibilities | Navigating codebase |
| [`workflows-frontend.md`](./workflows-frontend.md) | User flows, component data flows, `data-testid` map | Understanding UX and testing |
| [`api-gaps.md`](./api-gaps.md) | Frontend ↔ Backend mismatch report with fixes | Debugging / feature work |

---

## ⚡ Quick Reference

### Tech Stack
```
React 19         — UI framework
Vite 6           — Build tool + dev server
Tailwind CSS v4  — Utility-first styling (@tailwindcss/vite plugin)
shadcn/ui        — Component library (Radix UI based, 46 components)
React Router v7  — Client-side routing
Axios            — HTTP client (with auto-refresh interceptor)
Framer Motion    — Animations
Sonner           — Toast notifications
Lucide React     — Icon library
next-themes      — Dark/light theme toggle
```

### Routes
```
/                   → Landing (public)
/login              → Login form (public-only)
/signup             → Signup form (public-only)
/survey             → 4-step preference wizard (auth required)
/thank-you          → Post-survey confirmation (auth required)
/recommendations    → Destination recommendations (auth required)
/destination/:id    → Destination detail (auth required)
/profile            → User profile + saved (auth required)
```

### Auth Pattern
- State lives in `App.jsx` (`useState`)
- Session restored on mount from `localStorage`
- `user` + `setUser` prop-drilled to Navbar and auth pages
- Axios interceptor handles 401 → auto-refresh → retry or redirect

### Environment Variables (`.env` in `frontend/`)
```env
VITE_Backend_API=http://localhost:9000/api
```

---

## ⚠️ Critical Known Issues

| # | Issue | Fix |
|---|-------|-----|
| 1 | `/api/recommendations` does not exist on backend | Implement backend route or use `GET /destinations` |
| 2 | `/api/saved-destinations` endpoints missing | Implement on backend |
| 3 | `destination.id` should be `destination._id` | Normalize in backend or frontend |
| 4 | Survey sends `travel_style` but backend expects `travelStyle` | Rename in frontend payload |
| 5 | `Landing.jsx` reads `data.destinations` but API returns array directly | Change to `data \|\| []` |
| 6 | Logout doesn't call `POST /api/auth/logout` | Add API call before clearing tokens |

> See [`api-gaps.md`](./api-gaps.md) for full gap analysis with per-issue fixes.

---

## 🛠 Local Setup

```bash
cd frontend
npm install

# Create .env
echo "VITE_Backend_API=http://localhost:9000/api" > .env

# Start dev server
npm run dev    # → http://localhost:5173
```

---

## 🧩 Component Quick Reference

| Component | File | Props |
|-----------|------|-------|
| `Navbar` | `components/Navbar.jsx` | `user`, `setUser` |
| `DestinationCard` | `components/DestinationCard.jsx` | `destination`, `showSaveButton`, `onSaveChange?` |
| `MapPlaceholder` | `components/MapPlaceholder.jsx` | `destinations[]` |
| `ThemeProvider` | `components/theme-provider.jsx` | `defaultTheme`, `storageKey`, `children` |

All **shadcn/ui** components live in `components/ui/` — use `cn()` from `lib/utils.js` for class merging.
