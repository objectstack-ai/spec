# @objectstack/spec

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> ObjectStack Protocol & Specification - The Constitution of the ObjectStack Ecosystem

## 📜 Overview

This is the **main package** that re-exports all ObjectStack specification packages for convenience and backward compatibility.

**Guiding Principle:** *"Strict Types, No Logic"*

This package aggregates:
- `@objectstack/spec-meta` - Metamodel type definitions
- `@objectstack/spec-plugin` - Plugin runtime interfaces
- `@objectstack/spec-schemas` - Zod validation schemas
- `@objectstack/spec-constants` - Convention constants

## 🚀 Installation

```bash
pnpm install @objectstack/spec
```

## 📦 What's Inside

This package provides a unified import for all ObjectStack specifications. You can import everything from this package, or use the individual packages for smaller bundle sizes.

## 📚 Usage

### Using the main package (recommended for most use cases)

```typescript
import { 
  ObjectEntity, 
  ObjectStackPlugin, 
  ManifestSchema,
  PKG_CONVENTIONS 
} from '@objectstack/spec';
```

### Using individual packages (for smaller bundle sizes)

```typescript
import { ObjectEntity } from '@objectstack/spec-meta';
import { ObjectStackPlugin } from '@objectstack/spec-plugin';
import { ManifestSchema } from '@objectstack/spec-schemas';
import { PKG_CONVENTIONS } from '@objectstack/spec-constants';
```

## 📦 Sub-packages

- **[@objectstack/spec-meta](../meta)** - Metamodel type definitions
- **[@objectstack/spec-plugin](../plugin)** - Plugin runtime interfaces
- **[@objectstack/spec-schemas](../schemas)** - Zod validation schemas
- **[@objectstack/spec-constants](../constants)** - Convention constants

## 📄 License

MIT
