# @objectstack/spec-meta

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> ObjectStack Metamodel Type Definitions

## 📜 Overview

This package defines the **core metamodel interfaces** that form the contract between the backend (ObjectQL) parser and the frontend (ObjectUI) renderer.

**Guiding Principle:** *"Strict Types, No Logic"*

This package contains:
- ✅ TypeScript Interfaces (Entity, Field, View types)

This package does NOT contain:
- ❌ Database connections
- ❌ UI components
- ❌ Runtime business logic

## 🚀 Installation

```bash
pnpm install @objectstack/spec-meta
```

## 📦 What's Inside

### Core Interfaces

- `FieldType` - Available field data types
- `ObjectField` - Field definition interface
- `ObjectEntity` - Entity (data model) definition interface
- `ObjectView` - View configuration interface

## 📚 Usage

```typescript
import { ObjectEntity, ObjectField, FieldType } from '@objectstack/spec-meta';

const userEntity: ObjectEntity = {
  name: 'User',
  label: 'User',
  pluralLabel: 'Users',
  fields: [
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true
    }
  ],
  primaryKey: 'id',
  displayField: 'email'
};
```

## 📄 License

MIT
