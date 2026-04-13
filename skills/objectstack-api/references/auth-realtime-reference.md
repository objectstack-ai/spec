# API Design — Auth & Realtime Reference

> Auto-derived from `packages/spec/src/api/auth.zod.ts`, `realtime.zod.ts`, and related schemas.
> This file is bundled with the skill for offline/external use.

## Auth Providers

| Provider | Description |
|:---------|:------------|
| `local` | Email/password (built-in) |
| `google` | Google OAuth 2.0 |
| `github` | GitHub OAuth |
| `microsoft` | Microsoft Entra ID |
| `ldap` | LDAP/Active Directory |
| `saml` | SAML 2.0 SSO |

## Login Types

| Type | Description |
|:-----|:------------|
| `email` | Email + password |
| `username` | Username + password |
| `phone` | Phone + OTP |
| `magic-link` | Passwordless email link |
| `social` | OAuth social login |

## Session User Schema

| Property | Type | Description |
|:---------|:-----|:------------|
| `id` | string | User identifier |
| `email` | string | User email |
| `emailVerified` | boolean | Email verification status |
| `name` | string | Display name |
| `image` | string | Avatar URL |
| `username` | string | Username |
| `roles` | string[] | Assigned roles |
| `tenantId` | string | Current tenant |
| `language` | string | Preferred language |
| `timezone` | string | User timezone |

## Realtime Transport Protocols

| Protocol | Description |
|:---------|:------------|
| `websocket` | Full-duplex WebSocket connection |
| `sse` | Server-Sent Events (one-way) |
| `polling` | Long-polling fallback |

## Realtime Event Types

| Event | Description |
|:------|:------------|
| `record.created` | New record inserted |
| `record.updated` | Record modified |
| `record.deleted` | Record removed |
| `field.changed` | Specific field value changed |

## Subscription Schema

| Property | Type | Description |
|:---------|:-----|:------------|
| `id` | UUID | Subscription identifier |
| `events` | string[] | Event types to subscribe to |
| `transport` | enum | Transport protocol |
| `channel` | string | Channel name |

## Rate Limit Config

| Property | Type | Description |
|:---------|:-----|:------------|
| `maxRequests` | number | Max requests per window |
| `windowMs` | number | Window duration in milliseconds |

## API Endpoint Schema

| Property | Required | Description |
|:---------|:---------|:------------|
| `name` | ✅ | Unique identifier (snake_case) |
| `path` | ✅ | URL path pattern |
| `method` | ✅ | HTTP method (GET/POST/PUT/PATCH/DELETE) |
| `type` | ✅ | `flow`, `script`, `object_operation`, or `proxy` |
| `target` | — | Target flow/script/object |
| `inputMapping` | — | Request → handler input mapping |
| `outputMapping` | — | Handler output → response mapping |
| `authRequired` | — | Require authentication (default: true) |
| `rateLimit` | — | Rate limit config |
| `cacheTtl` | — | Response cache TTL in seconds |
