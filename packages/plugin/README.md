# @objectstack/spec-plugin

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> ObjectStack Plugin Runtime Interfaces

## 📜 Overview

This package defines the **contract that every plugin must implement** to be loaded by ObjectOS.

**Guiding Principle:** *"Strict Types, No Logic"*

This package contains:
- ✅ TypeScript Interfaces (Plugin runtime interfaces)

This package does NOT contain:
- ❌ Database connections
- ❌ UI components
- ❌ Runtime business logic

## 🚀 Installation

```bash
pnpm install @objectstack/spec-plugin
```

## 📦 What's Inside

### Plugin Interfaces

- `ObjectStackPlugin` - Plugin interface with lifecycle methods
- `PluginContext` - Context provided to plugin methods
- `PluginFactory` - Plugin factory function type
- `PluginLogger` - Logger interface
- `ObjectQLClient` - Database client interface
- `ObjectOSKernel` - OS kernel interface

## 📚 Usage

```typescript
import { ObjectStackPlugin, PluginContext } from '@objectstack/spec-plugin';

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

## 📄 License

MIT
