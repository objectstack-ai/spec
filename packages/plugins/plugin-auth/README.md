# @objectstack/plugin-auth

Authentication & Identity Plugin for ObjectStack.

> **✨ Status:** ObjectQL-based authentication implementation! Uses ObjectQL for data persistence (no third-party ORM required). Core authentication structure is in place with better-auth v1.4.18.

## Features

### Currently Implemented
- ✅ Plugin structure following ObjectStack conventions
- ✅ HTTP route registration for auth endpoints
- ✅ Service registration in ObjectKernel
- ✅ Configuration schema support
- ✅ **Better-Auth library integration (v1.4.18)**
- ✅ **ObjectQL-based database implementation (no ORM required)**
- ✅ **Direct request forwarding to better-auth handler**
- ✅ **Wildcard routing (`/api/v1/auth/*`)**
- ✅ **Full better-auth API access via `auth.api`**
- ✅ Comprehensive test coverage (11/11 tests passing)

### Production Ready Features
- ✅ **Email/Password Authentication** - Handled by better-auth
- ✅ **OAuth Providers** - Configured via `providers` option
- ✅ **Session Management** - Automatic session handling
- ✅ **Password Reset** - Email-based password reset flow
- ✅ **Email Verification** - Email verification workflow
- ✅ **2FA** - Two-factor authentication (when enabled)
- ✅ **Passkeys** - WebAuthn/Passkey support (when enabled)
- ✅ **Magic Links** - Passwordless authentication (when enabled)
- ✅ **Organizations** - Multi-tenant support (when enabled)

### ObjectQL-Based Database Architecture
- ✅ **Native ObjectQL Data Persistence** - Uses ObjectQL's IDataEngine interface
- ✅ **No Third-Party ORM** - No dependency on drizzle-orm or other ORMs
- ✅ **Better-Auth Native Schema** - Uses better-auth's naming conventions for seamless migration
- ✅ **Object Definitions** - Auth objects defined using ObjectStack's Object Protocol
  - `user` - User accounts (better-auth native table name)
  - `session` - Active sessions (better-auth native table name)
  - `account` - OAuth provider accounts (better-auth native table name)
  - `verification` - Email/phone verification tokens (better-auth native table name)
- ✅ **ObjectQL Adapter** - Custom adapter bridges better-auth to ObjectQL

The plugin uses [better-auth](https://www.better-auth.com/) for robust, production-ready authentication functionality. All requests are forwarded directly to better-auth's universal handler, ensuring full compatibility with all better-auth features. Data persistence is handled by ObjectQL using **better-auth's native naming conventions** (camelCase) to ensure seamless migration for existing better-auth users.

## Installation

```bash
pnpm add @objectstack/plugin-auth
```

## Usage

### Basic Setup with ObjectQL

```typescript
import { ObjectKernel } from '@objectstack/core';
import { AuthPlugin } from '@objectstack/plugin-auth';
import { ObjectQL } from '@objectstack/objectql';

// Initialize ObjectQL as the data engine
const dataEngine = new ObjectQL();

const kernel = new ObjectKernel({
  plugins: [
    new AuthPlugin({
      secret: process.env.AUTH_SECRET,
      baseUrl: 'http://localhost:3000',
      // ObjectQL will be automatically injected by the kernel
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

**Note:** The `databaseUrl` parameter is no longer used. The plugin now uses ObjectQL's IDataEngine interface, which is provided by the kernel's `data` service. This allows the plugin to work with any ObjectQL-compatible driver (memory, SQL, NoSQL, etc.) without requiring a specific ORM.

### With Organization Support

```typescript
new AuthPlugin({
  secret: process.env.AUTH_SECRET,
  baseUrl: 'http://localhost:3000',
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

The plugin forwards all requests under `/api/v1/auth/*` directly to better-auth's universal handler. Better-auth provides the following endpoints:

### Email/Password Authentication
- `POST /api/v1/auth/sign-in/email` - Sign in with email and password
- `POST /api/v1/auth/sign-up/email` - Register new user with email and password
- `POST /api/v1/auth/sign-out` - Sign out current user

### Session Management
- `GET /api/v1/auth/get-session` - Get current user session

### Password Management
- `POST /api/v1/auth/forget-password` - Request password reset email
- `POST /api/v1/auth/reset-password` - Reset password with token

### Email Verification
- `POST /api/v1/auth/send-verification-email` - Send verification email
- `GET /api/v1/auth/verify-email` - Verify email with token

### OAuth (when providers configured)
- `GET /api/v1/auth/authorize/[provider]` - Start OAuth flow
- `GET /api/v1/auth/callback/[provider]` - OAuth callback

### 2FA (when enabled)
- `POST /api/v1/auth/two-factor/enable` - Enable 2FA
- `POST /api/v1/auth/two-factor/verify` - Verify 2FA code

### Passkeys (when enabled)
- `POST /api/v1/auth/passkey/register` - Register a passkey
- `POST /api/v1/auth/passkey/authenticate` - Authenticate with passkey

### Magic Links (when enabled)
- `POST /api/v1/auth/magic-link/send` - Send magic link email
- `GET /api/v1/auth/magic-link/verify` - Verify magic link

For the complete API reference, see [better-auth documentation](https://www.better-auth.com/docs).

## Implementation Status

This package provides authentication services powered by better-auth. Current implementation status:

1. ✅ Plugin lifecycle (init, start, destroy)
2. ✅ HTTP route registration (wildcard routing)
3. ✅ Configuration validation
4. ✅ Service registration
5. ✅ Better-auth library integration (v1.4.18)
6. ✅ Direct request forwarding to better-auth handler
7. ✅ Full better-auth API support
8. ✅ OAuth providers (configurable)
9. ✅ 2FA, passkeys, magic links (configurable)
10. ✅ ObjectQL-based database implementation (no ORM required)

### Architecture

#### Request Flow

The plugin uses a **direct forwarding** approach:

```typescript
// All requests under /api/v1/auth/* are forwarded to better-auth
rawApp.all('/api/v1/auth/*', async (c) => {
  const request = c.req.raw; // Web standard Request
  const response = await authManager.handleRequest(request);
  return response; // Web standard Response
});
```

This architecture provides:
- ✅ **Minimal code** - No custom route implementations
- ✅ **Full compatibility** - All better-auth features work automatically
- ✅ **Easy updates** - Better-auth updates don't require code changes
- ✅ **Type safety** - Full TypeScript support from better-auth
- ✅ **Programmatic API** - Access auth methods via `authManager.api`

#### ObjectQL Database Architecture

The plugin uses **ObjectQL** for data persistence instead of third-party ORMs:

```typescript
// Object definitions use better-auth's native naming conventions
export const AuthUser = ObjectSchema.create({
  name: 'user',  // better-auth native table name
  fields: {
    id: Field.text({ label: 'User ID', required: true }),
    email: Field.email({ label: 'Email', required: true }),
    emailVerified: Field.boolean({ label: 'Email Verified' }),  // camelCase
    name: Field.text({ label: 'Name', required: true }),
    createdAt: Field.datetime({ label: 'Created At' }),  // camelCase
    updatedAt: Field.datetime({ label: 'Updated At' }),  // camelCase
    // ... other fields
  },
  indexes: [
    { fields: ['email'], unique: true }
  ]
});
```

**Benefits:**
- ✅ **No ORM Dependencies** - No drizzle-orm, Prisma, or other ORMs required
- ✅ **Unified Data Layer** - Uses same data engine as rest of ObjectStack
- ✅ **Driver Agnostic** - Works with memory, SQL, NoSQL via ObjectQL drivers
- ✅ **Type-Safe** - Zod-based schemas provide runtime + compile-time safety
- ✅ **"Data as Code"** - Object definitions are versioned, declarative code
- ✅ **Metadata Driven** - Supports migrations, validation, indexing via metadata
- ✅ **Seamless Migration** - Uses better-auth's native naming (camelCase) for easy migration

**Database Objects:**
Uses better-auth's native table and field names for compatibility:
- `user` - User accounts (id, email, name, emailVerified, createdAt, etc.)
- `session` - Active sessions (id, token, userId, expiresAt, ipAddress, etc.)
- `account` - OAuth provider accounts (id, providerId, accountId, userId, tokens, etc.)
- `verification` - Verification tokens (id, value, identifier, expiresAt, etc.)

**Adapter:**
The `createObjectQLAdapter()` function bridges better-auth's database interface to ObjectQL's IDataEngine using better-auth's native naming conventions:

```typescript
// Better-auth → ObjectQL Adapter (no name conversion needed)
const adapter = createObjectQLAdapter(dataEngine);

// Better-auth uses this adapter for all database operations
const auth = betterAuth({
  database: adapter,
  // ... other config
});
```

## Development

```bash
# Build the plugin
pnpm build

# Run tests
pnpm test
```

## License

Apache-2.0 © ObjectStack
