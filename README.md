# ObjectStack Protocol

![ObjectStack Protocol](https://img.shields.io/badge/ObjectStack-Protocol-black)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **The "Constitution" of the Post-SaaS Operating System.**

This repository contains the core specifications, schemas, and protocols that power the ObjectStack ecosystem. It defines how data, UI, and system configurations are expressed as code.

## 🎉 Recent Updates (2026-01-27)

**ObjectQL (Data Layer) now at 100% completion!** 🎯

We've completed all advanced query features and AI/ML field types:
- ✅ **Window Functions** - ROW_NUMBER, RANK, LAG, LEAD, and aggregate window functions
- ✅ **HAVING Clause** - Filter aggregated results in GROUP BY queries
- ✅ **DISTINCT Queries** - Full support for SELECT DISTINCT
- ✅ **Subqueries** - Nested queries in JOIN clauses
- ✅ **Vector Field Type** - AI/ML embeddings for semantic search and RAG workflows
- ✅ **Location Field Type** - GPS coordinates for geospatial applications

**See [PROTOCOL_EXTENSIONS_COMPLETED.md](./PROTOCOL_EXTENSIONS_COMPLETED.md) for complete details.**

## 📚 Documentation

### Protocol Reference
*   **[Protocol Index](./PROTOCOL_INDEX.md):** 📑 **Quick navigation index** to all 70 protocol specifications with direct links
*   **[Protocol Reference](./PROTOCOL_REFERENCE.md):** 📖 **Complete inventory** with detailed descriptions, usage examples, and organization by module
*   **[Protocol Organization](./PROTOCOL_ORGANIZATION.md):** 🗺️ **Visual diagrams and maps** showing protocol structure, dependencies, and relationships

### Quick Start
*   **[Protocol Index](./PROTOCOL_INDEX.md):** Quick navigation to all protocol specifications
*   **[Contributing Guide](./CONTRIBUTING.md):** How to contribute to the project

### Architecture & Design
*   **[Architecture Overview](./ARCHITECTURE.md):** Deep dive into the three-layer architecture
*   **[Protocol Organization](./PROTOCOL_ORGANIZATION.md):** Visual diagrams showing protocol structure and dependencies

### Standards & Best Practices
*   **[Contributing Guide](./CONTRIBUTING.md):** Includes coding standards and best practices
*   **[Protocol Reference](./PROTOCOL_REFERENCE.md):** Detailed documentation with usage examples

### Documentation Site
The official documentation is built with Fumadocs and Next.js.

*   **[Documentation Content](./content/docs/):** MDX documentation files (concepts, specifications, references)
*   **[Documentation Site](./apps/docs/):** Fumadocs-powered Next.js app
*   **[Live Site](http://localhost:3000/docs):** Run `pnpm docs:dev` to view locally

### Planning & Internal Docs
*   **[Protocol Extensions Completed](./PROTOCOL_EXTENSIONS_COMPLETED.md):** Recently completed features and updates
*   **[Contributing Guide](./CONTRIBUTING.md):** Development workflow and guidelines

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

The ObjectStack Protocol (`@objectstack/spec`) contains **70 protocol specifications** organized into 11 modules. See **[PROTOCOL_REFERENCE.md](./PROTOCOL_REFERENCE.md)** for the complete inventory.

### Core Modules (Summary)

### 1. Data Protocol (ObjectQL) - 8 Protocols
Defines the "Shape of Data" and business logic.
- **Schema:** Objects, Fields (44 types including text, number, select, lookup, formula, autonumber, slider, qrcode, **vector** (AI/ML), **location** (GPS), etc.)
- **Logic:** Workflows, Triggers, Validation Rules, Formulas, Lifecycle Hooks
- **Security:** Permissions, Sharing Rules
- **Query:** Abstract Syntax Tree (AST) for unified data access across drivers with **Window Functions**, **HAVING**, **DISTINCT**, **Subqueries**
- **Automation:** Flow definitions, Dataset mappings

### 2. UI Protocol (ObjectUI) - 10 Protocols
Defines the "Shape of Interaction" for rendering interfaces.
- **Views:** Grid, Kanban, Calendar, Gantt, List configurations
- **Pages:** FlexiPage layouts with regions and components
- **Navigation:** App menus and navigation structures
- **Analytics:** Reports (Tabular, Summary, Matrix), Dashboards with widgets
- **Actions:** Script, URL, Modal, Flow-triggered actions
- **Theming:** Color palettes, typography, breakpoints, animations
- **Widgets:** Custom field components

### 3. System Protocol (ObjectOS) - 14 Protocols
Defines the "Runtime Environment" and platform capabilities.
- **Manifest:** Application packaging (`objectstack.config.ts`) with support for 7 package types: `app`, `plugin`, `driver`, `module`, `objectql`, `gateway`, `adapter`
- **Identity:** Authentication, Roles, Territories, Licenses, Organizations
- **Integration:** Webhooks, API contracts, ETL Mappings
- **Datasource:** Driver definitions for PostgreSQL, MongoDB, and extensible drivers
- **Discovery:** Plugin discovery and loading mechanisms
- **I18n:** Translation and internationalization support
- **Platform:** Events, Real-time sync, Audit logging, Background jobs, Feature flags

### 4. AI Protocol - 8 Protocols
Defines AI agent integration capabilities.
- **Agent:** AI agent definitions and configurations
- **Model Registry:** LLM registry and selection
- **RAG Pipeline:** Retrieval-augmented generation
- **NLQ:** Natural language query processing (NL to ObjectQL)
- **Conversation:** Conversation management and memory
- **Cost Tracking:** AI cost tracking and budget management
- **Predictive:** Predictive analytics models
- **Orchestration:** AI-powered workflow automation

### 5. API Protocol - 6 Protocols
Defines standardized API contracts.
- **Contracts:** API endpoint definitions and specifications
- **Endpoints:** REST endpoint definitions with rate limiting
- **Router:** API routing configuration
- **OData:** OData query protocol support
- **Realtime:** WebSocket/SSE real-time subscriptions
- **Discovery:** API discovery and introspection

### Additional Modules
- **Automation Protocol** (7): Workflows, Flows, Approvals, ETL, Webhooks, Sync, Connectors
- **Auth Protocol** (6): Identity, Roles, Organizations, OAuth/SAML/SSO, SCIM, Policies
- **Permission Protocol** (4): Object permissions, Sharing rules, Row-level security, Territories
- **Hub Protocol** (5): Marketplace, Licensing, Multi-tenancy, Workspaces, Dependencies
- **Shared Protocol** (1): Common identifiers and utilities
- **Stack Protocol** (1): Root stack definition

**👉 See [PROTOCOL_REFERENCE.md](./PROTOCOL_REFERENCE.md) for detailed documentation of all 70 protocols.**

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
2.  **Understand Architecture**: Read [ARCHITECTURE.md](./ARCHITECTURE.md) for system overview
3.  **Explore Protocols**: See [PROTOCOL_REFERENCE.md](./PROTOCOL_REFERENCE.md) for detailed specifications
4.  **Check Recent Work**: Review [PROTOCOL_EXTENSIONS_COMPLETED.md](./PROTOCOL_EXTENSIONS_COMPLETED.md) for latest updates

### Key Standards

- **Naming Conventions**: Follow consistent naming across the codebase
  - Configuration keys (TypeScript properties): `camelCase` (e.g., `maxLength`, `referenceFilters`)
  - Machine names (data values): `snake_case` (e.g., `name: 'project_task'`, `object: 'account'`)
- **Zod-First Design**: All schemas must be defined using Zod with runtime validation
- **TypeScript**: Use strict TypeScript with comprehensive JSDoc comments

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
