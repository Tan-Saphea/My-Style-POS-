# My Style Frontend

Next.js App Router frontend for the Clothing Sales Management System. All operational pages use the REST API; there are no demo-only CRUD or checkout mutations.

## Commands

```bash
npm install
npm run dev
npm run lint
npm run build
npm start
```

Configure `.env.local`:

```text
NEXT_PUBLIC_API_URL=http://localhost:5001/api/v1
NEXT_PUBLIC_APP_NAME=My Style
```

The frontend keeps access tokens in memory and restores sessions using the backend's HttpOnly refresh cookie. Route visibility is role-aware, but the backend remains the authorization authority.
