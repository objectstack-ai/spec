# Metadata Storage with ObjectQL

## Overview

ObjectStack metadata can be stored in databases using ObjectQL's universal data layer instead of filesystem-only storage.

## Key Concept

**ObjectQL already provides cross-database abstraction.** Instead of creating custom database drivers for metadata, we leverage ObjectQL's existing infrastructure:

- **Datasources**: Configure database connections via ObjectQL datasources
- **Objects**: Define `_framework_metadata` as an ObjectQL object  
- **CRUD Operations**: Use standard ObjectQL operations (find/insert/update/delete)

## Architecture

```
┌──────────────────────────────────────┐
│      Metadata Service                │
│  (IMetadataService)                  │
└──────────────┬───────────────────────┘
               │
               │ Uses
               ▼
┌──────────────────────────────────────┐
│      Metadata Loader                 │
│  Protocol: 'file:' or 'objectql:'   │
└──────────────┬───────────────────────┘
               │
               │ For ObjectQL loaders
               ▼
┌──────────────────────────────────────┐
│      ObjectQL Engine                 │
│  (Universal Data Layer)              │
└──────────────┬───────────────────────┘
               │
               │ Uses
               ▼
┌──────────────────────────────────────┐
│      Datasource                      │
│  (PostgreSQL, MySQL, MongoDB, etc.)  │
└──────────────────────────────────────┘
```

## Configuration

### 1. Define ObjectQL Datasource

```typescript
import { defineConfig } from '@objectstack/spec';

export default defineConfig({
  datasources: [
    {
      name: 'metadata_db',
      driver: 'postgres',
      config: {
        host: 'localhost',
        port: 5432,
        database: 'objectstack',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      },
      pool: {
        min: 2,
        max: 10,
      },
    },
  ],
});
```

### 2. Configure Metadata Loader

```typescript
metadata: {
  loaders: [
    {
      name: 'objectql-loader',
      protocol: 'objectql:',
      capabilities: {
        read: true,
        write: true,
        watch: false,
        list: true,
      },
      datasourceConfig: {
        datasource: 'metadata_db',        // References datasource above
        object: '_framework_metadata',     // ObjectQL object name
        cache: {
          enabled: true,
          ttlSeconds: 3600,
        },
      },
    },
  ],
  defaultLoader: 'objectql-loader',
}
```

### 3. Define Metadata Object Schema

The `_framework_metadata` object should be defined with these fields:

```typescript
{
  name: '_framework_metadata',
  fields: {
    id: { type: 'text', primaryKey: true },
    name: { type: 'text', required: true },
    type: { type: 'text', required: true },
    namespace: { type: 'text', default: 'default' },
    scope: { type: 'select', options: ['system', 'platform', 'user'] },
    metadata: { type: 'json', required: true },
    state: { type: 'select', options: ['draft', 'active', 'archived'] },
    createdAt: { type: 'datetime' },
    updatedAt: { type: 'datetime' },
  },
  indexes: [
    { fields: ['type', 'name'], unique: true },
    { fields: ['namespace'] },
    { fields: ['scope'] },
  ],
}
```

## Usage

### Loading Metadata

```typescript
// Through ObjectQL engine
const objectqlEngine = kernel.getService('objectql');

// Load all objects
const objects = await objectqlEngine.find('_framework_metadata', {
  where: { type: 'object' },
});

// Load specific metadata
const accountObject = await objectqlEngine.findOne('_framework_metadata', {
  where: { type: 'object', name: 'account' },
});
```

### Saving Metadata

```typescript
// Insert new metadata
await objectqlEngine.insert('_framework_metadata', {
  id: 'uuid-here',
  name: 'account',
  type: 'object',
  namespace: 'crm',
  scope: 'system',
  metadata: {
    label: 'Account',
    fields: { /* ... */ },
  },
  state: 'active',
});

// Update existing metadata
await objectqlEngine.update('_framework_metadata', id, {
  metadata: { /* updated definition */ },
  updatedAt: new Date().toISOString(),
});
```

## Benefits

### 1. No Code Duplication
- Leverages existing ObjectQL infrastructure
- No custom database drivers needed
- Reuses datasource configuration

### 2. Consistent API
- Same CRUD operations across all databases
- Standard ObjectQL query syntax
- Unified error handling

### 3. Simpler Protocol
- Just datasource + object reference
- Less configuration complexity
- Fewer moving parts

### 4. Better Architecture
- Single responsibility principle
- Clear separation of concerns
- Easier to maintain and test

## Examples

See [examples/metadata-objectql-config.example.ts](../examples/metadata-objectql-config.example.ts) for complete configuration examples including:

1. Basic PostgreSQL setup
2. MongoDB configuration
3. Hybrid file + database approach
4. Full manifest example

## Migration from Filesystem

1. **Define datasource** in manifest
2. **Configure ObjectQL loader** with datasourceConfig
3. **Define metadata object schema** (_framework_metadata)
4. **Export existing metadata** from files
5. **Import into database** via ObjectQL operations
6. **Switch default loader** to objectql-loader

## Schema Reference

### MetadataDatasourceConfigSchema

```typescript
{
  datasource: string;           // ObjectQL datasource name
  object: string;               // Object name (default: '_framework_metadata')
  cache?: {
    enabled: boolean;           // Enable caching (default: true)
    ttlSeconds: number;         // Cache TTL (default: 3600)
  };
}
```

### MetadataLoaderContract

```typescript
{
  name: string;
  protocol: 'file:' | 'objectql:' | 'http:';
  capabilities: {
    read: boolean;
    write: boolean;
    watch: boolean;
    list: boolean;
  };
  datasourceConfig?: MetadataDatasourceConfig;  // Only for ObjectQL loaders
}
```

## Supported Databases

Any database supported by ObjectQL:

- ✅ PostgreSQL
- ✅ MySQL
- ✅ MongoDB
- ✅ SQLite
- ✅ Any custom ObjectQL driver

## FAQ

### Why use ObjectQL instead of custom drivers?

ObjectQL already provides cross-database abstraction. Creating custom drivers for metadata would duplicate this logic and increase maintenance burden.

### Can I mix file and database storage?

Yes! Use hybrid mode with multiple loaders:
- File loader for system metadata (version controlled)
- ObjectQL loader for user metadata (runtime configurable)

### How does caching work?

The metadata loader can cache results in memory based on TTL. This reduces database queries for frequently accessed metadata.

### What about transactions?

ObjectQL supports transactions where the underlying database does. Metadata operations can be wrapped in transactions for ACID compliance.

## See Also

- [ObjectQL Documentation](../packages/objectql/README.md)
- [Datasource Configuration](../packages/spec/src/data/datasource.zod.ts)
- [Example Configurations](../examples/metadata-objectql-config.example.ts)
