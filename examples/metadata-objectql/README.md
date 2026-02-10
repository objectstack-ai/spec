# ObjectQL Metadata Service Example

This example demonstrates how to use ObjectQL to load and save view metadata from/to a database.

## Overview

ObjectStack supports two modes for metadata management:

1. **File-based (MetadataPlugin)**: Metadata stored in filesystem (YAML/JSON/TypeScript)
2. **Database-driven (ObjectQL)**: Metadata stored in database tables

This example shows the database-driven approach where view metadata is persisted in a database and loaded/saved through ObjectQL.

## Architecture

```
┌─────────────────┐
│  Application    │
└────────┬────────┘
         │
         ↓
┌─────────────────┐      ┌──────────────────┐
│  MetadataService│◄─────│  ObjectQL Engine │
└────────┬────────┘      └────────┬─────────┘
         │                        │
         ↓                        ↓
┌─────────────────┐      ┌──────────────────┐
│  View Metadata  │      │  Database Driver │
│   (In Memory)   │      │  (Postgres/SQL)  │
└─────────────────┘      └──────────────────┘
```

## Key Concepts

### 1. Metadata as Data

In database-driven mode, metadata (objects, views, apps, etc.) are stored as regular database records:

- **Object**: `sys_object` table
- **View**: `sys_view` table  
- **App**: `sys_app` table
- **Field**: `sys_field` table

### 2. Dual-Mode Support

ObjectQL can operate in two modes simultaneously:

1. **Registry Mode**: Fast in-memory lookups (populated at startup)
2. **Database Mode**: Persistent storage with full CRUD operations

### 3. Service Interface

Both file-based and database-driven approaches implement the same `IMetadataService` interface:

```typescript
interface IMetadataService {
  load<T>(type: string, name: string): Promise<T | null>;
  loadMany<T>(type: string): Promise<T[]>;
  save<T>(type: string, name: string, data: T): Promise<MetadataSaveResult>;
  exists(type: string, name: string): Promise<boolean>;
  list(type: string): Promise<string[]>;
}
```

## Usage Examples

See the example files:
- `src/basic-example.ts` - Basic metadata operations
- `src/view-crud.ts` - Complete view CRUD example
- `src/migration-example.ts` - Migrating from file-based to database

## Running the Examples

```bash
# Install dependencies
pnpm install

# Run basic example
pnpm run example:basic

# Run view CRUD example
pnpm run example:view-crud

# Run migration example
pnpm run example:migration
```

## Benefits of Database-Driven Metadata

1. **Multi-tenancy**: Each tenant can have isolated metadata
2. **Version Control**: Track changes with timestamps and audit logs
3. **Dynamic Updates**: Update metadata without redeploying
4. **Scalability**: Distributed caching and query optimization
5. **Integration**: Easily integrate with existing database tools

## Trade-offs

| Aspect | File-Based | Database-Driven |
|--------|------------|-----------------|
| **Version Control** | ✅ Git-friendly | ⚠️ Need custom versioning |
| **Performance** | ✅ Fast (no DB calls) | ⚠️ Network latency |
| **Multi-tenancy** | ❌ Complex | ✅ Native support |
| **Hot Reload** | ✅ File watcher | ⚠️ Need polling/webhook |
| **Setup Complexity** | ✅ Simple | ⚠️ Schema migration needed |

## Best Practices

1. **Caching**: Use ObjectQL registry for fast reads
2. **Validation**: Always validate metadata before saving
3. **Transactions**: Wrap multi-table updates in transactions
4. **Indexes**: Index frequently queried fields (type, name, owner)
5. **Audit Trail**: Track who/when metadata was changed

## See Also

- [METADATA_FLOW.md](../../docs/METADATA_FLOW.md) - Complete metadata architecture
- [ObjectQL Package](../../packages/objectql/README.md) - ObjectQL documentation
- [Metadata Package](../../packages/metadata/README.md) - Metadata service documentation
