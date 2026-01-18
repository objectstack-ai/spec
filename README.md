# ObjectStack Specification

The ObjectStack Protocol & Specification repository defines the core type definitions and interfaces for the ObjectStack ecosystem. This repository serves as the "Constitution" of the system, providing the contract between backend (ObjectQL) parsers and frontend (ObjectUI) renderers.

## Purpose

This repository contains:
- **TypeScript Interfaces**: Shared types for the entire ObjectStack ecosystem
- **No Logic**: Only type definitions, no runtime code or business logic
- **Universal Compatibility**: Works in Node.js, Browser, and Electron environments

## Metamodel Interfaces

The metamodel defines the structure for describing data models in ObjectStack:

### Core Interfaces

#### `FieldType`
Defines the available field data types:
- Text types: `text`, `textarea`, `email`, `url`
- Numeric types: `number`, `currency`, `percentage`
- Date/Time types: `date`, `datetime`
- Relation types: `lookup`
- Selection types: `select`, `multiselect`
- Special types: `boolean`, `json`, `file`, `image`

#### `ObjectField`
Represents a field definition within an entity:
```typescript
interface ObjectField {
  name: string;           // Field identifier
  label: string;          // Display label
  type: FieldType;        // Data type
  required?: boolean;     // Validation
  unique?: boolean;       // Constraint
  lookupEntity?: string;  // For lookup fields
  // ... and more options
}
```

#### `ObjectEntity`
Represents a complete entity (data model) definition:
```typescript
interface ObjectEntity {
  name: string;           // Entity identifier
  label: string;          // Singular display label
  pluralLabel: string;    // Plural display label
  fields: ObjectField[];  // Field definitions
  primaryKey?: string;    // Primary key field
  displayField?: string;  // Display field for lookups
  // ... and more options
}
```

#### `ObjectView`
Represents a view configuration for presenting entity data:
```typescript
interface ObjectView {
  name: string;           // View identifier
  label: string;          // Display label
  entityName: string;     // Target entity
  type: ViewType;         // Presentation type (list, form, detail, etc.)
  fields?: string[];      // Fields to display
  columns?: ViewColumn[]; // Column configuration
  filters?: ViewFilter[]; // Default filters
  sort?: ViewSort[];      // Default sort order
  // ... and more options
}
```

## Usage

### Installation

```bash
npm install @objectstack/spec
```

### Importing Types

```typescript
// Import all metamodel types
import { ObjectEntity, ObjectField, ObjectView, FieldType } from '@objectstack/spec';

// Or import specific types
import type { ObjectEntity } from '@objectstack/spec';
```

### Example: Defining an Entity

```typescript
import { ObjectEntity, ObjectField } from '@objectstack/spec';

const userEntity: ObjectEntity = {
  name: 'User',
  label: 'User',
  pluralLabel: 'Users',
  description: 'System user account',
  fields: [
    {
      name: 'id',
      label: 'ID',
      type: 'text',
      required: true,
      readonly: true
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      unique: true
    },
    {
      name: 'name',
      label: 'Full Name',
      type: 'text',
      required: true
    },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      required: true,
      options: [
        { value: 'admin', label: 'Administrator' },
        { value: 'user', label: 'User' }
      ]
    }
  ],
  primaryKey: 'id',
  displayField: 'name'
};
```

## Building

```bash
npm install
npm run build
```

This will compile TypeScript files to JavaScript and generate type declarations in the `dist/` directory.

## Philosophy

Following the ObjectStack Protocol:
- **Strict Types, No Logic**: This repository contains only type definitions
- **Documentation as Code**: Every interface property has TSDoc comments for IntelliSense
- **Universal Compatibility**: Pure TypeScript with no platform-specific dependencies

## License

MIT