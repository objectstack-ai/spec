# @objectstack/plugin-better-auth

Better-Auth authentication plugin for ObjectStack.

## Installation

```bash
pnpm add @objectstack/plugin-better-auth
```

## Usage

```typescript
import { BetterAuthPlugin } from '@objectstack/plugin-better-auth';

const authPlugin = new BetterAuthPlugin({
  strategies: ['email_password', 'oauth'],
  baseUrl: 'https://app.example.com',
  secret: process.env.AUTH_SECRET!,
  
  emailPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  
  oauth: {
    providers: [
      {
        provider: 'google',
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
    ],
  },
});

export default authPlugin;
```

## Features

- Multiple authentication strategies (email/password, OAuth, magic links, passkeys, OTP, anonymous)
- 10+ OAuth providers (Google, GitHub, Facebook, Twitter, LinkedIn, Microsoft, Apple, Discord, GitLab)
- Advanced security features (rate limiting, CSRF protection, 2FA, session fingerprinting)
- Database adapter support (Prisma, Drizzle, Kysely)
- Email provider integration (SMTP, SendGrid, Mailgun, AWS SES, Resend)
- Lifecycle hooks for authentication events

## Documentation

See [docs/BETTER_AUTH_PLUGIN.md](../../docs/BETTER_AUTH_PLUGIN.md) for comprehensive documentation.

## License

Apache-2.0
