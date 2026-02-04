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

### Cloud Implementation Documentation

> **📋 实施文档 (Implementation Guides)**  
> 详细的技术实施方案和开发路线图
>
> **🎯 [文档使用指南](./IMPLEMENTATION_DOCS_GUIDE.md)** - 了解如何使用这些文档

- **[🚀 Quick Start Implementation](./QUICK_START_IMPLEMENTATION.md)** - **快速启动指南** - 3天内完成基础环境搭建 (Recommended start here!)
- **[📋 Implementation Plan](./CLOUD_IMPLEMENTATION_PLAN.md)** - **完整实施方案** - GitHub/Vercel集成、CI/CD配置、数据库架构
- **[🗺️ Development Roadmap](./CLOUD_DEVELOPMENT_ROADMAP.md)** - **开发路线图** - 12周Sprint计划、任务分解、团队配置
- **[Cloud Management Design](./CLOUD_MANAGEMENT_DESIGN.md)** - 云端管理工具深度设计报告 (Chinese)
- **[Cloud Management Design (EN)](./CLOUD_MANAGEMENT_DESIGN_EN.md)** - Cloud management architecture (Executive summary)

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

| Package | Description | Key Features | Status |
| :--- | :--- | :--- | :--- |
| **[`@objectstack/spec`](packages/spec)** | Protocol definitions (Zod schemas, Types, JSON Schemas) - The "Constitution" | Runtime validation, Type inference, JSON Schema generation | 🟢 Active |
| **[`@objectstack/core`](packages/core)** | Microkernel runtime (Plugin system, DI, Event Bus, Logger) | Plugin lifecycle, Service registry, High-performance logging | 🟢 Active |
| **[`@objectstack/types`](packages/types)** | Shared runtime type definitions | IKernel, RuntimePlugin, RuntimeContext interfaces | 🟢 Active |

### Engine Packages

| Package | Description | Key Features | Status |
| :--- | :--- | :--- | :--- |
| **[`@objectstack/objectql`](packages/objectql)** | ObjectQL query engine and schema registry | Cross-datasource queries, Driver routing, Schema registry | 🟢 Active |
| **[`@objectstack/runtime`](packages/runtime)** | Runtime utilities and plugin helpers | Standard library, DriverPlugin, AppPlugin | 🟢 Active |
| **[`@objectstack/metadata`](packages/metadata)** | Metadata loading and persistence | Multi-format support, File watching, Validation | 🟢 Active |

### Client Packages

| Package | Description | Key Features | Status |
| :--- | :--- | :--- | :--- |
| **[`@objectstack/client`](packages/client)** | Official Client SDK for ObjectStack Protocol | CRUD operations, Batch API, View storage, Error handling | 🟢 Active |
| **[`@objectstack/client-react`](packages/client-react)** | React hooks for ObjectStack | useQuery, useMutation, usePagination, useInfiniteQuery | 🟢 Active |

### Plugin Packages

| Package | Description | Key Features | Status |
| :--- | :--- | :--- | :--- |
| **[`@objectstack/driver-memory`](packages/plugins/driver-memory)** | In-memory driver (reference implementation) | Zero dependencies, Perfect for testing, Fast in-memory storage | 🟢 Active |
| **[`@objectstack/plugin-hono-server`](packages/plugins/plugin-hono-server)** | HTTP server plugin (Hono-based) | Universal runtime, Auto-discovery, API Registry integration | 🟢 Active |
| **[`@objectstack/plugin-msw`](packages/plugins/plugin-msw)** | Mock Service Worker plugin for testing | Automatic API mocking, Browser & Node support | 🟢 Active |

### Tools

| Package | Description | Key Features | Status |
| :--- | :--- | :--- | :--- |
| **[`@objectstack/cli`](packages/cli)** | Command-line interface and development tools | serve, dev, compile, doctor, create, test:run | 🟢 Active |
| **[`@objectstack/docs`](apps/docs)** | Documentation site (Fumadocs + Next.js) | Interactive docs, API reference, Examples | 🟢 Active |

### Package Quick Links

**For Application Developers:**
- Start here: [`@objectstack/client`](packages/client/README.md) - Official SDK
- React apps: [`@objectstack/client-react`](packages/client-react/README.md) - React hooks
- Development: [`@objectstack/cli`](packages/cli/README.md) - CLI tools

**For Protocol Developers:**
- Protocols: [`@objectstack/spec`](packages/spec/README.md) - Schema definitions
- Runtime: [`@objectstack/core`](packages/core/README.md) - Microkernel
- Data layer: [`@objectstack/objectql`](packages/objectql/README.md) - Query engine

**For Plugin Developers:**
- Runtime: [`@objectstack/runtime`](packages/runtime/README.md) - Plugin patterns
- Types: [`@objectstack/types`](packages/types/README.md) - Shared interfaces
- Examples: 
  - [`@objectstack/driver-memory`](packages/plugins/driver-memory/README.md) - Driver reference
  - [`@objectstack/plugin-hono-server`](packages/plugins/plugin-hono-server/README.md) - Server plugin

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
