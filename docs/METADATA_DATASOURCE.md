# Metadata Datasource Protocol

## Overview

The Metadata Datasource Protocol enables ObjectStack metadata (Objects, Views, Flows, etc.) to be stored and managed in any database instead of being locked to filesystem-based storage. This provides flexibility, scalability, and enables dynamic metadata management without deployment.

## Key Features

### 1. Datasource Agnostic
- Works with any configured datasource (PostgreSQL, MySQL, MongoDB, etc.)
- No driver lock-in - switch between databases without code changes
- Leverages existing datasource infrastructure

### 2. Schema Flexible
- Supports both structured (SQL) and schemaless (NoSQL) stores
- Configurable table/collection names and column mappings
- Automatic schema migration support

### 3. Performance Optimized
- Built-in caching layer with configurable TTL
- Batch operations for bulk metadata updates
- Query optimization with indexes and pagination
- Parallel loading support for multiple metadata types

### 4. Transaction Safe
- ACID compliance where supported by datasource
- Configurable isolation levels
- Automatic retry on conflicts
- Rollback support for failed operations

## Architecture

### Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Metadata Service                         │
│  (IMetadataService - register/get/list/unregister)         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Uses
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  Metadata Loader                            │
│  Protocol: 'file:', 'http:', 's3:', 'database:'           │
│  + MetadataLoaderContract                                   │
│  + MetadataDatasourceConfig (optional)                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ For database loaders
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Metadata Driver (Database)                     │
│  + MetadataDriverConfig                                     │
│  + MetadataTableSchema                                      │
│  + Query/Bulk/Migration Operations                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Uses
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Datasource                               │
│  (PostgreSQL, MySQL, MongoDB, etc.)                        │
└─────────────────────────────────────────────────────────────┘
```

## Configuration

### 1. Datasource Configuration

First, configure a datasource in your manifest:

```typescript
import { DatasourceSchema } from '@objectstack/spec';

const datasource = DatasourceSchema.parse({
  name: 'metadata_db',
  driver: 'postgres',
  config: {
    host: 'localhost',
    port: 5432,
    database: 'objectstack_metadata',
    user: 'admin',
    password: process.env.DB_PASSWORD,
  },
  pool: {
    min: 2,
    max: 10,
  },
});
```

### 2. Metadata Loader Configuration

Configure a database-backed metadata loader:

```typescript
import { MetadataLoaderContractSchema } from '@objectstack/spec';

const loader = MetadataLoaderContractSchema.parse({
  name: 'database-loader',
  protocol: 'database:',
  capabilities: {
    read: true,
    write: true,
    watch: false,  // File watching not supported for DB
    list: true,
  },
  datasourceConfig: {
    datasource: 'metadata_db',
    table: '_framework_metadata',
    schema: 'public',
    autoMigrate: true,
    cache: {
      enabled: true,
      ttlSeconds: 3600,
      invalidateOnWrite: true,
    },
    queryOptions: {
      batchSize: 100,
      useIndexes: true,
      parallelLoad: false,
    },
  },
});
```

### 3. Metadata Driver Configuration

For advanced scenarios, configure the metadata driver directly:

```typescript
import { MetadataDriverConfigSchema } from '@objectstack/spec';

const driverConfig = MetadataDriverConfigSchema.parse({
  datasource: 'metadata_db',
  
  tableSchema: {
    name: 'metadata',
    schema: 'public',
    primaryKey: 'id',
    indexes: [
      {
        name: 'idx_type_name',
        fields: ['type', 'name'],
        unique: true,
      },
      {
        name: 'idx_namespace',
        fields: ['namespace'],
        unique: false,
      },
    ],
    columnMapping: {
      id: 'metadata_id',
      name: 'metadata_name',
      type: 'metadata_type',
      // ... other mappings
    },
  },
  
  migration: {
    autoMigrate: true,
    dropOnMigrate: false,
    backupBeforeMigrate: true,
  },
  
  performance: {
    batchSize: 200,
    enableCache: true,
    cacheTtlSeconds: 7200,
    prefetchOnInit: true,
    parallelLoad: true,
  },
  
  transaction: {
    defaultIsolation: 'read_committed',
    timeout: 30000,
    retryOnConflict: true,
    maxRetries: 3,
  },
  
  query: {
    useIndexes: true,
    maxResultSize: 10000,
    enablePagination: true,
    defaultPageSize: 100,
  },
});
```

## Usage

### Loading Metadata

```typescript
import { MetadataLoadOptionsSchema } from '@objectstack/spec';

// Load from database
const options = MetadataLoadOptionsSchema.parse({
  datasource: 'metadata_db',
  filters: {
    type: 'object',
    namespace: 'crm',
  },
  sort: {
    field: 'name',
    order: 'asc',
  },
  limit: 100,
});

const result = await metadataLoader.load('object', 'account', options);
```

### Saving Metadata

```typescript
import { MetadataSaveOptionsSchema } from '@objectstack/spec';

const options = MetadataSaveOptionsSchema.parse({
  datasource: 'metadata_db',
  transaction: {
    enabled: true,
    isolationLevel: 'serializable',
  },
  onConflict: 'update',  // or 'error', 'skip', 'replace'
});

await metadataLoader.save('object', accountMetadata, options);
```

### Querying Metadata

```typescript
import { MetadataQueryOptionsSchema } from '@objectstack/spec';

const queryOptions = MetadataQueryOptionsSchema.parse({
  filters: {
    type: ['object', 'view'],
    namespace: 'crm',
    scope: 'system',
    state: 'active',
  },
  sort: [
    { field: 'name', order: 'asc' },
    { field: 'createdAt', order: 'desc' },
  ],
  pagination: {
    page: 1,
    pageSize: 50,
  },
  select: ['id', 'name', 'type', 'metadata'],
  includeArchived: false,
});

const results = await metadataDriver.query(queryOptions);
```

### Bulk Operations

```typescript
import { MetadataBulkOperationSchema } from '@objectstack/spec';

const bulkOp = MetadataBulkOperationSchema.parse({
  operation: 'upsert',
  records: [
    { id: '1', name: 'account', type: 'object', metadata: {...} },
    { id: '2', name: 'contact', type: 'object', metadata: {...} },
    // ... more records
  ],
  batch: {
    size: 50,
    parallel: true,
    continueOnError: false,
  },
  transactional: true,
});

await metadataDriver.bulkOperation(bulkOp);
```

### Schema Migration

```typescript
import { MetadataMigrationOperationSchema } from '@objectstack/spec';

const migration = MetadataMigrationOperationSchema.parse({
  type: 'alter',
  table: 'metadata',
  script: 'ALTER TABLE metadata ADD COLUMN version INTEGER DEFAULT 1',
  rollbackScript: 'ALTER TABLE metadata DROP COLUMN version',
  dryRun: false,
});

await metadataDriver.migrate(migration);
```

## Table Schema

The default metadata table schema:

```sql
CREATE TABLE _framework_metadata (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  namespace VARCHAR(255) DEFAULT 'default',
  scope VARCHAR(50) DEFAULT 'platform',
  metadata JSONB NOT NULL,
  extends VARCHAR(255),
  strategy VARCHAR(50) DEFAULT 'merge',
  owner VARCHAR(255),
  state VARCHAR(50) DEFAULT 'active',
  created_by VARCHAR(255),
  created_at TIMESTAMP,
  updated_by VARCHAR(255),
  updated_at TIMESTAMP,
  
  CONSTRAINT unique_type_name UNIQUE (type, name)
);

CREATE INDEX idx_namespace ON _framework_metadata(namespace);
CREATE INDEX idx_type ON _framework_metadata(type);
CREATE INDEX idx_scope ON _framework_metadata(scope);
CREATE INDEX idx_state ON _framework_metadata(state);
```

## Best Practices

### 1. Choose the Right Storage Strategy

- **Filesystem**: Best for version-controlled metadata that changes with deployments
- **Database**: Best for runtime-configurable metadata (user views, personal dashboards)
- **Hybrid**: System metadata in files, user metadata in database

### 2. Cache Configuration

- Enable caching for read-heavy workloads
- Set appropriate TTL based on update frequency
- Invalidate cache on writes for consistency

### 3. Transaction Isolation

- Use `read_committed` for most scenarios (default)
- Use `serializable` for critical metadata updates
- Consider retry logic for conflict resolution

### 4. Performance Optimization

- Create indexes on frequently queried fields
- Use batch operations for bulk updates
- Enable parallel loading for faster initialization
- Tune pagination size based on network latency

### 5. Migration Safety

- Always backup before migrations
- Test migrations in staging first
- Use dry-run mode to validate scripts
- Keep rollback scripts ready

## Security Considerations

### 1. Access Control

Metadata in databases should respect the same access control as filesystem:
- System metadata: Read-only at runtime
- Platform metadata: Admin-configurable
- User metadata: User-specific access

### 2. Encryption

Configure datasource-level encryption:

```typescript
datasource: {
  name: 'metadata_db',
  config: {
    ssl: true,
    sslMode: 'require',
  },
}
```

### 3. Credentials Management

Never hardcode credentials:

```typescript
config: {
  password: process.env.DB_PASSWORD,
  // or use secrets management
  password: await secretsManager.get('DB_PASSWORD'),
}
```

## Troubleshooting

### Issue: Metadata not loading from database

**Check:**
1. Datasource is configured and active
2. Loader has correct datasource reference
3. Database credentials are valid
4. Network connectivity to database

### Issue: Poor query performance

**Solutions:**
1. Add indexes on frequently queried fields
2. Reduce batch size if memory constrained
3. Enable query result caching
4. Use field selection to reduce data transfer

### Issue: Transaction conflicts

**Solutions:**
1. Enable retry on conflict
2. Increase max retries
3. Reduce transaction isolation level
4. Use optimistic locking for concurrent updates

## Migration Guide

### From Filesystem to Database

1. **Export existing metadata:**

```typescript
await metadataManager.export({
  output: '/tmp/metadata-backup.json',
  format: 'json',
});
```

2. **Configure database loader:**

```typescript
const dbLoader = {
  name: 'database-loader',
  protocol: 'database:',
  datasourceConfig: {
    datasource: 'metadata_db',
    autoMigrate: true,
  },
};
```

3. **Import metadata:**

```typescript
await metadataManager.import({
  source: '/tmp/metadata-backup.json',
  strategy: 'merge',
  validate: true,
});
```

## Examples

See the test files for comprehensive examples:
- `packages/spec/src/data/driver/metadata-driver.test.ts`
- `packages/spec/src/system/metadata-persistence.test.ts`

## API Reference

For detailed schema definitions, see:
- `packages/spec/src/data/driver/metadata-driver.zod.ts`
- `packages/spec/src/system/metadata-persistence.zod.ts`
- `packages/spec/src/data/datasource.zod.ts`
