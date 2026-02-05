# ObjectStack Project Master Plan & Status Report

**Date:** 2026-02-05
**Version:** 1.0.0

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

The immediate focus shifts from **Architecture/Kernel** stability to **Feature/Persistence** implementation.

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

## 4. Immediate Action Items (Today/Tomorrow)

1.  **Scaffold `packages/plugins/driver-sqlite`**.
2.  **Extract Standard Driver Test Suite**: Ensure `packages/core/src/qa` has a reusable test suite that can be applied to new drivers immediately.
