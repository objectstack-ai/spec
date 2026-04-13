---
name: objectstack-kernel
description: >
  Develop ObjectStack plugins and work with the kernel internals.
  Use when creating plugins, registering services, using the hook/event system,
  configuring ObjectKernel or LiteKernel, managing the bootstrap lifecycle,
  or debugging plugin loading issues. ALWAYS use this skill when you see:
  "create a plugin", "register a service", "hook", "trigger", "kernel config",
  "plugin lifecycle", "ObjectKernel", "LiteKernel", "DI", "dependency injection",
  "service registry", "health check", "graceful shutdown", or "bootstrap".
license: Apache-2.0
compatibility: Requires @objectstack/core v4+, @objectstack/spec v4+
metadata:
  author: objectstack-ai
  version: "1.0"
  domain: kernel
  tags: plugin, kernel, service, hook, event, DI, lifecycle, bootstrap
---

# Kernel Engineering — ObjectStack Plugin & Runtime System

Expert instructions for developing plugins, managing services, and working
with the ObjectStack microkernel. Covers the Plugin interface, PluginContext
API, service registry, hook/event system, bootstrap sequence, and kernel
configuration.

---

## When to Use This Skill

- You are creating a **new plugin** (driver, server, service, app feature).
- You need to **register or consume services** via the DI container.
- You are using the **hook/event system** for inter-plugin communication.
- You need to choose between **ObjectKernel** and **LiteKernel**.
- You are debugging **plugin loading order** or dependency resolution.
- You need to configure **graceful shutdown**, timeouts, or health checks.
- You are implementing **service factories** with lifecycle management.

---

## ObjectKernel vs LiteKernel

| Feature | ObjectKernel | LiteKernel |
|:--------|:-------------|:-----------|
| **Use case** | Production servers, full applications | Serverless, edge, unit tests |
| **Package** | `@objectstack/core` | `@objectstack/core` |
| **Plugin loading** | Async with validation & metadata | Synchronous `use()` |
| **Service factories** | Singleton / Transient / Scoped | Direct instances only |
| **Health monitoring** | Built-in per-plugin health checks | Not available |
| **Graceful shutdown** | Timeout + rollback on failure | Basic destroy phase |
| **Dependency resolution** | Topological sort + circular detection | Topological sort |
| **Core fallbacks** | Auto-injects in-memory fallbacks | Not available |
| **Config validation** | Zod schema validation per plugin | Not available |

### Decision Guide

```
What environment are you targeting?
│
├── Production server / full application?
│   └── ✅ ObjectKernel
│       • Full DI with factories and scopes
│       • Health monitoring and auto-recovery
│       • Graceful shutdown with timeout
│       • Startup failure rollback
│
├── Serverless / edge (Cloudflare Workers, Deno Deploy)?
│   └── ✅ LiteKernel
│       • Minimal memory footprint
│       • Fast cold start
│       • No background health checks
│
└── Unit tests (vitest)?
    └── ✅ LiteKernel
        • Simple setup, fast teardown
        • No system requirement validation
        • No shutdown signal handlers
```

### ObjectKernel Configuration

```typescript
import { ObjectKernel } from '@objectstack/core';

const kernel = new ObjectKernel({
  // Logger configuration
  logger: {
    level: 'info',           // 'debug' | 'info' | 'warn' | 'error' | 'fatal'
    format: 'json',          // 'json' | 'text' | 'pretty'
  },

  // Plugin startup timeout (ms) — per plugin
  defaultStartupTimeout: 30000,   // default: 30s

  // Graceful shutdown
  gracefulShutdown: true,         // default: true (registers SIGINT/SIGTERM)
  shutdownTimeout: 60000,         // default: 60s

  // Rollback all started plugins if one fails during bootstrap
  rollbackOnFailure: true,        // default: true

  // Skip system requirement validation (useful for tests)
  skipSystemValidation: false,    // default: false
});
```

### LiteKernel Configuration

```typescript
import { LiteKernel } from '@objectstack/core';

const kernel = new LiteKernel({
  logger: { level: 'warn' },
});
```

---

## Plugin Interface

Every plugin must implement the `Plugin` interface from `@objectstack/core`:

```typescript
import type { Plugin, PluginContext } from '@objectstack/core';

export interface Plugin {
  /** Unique name (reverse domain recommended) */
  name: string;

  /** Semantic version */
  version?: string;

  /** Plugin type */
  type?: string;  // 'standard' | 'ui' | 'driver' | 'server' | 'app' | 'theme' | 'agent'

  /** Plugins that must init before this one */
  dependencies?: string[];

  /** Phase 1: Register services — called during kernel init */
  init(ctx: PluginContext): Promise<void> | void;

  /** Phase 2: Execute business logic — called after ALL plugins init */
  start?(ctx: PluginContext): Promise<void> | void;

  /** Phase 3: Cleanup — called during kernel shutdown */
  destroy?(): Promise<void> | void;
}
```

### Lifecycle Phases

```
kernel.bootstrap()
│
├── Phase 1: INIT (register services)
│   ├── PluginA.init(ctx)    → ctx.registerService('db', dbInstance)
│   ├── PluginB.init(ctx)    → ctx.registerService('cache', cacheInstance)
│   └── PluginC.init(ctx)    → ctx.registerService('http', httpServer)
│   │
│   └── [Core fallback injection — auto-fills missing 'core' services]
│
├── Phase 2: START (business logic)
│   ├── PluginA.start(ctx)   → connect to database
│   ├── PluginB.start(ctx)   → warm cache
│   └── PluginC.start(ctx)   → bind routes, listen on port
│
└── Phase 3: READY
    └── ctx.trigger('kernel:ready')
        └── All hook handlers execute

kernel.shutdown()
│
├── ctx.trigger('kernel:shutdown')
├── PluginC.destroy()   → close server
├── PluginB.destroy()   → flush cache
└── PluginA.destroy()   → disconnect DB
```

Key rules:
- `init()` is **required** — this is where you register services.
- `start()` is **optional** — only needed if your plugin has active behavior.
- `destroy()` is **optional** — only needed if you hold resources to release.
- Plugins init in **dependency order** (topological sort on `dependencies`).
- Plugins destroy in **reverse** order.
- Each phase completes for ALL plugins before the next phase begins.

---

## PluginContext API

The `ctx` parameter passed to `init()` and `start()` provides:

### Service Registry

```typescript
// Register a service (typically in init phase)
ctx.registerService('my-service', myServiceInstance);

// Get a service registered by another plugin
const db = ctx.getService<IDataEngine>('objectql');
const cache = ctx.getService<ICacheService>('cache');

// Replace an existing service (e.g., wrap with instrumentation)
ctx.replaceService('cache', new InstrumentedCache(existingCache));

// Get all registered services
const allServices: Map<string, any> = ctx.getServices();
```

**Important:** `getService()` throws if the service doesn't exist. Check
availability before calling in optional integrations:

```typescript
try {
  const realtime = ctx.getService<IRealtimeService>('realtime');
  realtime.publish('my-event', data);
} catch {
  ctx.logger.debug('Realtime service not available — skipping');
}
```

### Hook / Event System

```typescript
// Register a hook handler (in init or start)
ctx.hook('kernel:ready', async () => {
  ctx.logger.info('System is ready!');
});

// Register data lifecycle hooks
ctx.hook('data:beforeInsert', async (objectName, record) => {
  if (objectName === 'task') {
    record.created_at = new Date().toISOString();
  }
});

// Trigger a custom hook
await ctx.trigger('my-plugin:initialized', { version: '1.0.0' });
```

### Built-in Hooks

| Hook | Triggered When | Arguments |
|:-----|:---------------|:----------|
| `kernel:ready` | All plugins started, system validated | (none) |
| `kernel:shutdown` | Shutdown begins | (none) |
| `data:beforeInsert` | Before a record is created | `(objectName, record)` |
| `data:afterInsert` | After a record is created | `(objectName, record, result)` |
| `data:beforeUpdate` | Before a record is updated | `(objectName, id, record)` |
| `data:afterUpdate` | After a record is updated | `(objectName, id, record, result)` |
| `data:beforeDelete` | Before a record is deleted | `(objectName, id)` |
| `data:afterDelete` | After a record is deleted | `(objectName, id, result)` |
| `metadata:changed` | Metadata is registered or updated | `(type, name, metadata)` |

Custom hooks follow the convention: `{plugin-namespace}:{event-name}`.

### Logger

```typescript
ctx.logger.debug('Detailed trace info', { key: 'value' });
ctx.logger.info('Plugin initialized');
ctx.logger.warn('Cache miss rate high', { rate: 0.45 });
ctx.logger.error('Connection failed', error);
```

### Kernel Access

```typescript
// Advanced: get the kernel instance directly
const kernel = ctx.getKernel();
const isRunning = kernel.isRunning();
const state = kernel.getState(); // 'idle' | 'initializing' | 'running' | 'stopping' | 'stopped'
```

---

## Service Lifecycle (ObjectKernel Only)

ObjectKernel supports factory-based DI with three lifecycle scopes:

| Lifecycle | Behavior | Use Case |
|:----------|:---------|:---------|
| `SINGLETON` | One instance shared app-wide | Database connections, caches |
| `TRANSIENT` | New instance per `getService()` call | Stateless utilities, formatters |
| `SCOPED` | One instance per scope (e.g., per request) | Request-scoped contexts, transactions |

### Factory Registration

```typescript
import { ServiceLifecycle } from '@objectstack/core';

// In your plugin's init():
async init(ctx: PluginContext) {
  const kernel = ctx.getKernel();

  // Singleton factory — created once, cached forever
  kernel.registerServiceFactory(
    'db-pool',
    (ctx) => createPool({ connectionString: process.env.DATABASE_URL }),
    ServiceLifecycle.SINGLETON,
  );

  // Transient factory — new instance each time
  kernel.registerServiceFactory(
    'request-logger',
    (ctx) => new RequestLogger(ctx.logger),
    ServiceLifecycle.TRANSIENT,
  );

  // Scoped factory — one instance per scope
  kernel.registerServiceFactory(
    'unit-of-work',
    (ctx) => new UnitOfWork(ctx.getService('db-pool')),
    ServiceLifecycle.SCOPED,
    ['db-pool'],  // Dependencies — resolved before factory executes
  );
}
```

### Direct Registration vs Factory

```typescript
// Direct: pass an already-created instance
ctx.registerService('config', { apiKey: '...' });

// Factory: let the kernel manage creation and lifecycle
kernel.registerServiceFactory('db', (ctx) => new Database(), ServiceLifecycle.SINGLETON);
```

Use **direct registration** for simple config objects or pre-existing instances.
Use **factories** when you need lazy initialization, lifecycle management, or
dependency injection between services.

---

## Plugin Dependencies

Declare dependencies to control initialization order:

```typescript
const MyPlugin: Plugin = {
  name: 'com.example.analytics',
  version: '1.0.0',
  dependencies: ['com.objectstack.engine.objectql'],  // Must init first

  async init(ctx) {
    // Safe to call — ObjectQL is guaranteed to be initialized
    const engine = ctx.getService<IDataEngine>('objectql');
    ctx.registerService('analytics', new AnalyticsService(engine));
  },
};
```

The kernel performs **topological sort** on the dependency graph. If circular
dependencies are detected, ObjectKernel logs a warning (LiteKernel throws).

### Well-Known Plugin Names

| Name | Package | Service Key |
|:-----|:--------|:------------|
| `com.objectstack.engine.objectql` | `@objectstack/objectql` | `'objectql'` |
| `com.objectstack.driver.*` | `@objectstack/driver-*` | `'driver.{name}'` |
| `com.objectstack.auth` | `@objectstack/plugin-auth` | `'auth'` |
| `com.objectstack.rest` | `@objectstack/rest` | `'rest'` |
| `com.objectstack.metadata` | `@objectstack/metadata` | `'metadata'` |
| `com.objectstack.realtime` | `@objectstack/service-realtime` | `'realtime'` |
| `com.objectstack.cache` | `@objectstack/service-cache` | `'cache'` |

---

## Core Fallback Injection

ObjectKernel auto-injects in-memory fallbacks for `core`-criticality services
not registered by any plugin during Phase 1. This ensures services like
`metadata`, `cache`, `queue` are always resolvable in Phase 2.

```
Phase 1: init() completes for all plugins
    ↓
Kernel checks ServiceRequirementDef:
  'metadata'  → core    → auto-inject InMemoryMetadataService if missing
  'cache'     → core    → auto-inject InMemoryCache if missing
  'queue'     → core    → auto-inject InMemoryQueue if missing
  'objectql'  → required → ERROR if missing (no fallback)
  'realtime'  → optional → skip, plugins should check availability
    ↓
Phase 2: start() begins — all core services available
```

Service criticality levels:

| Level | Behavior |
|:------|:---------|
| `required` | Kernel throws if missing — system cannot start |
| `core` | Auto-injected in-memory fallback if no plugin provides it |
| `optional` | Silently skipped — plugins must check before use |

---

## Health Monitoring (ObjectKernel Only)

Plugins can implement health checks:

```typescript
const MyPlugin: Plugin & { healthCheck(): Promise<PluginHealthStatus> } = {
  name: 'com.example.db',
  version: '1.0.0',

  async init(ctx) { /* ... */ },

  async healthCheck() {
    try {
      await this.pool.query('SELECT 1');
      return { healthy: true, message: 'Database connected' };
    } catch (err) {
      return { healthy: false, message: 'Database unreachable', details: { error: err.message } };
    }
  },
};

// Check health from kernel
const health = await kernel.checkPluginHealth('com.example.db');
const allHealth = await kernel.checkAllPluginsHealth();

// Get startup performance metrics
const metrics = kernel.getPluginMetrics();
// Map<string, number> — plugin name → startup duration in ms
```

---

## Feature Flags

Declare feature flags in your stack definition:

```typescript
import { defineStack } from '@objectstack/spec';

export default defineStack({
  // ... other config
  featureFlags: [
    {
      name: 'experimental_ai_copilot',
      label: 'AI Copilot',
      enabled: true,
      strategy: 'percentage',
      conditions: { percentage: 25 },   // 25% of users
      environment: ['production'],
    },
    {
      name: 'beta_kanban_view',
      label: 'Kanban View',
      enabled: true,
      strategy: 'group',
      conditions: { groups: ['beta_testers'] },
    },
  ],
});
```

Strategies: `boolean` | `percentage` | `user_list` | `group` | `custom`

---

## Complete Plugin Example

A working plugin that adds audit logging to all data operations:

```typescript
// packages/plugins/plugin-audit/src/plugin.ts
import type { Plugin, PluginContext } from '@objectstack/core';

interface AuditEntry {
  timestamp: string;
  operation: string;
  object: string;
  recordId?: string;
  userId?: string;
}

class AuditService {
  private log: AuditEntry[] = [];

  record(entry: AuditEntry) {
    this.log.push(entry);
  }

  getLog(): AuditEntry[] {
    return [...this.log];
  }
}

const AuditPlugin: Plugin = {
  name: 'com.example.audit',
  version: '1.0.0',
  type: 'plugin',
  dependencies: ['com.objectstack.engine.objectql'],

  async init(ctx: PluginContext) {
    // Phase 1: Register our service
    const auditService = new AuditService();
    ctx.registerService('audit', auditService);

    // Register hooks for data events
    ctx.hook('data:afterInsert', async (objectName, _record, result) => {
      auditService.record({
        timestamp: new Date().toISOString(),
        operation: 'insert',
        object: objectName,
        recordId: result?.id,
      });
    });

    ctx.hook('data:afterUpdate', async (objectName, id) => {
      auditService.record({
        timestamp: new Date().toISOString(),
        operation: 'update',
        object: objectName,
        recordId: String(id),
      });
    });

    ctx.hook('data:afterDelete', async (objectName, id) => {
      auditService.record({
        timestamp: new Date().toISOString(),
        operation: 'delete',
        object: objectName,
        recordId: String(id),
      });
    });

    ctx.logger.info('Audit plugin initialized');
  },

  async start(ctx: PluginContext) {
    // Phase 2: Log that audit is active
    ctx.logger.info('Audit logging active');
  },

  async destroy() {
    // Phase 3: Flush remaining entries (if using external storage)
  },
};

export default AuditPlugin;
```

### Using the Plugin

```typescript
import { ObjectKernel } from '@objectstack/core';
import { ObjectQLPlugin } from '@objectstack/objectql';
import { DriverPlugin } from '@objectstack/runtime';
import { InMemoryDriver } from '@objectstack/driver-memory';
import AuditPlugin from './plugin';

const kernel = new ObjectKernel();
await kernel.use(new ObjectQLPlugin());
await kernel.use(new DriverPlugin(new InMemoryDriver()));
await kernel.use(AuditPlugin);
await kernel.bootstrap();

// Audit service is now available
const audit = kernel.getService<AuditService>('audit');
```

### Testing with LiteKernel

```typescript
import { describe, it, expect } from 'vitest';
import { LiteKernel } from '@objectstack/core';
import AuditPlugin from './plugin';

describe('AuditPlugin', () => {
  it('records insert events', async () => {
    const kernel = new LiteKernel({ logger: { level: 'silent' } });
    kernel.use(AuditPlugin);
    await kernel.bootstrap();

    // Simulate a data event
    await kernel.context.trigger('data:afterInsert', 'task', {}, { id: '123' });

    const audit = kernel.getService('audit');
    const log = audit.getLog();
    expect(log).toHaveLength(1);
    expect(log[0].operation).toBe('insert');
    expect(log[0].object).toBe('task');

    await kernel.shutdown();
  });
});
```

---

## Zod Schema References

When you need precise type definitions for kernel protocols, read these
bundled reference files:

| File | What It Contains |
|:-----|:-----------------|
| [`references/kernel/plugin.zod.ts`](./references/kernel/plugin.zod.ts) | PluginContext schema, lifecycle hooks, core plugin types |
| [`references/kernel/context.zod.ts`](./references/kernel/context.zod.ts) | RuntimeMode, KernelContext, TenantRuntimeContext |
| [`references/kernel/service-registry.zod.ts`](./references/kernel/service-registry.zod.ts) | Service scope types, registry config |
| [`references/kernel/plugin-lifecycle-events.zod.ts`](./references/kernel/plugin-lifecycle-events.zod.ts) | All plugin lifecycle event types |
| [`references/kernel/plugin-capability.zod.ts`](./references/kernel/plugin-capability.zod.ts) | Capability protocol, extension points |
| [`references/kernel/plugin-loading.zod.ts`](./references/kernel/plugin-loading.zod.ts) | Plugin loading config, compatibility |
| [`references/kernel/feature.zod.ts`](./references/kernel/feature.zod.ts) | Feature flag strategies and conditions |
| [`references/kernel/metadata-plugin.zod.ts`](./references/kernel/metadata-plugin.zod.ts) | MetadataType enum, type registry, events |

Read `references/_index.md` for the complete list with descriptions.
