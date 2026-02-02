# ObjectStack Protocol

![ObjectStack Protocol](https://img.shields.io/badge/ObjectStack-Protocol-black)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **The "Constitution" of the Post-SaaS Operating System.**

This repository contains the core specifications, schemas, and protocols that power the ObjectStack ecosystem. It defines how data, UI, and system configurations are expressed as code.

## 🎯 What is ObjectStack?

ObjectStack is a metadata-driven platform built on three foundational protocols:

- **ObjectQL** (Data Layer) - Define data structure and queries
- **ObjectOS** (Control Layer) - Runtime, permissions, and workflows  
- **ObjectUI** (View Layer) - Presentation and user interaction

**Learn more:** 
- [Three-Layer Stack](./content/docs/introduction/architecture.mdx) - How ObjectQL, ObjectOS, and ObjectUI work together
- [Architecture Guide](./ARCHITECTURE.md) - Complete microkernel architecture documentation

## 📚 Documentation

📖 **[Read the Full Documentation](./content/docs/)**

### Architecture Documentation

- **[Architecture Guide](./ARCHITECTURE.md)** - Complete microkernel architecture overview
- **[Quick Reference](./QUICK-REFERENCE.md)** - Fast lookup for developers
- **[Package Dependencies](./PACKAGE-DEPENDENCIES.md)** - Dependency graph and build order

### Quick Links

- **Getting Started:**
  - [Introduction](./content/docs/introduction/) - Core concepts and architecture
  - [📚 Examples Catalog](./examples/README.md) - **Comprehensive examples for all protocols**
  - [Quick Start: Todo App](./examples/todo/) - Simplest complete example
  - [Quick Start: Basic Examples](./examples/basic/) - Protocol-by-protocol examples
  
- **Protocol References:**
  - [Protocol Reference](./content/docs/references/) - All 109 protocol specifications
  - [ObjectQL](./content/docs/objectql/) - Data layer documentation
  - [ObjectUI](./content/docs/objectui/) - UI layer documentation
  - [ObjectOS](./content/docs/objectos/) - System layer documentation

- **Examples by Use Case:**
  - [CRM Example](./examples/crm/) - Full-featured enterprise CRM
  - [AI Examples](./examples/) - AI Sales, Support, Analyst, Codegen
  - [Integration Examples](./examples/basic/integration-connectors-example.ts) - External system connectors
  - [System Examples](./examples/basic/system-protocols-example.ts) - Production-grade patterns
  - [API Examples](./examples/basic/api-protocols-example.ts) - GraphQL, OData, WebSocket
  - [Hub Examples](./examples/basic/hub-marketplace-example.ts) - Marketplace & Plugins

- **Development:**
  - [Architecture Guide](./ARCHITECTURE.md) - Complete architecture overview
  - [MicroKernel Architecture](./content/docs/developers/micro-kernel.mdx) - Plugin architecture guide
  - [Plugin Ecosystem](./content/docs/developers/plugin-ecosystem.mdx) - Plugin interoperability
  - [Writing Plugins](./content/docs/developers/writing-plugins.mdx) - Plugin development guide
  - [Contributing Guide](./CONTRIBUTING.md) - How to contribute

## 🚀 Quick Start

### For Application Developers (Using the Client SDK)

If you want to build applications using ObjectStack:

```bash
# Install the client SDK
pnpm add @objectstack/client

# For React applications
pnpm add @objectstack/client-react
```

```typescript
import { ObjectStackClient } from '@objectstack/client';

// Connect to your ObjectStack server
const client = new ObjectStackClient({
  baseUrl: 'http://localhost:3004'
});

await client.connect();

// Query data
const tasks = await client.data.find('todo_task', {
  select: ['subject', 'priority'],
  filters: ['status', '=', 'active'],
  sort: ['-priority'],
  top: 10
});

// Create data
await client.data.create('todo_task', {
  subject: 'New Task',
  priority: 1
});
```

📖 **[View Client SDK Documentation](./content/docs/references/client-sdk/)** - Complete SDK reference with React hooks

### For Protocol Developers (Contributing to ObjectStack)

If you want to contribute to the ObjectStack protocol or build plugins:

```bash
# 1. Install dependencies
pnpm install

# 2. Build the Protocol (Generates Schemas & Docs)
pnpm --filter @objectstack/spec build

# 3. Check environment health
pnpm doctor

# 4. Start Documentation Site
pnpm docs:dev
# Visit http://localhost:3000/docs
```

### For Plugin/Package Development

See **[DEVELOPMENT.md](./DEVELOPMENT.md)** for comprehensive development guide including:
- Development workflow and tooling
- CLI commands reference
- Debugging configurations
- Testing strategies
- Common tasks and troubleshooting

## 📦 Monorepo Structure

### Core Packages

| Package | Description | Status |
| :--- | :--- | :--- |
| **[`@objectstack/spec`](packages/spec)** | Protocol definitions (Zod schemas, Types, JSON Schemas) - The "Constitution" | 🟢 Active |
| **[`@objectstack/core`](packages/core)** | Microkernel runtime (Plugin system, DI, Event Bus, Logger) | 🟢 Active |
| **[`@objectstack/types`](packages/types)** | Shared runtime type definitions | 🟢 Active |

### Engine Packages

| Package | Description | Status |
| :--- | :--- | :--- |
| **[`@objectstack/objectql`](packages/objectql)** | ObjectQL query engine and schema registry | 🟢 Active |
| **[`@objectstack/runtime`](packages/runtime)** | Runtime utilities and plugin helpers | 🟢 Active |

### Client Packages

| Package | Description | Status |
| :--- | :--- | :--- |
| **[`@objectstack/client`](packages/client)** | Official Client SDK for ObjectStack Protocol | 🟢 Active |
| **[`@objectstack/client-react`](packages/client-react)** | React hooks for ObjectStack | 🟢 Active |

### Plugin Packages

| Package | Description | Status |
| :--- | :--- | :--- |
| **[`@objectstack/driver-memory`](packages/plugins/driver-memory)** | In-memory driver (reference implementation) | 🟢 Active |
| **[`@objectstack/plugin-hono-server`](packages/plugins/plugin-hono-server)** | HTTP server plugin (Hono-based) | 🟢 Active |
| **[`@objectstack/plugin-msw`](packages/plugins/plugin-msw)** | Mock Service Worker plugin for testing | 🟢 Active |

### Tools

| Package | Description | Status |
| :--- | :--- | :--- |
| **[`@objectstack/cli`](packages/cli)** | Command-line interface and development tools | 🟢 Active |
| **[`@objectstack/docs`](apps/docs)** | Documentation site (Fumadocs + Next.js) | 🟢 Active |

### Examples

| Package | Description | Status |
| :--- | :--- | :--- |
| [`examples/crm`](examples/crm) | Full-featured CRM example | 🟢 Complete |
| [`examples/todo`](examples/todo) | Simple todo app example | 🟢 Active |

📖 **[View Full Architecture Guide](./ARCHITECTURE.md)** - Comprehensive architecture documentation

## 🤝 Contributing

We welcome contributions! Please read our **[Contributing Guide](./CONTRIBUTING.md)** for:

- Development workflow and setup
- Coding standards (Zod-first, camelCase config, snake_case data)
- Testing requirements
- Documentation guidelines

**Key Standards:**
- All schemas defined using **Zod** with runtime validation
- Configuration keys: `camelCase` (e.g., `maxLength`)
- Machine names: `snake_case` (e.g., `project_task`)
- Comprehensive JSDoc comments
- 80%+ test coverage

## 📄 License

Apache 2.0 © ObjectStack
