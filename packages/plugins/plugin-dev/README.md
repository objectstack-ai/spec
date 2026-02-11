# @objectstack/plugin-dev

> Development Mode Plugin for ObjectStack — auto-enables all services with in-memory implementations.

## Overview

Instead of manually wiring up ObjectQL, drivers, auth, HTTP server, and REST endpoints for local development, use `DevPlugin` to get a fully functional stack in one line.

## Usage

### Zero-config

```typescript
import { defineStack } from '@objectstack/spec';
import { DevPlugin } from '@objectstack/plugin-dev';

export default defineStack({
  manifest: {
    id: 'com.example.myapp',
    name: 'My App',
    version: '0.1.0',
    type: 'app',
  },
  plugins: [new DevPlugin()],
});
```

### With options

```typescript
plugins: [
  new DevPlugin({
    port: 4000,
    seedAdminUser: true,
    services: {
      auth: false,      // Skip auth for quick prototyping
    },
  }),
]
```

## What it auto-configures

| Service | Package | Description |
|---------|---------|-------------|
| ObjectQL | `@objectstack/objectql` | Data engine (query, CRUD, hooks) |
| InMemoryDriver | `@objectstack/driver-memory` | In-memory database (no DB install) |
| Auth | `@objectstack/plugin-auth` | Authentication with dev credentials |
| Hono Server | `@objectstack/plugin-hono-server` | HTTP server on configured port |
| REST API | `@objectstack/rest` | Auto-generated CRUD endpoints |

All services are **optional** — if a peer package isn't installed, it is silently skipped.

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `port` | `number` | `3000` | HTTP server port |
| `seedAdminUser` | `boolean` | `true` | Create `admin@dev.local` on startup |
| `authSecret` | `string` | dev default | JWT secret for auth sessions |
| `authBaseUrl` | `string` | `http://localhost:{port}` | Auth callback URL |
| `verbose` | `boolean` | `true` | Enable verbose logging |
| `services` | `Record<string, boolean>` | all `true` | Enable/disable individual services |
| `extraPlugins` | `Plugin[]` | `[]` | Additional plugins to load |

## License

Apache-2.0
