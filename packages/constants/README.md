# @objectstack/spec-constants

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> ObjectStack Convention Constants

## 📜 Overview

This package defines the **"Law of Location"** - where things must be in ObjectStack packages.

**Guiding Principle:** *"Strict Types, No Logic"*

This package contains:
- ✅ Constants (Convention configurations)

This package does NOT contain:
- ❌ Database connections
- ❌ UI components
- ❌ Runtime business logic

## 🚀 Installation

```bash
pnpm install @objectstack/spec-constants
```

## 📦 What's Inside

### Constants

- `PKG_CONVENTIONS` - Directory and file conventions
- `PackageDirectory` - Type for package directories
- `PackageFile` - Type for package files

## 📚 Usage

```typescript
import { PKG_CONVENTIONS } from '@objectstack/spec-constants';

console.log(PKG_CONVENTIONS.DIRS.SCHEMA);    // 'src/schemas'
console.log(PKG_CONVENTIONS.DIRS.TRIGGERS);  // 'src/triggers'
console.log(PKG_CONVENTIONS.FILES.MANIFEST); // 'objectstack.config.ts'
```

## 📄 License

MIT
