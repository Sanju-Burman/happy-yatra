# Happy Yatra — Frontend ↔ Backend API Gap Report

> **Purpose**: Documents every mismatch between what the frontend calls and what the backend actually provides. These must be fixed for end-to-end functionality.

---

## Critical Gaps (App-Breaking)

### GAP-1: `/api/recommendations` endpoint missing

| Item | Detail |
|------|--------|
| **Frontend calls** | `POST /api/recommendations` (`getRecommendations()` in `api.jsx`) |
| **Backend provides** | ❌ No such route — `recom.controller.js` is fully commented out |
| **Impact** | `/recommendations` page always fails — shows error state |
| **Fix** | Either implement the recommendation engine on backend OR change frontend to GET `/api/destinations` with filter params |

---

### GAP-2: `/api/saved-destinations` endpoints missing

| Item | Detail |
|------|--------|
| **Frontend calls** | `POST /api/saved-destinations/:id` (save), `DELETE /api/saved-destinations/:id` (unsave), `GET /api/saved-destinations` (list) |
| **Backend provides** | ❌ None of these routes exist |
| **Impact** | Save/unsave feature broken on all pages. Profile's saved destinations always empty. DestinationDetail save toggle non-functional |
| **Fix (Backend)** | Add `savedDestinations[]` field to User model, create `saved-destinations` route + controller |
| **Fix (Frontend Temp)** | Wrap calls in try/catch (currently done), show appropriate empty state |

---

### GAP-3: `/api/config` endpoint missing

| Item | Detail |
|------|--------|
| **Frontend calls** | `GET /api/config` (`getConfig()` in `MapPlaceholder.jsx`) |
| **Backend provides** | ❌ No such route |
| **Impact** | `MapPlaceholder` always shows placeholder — never loads Google Maps |
| **Fix (Backend)** | Add a public `/api/config` endpoint returning `{google_maps_api_key: ...}` |
| **Fix (Frontend)** | Use `VITE_GOOGLE_MAPS_API_KEY` env var directly instead of fetching from backend |

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

### GAP-7: Logout does not call backend

| Item | Detail |
|------|--------|
| **Frontend behavior** | `logout()` only clears localStorage — no API call made |
| **Backend endpoint** | `POST /api/auth/logout {accessToken, refreshToken}` exists and blacklists tokens |
| **Impact** | Tokens remain valid on server even after frontend logout. Security risk |
| **Fix** | Update `api.jsx :: logout()` to call `POST /api/auth/logout` before clearing storage |

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
| GAP-1 | Recommendations | 🔴 Critical | Backend |
| GAP-2 | Save/Unsave destinations | 🔴 Critical | Backend |
| GAP-3 | Google Maps config | 🟡 Medium | Backend or Frontend |
| GAP-4 | `id` vs `_id` | 🔴 Critical | Backend (transform) or Frontend |
| GAP-5 | Survey field names | 🔴 Critical | Frontend |
| GAP-6 | Landing trending data | 🔴 Critical | Frontend (1 line fix) |
| GAP-7 | Logout blacklist | 🟡 Medium | Frontend |
| GAP-8 | Profile fields | 🟡 Medium | Both |
| GAP-9 | Destination schema fields | 🔴 Critical | Backend |

---

## Quick Fix Priority

1. **GAP-6** — 1-line fix in `Landing.jsx` (`data` → `data.destinations`)  
2. **GAP-5** — Transform survey payload before submit  
3. **GAP-4** — Normalize `_id` → `id` in backend response or frontend reads  
4. **GAP-9** — Add missing fields to destination schema  
5. **GAP-7** — Call `POST /api/auth/logout` in frontend logout  
6. **GAP-8** — Align profile response fields  
7. **GAP-1** — Implement recommendation engine  
8. **GAP-2** — Implement saved destinations feature  
9. **GAP-3** — Pass Maps key directly from env var  
