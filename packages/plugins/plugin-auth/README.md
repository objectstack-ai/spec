# @objectstack/plugin-auth

Authentication & Identity Plugin for ObjectStack.

> **✨ Status:** Better-Auth library successfully integrated! Core authentication structure is in place with better-auth v1.4.18. Full API integration and advanced features are in active development.

## Features

### Currently Implemented
- ✅ Plugin structure following ObjectStack conventions
- ✅ HTTP route registration for auth endpoints
- ✅ Service registration in ObjectKernel
- ✅ Configuration schema support
- ✅ **Better-Auth library integration (v1.4.18)**
- ✅ **AuthManager class with lazy initialization**
- ✅ **TypeScript types for all auth methods**
- ✅ Comprehensive test coverage (11/11 tests passing)

### In Active Development
- 🔄 **API Integration** - Connecting better-auth API methods to routes
- 🔄 **Database Adapter** - Drizzle ORM integration for data persistence
- 🔄 **Session Management** - Secure session handling with automatic refresh
- 🔄 **User Management** - User registration, login, profile management

### Planned for Future Releases
- 📋 **Multiple Auth Providers** - Support for OAuth (Google, GitHub, etc.), email/password, magic links
- 📋 **Organization Support** - Multi-tenant organization and team management
- 📋 **Security** - 2FA, passkeys, rate limiting, and security best practices
- 📋 **Advanced Features** - Magic links, passkeys, two-factor authentication

The plugin uses [better-auth](https://www.better-auth.com/) for robust, production-ready authentication functionality.

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

The plugin registers the following authentication endpoints:

- `POST /api/v1/auth/login` - User login with email/password
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/session` - Get current session

**Note:** Routes are currently wired up and returning placeholder responses while better-auth API integration is completed. OAuth provider routes will be added in upcoming releases.

## Implementation Status

This package provides authentication services powered by better-auth. Current implementation status:

1. ✅ Plugin lifecycle (init, start, destroy)
2. ✅ HTTP route registration
3. ✅ Configuration validation
4. ✅ Service registration
5. ✅ Better-auth library integration (v1.4.18)
6. ✅ AuthManager class with lazy initialization
7. 🔄 Better-auth API method integration (in progress)
8. ⏳ Database adapter integration (planned)
9. ⏳ OAuth providers (planned)
10. ⏳ Advanced features (2FA, passkeys, magic links)

## Development

```bash
# Build the plugin
pnpm build

# Run tests
pnpm test
```

## License

Apache-2.0 © ObjectStack
