# ObjectStack Project Master Plan & Status Report

**Date:** 2026-02-07
**Version:** 1.1.0

## 1. Project Master Scheme (项目总体方案)

ObjectStack is designed as a **metadata-driven, post-SaaS operating system**. It virtualizes the application stack into strict Zod protocols, allowing business logic, UI, and data structures to be defined as code and executed by a universal runtime.

### 1.1 Architectural Layers

1.  **Protocol Layer (`@objectstack/spec`)**
    *   **Role:** The "DNA" of the system.
    *   **Technology:** Pure TypeScript + Zod.
    *   **Status:** **Complete**. Covers UI, Data, Security, Automation, AI, System.

2.  **Kernel Layer (`@objectstack/core`)**
    *   **Role:** The Microkernel. Handles plugin lifecycle, dependency injection, event bus, and logging.
    *   **Status:** **Stable**.

3.  **Engine Layer**
    *   **ObjectQL (`@objectstack/objectql`)**: Universal data access abstraction.
    *   **Runtime (`@objectstack/runtime`)**: The execution brain. Contains the `HttpDispatcher` which unifies request handling.
    *   **Status:** **Stable (Memory-only)**.

4.  **Interface Layer (Adapters & Plugins)**
    *   **Server**: `@objectstack/plugin-hono-server` (Production HTTP), `@objectstack/adapter-nextjs` (Frontend Backend).
    *   **Client**: `@objectstack/plugin-msw` (Browser Mocking), `@objectstack/client` (SDK).
    *   **Status:** **Unified Architecture Implemented**.

5.  **Infrastructure Layer (Drivers)**
    *   **Data**: `driver-memory` (Dev/Test), `driver-sqlite` (Local), `driver-postgres` (Scale).
    *   **Status:** **Partial** (Memory only).

---

## 2. Current Development Progress (当前开发进度)

### ✅ Completed Milestones

*   **Protocol Definition:** All major protocols (UI, Data, API, security) are defined in Zod.
*   **Unified Dispatcher Architecture:**
    *   Refactored `plugin-hono-server` to use `@objectstack/hono` factory.
    *   Refactored `plugin-msw` to use shared `HttpDispatcher`.
    *   **Result:** The mock server now behaves identically to the production server.
*   **CI/CD Stabilization:**
    *   Fixed build and test pipelines for the monorepo.
    *   Resolved integration test environment issues (skipping live-server tests in CI).
*   **Documentation:**
    *   Updated `packages.mdx` with correct plugin architecture descriptions.

### 🚧 Works in Progress

*   **Client SDK**: Basic structure exists, but needs stronger typing inference from Zod schemas.
*   **React Components**: `@objectstack/client-react` exists but is minimal.

---

## 3. Next Development Roadmap (下一步开发计划)

The focus shifts from **Architecture/Kernel** stability to **Namespace Isolation** and **Feature/Persistence** implementation.

### Phase 0: Namespace & Ownership Model (Current Week) ← ACTIVE
**Objective:** Enable multi-vendor object isolation and extension.
1.  **Spec Schemas** ✅: `namespace` in manifest, `ObjectOwnershipEnum`, `ObjectExtensionSchema`.
2.  **Registry Rewrite** 🔄: FQN computation, contributor tracking, priority-based merge.
3.  **Engine Update**: Pass namespace/ownership through registration flow.
4.  **Testing**: Comprehensive ownership scenario tests.

### Phase 1: Persistence Strategy (Week 1-2)
**Objective:** Move beyond in-memory data to persistent storage.
1.  **Create `@objectstack/driver-sqlite`**:
    *   Implement `ObjectStackDriver` interface.
    *   Target: `better-sqlite3` for fast local development.
    *   Compliance: Pass the standard `driver-test-suite` (which runs on memory driver currently).
2.  **Create `@objectstack/driver-postgres`**:
    *   Target: `pg` or `postgres.js`.
    *   Support JSONB for flexible metadata storage.

### Phase 2: Metadata UI Engine (Week 3-4)
**Objective:** Render UI directly from Zod Protocol definitions.
1.  **Enhance `@objectstack/client-react`**:
    *   Implement `useObject(objectName)` hook.
    *   Implement `useView(viewName)` hook.
2.  **Dynamic Form Builder**:
    *   Create a component that takes a `ZodSchema` or Field Protocol and renders a form.
    *   Support `auto-layout` based on field types.

### Phase 3: Automation Runtime (Week 5-6)
**Objective:** Make the system "Active".
1.  **Implement `@objectstack/plugin-automation`**:
    *   **Triggers:** Listen to `data:create`, `data:update` events.
    *   **Flow Engine:** Interpreter for `src/automation/flow.zod.ts`.
    *   **Actions:** Execute server-side logic defined in metadata.

### Phase 4: AI Agent Integration (Week 7+)
**Objective:** Activate the "Post-SaaS" AI capabilities.
1.  **Agent Runtime**:
    *   Implement `AgentExecutor` using `src/ai/agent.zod.ts`.
    *   Connect Agents to `HttpDispatcher` as Tools.

---

## 4. **ACTIVE: Namespace & Object Ownership Model** (当前进行中)

**Date Started:** 2026-02-07
**Status:** 🔄 In Progress
**Branch:** `feature/namespace-ownership`

### 4.1 Problem Statement

Multi-vendor packages from different vendors will inevitably define objects with the same short name (e.g., both `app-todo` and `app-crm` define `task`). The current flat registry causes silent overwrites. Object names are also tied to database table names, requiring a namespace isolation mechanism.

### 4.2 Agreed Solution (Salesforce-style Namespace Model)

#### 4.2.1 Namespace Rules

| Property | Rule |
|----------|------|
| **Format** | `^[a-z][a-z0-9_]{1,19}$` (2-20 chars) |
| **Uniqueness** | Instance-unique (validated at boot) |
| **Reserved** | `base`, `system` — no FQN prefix applied |
| **FQN Formula** | `{namespace}__{short_name}` (double underscore) |
| **Example** | namespace `crm` + object `account` → FQN `crm__account` |

#### 4.2.2 Ownership Model

| Mode | Description |
|------|-------------|
| **`own`** | This package is the original author. Only ONE owner per FQN. Defines base schema (table name, primary key, core fields). |
| **`extend`** | This package adds fields/config to an existing object. Multiple extenders allowed. Fields merged additively. |

#### 4.2.3 Merge Strategy

1. Owner defines the base object.
2. Extenders sorted by `priority` (lower first, higher wins on conflict).
3. Fields: additive merge. Same-name field → higher priority wins.
4. Non-field props (`label`, `description`): last writer by priority wins.

### 4.3 Implementation Checklist

| # | Task | Status | File(s) |
|---|------|--------|---------|
| 1 | Add `namespace` to ManifestSchema | ✅ Done | `spec/src/kernel/manifest.zod.ts` |
| 2 | Add `ObjectOwnershipEnum`, `ObjectExtensionSchema` | ✅ Done | `spec/src/data/object.zod.ts` |
| 3 | Add `objectExtensions` to StackDefinitionSchema | ✅ Done | `spec/src/stack.zod.ts` |
| 4 | **Rewrite SchemaRegistry with ownership model** | 🔄 In Progress | `objectql/src/registry.ts` |
| 5 | Update Engine to pass namespace/ownership | ⬜ Pending | `objectql/src/engine.ts` |
| 6 | Update Broker shim | ⬜ Pending | `console/src/mocks/createKernel.ts` |
| 7 | Add `namespace` to example apps | ⬜ Pending | `app-todo/objectstack.config.ts`, `app-crm/objectstack.config.ts` |
| 8 | Write comprehensive registry tests | ⬜ Pending | `objectql/src/registry.test.ts` |
| 9 | Update engine tests | ⬜ Pending | `objectql/src/engine.test.ts` |
| 10 | Build and verify all packages | ⬜ Pending | — |

### 4.4 Key Data Structures (Registry Rewrite)

```typescript
// Reserved namespaces (no FQN prefix)
const RESERVED_NAMESPACES = new Set(['base', 'system']);

// Contributor record
interface ObjectContributor {
  packageId: string;
  namespace: string;
  ownership: 'own' | 'extend';
  priority: number;  // 100 = owner default, 200+ = extender
  definition: ServiceObject;
}

// Primary storage: FQN → Contributor[]
objectContributors: Map<string, ObjectContributor[]>;

// Merge cache: FQN → merged ServiceObject
mergedObjectCache: Map<string, ServiceObject>;

// Namespace uniqueness: namespace → packageId
namespaceRegistry: Map<string, string>;
```

### 4.5 API Changes

```typescript
// Before
SchemaRegistry.registerObject(schema, packageId?)

// After
SchemaRegistry.registerObject(schema, packageId, namespace, ownership, priority)
SchemaRegistry.resolveObject(fqn)        // Returns merged object
SchemaRegistry.getAllObjects(packageId?) // Returns merged objects
SchemaRegistry.getObjectContributors(fqn) // Returns all contributors
```

---

## 5. Immediate Action Items (Today/Tomorrow)

1.  **Complete Registry Rewrite** — Implement FQN computation, contributor tracking, merge engine.
2.  **Update Engine** — Extract namespace from manifest, handle `objectExtensions` array.
3.  **Test Extensively** — Own/extend/conflict/merge/FQN/uninstall scenarios.

---

## 6. Future Development Roadmap (下一步开发计划)

1.  **Scaffold `packages/plugins/driver-sqlite`**.
2.  **Extract Standard Driver Test Suite**: Ensure `packages/core/src/qa` has a reusable test suite that can be applied to new drivers immediately.

---

## Appendix: Design Decision Records

### DDR-001: Namespace Separator (2026-02-07)
**Decision:** Use double underscore `__` as FQN separator.
**Rationale:** 
- Single underscore `_` is common in field names (`created_at`).
- Dot `.` conflicts with JavaScript property access.
- Matches Salesforce convention for managed packages.

### DDR-002: Reserved Namespaces (2026-02-07)
**Decision:** `base` and `system` namespaces are platform-reserved (no prefix applied).
**Rationale:**
- Platform-defined objects like `user`, `organization` should not be prefixed.
- These objects form the foundation that all apps depend on.

### DDR-003: Ownership vs Extension (2026-02-07)
**Decision:** Separate `own` vs `extend` declaration.
**Rationale:**
- Clear ownership prevents accidental table creation by extenders.
- Extension priority enables deterministic merge order.
- Follows Salesforce pattern of "managed object" vs "managed package extensions".
