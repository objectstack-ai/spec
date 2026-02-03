# Migration Guide: v0.9.x Kernel Refactor

This document outlines the breaking changes introduced in `@objectstack/core` v0.9.1. 
AI Assistants and Developers should prioritize this guide when upgrading existing codebases.

## 🚨 Breaking Changes Summary

| Feature | Old (Deprecated/Removed) | New (Standard) |
| :--- | :--- | :--- |
| **Kernel Class** | `EnhancedObjectKernel` | `ObjectKernel` |
| **Sandbox Config** | `maxMemory` | `maxHeap` |
| **Permissions** | `PermissionScope` enum | Removed (implied by context) |
| **Logging** | `LoggerConfig.level` (string) | `LoggerConfig.level` (strict enum + `silent`) |

---

## 🛠️ Code Transformations

### 1. Kernel Initialization

**Before:**
```typescript
import { EnhancedObjectKernel } from '@objectstack/core';

const kernel = new EnhancedObjectKernel({
  gracefulShutdown: true
});
```

**After:**
```typescript
import { ObjectKernel } from '@objectstack/core';

// The 'Enhanced' prefix has been dropped. ObjectKernel is now the full-featured kernel.
const kernel = new ObjectKernel({
  gracefulShutdown: true
});
```

### 2. Sandbox Configuration

**Before:**
```typescript
const config = {
  sandbox: {
    maxMemory: 512, // MB
    timeout: 1000
  }
};
```

**After:**
```typescript
const config = {
  sandbox: {
    maxHeap: 512, // Renamed to accurately reflect Node.js heap limit
    timeout: 1000
  }
};
```

### 3. Dependency Conflict Handling

**Before:**
```typescript
// Implicit type
const conflict = {
  type: 'version-mismatch',
  plugins: [...]
};
```

**After:**
```typescript
// Strict Zod Validation requires all fields
const conflict: DependencyConflict = {
  type: 'version-mismatch',
  severity: 'error', // REQUIRED
  description: 'Plugin X requires version Y...', // REQUIRED
  plugins: [...]
};
```

---

## 🤖 AI Context Instructions

If you are using Cursor, Copilot, or other AI agents, add the following rule to your prompt context:

> **Rule:** When using `@objectstack/core` >= 0.9.0, NEVER use `EnhancedObjectKernel`. Always use `ObjectKernel`. `ObjectKernel` includes all advanced features (Sandboxing, Hot Reload).
> **Rule:** Sandbox configuration property `maxMemory` is now `maxHeap`.

