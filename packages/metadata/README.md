# @objectstack/metadata

Metadata loading, saving, and persistence for ObjectStack.

## Overview

The `@objectstack/metadata` package provides a unified interface for managing metadata across the ObjectStack ecosystem. It handles:

- **Metadata Serialization/Deserialization** - Support for JSON, YAML, TypeScript, and JavaScript formats
- **File System Operations** - Load, save, and watch metadata files
- **Validation** - Integration with Zod schemas from `@objectstack/spec`
- **Caching** - ETag-based caching for performance optimization
- **File Watching** - Development mode with automatic reload on file changes

## 🤖 AI Development Context

**Role**: Metadata IO & Persistence
**Usage**:
- Use `MetadataManager` to read/write `.object.ts`, `.view.yaml` files.
- Handles format loading (TS, JSON, YAML).

## Installation

```bash
pnpm add @objectstack/metadata
```

## Quick Start

```typescript
import { MetadataManager } from '@objectstack/metadata';
import type { ServiceObject } from '@objectstack/spec/data';

// Create manager
const manager = new MetadataManager({
  rootDir: './metadata',
  formats: ['typescript', 'json', 'yaml'],
  cache: { enabled: true, ttl: 3600 },
  watch: process.env.NODE_ENV === 'development',
});

// Load metadata
const customer = await manager.load<ServiceObject>('object', 'customer');

// Save metadata
await manager.save('object', 'project', projectObject, {
  format: 'typescript',
  prettify: true,
});

// Load multiple items
const objects = await manager.loadMany<ServiceObject>('object', {
  patterns: ['**/*.object.ts', '**/*.object.json'],
});

// Watch for changes
manager.watch('object', (event) => {
  console.log(`Object ${event.type}:`, event.name);
});
```

## API

### MetadataManager

Main class for metadata operations.

#### Constructor

```typescript
new MetadataManager(config: MetadataManagerConfig)
```

**Config options:**
- `rootDir` - Root directory for metadata files
- `formats` - Enabled serialization formats (default: `['typescript', 'json', 'yaml']`)
- `cache` - Cache configuration with `enabled` and `ttl` options
- `watch` - Enable file watching (default: `false`)
- `watchOptions` - File watcher options (`ignored`, `persistent`, `ignoreInitial`)

#### Methods

**load<T>(type: string, name: string, options?: MetadataLoadOptions): Promise<T | null>**

Load a single metadata item.

```typescript
const customer = await manager.load<ServiceObject>('object', 'customer');
```

**loadMany<T>(type: string, options?: MetadataLoadOptions): Promise<T[]>**

Load multiple metadata items matching patterns.

```typescript
const objects = await manager.loadMany<ServiceObject>('object', {
  patterns: ['**/*.object.ts'],
  limit: 100,
});
```

**save<T>(type: string, name: string, data: T, options?: MetadataSaveOptions): Promise<MetadataSaveResult>**

Save metadata to disk.

```typescript
await manager.save('object', 'customer', customerObject, {
  format: 'typescript',
  prettify: true,
  backup: true,
});
```

**exists(type: string, name: string): Promise<boolean>**

Check if metadata item exists.

```typescript
const exists = await manager.exists('object', 'customer');
```

**list(type: string): Promise<string[]>**

List all items of a type.

```typescript
const objectNames = await manager.list('object');
```

**watch(type: string, callback: WatchCallback): void**

Watch for metadata changes.

```typescript
manager.watch('object', (event) => {
  if (event.type === 'added') {
    console.log('New object:', event.name);
  }
});
```

**stopWatching(): Promise<void>**

Stop all file watching.

## Serialization Formats

### JSON

```json
{
  "name": "customer",
  "label": "Customer",
  "fields": {
    "name": { "type": "text", "label": "Name" }
  }
}
```

### YAML

```yaml
name: customer
label: Customer
fields:
  name:
    type: text
    label: Name
```

### TypeScript

```typescript
import type { ServiceObject } from '@objectstack/spec/data';

export const metadata: ServiceObject = {
  name: 'customer',
  label: 'Customer',
  fields: {
    name: { type: 'text', label: 'Name' },
  },
};

export default metadata;
```

## Architecture

The metadata package is designed as a Layer 3 package in the ObjectStack architecture:

```
@objectstack/metadata (Layer 3)
├── Dependencies:
│   ├── @objectstack/spec (validation)
│   ├── @objectstack/core (logging, DI)
│   ├── @objectstack/types (shared types)
│   ├── glob (file pattern matching)
│   ├── js-yaml (YAML support)
│   └── chokidar (file watching)
└── Used By:
    ├── @objectstack/cli (code generation)
    ├── @objectstack/runtime (manifest loading)
    └── @objectstack/objectql (registry persistence)
```

## Common Workflows

### Development Workflow with File Watching

```typescript
import { MetadataManager } from '@objectstack/metadata';

const manager = new MetadataManager({
  rootDir: './metadata',
  watch: true, // Enable file watching
  cache: { enabled: true, ttl: 3600 }
});

// Watch for changes and reload
manager.watch('object', async (event) => {
  if (event.type === 'modified' || event.type === 'added') {
    console.log(`Reloading object: ${event.name}`);
    const updated = await manager.load('object', event.name);
    
    // Notify the system to reload
    await objectQL.reloadObject(event.name, updated);
  }
});

// Hot module replacement for development
console.log('Watching metadata files for changes...');
```

### Metadata Migration Workflow

```typescript
import { MetadataManager } from '@objectstack/metadata';

async function migrateMetadata() {
  const manager = new MetadataManager({
    rootDir: './metadata'
  });
  
  // 1. Load all existing objects
  const objects = await manager.loadMany('object');
  
  // 2. Transform metadata (e.g., rename field)
  const transformed = objects.map(obj => ({
    ...obj,
    fields: Object.entries(obj.fields).reduce((acc, [key, field]) => {
      // Rename 'description' to 'notes'
      const newKey = key === 'description' ? 'notes' : key;
      acc[newKey] = field;
      return acc;
    }, {})
  }));
  
  // 3. Save with backup
  for (const obj of transformed) {
    await manager.save('object', obj.name, obj, {
      format: 'typescript',
      backup: true, // Create .bak file
      prettify: true
    });
  }
  
  console.log(`Migrated ${objects.length} objects`);
}
```

### Multi-Format Support Workflow

```typescript
import { MetadataManager } from '@objectstack/metadata';

const manager = new MetadataManager({
  rootDir: './metadata',
  formats: ['typescript', 'json', 'yaml']
});

// Load from any format - manager auto-detects
const customer = await manager.load('object', 'customer');
// Tries: customer.object.ts, customer.object.json, customer.object.yaml

// Save in preferred format
await manager.save('object', 'customer', customer, {
  format: 'typescript' // Convert to TypeScript
});

// Generate documentation from metadata
const allObjects = await manager.loadMany('object');
const docs = allObjects.map(obj => `
## ${obj.label}

**Name:** ${obj.name}

**Fields:**
${Object.entries(obj.fields).map(([name, field]) => 
  `- **${field.label}** (\`${name}\`): ${field.type}`
).join('\n')}
`).join('\n\n');

fs.writeFileSync('docs/objects.md', docs);
```

### Validation and Testing Workflow

```typescript
import { MetadataManager } from '@objectstack/metadata';
import { ObjectSchema } from '@objectstack/spec/data';

async function validateAllMetadata() {
  const manager = new MetadataManager({
    rootDir: './metadata'
  });
  
  const objects = await manager.loadMany('object');
  const errors = [];
  
  for (const obj of objects) {
    const result = ObjectSchema.safeParse(obj);
    
    if (!result.success) {
      errors.push({
        name: obj.name,
        issues: result.error.issues
      });
    }
  }
  
  if (errors.length > 0) {
    console.error('Validation errors found:');
    errors.forEach(({ name, issues }) => {
      console.error(`\n${name}:`);
      issues.forEach(issue => {
        console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
      });
    });
    process.exit(1);
  }
  
  console.log(`✅ All ${objects.length} objects validated successfully`);
}
```

### Metadata Versioning Workflow

```typescript
import { MetadataManager } from '@objectstack/metadata';
import { execSync } from 'child_process';

async function versionMetadata() {
  const manager = new MetadataManager({
    rootDir: './metadata'
  });
  
  const objects = await manager.loadMany('object');
  
  // Get git user name safely
  let modifiedBy = 'unknown';
  try {
    modifiedBy = execSync('git config user.name', { encoding: 'utf-8' }).trim();
  } catch (error) {
    console.warn('Could not get git user name, using "unknown"');
  }
  
  // Add version metadata
  const versioned = objects.map(obj => ({
    ...obj,
    metadata: {
      ...obj.metadata,
      version: '2.0.0',
      lastModified: new Date().toISOString(),
      modifiedBy
    }
  }));
  
  // Save versioned metadata
  for (const obj of versioned) {
    await manager.save('object', obj.name, obj, {
      format: 'typescript',
      prettify: true
    });
  }
  
  // Commit to version control (if git is available)
  try {
    execSync('git add metadata/', { stdio: 'inherit' });
    execSync('git commit -m "Version bump to 2.0.0"', { stdio: 'inherit' });
  } catch (error) {
    console.warn('Git commit failed, changes are staged but not committed');
  }
}
```

### Import/Export Workflow

```typescript
import { MetadataManager } from '@objectstack/metadata';

async function exportToJSON() {
  const manager = new MetadataManager({
    rootDir: './metadata'
  });
  
  // Load all metadata
  const [objects, views, apps] = await Promise.all([
    manager.loadMany('object'),
    manager.loadMany('view'),
    manager.loadMany('app')
  ]);
  
  // Create unified export
  const exportData = {
    version: '1.0.0',
    exported: new Date().toISOString(),
    objects,
    views,
    apps
  };
  
  // Save as single JSON file
  fs.writeFileSync(
    'export/metadata-export.json',
    JSON.stringify(exportData, null, 2)
  );
  
  console.log('Export complete!');
}

async function importFromJSON(filePath: string) {
  const manager = new MetadataManager({
    rootDir: './metadata'
  });
  
  const importData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  // Import objects
  for (const obj of importData.objects) {
    await manager.save('object', obj.name, obj, {
      format: 'typescript'
    });
  }
  
  // Import views
  for (const view of importData.views) {
    await manager.save('view', view.name, view, {
      format: 'typescript'
    });
  }
  
  console.log('Import complete!');
}
```

## License

MIT
