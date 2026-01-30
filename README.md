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

### 🤖 AI-Native Development

ObjectStack is designed for AI-driven development:

- **Metadata-First**: Everything is configuration, enabling AI to rapidly generate complete applications
- **Protocol-Based**: Strict file naming conventions (`*.object.ts`, `*.view.ts`, etc.) guide AI code generation
- **Type-Safe**: Zod schemas ensure AI-generated code is validated at runtime
- **Iterative**: Support for rapid prototyping and version evolution with semantic versioning
- **Comprehensive**: Build complete CRM, ERP, or custom enterprise apps in hours, not months

**Start building with AI:** [AI Development Guide](./AI_DEVELOPMENT_GUIDE.md) | [ERP Tutorial](./content/docs/ai-erp-tutorial.md)

## 📚 Documentation

📖 **[Read the Full Documentation](./content/docs/)**

### Quick Links

- **Getting Started:**
  - [Introduction](./content/docs/introduction/) - Core concepts and architecture
  - [Quick Start Examples](./examples/) - CRM, Todo, and plugin examples
  
- **🤖 AI Agent Development:**
  - **[AI Development Guide](./AI_DEVELOPMENT_GUIDE.md)** - 完整的 AI Agent 企业应用开发指南 | Complete guide for AI-driven enterprise app development
  - [Quick Reference](./content/docs/ai-agent-quick-reference.md) - AI 代理快速参考手册 | Quick lookup for AI agents
  - [ERP Tutorial](./content/docs/ai-erp-tutorial.md) - 从零构建 ERP 系统实战教程 | Hands-on tutorial for building an ERP system
  
- **Protocol References:**
  - [Protocol Reference](./content/docs/references/) - All 70 protocol specifications
  - [ObjectQL](./content/docs/objectql/) - Data layer documentation
  - [ObjectUI](./content/docs/objectui/) - UI layer documentation
  - [ObjectOS](./content/docs/objectos/) - System layer documentation

- **Development:**
  - [MicroKernel Architecture](./content/docs/developers/micro-kernel.mdx) - Plugin architecture guide
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
| **[`@objectstack/plugins`](packages/plugins)** | Core plugins (Hono, MSW, Drivers) | 🟢 Active |
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
