# Happy Yatraa - Frontend

A premium, AI-powered travel recommendation platform built with React, Vite, and Tailwind CSS 4.

## 🚀 Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vite.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) (CSS-first engine)
- **UI Components**: [Shadcn/UI](https://ui.shadcn.com/) (built on Radix UI)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Theme Management**: [next-themes](https://github.com/pacocoursey/next-themes)
- **API Client**: [Axios](https://axios-http.com/)

## 📂 File Structure

```text
frontend/
├── src/
│   ├── api.jsx           # Centralized API configuration and Axios interceptors
│   ├── components/       # Reusable UI components (Navbar, DestinationCard, etc.)
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions (utils.js for shadcn)
│   ├── pages/            # Page-level components (Landing, Survey, Profile, etc.)
│   ├── routes/           # Routing configuration (AllRoutes.jsx)
│   ├── App.jsx           # Main application shell and layout
│   ├── index.css         # Tailwind 4 configuration and global variables
│   └── main.jsx          # Application entry point with Providers
├── public/               # Static assets
├── .env                  # Environment variables
├── vite.config.js        # Vite & Tailwind 4 plugin configuration
└── package.json          # Project dependencies and scripts
```

## 🎨 Design System

Happy Yatraa features a premium, modern design tailored for a seamless travel planning experience.

- **Typography**:
  - **Headings**: `Playfair Display` (Serif) - Provides a sophisticated, editorial feel.
  - **Body**: `DM Sans` (Sans-Serif) - Optimized for readability across all devices.
- **Theme Support**:
  - Built-in **Day/Night mode** toggle.
  - Theme-aware styling using CSS variables (`--background`, `--foreground`, `--primary`, etc.).
  - Sophisticated transitions and micro-animations using Framer Motion.
- **Color Palette**:
  - Primary: Warm terracotta/brown accents (`#A04B32`) reflecting Earth and travel.
  - Backgrounds: Clean whites in light mode, deep slate/blacks in dark mode.

## 🔄 Application Flow

1.  **Landing Page**: Interactive hero section and feature overview.
2.  **Authentication**: Secure Signup and Login workflows.
3.  **Survey**: Multi-step intuitive preference collector (Interests, Budget, Regions, Travel Style).
4.  **AI Recommendations**: Personalized destination matches displayed on a responsive grid and interactive map.
5.  **Profile**: Central hub to view saved destinations and travel preferences.

## 🛡️ Security & API

- **JWT Authentication**: Access and Refresh tokens are securely managed.
- **Axios Interceptors**:
  - **Request**: Automatically attaches the `Authorization: Bearer <token>` header to outgoing requests.
  - **Response**: Handles `401 Unauthorized` errors by automatically logging out the user or attempting a token refresh, ensuring a seamless session.
- **Protected Routes**: Frontend routing logic ensures that sensitive pages (Survey, Recommendations, Profile) are only accessible to authenticated users.
- **Defensive Coding**: All API-driven maps and lists include fallbacks and null-checks to prevent runtime crashes during data loading.

## 🛠️ Setup & Installation

1.  **Clone the repository**.
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Configure environment variables**:
    Create a `.env` file in the root directory:
    ```env
    VITE_Backend_API=http://localhost:9000/api
    ```
4.  **Run the development server**:
    ```bash
    npm run dev
    ```

## 📦 Deployment

The project is configured for a standard Vite build process:
```bash
npm run build
```

### 🛠️ Netlify/Linux Build Stability
To ensure successful deployment on Linux-based environments (like Netlify):
- **Native Modules**: Added `@rollup/rollup-linux-x64-gnu` to `optionalDependencies` in `package.json`.
- **Case Sensitivity**: All imports are standardized to match the filesystem casing exactly.
- **Explicit Extensions**: Imports for components and pages include the `.jsx` extension to avoid resolution errors on some build servers.

## ⚙️ Technical Notes

- **Path Aliases**: The project uses `@/` as an alias for the `src` directory.
  - *Example*: `import Navbar from '@/components/Navbar.jsx';`
- **Linting**: Run `npm run lint` to check for code quality and style issues.
- **CSS Architecture**: Built with Tailwind CSS 4 using the new CSS-first engine. Global styles and variables are defined in `src/index.css`.
