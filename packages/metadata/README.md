# @objectstack/metadata

Metadata loading, saving, and persistence for ObjectStack.

## Overview

The `@objectstack/metadata` package provides a unified interface for managing metadata across the ObjectStack ecosystem. It handles:

- **Metadata Serialization/Deserialization** - Support for JSON, YAML, TypeScript, and JavaScript formats
- **File System Operations** - Load, save, and watch metadata files
- **Validation** - Integration with Zod schemas from `@objectstack/spec`
- **Caching** - ETag-based caching for performance optimization
- **File Watching** - Development mode with automatic reload on file changes

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

## License

MIT
