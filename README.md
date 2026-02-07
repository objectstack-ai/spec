# ObjectStack Protocol

![ObjectStack Protocol](https://img.shields.io/badge/ObjectStack-Protocol-black)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **The "Constitution" of the Post-SaaS Operating System.**

This repository contains the core specifications, schemas, and protocols that power the ObjectStack ecosystem. It defines how data, UI, and system configurations are expressed as code.

## 🎯 What is ObjectStack?

ObjectStack is a metadata-driven platform built on three foundational protocols:

- **ObjectQL** (Data Layer) — Define data structure and queries
- **ObjectOS** (Control Layer) — Runtime, permissions, and workflows
- **ObjectUI** (View Layer) — Presentation and user interaction

**Learn more:**
- [Three-Layer Stack](./content/docs/introduction/architecture.mdx) — How ObjectQL, ObjectOS, and ObjectUI work together
- [Architecture Guide](./ARCHITECTURE.md) — Complete microkernel architecture documentation

## 📚 Documentation

📖 **[Read the Full Documentation](https://objectstack.dev/docs)** or run locally with `pnpm docs:dev`

### Quick Links

- **Getting Started:**
  - [Introduction](./content/docs/introduction/) — Core concepts and architecture
  - [CLI Guide](./content/docs/framework/cli.mdx) — `init`, `dev`, `serve`, `studio`, `compile`, `validate`
  - [Quick Reference](./content/docs/references/quick-reference.mdx) — Fast protocol lookup

- **Protocol References:**
  - [Protocol Reference](./content/docs/references/) — All protocol specifications (139 Zod schemas)
  - [ObjectQL](./content/docs/objectql/) — Data layer documentation
  - [ObjectUI](./content/docs/objectui/) — UI layer documentation
  - [ObjectOS](./content/docs/objectos/) — System layer documentation

- **Development:**
  - [Developer Guide](./content/docs/developer/) — Tutorials and best practices
  - [Package Reference](./content/docs/framework/packages.mdx) — All 15 packages
  - [Contributing Guide](./CONTRIBUTING.md) — How to contribute

## 🚀 Quick Start

### For Application Developers

```bash
# Create a new project
npx @objectstack/cli init my-app
cd my-app

# Start development server
os dev

# Start with Console UI (Object Explorer, Schema Inspector)
os studio
# → API:     http://localhost:3000/api/v1/
# → Console: http://localhost:3000/_studio/
```

### For Protocol Developers

```bash
# 1. Clone and install
git clone https://github.com/nicecui/spec.git
cd spec
pnpm install

# 2. Build all packages
pnpm build

# 3. Check environment health
pnpm doctor

# 4. Start Documentation Site
pnpm docs:dev
# → http://localhost:3000/docs

# 5. Launch Console UI + dev server
pnpm studio
```

### Monorepo Scripts

| Script | Description |
| :--- | :--- |
| `pnpm build` | Build all packages (excludes docs) |
| `pnpm dev` | Start app-host example dev server |
| `pnpm studio` | Launch Console UI with dev server |
| `pnpm dev:console` | Start Console standalone (MSW mode) |
| `pnpm test` | Run spec tests |
| `pnpm doctor` | Check environment health |
| `pnpm docs:dev` | Start documentation site |
| `pnpm docs:build` | Build documentation for production |

### CLI Commands

```bash
os init [name]       # Scaffold a new project
os dev               # Start dev server (hot-reload)
os dev --ui          # Dev server + Console UI
os studio            # Alias for dev --ui (one command)
os serve             # Start production server
os compile           # Build deployable JSON artifact
os validate          # Check configuration against protocol
os info              # Display metadata summary
os generate          # Scaffold objects, views, flows
os doctor            # Check environment health
```

## 📦 Monorepo Structure

### Core Packages

| Package | Description | Status |
| :--- | :--- | :--- |
| [`@objectstack/spec`](packages/spec) | Protocol definitions (Zod schemas, Types, JSON Schemas) | 🟢 Active |
| [`@objectstack/core`](packages/core) | Microkernel runtime (Plugin system, DI, Event Bus, Logger) | 🟢 Active |
| [`@objectstack/types`](packages/types) | Shared runtime type definitions | 🟢 Active |

### Engine Packages

| Package | Description | Status |
| :--- | :--- | :--- |
| [`@objectstack/objectql`](packages/objectql) | ObjectQL query engine and schema registry | 🟢 Active |
| [`@objectstack/runtime`](packages/runtime) | Runtime utilities, DriverPlugin, AppPlugin | 🟢 Active |
| [`@objectstack/metadata`](packages/metadata) | Metadata loading and persistence | 🟢 Active |

### Client Packages

| Package | Description | Status |
| :--- | :--- | :--- |
| [`@objectstack/client`](packages/client) | Official Client SDK (CRUD, Batch API, Error handling) | 🟢 Active |
| [`@objectstack/client-react`](packages/client-react) | React hooks (useQuery, useMutation, usePagination) | 🟢 Active |

### Plugin Packages

| Package | Description | Status |
| :--- | :--- | :--- |
| [`@objectstack/driver-memory`](packages/plugins/driver-memory) | In-memory driver (reference implementation, zero deps) | 🟢 Active |
| [`@objectstack/plugin-hono-server`](packages/plugins/plugin-hono-server) | HTTP server plugin (Hono-based, auto-discovery) | 🟢 Active |
| [`@objectstack/plugin-msw`](packages/plugins/plugin-msw) | Mock Service Worker plugin for browser testing | 🟢 Active |

### Tools & Apps

| Package | Description | Status |
| :--- | :--- | :--- |
| [`@objectstack/cli`](packages/cli) | CLI: init, dev, serve, studio, compile, validate, generate | 🟢 Active |
| [`@objectstack/studio`](apps/studio) | Studio UI (Object Explorer, Schema Inspector) | 🟢 Active |
| [`@objectstack/docs`](apps/docs) | Documentation site (Fumadocs + Next.js) | 🟢 Active |

### Examples

| Example | Description | Level |
| :--- | :--- | :--- |
| [`@example/app-todo`](examples/app-todo) | Task management app — objects, views, dashboards, flows | 🟢 Beginner |
| [`@example/app-crm`](examples/app-crm) | Enterprise CRM — accounts, contacts, opportunities, leads | 🟡 Intermediate |
| [`@example/app-host`](examples/app-host) | Server host — multi-app orchestration with plugins | 🔴 Advanced |
| [`@example/plugin-bi`](examples/plugin-bi) | BI plugin — analytics objects and reports | 🟡 Intermediate |

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

## 📄 License

Apache 2.0 © ObjectStack
