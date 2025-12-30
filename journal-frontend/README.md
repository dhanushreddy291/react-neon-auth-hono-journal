<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://neon.com/brand/neon-logo-dark-color.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://neon.com/brand/neon-logo-light-color.svg">
  <img width="250px" alt="Neon Logo fallback" src="https://neon.com/brand/neon-logo-dark-color.svg">
</picture>

# Journal App Frontend (React)

The frontend for the Journal application. Built with **React**, **Vite**, and the **Neon SDK**.

This application handles:
1.  User Sign Up / Sign In using Neon Auth UI components.
2.  Managing the active user session.
3.  Calling the backend API with the user's Access Token.

## Prerequisites

-   Node.js v18+
-   The `journal-backend` server running on port 3000.

## Setup

1.  **Install dependencies:**

    ```bash
    npm install
    ```

2.  **Configure Environment Variables:**
    Create a `.env` file in this directory:

    ```bash
    cp .env.example .env
    ```

    Then, edit `.env` to add your Neon Auth URL and Backend API URL:

    <p align="left">
      <img src="../images/neon-auth-base-url.png" alt="Neon Auth URL" width="500"/> 
    </p>

    ```env
    # Found in Neon Console -> Auth -> Configuration
    VITE_NEON_AUTH_URL="https://ep-xxx.neon.tech/neondb/auth"

    # The URL of your local Hono backend
    VITE_API_URL="http://localhost:3000/api"
    ```

    > Replace the placeholders with your actual Neon project details.

3.  **Start the App:**

    ```bash
    npm run dev
    ```

    Open `http://localhost:5173` in your browser.

## How it works

When a user logs in, Neon Auth creates a session. We retrieve the **Access Token** (JWT) from this session and attach it to every request sent to our backend.

```typescript
// src/api.ts

// 1. Get the session from Neon SDK
const { data } = await authClient.getSession();
const token = data?.session?.token;

// 2. Attach to headers
const headers = {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
};

// 3. Send request to our custom backend
fetch(`${API_URL}/entries`, { headers, ... });
```

The backend then verifies this token using Neon Auth's JWKS endpoint before allowing access to protected resources.
