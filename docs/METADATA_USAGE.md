# Metadata Service Usage Examples

This guide provides practical examples for using ObjectStack's metadata service in both simple and advanced modes.

## Table of Contents

- [Quick Start](#quick-start)
- [Simple Mode (ObjectQL-only)](#simple-mode-objectql-only)
- [Advanced Mode (with MetadataPlugin)](#advanced-mode-with-metadataplugin)
- [Hybrid Usage](#hybrid-usage)
- [API Integration](#api-integration)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

### Install Dependencies

```bash
npm install @objectstack/core @objectstack/objectql
# For advanced mode:
npm install @objectstack/metadata
```

---

## Simple Mode (ObjectQL-only)

Best for: Prototypes, tests, simple applications with code-defined metadata.

### Basic Setup

```typescript
// objectstack.config.ts
import { defineStack } from '@objectstack/spec';
import { ObjectQLPlugin } from '@objectstack/objectql';

export default defineStack({
  manifest: {
    id: 'my-app',
    name: 'my_app',
    version: '1.0.0',
    type: 'app'
  },
  plugins: [
    new ObjectQLPlugin(),
  ]
});
```

### Programmatically Register Metadata

```typescript
// my-plugin.ts
import { Plugin, PluginContext } from '@objectstack/core';
import { ObjectSchema } from '@objectstack/spec/data';

export class MyPlugin implements Plugin {
  name = 'com.example.my-plugin';
  type = 'standard';
  version = '1.0.0';

  init = async (ctx: PluginContext) => {
    const objectql = ctx.getService('objectql') as any;
    
    // Define object
    const accountObject: ObjectSchema = {
      name: 'account',
      label: 'Account',
      pluralLabel: 'Accounts',
      fields: {
        name: {
          name: 'name',
          label: 'Account Name',
          type: 'text',
          required: true
        },
        industry: {
          name: 'industry',
          label: 'Industry',
          type: 'select',
          options: [
            { value: 'technology', label: 'Technology' },
            { value: 'finance', label: 'Finance' }
          ]
        }
      }
    };

    // Register object
    objectql.registry.registerObject({
      packageId: 'my-plugin',
      namespace: 'crm',
      ownership: 'own',
      object: accountObject
    });
    
    ctx.logger.info('Registered account object');
  }
}
```

### Query Metadata at Runtime

```typescript
// Retrieve object definition
const objectql = kernel.getService('objectql') as any;
const accountDef = objectql.registry.getObject('crm__account');

console.log(accountDef.fields.name.label); // "Account Name"
```

---

## Advanced Mode (with MetadataPlugin)

Best for: Production apps, file-based metadata, team collaboration.

### Setup with File System

```typescript
// objectstack.config.ts
import { defineStack } from '@objectstack/spec';
import { ObjectQLPlugin } from '@objectstack/objectql';
import { MetadataPlugin } from '@objectstack/metadata';

export default defineStack({
  manifest: {
    id: 'my-app',
    name: 'my_app',
    version: '1.0.0',
    type: 'app'
  },
  plugins: [
    // IMPORTANT: MetadataPlugin MUST come BEFORE ObjectQLPlugin
    new MetadataPlugin({
      rootDir: process.cwd(),
      watch: true  // Hot reload during development
    }),
    new ObjectQLPlugin(),
  ]
});
```

### Project Structure

```
my-app/
├── objectstack.config.ts
├── objects/
│   ├── account.object.ts
│   └── contact.object.ts
├── views/
│   ├── account-list.view.yaml
│   └── contact-form.view.json
├── apps/
│   └── crm.app.ts
└── workflows/
    └── lead-nurture.workflow.yaml
```

### Define Objects in Files

**objects/account.object.ts**:
```typescript
import { ObjectSchema } from '@objectstack/spec/data';

export default {
  name: 'account',
  label: 'Account',
  pluralLabel: 'Accounts',
  description: 'Customer or prospect organization',
  icon: 'building',
  fields: {
    name: {
      name: 'name',
      label: 'Account Name',
      type: 'text',
      required: true,
      maxLength: 255
    },
    website: {
      name: 'website',
      label: 'Website',
      type: 'url'
    },
    industry: {
      name: 'industry',
      label: 'Industry',
      type: 'select',
      options: [
        { value: 'technology', label: 'Technology' },
        { value: 'finance', label: 'Finance' },
        { value: 'healthcare', label: 'Healthcare' }
      ]
    },
    annual_revenue: {
      name: 'annual_revenue',
      label: 'Annual Revenue',
      type: 'currency',
      precision: 2
    }
  },
  enable: {
    trackHistory: true,
    apiEnabled: true,
    search: true
  }
} satisfies ObjectSchema;
```

**views/account-list.view.yaml**:
```yaml
name: account_list_view
label: All Accounts
object: account
type: list
listType: grid
columns:
  - field: name
    label: Account Name
    width: 300
  - field: industry
    label: Industry
    width: 150
  - field: annual_revenue
    label: Revenue
    width: 150
    format: currency
filters:
  - field: industry
    operator: in
    values:
      - technology
      - finance
sort:
  - field: name
    direction: asc
```

### Query File-Based Metadata

```typescript
// At runtime, metadata is accessible via the metadata service
const metadataService = kernel.getService('metadata') as any;

// Load single object
const accountObj = await metadataService.load('object', 'account');
console.log(accountObj.label); // "Account"

// Load all objects
const allObjects = await metadataService.loadMany('object');
console.log(`Found ${allObjects.length} objects`);

// ObjectQL automatically syncs metadata into its registry
const objectql = kernel.getService('objectql') as any;
const accountDef = objectql.registry.getObject('account');
// Same data, fast in-memory access
```

---

## Hybrid Usage

Combine file-based and programmatic metadata:

```typescript
// objectstack.config.ts
import { defineStack } from '@objectstack/spec';
import { ObjectQLPlugin } from '@objectstack/objectql';
import { MetadataPlugin } from '@objectstack/metadata';
import { MyDynamicPlugin } from './plugins/dynamic-plugin';

export default defineStack({
  manifest: {
    id: 'hybrid-app',
    name: 'hybrid_app',
    version: '1.0.0',
    type: 'app'
  },
  plugins: [
    new MetadataPlugin({ rootDir: process.cwd(), watch: true }),
    new ObjectQLPlugin(),
    new MyDynamicPlugin(), // Can still register metadata programmatically
  ]
});
```

**plugins/dynamic-plugin.ts**:
```typescript
export class MyDynamicPlugin implements Plugin {
  name = 'com.example.dynamic';
  type = 'standard';
  version = '1.0.0';

  start = async (ctx: PluginContext) => {
    const objectql = ctx.getService('objectql') as any;
    
    // Register additional fields on file-based objects
    // This extends the 'account' object defined in objects/account.object.ts
    objectql.registry.registerObject({
      packageId: 'dynamic-plugin',
      namespace: 'custom',
      ownership: 'extend', // Extend, not own
      object: {
        name: 'account',
        fields: {
          custom_score: {
            name: 'custom_score',
            label: 'Custom Score',
            type: 'number'
          }
        }
      }
    });
    
    ctx.logger.info('Extended account object with custom field');
  }
}
```

---

## API Integration

### Express/Hono Routes

```typescript
import { Hono } from 'hono';

const app = new Hono();

// Get object definition
app.get('/api/v1/metadata/object/:name', async (c) => {
  const kernel = c.get('kernel'); // From middleware
  const metadataService = kernel.getService('metadata');
  
  const objectName = c.req.param('name');
  const object = await metadataService.load('object', objectName);
  
  if (!object) {
    return c.json({ error: 'Object not found' }, 404);
  }
  
  return c.json({ data: object });
});

// List all objects
app.get('/api/v1/metadata/objects', async (c) => {
  const kernel = c.get('kernel');
  const metadataService = kernel.getService('metadata');
  
  const objects = await metadataService.loadMany('object');
  
  return c.json({ 
    data: objects.map(obj => ({
      name: obj.name,
      label: obj.label,
      icon: obj.icon
    }))
  });
});
```

### Client-Side Usage

```typescript
// Fetch object metadata
async function getObjectDefinition(objectName: string) {
  const response = await fetch(`/api/v1/metadata/object/${objectName}`);
  const { data } = await response.json();
  return data;
}

// Use metadata to build dynamic form
const accountDef = await getObjectDefinition('account');

accountDef.fields.forEach(field => {
  // Render form field based on type
  if (field.type === 'text') {
    renderTextInput(field);
  } else if (field.type === 'select') {
    renderSelectInput(field);
  }
});
```

---

## Troubleshooting

### Error: "Service 'metadata' already registered"

**Cause**: Plugin order is wrong.

**Solution**: Ensure MetadataPlugin comes BEFORE ObjectQLPlugin:

```typescript
// ❌ Wrong
plugins: [
  new ObjectQLPlugin(),
  new MetadataPlugin(), // Too late!
]

// ✅ Correct
plugins: [
  new MetadataPlugin(),
  new ObjectQLPlugin(),
]
```

### Metadata Changes Not Reflected

**Cause**: File watching disabled or not using MetadataPlugin.

**Solution**: Enable watching in MetadataPlugin:

```typescript
new MetadataPlugin({
  rootDir: process.cwd(),
  watch: true  // Enable hot reload
})
```

### "Cannot find object" at Runtime

**Cause**: File not loaded or incorrect naming.

**Debug**:
1. Check logs for "Loaded X objects from file system"
2. Verify file naming: `{name}.object.ts`, not `{name}.ts`
3. Check file is in `objects/` directory
4. Ensure object has `name` field matching filename

### ObjectQL Registry Empty

**Cause**: MetadataPlugin loaded files but ObjectQL didn't sync.

**Debug**:
1. Check ObjectQL logs for "Syncing metadata from external service"
2. Verify both plugins are registered
3. Check plugin order (MetadataPlugin first)

---

## Performance Tips

### Simple Mode
- ✅ Fastest for runtime queries (in-memory)
- ❌ No persistence between restarts
- ❌ No file watching

### Advanced Mode
- ✅ File-based version control
- ✅ Hot reload during development
- ⚠️ Small overhead during startup (loading files)
- ✅ ObjectQL caches in registry for fast runtime queries

### Best Practice
Use Advanced Mode for development and production. The startup overhead is minimal, and the benefits (file persistence, hot reload, team collaboration) far outweigh the cost.

---

## Next Steps

- [ADR-0001: Metadata Service Architecture](./adr/0001-metadata-service-architecture.md)
- [Metadata Flow Documentation](./METADATA_FLOW.md)
- [Object Schema Reference](../packages/spec/src/data/object.zod.ts)
- [View Schema Reference](../packages/spec/src/ui/view.zod.ts)
