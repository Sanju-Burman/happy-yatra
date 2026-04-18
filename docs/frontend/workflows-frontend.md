# Happy Yatra — Frontend Workflows & Data Flows

---

## 1. Application Bootstrap Flow

```
Browser loads index.html
    │
    ▼
main.jsx
    └── ReactDOM.createRoot('#root')
        └── <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                └── <App />
                        │
                        ▼
                App.jsx :: useEffect (mount)
                    ├── getStoredUser()   → localStorage.getItem('user')
                    ├── getStoredTokens() → localStorage.getItem('accessToken')
                    │
                    ├── if user AND accessToken:
                    │       setUser(storedUser)    ← session restored
                    │       setAuthToken(token)    ← axios header set
                    │
                    └── setLoading(false) → routes become active
```

---

## 2. Auth Flows

### 2.1 Signup Flow
```
User fills /signup form {name, email, password (min 6)}
    │
    ▼
Signup.jsx :: handleSubmit()
    │
    ├── setLoading(true)
    ├── api.signup(email, password, name)
    │       POST /api/auth/signup {name, email, password}
    │       ← {access_token, refresh_token, user}
    │       ├── storeTokens(access, refresh) → localStorage + axios header
    │       └── storeUser(user)              → localStorage
    │
    ├── setUser(data.user)     ← lifts state to App.jsx
    ├── toast.success(...)
    └── navigate('/survey')    ← redirects to survey immediately
```

### 2.2 Login Flow
```
User fills /login form {email, password}
    │
    ▼
Login.jsx :: handleSubmit()
    │
    ├── setLoading(true)
    ├── api.login(email, password)
    │       POST /api/auth/login {email, password}
    │       ← {access_token, refresh_token, user}
    │       ├── storeTokens(access, refresh) → localStorage + axios header
    │       └── storeUser(user)              → localStorage
    │
    ├── setUser(data.user)
    ├── toast.success(...)
    └── navigate('/')
```

### 2.3 Logout Flow
```
User clicks "Logout" in Navbar
    │
    ▼
Navbar.jsx :: handleLogout()
    │
    ├── api.logout()
    │       clearTokens():
    │           localStorage.removeItem('accessToken')
    │           localStorage.removeItem('refreshToken')
    │           localStorage.removeItem('user')
    │           setAuthToken(null)   ← removes axios header
    │       ⚠️ Does NOT call POST /api/auth/logout — tokens remain valid server-side
    │
    ├── setUser(null)             ← lifts state to App.jsx → triggers PublicRoute redirect
    ├── toast.success(...)
    └── navigate('/')
```

### 2.4 Automatic Token Refresh (Axios Interceptor)
```
Any API call returns 401 Unauthorized
    │
    ▼
Axios interceptor (api.jsx)
    │
    ├── originalRequest._retry === false (first retry only)
    ├── refreshAccessToken()
    │       GET refreshToken from localStorage
    │       POST /api/auth/refresh { refresh_token }
    │       ← {access_token, refresh_token}
    │       storeTokens(newAccess, refresh) → localStorage + axios header
    │
    ├── Retry originalRequest with new token
    │
    └── On refreshAccessToken() failure:
            clearTokens()
            window.location.href = '/login'
```

---

## 3. Page Data Flows

### 3.1 Landing Page
```
Landing.jsx mounts
    │
    ├── useEffect → getDestinations(page=1, limit=6, trending=true)
    │       GET /api/destinations?page=1&limit=6&trending=true
    │       ├── ← Destination[] array
    │       └── setTrendingDestinations(data.destinations || [])
    │           ⚠️ BUG: API returns array directly, not {destinations:[]}
    │           → trendingDestinations will always be [] (empty)
    │
    └── Renders:
        ├── Hero: CTA buttons depend on user prop
        │       user → "Start Your Journey" → /survey
        │       !user → "Get Started" → /signup  +  "Login" → /login
        ├── Features grid (static cards)
        └── Trending grid → maps trendingDestinations → <DestinationCard>
```

### 3.2 Survey Flow (Step-by-Step)
```
Survey.jsx
    │
    ├── State: step=1, formData={interests:[], budget:'', travel_style:'', past_travels:[]}
    │
    ├── Step 1 (interests): toggle multi-select chips
    │   Guard: interests.length > 0 → Next
    │
    ├── Step 2 (budget): single-select cards (budget/moderate/expensive/luxury)
    │   Guard: budget !== '' → Next
    │
    ├── Step 3 (travel_style): single-select (Solo/Couple/Family/Friends/Business)
    │   Guard: travel_style !== '' → Next
    │
    ├── Step 4 (past_travels): toggle multi-select regions
    │   Guard: past_travels.length > 0 → Submit
    │
    └── Submit:
        api.submitSurvey(formData)
            POST /api/survey {interests, budget, travel_style, past_travels}
            ⚠️ Backend expects {travelStyle, budget, interests, activities}
            ⚠️ 'travel_style' ≠ 'travelStyle', 'past_travels' not in schema
        ← {message: "Survey submitted successfully"}
        navigate('/thank-you')
```

### 3.3 Recommendations Page
```
Recommendations.jsx mounts
    │
    ├── useEffect → getRecommendations()
    │       POST /api/recommendations
    │       ⚠️ CRITICAL: /recommendations does NOT exist on backend
    │       → Will always fail with error
    │
    ├── On error.response.status === 400:
    │       setError('Please complete the survey first...')
    │
    └── On other errors:
            setError('Failed to load recommendations...')
            → Shows "Take Survey" button
```

### 3.4 Destination Detail Page
```
DestinationDetail.jsx mounts with :id param
    │
    ├── Parallel fetch (Promise.all):
    │   ├── getDestination(id) → GET /api/destinations/:id
    │   └── getSavedDestinations() → GET /api/saved-destinations
    │       ⚠️ /saved-destinations does NOT exist on backend
    │
    ├── setDestination(destData)
    ├── setIsSaved(savedData.some(d => d.id === id))
    │   ⚠️ BUG: Backend uses _id, frontend checks .id
    │
    └── Save Toggle:
        ├── isSaved → unsaveDestination(id) → DELETE /api/saved-destinations/:id
        └── !isSaved → saveDestination(id)  → POST /api/saved-destinations/:id
        ⚠️ Both endpoints missing from backend
```

### 3.5 Profile Page
```
Profile.jsx mounts
    │
    ├── Parallel fetch (Promise.all):
    │   ├── getProfile() → GET /api/user/profile
    │   │   ← {user: {username, email, role}}
    │   │   ⚠️ Profile renders profile?.user?.name (not .username)
    │   └── getSavedDestinations() → GET /api/saved-destinations
    │       ⚠️ Endpoint missing from backend
    │
    └── Renders:
        ├── Profile header: name, email, saved count, travel style
        ├── Preferences section (if profile.preferences exists)
        │   ⚠️ Current backend /user/profile returns no preferences field
        └── Saved destinations grid
```

---

## 4. Component Interaction Diagram

```
App.jsx  ──── user, setUser ────►  Navbar.jsx
   │                                  │ logout() → setUser(null)
   │                                  │
   ├── <Landing user={user} />         │
   ├── <Login setUser={setUser} />      │
   ├── <Signup setUser={setUser} />     │
   ├── <Survey />                       │
   ├── <ThankYou />                     │
   ├── <Recommendations />              │
   │       └── <DestinationCard />      │
   │       └── <MapPlaceholder />       │
   ├── <DestinationDetail />            │
   │       └── <MapPlaceholder />       │
   └── <Profile />                      │
           └── <DestinationCard         │
                  onSaveChange={refresh}/>
```

---

## 5. Theme System

```
main.jsx
  └── <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          └── App uses CSS variables: --background, --foreground, --primary, --muted…

Navbar.jsx
  └── useTheme() → { theme, setTheme }
      toggle button: theme === "dark" ? setTheme("light") : setTheme("dark")
      Shows: <Sun /> in dark mode, <Moon /> in light mode

Tailwind config uses CSS variables for theming:
  bg-background, text-foreground, bg-card, bg-muted, text-primary…
```

---

## 6. Error Handling Patterns

| Layer | Pattern |
|-------|---------|
| API calls | `try/catch` in every page component |
| User feedback | `toast.error(error.response?.data?.detail \|\| 'Fallback message')` |
| Global 401 | Axios interceptor → auto-refresh → retry OR redirect to `/login` |
| Load states | Local `loading` state → conditional render of spinner/skeleton |
| Not found | Destination/profile null check → redirect message |
| Empty states | Conditional render with helpful empty state UI |

---

## 7. `data-testid` Reference (for E2E Testing)

| Element | data-testid |
|---------|-------------|
| Navbar | `main-navbar` |
| Logo link | `logo-link` |
| Nav: Login | `nav-login-link` |
| Nav: Signup | `nav-signup-button` |
| Nav: Survey | `nav-survey-link` |
| Nav: Recommendations | `nav-recommendations-link` |
| Nav: Profile | `nav-profile-link` |
| Nav: Logout | `logout-button` |
| Landing page | `landing-page` |
| Hero signup button | `hero-signup-button` |
| Hero login button | `hero-login-button` |
| Hero survey button | `hero-start-survey-button` |
| Feature cards | `feature-card-0`, `feature-card-1`, `feature-card-2` |
| Trending grid | `trending-destinations-grid` |
| Login page | `login-page` |
| Login form | `login-form` |
| Login email | `login-email-input` |
| Login password | `login-password-input` |
| Login submit | `login-submit-button` |
| Login signup link | `login-signup-link` |
| Signup page | `signup-page` |
| Signup form | `signup-form` |
| Signup name | `signup-name-input` |
| Signup email | `signup-email-input` |
| Signup password | `signup-password-input` |
| Signup submit | `signup-submit-button` |
| Survey page | `survey-page` |
| Survey step 1–4 | `survey-step-1` … `survey-step-4` |
| Interest toggles | `interest-beach`, `interest-adventure`, etc. |
| Budget options | `budget-budget`, `budget-moderate`, etc. |
| Travel style options | `travel-style-solo`, `travel-style-couple`, etc. |
| Past travel regions | `past-travel-asia`, `past-travel-europe`, etc. |
| Survey Next | `survey-next-button` |
| Survey Back | `survey-back-button` |
| Survey Submit | `survey-submit-button` |
| ThankYou page | `thank-you-page` |
| ThankYou → Recommendations | `thank-you-recommendations-button` |
| ThankYou → Home | `thank-you-home-button` |
| Recommendations page | `recommendations-page` |
| Recommendations loading | `recommendations-loading` |
| Recommendations error | `recommendations-error` |
| Recommendations grid | `recommendations-grid` |
| Destination detail | `destination-detail-page` |
| Detail back button | `destination-back-button` |
| Detail save button | `destination-save-button` |
| Profile page | `profile-page` |
| Profile saved grid | `profile-saved-destinations` |
| Destination card | `destination-card-{id}` |
| Card save button | `save-button-{id}` |
| Map placeholder | `map-placeholder` |
| Google map | `google-map` |
