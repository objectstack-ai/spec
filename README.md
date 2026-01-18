# @objectstack/spec

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> ObjectStack Protocol & Specification - The Constitution of the ObjectStack Ecosystem

## 📜 Overview

This monorepo contains the **core interfaces, schemas, and conventions** for the ObjectStack ecosystem. It serves as the "Constitution" - the shared language that ObjectOS, ObjectStudio, ObjectCloud, and all third-party plugins use to communicate.

**Guiding Principle:** *"Strict Types, No Logic"*

## 📦 Packages

This repository is organized as a monorepo with the following packages:

### Core Packages

- **[@objectstack/spec](./packages/spec)** - Main package that re-exports everything (use this for convenience)
- **[@objectstack/spec-meta](./packages/meta)** - Metamodel type definitions (ObjectEntity, ObjectField, ObjectView)
- **[@objectstack/spec-plugin](./packages/plugin)** - Plugin runtime interfaces (ObjectStackPlugin, PluginContext)
- **[@objectstack/spec-schemas](./packages/schemas)** - Zod validation schemas (ManifestSchema, MenuItemSchema)
- **[@objectstack/spec-constants](./packages/constants)** - Convention constants (PKG_CONVENTIONS)

## 🚀 Installation

### Install the main package (recommended)

```bash
pnpm install @objectstack/spec
```

### Install individual packages (for smaller bundle sizes)

```bash
pnpm install @objectstack/spec-meta
pnpm install @objectstack/spec-plugin
pnpm install @objectstack/spec-schemas
pnpm install @objectstack/spec-constants
```

## 📚 Usage

### Using the main package

```typescript
import { 
  ObjectEntity,
  ObjectStackPlugin,
  ManifestSchema,
  PKG_CONVENTIONS
} from '@objectstack/spec';
```

### Using individual packages

```typescript
import { ObjectEntity } from '@objectstack/spec-meta';
import { ObjectStackPlugin } from '@objectstack/spec-plugin';
import { ManifestSchema } from '@objectstack/spec-schemas';
import { PKG_CONVENTIONS } from '@objectstack/spec-constants';
```

## 🏗️ Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm run build

# Watch mode for development (all packages)
pnpm run dev

# Clean build artifacts
pnpm run clean
```

### Building Individual Packages

```bash
# Build a specific package
cd packages/meta && pnpm run build
```

## 📄 License

MIT
