# ADR-0002: Database-Driven Metadata Storage Pattern

**Status:** Proposed  
**Date:** 2025-02-10  
**Decision Makers:** ObjectStack Engineering Team  
**Related:** [ADR-0001](./0001-metadata-service-architecture.md)

---

## Context

ObjectStack supports two metadata provision modes:

1. **File-based** (via MetadataPlugin) - Metadata stored as files (YAML/JSON/TypeScript)
2. **In-memory** (via ObjectQL) - Metadata registered programmatically

While these modes work well for development and simple deployments, production applications often require:

- **Multi-tenancy**: Isolated metadata per tenant
- **Dynamic updates**: Modify metadata without code deployment
- **Audit trails**: Track who changed what and when
- **Scalability**: Distributed caching and query optimization
- **Programmatic generation**: Create metadata via APIs or automation

This ADR proposes a **database-driven metadata storage pattern** that extends ObjectQL to persist metadata in database tables while maintaining compatibility with existing file-based and in-memory modes.

---

## Decision

We will support **database-driven metadata storage** as a third mode by:

1. **Defining metadata storage objects** (`sys_metadata`, `sys_view`, etc.) using ObjectQL's own schema definition
2. **Storing metadata as JSON** in database tables alongside application data
3. **Maintaining dual-layer architecture**:
   - **Persistence Layer**: Database tables (CRUD via ObjectQL)
   - **Registry Layer**: In-memory cache (fast reads)
4. **Keeping backward compatibility** with file-based and in-memory modes

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Application Layer                     │
└────────────────────────┬────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────┐
│              IMetadataService Interface                  │
│  - load(type, name)                                      │
│  - save(type, name, data)                                │
│  - loadMany(type)                                        │
└────┬────────────────────────┬─────────────────┬─────────┘
     │                        │                 │
     ↓                        ↓                 ↓
┌─────────────┐      ┌─────────────┐   ┌──────────────┐
│ MetadataPlugin │      │ ObjectQL    │   │ Database     │
│ (File-based) │      │ (Registry)  │   │ (Persistent) │
└─────────────┘      └─────────────┘   └──────────────┘
     │                        │                 │
     ↓                        ↓                 ↓
Filesystem              Memory              SQL Tables
```

### Metadata Storage Schema

All metadata types use a **generic storage table**:

```typescript
// sys_metadata table
{
  type: 'view' | 'object' | 'app' | 'flow' | ...,
  name: string,              // Unique within type
  data: JSON,                // Full metadata definition
  version: number,           // Versioning support
  checksum: string,          // MD5 hash for change detection
  source: 'filesystem' | 'database' | 'api' | 'migration',
  is_active: boolean,
  owner: string,             // User who created/owns this metadata
  tenant_id?: string,        // For multi-tenancy
  tags: string[],            // Classification
  created_at: timestamp,
  updated_at: timestamp,
}
```

**Indexes:**
- PRIMARY KEY: (type, name)
- INDEX: (type, is_active)
- INDEX: (tenant_id, type) -- for multi-tenancy

### Implementation Pattern

#### 1. Define Storage Object

```typescript
import { ObjectSchema, Field } from '@objectstack/spec/data';

const SysMetadata = ObjectSchema.create({
  name: 'sys_metadata',
  label: 'System Metadata',
  
  fields: {
    type: Field.text({ required: true }),
    name: Field.text({ required: true }),
    data: Field.json({ required: true }),
    version: Field.number({ defaultValue: 1 }),
    checksum: Field.text(),
    is_active: Field.boolean({ defaultValue: true }),
  },
  
  indexes: [
    { fields: ['type', 'name'], unique: true }
  ]
});

objectql.registerObject(SysMetadata);
```

#### 2. Save Metadata

```typescript
async function saveViewMetadata(
  objectql: ObjectQL,
  viewName: string,
  viewDef: View
) {
  const checksum = calculateChecksum(viewDef);
  
  const record = {
    type: 'view',
    name: viewName,
    data: viewDef,
    checksum,
    is_active: true,
  };
  
  // Upsert pattern
  const existing = await objectql.findOne('sys_metadata', {
    filters: [['type', '=', 'view'], ['name', '=', viewName]]
  });
  
  if (existing) {
    return objectql.update('sys_metadata', existing._id, record);
  } else {
    return objectql.insert('sys_metadata', record);
  }
}
```

#### 3. Load Metadata

```typescript
async function loadViewMetadata(
  objectql: ObjectQL,
  viewName: string
): Promise<View | null> {
  const result = await objectql.findOne('sys_metadata', {
    filters: [
      ['type', '=', 'view'],
      ['name', '=', viewName'],
      ['is_active', '=', true]
    ]
  });
  
  return result?.data || null;
}
```

#### 4. Hybrid Service (Fallback Chain)

```typescript
class HybridMetadataService implements IMetadataService {
  async load(type: string, name: string) {
    // 1. Try database first
    const fromDb = await this.loadFromDatabase(type, name);
    if (fromDb) return fromDb;
    
    // 2. Fall back to registry
    const fromRegistry = this.objectql.registry.getItem(type, name);
    if (fromRegistry) return fromRegistry;
    
    // 3. Fall back to filesystem
    return this.fileLoader.load(type, name);
  }
}
```

---

## Consequences

### Positive

1. **Multi-tenancy Support**
   - Each tenant has isolated metadata via `tenant_id` field
   - No file system access required
   - Database-level isolation and security

2. **Dynamic Updates**
   - Modify metadata via API without redeployment
   - Instant propagation to all app instances
   - No file system locking issues

3. **Audit Trail**
   - Full history tracking via `created_at`, `updated_at`, `version`
   - Know who changed what and when
   - Compliance-friendly

4. **Scalability**
   - Database replication for high availability
   - Query optimization via indexes
   - Distributed caching strategies

5. **Programmatic Generation**
   - AI agents can generate metadata dynamically
   - Import/export via APIs
   - Bulk operations support

6. **Unified Data Model**
   - Metadata is data, use same query engine
   - Join metadata with application data
   - Single backup/restore process

### Negative

1. **Performance Overhead**
   - Database queries slower than memory access
   - Mitigation: Cache in ObjectQL registry after load

2. **Schema Migration Complexity**
   - Database schema changes require migrations
   - Mitigation: Use JSON field for flexibility

3. **Version Control Challenges**
   - Metadata not in Git by default
   - Mitigation: Export to files for version control

4. **Additional Setup**
   - Requires database schema creation
   - Mitigation: Auto-create tables on first run

### Neutral

1. **Backward Compatibility**
   - All existing modes still work (file-based, in-memory)
   - New mode is opt-in, not mandatory

2. **Interface Consistency**
   - Same `IMetadataService` interface for all modes
   - Applications don't need to change code

---

## Implementation Checklist

- [x] Define metadata storage schema (`sys_metadata`)
- [x] Create example implementations
  - [x] `view-crud.ts` - Basic CRUD operations
  - [x] `migration-example.ts` - Filesystem to database migration
  - [x] `basic-example.ts` - Usage patterns
- [ ] Add API endpoints for metadata mutations
  - [ ] POST `/api/v1/metadata/views`
  - [ ] PUT `/api/v1/metadata/views/:name`
  - [ ] DELETE `/api/v1/metadata/views/:name`
- [ ] Extend `@objectstack/client` with mutation methods
- [ ] Add caching layer (Redis/In-memory)
- [ ] Implement access control (RBAC)
- [ ] Create migration tools
- [ ] Add comprehensive tests
- [ ] Document best practices

---

## Alternatives Considered

### Alternative 1: Dedicated Metadata Database

**Approach:** Use separate database/schema for metadata

**Pros:**
- Clear separation of concerns
- Independent scaling

**Cons:**
- Increased complexity (two databases)
- Harder to join with application data
- More operational overhead

**Decision:** ❌ Rejected - Adds unnecessary complexity

### Alternative 2: Hybrid Files + Database

**Approach:** Store metadata in both files and database

**Pros:**
- Version control friendly
- Database for runtime

**Cons:**
- Sync issues between sources
- Double maintenance burden
- Conflict resolution complexity

**Decision:** ✅ Partially Adopted - Support as migration path, not permanent state

### Alternative 3: External Metadata Service

**Approach:** Dedicated microservice for metadata management

**Pros:**
- Service isolation
- Independent deployment

**Cons:**
- Network latency
- Additional service to maintain
- More complex architecture

**Decision:** ❌ Rejected - Over-engineering for most use cases

---

## Migration Path

### From File-based to Database

1. **Phase 1: Read from both**
   ```typescript
   // Database takes precedence, files as fallback
   const metadata = await loadFromDatabase(type, name)
     || await loadFromFilesystem(type, name);
   ```

2. **Phase 2: Write to both**
   ```typescript
   // Sync to database, keep files for VCS
   await saveToDatabase(type, name, data);
   await saveToFilesystem(type, name, data);
   ```

3. **Phase 3: Database-primary**
   ```typescript
   // Database is source of truth
   // Files generated via export for VCS
   await saveToDatabase(type, name, data);
   await exportToFilesystem(); // CI/CD job
   ```

### From Database to Files

Use export functionality:

```bash
# Export all metadata to files
objectstack metadata export --output ./metadata --format typescript

# Generates:
# ./metadata/objects/*.object.ts
# ./metadata/views/*.view.yaml
# ./metadata/apps/*.app.ts
```

---

## Examples

Complete working examples are available in:

- `examples/metadata-objectql/src/view-crud.ts`
- `examples/metadata-objectql/src/migration-example.ts`
- `examples/metadata-objectql/src/basic-example.ts`

See `examples/metadata-objectql/README.md` for details.

---

## References

- [METADATA_FLOW.md](../METADATA_FLOW.md) - Metadata architecture overview
- [METADATA_SERVICE_EVALUATION.md](../METADATA_SERVICE_EVALUATION.md) - Impact assessment
- [ADR-0001](./0001-metadata-service-architecture.md) - Original metadata service design
- [ObjectQL Package](../../packages/objectql/README.md)
- [Metadata Package](../../packages/metadata/README.md)

---

## Decision Log

| Date | Change | Reason |
|------|--------|--------|
| 2025-02-10 | Initial proposal | Support multi-tenant and dynamic metadata |

---

**Status Update History:**
- 2025-02-10: Proposed (awaiting team review)
