# Quick Start: Implementing Critical P0 Protocols

> Step-by-step guide for implementing the 4 missing critical protocols. Start here if you want to contribute immediately.

**Goal**: Complete the P0 foundation by implementing the 4 missing critical protocols.

---

## 🎯 Overview

| Protocol | Priority | Effort | Status | File |
|----------|----------|--------|--------|------|
| **Field Widget Contract** | ⚠️ CRITICAL | 1-2 days | 🔴 Not Started | `packages/spec/src/ui/widget.zod.ts` |
| **Plugin Lifecycle** | ⚠️ CRITICAL | 2-3 days | 🔴 Not Started | `packages/spec/src/system/plugin.zod.ts` |
| **Driver Interface** | ⚠️ CRITICAL | 3-4 days | 🔴 Not Started | `packages/spec/src/system/driver.zod.ts` |
| **Trigger Context** | 🟡 HIGH | 1-2 days | 🔴 Not Started | `packages/spec/src/data/trigger.zod.ts` |

**Total Estimated Effort**: 7-11 days (1 developer) or 2-3 days (4 developers in parallel)

---

## 1️⃣ Field Widget Contract

**File**: `packages/spec/src/ui/widget.zod.ts`

### Purpose
Define the standard interface for custom field components so third-party developers can build reusable UI widgets (e.g., map picker, color selector, signature pad).

### Step-by-Step Implementation

#### Step 1: Create the file
```bash
touch packages/spec/src/ui/widget.zod.ts
```

#### Step 2: Define the Zod schema
```typescript
import { z } from 'zod';
import { FieldSchema } from '../data/field.zod';

/**
 * Field Widget Props
 * Standard interface for all custom field components.
 */
export const FieldWidgetPropsSchema = z.object({
  /** Current field value */
  value: z.any().describe('Current field value'),
  
  /** Value change handler */
  onChange: z.function()
    .args(z.any())
    .returns(z.void())
    .describe('Called when value changes'),
  
  /** Read-only mode */
  readonly: z.boolean().default(false).describe('Whether field is read-only'),
  
  /** Required field indicator */
  required: z.boolean().default(false).describe('Whether field is required'),
  
  /** Validation error message */
  error: z.string().optional().describe('Validation error message to display'),
  
  /** Field metadata */
  field: FieldSchema.describe('Complete field metadata from Object definition'),
  
  /** Full record context (optional) */
  record: z.record(z.any()).optional().describe('Full record data for context-aware widgets'),
  
  /** Widget-specific options */
  options: z.record(z.any()).optional().describe('Custom configuration for this widget type'),
});

export type FieldWidgetProps = z.infer<typeof FieldWidgetPropsSchema>;

/**
 * Field Widget Definition
 * Metadata for registering a custom widget.
 */
export const FieldWidgetSchema = z.object({
  /** Unique widget identifier */
  name: z.string().regex(/^[a-z_][a-z0-9_]*$/).describe('Widget name (snake_case)'),
  
  /** Display label */
  label: z.string().describe('Human-readable label'),
  
  /** Description */
  description: z.string().optional().describe('Widget description'),
  
  /** Compatible field types */
  compatibleWith: z.array(z.string()).describe('List of field types this widget supports'),
  
  /** Default options */
  defaultOptions: z.record(z.any()).optional().describe('Default configuration options'),
  
  /** Widget component path */
  component: z.string().describe('Path to widget component (e.g., "./widgets/MapPicker")'),
});

export type FieldWidget = z.infer<typeof FieldWidgetSchema>;
```

#### Step 3: Export from index
Edit `packages/spec/src/index.ts`:
```typescript
// Add this line
export * from './ui/widget.zod';
```

#### Step 4: Create tests
Create `packages/spec/src/ui/widget.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { FieldWidgetPropsSchema, FieldWidgetSchema } from './widget.zod';

describe('FieldWidgetPropsSchema', () => {
  it('should validate valid widget props', () => {
    const props = {
      value: 'test value',
      onChange: () => {},
      readonly: false,
      required: true,
    };
    
    expect(() => FieldWidgetPropsSchema.parse(props)).not.toThrow();
  });
  
  it('should allow optional fields', () => {
    const props = {
      value: null,
      onChange: () => {},
    };
    
    const result = FieldWidgetPropsSchema.parse(props);
    expect(result.readonly).toBe(false); // default
    expect(result.required).toBe(false); // default
  });
});

describe('FieldWidgetSchema', () => {
  it('should validate valid widget definition', () => {
    const widget = {
      name: 'map_picker',
      label: 'Map Picker',
      compatibleWith: ['location', 'address'],
      component: './widgets/MapPicker',
    };
    
    expect(() => FieldWidgetSchema.parse(widget)).not.toThrow();
  });
  
  it('should enforce snake_case naming', () => {
    const widget = {
      name: 'MapPicker', // Invalid: not snake_case
      label: 'Map Picker',
      compatibleWith: ['location'],
      component: './widgets/MapPicker',
    };
    
    expect(() => FieldWidgetSchema.parse(widget)).toThrow();
  });
});
```

#### Step 5: Build and verify
```bash
cd packages/spec
pnpm build
pnpm test
```

#### Step 6: Create documentation example
Create `content/docs/references/ui/widgets/FieldWidget.mdx`:
```mdx
---
title: Field Widget
description: Custom field component interface
---

## Overview

The `FieldWidget` protocol defines how to create custom field components that integrate seamlessly with ObjectUI forms.

## Schema

<TypeTable type="FieldWidget" />

## Example: Map Picker Widget

```typescript
import { FieldWidget } from '@objectstack/spec';

export const MapPickerWidget: FieldWidget = {
  name: 'map_picker',
  label: 'Map Picker',
  description: 'Select location on Google Maps',
  compatibleWith: ['location', 'address'],
  component: './widgets/MapPicker',
  defaultOptions: {
    zoom: 12,
    mapType: 'roadmap',
  },
};
```

## Usage in Field Definition

```typescript
import { Field } from '@objectstack/spec';

export const locationField: Field = {
  name: 'store_location',
  type: 'location',
  label: 'Store Location',
  widget: 'map_picker', // Use custom widget
  widgetOptions: {
    zoom: 15,
    showStreetView: true,
  },
};
```

## Implementing a Widget Component (React)

```typescript
import { FieldWidgetProps } from '@objectstack/spec';

export function MapPicker(props: FieldWidgetProps) {
  const { value, onChange, readonly, field, options } = props;
  
  return (
    <div className="map-picker">
      <GoogleMap
        center={value}
        zoom={options?.zoom || 12}
        onClick={(e) => !readonly && onChange(e.latLng)}
      />
    </div>
  );
}
```
```

---

## 2️⃣ Plugin Lifecycle Interface

**File**: `packages/spec/src/system/plugin.zod.ts`

### Purpose
Define the contract between ObjectOS and all plugins, enabling a plugin ecosystem.

### Implementation
```typescript
import { z } from 'zod';

/**
 * Plugin Runtime Context
 * API surface available to all plugin code.
 */
export const PluginContextSchema = z.object({
  /** ObjectQL data access API */
  ql: z.any().describe('ObjectQL API for querying and mutating data'),
  
  /** ObjectOS system API */
  os: z.any().describe('System API for accessing runtime features'),
  
  /** Logger instance */
  logger: z.any().describe('Logging interface'),
  
  /** Metadata registry */
  metadata: z.any().describe('Access to object/field definitions'),
  
  /** Event bus */
  events: z.any().describe('Pub/sub event system'),
  
  /** Plugin configuration */
  config: z.record(z.any()).optional().describe('Plugin-specific configuration'),
});

export type PluginContext = z.infer<typeof PluginContextSchema>;

/**
 * Plugin Lifecycle Hooks
 */
export const PluginLifecycleSchema = z.object({
  /** Called when plugin is first installed */
  onInstall: z.function()
    .args(PluginContextSchema)
    .returns(z.promise(z.void()))
    .optional()
    .describe('Setup initial data, migrations'),
  
  /** Called when plugin is enabled */
  onEnable: z.function()
    .args(PluginContextSchema)
    .returns(z.promise(z.void()))
    .optional()
    .describe('Register hooks, start services'),
  
  /** Called when plugin is disabled */
  onDisable: z.function()
    .args(PluginContextSchema)
    .returns(z.promise(z.void()))
    .optional()
    .describe('Cleanup, stop services'),
  
  /** Called before plugin is uninstalled */
  onUninstall: z.function()
    .args(PluginContextSchema)
    .returns(z.promise(z.void()))
    .optional()
    .describe('Remove data, cleanup'),
  
  /** Called during version upgrade */
  onUpgrade: z.function()
    .args(PluginContextSchema, z.string(), z.string()) // (ctx, fromVersion, toVersion)
    .returns(z.promise(z.void()))
    .optional()
    .describe('Run migrations between versions'),
});

export type PluginLifecycle = z.infer<typeof PluginLifecycleSchema>;

/**
 * Plugin Interface
 * Main plugin export.
 */
export const PluginSchema = z.object({
  /** Plugin metadata */
  name: z.string().describe('Plugin name'),
  version: z.string().describe('Plugin version'),
  
  /** Lifecycle hooks */
  lifecycle: PluginLifecycleSchema.optional(),
  
  /** Plugin exports */
  exports: z.record(z.any()).optional().describe('Public API exposed by plugin'),
});

export type Plugin = z.infer<typeof PluginSchema>;
```

### Tests
```typescript
describe('PluginLifecycleSchema', () => {
  it('should validate plugin with lifecycle hooks', async () => {
    const plugin: Plugin = {
      name: 'my-plugin',
      version: '1.0.0',
      lifecycle: {
        onInstall: async (ctx) => {
          // Run migrations
          await ctx.ql.create('my_table', { name: 'Setup' });
        },
        onEnable: async (ctx) => {
          ctx.logger.info('Plugin enabled');
        },
      },
    };
    
    expect(() => PluginSchema.parse(plugin)).not.toThrow();
  });
});
```

---

## 3️⃣ Driver Interface

**File**: `packages/spec/src/system/driver.zod.ts`

### Purpose
Standardize database driver implementation so ObjectQL can work with any database.

### Implementation
```typescript
import { z } from 'zod';

/**
 * Driver Capabilities
 */
export const DriverCapabilitiesSchema = z.object({
  /** Transaction support */
  transactions: z.boolean().describe('Does driver support ACID transactions?'),
  
  /** Join support */
  joins: z.boolean().describe('Does driver support SQL-style joins?'),
  
  /** Full-text search */
  fullTextSearch: z.boolean().describe('Native full-text search support'),
  
  /** JSON field support */
  jsonFields: z.boolean().describe('Can store JSON documents in fields'),
  
  /** Array field support */
  arrayFields: z.boolean().describe('Can store arrays in fields'),
  
  /** Schema evolution */
  schemaEvolution: z.boolean().describe('Can alter tables without data loss'),
});

/**
 * Query AST (from query.zod.ts)
 */
const QueryASTSchema = z.any(); // Reference existing query.zod.ts

/**
 * Driver Interface
 * All database drivers must implement this interface.
 */
export const DriverInterfaceSchema = z.object({
  /** Driver metadata */
  name: z.string().describe('Driver name (e.g., "postgres", "mongodb")'),
  version: z.string().describe('Driver version'),
  
  /** Connection */
  connect: z.function()
    .args(z.record(z.any())) // connection config
    .returns(z.promise(z.void()))
    .describe('Establish connection to database'),
  
  disconnect: z.function()
    .returns(z.promise(z.void()))
    .describe('Close connection'),
  
  /** CRUD Operations */
  find: z.function()
    .args(z.string(), QueryASTSchema) // (objectName, query)
    .returns(z.promise(z.array(z.record(z.any()))))
    .describe('Query records'),
  
  findOne: z.function()
    .args(z.string(), z.string()) // (objectName, id)
    .returns(z.promise(z.record(z.any()).nullable()))
    .describe('Get single record by ID'),
  
  create: z.function()
    .args(z.string(), z.record(z.any())) // (objectName, data)
    .returns(z.promise(z.record(z.any())))
    .describe('Insert new record'),
  
  update: z.function()
    .args(z.string(), z.string(), z.record(z.any())) // (objectName, id, data)
    .returns(z.promise(z.record(z.any())))
    .describe('Update existing record'),
  
  delete: z.function()
    .args(z.string(), z.string()) // (objectName, id)
    .returns(z.promise(z.void()))
    .describe('Delete record'),
  
  /** Bulk Operations */
  bulkCreate: z.function()
    .args(z.string(), z.array(z.record(z.any()))) // (objectName, records)
    .returns(z.promise(z.array(z.record(z.any()))))
    .describe('Bulk insert'),
  
  bulkUpdate: z.function()
    .args(z.string(), z.array(z.record(z.any()))) // (objectName, records)
    .returns(z.promise(z.array(z.record(z.any()))))
    .describe('Bulk update'),
  
  bulkDelete: z.function()
    .args(z.string(), z.array(z.string())) // (objectName, ids)
    .returns(z.promise(z.void()))
    .describe('Bulk delete'),
  
  /** Schema Management (DDL) */
  syncSchema: z.function()
    .args(z.any()) // ObjectSchema
    .returns(z.promise(z.void()))
    .describe('Create or alter table to match Object definition'),
  
  dropTable: z.function()
    .args(z.string()) // objectName
    .returns(z.promise(z.void()))
    .describe('Drop table'),
  
  /** Transaction Support (Optional) */
  beginTransaction: z.function()
    .returns(z.promise(z.any())) // transaction handle
    .optional()
    .describe('Start transaction'),
  
  commit: z.function()
    .args(z.any()) // transaction handle
    .returns(z.promise(z.void()))
    .optional()
    .describe('Commit transaction'),
  
  rollback: z.function()
    .args(z.any()) // transaction handle
    .returns(z.promise(z.void()))
    .optional()
    .describe('Rollback transaction'),
  
  /** Capabilities */
  supports: DriverCapabilitiesSchema.describe('Driver capabilities'),
});

export type DriverInterface = z.infer<typeof DriverInterfaceSchema>;
```

---

## 4️⃣ Trigger Context Protocol

**File**: `packages/spec/src/data/trigger.zod.ts`

### Purpose
Standardize the context passed to trigger code, enabling consistent business logic authoring.

### Implementation
```typescript
import { z } from 'zod';

/**
 * Trigger Timing
 */
export const TriggerTiming = z.enum(['before', 'after']);

/**
 * Trigger Action
 */
export const TriggerAction = z.enum(['insert', 'update', 'delete']);

/**
 * Trigger Context
 * Passed to all trigger functions.
 */
export const TriggerContextSchema = z.object({
  /** Operation type */
  action: TriggerAction.describe('Insert, update, or delete'),
  
  /** Timing */
  timing: TriggerTiming.describe('Before or after operation'),
  
  /** Current record data */
  doc: z.record(z.any()).describe('Current record (new values for update)'),
  
  /** Previous record data (for update/delete) */
  previousDoc: z.record(z.any()).optional().describe('Previous values before update'),
  
  /** User context */
  userId: z.string().describe('ID of user performing operation'),
  user: z.record(z.any()).describe('Full user object'),
  
  /** API access */
  ql: z.any().describe('ObjectQL API for querying other objects'),
  logger: z.any().describe('Logging interface'),
  
  /** Utilities */
  addError: z.function()
    .args(z.string(), z.string()) // (field, message)
    .returns(z.void())
    .describe('Prevent operation with validation error'),
  
  getOldValue: z.function()
    .args(z.string()) // field name
    .returns(z.any())
    .describe('Get previous value of a field'),
  
  /** Metadata */
  objectName: z.string().describe('Name of object being operated on'),
});

export type TriggerContext = z.infer<typeof TriggerContextSchema>;

/**
 * Trigger Function Type
 */
export const TriggerFunctionSchema = z.function()
  .args(TriggerContextSchema)
  .returns(z.promise(z.void()));

export type TriggerFunction = z.infer<typeof TriggerFunctionSchema>;
```

### Example Usage
```typescript
// Example trigger: Auto-populate account number before insert
export const beforeInsertAccount: TriggerFunction = async (ctx) => {
  if (!ctx.doc.account_number) {
    // Query existing accounts to get next number
    const count = await ctx.ql.count('account');
    ctx.doc.account_number = `ACC-${(count + 1).toString().padStart(6, '0')}`;
  }
  
  // Validate industry
  if (!ctx.doc.industry) {
    ctx.addError('industry', 'Industry is required');
  }
  
  ctx.logger.info(`Creating account: ${ctx.doc.name}`);
};
```

---

## ✅ Final Checklist

After implementing all 4 protocols:

- [ ] All files created in correct locations
- [ ] All schemas exported from `packages/spec/src/index.ts`
- [ ] Comprehensive tests written (80%+ coverage)
- [ ] Documentation created in `content/docs/references/`
- [ ] `pnpm build` runs successfully
- [ ] `pnpm test` passes all tests
- [ ] JSON schemas generated in `packages/spec/json-schema/`
- [ ] PR submitted with clear description

---

## 🚀 Next Steps

After completing these 4 critical protocols:

1. **Phase 1 Features**: Enhanced field types, advanced validation, query enhancements
2. **Developer Experience**: Mock data generator, interactive docs, test coverage
3. **Platform Features**: Multi-tenancy, real-time sync, marketplace

See [PRIORITIES.md](./PRIORITIES.md) for detailed sprint planning.

---

**Questions?** Open a [GitHub Discussion](https://github.com/objectstack-ai/spec/discussions)  
**Ready to contribute?** Follow the [Contribution Guide](./README.md#contribution)
