# ObjectStack Authentication Standard

The standard authentication protocol specification for the ObjectStack ecosystem.

## Overview

This document defines the **ObjectStack Authentication Standard**, a comprehensive, framework-agnostic authentication protocol for ObjectStack applications. This standard supports multiple authentication strategies, session management, and comprehensive security features.

The specification is designed as an **interface** that can be implemented by any authentication library. **better-auth** serves as the **Reference Implementation** (default driver) for this standard.

### Implementation Drivers

The authentication standard can be implemented using various drivers:
- **better-auth** (default/reference implementation)
- Auth.js
- Passport
- Custom implementations

## Features

### Authentication Strategies

- **Email/Password**: Traditional email and password authentication with customizable password policies
- **Magic Link**: Passwordless email-based authentication
- **OAuth**: Social login with popular providers (Google, GitHub, Facebook, Twitter, LinkedIn, Microsoft, Apple, Discord, GitLab)
- **Passkey**: WebAuthn/FIDO2 biometric authentication
- **OTP**: One-time password authentication (SMS, Email)
- **Anonymous**: Guest/anonymous session support

### Security Features

- **Rate Limiting**: Configurable rate limiting to prevent brute-force attacks
- **CSRF Protection**: Built-in CSRF token validation
- **Session Fingerprinting**: Enhanced session security with device fingerprinting
- **Two-Factor Authentication (2FA)**: TOTP-based 2FA with backup codes
- **Account Linking**: Link multiple authentication methods to a single user account
- **IP-based Rate Limiting**: Prevent attacks from specific IP addresses

### Session Management

- Customizable session expiry and renewal
- Secure cookie configuration (HttpOnly, Secure, SameSite)
- Maximum concurrent sessions per user
- Session update intervals

### Developer Features

- **Lifecycle Hooks**: `beforeSignIn`, `afterSignIn`, `beforeSignUp`, `afterSignUp`, `beforeSignOut`, `afterSignOut`
- **Database Adapters**: Support for Prisma, Drizzle, Kysely, and custom adapters
- **Email Providers**: Integration with SendGrid, Mailgun, AWS SES, Resend, SMTP
- **Field Mapping**: Map better-auth user fields to your custom user object
- **Plugin System**: Extend better-auth with custom plugins

## Installation

```bash
pnpm add @objectstack/plugin-better-auth
```

## Usage

### Basic Example

```typescript
import type { AuthConfig } from '@objectstack/spec';

const authConfig: AuthConfig = {
  name: 'main_auth',
  label: 'Main Authentication',
  driver: 'better-auth', // Optional, defaults to 'better-auth'
  strategies: ['email_password'],
  baseUrl: 'https://app.example.com',
  secret: process.env.AUTH_SECRET!,
  
  emailPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
  },
  
  session: {},
  rateLimit: {},
  csrf: {},
  accountLinking: {},
};
```

### OAuth Example

```typescript
const oauthConfig: AuthConfig = {
  name: 'social_auth',
  label: 'Social Login',
  strategies: ['oauth'],
  baseUrl: 'https://app.example.com',
  secret: process.env.AUTH_SECRET!,
  
  oauth: {
    providers: [
      {
        provider: 'google',
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        scopes: ['openid', 'profile', 'email'],
      },
    ],
  },
  
  session: {},
  rateLimit: {},
  csrf: {},
  accountLinking: {},
};
```

### Multi-Strategy Example

```typescript
const multiAuthConfig: AuthConfig = {
  name: 'multi_auth',
  label: 'Multi-Strategy Auth',
  strategies: ['email_password', 'oauth', 'magic_link'],
  baseUrl: 'https://app.example.com',
  secret: process.env.AUTH_SECRET!,
  
  emailPassword: {
    enabled: true,
    minPasswordLength: 10,
  },
  
  oauth: {
    providers: [
      { provider: 'google', clientId: '...', clientSecret: '...' },
      { provider: 'github', clientId: '...', clientSecret: '...' },
    ],
  },
  
  magicLink: {
    enabled: true,
    expiryTime: 900,
  },
  
  session: {
    expiresIn: 604800, // 7 days
  },
  
  rateLimit: {
    enabled: true,
    maxAttempts: 5,
  },
  
  csrf: {
    enabled: true,
  },
  
  accountLinking: {
    enabled: true,
    autoLink: false,
  },
};
```

## Configuration Reference

### Core Configuration

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | `string` | ✅ | Configuration identifier (snake_case) |
| `label` | `string` | ✅ | Human-readable label |
| `strategies` | `AuthStrategy[]` | ✅ | Enabled authentication strategies |
| `baseUrl` | `string` | ✅ | Application base URL |
| `secret` | `string` | ✅ | Secret key for signing (min 32 chars) |

### Strategy Configuration

#### Email/Password

```typescript
emailPassword: {
  enabled: boolean;                    // Enable email/password auth
  requireEmailVerification: boolean;   // Require email verification
  minPasswordLength: number;           // Minimum password length (6-128)
  requirePasswordComplexity: boolean;  // Require uppercase, lowercase, numbers, symbols
  allowPasswordReset: boolean;         // Enable password reset
  passwordResetExpiry: number;         // Reset token expiry in seconds
}
```

#### Magic Link

```typescript
magicLink: {
  enabled: boolean;           // Enable magic link auth
  expiryTime: number;         // Link expiry in seconds (default: 900)
  sendEmail?: Function;       // Custom email sending function
}
```

#### Passkey (WebAuthn)

```typescript
passkey: {
  enabled: boolean;                              // Enable passkey auth
  rpName: string;                                // Relying Party name
  rpId?: string;                                 // Relying Party ID (defaults to domain)
  allowedOrigins?: string[];                     // Allowed origins
  userVerification?: 'required' | 'preferred' | 'discouraged';
  attestation?: 'none' | 'indirect' | 'direct' | 'enterprise';
}
```

#### OAuth

```typescript
oauth: {
  providers: [{
    provider: 'google' | 'github' | 'facebook' | ...; // OAuth provider
    clientId: string;                                  // OAuth client ID
    clientSecret: string;                              // OAuth client secret
    scopes?: string[];                                 // Requested scopes
    redirectUri?: string;                              // Callback URL
    enabled?: boolean;                                 // Enable/disable provider
    displayName?: string;                              // Button label
    icon?: string;                                     // Icon URL
  }]
}
```

### Session Configuration

```typescript
session: {
  expiresIn: number;                         // Session expiry in seconds (default: 604800)
  updateAge: number;                         // Update interval in seconds (default: 86400)
  cookieName: string;                        // Cookie name
  cookieSecure: boolean;                     // Use secure cookies (HTTPS only)
  cookieSameSite: 'strict' | 'lax' | 'none'; // SameSite attribute
  cookieDomain?: string;                     // Cookie domain
  cookiePath: string;                        // Cookie path (default: '/')
  cookieHttpOnly: boolean;                   // HttpOnly attribute
}
```

### Security Configuration

```typescript
rateLimit: {
  enabled: boolean;               // Enable rate limiting
  maxAttempts: number;            // Max login attempts (default: 5)
  windowMs: number;               // Time window in ms (default: 900000)
  blockDuration: number;          // Block duration in ms
  skipSuccessfulRequests: boolean; // Only count failed requests
}

csrf: {
  enabled: boolean;      // Enable CSRF protection
  tokenLength: number;   // CSRF token length (default: 32)
  cookieName: string;    // CSRF cookie name
  headerName: string;    // CSRF header name
}

security: {
  allowedOrigins?: string[];      // CORS allowed origins
  trustProxy: boolean;            // Trust proxy headers
  ipRateLimiting: boolean;        // Enable IP-based rate limiting
  sessionFingerprinting: boolean; // Enable session fingerprinting
  maxSessions: number;            // Max concurrent sessions (default: 5)
}
```

### Two-Factor Authentication

```typescript
twoFactor: {
  enabled: boolean;           // Enable 2FA
  issuer?: string;            // TOTP issuer name
  qrCodeSize: number;         // QR code size in pixels (default: 200)
  backupCodes?: {
    enabled: boolean;         // Enable backup codes
    count: number;            // Number of backup codes (default: 10)
  }
}
```

### Lifecycle Hooks

```typescript
hooks: {
  beforeSignIn?: ({ email }) => Promise<void>;
  afterSignIn?: ({ user, session }) => Promise<void>;
  beforeSignUp?: ({ email, name? }) => Promise<void>;
  afterSignUp?: ({ user }) => Promise<void>;
  beforeSignOut?: ({ sessionId }) => Promise<void>;
  afterSignOut?: ({ sessionId }) => Promise<void>;
}
```

## Supported OAuth Providers

- Google (`google`)
- GitHub (`github`)
- Facebook (`facebook`)
- Twitter (`twitter`)
- LinkedIn (`linkedin`)
- Microsoft (`microsoft`)
- Apple (`apple`)
- Discord (`discord`)
- GitLab (`gitlab`)
- Custom OAuth2 (`custom`)

## Database Adapters

- Prisma (`prisma`)
- Drizzle (`drizzle`)
- Kysely (`kysely`)
- Custom (`custom`)

## Email Providers

- SMTP (`smtp`)
- SendGrid (`sendgrid`)
- Mailgun (`mailgun`)
- AWS SES (`ses`)
- Resend (`resend`)
- Custom (`custom`)

## Examples

See [examples/auth-better-examples.ts](../examples/auth-better-examples.ts) for comprehensive usage examples including:

- Basic email/password authentication
- OAuth with Google and GitHub
- Multi-strategy authentication
- Production-ready configuration
- Plugin manifest integration

## Schema Files

- **Zod Schema**: `packages/spec/src/system/auth.zod.ts`
- **Tests**: `packages/spec/src/system/auth.test.ts`
- **JSON Schema**: `packages/spec/json-schema/AuthConfig.json`
- **Documentation**: `content/docs/references/system/AuthConfig.mdx`

## Type Safety

All schemas are defined using Zod and TypeScript types are inferred automatically:

```typescript
import type {
  AuthConfig,
  StandardAuthProvider,
  AuthStrategy,
  OAuthProvider,
  SessionConfig,
  // ... and more
} from '@objectstack/spec';
```

## Naming Conventions

Following ObjectStack conventions:

- **Configuration Keys** (TypeScript properties): `camelCase` (e.g., `maxAttempts`, `emailPassword`)
- **Machine Names** (Data values): `snake_case` (e.g., `name: 'main_auth'`, `strategy: 'email_password'`)

## Resources

- [Better-Auth Documentation](https://better-auth.com)
- [ObjectStack Documentation](https://objectstack.ai)
- [JSON Schema Reference](../packages/spec/json-schema/AuthConfig.json)

## License

Apache 2.0
