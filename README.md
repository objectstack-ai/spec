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

MIT