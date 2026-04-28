# Happy Yatra — API Specification

**Base URL (Production):** `https://happyatra.vercel.app/api`  
**Base URL (Local):** `http://localhost:9000/api`  
**Content-Type:** `application/json`

---

## Authentication

The API uses **JWT Bearer Token** authentication.

- **Access Token** — short-lived (3 hours). Pass in `Authorization` header.
- **Refresh Token** — long-lived (7 days). Used to obtain new access tokens.

```
Authorization: Bearer <access_token>
```

Routes marked ✅ require the `Authorization` header. Routes marked ❌ are public.

---

## Error Response Format

All errors return a consistent JSON body:

```json
{
  "message": "Human-readable error description",
  "error": "Technical error detail (optional)"
}
```

---

## Error Code Reference

| HTTP Status | Meaning |
|-------------|---------|
| `200` | OK — Request succeeded |
| `201` | Created — Resource created successfully |
| `400` | Bad Request — Invalid input / missing fields |
| `401` | Unauthorized — Missing, expired, or blacklisted token |
| `403` | Forbidden — Valid token but insufficient role (admin only) |
| `404` | Not Found — Resource does not exist |
| `500` | Internal Server Error — Unexpected server failure |

---

## Module 1: Authentication (`/api/auth`)

---

### POST `/api/auth/signup`

Register a new user. On success, immediately issues tokens (auto-login).

**Auth Required:** ❌ Public

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

> **Note:** Field `name` and `username` are both accepted. The controller normalizes them: `username = req.body.username || req.body.name`.

**Success Response — `201 Created`:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "access_token": "<jwt_access_token>",
  "refresh_token": "<jwt_refresh_token>",
  "user": {
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Error Responses:**
| Status | Condition | Body |
|--------|-----------|------|
| `400` | `name`/`username` missing | `{"message": "Username or name is required"}` |
| `500` | Email already exists / DB error | `{"message": "Registration failed", "error": "User already exists"}` |

---

### POST `/api/auth/login`

Authenticate an existing user.

**Auth Required:** ❌ Public

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Success Response — `200 OK`:**
```json
{
  "success": true,
  "access_token": "<jwt_access_token>",
  "refresh_token": "<jwt_refresh_token>",
  "user": {
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Error Responses:**
| Status | Condition | Body |
|--------|-----------|------|
| `401` | Wrong email or password | `{"message": "Login failed", "error": "Invalid email or password"}` |

---

### POST `/api/auth/refresh`

Issue a new access token using a valid refresh token.

**Auth Required:** ❌ Public

**Request Body:**
```json
{
  "refresh_token": "<jwt_refresh_token>"
}
```

**Success Response — `200 OK`:**
```json
{
  "success": true,
  "access_token": "<new_jwt_access_token>",
  "refresh_token": "<new_jwt_refresh_token>"
}
```

> **Note:** Refresh token is rotated — a new refresh token is returned and the old one is blacklisted.

**Error Responses:**
| Status | Condition | Body |
|--------|-----------|------|
| `401` | Token blacklisted | `{"message": "Refresh failed", "error": "Invalid token"}` |
| `401` | Token invalid/expired | `{"message": "Refresh failed", "error": "Invalid refresh token"}` |
| `401` | No token provided | `{"message": "Refresh failed", "error": "Refresh Token required"}` |

---

### POST `/api/auth/logout`

Invalidate both access and refresh tokens by adding them to the blacklist.

**Auth Required:** ❌ Public (tokens are passed in body)

**Request Body:**
```json
{
  "accessToken": "<jwt_access_token>",
  "refreshToken": "<jwt_refresh_token>"
}
```

**Success Response — `200 OK`:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Error Responses:**
| Status | Condition | Body |
|--------|-----------|------|
| `500` | DB failure | `{"message": "Logout failed", "error": "..."}` |

---

### POST `/api/auth/data` *(Protected Test Route)*

A protected test endpoint to verify token validity.

**Auth Required:** ✅ Bearer Token

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response — `200 OK`:**
```json
"protected page running"
```

**Error Responses:**
| Status | Condition | Body |
|--------|-----------|------|
| `401` | No token | `{"error": "Access denied, token require"}` |
| `401` | Blacklisted | `{"message": "blacklisted token"}` |
| `401` | Expired | `{"message": "Token expired"}` |
| `401` | Invalid | `{"message": "Invalid token in verifying"}` |

---

## Module 2: User Profile (`/api/user`)

---

### GET `/api/user/profile`

Fetch the authenticated user's profile data.

**Auth Required:** ✅ Bearer Token

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response — `200 OK`:**
```json
{
  "success": true,
  "user": {
    "_id": "64abc123...",
    "username": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

> **Note:** The user is looked up using the ID extracted from the JWT `sub` claim. Sensitive fields like `password` are excluded at the database level.

**Error Responses:**
| Status | Condition | Body |
|--------|-----------|------|
| `401` | Authentication required | `{"message": "Authentication required"}` |
| `401` | Invalid/expired token | *(see auth errors above)* |
| `404` | User not in DB | `{"message": "User not found"}` |
| `500` | DB error | `{"message": "Failed to fetch user details"}` |

---

## Module 3: Destinations (`/api/destinations`)

---

### GET `/api/destinations`

Fetch paginated list of travel destinations. Supports filtering by trending flag.

**Auth Required:** ❌ Public

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | Integer | `1` | Page number |
| `limit` | Integer | `12` | Results per page |
| `trending` | Boolean string | — | Pass `true` to filter trending destinations |

**Example Request:**
```
GET /api/destinations?page=1&limit=12&trending=true
```

**Success Response — `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64xyz789...",
      "name": "Goa",
      ...
    }
  ],
  "pagination": {
     "total": 45,
     "page": 1,
     ...
  }
}
```

> ✅ Pagination metadata (total, page, limit, totalPages, hasNextPage, hasPrevPage) is included in the response.

**Error Responses:**
| Status | Condition | Body |
|--------|-----------|------|
| `500` | DB error | `{"message": "Server Error on get Destinations"}` |

---

### GET `/api/destinations/:id`

Fetch a single destination by its MongoDB ObjectId.

**Auth Required:** ❌ Public

**Path Parameter:**
| Param | Type | Description |
|-------|------|-------------|
| `id` | MongoDB ObjectId | The destination's `_id` |

**Example Request:**
```
GET /api/destinations/64xyz789abc123def456ghi
```

**Success Response — `200 OK`:**
```json
{
  "success": true,
  "data": {
    "_id": "64xyz789...",
    "name": "Goa",
    ...
  }
}
```

**Error Responses:**
| Status | Condition | Body |
|--------|-----------|------|
| `400` | Malformed ObjectId | `{"message": "Invalid destination id format"}` |
| `404` | Not found | `{"message": "Destination not found"}` |
| `500` | DB error | `{"message": "Server Error on get Destination by ID"}` |

---

## Module 4: Survey (`/api/survey`)

---

### POST `/api/survey`

Submit user travel preference survey data.

**Auth Required:** ✅ Bearer Token

**Request Body:**
```json
{
  "travelStyle": "adventure",
  "budget": 1,
  "interests": ["nature", "culture"],
  "activities": ["hiking", "photography"]
}
```

> **Note:** The `user` field is no longer accepted in the request body. Ownership is automatically assigned based on the authenticated session's JWT. `budget` expects a numeric value (1: Budget, 2: Moderate, 3: Expensive, 4: Luxury).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `travelStyle` | String | ✅ | e.g., `"Solo"`, `"Adventure"` |
| `budget` | Number | ✅ | 1 (Budget), 2 (Moderate), 3 (Expensive), 4 (Luxury) |
| `interests` | String[] | ❌ | Array of interest tags |
| `activities` | String[] | ❌ | Array of preferred activities |

**Success Response — `201 Created`:**
```json
{
  "success": true,
  "message": "Survey submitted successfully"
}
```

**Error Responses:**
| Status | Condition | Body |
|--------|-----------|------|
| `400` | Invalid `user` ObjectId | `{"message": "Invalid user ID"}` |
| `500` | DB error | `{"error": "Failed to submit survey"}` |

---

Fetch user survey submissions, sorted by newest first.

**Auth Required:** ✅ Bearer Token

> **Note:** Regular users can only see their own surveys. Admins can see all surveys.

**Success Response — `200 OK`:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "...",
      "user": "64abc123...",
      "travelStyle": "adventure",
      ...
    }
  ]
}
```

**Error Responses:**
| Status | Condition | Body |
|--------|-----------|------|
| `500` | DB error | `{"error": "Failed to fetch survey data"}` |

---

## Module 5: Saved Destinations (`/api/saved-destinations`)

All routes in this module require authentication.

---

### GET `/api/saved-destinations`

Fetch the authenticated user's saved destinations with full destination data.

**Auth Required:** ✅ Bearer Token

**Success Response — `200 OK`:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "64xyz789...",
      "name": "Goa",
      "imageUrl": "https://...",
      "averageCost": 3000,
      "styles": ["Beach"],
      "tags": ["Relaxation", "Nature"],
      "activities": ["Swimming"],
      "location": "Goa, India",
      "latitude": 15.2993,
      "longitude": 74.124,
      "trending": true,
      "description": "A beautiful beach destination"
    }
  ]
}
```

**Error Responses:**
| Status | Condition | Body |
|--------|-----------|------|
| `401` | No/invalid token | *(see auth errors)* |
| `404` | User not found | `{"message": "User not found"}` |

---

### POST `/api/saved-destinations/:id`

Save a destination to the user's saved list. Prevents duplicates via `$addToSet`.

**Auth Required:** ✅ Bearer Token

**Path Parameter:**
| Param | Type | Description |
|-------|------|-------------|
| `id` | MongoDB ObjectId | The destination's `_id` |

> **Validation:** The `:id` parameter is validated via `express-validator` `isMongoId()`. Invalid IDs are rejected with a `400` before reaching the controller.

**Success Response — `200 OK`:**
```json
{
  "success": true,
  "message": "Destination saved successfully"
}
```

**Error Responses:**
| Status | Condition | Body |
|--------|-----------|------|
| `400` | Malformed ObjectId | `{"errors": [{"msg": "Invalid destination ID format", ...}]}` |
| `401` | No/invalid token | *(see auth errors)* |
| `404` | Destination not found | `{"message": "Destination not found"}` |
| `404` | User not found | `{"message": "User not found"}` |

---

### DELETE `/api/saved-destinations/:id`

Remove a destination from the user's saved list.

**Auth Required:** ✅ Bearer Token

**Path Parameter:**
| Param | Type | Description |
|-------|------|-------------|
| `id` | MongoDB ObjectId | The destination's `_id` |

**Success Response — `200 OK`:**
```json
{
  "success": true,
  "message": "Destination removed from saved"
}
```

**Error Responses:**
| Status | Condition | Body |
|--------|-----------|------|
| `400` | Malformed ObjectId | `{"errors": [{"msg": "Invalid destination ID format", ...}]}` |
| `401` | No/invalid token | *(see auth errors)* |
| `404` | User not found | `{"message": "User not found"}` |

---

## Module 6: Recommendations (`/api/recommendations`)

---

### POST `/api/recommendations`

Get personalized destination recommendations based on the user's latest survey data.

**Auth Required:** ✅ Bearer Token

**Success Response — `200 OK`:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "64xyz789...",
      "name": "Goa",
      ...
    }
  ]
}
```

> **Note:** The recommendation engine matches destinations by `travelStyle`, `interests` (mapped to `tags`), and `budget`. If no matches are found with strict criteria, it progressively loosens the filters.

**Error Responses:**
| Status | Condition | Body |
|--------|-----------|------|
| `400` | No survey submitted | `{"message": "Please complete the survey first to get recommendations."}` |
| `401` | No/invalid token | *(see auth errors)* |

---

## Module 7: Admin Panel (`/api/admin`)

This module requires a valid JWT with the `admin` role.

### GET `/api/admin/analytics`
Fetches platform statistics and data for charts.

**Auth Required:** ✅ Admin

**Success Response — `200 OK`:**
```json
{
  "totals": { "users": 150, "destinations": 45, "surveys": 110, "trending": 8 },
  "surveyCompletionRate": "73.3",
  "topDestinations": [ { "name": "Goa", "viewCount": 250, "trending": true } ],
  "signupsByDay": [ { "_id": "2023-10-01", "count": 5 } ],
  "surveyInterests": [ { "_id": "nature", "count": 45 } ],
  "surveyBudgets": [ { "_id": "Adventure", "count": 30 } ]
}
```

---

### GET `/api/admin/destinations`
Paginated list of all destinations for administrative management.

**Auth Required:** ✅ Admin

**Query Params:** `page`, `limit` (Default: 1, 20)

---

### POST `/api/admin/destinations`
Create a new destination.

**Auth Required:** ✅ Admin

**Request Body:** Similar to Destination schema. `viewCount` is ignored.

---

### PUT `/api/admin/destinations/:id`
Update an existing destination.

**Auth Required:** ✅ Admin

**Note:** `viewCount` is protected and cannot be updated via this endpoint.

---

### DELETE `/api/admin/destinations/:id`
Delete a destination from the catalog.

**Auth Required:** ✅ Admin

---

### PATCH `/api/admin/destinations/:id/trending`
Toggle the trending status of a destination.

**Auth Required:** ✅ Admin

---

### GET `/api/admin/users`
Paginated list of registered users.

**Auth Required:** ✅ Admin

**Note:** Returns user details excluding passwords.

---

### GET `/api/admin/users/:id/survey`
Fetch specific survey results for a given user ID.

**Auth Required:** ✅ Admin
