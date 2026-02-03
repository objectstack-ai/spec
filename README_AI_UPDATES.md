# Package Documentation Updates

I have scanned all packages in the workspace and updated their `README.md` files with a new **"AI Development Context"** section. This section provides high-level guidance for AI agents (and human developers) on the role, usage, and architectural context of each package.

## Core Packages

| Package | Role | AI Context Added |
| :--- | :--- | :--- |
| `@objectstack/spec` | Protocol Definitions | Source of Truth for Zod schemas & types. No business logic. |
| `@objectstack/core` | Microkernel | Bootstrap mechanism, plugin lifecycle, dependency injection. |
| `@objectstack/objectql` | Data Engine | "Backend Brain" for data operations. |
| `@objectstack/runtime` | Server Runtime | REST API generation & HTTP configuration. |
| `@objectstack/client` | Client SDK | Browser/Node SDK for consuming APIs. |
| `@objectstack/client-react` | React Bindings | Hooks for React apps (`useQuery`, etc.). |
| `@objectstack/metadata` | Metadata IO | Loading/saving `.object.ts` files & caching. |
| `@objectstack/cli` | Tooling | Dev server, compilation, project scaffolding. |
| `@objectstack/types` | Shared Types | Common interfaces to prevent circular dependencies. |

## Plugin Packages

| Package | Role | AI Context Added |
| :--- | :--- | :--- |
| `@objectstack/driver-memory` | Reference Driver | In-memory storage for testing. Volatile. |
| `@objectstack/plugin-hono-server` | Hono Adapter | Edge-compatible HTTP server replacement. |
| `@objectstack/plugin-msw` | Test Mocking | Network interception for testing. |

These updates ensure that any AI analyzing this codebase will immediately understand the dependencies and responsibilities of each module.
