# Schema Design — Object Schema Reference

> Auto-derived from `packages/spec/src/data/object.zod.ts` and `validation.zod.ts`.
> This file is for quick reference only. The Zod source is the single source of truth.

## Object Required Properties

| Property | Type | Convention | Description |
|:---------|:-----|:-----------|:------------|
| `name` | string | `snake_case` | Immutable machine identifier (`/^[a-z_][a-z0-9_]*$/`) |
| `fields` | map | keys in `snake_case` | Field definitions keyed by field name |

## Object Optional Properties

| Property | Default | Description |
|:---------|:--------|:------------|
| `label` | Auto from `name` | Human-readable singular label |
| `pluralLabel` | — | Plural form (e.g., "Accounts") |
| `namespace` | — | Domain prefix; auto-derives `tableName` as `{namespace}_{name}` |
| `datasource` | `'default'` | Target datasource ID |
| `displayNameField` | `'name'` | Field used as record display name |
| `enable` | — | Capability flags (see below) |
| `validations` | — | Validation rule array |
| `indexes` | — | Index definitions |
| `ownership` | `'own'` | `own` (new object) or `extend` (extending existing) |

## Object Capabilities (`enable`)

| Flag | Default | Purpose |
|:-----|:--------|:--------|
| `trackHistory` | `false` | Field-level audit trail |
| `searchable` | `true` | Index records for global search |
| `apiEnabled` | `true` | Expose via REST / GraphQL APIs |
| `apiMethods` | all | Whitelist specific operations |
| `files` | `false` | Attachments & document management |
| `feeds` | `false` | Social feed, comments, mentions |
| `activities` | `false` | Tasks & events tracking |
| `trash` | `true` | Soft-delete with restore |
| `mru` | `true` | Most Recently Used tracking |
| `clone` | `true` | Record deep cloning |

## API Methods

| Method | HTTP | Description |
|:-------|:-----|:------------|
| `get` | GET | Retrieve single record |
| `list` | GET | List with filter/sort/pagination |
| `create` | POST | Create record |
| `update` | PATCH | Update record |
| `delete` | DELETE | Soft-delete record |
| `upsert` | PUT | Create or update by external ID |
| `bulk` | POST | Batch operations |
| `aggregate` | GET | Count, sum, avg, min, max |
| `history` | GET | Audit trail |
| `search` | GET | Full-text search |
| `restore` | POST | Restore from trash |
| `purge` | DELETE | Permanent deletion |
| `import` | POST | Bulk data import |
| `export` | GET | Data export |

## Dataset Modes (Seeding)

| Mode | Description |
|:-----|:------------|
| `insert` | Insert only — skip existing |
| `update` | Update only — skip missing |
| `upsert` | Insert or update |
| `replace` | Drop and re-insert all |
| `ignore` | Skip if any conflict |

## Select Option Schema

| Property | Required | Description |
|:---------|:---------|:------------|
| `label` | ✅ | Human-readable display text |
| `value` | ✅ | Machine value (**must be lowercase**) |
| `color` | — | Badge/chart colour (hex) |
| `default` | — | Whether this is the default option |

## Naming Conventions

| Context | Convention | Example |
|:--------|:-----------|:--------|
| Object `name` | `snake_case` | `project_task` |
| Field keys | `snake_case` | `first_name`, `due_date` |
| Config properties | `camelCase` | `maxLength`, `referenceFilters` |
| Option `value` | lowercase | `in_progress` |
| Option `label` | Any case | `"In Progress"` |

## Object Extension Model

| Property | Description |
|:---------|:------------|
| `ownership` | `'extend'` — extending an object you don't own |
| `extend` | Target object FQN (e.g., `crm.account`) |
| `priority` | Merge order (`0–999`, default `200`, higher = later) |

Extensions can **add** fields, validations, and indexes — but cannot **remove** them.

## Advanced Features

| Feature | Key Config | Purpose |
|:--------|:-----------|:--------|
| `tenancy` | `shared`, `isolated`, `hybrid` | Multi-tenant SaaS |
| `softDelete` | boolean | Regulatory data retention |
| `versioning` | `snapshot`, `delta`, `event-sourcing` | Audit / compliance |
| `partitioning` | `range`, `hash`, `list` | Tables > 100M rows |
| `cdc` | boolean | Real-time sync to Kafka/webhooks |
| `encryptionConfig` | algorithm, keyProvider | GDPR/HIPAA field-level encryption |
| `maskingRule` | pattern, mask_type | PII masking for non-privileged users |
