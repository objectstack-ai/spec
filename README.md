# ObjectStack Protocol

![ObjectStack Protocol](https://img.shields.io/badge/ObjectStack-Protocol-black)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **The "Constitution" of the Post-SaaS Operating System.**

This repository contains the core specifications, schemas, and protocols that power the ObjectStack ecosystem. It defines how data, UI, and system configurations are expressed as code.

## 📚 Documentation

### Quick Start
*   **[Getting Started](./content/docs/guides/getting-started.mdx):** Quick introduction to ObjectStack Protocol
*   **[Installation Guide](./content/docs/guides/installation.mdx):** Setup instructions
*   **[Contributing Guide](./CONTRIBUTING.md):** How to contribute to the project

### Planning & Architecture
*   **[Development Roadmap](./DEVELOPMENT_ROADMAP.md):** Complete development plan considering all future possibilities
*   **[Priority Matrix](./PRIORITIES.md):** What to work on next, sprint planning guide
*   **[Architecture Diagrams](./ARCHITECTURE.md):** Visual reference for the complete system
*   **[Planning Index](./PLANNING_INDEX.md):** Complete guide to navigating planning documentation

### Technical Documentation
The official documentation is built with Fumadocs and Next.js.

*   **[Documentation Content](./content/docs/):** MDX documentation files (concepts, specifications, references)
*   **[Documentation Site](./apps/docs/):** Fumadocs-powered Next.js app
*   **[Technical Guides](./docs/):** In-depth technical guides and standards
*   **[Live Site](http://localhost:3000/docs):** Run `pnpm docs:dev` to view locally

### Architecture Deep Dives
*   **[Data Layer (ObjectQL)](./docs/architecture/data-layer.md):** Query language and data abstraction
*   **[UI Layer (ObjectUI)](./docs/architecture/ui-layer.md):** Server-driven UI protocol
*   **[System Layer (ObjectOS)](./docs/architecture/system-layer.md):** Runtime kernel and plugins

### Standards & Best Practices
*   **[Naming Conventions](./docs/standards/naming-conventions.md):** Schema naming rules (camelCase vs snake_case)
*   **[API Design](./docs/standards/api-design.md):** API design principles and patterns
*   **[Error Handling](./docs/standards/error-handling.md):** Consistent error handling strategies

## 📦 Monorepo Structure

| Package | Description | Status |
| :--- | :--- | :--- |
| **[`@objectstack/spec`](packages/spec)** | **THE PROTOCOL**. Contains all Zod definitions, Types, and JSON Schemas. | 🟢 **Active** |
| **[`@objectstack/docs`](apps/docs)** | Documentation site built with Fumadocs and Next.js. | 🟢 **Active** |
| `content/docs/` | Documentation content (MDX files). Shared resource. | 🟢 **Active** |
| **Examples** | Reference implementations demonstrating protocol features | |
| └─ [`examples/crm`](examples/crm) | **Full-featured CRM** - 6 objects, workflows, validations, views, dashboards, reports | 🟢 **Complete** |
| └─ [`examples/todo`](examples/todo) | **Quick-start** - Simple task management with 7 field types | 🟢 **Active** |
| └─ [`examples/host`](examples/host) | Server runtime with kernel/plugin loading pattern | 🟡 **Experimental** |
| └─ [`examples/plugin-bi`](examples/plugin-bi) | Business Intelligence plugin example | 🟡 **Experimental** |
| *Other packages* | *Legacy/Migration in progress* | 🟡 *Legacy* |

## 🛠️ The Protocol Architecture

The ObjectStack Protocol (`@objectstack/spec`) is divided into five core modules:

### 1. Data Protocol (ObjectQL)
Defines the "Shape of Data" and business logic.
- **Schema:** Objects, Fields (23+ types including text, number, select, lookup, formula, autonumber, etc.)
- **Logic:** Workflows, Triggers, Validation Rules, Formulas
- **Security:** Permissions, Sharing Rules
- **Query:** Abstract Syntax Tree (AST) for unified data access across drivers
- **Automation:** Flow definitions, Dataset mappings

### 2. UI Protocol (ObjectUI)
Defines the "Shape of Interaction" for rendering interfaces.
- **Views:** Grid, Kanban, Calendar, Gantt, List configurations
- **Pages:** FlexiPage layouts with regions and components
- **Navigation:** App menus and navigation structures
- **Analytics:** Reports (Tabular, Summary, Matrix), Dashboards with widgets
- **Actions:** Script, URL, Modal, Flow-triggered actions
- **Theming:** Color palettes, typography, breakpoints, animations

### 3. System Protocol (ObjectOS)
Defines the "Runtime Environment" and platform capabilities.
- **Manifest:** Application packaging (`objectstack.config.ts`)
- **Identity:** Authentication, Roles, Territories, Licenses
- **Integration:** Webhooks, API contracts, ETL Mappings
- **Datasource:** Driver definitions for SQL, NoSQL, SaaS connectors
- **Discovery:** Plugin discovery and loading mechanisms
- **I18n:** Translation and internationalization support

### 4. AI Protocol
Defines AI agent integration capabilities.
- **Agent:** AI agent definitions and configurations
- **Tools:** AI tool integrations
- **Knowledge:** Knowledge base structures
- **Models:** AI model configurations

### 5. API Protocol
Defines standardized API contracts.
- **Envelopes:** Response structures (BaseResponse, ListRecordResponse, etc.)
- **Requests:** Request payloads (CreateRequest, UpdateRequest, BulkRequest, etc.)
- **Contracts:** API endpoint definitions and specifications

## 🚀 Development

This project uses **PNPM** workspaces.

### Prerequisites
- Node.js >= 18
- PNPM >= 8

### Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Build the Protocol (Generates Schemas & Docs)
pnpm --filter @objectstack/spec build
# Output:
# - packages/spec/dist/        (Compiled TS)
# - packages/spec/json-schema/ (JSON Schemas)

# 3. Start Documentation Site
pnpm docs:dev
# Visit http://localhost:3000/docs
```

## 🤝 Contributing

We welcome contributions! Please read our **[Contributing Guide](./CONTRIBUTING.md)** for detailed guidelines.

### Quick Start for Contributors

1.  **Read the Docs**: Review [CONTRIBUTING.md](./CONTRIBUTING.md) for complete guidelines
2.  **Check Priorities**: See [PRIORITIES.md](./PRIORITIES.md) for what to work on next
3.  **Understand Architecture**: Read [ARCHITECTURE.md](./ARCHITECTURE.md) for system overview
4.  **Follow Standards**: Review [docs/standards/](./docs/standards/) for coding standards

### Key Standards

- **Naming Conventions**: See [docs/standards/naming-conventions.md](./docs/standards/naming-conventions.md)
  - Configuration keys: `camelCase` (e.g., `maxLength`, `referenceFilters`)
  - Machine names: `snake_case` (e.g., `name: 'project_task'`, `object: 'account'`)
- **API Design**: Follow [docs/standards/api-design.md](./docs/standards/api-design.md)
- **Error Handling**: Use patterns from [docs/standards/error-handling.md](./docs/standards/error-handling.md)

### PR Checklist

- [ ] Zod schema follows naming conventions
- [ ] Comprehensive JSDoc comments with `@description`
- [ ] Unit tests with 80%+ coverage
- [ ] Documentation with examples
- [ ] JSON schema generated successfully
- [ ] All existing tests pass

See [CONTRIBUTING.md](./CONTRIBUTING.md) for complete details.

## 📄 License

Apach2 2.0 © ObjectStack
