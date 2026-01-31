# Package Dependency Graph

This document visualizes the dependency relationships between all ObjectStack packages.

## Dependency Layers

ObjectStack packages are organized into distinct layers with clear dependency rules:

### Layer 0: Protocol Foundation

```
@objectstack/spec
├── Dependencies: zod
└── Role: Pure protocol definitions (Zod schemas, types, constants)
```

This is the foundation layer. All other packages depend on `@objectstack/spec`.

### Layer 1: Shared Types

```
@objectstack/types
├── Dependencies: @objectstack/spec
└── Role: Shared runtime type definitions
```

### Layer 2: Core Runtime

```
@objectstack/core
├── Dependencies: 
│   ├── @objectstack/spec
│   ├── pino (logger)
│   └── zod
└── Role: Microkernel (Plugin system, DI, Events, Logger)
```

### Layer 3: Engines & Utilities

```
@objectstack/objectql
├── Dependencies:
│   ├── @objectstack/core
│   ├── @objectstack/spec
│   └── @objectstack/types
└── Role: ObjectQL query engine

@objectstack/runtime
├── Dependencies:
│   ├── @objectstack/core
│   ├── @objectstack/spec
│   └── @objectstack/types
└── Role: Runtime utilities and plugin helpers
```

### Layer 4: Client SDKs

```
@objectstack/client
├── Dependencies:
│   ├── @objectstack/core
│   └── @objectstack/spec
└── Role: Client SDK

@objectstack/client-react
├── Dependencies:
│   ├── @objectstack/client
│   ├── @objectstack/core
│   ├── @objectstack/spec
│   └── react (peer)
└── Role: React hooks
```

### Layer 5: Plugins

```
@objectstack/driver-memory
├── Dependencies:
│   ├── @objectstack/core
│   └── @objectstack/spec
└── Role: In-memory driver

@objectstack/plugin-hono-server
├── Dependencies:
│   ├── @objectstack/core
│   ├── @objectstack/spec
│   ├── @objectstack/types
│   └── hono
└── Role: HTTP server

@objectstack/plugin-msw
├── Dependencies:
│   ├── @objectstack/objectql
│   ├── @objectstack/spec
│   ├── @objectstack/types
│   ├── @objectstack/runtime (peer)
│   └── msw
└── Role: Mock Service Worker
```

### Layer 6: Tools

```
@objectstack/cli
├── Dependencies:
│   ├── @objectstack/spec
│   ├── commander
│   ├── chalk
│   └── tsx
└── Role: CLI tools

@objectstack/ai-bridge
├── Dependencies:
│   ├── @objectstack/spec
│   └── zod
└── Role: AI integration
```

## Full Dependency Tree

```
@objectstack/spec (Layer 0)
    ↑
    ├── @objectstack/types (Layer 1)
    │       ↑
    │       └── (Used by many packages)
    │
    ├── @objectstack/core (Layer 2)
    │       ↑
    │       ├── @objectstack/objectql (Layer 3)
    │       │       ↑
    │       │       └── @objectstack/plugin-msw (Layer 5)
    │       │
    │       ├── @objectstack/runtime (Layer 3)
    │       │       ↑
    │       │       └── (Used by server plugins)
    │       │
    │       ├── @objectstack/client (Layer 4)
    │       │       ↑
    │       │       └── @objectstack/client-react (Layer 4)
    │       │
    │       ├── @objectstack/driver-memory (Layer 5)
    │       │
    │       └── @objectstack/plugin-hono-server (Layer 5)
    │
    ├── @objectstack/cli (Layer 6)
    │
    └── @objectstack/ai-bridge (Layer 6)
```

## Dependency Matrix

| Package | Depends On |
|---------|-----------|
| `@objectstack/spec` | `zod` |
| `@objectstack/types` | `@objectstack/spec` |
| `@objectstack/core` | `@objectstack/spec`, `pino`, `zod` |
| `@objectstack/objectql` | `@objectstack/core`, `@objectstack/spec`, `@objectstack/types` |
| `@objectstack/runtime` | `@objectstack/core`, `@objectstack/spec`, `@objectstack/types` |
| `@objectstack/client` | `@objectstack/core`, `@objectstack/spec` |
| `@objectstack/client-react` | `@objectstack/client`, `@objectstack/core`, `@objectstack/spec`, `react` (peer) |
| `@objectstack/driver-memory` | `@objectstack/core`, `@objectstack/spec` |
| `@objectstack/plugin-hono-server` | `@objectstack/core`, `@objectstack/spec`, `@objectstack/types`, `hono` |
| `@objectstack/plugin-msw` | `@objectstack/objectql`, `@objectstack/spec`, `@objectstack/types`, `@objectstack/runtime` (peer), `msw` |
| `@objectstack/cli` | `@objectstack/spec`, `commander`, `chalk`, `tsx` |
| `@objectstack/ai-bridge` | `@objectstack/spec`, `zod` |

## Build Order

Packages must be built in dependency order:

```bash
# Level 0
pnpm --filter @objectstack/spec build

# Level 1
pnpm --filter @objectstack/types build

# Level 2
pnpm --filter @objectstack/core build

# Level 3
pnpm --filter @objectstack/objectql build
pnpm --filter @objectstack/runtime build

# Level 4
pnpm --filter @objectstack/client build
pnpm --filter @objectstack/client-react build

# Level 5 (Plugins)
pnpm --filter @objectstack/driver-memory build
pnpm --filter @objectstack/plugin-hono-server build
pnpm --filter @objectstack/plugin-msw build

# Level 6 (Tools)
pnpm --filter @objectstack/cli build
pnpm --filter @objectstack/ai-bridge build
```

Or build all in correct order:

```bash
pnpm -r --filter './packages/**' build
```

## Dependency Rules

### 1. Zero Circular Dependencies

The dependency graph is a **Directed Acyclic Graph (DAG)**. Circular dependencies are not allowed and prevented by:
- TypeScript compilation
- pnpm workspace resolution
- Build order enforcement

### 2. Layer Isolation

Packages in lower layers cannot depend on higher layers:
- ❌ `@objectstack/spec` cannot depend on `@objectstack/core`
- ❌ `@objectstack/core` cannot depend on `@objectstack/objectql`
- ✅ `@objectstack/objectql` can depend on `@objectstack/core`

### 3. Plugin Independence

Plugins should never directly depend on other plugins:
- ❌ `@objectstack/plugin-hono-server` cannot depend on `@objectstack/driver-memory`
- ✅ Plugins communicate through the service registry at runtime

### 4. Minimal Dependencies

Each package should have the minimum dependencies required:
- `@objectstack/spec`: Only `zod` (for schemas)
- `@objectstack/core`: Only `@objectstack/spec`, `pino`, `zod`
- Tools can have more dependencies as needed

### 5. Peer Dependencies

Use peer dependencies for:
- Framework bindings (`react` for `@objectstack/client-react`)
- Optional runtime dependencies (`@objectstack/runtime` for `@objectstack/plugin-msw`)

## Package Cohesion

### High Cohesion Packages

✅ **Good Examples:**
- `@objectstack/spec`: All protocol definitions in one place
- `@objectstack/core`: All kernel functionality together
- `@objectstack/objectql`: Complete query engine

### Package Responsibilities

| Package | Responsibility | What It Doesn't Do |
|---------|---------------|-------------------|
| `@objectstack/spec` | Define protocols | Runtime behavior |
| `@objectstack/core` | Manage plugin lifecycle | Query execution, HTTP handling |
| `@objectstack/objectql` | Execute queries | HTTP routing, UI rendering |
| `@objectstack/runtime` | Provide plugin utilities | Execute queries directly |

## External Dependencies

### Production Dependencies

| Dependency | Used By | Purpose |
|------------|---------|---------|
| `zod` | spec, core, ai-bridge, cli | Schema validation |
| `pino` | core | Logging |
| `pino-pretty` | core | Log formatting |
| `hono` | plugin-hono-server | HTTP server |
| `msw` | plugin-msw | API mocking |
| `react` | client-react | React integration |
| `commander` | cli | CLI argument parsing |
| `chalk` | cli | Terminal colors |
| `tsx` | cli | TypeScript execution |

### Development Dependencies

Located in root `package.json`:
- TypeScript compiler
- Testing frameworks (Vitest)
- Build tools (tsup)
- Linting tools (ESLint, Prettier)

## Version Synchronization

All `@objectstack/*` packages use synchronized versioning:
- Current version: `0.6.1`
- Version bumps are coordinated across all packages
- Changesets manages version bumping

## Future Considerations

### Potential Optimizations

1. **Split `@objectstack/spec` into sub-packages**
   - `@objectstack/spec-data` (ObjectQL schemas)
   - `@objectstack/spec-ui` (ObjectUI schemas)
   - `@objectstack/spec-system` (ObjectOS schemas)
   - **Tradeoff**: More granular but more complex

2. **Extract logger to separate package**
   - `@objectstack/logger`
   - **Benefit**: Can be used outside ObjectStack
   - **Tradeoff**: Another package to maintain

3. **Plugin registry package**
   - `@objectstack/plugin-registry`
   - **Purpose**: Runtime plugin discovery and loading
   - **Status**: Planned for future release

---

**Last Updated**: January 2026  
**Maintained By**: ObjectStack Core Team
