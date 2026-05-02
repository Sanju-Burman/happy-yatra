# Happy Yatra — Frontend ↔ Backend API Gap Report

> **Purpose**: Documents every mismatch between what the frontend calls and what the backend actually provides. These must be fixed for end-to-end functionality.

---

## Critical Gaps (App-Breaking)

### ~~GAP-1: `/api/recommendations` endpoint missing~~ ✅ RESOLVED

| Item | Detail |
|------|--------|
| **Status** | ✅ Implemented in `recommendations.controller.js` + `recommendations.routes.js` |
| **Route** | `POST /api/recommendations` (requires `verifyToken`) |
| **Behavior** | Fetches user's survey, builds personalized query, returns matched destinations |

---

### ~~GAP-2: `/api/saved-destinations` endpoints missing~~ ✅ RESOLVED

| Item | Detail |
|------|--------|
| **Status** | ✅ Implemented in `saved.controller.js` + `saved-destinations.routes.js` |
| **Routes** | `GET /`, `POST /:id`, `DELETE /:id` — all require `verifyToken` |
| **Behavior** | Uses `$addToSet`/`$pull` on `User.savedDestinations` with `isMongoId()` validation |

---

### ~~GAP-3: `/api/config` endpoint missing~~ ✅ RESOLVED

| Item | Detail |
|------|--------|
| **Status** | ✅ Implemented in `config.controller.js` + `config.routes.js` |
| **Route** | `GET /api/config` (public) |

---

### GAP-4: Field name mismatch — `destination.id` vs `destination._id`

| Item | Detail |
|------|--------|
| **Frontend reads** | `destination.id` in `DestinationCard`, `DestinationDetail`, `Profile` |
| **Backend returns** | `destination._id` (MongoDB ObjectId as `_id`) |
| **Impact** | Save status check always fails (`savedData.some(d => d.id === id)` never matches). Navigation also broken if card click uses `.id` |
| **Fix** | Either add Mongoose `transform` to rename `_id` → `id` in JSON OR update frontend to read `._id` |

---

### GAP-5: Survey payload field name mismatch

| Item | Detail |
|------|--------|
| **Frontend sends** | `{interests[], budget, travel_style, past_travels[]}` |
| **Backend expects** | `{user (ObjectId), travelStyle, budget, interests[], activities[]}` |
| **Mismatches** | `travel_style` ≠ `travelStyle`, `past_travels` not in schema, `user` ObjectId missing from body |
| **Impact** | Survey saves with wrong field names. `travelStyle` will be `undefined` in DB. `user` ref will be null |
| **Fix (Frontend)** | Transform payload before sending: rename `travel_style` → `travelStyle`, add `user: storedUser.userId`, remove or map `past_travels` |
| **Fix (Backend)** | Add `past_travels` field to Survey schema OR rename frontend field |

---

### GAP-6: Landing page response shape mismatch

| Item | Detail |
|------|--------|
| **Frontend reads** | `data.destinations` (expects `{destinations: [...]}`) |
| **Backend returns** | Raw `Destination[]` array (no wrapper object) |
| **Code** | `setTrendingDestinations(data.destinations \|\| [])` in `Landing.jsx` |
| **Impact** | Trending destinations section always empty |
| **Fix** | Change to `setTrendingDestinations(data \|\| [])` |

---

## Medium Priority Gaps

### ~~GAP-7: Logout does not call backend~~ ✅ RESOLVED

| Item | Detail |
|------|--------|
| **Status** | ✅ `api.jsx :: logout()` now calls `POST /api/auth/logout` with `{accessToken, refreshToken}` before clearing localStorage |
| **Behavior** | Tokens are blacklisted server-side; `clearTokens()` always runs in `finally` block |

---

### GAP-8: Profile page expects fields not returned by backend

| Item | Detail |
|------|--------|
| **Frontend reads** | `profile.user.name`, `profile.saved_destinations_count`, `profile.preferences.travel_style`, etc. |
| **Backend returns** | `{user: {_id, username, email, role}}` |
| **Mismatches** | `.name` (not `.username`), no `preferences`, no `saved_destinations_count` |
| **Fix (Backend)** | Enrich `/api/user/profile` response with survey preferences and saved count |
| **Fix (Frontend)** | Read `.username` instead of `.name` for display |

---

### GAP-9: DestinationDetail uses `destination.image_url` but model has `imageUrl`

| Item | Detail |
|------|--------|
| **Frontend reads** | `destination.image_url`, `destination.country`, `destination.description`, `destination.budget_level`, `destination.best_for`, `destination.category` |
| **Backend model** | `imageUrl`, no `country`, no `description`, no `budget_level`, no `best_for`, no `category` |
| **Impact** | Detail page: no image, no description, no details sidebar content |
| **Fix** | Add missing fields to `destination.model.js` OR add field transformation in controller |

---

## Summary Table

| GAP | Feature | Severity | Fix Owner |
|-----|---------|----------|-----------|
| GAP-1 | Recommendations | ✅ Resolved | — |
| GAP-2 | Save/Unsave destinations | ✅ Resolved | — |
| GAP-3 | Google Maps config | ✅ Resolved | — |
| GAP-4 | `id` vs `_id` | 🔴 Critical | Backend (transform) or Frontend |
| GAP-5 | Survey field names | 🔴 Critical | Frontend |
| GAP-6 | Landing trending data | 🔴 Critical | Frontend (1 line fix) |
| GAP-7 | Logout blacklist | ✅ Resolved | — |
| GAP-8 | Profile fields | 🟡 Medium | Both |
| GAP-9 | Destination schema fields | 🔴 Critical | Backend |

---

## Quick Fix Priority

1. **GAP-6** — 1-line fix in `Landing.jsx` (`data` → `data.destinations`)  
2. **GAP-5** — Transform survey payload before submit  
3. **GAP-4** — Normalize `_id` → `id` in backend response or frontend reads  
4. **GAP-9** — Add missing fields to destination schema  
5. **GAP-8** — Align profile response fields  

### ✅ Already Fixed
- **GAP-1** — Recommendations engine live (`recommendations.controller.js`)
- **GAP-2** — Saved destinations implemented (`saved.controller.js`)
- **GAP-3** — Config endpoint live (`config.controller.js`)
- **GAP-7** — Frontend logout calls `POST /api/auth/logout`
