# Package Naming Analysis: plugin-auth vs service-auth

## Question
Should `@objectstack/plugin-auth` be renamed to `@objectstack/service-auth`?

## Answer: No, keep `@objectstack/plugin-auth` ✅

## Analysis

### Current Architecture

ObjectStack has a clear separation between:

1. **Plugins** (delivery mechanism) - Packages that implement the `Plugin` interface
2. **Services** (runtime capability) - Registered in the kernel's service registry

```typescript
// From auth-plugin.ts
export class AuthPlugin implements Plugin {
  name = 'com.objectstack.auth';
  
  async init(ctx: PluginContext): Promise<void> {
    // Initialize auth manager
    this.authManager = new AuthManager(this.options);
    
    // Register auth service
    ctx.registerService('auth', this.authManager);  // ← Service registration
  }
}
```

### Core Services Registry

From `packages/spec/src/system/core-services.zod.ts`:

```typescript
export const CoreServiceName = z.enum([
  // Core Data & Metadata
  'metadata',       // Object/Field Definitions
  'data',           // CRUD & Query Engine
  'auth',           // Authentication & Identity ← Auth is a core service
  
  // Infrastructure
  'file-storage',   // Storage Driver (Local/S3)
  'search',         // Search Engine (Elastic/Meili)
  'cache',          // Cache Driver (Redis/Memory)
  // ... more services
]);

export const ServiceRequirementDef = {
  // Required: The kernel cannot function without these
  metadata: 'required',
  data: 'required',
  auth: 'required',  // ← Auth is REQUIRED
  // ...
};
```

### Naming Convention Pattern

**All plugin packages use `plugin-` prefix**, regardless of whether they provide optional or required services:

| Package Name | Provides Service | Service Type |
|-------------|-----------------|--------------|
| `@objectstack/plugin-hono-server` | `http-server` | Required |
| `@objectstack/plugin-auth` | `auth` | Required |
| `@objectstack/plugin-msw` | Mock server | Optional (testing) |
| `@objectstack/driver-memory` | Data driver | Optional |

**Note**: Even `plugin-hono-server`, which provides the critical HTTP server capability, uses the `plugin-` prefix.

### Existing Packages (0 use `service-` prefix)

```bash
$ grep -h '"name":' packages/*/package.json packages/*/*/package.json | sort
"name": "@objectstack/cli",
"name": "@objectstack/client",
"name": "@objectstack/client-react",
"name": "@objectstack/core",
"name": "@objectstack/driver-memory",
"name": "@objectstack/hono",
"name": "@objectstack/metadata",
"name": "@objectstack/nestjs",
"name": "@objectstack/nextjs",
"name": "@objectstack/objectql",
"name": "@objectstack/plugin-auth",          ← Uses plugin-
"name": "@objectstack/plugin-hono-server",   ← Uses plugin-
"name": "@objectstack/plugin-msw",           ← Uses plugin-
"name": "@objectstack/rest",
"name": "@objectstack/runtime",
"name": "@objectstack/spec",
"name": "@objectstack/types",
```

**No packages use `service-` prefix.**

### Historical Context

From `ROADMAP.md` and `DEVELOPMENT_PLAN.md`:

- `service-registry.zod.ts` was **renamed** to `core-services.zod.ts`
- This shows a move **away** from "service-" naming, not toward it

## Rationale for Keeping `plugin-auth`

### 1. **Consistency**
All packages in `packages/plugins/` use the `plugin-` prefix. Breaking this pattern would create confusion.

### 2. **Established Pattern**
Core required services (like `http-server`) are also delivered as plugins with the `plugin-` prefix.

### 3. **No Precedent**
There are no packages using the `service-` prefix. Introducing it would:
- Break the established naming convention
- Create two categories where one exists
- Cause confusion about when to use which prefix

### 4. **Clear Semantic Separation**
- **Package name** (`@objectstack/plugin-auth`) = The implementation/delivery mechanism
- **Service name** (`'auth'`) = The runtime capability it provides
- This separation is intentional and architecturally sound

### 5. **Architectural Alignment**
Plugins implement the `Plugin` interface. What they register at runtime (services) is separate from what they are (plugins).

## Recommendation

**Keep the name `@objectstack/plugin-auth`** ✅

The current naming is correct and consistent with ObjectStack's architecture. The fact that auth is a required core service does not change that it's delivered as a plugin.

## Related Files

- `packages/plugins/plugin-auth/package.json` - Package definition
- `packages/plugins/plugin-auth/src/auth-plugin.ts` - Plugin implementation
- `packages/spec/src/system/core-services.zod.ts` - Service registry definitions
- `packages/spec/src/kernel/service-registry.zod.ts` - Service registry protocol
- `ARCHITECTURE.md` - Overall architecture documentation
