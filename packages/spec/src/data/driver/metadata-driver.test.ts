// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { describe, it, expect } from 'vitest';
import {
  MetadataTableSchemaSchema,
  MetadataDriverConfigSchema,
  MetadataQueryFiltersSchema,
  MetadataQueryOptionsSchema,
  MetadataBulkOperationSchema,
  MetadataMigrationOperationSchema,
} from './metadata-driver.zod';

describe('MetadataTableSchemaSchema', () => {
  it('should accept valid table schema with defaults', () => {
    const schema = MetadataTableSchemaSchema.parse({});
    
    expect(schema.name).toBe('_framework_metadata');
    expect(schema.primaryKey).toBe('id');
  });

  it('should accept custom table configuration', () => {
    const schema = MetadataTableSchemaSchema.parse({
      name: 'custom_metadata',
      schema: 'public',
      primaryKey: 'uuid',
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
          type: 'btree',
        },
      ],
    });
    
    expect(schema.name).toBe('custom_metadata');
    expect(schema.schema).toBe('public');
    expect(schema.primaryKey).toBe('uuid');
    expect(schema.indexes).toHaveLength(2);
    expect(schema.indexes![0].unique).toBe(true);
  });

  it('should accept custom column mappings', () => {
    const schema = MetadataTableSchemaSchema.parse({
      columnMapping: {
        id: 'metadata_id',
        name: 'metadata_name',
        type: 'metadata_type',
        namespace: 'ns',
        scope: 'visibility',
        metadata: 'data',
        extends: 'parent',
        strategy: 'merge_strategy',
        owner: 'owner_id',
        state: 'status',
        createdBy: 'created_by_user',
        createdAt: 'created_timestamp',
        updatedBy: 'updated_by_user',
        updatedAt: 'updated_timestamp',
      },
    });
    
    expect(schema.columnMapping!.id).toBe('metadata_id');
    expect(schema.columnMapping!.type).toBe('metadata_type');
  });

  it('should validate index types', () => {
    const validTypes = ['btree', 'hash', 'gin', 'gist'];
    
    validTypes.forEach((type) => {
      expect(() =>
        MetadataTableSchemaSchema.parse({
          indexes: [{ name: 'test_idx', fields: ['field1'], type }],
        })
      ).not.toThrow();
    });
  });
});

describe('MetadataDriverConfigSchema', () => {
  it('should require datasource', () => {
    expect(() => MetadataDriverConfigSchema.parse({})).toThrow();
  });

  it('should accept minimal configuration', () => {
    const config = MetadataDriverConfigSchema.parse({
      datasource: 'main_db',
    });
    
    expect(config.datasource).toBe('main_db');
  });

  it('should accept full configuration with defaults', () => {
    const config = MetadataDriverConfigSchema.parse({
      datasource: 'main_db',
      tableSchema: {
        name: 'metadata',
        schema: 'public',
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
        prefetchOnInit: false,
        parallelLoad: true,
      },
      transaction: {
        defaultIsolation: 'serializable',
        timeout: 60000,
        retryOnConflict: true,
        maxRetries: 5,
      },
      query: {
        useIndexes: true,
        maxResultSize: 10000,
        enablePagination: true,
        defaultPageSize: 50,
      },
    });
    
    expect(config.datasource).toBe('main_db');
    expect(config.performance!.batchSize).toBe(200);
    expect(config.transaction!.defaultIsolation).toBe('serializable');
    expect(config.query!.defaultPageSize).toBe(50);
  });

  it('should validate isolation levels', () => {
    const levels = ['read_uncommitted', 'read_committed', 'repeatable_read', 'serializable'];
    
    levels.forEach((level) => {
      expect(() =>
        MetadataDriverConfigSchema.parse({
          datasource: 'db',
          transaction: { defaultIsolation: level },
        })
      ).not.toThrow();
    });
  });

  it('should use default values for optional fields', () => {
    const config = MetadataDriverConfigSchema.parse({
      datasource: 'db',
      migration: {},
      performance: {},
      transaction: {},
      query: {},
    });
    
    expect(config.migration!.autoMigrate).toBe(true);
    expect(config.performance!.batchSize).toBe(100);
    expect(config.transaction!.defaultIsolation).toBe('read_committed');
    expect(config.query!.defaultPageSize).toBe(100);
  });
});

describe('MetadataQueryFiltersSchema', () => {
  it('should accept empty filters', () => {
    const filters = MetadataQueryFiltersSchema.parse({});
    expect(filters).toEqual({});
  });

  it('should accept string type filter', () => {
    const filters = MetadataQueryFiltersSchema.parse({
      type: 'object',
    });
    
    expect(filters.type).toBe('object');
  });

  it('should accept array type filter', () => {
    const filters = MetadataQueryFiltersSchema.parse({
      type: ['object', 'view', 'flow'],
    });
    
    expect(filters.type).toEqual(['object', 'view', 'flow']);
  });

  it('should accept multiple filters', () => {
    const filters = MetadataQueryFiltersSchema.parse({
      type: 'object',
      name: ['account', 'contact'],
      namespace: 'crm',
      scope: 'system',
      state: ['active', 'draft'],
      owner: 'user123',
    });
    
    expect(filters.type).toBe('object');
    expect(filters.name).toEqual(['account', 'contact']);
    expect(filters.namespace).toBe('crm');
    expect(filters.scope).toBe('system');
    expect(filters.state).toEqual(['active', 'draft']);
    expect(filters.owner).toBe('user123');
  });

  it('should accept custom filters', () => {
    const filters = MetadataQueryFiltersSchema.parse({
      custom: {
        'metadata.version': { $gte: '2.0' },
        'metadata.tags': { $contains: 'production' },
      },
    });
    
    expect(filters.custom).toBeDefined();
  });

  it('should validate scope enum values', () => {
    const validScopes = ['system', 'platform', 'user'];
    
    validScopes.forEach((scope) => {
      expect(() =>
        MetadataQueryFiltersSchema.parse({ scope })
      ).not.toThrow();
    });
    
    expect(() =>
      MetadataQueryFiltersSchema.parse({ scope: 'invalid' })
    ).toThrow();
  });

  it('should validate state enum values', () => {
    const validStates = ['draft', 'active', 'archived', 'deprecated'];
    
    validStates.forEach((state) => {
      expect(() =>
        MetadataQueryFiltersSchema.parse({ state })
      ).not.toThrow();
    });
    
    expect(() =>
      MetadataQueryFiltersSchema.parse({ state: 'deleted' })
    ).toThrow();
  });
});

describe('MetadataQueryOptionsSchema', () => {
  it('should accept empty options', () => {
    const options = MetadataQueryOptionsSchema.parse({});
    expect(options).toEqual({});
  });

  it('should accept filters', () => {
    const options = MetadataQueryOptionsSchema.parse({
      filters: {
        type: 'object',
        namespace: 'crm',
      },
    });
    
    expect(options.filters!.type).toBe('object');
  });

  it('should accept sort configuration', () => {
    const options = MetadataQueryOptionsSchema.parse({
      sort: [
        { field: 'name', order: 'asc' },
        { field: 'createdAt', order: 'desc' },
      ],
    });
    
    expect(options.sort).toHaveLength(2);
    expect(options.sort![0].order).toBe('asc');
    expect(options.sort![1].order).toBe('desc');
  });

  it('should use default sort order', () => {
    const options = MetadataQueryOptionsSchema.parse({
      sort: [{ field: 'name' }],
    });
    
    expect(options.sort![0].order).toBe('asc');
  });

  it('should accept pagination configuration', () => {
    const options = MetadataQueryOptionsSchema.parse({
      pagination: {
        page: 2,
        pageSize: 50,
      },
    });
    
    expect(options.pagination!.page).toBe(2);
    expect(options.pagination!.pageSize).toBe(50);
  });

  it('should use default pagination values', () => {
    const options = MetadataQueryOptionsSchema.parse({
      pagination: {},
    });
    
    expect(options.pagination!.page).toBe(1);
    expect(options.pagination!.pageSize).toBe(100);
  });

  it('should validate pagination constraints', () => {
    expect(() =>
      MetadataQueryOptionsSchema.parse({
        pagination: { page: 0 },
      })
    ).toThrow();
    
    expect(() =>
      MetadataQueryOptionsSchema.parse({
        pagination: { pageSize: 0 },
      })
    ).toThrow();
    
    expect(() =>
      MetadataQueryOptionsSchema.parse({
        pagination: { pageSize: 1001 },
      })
    ).toThrow();
  });

  it('should accept field selection', () => {
    const options = MetadataQueryOptionsSchema.parse({
      select: ['id', 'name', 'type', 'metadata'],
    });
    
    expect(options.select).toHaveLength(4);
  });

  it('should accept includeArchived flag', () => {
    const options1 = MetadataQueryOptionsSchema.parse({
      includeArchived: true,
    });
    
    const options2 = MetadataQueryOptionsSchema.parse({
      includeArchived: false,
    });
    
    expect(options1.includeArchived).toBe(true);
    expect(options2.includeArchived).toBe(false);
  });

  it('should use default includeArchived value', () => {
    const options = MetadataQueryOptionsSchema.parse({});
    expect(options.includeArchived).toBe(false);
  });
});

describe('MetadataBulkOperationSchema', () => {
  it('should require operation and records', () => {
    expect(() => MetadataBulkOperationSchema.parse({})).toThrow();
    expect(() => MetadataBulkOperationSchema.parse({ operation: 'create' })).toThrow();
    expect(() => MetadataBulkOperationSchema.parse({ records: [] })).toThrow();
  });

  it('should accept valid bulk operation', () => {
    const operation = MetadataBulkOperationSchema.parse({
      operation: 'create',
      records: [
        { id: '1', name: 'obj1', type: 'object', metadata: {} },
        { id: '2', name: 'obj2', type: 'object', metadata: {} },
      ],
    });
    
    expect(operation.operation).toBe('create');
    expect(operation.records).toHaveLength(2);
  });

  it('should validate operation types', () => {
    const validOperations = ['create', 'update', 'delete', 'upsert'];
    
    validOperations.forEach((op) => {
      expect(() =>
        MetadataBulkOperationSchema.parse({
          operation: op,
          records: [],
        })
      ).not.toThrow();
    });
    
    expect(() =>
      MetadataBulkOperationSchema.parse({
        operation: 'merge',
        records: [],
      })
    ).toThrow();
  });

  it('should accept batch configuration', () => {
    const operation = MetadataBulkOperationSchema.parse({
      operation: 'update',
      records: [],
      batch: {
        size: 50,
        parallel: true,
        continueOnError: true,
      },
    });
    
    expect(operation.batch!.size).toBe(50);
    expect(operation.batch!.parallel).toBe(true);
    expect(operation.batch!.continueOnError).toBe(true);
  });

  it('should use default batch values', () => {
    const operation = MetadataBulkOperationSchema.parse({
      operation: 'create',
      records: [],
      batch: {},
    });
    
    expect(operation.batch!.size).toBe(100);
    expect(operation.batch!.parallel).toBe(false);
    expect(operation.batch!.continueOnError).toBe(false);
  });

  it('should accept transactional flag', () => {
    const operation = MetadataBulkOperationSchema.parse({
      operation: 'delete',
      records: [],
      transactional: false,
    });
    
    expect(operation.transactional).toBe(false);
  });

  it('should use default transactional value', () => {
    const operation = MetadataBulkOperationSchema.parse({
      operation: 'create',
      records: [],
    });
    
    expect(operation.transactional).toBe(true);
  });
});

describe('MetadataMigrationOperationSchema', () => {
  it('should require type and table', () => {
    expect(() => MetadataMigrationOperationSchema.parse({})).toThrow();
    expect(() => MetadataMigrationOperationSchema.parse({ type: 'create' })).toThrow();
    expect(() => MetadataMigrationOperationSchema.parse({ table: 'metadata' })).toThrow();
  });

  it('should accept valid migration operation', () => {
    const migration = MetadataMigrationOperationSchema.parse({
      type: 'create',
      table: 'metadata',
    });
    
    expect(migration.type).toBe('create');
    expect(migration.table).toBe('metadata');
  });

  it('should validate migration types', () => {
    const validTypes = ['create', 'alter', 'drop', 'backup', 'restore'];
    
    validTypes.forEach((type) => {
      expect(() =>
        MetadataMigrationOperationSchema.parse({
          type,
          table: 'metadata',
        })
      ).not.toThrow();
    });
    
    expect(() =>
      MetadataMigrationOperationSchema.parse({
        type: 'truncate',
        table: 'metadata',
      })
    ).toThrow();
  });

  it('should accept migration scripts', () => {
    const migration = MetadataMigrationOperationSchema.parse({
      type: 'alter',
      table: 'metadata',
      script: 'ALTER TABLE metadata ADD COLUMN version INTEGER',
      rollbackScript: 'ALTER TABLE metadata DROP COLUMN version',
    });
    
    expect(migration.script).toBeDefined();
    expect(migration.rollbackScript).toBeDefined();
  });

  it('should accept dryRun flag', () => {
    const migration = MetadataMigrationOperationSchema.parse({
      type: 'drop',
      table: 'metadata',
      dryRun: true,
    });
    
    expect(migration.dryRun).toBe(true);
  });

  it('should use default dryRun value', () => {
    const migration = MetadataMigrationOperationSchema.parse({
      type: 'create',
      table: 'metadata',
    });
    
    expect(migration.dryRun).toBe(false);
  });
});
