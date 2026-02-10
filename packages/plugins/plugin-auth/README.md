# @objectstack/plugin-auth

Authentication & Identity Plugin for ObjectStack, powered by [better-auth](https://www.better-auth.com/).

## Features

- 🔐 **Session Management** - Secure session handling with automatic refresh
- 👤 **User Management** - User registration, login, profile management
- 🔑 **Multiple Auth Providers** - Support for OAuth (Google, GitHub, etc.), email/password, magic links
- 🏢 **Organization Support** - Multi-tenant organization and team management
- 🛡️ **Security** - 2FA, passkeys, rate limiting, and security best practices
- 🔄 **Database Agnostic** - Works with any database supported by better-auth

## Installation

```bash
pnpm add @objectstack/plugin-auth
```

## Usage

### Basic Setup

```typescript
import { ObjectKernel } from '@objectstack/core';
import { AuthPlugin } from '@objectstack/plugin-auth';

const kernel = new ObjectKernel({
  plugins: [
    new AuthPlugin({
      secret: process.env.AUTH_SECRET,
      baseUrl: 'http://localhost:3000',
      databaseUrl: process.env.DATABASE_URL,
      providers: [
        {
          id: 'google',
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }
      ]
    })
  ]
});
```

### With Organization Support

```typescript
new AuthPlugin({
  secret: process.env.AUTH_SECRET,
  baseUrl: 'http://localhost:3000',
  databaseUrl: process.env.DATABASE_URL,
  plugins: {
    organization: true,  // Enable organization/teams
    twoFactor: true,     // Enable 2FA
    passkeys: true,      // Enable passkey support
  }
})
```

## Configuration

The plugin accepts configuration via `AuthConfig` schema from `@objectstack/spec/system`:

- `secret` - Encryption secret for session tokens
- `baseUrl` - Base URL for auth routes
- `databaseUrl` - Database connection string
- `providers` - Array of OAuth provider configurations
- `plugins` - Enable additional auth features (organization, 2FA, passkeys, magic link)
- `session` - Session configuration (expiry, update frequency)

## API Routes

The plugin automatically registers the following API routes:

- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/session` - Get current session
- `POST /api/v1/auth/refresh` - Refresh session token
- `GET /api/v1/auth/user` - Get current user profile

Additional routes for OAuth providers:
- `GET /api/v1/auth/:provider/login` - OAuth login redirect
- `GET /api/v1/auth/:provider/callback` - OAuth callback handler

## Development

```bash
# Build the plugin
pnpm build

# Run tests
pnpm test
```

## License

Apache-2.0 © ObjectStack
