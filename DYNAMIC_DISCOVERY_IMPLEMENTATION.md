# Dynamic Service Discovery Implementation Summary

## Overview

This implementation adds **dynamic service discovery** to ObjectStack, allowing the API discovery endpoint to automatically reflect which plugins are registered at runtime. This is a critical feature for building adaptive clients that can adjust their UI and functionality based on available backend services.

## Problem Solved

Previously, the discovery endpoint returned hardcoded service statuses:
- Auth service was always marked as "unavailable" even when plugin-auth was registered
- Clients couldn't detect which services were actually available
- The discovery response didn't reflect the actual runtime configuration

## Solution

### 1. Dynamic Service Registry Access

**Location**: `packages/objectql/src/protocol.ts`

The `ObjectStackProtocolImplementation` now accepts an optional `getServicesRegistry` callback:

```typescript
constructor(engine: IDataEngine, getServicesRegistry?: () => Map<string, any>) {
    this.engine = engine;
    this.getServicesRegistry = getServicesRegistry;
}
```

### 2. Runtime Service Detection

The `getDiscovery()` method now:
1. Queries the kernel's service registry
2. Checks which services are actually registered
3. Returns `enabled: true, status: 'available'` for registered services
4. Returns `enabled: false, status: 'unavailable'` for missing services
5. Dynamically builds the capabilities and endpoints maps

### 3. Schema Enhancement

**Location**: `packages/spec/src/api/protocol.zod.ts`

Added `services` field to `GetDiscoveryResponseSchema`:

```typescript
export const GetDiscoveryResponseSchema = z.object({
  version: z.string(),
  apiName: z.string(),
  capabilities: ApiCapabilitiesSchema.optional(),
  endpoints: ApiRoutesSchema.optional(),
  services: z.record(z.string(), ServiceInfoSchema).optional(), // NEW
});
```

## Usage Example

### Server Side

```typescript
import { ObjectKernel } from '@objectstack/core';
import { ObjectQLPlugin } from '@objectstack/objectql';
import { AuthPlugin } from '@objectstack/plugin-auth';

const kernel = new ObjectKernel();
await kernel.use(new ObjectQLPlugin());
await kernel.use(new AuthPlugin({ ... }));
await kernel.bootstrap();

// Protocol automatically detects auth service is registered
```

### Client Side

```typescript
import { ObjectStackClient } from '@objectstack/client';

const client = new ObjectStackClient({ baseUrl: 'http://localhost:3000' });
const discovery = await client.getDiscovery();

if (discovery.services.auth?.enabled) {
  // Show login UI - auth is available
  await client.auth.login({ ... });
} else {
  // Hide login UI - auth not installed
  console.log(discovery.services.auth?.message);
}
```

## Discovery Response Example

### Without Auth Plugin

```json
{
  "version": "1.0",
  "apiName": "ObjectStack API",
  "capabilities": {
    "analytics": true,
    "workflow": false
  },
  "endpoints": {
    "data": "/api/data",
    "metadata": "/api/meta"
  },
  "services": {
    "auth": {
      "enabled": false,
      "status": "unavailable",
      "message": "Install plugin-auth to enable"
    }
  }
}
```

### With Auth Plugin

```json
{
  "version": "1.0",
  "apiName": "ObjectStack API",
  "capabilities": {
    "analytics": true,
    "workflow": false
  },
  "endpoints": {
    "data": "/api/data",
    "metadata": "/api/meta",
    "auth": "/api/v1/auth"
  },
  "services": {
    "auth": {
      "enabled": true,
      "status": "available",
      "route": "/api/v1/auth",
      "provider": "plugin-auth"
    }
  }
}
```

## Files Changed

### Core Implementation
1. `packages/objectql/src/protocol.ts` - Dynamic discovery logic
2. `packages/objectql/src/plugin.ts` - Pass service registry to protocol
3. `packages/spec/src/api/protocol.zod.ts` - Add services field to schema

### Tests
4. `packages/objectql/src/protocol-discovery.test.ts` - Unit tests
5. `examples/minimal-auth/src/test-discovery.ts` - Integration test

### Documentation
6. `packages/objectql/DISCOVERY_EXAMPLE.md` - Technical documentation
7. `examples/minimal-auth/README.md` - User documentation with examples

## Benefits

1. **Client Adaptation**: Clients can detect available features and adapt UI accordingly
2. **Progressive Enhancement**: Enable features when plugins are available, degrade gracefully when not
3. **Type Safety**: Full TypeScript support with Zod schema validation
4. **Zero Configuration**: Works automatically when plugins are registered
5. **Extensible**: New plugins automatically appear in discovery

## Testing

Run the tests to verify the implementation:

```bash
# Unit tests (when vitest is available)
pnpm test

# Integration test
cd examples/minimal-auth
pnpm tsx src/test-discovery.ts
```

## Related Files

- **Discovery Schema**: `packages/spec/src/api/discovery.zod.ts`
- **Service Info Schema**: Part of discovery.zod.ts
- **Auth Plugin**: `packages/plugins/plugin-auth/src/auth-plugin.ts`
- **Client Implementation**: `packages/client/src/index.ts`

## Future Enhancements

- [ ] Add service health checks (beyond just enabled/disabled)
- [ ] Support service versioning in discovery
- [ ] Cache discovery responses for performance
- [ ] Add service dependency graph to discovery
- [ ] Support partial service availability (degraded mode)

## Conclusion

This implementation completes the dynamic service discovery feature, enabling ObjectStack to properly report plugin availability at runtime. The auth plugin now correctly appears in the discovery endpoint when registered, and clients can use this information to adapt their behavior accordingly.
