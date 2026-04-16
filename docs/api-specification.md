# Happy Yatra — API Specification

**Base URL (Production):** `https://happyatra.vercel.app/api`  
**Base URL (Local):** `http://localhost:9000/api`  
**Content-Type:** `application/json`

---

## Authentication

The API uses **JWT Bearer Token** authentication.

- **Access Token** — short-lived (1 day). Pass in `Authorization` header.
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
  "message": "User registered successfully",
  "access_token": "<jwt_access_token>",
  "refresh_token": "<jwt_refresh_token>",
  "user": {
    "userId": "64abc123...",
    "email": "john@example.com"
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
  "access_token": "<jwt_access_token>",
  "refresh_token": "<jwt_refresh_token>",
  "user": {
    "userId": "64abc123...",
    "email": "john@example.com"
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
  "access_token": "<new_jwt_access_token>",
  "refresh_token": "<same_jwt_refresh_token>"
}
```

> **Note:** Refresh token is NOT rotated — the same refresh token is returned.

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
  "user": {
    "_id": "64abc123...",
    "username": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Error Responses:**
| Status | Condition | Body |
|--------|-----------|------|
| `400` | Email not resolvable | `{"message": "Email parameter is required"}` |
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
[
  {
    "_id": "64xyz789...",
    "name": "Goa",
    "imageUrl": "https://...",
    "averageCost": 15000,
    "styles": ["beach", "relaxation"],
    "tags": ["tropical", "party"],
    "activities": ["surfing", "sightseeing"],
    "location": "Goa, India",
    "latitude": 15.2993,
    "longitude": 74.1240,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

> ⚠️ No pagination metadata (total count, totalPages) is returned currently.

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
  "_id": "64xyz789...",
  "name": "Goa",
  "imageUrl": "https://...",
  "averageCost": 15000,
  "styles": ["beach"],
  "tags": ["tropical"],
  "activities": ["surfing"],
  "location": "Goa, India",
  "latitude": 15.2993,
  "longitude": 74.1240,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
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

**Auth Required:** ❌ Public *(Note: should ideally be protected)*

**Request Body:**
```json
{
  "user": "64abc123...",
  "travelStyle": "adventure",
  "budget": 30000,
  "interests": ["nature", "culture"],
  "activities": ["hiking", "photography"]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user` | MongoDB ObjectId | ✅ | Must be a valid ObjectId of the user |
| `travelStyle` | String | ✅ | e.g., `"adventure"`, `"relaxation"` |
| `budget` | Number | ✅ | Total budget in INR (or relevant currency) |
| `interests` | String[] | ❌ | Array of interest tags |
| `activities` | String[] | ❌ | Array of preferred activities |

**Success Response — `201 Created`:**
```json
{
  "message": "Survey submitted successfully"
}
```

**Error Responses:**
| Status | Condition | Body |
|--------|-----------|------|
| `400` | Invalid `user` ObjectId | `{"message": "Invalid user ID"}` |
| `500` | DB error | `{"error": "Failed to submit survey"}` |

---

### GET `/api/survey`

Fetch all survey submissions, sorted by newest first.

**Auth Required:** ❌ Public *(Note: exposes all user survey data — should be admin-protected)*

**Success Response — `200 OK`:**
```json
[
  {
    "_id": "...",
    "user": "64abc123...",
    "travelStyle": "adventure",
    "budget": 30000,
    "interests": ["nature"],
    "activities": ["hiking"],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

**Error Responses:**
| Status | Condition | Body |
|--------|-----------|------|
| `500` | DB error | `{"error": "Failed to fetch survey data"}` |
