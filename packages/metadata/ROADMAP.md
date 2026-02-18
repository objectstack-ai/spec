# @objectstack/metadata — Roadmap

> **Last Updated:** 2026-02-18  
> Development roadmap for the ObjectStack Metadata Service.

## Current Status (v3.0)

### ✅ Implemented

| Feature                          | Description                                    |
|:---------------------------------|:-----------------------------------------------|
| `MetadataManager`                | Core orchestrator implementing `IMetadataService` |
| `IMetadataService` contract      | Full async service interface (30+ methods)      |
| `FilesystemLoader`               | File I/O with glob, caching, ETag, atomic writes |
| `MemoryLoader`                   | In-memory storage for tests and overrides       |
| `RemoteLoader`                   | HTTP API loader with Bearer auth                |
| `DatabaseLoader`                 | Datasource-backed persistence via `IDataDriver` |
| JSON / YAML / TypeScript serializers | Multi-format metadata serialization          |
| Overlay system (in-memory)       | Three-scope delta patches (system/platform/user) |
| Query / Search                   | Filtering, pagination, sorting by type/scope/state |
| Bulk operations                  | `bulkRegister` / `bulkUnregister` with error handling |
| Import / Export                  | Portable bundles with conflict resolution       |
| Type registry                    | 26 built-in metadata types across 6 domains    |
| Dependency tracking              | Cross-reference analysis between metadata items |
| Watch / Subscribe                | Real-time change notification via callbacks     |
| File watching (Node.js)          | Chokidar-based hot-reload for development       |
| Kernel plugin                    | `MetadataPlugin` for ObjectStack kernel integration |
| Migration executor               | ChangeSet-based DDL operations                  |
| Structural validation            | Basic name/type/label validation                |

### 🟡 Partially Implemented

| Feature                | Status                                           |
|:-----------------------|:-------------------------------------------------|
| Overlay persistence    | In-memory only — not persisted to database yet   |
| Migration executor     | `modify_field` and `rename_object` not complete  |
| Schema-level validation | Basic structural checks only — no Zod schema dispatch |

---

## Phase 1: DatabaseLoader — Datasource-Backed Persistence ✅

**Goal**: Enable metadata read/write via any configured `IDataDriver`, so that platform-scope and user-scope metadata can be stored in a database.

**Background**: The spec already defines `MetadataManagerConfig.datasource` (referencing a `DatasourceSchema.name`) and `MetadataRecordSchema` (the DB persistence envelope in `metadata-persistence.zod.ts`). The missing piece is the `DatabaseLoader` that bridges `IMetadataService` ↔ `IDataDriver`.

### Tasks

- [x] **Implement `DatabaseLoader`** (`src/loaders/database-loader.ts`)
  - Implement `MetadataLoader` interface with protocol `datasource:`
  - Accept an `IDataDriver` instance (injected at initialization)
  - Read/write to the `sys_metadata` table (configurable via `MetadataManagerConfig.tableName`)
  - Map metadata operations to `IDataDriver` CRUD methods (`find`, `findOne`, `create`, `update`, `delete`)
  - Serialize metadata payload to the `MetadataRecordSchema` envelope
  - Support multi-tenant isolation via `tenantId` filter
  - Support optimistic concurrency via `version` field
  - Support `scope` filtering (system/platform/user)
  - Implement `list()` with type filtering and pagination
  - Implement `exists()` and `stat()` via driver queries
  - Implement `save()` with upsert semantics (create or update)
  - Declare capabilities: `{ read: true, write: true, watch: false, list: true }`

- [x] **Integrate DatabaseLoader into MetadataManager**
  - Auto-configure `DatabaseLoader` when `config.datasource` + `config.driver` is set
  - `setDatabaseDriver(driver)` for deferred setup via kernel service registry
  - Loader priority: DatabaseLoader for platform/user scope, FilesystemLoader for system scope

- [x] **Schema bootstrapping**
  - Auto-create `sys_metadata` table on first use via `IDataDriver.syncSchema()`
  - Define column schema: `id`, `name`, `type`, `namespace`, `scope`, `metadata` (JSON), `state`, `version`, `tenant_id`, audit fields
  - Idempotent — only calls syncSchema once per loader instance

- [x] **Tests**
  - Unit tests with mock IDataDriver (31 tests)
  - Integration tests for MetadataManager + DatabaseLoader (9 tests)
  - Error handling and fallback behavior tests

### Spec Dependencies (Already Defined)

| Spec                              | What It Provides                         |
|:----------------------------------|:-----------------------------------------|
| `MetadataManagerConfigSchema`     | `datasource`, `tableName`, `fallback` fields |
| `MetadataRecordSchema`            | DB record envelope with scope, state, version |
| `MetadataLoaderContractSchema`    | Protocol `datasource:` declaration        |
| `IDataDriver`                     | `find`, `findOne`, `create`, `update`, `delete` |
| `ISchemaDriver`                   | `createCollection`, `addColumn` for DDL   |
| `DatasourceSchema`                | Connection config with pool, SSL, retry   |

---

## Phase 2: Overlay Persistence & UI Metadata Support 🔴

**Goal**: Persist overlay customizations to the database so that admin and user customizations survive restarts, and expose APIs that the Studio UI can consume.

### Tasks

- [ ] **Persist overlays to database**
  - Store overlays as `MetadataRecord` entries with `scope: 'platform'` or `scope: 'user'`
  - Use `extends` field to reference the base system metadata
  - Use `strategy` field ('merge' or 'replace') to control overlay application
  - Add `managedBy` tracking ('package', 'platform', 'user')

- [ ] **Implement `getEffective()` with database-backed resolution**
  - Load base (system, from filesystem) → merge platform overlay (from DB) → merge user overlay (from DB)
  - Cache effective results with invalidation on overlay changes
  - Support conflict detection when base metadata is upgraded

- [ ] **REST API for metadata CRUD**
  - `GET /api/metadata/:type` — list metadata items by type
  - `GET /api/metadata/:type/:name` — get metadata item
  - `GET /api/metadata/:type/:name/effective` — get merged effective metadata
  - `PUT /api/metadata/:type/:name` — create/update metadata (platform scope)
  - `DELETE /api/metadata/:type/:name` — remove metadata
  - `GET /api/metadata/:type/:name/overlays` — list overlays
  - `PUT /api/metadata/:type/:name/overlays/:scope` — save overlay
  - `POST /api/metadata/query` — query with filters, pagination
  - `POST /api/metadata/import` / `GET /api/metadata/export` — bulk operations

- [ ] **Permission integration**
  - Scope-based access control: system (read-only), platform (admin), user (self)
  - Integrate with `IAuthService` for permission checks
  - Validate `owner` field for user-scope metadata

- [ ] **Watch / Events for database changes**
  - Implement polling-based change detection for DatabaseLoader
  - Emit `MetadataWatchEvent` when database records change
  - Support webhook notifications for external consumers

---

## Phase 3: Schema Validation & Zod Dispatch 🔴

**Goal**: Full schema validation by dispatching to the correct Zod schema based on metadata type.

### Tasks

- [ ] **Zod schema registry**
  - Map metadata type → Zod schema (e.g., `object` → `ObjectSchema`, `view` → `ViewSchema`)
  - Register schemas from `@objectstack/spec` automatically
  - Support plugin-contributed custom type schemas

- [ ] **Enhanced `validate()` method**
  - Dispatch to the correct Zod schema per metadata type
  - Return structured errors with path, message, expected/received
  - Support `strict` mode (reject unknown fields) and `lenient` mode (warn only)
  - Validate cross-references (e.g., view references a valid object)

- [ ] **Validation on write**
  - Optionally validate metadata on `register()` and `save()`
  - Configurable via `MetadataManagerConfig.validation.strict`

---

## Phase 4: Advanced Features 🔴

### 4a. Metadata Versioning & History

- [ ] Track metadata change history in the database
- [ ] Support `version` field with auto-increment on save
- [ ] Implement `getHistory(type, name)` to retrieve version timeline
- [ ] Implement `rollback(type, name, version)` to restore a previous version
- [ ] Add `checksum` field for change detection

### 4b. Package Upgrade & Three-Way Merge

- [ ] Implement three-way merge when upgrading package-delivered metadata
  - Base: previous package version
  - Ours: current platform customizations (overlays)
  - Theirs: new package version
- [ ] Merge conflict detection and resolution UI support
- [ ] Leverage `MergeStrategyConfigSchema` from spec (keep-custom, accept-incoming, three-way-merge)

### 4c. Metadata Sync & Distribution

- [ ] `pull` — download metadata from a remote ObjectStack instance
- [ ] `push` — upload local metadata to a remote instance
- [ ] Selective sync by type, namespace, or package
- [ ] Conflict detection across instances

### 4d. S3/Cloud Loader

- [ ] Implement `S3Loader` for cloud-native metadata storage
- [ ] Support `s3:` protocol in `MetadataLoaderContract`
- [ ] Integrate with object storage for large metadata bundles

---

## Phase 5: Performance & Production Readiness 🔴

- [ ] **Caching layer**
  - Implement TTL-based cache with configurable `maxSize`
  - Cache invalidation on write/overlay changes
  - Support distributed cache (Redis) for multi-instance deployments
- [ ] **Connection pooling**
  - Reuse `IDataDriver` connections efficiently
  - Handle connection failures gracefully with retry policy
- [ ] **Batch loading optimization**
  - Load multiple types in a single query where possible
  - Implement DataLoader-style batching for N+1 prevention
- [ ] **Metrics & observability**
  - Track load/save latency, cache hit rates, loader usage
  - Expose metrics via kernel observability contract

---

## Milestone Summary

| Phase | Target  | Description                                   | Status |
|:------|:--------|:----------------------------------------------|:-------|
| —     | v3.0    | Core MetadataManager, Filesystem/Memory/Remote | ✅ Done |
| 1     | v3.1    | DatabaseLoader — datasource-backed persistence | 🔴 Planned |
| 2     | v3.2    | Overlay persistence, REST API, UI support      | 🔴 Planned |
| 3     | v3.3    | Schema validation & Zod dispatch               | 🔴 Planned |
| 4     | v4.0    | Versioning, merge, sync, S3 loader             | 🔴 Planned |
| 5     | v4.1    | Caching, pooling, observability                | 🔴 Planned |

---

## Related Documents

- [Root ROADMAP](../../ROADMAP.md) — Full platform evolution (v3.0 → v5.0)
- [Studio ROADMAP](../../apps/studio/ROADMAP.md) — Visual IDE development phases
- [Metadata Service Protocol](../../content/docs/protocol/objectos/metadata-service.mdx) — Detailed protocol documentation
- [DX ROADMAP](../../docs/DX_ROADMAP.md) — Developer experience improvements
