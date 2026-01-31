# ObjectStack Architecture

> **Architecture Document** - Updated January 2026
> 
> This document provides a comprehensive overview of ObjectStack's microkernel architecture, package distribution, and design principles.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Microkernel Design](#microkernel-design)
3. [Package Structure](#package-structure)
4. [Layer Architecture](#layer-architecture)
5. [Plugin System](#plugin-system)
6. [Dependency Graph](#dependency-graph)
7. [Design Decisions](#design-decisions)

---

## Architecture Overview

ObjectStack is built on a **microkernel architecture** inspired by operating system design principles. The system separates core functionality (the kernel) from business logic (plugins), enabling:

- **Modularity**: Each component is independently developed, tested, and deployed
- **Extensibility**: New features added through plugins without modifying core
- **Testability**: Components can be mocked and tested in isolation
- **Technology Independence**: Swap implementations without breaking contracts

### Core Principles

1. **Protocol-First Design**: All interactions defined through Zod schemas
2. **Separation of Concerns**: Three distinct layers (QL, OS, UI)
3. **Dependency Injection**: Services registered and consumed through DI container
4. **Event-Driven Communication**: Plugins communicate via hooks/events
5. **Reverse Domain Naming**: Global uniqueness through domain notation

---

## Microkernel Design

### The ObjectKernel

**Location**: `packages/core/src/kernel.ts`

The ObjectKernel is the heart of the system, providing:

```
┌─────────────────────────────────────────────────────┐
│              ObjectKernel (Core)                     │
│  ┌───────────────────────────────────────────────┐  │
│  │  Plugin Lifecycle Manager                     │  │
│  │  • Dependency Resolution (Topological Sort)   │  │
│  │  • Init → Start → Destroy Phases              │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────┐  │
│  │  Service Registry (DI Container)              │  │
│  │  • registerService(name, service)             │  │
│  │  • getService<T>(name): T                     │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────┐  │
│  │  Event Bus (Hook System)                      │  │
│  │  • hook(name, handler)                        │  │
│  │  • trigger(name, ...args)                     │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────┐  │
│  │  Logger (Pino-based)                          │  │
│  │  • Server: JSON logs to stdout                │  │
│  │  • Browser: Console with pretty formatting   │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
              │
    ┌─────────┴─────────┬──────────┬──────────┐
    │                   │          │          │
┌───▼────┐      ┌───────▼──┐   ┌──▼───┐  ┌───▼────┐
│ObjectQL│      │  Driver  │   │ Hono │  │  App   │
│ Plugin │      │  Plugin  │   │Server│  │ Plugin │
└────────┘      └──────────┘   └──────┘  └────────┘
```

### Plugin Lifecycle

```
State Machine:
┌────────┐
│  idle  │  ← Initial state
└───┬────┘
    │ kernel.use(plugin)
    ▼
┌────────┐
│  init  │  ← Register services, subscribe to hooks
└───┬────┘
    │ kernel.bootstrap()
    ▼
┌────────┐
│ start  │  ← Connect to databases, start servers
└───┬────┘
    │
    ▼
┌─────────┐
│ running │
└───┬─────┘
    │ kernel.shutdown()
    ▼
┌─────────┐
│ destroy │  ← Clean up resources
└─────────┘
```

---

## Package Structure

ObjectStack is organized as a **monorepo** with distinct package layers:

### Core Packages

#### `@objectstack/spec`
**Location**: `packages/spec/`  
**Role**: Protocol Definitions (The "Constitution")

- Zod schemas for all protocols (ObjectQL, ObjectOS, ObjectUI)
- TypeScript type definitions
- JSON Schema generation
- Constants and enums
- **Zero runtime dependencies** (except Zod)

```typescript
// packages/spec/src/
├── data/           # ObjectQL schemas (Object, Field, Query, etc.)
├── ui/             # ObjectUI schemas (App, View, Dashboard, etc.)
├── system/         # ObjectOS schemas (Manifest, Driver, Plugin, etc.)
├── automation/     # Workflow, Flow, Trigger schemas
├── ai/             # Agent, RAG, Model schemas
├── api/            # API contract schemas
├── auth/           # Authentication & Authorization schemas
└── shared/         # Common utilities
```

#### `@objectstack/core`
**Location**: `packages/core/`  
**Role**: Microkernel Runtime

- `ObjectKernel` - Plugin lifecycle manager
- `PluginContext` - Runtime context for plugins
- `Logger` - Universal logging (Pino-based)
- Service Registry (DI Container)
- Event Bus (Hook System)

**Dependencies**: `@objectstack/spec`, `pino`, `zod`

#### `@objectstack/types`
**Location**: `packages/types/`  
**Role**: Shared Runtime Interfaces

- Type definitions used across packages
- Runtime environment types
- Minimal, focused on shared contracts

**Dependencies**: `@objectstack/spec`

### Engine Packages

#### `@objectstack/objectql`
**Location**: `packages/objectql/`  
**Role**: ObjectQL Query Engine

- ObjectQL core engine
- Schema registry
- Query compilation
- Driver management
- Protocol implementation

**Dependencies**: `@objectstack/core`, `@objectstack/spec`, `@objectstack/types`

#### `@objectstack/runtime`
**Location**: `packages/runtime/`  
**Role**: Runtime Utilities & Plugins

- `DriverPlugin` - Generic driver wrapper
- `AppPlugin` - Application loader
- HTTP Server utilities
- REST API server
- Middleware system

**Dependencies**: `@objectstack/core`, `@objectstack/spec`, `@objectstack/types`

### Client Packages

#### `@objectstack/client`
**Location**: `packages/client/`  
**Role**: Client SDK

- Client-side API wrapper
- Request/response handling
- Type-safe API calls

**Dependencies**: `@objectstack/core`, `@objectstack/spec`

#### `@objectstack/client-react`
**Location**: `packages/client-react/`  
**Role**: React Hooks

- React hooks for ObjectStack
- State management integration
- React Query / SWR patterns

**Dependencies**: `@objectstack/client`, `@objectstack/core`, `@objectstack/spec`  
**Peer Dependencies**: `react`

### Plugin Packages

Located in `packages/plugins/*`:

#### `@objectstack/driver-memory`
**Location**: `packages/plugins/driver-memory/`  
**Role**: In-Memory Driver (Reference Implementation)

- Complete ObjectQL driver implementation
- Used for testing and prototyping
- Demonstrates driver contract

**Dependencies**: `@objectstack/core`, `@objectstack/spec`

#### `@objectstack/plugin-hono-server`
**Location**: `packages/plugins/plugin-hono-server/`  
**Role**: HTTP Server Plugin

- Hono-based HTTP server
- REST API endpoints
- Middleware support

**Dependencies**: `@objectstack/core`, `@objectstack/spec`, `@objectstack/types`, `hono`

#### `@objectstack/plugin-msw`
**Location**: `packages/plugins/plugin-msw/`  
**Role**: Mock Service Worker Plugin

- Browser-based API mocking
- E2E testing support
- Development mode

**Dependencies**: `@objectstack/objectql`, `@objectstack/spec`, `@objectstack/types`, `msw`

### Tools Packages

#### `@objectstack/cli`
**Location**: `packages/cli/`  
**Role**: Command Line Interface

- Project scaffolding
- Code generation
- Development tools
- Build & deployment utilities

**Dependencies**: `@objectstack/spec`, `commander`, `chalk`, `tsx`, `zod`

#### `@objectstack/ai-bridge`
**Location**: `packages/ai-bridge/`  
**Role**: AI Integration

- AI agent bridge
- LLM integrations
- RAG pipeline

**Dependencies**: `@objectstack/spec`, `zod`

---

## Layer Architecture

ObjectStack follows a **Three-Layer Protocol Stack**:

```
┌──────────────────────────────────────────────────┐
│          Layer 3: ObjectUI (View)                │
│  ┌────────────────────────────────────────────┐  │
│  │  Apps, Views, Dashboards, Reports          │  │
│  │  "How do users interact?"                  │  │
│  └────────────────────────────────────────────┘  │
│  Packages: @objectstack/client-react            │
└────────────────┬─────────────────────────────────┘
                 │ REST API / GraphQL
┌────────────────▼─────────────────────────────────┐
│         Layer 2: ObjectOS (Control)              │
│  ┌────────────────────────────────────────────┐  │
│  │  Auth, Permissions, Workflows, Events      │  │
│  │  "Who can do what, when?"                  │  │
│  └────────────────────────────────────────────┘  │
│  Packages: @objectstack/runtime,                │
│            @objectstack/plugin-hono-server      │
└────────────────┬─────────────────────────────────┘
                 │ ObjectQL Protocol
┌────────────────▼─────────────────────────────────┐
│         Layer 1: ObjectQL (Data)                 │
│  ┌────────────────────────────────────────────┐  │
│  │  Objects, Fields, Queries, Drivers         │  │
│  │  "What is the data structure?"             │  │
│  └────────────────────────────────────────────┘  │
│  Packages: @objectstack/objectql,               │
│            @objectstack/driver-*                │
└──────────────────────────────────────────────────┘

Foundation:
┌──────────────────────────────────────────────────┐
│       @objectstack/core (Microkernel)            │
│       @objectstack/spec (Protocols)              │
│       @objectstack/types (Shared Types)          │
└──────────────────────────────────────────────────┘
```

### Layer Boundaries

| Layer | Knows About | Doesn't Know About |
|-------|-------------|-------------------|
| **ObjectQL** | Schema, fields, queries, drivers | Users, permissions, UI |
| **ObjectOS** | Auth, workflows, events | Data structure, UI layout |
| **ObjectUI** | Layout, navigation, actions | Business logic, storage |

---

## Plugin System

### Plugin Interface

```typescript
interface Plugin {
  name: string;           // Reverse domain notation
  version?: string;       // Semantic version
  dependencies?: string[]; // Plugin names this depends on
  
  init(ctx: PluginContext): Promise<void> | void;
  start?(ctx: PluginContext): Promise<void> | void;
  destroy?(): Promise<void> | void;
}
```

### Built-in Plugins

#### ObjectQLPlugin
**Name**: `com.objectstack.engine.objectql`  
**Location**: `packages/objectql/src/plugin.ts`

```typescript
Services Registered:
- 'objectql': ObjectQL engine instance
- 'protocol': Protocol implementation shim

Lifecycle:
- init: Register ObjectQL as service
- start: Discover and register drivers and apps
```

#### DriverPlugin
**Name**: `com.objectstack.driver.{name}`  
**Location**: `packages/runtime/src/driver-plugin.ts`

```typescript
Services Registered:
- 'driver.{name}': Driver instance

Lifecycle:
- init: Register driver service
- start: Log driver started
```

#### AppPlugin
**Name**: `com.objectstack.app.{name}`  
**Location**: `packages/runtime/src/app-plugin.ts`

```typescript
Services Registered:
- 'app.{name}': Manifest instance

Lifecycle:
- init: Register app manifest as service
```

### Plugin Capability Declaration

**Location**: `packages/spec/src/system/plugin-capability.zod.ts`

Plugins declare capabilities through structured manifests:

```typescript
interface PluginCapabilityManifest {
  implements?: PluginCapability[];      // Protocols implemented
  provides?: PluginInterface[];         // Services exposed
  requires?: PluginDependency[];        // Required plugins
  extensionPoints?: ExtensionPoint[];   // Extension hooks
  extensions?: Extension[];             // Extensions contributed
}
```

---

## Dependency Graph

### Core Dependencies

```
@objectstack/spec (Zod schemas, zero runtime deps except zod)
    ↑
    ├── @objectstack/types
    │       ↑
    │       └── (Shared by many packages)
    │
    ├── @objectstack/core (Kernel + Logger)
    │       ↑
    │       ├── @objectstack/objectql (Query Engine)
    │       │       ↑
    │       │       └── @objectstack/plugin-msw
    │       │
    │       ├── @objectstack/runtime (Plugins & HTTP)
    │       │       ↑
    │       │       └── (Used by server plugins)
    │       │
    │       ├── @objectstack/client
    │       │       ↑
    │       │       └── @objectstack/client-react
    │       │
    │       └── @objectstack/driver-memory
    │
    ├── @objectstack/cli (Standalone tool)
    │
    └── @objectstack/ai-bridge
```

### Dependency Rules

1. **`@objectstack/spec` has ZERO dependencies** (except Zod)
   - Pure protocol definitions
   - Can be used standalone for type-checking

2. **`@objectstack/core` depends only on `@objectstack/spec`**
   - Minimal kernel
   - No knowledge of ObjectQL or UI

3. **`@objectstack/objectql` depends on `core` and `spec`**
   - Pluggable into kernel
   - Independent of UI layer

4. **Plugins depend on `core` and optionally `objectql`**
   - Never depend on other plugins directly
   - Use service registry for runtime coupling

5. **No circular dependencies**
   - Enforced through topological sort
   - Build-time validation

---

## Design Decisions

### 1. Microkernel vs Monolithic

**Decision**: Use microkernel architecture

**Rationale**:
- Business logic isolated in plugins
- Core remains stable
- Easy to swap implementations
- Better testability

**Tradeoffs**:
- More complex setup
- Plugin discovery overhead
- Learning curve for plugin API

### 2. Zod-First Schema Definition

**Decision**: All schemas defined with Zod

**Rationale**:
- Runtime validation
- TypeScript inference
- JSON Schema generation
- Single source of truth

**Implementation**:
```typescript
// Define once with Zod
export const FieldSchema = z.object({ ... });

// TypeScript types inferred
export type Field = z.infer<typeof FieldSchema>;

// JSON Schema generated at build time
```

### 3. Reverse Domain Naming

**Decision**: Use reverse domain notation for plugins

**Rationale**:
- Global uniqueness
- Industry standard (OSGi, Eclipse, Android)
- Clear ownership
- Hierarchical organization

**Examples**:
- `com.objectstack.engine.objectql`
- `com.objectstack.driver.postgres`
- `com.acme.crm.customer-management`

### 4. Service Registry Pattern

**Decision**: Use DI container for service discovery

**Rationale**:
- Loose coupling
- Runtime flexibility
- Easy mocking for tests
- No hard dependencies

**Alternative Considered**: Direct imports
**Rejected Because**: Creates tight coupling

### 5. Event-Driven Communication

**Decision**: Use hook/event system for inter-plugin communication

**Rationale**:
- Decoupled communication
- Multiple subscribers
- Async handling
- Extensibility

**Standard Events**:
```typescript
// Kernel lifecycle
'kernel:init'
'kernel:ready'
'kernel:shutdown'

// Data lifecycle
'data:record:beforeCreate'
'data:record:afterCreate'
'data:record:beforeUpdate'
'data:record:afterUpdate'
```

### 6. Three-Layer Protocol Stack

**Decision**: Separate QL, OS, UI into distinct layers

**Rationale**:
- Separation of concerns
- Technology independence
- Parallel development
- Incremental migration

**See Also**: [content/docs/introduction/architecture.mdx](content/docs/introduction/architecture.mdx)

### 7. Monorepo Structure

**Decision**: Use pnpm workspaces

**Rationale**:
- Shared dependencies
- Atomic commits
- Easier refactoring
- Consistent versioning

**Build Order**:
1. `@objectstack/spec`
2. `@objectstack/types`, `@objectstack/core`
3. `@objectstack/objectql`, `@objectstack/runtime`
4. Plugins and clients

### 8. Plugin vs Package

**Decision**: Not all packages are plugins

**Rationale**:
- `@objectstack/spec` - Pure data, no runtime
- `@objectstack/cli` - Standalone tool
- `@objectstack/core` - Kernel, not a plugin

**Plugin Packages**: Implement `Plugin` interface and can be registered with kernel

---

## Package Naming Conventions

### Package-Level Identifiers (Distribution)

**Format**: `@objectstack/{category}-{name}`  
**Style**: `kebab-case`  
**Examples**:
- `@objectstack/driver-memory`
- `@objectstack/plugin-hono-server`
- `@objectstack/client-react`

### Plugin Identifiers (Runtime)

**Format**: `{domain}.{category}.{name}`  
**Style**: `kebab-case`  
**Examples**:
- `com.objectstack.engine.objectql`
- `com.objectstack.driver.postgres`
- `com.acme.crm.customer-management`

### Code-Level Identifiers

**Configuration Keys**: `camelCase`
```typescript
{ maxLength: 120, defaultValue: 'hello' }
```

**Data Values**: `snake_case`
```typescript
{ name: 'first_name', object: 'project_task' }
```

---

## Future Considerations

### Planned Enhancements

1. **Plugin Versioning & Compatibility**
   - SemVer range matching
   - Breaking change detection
   - Deprecation warnings

2. **Plugin Registry & Hub**
   - Centralized plugin discovery
   - Quality scoring
   - Security scanning

3. **Hot Reload**
   - Runtime plugin reload
   - State preservation
   - Development mode

4. **Multi-Tenancy**
   - Kernel per tenant
   - Resource isolation
   - Shared plugin instances

5. **Enhanced Logging**
   - Structured logging
   - Distributed tracing
   - Performance metrics

---

## Related Documentation

- [Quick Reference Guide](./QUICK-REFERENCE.md) - Fast lookup for common tasks
- [Package Dependency Graph](./PACKAGE-DEPENDENCIES.md) - Complete dependency visualization
- [MicroKernel Architecture Guide](./content/docs/developers/micro-kernel.mdx)
- [Plugin Ecosystem Architecture](./content/docs/developers/plugin-ecosystem.mdx)
- [Writing Plugins](./content/docs/developers/writing-plugins.mdx)
- [Three-Layer Stack](./content/docs/introduction/architecture.mdx)
- [Design Principles](./content/docs/introduction/design-principles.mdx)

---

**Last Updated**: January 2026  
**Maintainers**: ObjectStack Core Team  
**Status**: Living Document
