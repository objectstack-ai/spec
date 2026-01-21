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

### Import Styles

The package supports two import styles to prevent naming conflicts and improve code organization:

#### 1. Flat Imports (Backward Compatible)

All schemas and types can be imported directly from the package root:

```typescript
import { ObjectSchema, Field, User, App, Agent } from '@objectstack/spec';

const result = ObjectSchema.safeParse(userConfig);
if (!result.success) {
  console.error("Invalid Object definition", result.error);
}
```

**Pros:**
- Simple, concise imports
- Backward compatible with existing code
- Good for importing a few specific types

**Cons:**
- Risk of naming conflicts as the API grows
- Less clear which protocol domain a type belongs to

#### 2. Namespaced Imports (Recommended for New Code)

Import entire protocol domains for better organization:

```typescript
// Import protocol namespaces
import * as Data from '@objectstack/spec/data';
import * as UI from '@objectstack/spec/ui';
import * as System from '@objectstack/spec/system';
import * as AI from '@objectstack/spec/ai';
import * as API from '@objectstack/spec/api';

// Use with namespace prefix
const user: System.User = {
  id: 'user_123',
  email: 'user@example.com',
  // ...
};

const field: Data.Field = {
  name: 'task_name',
  type: 'text',
  label: 'Task Name',
  // ...
};

const agent: AI.Agent = {
  name: 'sales_assistant',
  // ...
};
```

**Pros:**
- Clear organization by protocol domain
- Eliminates naming conflict concerns
- Better IDE autocomplete (shows all types in a namespace)
- Self-documenting code (immediately clear which protocol is being used)

**Cons:**
- Slightly more verbose
- Requires namespace prefix for each type

#### 3. Mixed Approach

You can also mix both styles:

```typescript
// Import frequently used types directly
import { Field, ObjectSchema } from '@objectstack/spec';

// Import less common types via namespace
import * as System from '@objectstack/spec/system';

const field: Field = { /* ... */ };
const user: System.User = { /* ... */ };
```

### Validation (Runtime)

```typescript
import { ObjectSchema } from '@objectstack/spec';

const result = ObjectSchema.safeParse(userConfig);
if (!result.success) {
  console.error("Invalid Object definition", result.error);
}
```

Or using namespaced imports:

```typescript
import * as Data from '@objectstack/spec/data';

const result = Data.ObjectSchema.safeParse(userConfig);
```

### Type Definitions (Compile Time)

```typescript
import type { Field } from '@objectstack/spec';
// Or: import type { Field } from '@objectstack/spec/data';

const myField: Field = {
  name: "task_name",
  type: "text",
  label: "Task Name"
};
```

Using namespaced imports for better organization:

```typescript
import type * as Data from '@objectstack/spec/data';
import type * as UI from '@objectstack/spec/ui';

const field: Data.Field = { /* ... */ };
const view: UI.View = { /* ... */ };
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
