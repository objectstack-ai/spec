# ObjectStack v3.0 Migration Guide

> **Target Release:** Q2 2026  
> **Breaking Changes:** Deprecated items removed, hub module consolidated  
> **Prerequisite:** Ensure your project is on v2.x with all deprecation warnings resolved

---

## Summary of Breaking Changes

| Category | Change | Impact |
|----------|--------|--------|
| Hub Module Removal | `Hub.*` namespace removed from barrel exports | Medium |
| Runtime Logic Extraction | `createErrorResponse()`, `getHttpStatusForCategory()`, `definePlugin()` removed from spec | Medium |
| Deprecated Field Removal | `location` (singular) removed from ActionSchema | Low |
| Deprecated Schema Aliases | `RealtimePresenceStatus`, `RealtimeAction`, `RateLimitSchema` removed | Low |

---

## 1. Hub Module Removal

### What Changed

The `hub/` directory has been removed. Previously it re-exported schemas from `system/` and `kernel/`:

```typescript
// ❌ v2.x (deprecated, removed in v3.0)
import { TenantSchema } from '@objectstack/spec/hub';
import { Hub } from '@objectstack/spec';
const tenant = Hub.TenantSchema.parse({ ... });
```

### How to Migrate

Import directly from the canonical module locations:

```typescript
// ✅ v3.0
import { TenantSchema } from '@objectstack/spec/system';
import { PluginRegistryEntrySchema } from '@objectstack/spec/kernel';
```

**Full Mapping:**

| v2.x Hub Import | v3.0 Direct Import |
|------------------|-------------------|
| `hub/tenant.zod` | `system/tenant.zod` |
| `hub/license.zod` | `system/license.zod` |
| `hub/registry-config.zod` | `system/registry-config.zod` |
| `hub/plugin-registry.zod` | `kernel/plugin-registry.zod` |
| `hub/plugin-security.zod` | `kernel/plugin-security.zod` |

---

## 2. Runtime Logic Extraction

### What Changed

Helper functions that contain runtime logic have been moved from `@objectstack/spec` to `@objectstack/core`. The spec package should contain only schema definitions.

### Functions Removed from Spec

| Function | Previous Location | New Location |
|----------|-------------------|-------------|
| `createErrorResponse()` | `api/errors.zod.ts` | `@objectstack/core/errors` |
| `getHttpStatusForCategory()` | `api/errors.zod.ts` | `@objectstack/core/errors` |
| `definePlugin()` | `kernel/plugin.zod.ts` | `@objectstack/core/plugin` |

### How to Migrate

```typescript
// ❌ v2.x (deprecated, removed in v3.0)
import { createErrorResponse, getHttpStatusForCategory } from '@objectstack/spec/api';
import { definePlugin } from '@objectstack/spec/kernel';

// ✅ v3.0
import { createErrorResponse, getHttpStatusForCategory } from '@objectstack/core/errors';
import { definePlugin } from '@objectstack/core/plugin';
```

> **Note:** The schemas `ErrorResponseSchema`, `PluginDefinitionSchema` etc. remain in `@objectstack/spec`. Only the runtime helper functions are moved.

---

## 3. Deprecated Field Removal

### ActionSchema: `location` → `locations`

```typescript
// ❌ v2.x (removed in v3.0)
const action = {
  name: 'approve',
  type: 'button',
  location: 'list_view',     // singular string
};

// ✅ v3.0
const action = {
  name: 'approve',
  type: 'button',
  locations: ['list_view'],  // array of strings
};
```

---

## 4. Deprecated Schema Aliases Removed

### Realtime Protocol

```typescript
// ❌ v2.x aliases (removed in v3.0)
import { RealtimePresenceStatus, RealtimeAction } from '@objectstack/spec/api';

// ✅ v3.0 canonical names
import { PresenceStatus, RealtimeRecordAction } from '@objectstack/spec/api';
```

### Rate Limiting

```typescript
// ❌ v2.x alias (removed in v3.0)
import { RateLimitSchema } from '@objectstack/spec/api/endpoint';

// ✅ v3.0 canonical location
import { RateLimitConfigSchema } from '@objectstack/spec/shared/http';
```

---

## 5. Events Module Restructuring

### What Changed

`kernel/events.zod.ts` (765 lines) has been split into focused sub-modules for better tree-shaking. The barrel export remains backward-compatible, but you can now import from specific sub-modules.

### Optional Migration (Recommended)

```typescript
// ✅ Both work in v3.0 (barrel re-export is backward compatible)
import { EventBusConfigSchema } from '@objectstack/spec/kernel';

// ✅ Preferred: Direct sub-module import for better tree-shaking
import { EventBusConfigSchema } from '@objectstack/spec/kernel/events/bus';
import { EventSchema, EventPriority } from '@objectstack/spec/kernel/events/core';
import { EventWebhookConfigSchema } from '@objectstack/spec/kernel/events/integrations';
```

**Sub-module Map:**

| Sub-module | Contains |
|-----------|----------|
| `events/core.zod` | `EventPriority`, `EventMetadataSchema`, `EventSchema`, `EventTypeDefinitionSchema` |
| `events/handlers.zod` | `EventHandlerSchema`, `EventRouteSchema`, `EventPersistenceSchema` |
| `events/queue.zod` | `EventQueueConfigSchema`, `EventReplayConfigSchema`, `EventSourcingConfigSchema` |
| `events/dlq.zod` | `DeadLetterQueueEntrySchema`, `EventLogEntrySchema` |
| `events/integrations.zod` | `EventWebhookConfigSchema`, `EventMessageQueueConfigSchema`, `RealTimeNotificationConfigSchema` |
| `events/bus.zod` | `EventBusConfigSchema`, helper functions |

---

## Migration Checklist

- [ ] Replace all `Hub.*` imports with direct `system/` or `kernel/` imports
- [ ] Move `createErrorResponse()` / `getHttpStatusForCategory()` to `@objectstack/core/errors`
- [ ] Move `definePlugin()` to `@objectstack/core/plugin`
- [ ] Replace `location` with `locations` in ActionSchema definitions
- [ ] Replace `RealtimePresenceStatus` with `PresenceStatus`
- [ ] Replace `RealtimeAction` with `RealtimeRecordAction`
- [ ] Replace `RateLimitSchema` with `RateLimitConfigSchema` from `shared/http`
- [ ] (Optional) Update events imports to use sub-modules for tree-shaking

---

## Automated Migration

Use the ObjectStack CLI to detect deprecated usage:

```bash
# Check for deprecated imports
objectstack validate --strict

# Run the migration codemod (when available)
objectstack migrate --from 2.x --to 3.0
```

---

**Last Updated:** 2026-02-11  
**Maintainers:** ObjectStack Core Team
