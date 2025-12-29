# Better Auth Integration Guide

Complete guide for integrating Better Auth with Docusaurus for authentication and user profiling.

## Table of Contents

1. [Environment Setup](#environment-setup)
2. [Database Configuration](#database-configuration)
3. [OAuth Provider Setup](#oauth-provider-setup)
4. [Better Auth Configuration](#better-auth-configuration)
5. [Client-Side Integration](#client-side-integration)
6. [API Routes](#api-routes)
7. [Protected Routes](#protected-routes)

## Environment Setup

### Required Environment Variables

Create a `.env` file in your project root:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-min-32-chars"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# GitHub OAuth
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email (optional - for email verification)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
```

## Database Configuration

### Running Migrations

```bash
# Using psql
psql $DATABASE_URL -f scripts/create_auth_tables.sql

# Or using Node.js
node scripts/run-migrations.js
```

### Verify Tables Created

```bash
psql $DATABASE_URL -c "\dt"
```

Expected tables:
- `users`
- `sessions`
- `accounts`
- `user_profiles`
- `user_content_preferences`
- `user_progress`
- `verification_tokens`

## OAuth Provider Setup

### GitHub OAuth

1. Go to GitHub → Settings → Developer settings → OAuth Apps
2. Create new OAuth App
3. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Client Secret to `.env`

### Google OAuth

1. Go to Google Cloud Console → APIs & Services → Credentials
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy Client ID and Client Secret to `.env`

## Better Auth Configuration

The `assets/auth.ts` file contains the Better Auth configuration. Key features:

### Email & Password Authentication

```typescript
emailAndPassword: {
  enabled: true,
  requireEmailVerification: true,
}
```

### Social Providers

```typescript
socialProviders: {
  github: {
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  },
}
```

### Session Configuration

```typescript
session: {
  expiresIn: 60 * 60 * 24 * 7, // 7 days
  updateAge: 60 * 60 * 24, // 1 day (refresh session)
}
```

## Client-Side Integration

### 1. Create Auth Context

Create `src/contexts/AuthContext.tsx`:

```typescript
import { createAuthClient } from "@better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

export function AuthProvider({ children }) {
  return (
    <authClient.Provider>
      {children}
    </authClient.Provider>
  );
}
```

### 2. Wrap App with Provider

In `docusaurus.config.js`:

```javascript
module.exports = {
  // ... other config
  clientModules: [
    require.resolve('./src/authInit.js'),
  ],
};
```

Create `src/authInit.js`:

```javascript
import { AuthProvider } from './contexts/AuthContext';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

if (ExecutionEnvironment.canUseDOM) {
  const root = document.getElementById('__docusaurus');
  const AuthWrapper = () => (
    <AuthProvider>
      {/* Docusaurus will inject its content here */}
    </AuthProvider>
  );
}
```

### 3. Use Auth in Components

```typescript
import { authClient } from '@/contexts/AuthContext';

function MyComponent() {
  const { data: session, isLoading } = authClient.useSession();

  if (isLoading) return <div>Loading...</div>;

  if (!session) {
    return <button onClick={() => authClient.signIn.social({ provider: 'github' })}>
      Sign in with GitHub
    </button>;
  }

  return <div>Welcome, {session.user.name}!</div>;
}
```

## API Routes

### Create Auth API Route Handler

Create `src/pages/api/auth/[...all].ts`:

```typescript
import { auth } from '@/lib/auth';

export default auth.handler;
```

### Session API

Create `src/pages/api/session.ts`:

```typescript
import { auth } from '@/lib/auth';

export default async function handler(req, res) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return res.json(session);
}
```

### User Profile API

Create `src/pages/api/user/profile.ts`:

```typescript
import { auth } from '@/lib/auth';
import { pool } from '@/lib/db';

export default async function handler(req, res) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    const profile = req.body;

    await pool.query(
      `INSERT INTO user_profiles (user_id, python_level, ros2_level, ...)
       VALUES ($1, $2, $3, ...)
       ON CONFLICT (user_id) DO UPDATE SET ...`,
      [session.user.id, profile.pythonLevel, profile.ros2Level, ...]
    );

    return res.json({ success: true });
  }

  // GET profile
  const result = await pool.query(
    'SELECT * FROM user_profiles WHERE user_id = $1',
    [session.user.id]
  );

  return res.json(result.rows[0]);
}
```

## Protected Routes

### Middleware for Protected Pages

Create `src/middleware.ts`:

```typescript
import { auth } from '@/lib/auth';

export async function middleware(req) {
  const session = await auth.api.getSession({ headers: req.headers });

  // Protect /docs/advanced/* routes
  if (req.nextUrl.pathname.startsWith('/docs/advanced') && !session) {
    return Response.redirect(new URL('/login', req.url));
  }

  return Response.next();
}

export const config = {
  matcher: ['/docs/advanced/:path*'],
};
```

### Component-Level Protection

```typescript
import { useSession } from '@better-auth/react';
import { useRouter } from '@docusaurus/router';

function ProtectedContent() {
  const { data: session, isLoading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !session) {
      router.push('/login');
    }
  }, [session, isLoading, router]);

  if (isLoading) return <div>Loading...</div>;
  if (!session) return null;

  return <div>Protected content here</div>;
}
```

## Testing Authentication

### Test OAuth Flow

1. Start your development server
2. Navigate to `/login`
3. Click "Sign in with GitHub" or "Sign in with Google"
4. Authorize the application
5. Verify redirect back to your site with active session

### Test Session Persistence

```typescript
// Check session in browser console
fetch('/api/session')
  .then(r => r.json())
  .then(console.log);
```

### Test Profile Creation

```typescript
// Submit profile data
fetch('/api/user/profile', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    pythonLevel: 'intermediate',
    ros2Level: 'beginner',
    // ... other fields
  }),
})
.then(r => r.json())
.then(console.log);
```

## Troubleshooting

### Common Issues

**"Database connection failed"**
- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Check firewall/network settings

**"OAuth callback error"**
- Verify callback URLs match exactly in OAuth provider settings
- Check CLIENT_ID and CLIENT_SECRET are correct
- Ensure `NEXT_PUBLIC_APP_URL` is set correctly

**"Session not persisting"**
- Check cookies are enabled in browser
- Verify `BETTER_AUTH_SECRET` is set and is at least 32 characters
- Check `useSecureCookies` setting matches your environment (http vs https)

**"CORS errors"**
- Add your frontend URL to allowed origins
- Check API routes are properly configured
- Verify headers in fetch requests

## Security Best Practices

1. **Always use HTTPS in production**
2. **Rotate secrets regularly**
3. **Enable email verification** for production
4. **Implement rate limiting** on auth endpoints
5. **Use strong password requirements**
6. **Set appropriate CORS policies**
7. **Monitor failed login attempts**
8. **Keep Better Auth updated**

## Production Deployment

### Environment Variables

Ensure all production environment variables are set:
- Use strong, unique `BETTER_AUTH_SECRET`
- Use production OAuth credentials
- Set `NEXT_PUBLIC_APP_URL` to production URL
- Use `useSecureCookies: true`

### Database

- Use connection pooling
- Enable SSL for database connections
- Set up database backups
- Monitor connection limits

### Monitoring

- Set up error tracking (Sentry, etc.)
- Monitor authentication success/failure rates
- Track session duration and renewal
- Alert on unusual authentication patterns
