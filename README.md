# ObjectStack Protocol

![ObjectStack Protocol](https://img.shields.io/badge/ObjectStack-Protocol-black)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **The "Constitution" of the Post-SaaS Operating System.**

This repository contains the core specifications, schemas, and protocols that power the ObjectStack ecosystem. It defines how data, UI, and system configurations are expressed as code.

## 📚 Documentation

The official documentation is co-located in this repository.

*   **[Concepts](./content/docs/concepts/):** Architecture, Manifesto, and Core Values.
*   **[Specifications](./packages/spec/json-schema/):** Auto-generated JSON Schemas.
*   **[API Reference](./content/docs/references/):** Detailed property references generated from code.

## 📦 Monorepo Structure

| Package | Description | Status |
| :--- | :--- | :--- |
| **[`@objectstack/spec`](packages/spec)** | **THE PROTOCOL**. Contains all Zod definitions, Types, and JSON Schemas. | 🟢 **Active** |
| `content/docs` | The documentation site source. | 🟢 **Active** |
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
- **Navigation:** Apps, Menus.
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
# - content/docs/references/   (Markdown Docs)

# 3. Start Documentation Site (Optional)
# (Assuming a doc site runner is configured)
pnpm dev
```

## 🤝 Contribution

1.  **Code First**: Always start by defining the Zod Schema in `packages/spec/src`.
2.  **Generate**: Run `pnpm build` to update JSON Schemas and Documentation.
3.  **Commit**: Submit PR with updated Code + Schemas + Docs.

## 📄 License

MIT © ObjectStack
