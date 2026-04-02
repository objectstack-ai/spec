# Metadata Versioning & History

## Overview

The ObjectStack metadata system now supports comprehensive version history tracking and rollback capabilities. This feature allows administrators to:

- View complete change history for any metadata item
- Compare versions to see what changed
- Rollback to previous versions when needed
- Track who made changes and when
- Automatically clean up old history records

## Architecture

### Core Components

1. **MetadataHistoryRecordSchema** (`packages/spec/src/system/metadata-persistence.zod.ts`)
   - Defines the structure for history records
   - Includes version, checksum, operation type, change notes, and audit fields

2. **sys_metadata_history Object** (`packages/metadata/src/objects/sys-metadata-history.object.ts`)
   - System table for storing historical snapshots
   - Automatically created when history tracking is enabled

3. **DatabaseLoader History Tracking** (`packages/metadata/src/loaders/database-loader.ts`)
   - Automatically writes history records on create/update
   - Calculates SHA-256 checksums for change detection
   - Skips duplicate history records when content is unchanged

4. **MetadataManager History Methods** (`packages/metadata/src/metadata-manager.ts`)
   - `getHistory()` - Query version timeline
   - `rollback()` - Restore previous version
   - `diff()` - Compare two versions

5. **REST API Endpoints** (`packages/metadata/src/routes/history-routes.ts`)
   - `GET /api/v1/metadata/:type/:name/history` - View history
   - `POST /api/v1/metadata/:type/:name/rollback` - Rollback to version
   - `GET /api/v1/metadata/:type/:name/diff` - Compare versions

6. **Cleanup Manager** (`packages/metadata/src/utils/history-cleanup.ts`)
   - Age-based retention (maxAgeDays)
   - Count-based retention (maxVersions)
   - Automatic scheduled cleanup

## Usage

### Enable History Tracking

History tracking is enabled by default when using a DatabaseLoader:

```typescript
import { DatabaseLoader } from '@objectstack/metadata';

const dbLoader = new DatabaseLoader({
  driver: myDriver,
  trackHistory: true, // Default: true
});
```

### Query Version History

```typescript
const history = await metadataService.getHistory('object', 'account', {
  limit: 50,
  offset: 0,
  operationType: 'update',
  since: '2025-01-01T00:00:00Z',
});

console.log(`Total versions: ${history.total}`);
history.records.forEach(record => {
  console.log(`Version ${record.version} - ${record.operationType} by ${record.recordedBy} at ${record.recordedAt}`);
});
```

### Rollback to Previous Version

```typescript
const restored = await metadataService.rollback('object', 'account', 5, {
  changeNote: 'Reverting problematic changes',
  recordedBy: 'admin@example.com',
});
```

### Compare Versions

```typescript
const diff = await metadataService.diff('object', 'account', 5, 6);

console.log(`Identical: ${diff.identical}`);
console.log(`Summary: ${diff.summary}`);
console.log(`Changes: ${diff.patch.length} operations`);

diff.patch.forEach(op => {
  console.log(`${op.op} ${op.path}: ${JSON.stringify(op.value)}`);
});
```

### Configure Retention Policy

```typescript
import { HistoryCleanupManager } from '@objectstack/metadata';

const cleanupManager = new HistoryCleanupManager(
  {
    maxVersions: 100,     // Keep last 100 versions per item
    maxAgeDays: 180,      // Keep history for 6 months
    autoCleanup: true,    // Enable automatic cleanup
    cleanupIntervalHours: 24, // Run daily
  },
  dbLoader
);

// Start automatic cleanup
cleanupManager.start();

// Manual cleanup
const result = await cleanupManager.runCleanup();
console.log(`Deleted ${result.deleted} records, ${result.errors} errors`);

// Preview cleanup
const stats = await cleanupManager.getCleanupStats();
console.log(`Would delete ${stats.total} records`);

// Stop cleanup
cleanupManager.stop();
```

### REST API Examples

```bash
# Get history
curl "http://localhost:3000/api/v1/metadata/object/account/history?limit=10"

# Rollback to version 5
curl -X POST "http://localhost:3000/api/v1/metadata/object/account/rollback" \
  -H "Content-Type: application/json" \
  -d '{"version": 5, "changeNote": "Reverting changes"}'

# Compare versions
curl "http://localhost:3000/api/v1/metadata/object/account/diff?version1=5&version2=6"
```

### Register History Routes

In your Hono app:

```typescript
import { registerMetadataHistoryRoutes } from '@objectstack/metadata';

registerMetadataHistoryRoutes(app, metadataService);
```

## Implementation Details

### Checksum Calculation

- Uses SHA-256 hashing of normalized JSON
- Keys are sorted recursively for deterministic output
- Fallback to simple hash for environments without Web Crypto API

### History Record Structure

```typescript
{
  id: string;                    // UUID
  metadataId: string;            // FK to sys_metadata.id
  name: string;                  // Denormalized for queries
  type: string;                  // Denormalized for queries
  version: number;               // Version number
  operationType: 'create' | 'update' | 'publish' | 'revert' | 'delete';
  metadata: Record<string, unknown>; // Full snapshot
  checksum: string;              // SHA-256 hash
  previousChecksum?: string;     // For diff optimization
  changeNote?: string;           // Human-readable description
  tenantId?: string;             // Multi-tenant isolation
  recordedBy?: string;           // User identifier
  recordedAt: string;            // ISO datetime
}
```

### Database Schema

The `sys_metadata_history` table includes indexes for:
- `(metadata_id, version)` - Unique constraint
- `(metadata_id, recorded_at)` - Timeline queries
- `(type, name)` - Cross-type queries
- `(recorded_at)` - Age-based cleanup
- `(operation_type)` - Operation filtering
- `(tenant_id)` - Multi-tenant isolation

### Diff Algorithm

Uses a simple recursive diff algorithm that generates operations:
- `add` - New field added
- `remove` - Field removed
- `replace` - Field value changed

The diff result includes:
- Array of change operations
- Human-readable summary (e.g., "2 fields added, 1 field modified")

## Performance Considerations

- History records are written synchronously as part of each save operation, ensuring consistency between metadata state and the history timeline
- Checksum deduplication prevents storing identical versions
- Indexes optimize common query patterns
- Automatic cleanup prevents unbounded growth
- History queries default to 50 records with pagination

## Comparison with Other Platforms

| Platform | Version Control | History Duration |
|----------|----------------|------------------|
| Salesforce | Setup Audit Trail | 6 months |
| ServiceNow | Update Sets + Versions | Unlimited |
| ObjectStack | sys_metadata_history | Configurable |

## Future Enhancements

- [ ] Export/import history bundles
- [ ] Visual diff UI in Studio
- [ ] Change request workflow integration
- [ ] History annotations and tagging
- [ ] Merge conflict resolution
- [ ] Branch/fork metadata workflow
