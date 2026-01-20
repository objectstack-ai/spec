# ObjectStack Protocol

![ObjectStack Protocol](https://img.shields.io/badge/ObjectStack-Protocol-black)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **The "Constitution" of the Post-SaaS Operating System.**

This repository contains the core specifications, schemas, and protocols that power the ObjectStack ecosystem. It defines how data, UI, and system configurations are expressed as code.

## 📚 Documentation

### Planning & Architecture
*   **[Development Roadmap](./DEVELOPMENT_ROADMAP.md):** Complete development plan considering all future possibilities.
*   **[Priority Matrix](./PRIORITIES.md):** What to work on next, sprint planning guide.
*   **[Architecture Diagrams](./ARCHITECTURE.md):** Visual reference for the complete system.

### Technical Documentation
The official documentation is built with Fumadocs and Next.js.

*   **[Documentation Content](./content/docs/):** MDX documentation files (concepts, specifications, references).
*   **[Documentation Site](./apps/docs/):** Fumadocs-powered Next.js app.
*   **[Live Site](http://localhost:3000/docs):** Run `pnpm docs:dev` to view locally.

## 📦 Monorepo Structure

| Package | Description | Status |
| :--- | :--- | :--- |
| **[`@objectstack/spec`](packages/spec)** | **THE PROTOCOL**. Contains all Zod definitions, Types, and JSON Schemas. | 🟢 **Active** |
| **[`@objectstack/docs`](apps/docs)** | Documentation site built with Fumadocs and Next.js. | 🟢 **Active** |
| `content/docs/` | Documentation content (MDX files). Shared resource. | 🟢 **Active** |
| *Other packages* | *Legacy/Migration in progress* | 🟡 *Legacy* |

## 🛠️ The Protocol Architecture

The ObjectStack Protocol (`@objectstack/spec`) is divided into three layers:

### 1. Data Protocol (ObjectQL)
Defines the "Shape of Data".
- **Schema:** Objects, Fields, Validation.
- **Logic:** Formulas, Rollups.
- **Security:** Permissions, Sharing Rules.
- **Query:** Abstract Syntax Tree (AST) for unified data access.

### 2. UI Protocol (ObjectUI)
Defines the "Shape of Interaction".
- **Views:** Grids, Kanbans, Calendars.
- **Pages:** FlexiPage layouts (Regions & Components).
- **Navigation:** Apps, Navigation.
- **Analytics:** Reports, Dashboards.

### 3. System Protocol (ObjectOS)
Defines the "Runtime Environment".
- **Manifest:** Application packaging (`objectstack.config.ts`).
- **Identity:** Auth, Roles, Territories.
- **Integration:** Webhooks, ETL Mappings.

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

## 🤝 Contribution

### Getting Started
1.  **Read the Roadmap**: Review [DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md) to understand the vision.
2.  **Check Priorities**: See [PRIORITIES.md](./PRIORITIES.md) for what to work on next.
3.  **Understand Architecture**: Read [ARCHITECTURE.md](./ARCHITECTURE.md) for system overview.

### Development Process
1.  **Code First**: Always start by defining the Zod Schema in `packages/spec/src`.
2.  **Write Tests**: Add comprehensive tests in `*.test.ts` files (target 80%+ coverage).
3.  **Generate**: Run `pnpm build` to update JSON Schemas and Documentation.
4.  **Commit**: Submit PR with updated Code + Schemas + Docs.

### Naming Conventions
- **Configuration Keys** (TypeScript properties): `camelCase` (e.g., `maxLength`, `referenceFilters`)
- **Machine Names** (Data values): `snake_case` (e.g., `name: 'project_task'`, `object: 'account'`)

### PR Checklist
- [ ] Zod schema follows naming conventions
- [ ] Comprehensive JSDoc comments with `@description`
- [ ] Unit tests with 80%+ coverage
- [ ] Documentation with examples
- [ ] JSON schema generated successfully
- [ ] All existing tests pass

## 📄 License

Apach2 2.0 © ObjectStack
