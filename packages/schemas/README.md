# @objectstack/spec-schemas

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> ObjectStack Zod Validation Schemas

## 📜 Overview

This package contains **Zod schemas for validating** ObjectStack configurations and manifests.

**Guiding Principle:** *"Strict Types, No Logic"*

This package contains:
- ✅ Zod Schemas (Validation rules with type inference)

This package does NOT contain:
- ❌ Database connections
- ❌ UI components
- ❌ Runtime business logic

## 🚀 Installation

```bash
pnpm install @objectstack/spec-schemas
```

## 📦 What's Inside

### Schemas

- `ManifestSchema` - Zod schema for package manifests
- `MenuItemSchema` - Zod schema for menu items
- `ObjectStackManifest` - TypeScript type for manifests
- `MenuItem` - TypeScript type for menu items

## 📚 Usage

```typescript
import { ManifestSchema, type ObjectStackManifest } from '@objectstack/spec-schemas';

const manifest: ObjectStackManifest = {
  id: 'com.example.myapp',
  version: '1.0.0',
  type: 'plugin',
  name: 'My App',
  permissions: ['system.user.read']
};

// Validate with Zod
ManifestSchema.parse(manifest);
```

## 📄 License

MIT
