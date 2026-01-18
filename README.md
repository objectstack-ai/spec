# @objectstack/spec

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> ObjectStack Protocol & Specification - The Constitution of the ObjectStack Ecosystem

## 📜 Overview

This package defines the **core interfaces, schemas, and conventions** for the ObjectStack ecosystem. It serves as the "Constitution" - the shared language that ObjectOS, ObjectStudio, ObjectCloud, and all third-party plugins use to communicate.

**Guiding Principle:** *"Strict Types, No Logic"*

This package contains:
- ✅ TypeScript Interfaces (Shared types)
- ✅ Zod Schemas (Validation rules with type inference)
- ✅ Constants (Convention configurations)

This package does NOT contain:
- ❌ Database connections
- ❌ UI components
- ❌ Runtime business logic

## 🚀 Installation

```bash
npm install @objectstack/spec
```

## 📦 What's Inside

### 1. Manifest Schema (`ManifestSchema`)

Defines the structure of a package configuration file. All packages (apps, plugins, drivers, modules) must conform to this schema.

```typescript
import { ManifestSchema, type ObjectStackManifest } from '@objectstack/spec';

// Validate a manifest
const manifest: ObjectStackManifest = {
  id: 'com.example.myapp',
  version: '1.0.0',
  type: 'plugin',
  name: 'My App',
  permissions: ['system.user.read'],
  menus: [
    { label: 'Dashboard', path: '/dashboard', icon: 'home' }
  ]
};

// Validate with Zod
ManifestSchema.parse(manifest);
```

### 2. Plugin Runtime Interface (`ObjectStackPlugin`)

Defines the contract that every plugin must implement to be loaded by ObjectOS.

```typescript
import { ObjectStackPlugin, PluginContext } from '@objectstack/spec';

export default function createPlugin(): ObjectStackPlugin {
  return {
    async onInstall(ctx: PluginContext) {
      ctx.logger.info('Plugin installed');
    },
    
    async onEnable(ctx: PluginContext) {
      ctx.logger.info('Plugin enabled');
    },
    
    async onDisable(ctx: PluginContext) {
      ctx.logger.info('Plugin disabled');
    }
  };
}
```

### 3. Directory Conventions (`PKG_CONVENTIONS`)

Defines the "Law of Location" - where things must be in ObjectStack packages.

```typescript
import { PKG_CONVENTIONS } from '@objectstack/spec';

console.log(PKG_CONVENTIONS.DIRS.SCHEMA);    // 'src/schemas'
console.log(PKG_CONVENTIONS.DIRS.TRIGGERS);  // 'src/triggers'
console.log(PKG_CONVENTIONS.FILES.MANIFEST); // 'objectstack.config.ts'
```

## 📚 API Reference

### Schemas

- `ManifestSchema` - Zod schema for package manifests
- `MenuItemSchema` - Zod schema for menu items
- `ObjectStackManifest` - TypeScript type for manifests
- `MenuItem` - TypeScript type for menu items

### Types

- `ObjectStackPlugin` - Plugin interface with lifecycle methods
- `PluginContext` - Context provided to plugin methods
- `PluginFactory` - Plugin factory function type
- `PluginLogger` - Logger interface
- `ObjectQLClient` - Database client interface
- `ObjectOSKernel` - OS kernel interface

### Constants

- `PKG_CONVENTIONS` - Directory and file conventions
- `PackageDirectory` - Type for package directories
- `PackageFile` - Type for package files

## 🏗️ Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Watch mode for development
npm run dev

# Clean build artifacts
npm run clean
```

## 📄 License
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