# 🌽 Destination Recommendation Platform

## ✨ Introduction
A personalized platform helping travelers discover their ideal travel destinations based on unique preferences like interests, travel style, budget, and past travel history.
This project solves the problem of overwhelming choices by offering smart, tailored suggestions — enhancing trip planning and discovery.

## 🛠 Project Type
**Fullstack**

## 🌐 Deployed App
- Frontend: https://happyyatra.netlify.app/
- Backend: https://happyatra.vercel.app/
- Database: MongoDB Atlas

## 📂 Directory Structure
```
my-destination-platform/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── app.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
├── README.md
├── package.json
└── ...
```

## 🎥 Video Walkthrough
> **[https://youtu.be/OrY_tJoF7g0]**

## 🎥 Codebase Walkthrough
> **(Attach 1-5 min video showing project structure, key components, auth flow, etc.)**

## 🚀 Features
- 📝 Multi-step User Preference Survey (one-page, smooth flow) (Coming soon)
- 🎯 Personalized Destination Recommendations
- 🌍 Interactive Google Map with destination markers (Under Development)
- 🛡️ JWT Authentication (Login, Signup, Refresh Token Rotation)
- 📋 Profile Page showing saved destinations
- ❤️ Save/unsave destinations feature (Under Development)
- 🔍 Lazy Loading for images and Paginated Destinations
- 🎉 Animated Cards & Clean UI
- 🔄 Reset form after submit + Redirect to Thank You page
- 🌍 Trending Destinations Section
- 📱 Fully Responsive Design

## 🧐 Design Decisions & Assumptions
- **One-page survey:** Simplifies user experience
- **Lazy loading & pagination:** For performance on large datasets
- **JWT Refresh Tokens:** So users stay logged in securely
- **Destination Service:** Fetched once and cached globally
- **Google Map integration:** Enhances visualization of recommended places (Under Development)

## 📦 Installation & Getting Started

```bash
# Clone the repo
git clone https://github.com/Sanju-Burman/happy-yatra
cd happy-yatra

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Start the backend server
cd ../backend
npm run dev

# Start the frontend dev server
cd ../frontend
npm run dev
```

- Ensure you configure `.env` variables like MongoDB URI, JWT_SECRET, etc.
- MongoDB collections are created automatically when inserting destinations or users.

## 🛠 Usage Example

```bash
# Example API Call
POST /api/auth/login
Body: { "email": "user@example.com", "password": "password123" }

# Example Save Destination
POST /api/profile/save
Body: { "destinationId": "..." }
```

> Include screenshots or short screen-recording gifs if possible.

## 🔑 Credentials
| Role  | Email                | Password     |
|-------|----------------------|--------------|
| User  | testuser@example.com  | password123  |

## 🔗 APIs Used
- Google Maps JavaScript API

## 🧹 API Endpoints

### Authentication
- `POST /api/auth/signup` — Register new user
- `POST /api/auth/login` — Login user, returns Access Token & Refresh Token
- `POST /api/auth/refresh-token` — Get new Access Token
- `POST /api/auth/logout` — Invalidate Refresh Token

### User Profile
- `GET /api/profile` — Get user profile and saved destinations
- `POST /api/profile/save` — Save a destination
- `POST /api/profile/unsave` — Unsave a destination

### Destination Service
- `GET /api/destinations` — Fetch all available destinations (paginated)
- `GET /api/destinations/:id` — Get single destination details

---

## 🔐 Authentication Flow Diagram

```plaintext
User                Frontend              Backend                  Database
 |                      |                     |                         |
 |--- (1) Signup/Login -->|                     |                         |
 |                      |--- (2) Send Request -->|                         |
 |                      |                     |--- (3) Check credentials |
 |                      |                     |<-- (4) User Valid/Created|
 |                      |<-- (5) Access + Refresh Tokens |
 |--- (6) Store Tokens Securely ---|
 |                      |                     |                         |
[ACCESS TOKEN EXPIRES]
 |                      |--- (7) Refresh Token Request -->|
 |                      |                     |--- (8) Validate & Issue New Access Token |
 |                      |<-- (9) New Access Token |
 |                      |                     |                         |
[USER LOGOUTS]
 |                      |--- (10) Logout Request -->|
 |                      |                     |--- (11) Clear Refresh Token |
```

---

## 📜 Token Handling Details
- **Access Tokens** are short-lived (~15 minutes) and used for regular authenticated requests.
- **Refresh Tokens** are securely issued and stored, allowing silent renewal of Access Tokens without forcing users to log in repeatedly.
- Backend verifies refresh tokens and issues new access tokens, implementing secure **Refresh Token Rotation** for additional security.
- Logout flow clears the refresh token, invalidating user sessions properly.

---

## 🛠 Technology Stack
- **Frontend:** React.js, React Router, Axios, CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Authentication:** JWT (Access Token + Refresh Token)
- **Others:** Google Maps API, React-Toastify, Framer Motion, React-Paginate

