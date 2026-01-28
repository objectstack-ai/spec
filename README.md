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

**Learn more:** [Architecture Overview](./content/docs/introduction/architecture.mdx)

## 📚 Documentation

📖 **[Read the Full Documentation](./content/docs/)**

### Quick Links

- **Getting Started:**
  - [Introduction](./content/docs/introduction/) - Core concepts and architecture
  - [Quick Start Examples](./examples/) - CRM, Todo, and plugin examples
  
- **Protocol References:**
  - [Protocol Reference](./content/docs/references/) - All 70 protocol specifications
  - [ObjectQL](./content/docs/objectql/) - Data layer documentation
  - [ObjectUI](./content/docs/objectui/) - UI layer documentation
  - [ObjectOS](./content/docs/objectos/) - System layer documentation

- **Development:**
  - [MiniKernel Architecture](./content/docs/developers/mini-kernel.mdx) - Plugin architecture guide
  - [Writing Plugins](./content/docs/developers/writing-plugins.mdx) - Plugin development guide
  - [Contributing Guide](./CONTRIBUTING.md) - How to contribute

## 🚀 Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Build the Protocol (Generates Schemas & Docs)
pnpm --filter @objectstack/spec build

# 3. Start Documentation Site
pnpm docs:dev
# Visit http://localhost:3000/docs
```

## 📦 Monorepo Structure

| Package | Description | Status |
| :--- | :--- | :--- |
| **[`@objectstack/spec`](packages/spec)** | Core protocol definitions (Zod schemas, Types, JSON Schemas) | 🟢 Active |
| **[`@objectstack/docs`](apps/docs)** | Documentation site (Fumadocs + Next.js) | 🟢 Active |
| [`examples/crm`](examples/crm) | Full-featured CRM example | 🟢 Complete |
| [`examples/todo`](examples/todo) | Simple todo app example | 🟢 Active |

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
