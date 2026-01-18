# @objectstack/spec

ObjectStack Protocol & Specification — The "Constitution" of the Ecosystem.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📜 Mission

This package defines the **DNA** of ObjectStack. It contains:
1.  **Zod Schemas**: Runtime validation for the Kernel and CLI.
2.  **TypeScript Interfaces**: `z.infer<>` types for the IDE and Plugin developers.
3.  **JSON Schemas**: Auto-generated schemas for VS Code IntelliSense.

**Guiding Principle:** *"Strict Types, No Logic"*

## 🚀 Installation

```bash
pnpm install @objectstack/spec
```

## 📦 Architecture

The specification is divided into three protocols:

### 1. Data Protocol (`src/data`)
*Core Business Logic & Data Modeling*
*   `Object`, `Field`, `Validation`
*   `Query` (AST), `Mapping` (ETL)
*   `Permission`, `Sharing`, `Flow`

### 2. UI Protocol (`src/ui`)
*Presentation & Interaction*
*   `App`, `Page`, `View` (Grid/Kanban)
*   `Dashboard` (Widgets), `Report`
*   `Action` (Triggers)

### 3. System Protocol (`src/system`)
*Runtime Configuration & Security*
*   `Manifest` (Config), `Datasource`
*   `Role` (Hierarchy), `Identity` (Auth)
*   `Webhook` (Integration), `Policy` (Compliance)

## 📚 Usage

### Validation (Runtime)

```typescript
import { ObjectSchema } from '@objectstack/spec';

const result = ObjectSchema.safeParse(userConfig);
if (!result.success) {
  console.error("Invalid Object definition", result.error);
}
```

### Type Definitions (Compile Time)

```typescript
import type { Object, Field } from '@objectstack/spec';

const myObject: Object = {
  name: "project_task",
  fields: { ... }
};
```

### JSON Schema (Tooling)
The package includes valid JSON Schemas in the `/json-schema` directory.
These can be used with:
*   [Ajv](https://ajv.js.org/) (High-performance validator)
*   [React Json Schema Form](https://rjsf-team.github.io/) (Auto-forms)
*   VS Code `json.schemas` setting for IntelliSense.

## 🛠️ Development

### Build & Generate

```bash
# Generate JSON Schemas + Markdown Docs + Compile TS
pnpm build
```

### Directory Structure

```text
packages/spec/
├── src/                # Source Truth (Zod)
│   ├── data/           # ObjectQL Protocol
│   ├── ui/             # ObjectUI Protocol
│   └── system/         # ObjectOS Protocol
├── json-schema/        # Auto-generated (npm run gen:schema)
└── dist/               # Compiled JS/D.TS
```
