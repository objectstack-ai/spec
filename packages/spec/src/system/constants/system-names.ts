// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * System Object Names — Protocol Layer Constants
 *
 * These constants define the canonical, protocol-level names for system objects.
 * All API calls, SDK references, permissions checks, and metadata lookups MUST use
 * these names instead of hardcoded strings or physical table names.
 *
 * The actual storage table name may differ via `ObjectSchema.tableName`.
 * The mapping between protocol name and storage name is handled by the
 * ObjectQL Engine / Driver layer.
 *
 * @example
 * ```ts
 * import { SystemObjectName } from '@objectstack/spec/system';
 *
 * // Always use the constant for API / SDK / permission references
 * const users = await engine.find(SystemObjectName.USER, { ... });
 * ```
 */
export const SystemObjectName = {
  /** Authentication: user identity */
  USER: 'sys_user',
  /** Authentication: active session */
  SESSION: 'sys_session',
  /** Authentication: OAuth / credential account */
  ACCOUNT: 'sys_account',
  /** Authentication: email / phone verification */
  VERIFICATION: 'sys_verification',
  /** System metadata storage */
  METADATA: 'sys_metadata',
} as const;

/** Union type of all system object names */
export type SystemObjectName = typeof SystemObjectName[keyof typeof SystemObjectName];

/**
 * System Field Names — Protocol Layer Constants
 *
 * These constants define the canonical, protocol-level names for common system fields.
 * All API calls, SDK references, and permission checks MUST use these constants
 * instead of hardcoded strings or physical column names.
 *
 * The actual storage column name may differ via `FieldSchema.columnName`.
 *
 * @example
 * ```ts
 * import { SystemFieldName } from '@objectstack/spec/system';
 *
 * // Use the constant to reference the owner field in queries
 * const myRecords = await engine.find('project', {
 *   filters: [SystemFieldName.OWNER_ID, '=', currentUserId],
 * });
 * ```
 */
export const SystemFieldName = {
  /** Primary key */
  ID: 'id',
  /** Record creation timestamp */
  CREATED_AT: 'created_at',
  /** Record last-updated timestamp */
  UPDATED_AT: 'updated_at',
  /** Record owner (lookup to user) */
  OWNER_ID: 'owner_id',
  /** Tenant isolation key */
  TENANT_ID: 'tenant_id',
  /** Foreign key to user on session / account objects */
  USER_ID: 'user_id',
  /** Soft-delete timestamp */
  DELETED_AT: 'deleted_at',
} as const;

/** Union type of all system field names */
export type SystemFieldName = typeof SystemFieldName[keyof typeof SystemFieldName];

/**
 * Storage Name Mapping — Protocol ↔ Physical Name Resolution
 *
 * Provides pure utility functions for resolving protocol-level names to
 * physical storage names and vice-versa.
 *
 * These helpers are intended for use inside the ObjectQL Engine and Driver layers.
 * They are intentionally stateless — they receive the object definition and return
 * the resolved name.
 */
export const StorageNameMapping = {
  /**
   * Resolve the physical table name for an object.
   * Falls back to `object.name` when `tableName` is not set.
   *
   * @param object - Object definition (at minimum `{ name: string; tableName?: string }`)
   * @returns The physical table / collection name to use in storage operations.
   */
  resolveTableName(object: { name: string; tableName?: string }): string {
    return object.tableName ?? object.name;
  },

  /**
   * Resolve the physical column name for a field.
   * Falls back to `fieldKey` when `columnName` is not set on the field.
   *
   * @param fieldKey - The protocol-level field key (snake_case identifier).
   * @param field    - Field definition (at minimum `{ columnName?: string }`).
   * @returns The physical column name to use in storage operations.
   */
  resolveColumnName(fieldKey: string, field: { columnName?: string }): string {
    return field.columnName ?? fieldKey;
  },

  /**
   * Build a complete field-key → column-name map for an entire object.
   *
   * @param fields - The fields record from an ObjectSchema.
   * @returns A record mapping every protocol field key to its physical column name.
   */
  buildColumnMap(fields: Record<string, { columnName?: string }>): Record<string, string> {
    const map: Record<string, string> = {};
    for (const key of Object.keys(fields)) {
      map[key] = fields[key].columnName ?? key;
    }
    return map;
  },

  /**
   * Build a reverse column-name → field-key map for an entire object.
   * Useful for translating storage-layer results back to protocol-level field keys.
   *
   * @param fields - The fields record from an ObjectSchema.
   * @returns A record mapping every physical column name back to its protocol field key.
   */
  buildReverseColumnMap(fields: Record<string, { columnName?: string }>): Record<string, string> {
    const map: Record<string, string> = {};
    for (const key of Object.keys(fields)) {
      const col = fields[key].columnName ?? key;
      map[col] = key;
    }
    return map;
  },
} as const;
