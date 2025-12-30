<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://neon.com/brand/neon-logo-dark-color.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://neon.com/brand/neon-logo-light-color.svg">
  <img width="250px" alt="Neon Logo fallback" src="https://neon.com/brand/neon-logo-dark-color.svg">
</picture>

# Journal App Backend (Hono)

The backend API for the Journal application. Built with **Hono**, **Drizzle ORM**, and **Neon**.

This service is responsible for:
1.  Verifying the JWT sent by the frontend against Neon Auth's JWKS endpoint.
2.  Extracting the User ID (`sub` claim) from the token.
3.  Reading and writing private journal entries to the database.

## Prerequisites

-   Node.js v18+
-   A Neon project with Auth enabled.

## Setup

1.  **Install dependencies:**

    ```bash
    npm install
    ```

2.  **Configure environment variables:**
    Create a `.env` file in this directory:

    ```bash
    cp .env.example .env
    ```

    Update the `.env` file with your Neon project details:

    -  `DATABASE_URL`: Found in the Neon Console under **Dashboard -> Connect**.
        <p align="left">
          <img src="../images/connection_details.png" alt="Neon Connection Details" width="500"/>
        </p>
    -  `NEON_AUTH_BASE_URL`: Found in the Neon Console under **Auth** tab.
        <p align="left">
          <img src="../images/neon-auth-base-url.png" alt="Neon Auth URL" width="500"/> 
        </p>

    ```env
    # Found in Neon Dashboard -> Connection Details
    DATABASE_URL="postgresql://[user]:[password]@[neon_hostname]/[dbname]?sslmode=require"

    # Found in Neon Console -> Auth -> Configuration
    NEON_AUTH_BASE_URL"https://ep-xxx.neon.tech/neondb/auth"
    ```

    > Replace the placeholders with your actual Neon project details.

3.  **Apply database migrations:**
    This pushes the `journal_entries` table schema to your Neon database.

    ```bash
    npx drizzle-kit migrate
    ```

4.  **Start the server:**

    ```bash
    npm run dev
    ```

    The server will start on `http://localhost:3000`.

## Key Files

-   `src/index.ts`: The main server entry point. Contains the **JWT Verification Middleware**.
-   `src/db/schema.ts`: Drizzle schema definition for the `journal_entries` table.

## JWT verification logic

The core security mechanism is in the middleware found in `src/index.ts`. It uses the `jose` library to fetch the public keys from Neon and verify the incoming token.

```typescript
const JWKS = jose.createRemoteJWKSet(
  new URL(`${process.env.NEON_AUTH_BASE_URL}/.well-known/jwks.json`)
);

// Verifies that the token was signed by Neon Auth
const { payload } = await jose.jwtVerify(token, JWKS, {
  issuer: new URL(process.env.NEON_AUTH_BASE_URL!).origin,
});
```

If verification fails, the request is rejected with a `401 Unauthorized` response. If successful, the `sub` claim (User ID) is extracted and attached to the request context for use in route handlers.

## Integration with Frontend

This backend is designed to work seamlessly with the [Journal Frontend](../journal-frontend). The frontend handles user authentication and sends the JWT in the `Authorization` header for API requests.