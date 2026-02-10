# @objectstack/plugin-auth

Authentication & Identity Plugin for ObjectStack.

> **⚠️ Current Status:** This is an initial implementation providing the plugin structure and API route scaffolding. Full better-auth integration and actual authentication logic will be added in a future release.

## Features

### Currently Implemented
- ✅ Plugin structure following ObjectStack conventions
- ✅ HTTP route registration for auth endpoints
- ✅ Service registration in ObjectKernel
- ✅ Configuration schema support
- ✅ Comprehensive test coverage (11/11 tests passing)

### Planned for Future Releases
- 🔄 **Session Management** - Secure session handling with automatic refresh
- 🔄 **User Management** - User registration, login, profile management
- 🔄 **Multiple Auth Providers** - Support for OAuth (Google, GitHub, etc.), email/password, magic links
- 🔄 **Organization Support** - Multi-tenant organization and team management
- 🔄 **Security** - 2FA, passkeys, rate limiting, and security best practices
- 🔄 **Database Integration** - Works with any database supported by better-auth

The plugin is designed to eventually use [better-auth](https://www.better-auth.com/) for robust authentication functionality.

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

The plugin registers the following API route scaffolding (implementation to be completed):

- `POST /api/v1/auth/login` - User login (stub)
- `POST /api/v1/auth/register` - User registration (stub)
- `POST /api/v1/auth/logout` - User logout (stub)
- `GET /api/v1/auth/session` - Get current session (stub)

Additional routes for OAuth providers will be added when better-auth integration is complete.

## Implementation Status

This package provides the foundational plugin structure for authentication in ObjectStack. The actual authentication logic using better-auth will be implemented in upcoming releases. Current implementation includes:

1. ✅ Plugin lifecycle (init, start, destroy)
2. ✅ HTTP route registration
3. ✅ Configuration validation
4. ✅ Service registration
5. ⏳ Actual authentication logic (planned)
6. ⏳ Database integration (planned)
7. ⏳ OAuth providers (planned)
8. ⏳ Session management (planned)

## Development

```bash
# Build the plugin
pnpm build

# Run tests
pnpm test
```

## License

Apache-2.0 © ObjectStack
