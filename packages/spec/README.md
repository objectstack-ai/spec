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

The specification is organized into five namespaces mapping to the three-layer architecture:

### 1. Data Protocol (`src/data`) - *ObjectQL*
*Business Kernel & Data Logic*
*   `Object`, `Field`, `Validation`
*   `Query` (AST), `Driver` (Interface), `Datasource`
*   `Permission`, `Sharing`, `Flow`

### 2. AI Protocol (`src/ai`) - *ObjectQL*
*Intelligence & Orchestration*
*   `Agent` (Orchestration), `RAG` (Retrieval)
*   `Model` (Registry), `Prompt`

### 3. UI Protocol (`src/ui`) - *ObjectUI*
*Presentation & Interaction*
*   `App`, `Page`, `View` (Grid/Kanban)
*   `Dashboard` (Widgets), `Report`
*   `Action` (Triggers)

### 4. System Protocol (`src/system`) - *ObjectOS*
*Runtime Infrastructure & Security*
*   `Manifest` (Config), `Identity` (Auth)
*   `Role` (RBAC), `Tenant` (Isolation)
*   `Events` (Bus), `Plugin` (Lifecycle)

### 5. API Protocol (`src/api`) - *ObjectOS*
*Connectivity & Contracts*
*   `Contract` (DTOs), `Endpoint` (Gateway)
*   `Discovery` (Metadata), `Realtime` (Socket)

## 📚 Usage

### Import Styles

**Important:** This package does NOT export types at the root level to prevent naming conflicts. You must use one of the following import styles:

#### 1. Namespace Imports from Root

Import protocol namespaces from the package root:

```typescript
import { Data, UI, System, AI, API } from '@objectstack/spec';

const field: Data.Field = {
  name: 'task_name',
  type: 'text',
  label: 'Task Name',
};

const user: System.User = {
  id: 'user_123',
  email: 'user@example.com',
  // ...
};

const agent: AI.Agent = {
  name: 'sales_assistant',
  // ...
};
```

**Pros:**
- Single import line for multiple protocols
- Clear namespace boundaries
- No naming conflicts

#### 2. Namespace Imports via Subpath

Import protocol domains individually:

```typescript
import * as Data from '@objectstack/spec/data';
import * as UI from '@objectstack/spec/ui';
import * as System from '@objectstack/spec/system';
import * as AI from '@objectstack/spec/ai';
import * as API from '@objectstack/spec/api';

const field: Data.Field = {
  name: 'task_name',
  type: 'text',
  label: 'Task Name',
};

const user: System.User = {
  id: 'user_123',
  email: 'user@example.com',
  // ...
};
```

**Pros:**
- Explicit about which protocols are used
- Better tree-shaking (only imports needed protocols)
- Clear namespace boundaries

#### 3. Direct Subpath Imports

Import specific types from subpaths:

```typescript
import { Field, FieldType, ObjectSchema } from '@objectstack/spec/data';
import { User, Session } from '@objectstack/spec/system';
import { App, View } from '@objectstack/spec/ui';

const field: Field = {
  name: 'task_name',
  type: 'text',
  label: 'Task Name',
};

const user: User = {
  id: 'user_123',
  email: 'user@example.com',
  // ...
};
```

**Pros:**
- Most concise syntax
- Good for importing specific types
- No namespace prefix needed

**Cons:**
- Need to know which subpath contains each type
- Multiple import statements for different protocols

### Validation (Runtime)

```typescript
// Style 1: Namespace from root
import { Data } from '@objectstack/spec';
const result = Data.ObjectSchema.safeParse(userConfig);

// Style 2: Namespace via subpath
import * as Data from '@objectstack/spec/data';
const result = Data.ObjectSchema.safeParse(userConfig);

// Style 3: Direct subpath import
import { ObjectSchema } from '@objectstack/spec/data';
const result = ObjectSchema.safeParse(userConfig);

if (!result.success) {
  console.error("Invalid Object definition", result.error);
}
```

### Type Definitions (Compile Time)

```typescript
// Style 1: Namespace from root
import type { Data } from '@objectstack/spec';
const myField: Data.Field = {
  name: "task_name",
  type: "text",
  label: "Task Name"
};

// Style 2: Direct subpath import
import type { Field } from '@objectstack/spec/data';
const myField: Field = {
  name: "task_name",
  type: "text",
  label: "Task Name"
};
```

Using namespace imports for multiple protocols:

```typescript
import type * as Data from '@objectstack/spec/data';
import type * as System from '@objectstack/spec/system';

const field: Data.Field = { /* ... */ };
const user: System.User = { /* ... */ };
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

### Testing

This package includes comprehensive test coverage for all Zod schemas using **Vitest**.

```bash
# Run tests once
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage report
pnpm test:coverage
```

#### Test Structure

Tests are co-located with schema files using the `.test.ts` suffix:

```text
src/
├── data/
│   ├── field.zod.ts       # Schema definition
│   ├── field.test.ts      # Tests
│   ├── object.zod.ts
│   └── object.test.ts
├── ui/
│   ├── view.zod.ts
│   └── view.test.ts
└── system/
    ├── manifest.zod.ts
    └── manifest.test.ts
```

#### Test Coverage

Each test file includes:
*   **Schema Validation Tests**: Verify valid inputs pass and invalid inputs fail
*   **Default Value Tests**: Ensure default values are applied correctly
*   **Type Tests**: Test discriminated unions and type narrowing
*   **Constraint Tests**: Validate naming conventions (snake_case), regex patterns, enums
*   **Real-World Examples**: Complete, realistic examples from CRM, HR, Sales domains

**Current Coverage**: 263 tests across 13 test files with 100% coverage for tested schemas.

#### Writing Tests

When adding new schemas, follow these patterns:

```typescript
import { describe, it, expect } from 'vitest';
import { YourSchema } from './your-schema.zod';

describe('YourSchema', () => {
  it('should accept valid data', () => {
    const valid = { /* valid data */ };
    expect(() => YourSchema.parse(valid)).not.toThrow();
  });

  it('should reject invalid data', () => {
    const invalid = { /* invalid data */ };
    expect(() => YourSchema.parse(invalid)).toThrow();
  });

  it('should apply defaults', () => {
    const result = YourSchema.parse({ /* minimal data */ });
    expect(result.someField).toBe('default-value');
  });
});
```

### Directory Structure

```text
packages/spec/
├── src/                # Source Truth (Zod)
│   ├── data/           # ObjectQL Protocol
│   ├── ui/             # ObjectUI Protocol
│   └── system/         # ObjectOS Protocol
├── json-schema/        # Auto-generated (npm run gen:schema)
├── dist/               # Compiled JS/D.TS
└── vitest.config.ts    # Test configuration
```
