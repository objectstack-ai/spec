# Minimal Authentication Example

A minimal example demonstrating authentication in ObjectStack using `@objectstack/plugin-auth`.

## Features

This example shows how to:

- ✅ Set up the `AuthPlugin` with `ObjectKernel`
- ✅ Configure authentication endpoints
- ✅ Use the ObjectStack client for authentication
- ✅ Register new users
- ✅ Login and logout
- ✅ Manage user sessions
- ✅ Request password resets

## Quick Start

### 1. Install Dependencies

```bash
cd examples/minimal-auth
pnpm install
```

### 2. Set Environment Variables (Optional)

Create a `.env` file:

```bash
# Optional: Use a custom auth secret (recommended for production)
AUTH_SECRET=your-super-secret-key-min-32-chars

# Optional: Configure OAuth providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

> **Note**: If `AUTH_SECRET` is not set, a development secret will be used automatically.

### 3. Start the Server

```bash
pnpm dev
```

The server will start on `http://localhost:3000` with the following endpoints:

- `POST /api/v1/auth/sign-up/email` - Register new user
- `POST /api/v1/auth/sign-in/email` - Login
- `POST /api/v1/auth/sign-out` - Logout
- `GET /api/v1/auth/get-session` - Get current session
- `POST /api/v1/auth/forget-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password
- And more...

### 4. Test Authentication (in a new terminal)

```bash
pnpm test
```

This will:
1. Register a new user
2. Logout
3. Login again
4. Get the current session
5. Test password reset flow

### 5. Test Dynamic Discovery (Optional)

```bash
pnpm tsx src/test-discovery.ts
```

This test demonstrates how the auth service automatically appears in the API discovery response when `plugin-auth` is registered. Before the plugin is registered, `discovery.services.auth.status` is "unavailable". After registration, it becomes "available" with the proper route information.

## Usage

### Using the ObjectStack Client

```typescript
import { ObjectStackClient } from '@objectstack/client';

const client = new ObjectStackClient({
  baseUrl: 'http://localhost:3000'
});

// Register
await client.auth.register({
  email: 'user@example.com',
  password: 'SecurePassword123!',
  name: 'John Doe'
});

// Login (auto-sets token)
await client.auth.login({
  type: 'email',
  email: 'user@example.com',
  password: 'SecurePassword123!'
});

// Get current session
const session = await client.auth.me();

// Logout
await client.auth.logout();
```

### Using Direct API Calls

```bash
# Register
curl -X POST http://localhost:3000/api/v1/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePassword123!","name":"John Doe"}'

# Login
curl -X POST http://localhost:3000/api/v1/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePassword123!"}'

# Get session
curl http://localhost:3000/api/v1/auth/get-session \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Code Structure

```
minimal-auth/
├── src/
│   ├── server.ts          # Server setup with AuthPlugin
│   ├── test-auth.ts       # Authentication flow test
│   └── test-discovery.ts  # Discovery API test (dynamic service detection)
├── package.json
└── README.md
```

## Dynamic Service Discovery

ObjectStack features a **dynamic service discovery** system that automatically reflects which plugins are registered. This is particularly useful for clients that need to adapt their UI or behavior based on available services.

**Discovery Response Without Auth Plugin:**
```json
{
  "services": {
    "auth": {
      "enabled": false,
      "status": "unavailable",
      "message": "Install plugin-auth to enable"
    }
  }
}
```

**Discovery Response With Auth Plugin:**
```json
{
  "services": {
    "auth": {
      "enabled": true,
      "status": "available",
      "route": "/api/v1/auth",
      "provider": "plugin-auth"
    }
  },
  "endpoints": {
    "auth": "/api/v1/auth"
  }
}
```

Clients can use this to check service availability:
```typescript
const discovery = await client.getDiscovery();
if (discovery.services.auth?.enabled) {
  // Auth is available - show login UI
  await client.auth.login({ ... });
} else {
  // Auth not available - hide login UI
  console.log(discovery.services.auth?.message);
}
```

## Advanced Configuration

See `src/server.ts` for examples of enabling advanced features:

### OAuth Providers

```typescript
new AuthPlugin({
  secret: process.env.AUTH_SECRET,
  baseUrl: 'http://localhost:3000',
  providers: [
    {
      id: 'google',
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }
  ]
})
```

### Advanced Features

```typescript
new AuthPlugin({
  secret: process.env.AUTH_SECRET,
  baseUrl: 'http://localhost:3000',
  plugins: {
    organization: true,  // Multi-tenant support
    twoFactor: true,     // 2FA
    passkeys: true,      // WebAuthn/Passkeys
    magicLink: true,     // Passwordless auth
  }
})
```

## Next Steps

- See the [Authentication Guide](/docs/guides/authentication) for complete documentation
- Explore the [Todo App example](/examples/app-todo) for a full application with auth
- Check the [CRM App example](/examples/app-crm) for enterprise features

## License

Apache-2.0 © ObjectStack
