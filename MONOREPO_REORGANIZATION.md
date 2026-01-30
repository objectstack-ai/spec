# Monorepo Reorganization Summary

This document describes the reorganization of the ObjectStack monorepo from a fragmented multi-package structure into a cleaner 4-package architecture.

## Motivation

The previous PR #397 proposed splitting the monorepo into 60+ separate repositories using a microkernel ecosystem approach. However, this was deemed too fragmented and difficult to maintain. Instead, we've consolidated into 4 logical packages within the monorepo.

## New Package Structure

### 1. `@objectstack/spec` - Protocol Layer (No Changes)
**Purpose**: Pure protocol definitions and schemas

**Contents**:
- Zod schemas for all domains (data, ui, system, ai, api, automation, etc.)
- TypeScript type derivation (`z.infer<>`)
- JSON schema generation
- No implementation code

**Status**: ✅ Unchanged - already clean and well-structured

### 2. `@objectstack/objectql` - Data Layer
**Purpose**: Data query engine and driver abstraction

**Contents**:
- ObjectQL query engine implementation
- Query AST processing
- Driver interface and registry
- Hook system for data operations

**Changes**:
- ✅ Updated dependencies: `@objectstack/core` → `@objectstack/objectos`
- ✅ Updated imports to use `@objectstack/objectos/kernel`

### 3. `@objectstack/objectui` - UI Layer (NEW)
**Purpose**: UI implementation layer (currently a placeholder)

**Contents**:
- Foundation for view rendering
- Component system (future)
- Layout engine (future)
- Theme system (future)

**Status**: 🚧 Created as placeholder for future UI implementation

### 4. `@objectstack/objectos` - Operating System Layer (NEW)
**Purpose**: Core runtime infrastructure

**Merged Packages**:
- `@objectstack/core` → `objectos/kernel`
- `@objectstack/runtime` → `objectos/runtime`
- `@objectstack/client` → `objectos/client`
- `@objectstack/cli` → `objectos/cli`
- `@objectstack/ai-bridge` → `objectos/ai-bridge`
- `@objectstack/types` → `objectos/types`

**Subpath Exports**:
```typescript
import { ObjectKernel } from '@objectstack/objectos/kernel';
import { DriverPlugin, AppPlugin } from '@objectstack/objectos/runtime';
import { ObjectStackClient } from '@objectstack/objectos/client';
import { /* CLI tools */ } from '@objectstack/objectos/cli';
import { /* AI tools */ } from '@objectstack/objectos/ai-bridge';
```

## Migration Guide

### For Plugin Authors

**Before**:
```typescript
import { Plugin, PluginContext } from '@objectstack/core';
import { DriverPlugin } from '@objectstack/runtime';
```

**After**:
```typescript
import { Plugin, PluginContext } from '@objectstack/objectos/kernel';
import { DriverPlugin } from '@objectstack/objectos/runtime';
```

### For Application Developers

**Before**:
```typescript
import { ObjectStackClient } from '@objectstack/client';
import { ObjectKernel } from '@objectstack/core';
```

**After**:
```typescript
import { ObjectStackClient } from '@objectstack/objectos/client';
import { ObjectKernel } from '@objectstack/objectos/kernel';
```

## Packages to be Removed

The following packages have been merged and can be removed after verification:
- `packages/core/` → merged into `objectos/kernel`
- `packages/runtime/` → merged into `objectos/runtime`
- `packages/client/` → merged into `objectos/client`
- `packages/cli/` → merged into `objectos/cli`
- `packages/ai-bridge/` → merged into `objectos/ai-bridge`
- `packages/types/` → merged into `objectos/types`

## Benefits

1. **Simpler Maintenance**: 4 packages instead of 7+ fragmented packages
2. **Clear Boundaries**: Protocol (spec) vs Implementation (objectql, objectui, objectos)
3. **Easier Onboarding**: Developers can understand the architecture quickly
4. **Flexible Growth**: Each package can grow independently while maintaining cohesion
5. **Monorepo Advantages**: Atomic commits, shared tooling, easier refactoring

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    @objectstack/spec                        │
│                   (Protocol Layer)                          │
│  ┌─────────┬─────────┬─────────┬─────────┬─────────────┐  │
│  │  Data   │   UI    │ System  │   AI    │     API     │  │
│  │ Schemas │ Schemas │ Schemas │ Schemas │   Schemas   │  │
│  └─────────┴─────────┴─────────┴─────────┴─────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
           ┌────────────────┼────────────────┐
           │                │                │
┌──────────▼────────┐  ┌───▼──────┐  ┌─────▼──────────────┐
│  @objectstack/    │  │@objectst │  │  @objectstack/     │
│     objectql      │  │ack/objec │  │     objectos       │
│  (Data Layer)     │  │tui       │  │   (OS Layer)       │
│                   │  │(UI Layer)│  │                    │
│ • Query Engine    │  │          │  │ • Kernel           │
│ • Drivers         │  │• Renderers   │ • Runtime Plugins  │
│ • Filters/Aggs    │  │• Components  │ • Client SDK       │
│                   │  │• Layouts │  │ • CLI Tools        │
│                   │  │          │  │ • AI Bridge        │
└───────────────────┘  └──────────┘  └────────────────────┘
           │                │                │
           └────────────────┼────────────────┘
                            │
                  ┌─────────▼──────────┐
                  │      Plugins       │
                  │                    │
                  │ • driver-memory    │
                  │ • plugin-hono      │
                  │ • plugin-msw       │
                  └────────────────────┘
```

## Next Steps

1. ✅ Create new packages (objectui, objectos)
2. ✅ Merge existing packages into objectos
3. ✅ Update all import paths
4. ✅ Update dependencies in package.json files
5. ⏳ Test builds
6. ⏳ Remove old packages
7. ⏳ Update documentation
8. ⏳ Publish new versions

## Questions?

For questions or feedback, please refer to the original issue discussion or create a new issue.
